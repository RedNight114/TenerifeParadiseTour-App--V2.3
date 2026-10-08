import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { getAppBaseUrl, getStripeTestClient } from "@/lib/stripe-server"

export async function GET(request: Request) {
  const baseUrl = getAppBaseUrl()
  const reference = new URL(request.url).searchParams.get("reference") ?? ""
  const destination = new URL(`${baseUrl}/checkout/cancelled`)
  if (/^[0-9a-f-]{36}$/i.test(reference)) destination.searchParams.set("reference", reference)
  try {
    const supabase = await createServerSupabaseClient()
    const { data: context } = await supabase.rpc("get_public_checkout_context", { p_reference: reference })
    if (context?.booking_id && context?.stripe_account_id) {
      const admin = createSupabaseAdminClient()
      const { data: attempt } = await admin.from("payment_attempts").select("provider_session_id, status")
        .eq("booking_id", context.booking_id).in("status", ["created", "pending"])
        .order("created_at", { ascending: false }).limit(1).maybeSingle()
      if (attempt?.provider_session_id) {
        try {
          await getStripeTestClient().checkout.sessions.expire(attempt.provider_session_id, {}, {
            stripeAccount: context.stripe_account_id,
          })
        } catch {
          // The session may already have completed; only the signed webhook decides booking state.
        }
      }
    }
  } catch {
    // The return page remains safe if the provider is temporarily unavailable.
  }
  return NextResponse.redirect(destination)
}
