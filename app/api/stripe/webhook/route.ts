import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  getStripeTestClient,
  hasFullDashboardDirectChargeConfiguration,
  isStripeMerchantReady,
  stripeV2RequirementsSubmitted,
} from "@/lib/stripe-server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !webhookSecret) return NextResponse.json({ error: "Webhook not configured." }, { status: 400 })

  let event: Stripe.Event | Stripe.V2.Core.EventNotification
  try {
    const stripe = getStripeTestClient()
    const payload = await request.text()
    const parsedPayload = JSON.parse(payload) as { object?: unknown }
    event = parsedPayload.object === "v2.core.event"
      ? stripe.parseEventNotification(payload, signature, webhookSecret)
      : stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 })
  }
  if (event.livemode) return NextResponse.json({ error: "Live events are disabled in this environment." }, { status: 400 })

  try {
    const admin = createSupabaseAdminClient()
    if ([
      "v2.core.account.updated",
      "v2.core.account[configuration.merchant].updated",
      "v2.core.account[configuration.merchant].capability_status_updated",
      "v2.core.account[requirements].updated",
    ].includes(event.type)) {
      const accountId = (event as unknown as { related_object?: { id?: string } | null }).related_object?.id
      if (!accountId) return NextResponse.json({ error: "Incomplete connected account event." }, { status: 400 })
      const account = await getStripeTestClient().v2.core.accounts.retrieve(accountId, {
        include: ["configuration.merchant", "defaults", "requirements"],
      })
      const configured = hasFullDashboardDirectChargeConfiguration(account)
      const { error } = await admin.from("organizations").update({
        stripe_charges_enabled: configured && isStripeMerchantReady(account),
        stripe_details_submitted: configured && stripeV2RequirementsSubmitted(account),
      }).eq("stripe_account_id", account.id)
      if (error) throw error
      return NextResponse.json({ received: true })
    }

    const eventType = event.type.startsWith("v1.") ? event.type.slice(3) : event.type
    if (![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
      "checkout.session.expired",
    ].includes(eventType)) return NextResponse.json({ received: true })

    let checkoutEvent: Stripe.Event
    if ("data" in event) {
      checkoutEvent = event
    } else if ("fetchEvent" in event) {
      const fetchedEvent = await event.fetchEvent()
      if (!("data" in fetchedEvent)) {
        return NextResponse.json({ error: "Checkout event snapshot is incomplete." }, { status: 400 })
      }
      checkoutEvent = fetchedEvent as unknown as Stripe.Event
    } else {
      return NextResponse.json({ error: "Checkout event payload is incomplete." }, { status: 400 })
    }

    const session = checkoutEvent.data.object as Stripe.Checkout.Session
    if (eventType === "checkout.session.completed" && session.payment_status !== "paid") {
      return NextResponse.json({ received: true })
    }
    const succeeded = eventType === "checkout.session.completed"
      || eventType === "checkout.session.async_payment_succeeded"
    const notificationContext = "context" in event && typeof event.context === "string"
      ? event.context
      : null
    const connectedAccountId = checkoutEvent.account ?? notificationContext
    if (!connectedAccountId || !session.amount_total || !session.currency) {
      return NextResponse.json({ error: "Incomplete connected checkout event." }, { status: 400 })
    }
    const paymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null
    const { data: result, error } = await admin.rpc("apply_stripe_checkout_event", {
      p_event_id: checkoutEvent.id,
      p_event_type: eventType,
      p_session_id: session.id,
      p_payment_intent_id: paymentIntentId,
      p_connected_account_id: connectedAccountId,
      p_amount_minor: session.amount_total,
      p_currency_code: session.currency.toUpperCase(),
      p_succeeded: succeeded,
    })
    if (error) throw error
    if (result === "unknown_session") return NextResponse.json({ error: "Checkout session is not stored yet; retry." }, { status: 503 })

    if (result === "requires_refund" && paymentIntentId) {
      try {
        const refund = await getStripeTestClient().refunds.create({
          payment_intent: paymentIntentId,
          metadata: { checkout_session_id: session.id, reason: "inventory_hold_expired" },
        }, { stripeAccount: connectedAccountId, idempotencyKey: `expired-hold-refund-${session.id}` })
        await admin.from("payment_attempts").update({
          provider_refund_id: refund.id,
          status: refund.status === "succeeded" ? "refunded" : "requires_refund",
          updated_at: new Date().toISOString(),
        }).eq("provider_session_id", session.id)
      } catch (refundError) {
        console.error("Late Stripe payment requires refund attention", refundError instanceof Error ? refundError.message : "unknown error")
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook processing failed", error instanceof Error ? error.message : "unknown error")
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 })
  }
}
