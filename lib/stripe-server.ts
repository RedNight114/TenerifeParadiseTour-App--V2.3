import "server-only"
import Stripe from "stripe"

let stripeInstance: Stripe | undefined

export function isStripeTestSecretKey(value: string | undefined): value is string {
  return value?.startsWith("sk_test_") === true || value?.startsWith("rk_test_") === true
}

export function getStripeTestClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!isStripeTestSecretKey(secretKey)) {
    throw new Error("Stripe test mode is not configured.")
  }
  stripeInstance ??= new Stripe(secretKey)
  return stripeInstance
}

export function getAppBaseUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL
  if (!value) throw new Error("NEXT_PUBLIC_APP_URL is not configured.")
  const url = new URL(value)
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("The application URL must use HTTPS outside local development.")
  }
  return url.origin
}

export function isStripeMerchantReady(account: Stripe.V2.Core.Account) {
  return account.configuration?.merchant?.capabilities?.card_payments?.status === "active"
}

export function hasFullDashboardDirectChargeConfiguration(account: Stripe.V2.Core.Account) {
  return account.dashboard === "full"
    && account.configuration?.merchant?.applied === true
    && account.defaults?.responsibilities?.fees_collector === "stripe"
    && account.defaults?.responsibilities?.losses_collector === "stripe"
}

export function stripeV2RequirementsSubmitted(account: Stripe.V2.Core.Account) {
  const entries = account.requirements?.entries
  return entries !== undefined && entries.every((entry) => entry.awaiting_action_from === "stripe")
}
