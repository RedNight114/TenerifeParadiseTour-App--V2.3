import { NextResponse } from "next/server"
import { randomBytes } from "node:crypto"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  getAppBaseUrl,
  getStripeTestClient,
  hasFullDashboardDirectChargeConfiguration,
  isStripeMerchantReady,
  stripeV2RequirementsSubmitted,
} from "@/lib/stripe-server"

export const runtime = "nodejs"

type CheckoutContext = {
  booking_id: number
  reference: string
  amount_minor: number
  currency_code: string
  customer_email: string
  organization_id: string
  organization_name: string
  stripe_account_id: string
  expires_at: string
  items: Array<{ name: string; quantity: number; amount_minor: number }>
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const reference = typeof body === "object" && body !== null && "reference" in body
      ? (body as { reference?: unknown }).reference
      : null
    if (typeof reference !== "string" || !/^[0-9a-f-]{36}$/i.test(reference)) {
      return NextResponse.json({ error: "Referencia de reserva no válida." }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.rpc("get_public_checkout_context", { p_reference: reference })
    if (error || !data) return NextResponse.json({ error: "La reserva venció o el cobro aún no está configurado." }, { status: 409 })
    const context = data as CheckoutContext
    const items = Array.isArray(context.items) ? context.items : []
    const amount = Number(context.amount_minor)
    const itemTotal = items.reduce((sum, item) => sum + Number(item.amount_minor), 0)
    const expiresAt = new Date(context.expires_at).getTime()
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount !== itemTotal || items.length === 0
      || expiresAt - Date.now() < 30 * 60 * 1000 || !context.stripe_account_id) {
      return NextResponse.json({ error: "La reserva no está lista para iniciar el pago. Vuelve a comprobar la disponibilidad." }, { status: 409 })
    }

    const stripe = getStripeTestClient()
    const admin = createSupabaseAdminClient()
    const connectedAccount = await stripe.v2.core.accounts.retrieve(context.stripe_account_id, {
      include: ["configuration.merchant", "defaults", "requirements"],
    })
    const accountReady = hasFullDashboardDirectChargeConfiguration(connectedAccount)
      && isStripeMerchantReady(connectedAccount)
    const { error: readinessError } = await admin.from("organizations").update({
      stripe_charges_enabled: accountReady,
      stripe_details_submitted: hasFullDashboardDirectChargeConfiguration(connectedAccount)
        && stripeV2RequirementsSubmitted(connectedAccount),
    }).eq("id", context.organization_id)
    if (readinessError) throw readinessError
    if (!accountReady) {
      return NextResponse.json({ error: "La cuenta Stripe aún no está habilitada para recibir pagos." }, { status: 409 })
    }
    const { data: existing } = await admin.from("payment_attempts").select("id, status, checkout_url, provider_session_id")
      .eq("booking_id", context.booking_id).in("status", ["created", "pending"])
      .order("created_at", { ascending: false }).limit(1).maybeSingle()
    if (existing?.provider_session_id && existing.status === "pending") {
      const currentSession = await stripe.checkout.sessions.retrieve(existing.provider_session_id, {}, {
        stripeAccount: context.stripe_account_id,
      })
      if (currentSession.status === "open" && existing.checkout_url) {
        return NextResponse.json({ url: existing.checkout_url })
      }
      if (currentSession.status === "complete") {
        return NextResponse.json({
          url: `${getAppBaseUrl()}/checkout/return?reference=${encodeURIComponent(reference)}`,
        })
      }
      if (currentSession.status === "expired") {
        const intentId = typeof currentSession.payment_intent === "string"
          ? currentSession.payment_intent
          : currentSession.payment_intent?.id ?? null
        const { error: expiryError } = await admin.rpc("apply_stripe_checkout_event", {
          p_event_id: `checkout_reconcile_${currentSession.id}`,
          p_event_type: "checkout.session.expired",
          p_session_id: currentSession.id,
          p_payment_intent_id: intentId,
          p_connected_account_id: context.stripe_account_id,
          p_amount_minor: currentSession.amount_total ?? amount,
          p_currency_code: (currentSession.currency ?? context.currency_code).toUpperCase(),
          p_succeeded: false,
        })
        if (expiryError) throw expiryError
        return NextResponse.json({ error: "La retención venció. Crea una nueva reserva para volver a intentarlo." }, { status: 409 })
      }
    }

    let attemptId = existing?.id
    if (!attemptId) {
      const { data: attempt, error: attemptError } = await admin.from("payment_attempts").insert({
        organization_id: context.organization_id,
        booking_id: context.booking_id,
        connected_account_id: context.stripe_account_id,
        status: "created",
        amount_minor: amount,
        currency_code: context.currency_code,
        expires_at: new Date(expiresAt).toISOString(),
      }).select("id").single()
      if (attemptError || !attempt) return NextResponse.json({ error: "No se pudo preparar el intento de pago." }, { status: 503 })
      attemptId = attempt.id
    }

    const baseUrl = getAppBaseUrl()
    const identifierSuffix = Array.from(randomBytes(8), (byte) => "abcdefghijklmnopqrstuvwxyz"[byte % 26]).join("")
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Let Stripe select enabled payment methods dynamically for the buyer.
      integration_identifier: `quickagency-reservations-${identifierSuffix}`,
      locale: "es",
      customer_email: context.customer_email,
      client_reference_id: reference,
      line_items: items.map((item) => ({
        price_data: {
          currency: context.currency_code.toLowerCase(),
          product_data: { name: `${item.name} × ${item.quantity}`.slice(0, 120) },
          unit_amount: Number(item.amount_minor),
        },
        quantity: 1,
      })),
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60 + 5,
      success_url: `${baseUrl}/checkout/return?reference=${encodeURIComponent(reference)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/api/stripe/checkout/cancel?reference=${encodeURIComponent(reference)}`,
      metadata: { booking_reference: reference, booking_id: String(context.booking_id), organization_id: context.organization_id },
      payment_intent_data: {
        metadata: { booking_reference: reference, booking_id: String(context.booking_id), organization_id: context.organization_id },
      },
    }, {
      stripeAccount: context.stripe_account_id,
      idempotencyKey: `booking-checkout-${attemptId}`,
    })

    if (!session.url) {
      await admin.from("payment_attempts").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", attemptId)
      return NextResponse.json({ error: "Stripe no devolvió una página de pago." }, { status: 502 })
    }
    const { error: saveError } = await admin.from("payment_attempts").update({
      provider_session_id: session.id,
      checkout_url: session.url,
      status: "pending",
      expires_at: new Date(session.expires_at * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", attemptId)
    if (saveError) {
      try { await stripe.checkout.sessions.expire(session.id, {}, { stripeAccount: context.stripe_account_id }) } catch { /* webhook still checks booking state */ }
      return NextResponse.json({ error: "No se pudo registrar el pago; no continúes con esa sesión. Vuelve a intentarlo." }, { status: 503 })
    }
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe Checkout creation failed", error instanceof Error ? error.message : "unknown error")
    return NextResponse.json({ error: "No se pudo iniciar el pago de prueba. Inténtalo de nuevo en unos segundos." }, { status: 503 })
  }
}
