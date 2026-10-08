import Link from "next/link"
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { PaymentStatusPoller } from "@/components/checkout/payment-status-poller"

export default async function CheckoutReturnPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const { reference = "" } = await searchParams
  const validReference = /^[0-9a-f-]{36}$/i.test(reference)
  const supabase = await createServerSupabaseClient()
  const { data } = validReference
    ? await supabase.rpc("get_public_payment_status", { p_reference: reference })
    : { data: null }
  const confirmed = data?.booking_status === "confirmed" && data?.payment_status === "succeeded"
  const waiting = data?.booking_status === "pending" && ["created", "pending"].includes(data?.payment_status)

  return (
    <main className="flex min-h-[70dvh] items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">
        {confirmed ? <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-700" aria-hidden="true" />
          : waiting ? <Clock3 className="mx-auto h-11 w-11 text-amber-600" aria-hidden="true" />
            : <ShieldCheck className="mx-auto h-11 w-11 text-slate-500" aria-hidden="true" />}
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{confirmed ? "Reserva confirmada" : waiting ? "Verificando el pago" : "No podemos confirmar esta reserva"}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{confirmed
          ? "Stripe confirmó el pago y la reserva ya está registrada. Guarda la referencia para futuras consultas."
          : waiting
            ? "Estamos esperando la confirmación segura de Stripe. Esta página se actualizará automáticamente; no vuelvas a pagar mientras se verifica."
            : "El retorno del navegador no confirma el pago. Comprueba el estado en unos instantes o contacta con la empresa si el cargo aparece en tu banco."}</p>
        {reference && <p className="mt-5 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">Referencia: {reference}</p>}
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row"><Button asChild className="rounded-lg bg-teal-800 text-white hover:bg-teal-900"><Link href="/booking-status">Consultar con código y correo</Link></Button><Button asChild variant="outline" className="rounded-lg"><Link href="/account">Crear cuenta para seguir mis reservas</Link></Button></div>
        <Link href="/excursions" className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-slate-500 underline-offset-4 hover:text-teal-800 hover:underline">Volver a excursiones</Link>
        <PaymentStatusPoller active={waiting} />
      </section>
    </main>
  )
}
