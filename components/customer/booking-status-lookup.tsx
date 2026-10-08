"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { CalendarDays, CheckCircle2, CircleAlert, CreditCard, Search, UserRound } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type BookingStatusResult = {
  reference: string
  status: "pending" | "confirmed" | "cancelled" | "expired" | "completed"
  preferred_date: string
  number_of_people: number
  created_at: string
  excursion_name_es: string | null
  excursion_name_en: string | null
  amount_minor: number | null
  currency_code: string | null
  payment_status: string
}

const statusLabels = {
  es: { pending: "Pendiente de confirmación o pago", confirmed: "Confirmada", cancelled: "Cancelada", expired: "Retención vencida", completed: "Completada" },
  en: { pending: "Awaiting confirmation or payment", confirmed: "Confirmed", cancelled: "Cancelled", expired: "Reservation hold expired", completed: "Completed" },
}

export function BookingStatusLookup() {
  const { language } = useLanguage()
  const english = language === "en"
  const [reference, setReference] = useState("")
  const [email, setEmail] = useState("")
  const [result, setResult] = useState<BookingStatusResult | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    setResult(null)
    const normalizedReference = reference.trim()
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizedReference)) {
      setMessage(english ? "Enter the complete booking code from your confirmation." : "Introduce el código completo que aparece en la confirmación.")
      setLoading(false)
      return
    }
    const { data, error } = await supabase.rpc("get_public_booking_tracking", { p_reference: normalizedReference, p_email: email.trim() })
    if (error) setMessage(english ? "We could not check the booking right now. Try again shortly." : "No hemos podido consultar la reserva. Inténtalo de nuevo en unos minutos.")
    else if (!data) setMessage(english ? "We couldn't find a booking with those details. Check the code and email." : "No encontramos una reserva con esos datos. Revisa el código y el correo.")
    else setResult(data as BookingStatusResult)
    setLoading(false)
  }

  const status = result && statusLabels[english ? "en" : "es"][result.status]
  const excursion = english ? result?.excursion_name_en || result?.excursion_name_es : result?.excursion_name_es || result?.excursion_name_en

  return <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <header className="mb-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><Search className="h-5 w-5" /></span><p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">{english ? "Booking assistance" : "Atención de reservas"}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{english ? "Track your booking" : "Consulta tu reserva"}</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{english ? "Enter the booking code from your confirmation and the email used for the reservation." : "Introduce el código de reserva de tu confirmación y el correo utilizado al reservar."}</p></header>
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div><label htmlFor="booking-reference" className="mb-1.5 block text-sm font-medium text-slate-800">{english ? "Booking code" : "Código de reserva"}</label><Input id="booking-reference" autoComplete="off" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required value={reference} onChange={(event) => setReference(event.target.value)} className="h-12 rounded-lg font-mono text-sm" /></div>
      <div><label htmlFor="booking-email" className="mb-1.5 block text-sm font-medium text-slate-800">{english ? "Booking email" : "Correo de la reserva"}</label><Input id="booking-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-lg" /></div>
      {message && <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-700">{message}</p>}
      <Button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-teal-800 text-white hover:bg-teal-900">{loading ? (english ? "Checking…" : "Consultando…") : (english ? "Check booking" : "Consultar reserva")}</Button>
    </form>
    {result && <section aria-live="polite" className="mt-5 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-950">{excursion || (english ? "Your excursion" : "Tu excursión")}</h2><span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-900"><CheckCircle2 className="h-4 w-4" />{status}</span></div><div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2"><p className="flex items-center gap-2 text-sm text-slate-700"><CalendarDays className="h-4 w-4 text-teal-800" />{new Intl.DateTimeFormat(english ? "en-GB" : "es-ES", { dateStyle: "long" }).format(new Date(`${result.preferred_date}T12:00:00`))}</p><p className="flex items-center gap-2 text-sm text-slate-700"><UserRound className="h-4 w-4 text-teal-800" />{result.number_of_people} {english ? "travellers" : "personas"}</p><p className="flex items-center gap-2 text-sm text-slate-700"><CreditCard className="h-4 w-4 text-teal-800" />{result.payment_status === "succeeded" ? (english ? "Payment received" : "Pago recibido") : result.payment_status === "requires_refund" ? (english ? "Payment needs support" : "Pago en revisión por soporte") : result.payment_status === "failed" ? (english ? "Payment not completed" : "Pago no completado") : (english ? "No payment recorded" : "Sin pago registrado")}</p><p className="text-xs text-slate-500">{english ? "Booking reference" : "Referencia"}: <span className="font-mono">{result.reference}</span></p></div>{result.status === "pending" && result.payment_status !== "succeeded" && <p className="mt-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm leading-5 text-amber-900"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{english ? "This booking is not confirmed yet. Contact the company if you need help completing payment." : "La reserva aún no está confirmada. Contacta con la empresa si necesitas ayuda para completar el pago."}</p>}</section>}
    <p className="mt-6 text-center text-sm text-slate-600">{english ? "Prefer to keep all your bookings in one place?" : "¿Prefieres tener todas tus reservas en un solo lugar?"} <Link href="/account" className="font-semibold text-teal-800 underline underline-offset-4">{english ? "Create an account" : "Crea una cuenta"}</Link></p>
  </main>
}
