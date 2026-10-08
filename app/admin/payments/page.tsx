import { requireOrganizationRole } from "@/lib/supabase-server"
import { isStripeTestSecretKey } from "@/lib/stripe-server"
import { StripeConnectCard } from "@/components/admin/stripe-connect-card"

export default async function PaymentsSettingsPage() {
  const { client, organizationId, membership } = await requireOrganizationRole(["owner", "admin"])
  const { data: organization } = await client.from("organizations")
    .select("stripe_account_id, stripe_charges_enabled, stripe_details_submitted")
    .eq("id", organizationId).single()
  const { data: attempts } = await client.from("payment_attempts")
    .select("id, status, amount_minor, currency_code, created_at, provider_session_id")
    .eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(10)
  const canConnect = membership.role === "owner"
  const serverConfigured = Boolean(
    isStripeTestSecretKey(process.env.STRIPE_SECRET_KEY) && process.env.STRIPE_WEBHOOK_SECRET
      && process.env.SUPABASE_SECRET_KEY && process.env.NEXT_PUBLIC_APP_URL,
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-800">Configuración financiera · pruebas</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Pagos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Conecta una cuenta de Stripe de prueba para que las reservas puedan pagarse directamente a la empresa.</p>
      </header>
      <StripeConnectCard
        accountId={organization?.stripe_account_id ?? null}
        chargesEnabled={organization?.stripe_charges_enabled ?? false}
        detailsSubmitted={organization?.stripe_details_submitted ?? false}
        canConnect={canConnect}
        serverConfigured={serverConfigured}
      />
      {(attempts ?? []).length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-950">Intentos recientes</h2>
        <p className="mt-1 text-sm text-slate-600">Estados notificados por Stripe. No se muestran datos de tarjeta ni del cliente.</p>
        <div className="mt-4 divide-y divide-slate-100">
          {(attempts ?? []).map((attempt) => <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div><p className="font-medium text-slate-900">{new Intl.NumberFormat("es-ES", { style: "currency", currency: attempt.currency_code }).format(Number(attempt.amount_minor) / 100)}</p><p className="mt-0.5 text-xs text-slate-500">{new Date(attempt.created_at).toLocaleString("es-ES", { timeZone: "Atlantic/Canary" })}</p></div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${attempt.status === "succeeded" ? "bg-emerald-50 text-emerald-800" : attempt.status === "requires_refund" ? "bg-rose-50 text-rose-800" : attempt.status === "failed" || attempt.status === "refunded" ? "bg-slate-100 text-slate-700" : "bg-amber-50 text-amber-800"}`}>
              {attempt.status === "succeeded" ? "Pagado" : attempt.status === "requires_refund" ? "Reembolso pendiente · revisar" : attempt.status === "refunded" ? "Reembolsado" : attempt.status === "failed" ? "No completado" : "En curso"}
            </span>
          </div>)}
        </div>
      </section>}
      {!canConnect && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Solo el propietario de la empresa puede vincular una cuenta de cobro.</p>}
    </div>
  )
}
