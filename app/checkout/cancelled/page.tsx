import Link from "next/link"
import { Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutCancelledPage() {
  return (
    <main className="flex min-h-[70dvh] items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">
        <Clock3 className="mx-auto h-11 w-11 text-slate-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Pago cancelado</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">No se ha confirmado ninguna reserva. El inventario retenido se libera al cerrarse la sesión segura de Stripe.</p>
        <div className="mt-6"><Button asChild variant="outline" className="rounded-lg"><Link href="/excursions">Volver a excursiones</Link></Button></div>
      </section>
    </main>
  )
}
