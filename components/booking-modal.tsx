"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { CalendarClock, CheckCircle2, Clock3, MessageCircle, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, type Excursion } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"
import { TermsConditionsModal } from "@/components/terms-conditions-modal"

type ProductOption = {
  id: string
  name: string
  pricing_mode: "per_participant" | "per_group" | "per_resource"
  unit_price_minor: number
  currency_code: string
  min_quantity: number
  max_quantity: number
  min_participants_per_unit: number
  max_participants_per_unit: number
}

type Departure = { departure_id: string; starts_at: string; ends_at: string; sales_cutoff_at: string; option_availability: Record<string, number> }
type Selection = { quantity: number; participants: number }

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  excursion: Excursion
}

const departureFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Atlantic/Canary",
})

export function BookingModal({ isOpen, onClose, excursion }: BookingModalProps) {
  const { language } = useLanguage()
  const [departures, setDepartures] = useState<Departure[]>([])
  const [options, setOptions] = useState<ProductOption[]>([])
  const [departureId, setDepartureId] = useState("")
  const [selection, setSelection] = useState<Record<string, Selection>>({})
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", requests: "" })
  const [loading, setLoading] = useState(false)
  const [paymentReady, setPaymentReady] = useState(false)
  const [termsVersion, setTermsVersion] = useState<number | null>(null)
  const [termsLocale, setTermsLocale] = useState<"es" | "en">("es")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [confirmation, setConfirmation] = useState<{ reference: string; amount: number; currency: string } | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setLoading(true)
    setPaymentReady(false)
    setError("")
    Promise.all([
      supabase.rpc("get_public_departure_availability", { p_excursion_id: excursion.id }),
      supabase.from("product_options")
        .select("id, name, pricing_mode, unit_price_minor, currency_code, min_quantity, max_quantity, min_participants_per_unit, max_participants_per_unit")
        .eq("excursion_id", excursion.id).eq("active", true).order("created_at"),
      supabase.rpc("get_public_payment_readiness"),
      supabase.from("organization_site_pages").select("version").eq("page_key", "terms").eq("locale", language === "en" ? "en" : "es").maybeSingle(),
    ]).then(async ([departuresResult, optionsResult, readinessResult, termsResult]) => {
      if (!active) return
      if (departuresResult.error || optionsResult.error) {
        setError("No se pudo consultar la disponibilidad. Inténtalo de nuevo en unos segundos.")
      } else {
        setDepartures((departuresResult.data ?? []) as Departure[])
        setOptions((optionsResult.data ?? []) as ProductOption[])
        setPaymentReady(readinessResult.data === true)
        let acceptedLocale: "es" | "en" = language === "en" ? "en" : "es"
        let publishedVersion = termsResult.data?.version ?? null
        if (publishedVersion === null && acceptedLocale === "en") {
          const spanishTerms = await supabase.from("organization_site_pages").select("version").eq("page_key", "terms").eq("locale", "es").maybeSingle()
          publishedVersion = spanishTerms.data?.version ?? null
          if (publishedVersion !== null) acceptedLocale = "es"
        }
        setTermsVersion(publishedVersion)
        setTermsLocale(acceptedLocale)
        setAcceptedTerms(false)
      }
    }).catch(() => {
      if (active) setError("No se pudo consultar la disponibilidad. Inténtalo de nuevo en unos segundos.")
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [isOpen, excursion.id, language])

  const selectedLines = useMemo(() => options.flatMap((option) => {
    const chosen = selection[option.id]
    return chosen?.quantity > 0 ? [{ option, ...chosen }] : []
  }), [options, selection])

  const currency = selectedLines[0]?.option.currency_code ?? options[0]?.currency_code ?? "EUR"
  const totalMinor = selectedLines.reduce((total, line) => total + line.option.unit_price_minor * (
    line.option.pricing_mode === "per_participant" ? line.participants : line.quantity
  ), 0)
  const participantCount = selectedLines.reduce((total, line) => total + line.participants, 0)
  const selectedDeparture = departures.find((departure) => departure.departure_id === departureId)
  const formatter = useMemo(() => new Intl.NumberFormat(language === "en" ? "en-GB" : language === "de" ? "de-DE" : "es-ES", { style: "currency", currency }), [currency, language])

  function availableQuantity(optionId: string) {
    return selectedDeparture?.option_availability[optionId] ?? 0
  }

  function setQuantity(option: ProductOption, rawValue: string) {
    const maxAvailable = departureId ? availableQuantity(option.id) : option.max_quantity
    const quantity = Math.max(0, Math.min(option.max_quantity, maxAvailable, Number(rawValue) || 0))
    setSelection((previous) => {
      if (quantity === 0) {
        const next = { ...previous }
        delete next[option.id]
        return next
      }
      const current = previous[option.id]
      const defaultPeople = quantity * option.min_participants_per_unit
      return { ...previous, [option.id]: { quantity, participants: Math.max(defaultPeople, Math.min(current?.participants ?? defaultPeople, quantity * option.max_participants_per_unit)) } }
    })
  }

  function setParticipants(option: ProductOption, rawValue: string) {
    const participants = Number(rawValue) || 0
    setSelection((previous) => ({ ...previous, [option.id]: { ...(previous[option.id] ?? { quantity: 1 }), participants } }))
  }

  const validSelection = selectedLines.length > 0 && selectedLines.every(({ option, quantity, participants }) =>
    quantity >= option.min_quantity && quantity <= Math.min(option.max_quantity, availableQuantity(option.id)) &&
    participants >= quantity * option.min_participants_per_unit &&
    participants <= quantity * option.max_participants_per_unit &&
    (option.pricing_mode !== "per_participant" || quantity === participants)
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!departureId || !validSelection) return
    setSubmitting(true)
    setError("")
    try {
      const { data, error: rpcError } = await supabase.rpc("create_inventory_booking_with_terms", {
        p_departure_id: departureId,
        p_customer_name: customer.name.trim(),
        p_email: customer.email.trim(),
        p_phone: customer.phone.trim(),
        p_language: language,
        p_items: selectedLines.map(({ option, quantity, participants }) => ({ option_id: option.id, quantity, participants })),
        p_special_requests: customer.requests.trim() || null,
        p_terms_version: termsVersion,
        p_terms_locale: termsLocale,
        p_accept_terms: acceptedTerms,
      })
      if (rpcError || !data) {
        setError(rpcError?.code === "P0001"
          ? "La disponibilidad acaba de cambiar o faltan recursos. Elige otra salida o reduce las unidades y vuelve a intentarlo."
          : rpcError?.code === "22023"
            ? "Los términos cambiaron o aún no están publicados. Actualiza la aceptación e inténtalo de nuevo."
            : "No se pudo preparar el pago. Revisa los datos e inténtalo de nuevo.")
        return
      }
      const result = data as { reference: string; total_amount_minor: number; currency_code: string }
      const checkoutResponse = await fetch("/api/stripe/checkout", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ reference: result.reference }),
      })
      const checkout = await checkoutResponse.json() as { url?: string; error?: string }
      if (!checkoutResponse.ok || !checkout.url) {
        setConfirmation({ reference: result.reference, amount: result.total_amount_minor, currency: result.currency_code })
        setError(checkout.error ?? "No se pudo abrir el pago. Puedes volver a intentarlo antes de que venza la retención.")
        return
      }
      window.location.assign(checkout.url)
    } catch {
      setError("No se pudo iniciar la reserva o el pago por un problema de conexión. Inténtalo de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  async function retryCheckout() {
    if (!confirmation) return
    setSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ reference: confirmation.reference }),
      })
      const result = await response.json() as { url?: string; error?: string }
      if (!response.ok || !result.url) throw new Error(result.error ?? "No se pudo abrir el pago.")
      window.location.assign(result.url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo abrir el pago.")
    } finally {
      setSubmitting(false)
    }
  }

  function close() {
    onClose()
    setConfirmation(null)
    setError("")
    setSelection({})
    setDepartureId("")
    setCustomer({ name: "", email: "", phone: "", requests: "" })
  }

  const excursionName = language === "en" ? excursion.name_en : language === "de" ? excursion.name_de : excursion.name_es

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Reserva directa</p>
          <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950">{confirmation ? "Reserva retenida" : excursionName}</DialogTitle>
          <DialogDescription>{confirmation ? "Completa el pago alojado por Stripe para confirmar la reserva." : "Selecciona una salida y las unidades que deseas reservar. El precio y el inventario se validan en el servidor."}</DialogDescription>
        </DialogHeader>

        {confirmation ? (
          <div className="space-y-5 py-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-700" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-emerald-900">Referencia de reserva</p>
              <p className="mt-1 break-all font-mono text-sm text-emerald-800">{confirmation.reference}</p>
              <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-950">{new Intl.NumberFormat("es-ES", { style: "currency", currency: confirmation.currency }).format(confirmation.amount / 100)}</p>
            </div>
            <p className="flex gap-2 text-sm leading-6 text-slate-600"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />La reserva aún no está confirmada. El inventario se retiene durante 30 minutos mientras completas el pago seguro; solo se confirma cuando Stripe notifica el pago al servidor.</p>
            {error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" className="h-11 flex-1 rounded-lg bg-violet-700 hover:bg-violet-800" disabled={submitting} onClick={retryCheckout}>{submitting ? "Abriendo Stripe…" : "Continuar al pago"}</Button>
              <Button asChild variant="outline" className="h-11 flex-1 rounded-lg"><a href={`https://wa.me/34617303929?text=${encodeURIComponent(`Hola, mi referencia de reserva es ${confirmation.reference}.`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" />Consultar</a></Button>
              <Button type="button" variant="outline" className="h-11 rounded-lg" onClick={close}>Cerrar</Button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex min-h-44 items-center justify-center text-sm text-slate-500" role="status">Consultando salidas y opciones disponibles…</div>
        ) : departures.length === 0 || options.length === 0 ? (
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Esta excursión todavía no tiene salidas y opciones de reserva publicadas. Contacta con la empresa para consultar disponibilidad.</div>
            <Button type="button" variant="outline" className="w-full rounded-lg" onClick={close}>Cerrar</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-1">
            <div className="space-y-2">
              <Label htmlFor="booking-departure">Salida disponible *</Label>
              <Select value={departureId} onValueChange={(nextId) => { setDepartureId(nextId); setSelection({}) }}>
                <SelectTrigger id="booking-departure" className="h-11 rounded-lg"><SelectValue placeholder="Elige fecha y hora" /></SelectTrigger>
                <SelectContent>{departures.map((departure) => {
                  const stockSummary = options.flatMap((option) => {
                    const available = departure.option_availability[option.id] ?? 0
                    return available > 0 ? [`${available} ${availabilityUnit(option, available)}`] : []
                  })
                  const summary = stockSummary.length ? [...new Set(stockSummary)].join(" · ") : "Completa"
                  return <SelectItem key={departure.departure_id} value={departure.departure_id}>{departureFormatter.format(new Date(departure.starts_at))} · {summary}</SelectItem>
                })}</SelectContent>
              </Select>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-slate-900">Opciones de reserva</legend>
              <div className="space-y-2">{options.map((option) => {
                const chosen = selection[option.id]
                const linePeople = chosen?.participants ?? 0
                const minPeople = (chosen?.quantity ?? 0) * option.min_participants_per_unit
                const maxPeople = (chosen?.quantity ?? 0) * option.max_participants_per_unit
                const variableGroup = option.min_participants_per_unit !== option.max_participants_per_unit
                const unitPrice = new Intl.NumberFormat("es-ES", { style: "currency", currency: option.currency_code }).format(option.unit_price_minor / 100)
                return <div key={option.id} className={`rounded-xl border p-4 transition-colors ${chosen ? "border-teal-300 bg-teal-50/50" : "border-slate-200 bg-white"}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><p className="font-medium text-slate-900">{option.name}</p><p className="mt-1 text-sm text-slate-500">{unitPrice} {option.pricing_mode === "per_participant" ? "por persona" : option.pricing_mode === "per_group" ? "por grupo" : "por unidad"}</p></div>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="w-24 space-y-1"><Label htmlFor={`quantity-${option.id}`} className="text-xs text-slate-500">Unidades</Label><Input id={`quantity-${option.id}`} type="number" inputMode="numeric" min={0} max={departureId ? Math.min(option.max_quantity, availableQuantity(option.id)) : option.max_quantity} value={chosen?.quantity ?? 0} onChange={(event) => setQuantity(option, event.target.value)} disabled={Boolean(departureId && availableQuantity(option.id) === 0)} className="h-10 rounded-lg" /></div>
                      {chosen && variableGroup && <div className="w-28 space-y-1"><Label htmlFor={`participants-${option.id}`} className="text-xs text-slate-500">Personas</Label><Input id={`participants-${option.id}`} type="number" inputMode="numeric" min={minPeople} max={maxPeople} value={linePeople} onChange={(event) => setParticipants(option, event.target.value)} className="h-10 rounded-lg" /></div>}
                    </div>
                  </div>
                  {chosen && variableGroup && <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><Users className="h-3.5 w-3.5" />Entre {minPeople} y {maxPeople} participantes para {chosen.quantity} unidad{chosen.quantity === 1 ? "" : "es"}.</p>}
                  {departureId && <p className={`mt-2 text-xs font-medium ${availableQuantity(option.id) > 0 ? "text-emerald-800" : "text-rose-700"}`}>
                    {availableQuantity(option.id) > 0 ? `Disponibles: ${availableQuantity(option.id)} ${availabilityUnit(option, availableQuantity(option.id))}` : "Sin disponibilidad para esta salida"}
                  </p>}
                  {departureId && variableGroup && availableQuantity(option.id) > 0 && <p className="mt-1 text-xs leading-5 text-slate-500">El contador considera {option.min_participants_per_unit} personas por unidad; los grupos mayores se validan con el inventario completo al solicitar.</p>}
                </div>
              })}</div>
            </fieldset>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600"><span>Participantes</span><span className="tabular-nums">{participantCount}</span></div>
              {selectedLines.map((line) => <div key={line.option.id} className="mt-2 flex justify-between gap-3 text-sm text-slate-600"><span>{line.option.name} × {line.quantity}</span><span className="shrink-0 tabular-nums">{new Intl.NumberFormat("es-ES", { style: "currency", currency: line.option.currency_code }).format(line.option.unit_price_minor * (line.option.pricing_mode === "per_participant" ? line.participants : line.quantity) / 100)}</span></div>)}
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-semibold text-slate-950"><span>Total</span><span className="tabular-nums">{formatter.format(totalMinor / 100)}</span></div>
              <p className="mt-2 text-xs text-slate-500">El importe lo calcula el servidor y se cobra en la cuenta Stripe de la empresa.</p>
            </div>

            {!paymentReady && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">El pago online todavía no está habilitado para esta empresa. No introduzcas datos de tarjeta; contacta con el equipo para consultar disponibilidad.</div>}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="customer-name">Nombre completo *</Label><Input id="customer-name" autoComplete="name" required minLength={2} maxLength={120} value={customer.name} onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))} className="h-11 rounded-lg" /></div>
              <div className="space-y-1.5"><Label htmlFor="customer-email">Email *</Label><Input id="customer-email" type="email" autoComplete="email" required maxLength={254} value={customer.email} onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))} className="h-11 rounded-lg" /></div>
              <div className="space-y-1.5"><Label htmlFor="customer-phone">Teléfono</Label><Input id="customer-phone" type="tel" autoComplete="tel" maxLength={40} value={customer.phone} onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))} className="h-11 rounded-lg" /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="customer-requests">Necesidades o comentarios</Label><Textarea id="customer-requests" rows={2} maxLength={2000} value={customer.requests} onChange={(event) => setCustomer((current) => ({ ...current, requests: event.target.value }))} className="resize-y rounded-lg" /></div>
            </div>

            <div className="space-y-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />El inventario y el precio se validan conjuntamente al enviar. Si una unidad acaba de reservarse, la operación completa se rechaza sin crear una reserva parcial.</p>
              {termsVersion === null ? <p role="alert" className="text-amber-900">{language === "en" ? "The company has not published its booking terms yet. A booking cannot be completed until it does." : "La empresa todavía no ha publicado los términos de reserva. No se puede completar una reserva hasta que lo haga."}</p> : <div className="flex items-start gap-2"><input id="accept-booking-terms" type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 h-4 w-4 accent-teal-800" /><label htmlFor="accept-booking-terms">{language === "en" ? "I have read and accept the " : "He leído y acepto los "}<button type="button" onClick={() => setTermsModalOpen(true)} className="font-semibold text-teal-800 underline underline-offset-2">{language === "en" ? "booking terms" : "términos y condiciones"}</button> ({language === "en" ? "version" : "versión"} {termsVersion}, {language === "en" ? "language" : "idioma"} {termsLocale.toUpperCase()}).</label></div>}
            </div>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="h-11 flex-1 rounded-lg" disabled={submitting} onClick={close}>Cancelar</Button>
              <Button type="submit" className="h-11 flex-1 rounded-lg bg-violet-700 hover:bg-violet-800" disabled={!paymentReady || termsVersion === null || !acceptedTerms || !departureId || !validSelection || !customer.name.trim() || !customer.email.trim() || submitting}>
                {submitting ? "Comprobando inventario…" : paymentReady
                  ? <><CalendarClock className="mr-2 h-4 w-4" />Pagar con Stripe · {formatter.format(totalMinor / 100)}</>
                  : "Pago online no disponible"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
    <TermsConditionsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />
    </>
  )
}

function availabilityUnit(option: ProductOption, quantity: number) {
  if (option.pricing_mode === "per_participant") return quantity === 1 ? "plaza" : "plazas"
  if (option.pricing_mode === "per_group") return quantity === 1 ? "grupo" : "grupos"
  return quantity === 1 ? "unidad" : "unidades"
}
