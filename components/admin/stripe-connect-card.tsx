"use client"

import { useEffect, useState } from "react"
import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = { accountId: string | null; chargesEnabled: boolean; detailsSubmitted: boolean; canConnect: boolean; serverConfigured: boolean }

const messages: Record<string, string> = {
  ready: "Cuenta conectada y habilitada para pagos de prueba.",
  incomplete: "Stripe necesita información adicional para habilitar los cobros.",
  refresh: "No se completó el alta. Puedes retomarla sin crear otra cuenta.",
  error: "No pudimos comprobar la cuenta. Revisa la configuración e inténtalo otra vez.",
}

export function StripeConnectCard({ accountId, chargesEnabled, detailsSubmitted, canConnect, serverConfigured }: Props) {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("connect")
    if (state && messages[state]) setNotice(messages[state])
  }, [])

  async function connect() {
    setConnecting(true)
    setError("")
    try {
      const response = await fetch("/api/stripe/connect", { method: "POST" })
      const result = await response.json() as { url?: string; error?: string }
      if (!response.ok || !result.url) throw new Error(result.error ?? "No se pudo iniciar el alta.")
      window.location.assign(result.url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar el alta.")
      setConnecting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><CreditCard className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-950">Stripe · modo de pruebas</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Cada empresa conecta su propia cuenta de cobro. Los datos de tarjeta se introducen en la página alojada de Stripe; esta aplicación no los almacena.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">{chargesEnabled ? "Cuenta habilitada" : accountId ? "Cuenta pendiente de habilitación" : "Cuenta no conectada"}</p>
          <p className="mt-1 text-xs text-slate-600">{accountId ? `Identificador: ${accountId}` : "Aún no hay una cuenta de cobro asociada."}</p>
          {accountId && <p className="mt-1 text-xs text-slate-500">Datos enviados a Stripe: {detailsSubmitted ? "sí" : "pendiente"}</p>}
        </div>
        {canConnect && <Button type="button" onClick={connect} disabled={connecting || !serverConfigured} className="h-10 shrink-0 rounded-lg bg-violet-700 hover:bg-violet-800">
          {connecting ? "Abriendo Stripe…" : accountId ? "Continuar configuración" : "Conectar cuenta de pruebas"}<ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>}
      </div>

      {!serverConfigured && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Falta configuración de servidor para pruebas: clave secreta o restringida de test, secreto de Supabase solo servidor, secreto del webhook y URL local. No se aceptan claves live.</p>}
      {notice && <p role="status" className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />La confirmación de una reserva depende del webhook firmado de Stripe, nunca de volver a esta página. Esta implementación bloquea claves live deliberadamente.</div>
    </section>
  )
}
