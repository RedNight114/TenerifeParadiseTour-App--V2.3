import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import {
  getAppBaseUrl,
  getStripeTestClient,
  hasFullDashboardDirectChargeConfiguration,
  isStripeMerchantReady,
  stripeV2RequirementsSubmitted,
} from "@/lib/stripe-server"

export async function GET() {
  const baseUrl = getAppBaseUrl()
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${baseUrl}/login`)
    const { data: organizationId } = await supabase.rpc("current_public_organization_id")
    if (!organizationId) return NextResponse.redirect(`${baseUrl}/admin/payments?connect=error`)
    const { data: membership } = await supabase.from("organization_memberships")
      .select("role").eq("organization_id", organizationId).eq("user_id", user.id).eq("status", "active").maybeSingle()
    if (membership?.role !== "owner") return NextResponse.redirect(`${baseUrl}/admin/payments?connect=error`)

    const admin = createSupabaseAdminClient()
    const { data: organization } = await admin.from("organizations").select("stripe_account_id")
      .eq("id", organizationId).single()
    if (!organization?.stripe_account_id) return NextResponse.redirect(`${baseUrl}/admin/payments?connect=incomplete`)
    const account = await getStripeTestClient().v2.core.accounts.retrieve(organization.stripe_account_id, {
      include: ["configuration.merchant", "defaults", "requirements"],
    })
    if (!hasFullDashboardDirectChargeConfiguration(account)) {
      return NextResponse.redirect(`${baseUrl}/admin/payments?connect=error`)
    }
    const ready = isStripeMerchantReady(account)
    const { error: saveError } = await admin.from("organizations").update({
      stripe_charges_enabled: ready,
      stripe_details_submitted: stripeV2RequirementsSubmitted(account),
    }).eq("id", organizationId)
    if (saveError) throw saveError
    return NextResponse.redirect(`${baseUrl}/admin/payments?connect=${ready ? "ready" : "incomplete"}`)
  } catch {
    return NextResponse.redirect(`${baseUrl}/admin/payments?connect=error`)
  }
}
