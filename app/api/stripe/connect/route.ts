import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  getAppBaseUrl,
  getStripeTestClient,
  hasFullDashboardDirectChargeConfiguration,
  isStripeMerchantReady,
  stripeV2RequirementsSubmitted,
} from "@/lib/stripe-server"

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Inicia sesión para conectar Stripe." }, { status: 401 })

    const { data: organizationId } = await supabase.rpc("current_public_organization_id")
    if (!organizationId) return NextResponse.json({ error: "No se pudo identificar la empresa." }, { status: 403 })
    const { data: membership } = await supabase.from("organization_memberships")
      .select("role").eq("organization_id", organizationId).eq("user_id", user.id).eq("status", "active").maybeSingle()
    if (membership?.role !== "owner") return NextResponse.json({ error: "Solo el propietario puede configurar los cobros." }, { status: 403 })

    const stripe = getStripeTestClient()
    const admin = createSupabaseAdminClient()
    const { data: organization, error: organizationError } = await admin.from("organizations")
      .select("id, name, stripe_account_id").eq("id", organizationId).single()
    if (organizationError || !organization) return NextResponse.json({ error: "No se pudo cargar la empresa." }, { status: 500 })

    let account: Stripe.V2.Core.Account
    if (organization.stripe_account_id) {
      try {
        account = await stripe.v2.core.accounts.retrieve(organization.stripe_account_id, {
          include: ["configuration.merchant", "defaults", "requirements"],
        })
      } catch {
        return NextResponse.json({
          error: "Esta empresa ya tiene una cuenta Stripe creada con una configuración anterior. No se cambiará automáticamente; contacta con soporte para revisarla.",
        }, { status: 409 })
      }
      if (!hasFullDashboardDirectChargeConfiguration(account)) {
        return NextResponse.json({
          error: "La cuenta Stripe existente no usa Full Dashboard con cobro directo. No se puede cambiar esta elección automáticamente.",
        }, { status: 409 })
      }
    } else {
      account = await stripe.v2.core.accounts.create({
        contact_email: user.email,
        display_name: organization.name,
        dashboard: "full",
        identity: { country: "ES" },
        configuration: {
          merchant: { capabilities: { card_payments: { requested: true } } },
        },
        defaults: {
          currency: "eur",
          responsibilities: {
            fees_collector: "stripe",
            losses_collector: "stripe",
          },
        },
        metadata: { organization_id: organizationId, organization_name: organization.name },
        include: ["configuration.merchant", "defaults", "requirements"],
      }, { idempotencyKey: `tenant-connect-account-${organizationId}` })
    }

    const { error: saveError } = await admin.from("organizations").update({
      stripe_account_id: account.id,
      stripe_charges_enabled: isStripeMerchantReady(account),
      stripe_details_submitted: stripeV2RequirementsSubmitted(account),
    }).eq("id", organizationId)
    if (saveError) throw new Error("No se pudo guardar la cuenta Stripe de la empresa.")

    const baseUrl = getAppBaseUrl()
    const link = await stripe.v2.core.accountLinks.create({
      account: account.id,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          refresh_url: `${baseUrl}/admin/payments?connect=refresh`,
          return_url: `${baseUrl}/api/stripe/connect/return`,
        },
      },
    })
    return NextResponse.json({ url: link.url })
  } catch (error) {
    console.error("Stripe Connect onboarding failed", error instanceof Error ? error.message : "unknown error")
    return NextResponse.json({ error: "No se pudo iniciar la configuración de Stripe. Comprueba las credenciales de prueba y vuelve a intentarlo." }, { status: 503 })
  }
}
