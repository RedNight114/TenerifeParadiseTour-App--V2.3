"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addDays, addMonths, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, ExternalLink, List, Mail, MessageCircle, Plus, Search, Users, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { createExternalBooking, updateBookingStatus } from "@/app/admin/bookings/actions"

type BookingState = "pending" | "confirmed" | "cancelled" | "expired" | "completed"

export type ManagedBooking = {
  id: number
  excursion_id: number
  departure_id: string | null
  total_amount_minor: number | null
  currency_code: string | null
  public_reference: string
  customer_name: string
  email: string
  phone: string
  preferred_date: string
  number_of_people: number
  special_requests: string | null
  language: string
  created_at: string
  status: BookingState
  booking_source?: "website" | "external"
  external_channel?: string | null
  external_reference?: string | null
  accepted_terms_version: number | null
  accepted_terms_locale: "es" | "en" | null
  accepted_terms_at: string | null
  excursions: { name_es: string; name_en: string; name_de: string; price: number } | null
}

type DepartureForBooking = { id: string; excursion_id: number; starts_at: string; status: string; excursions: { name_es: string } | null }
type OptionForBooking = {
  id: string; excursion_id: number; name: string; pricing_mode: "per_participant" | "per_group" | "per_resource"
  unit_price_minor: number; currency_code: string; min_quantity: number; max_quantity: number
  min_participants_per_unit: number; max_participants_per_unit: number
}

const statusMeta: Record<BookingState, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "border-amber-200 bg-amber-50 text-amber-800" },
  confirmed: { label: "Confirmada", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  cancelled: { label: "Cancelada", className: "border-slate-200 bg-slate-100 text-slate-700" },
  expired: { label: "Retención vencida", className: "border-orange-200 bg-orange-50 text-orange-800" },
  completed: { label: "Completada", className: "border-blue-200 bg-blue-50 text-blue-800" },
}

const money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 })
const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "Atlantic/Canary" })

function excursionName(booking: ManagedBooking) {
  return booking.excursions?.name_es ?? `Excursión #${booking.excursion_id}`
}

function whatsAppLink(booking: ManagedBooking) {
  const phone = booking.phone.replace(/\D/g, "")
  const message = encodeURIComponent(
    `Hola ${booking.customer_name}, te contactamos por tu solicitud para ${excursionName(booking)} el ${formatDate(booking.preferred_date)}.`,
  )
  return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/34617303929?text=${message}`
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value.slice(0, 10)}T12:00:00`))
}

function bookingAmount(booking: ManagedBooking) {
  if (booking.total_amount_minor !== null && booking.currency_code) {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: booking.currency_code }).format(booking.total_amount_minor / 100)
  }
  return booking.excursions?.price != null ? money.format(booking.excursions.price * booking.number_of_people) : "Precio por confirmar"
}

function StatusBadge({ status }: { status: BookingState }) {
  return <Badge variant="outline" className={`rounded-full px-2.5 py-1 font-medium ${statusMeta[status].className}`}>{statusMeta[status].label}</Badge>
}

function StatusControl({ booking }: { booking: ManagedBooking }) {
  return <StatusBadge status={booking.status} />
}

export function BookingsManager({ bookings: initialBookings, departures, options, loadError, canUpdate }: { bookings: ManagedBooking[]; departures: DepartureForBooking[]; options: OptionForBooking[]; loadError: string | null; canUpdate: boolean }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | BookingState>("all")
  const [selected, setSelected] = useState<ManagedBooking | null>(null)
  const [isPending, startTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [view, setView] = useState<"list" | "calendar">("calendar")
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [externalDialogOpen, setExternalDialogOpen] = useState(false)
  const router = useRouter()
  useEffect(() => setBookings(initialBookings), [initialBookings])

  const visibleBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es")
    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter
      const haystack = `${booking.customer_name} ${booking.email} ${booking.phone} ${excursionName(booking)} ${booking.preferred_date}`.toLocaleLowerCase("es")
      return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery))
    })
  }, [bookings, query, statusFilter])

  const pendingCount = bookings.filter((booking) => booking.status === "pending").length
  const confirmedCount = bookings.filter((booking) => booking.status === "confirmed").length
  const peopleCount = bookings.reduce((total, booking) => total + booking.number_of_people, 0)
  const externalCount = bookings.filter((booking) => booking.booking_source === "external").length

  const calendarDays = useMemo(() => {
    const first = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 1 })
    const last = endOfMonth(calendarMonth)
    const days = []
    for (let day = first; day <= last; day = addDays(day, 1)) days.push(day)
    while (days.length % 7 !== 0) days.push(addDays(days[days.length - 1], 1))
    return days
  }, [calendarMonth])

  const bookingsByDate = useMemo(() => {
    const grouped = new Map<string, ManagedBooking[]>()
    bookings.forEach((booking) => {
      const key = booking.preferred_date.slice(0, 10)
      grouped.set(key, [...(grouped.get(key) ?? []), booking])
    })
    return grouped
  }, [bookings])

  const selectedDayBookings = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd")
    return (bookingsByDate.get(key) ?? []).filter((booking) => statusFilter === "all" || booking.status === statusFilter)
      .filter((booking) => !query.trim() || `${booking.customer_name} ${booking.email} ${excursionName(booking)}`.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es")))
  }, [bookingsByDate, selectedDate, statusFilter, query])

  function changeStatus(booking: ManagedBooking, status: BookingState) {
    if (status === booking.status) return
    const oldStatus = booking.status
    setUpdatingId(booking.id)
    setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status } : item))

    startTransition(async () => {
      const result = await updateBookingStatus({ bookingId: booking.id, status })
      if (!result.success) {
        setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status: oldStatus } : item))
        toast.error(result.error)
      } else {
        toast.success("Estado de reserva actualizado")
        setSelected((current) => current?.id === booking.id ? { ...current, status } : current)
      }
      setUpdatingId(null)
    })
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Operaciones</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Reservas</h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">Consulta solicitudes, confirma disponibilidad y contacta directamente con tus clientes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900"><span className="font-semibold">{pendingCount}</span> {pendingCount === 1 ? "solicitud pendiente" : "solicitudes pendientes"}</div>{canUpdate && <Button type="button" onClick={() => setExternalDialogOpen(true)} className="h-11 rounded-xl bg-teal-800 px-4 text-white hover:bg-teal-900"><Plus className="mr-2 h-4 w-4" />Añadir reserva externa</Button>}</div>
      </header>

      <section aria-label="Resumen de reservas" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarDays} label="Total de solicitudes" value={bookings.length} tone="teal" />
        <Metric icon={Clock3} label="Pendientes" value={pendingCount} tone="amber" />
        <Metric icon={Users} label="Personas reservadas" value={peopleCount} tone="slate" detail={`${confirmedCount} ${confirmedCount === 1 ? "confirmada" : "confirmadas"}`} />
        <Metric icon={ExternalLink} label="Ventas externas" value={externalCount} tone="slate" detail="Registradas fuera de la web" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Todas las reservas</h2>
            <p className="mt-1 text-sm text-slate-500">{visibleBookings.length} de {bookings.length} solicitudes</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block sm:w-72">
              <span className="sr-only">Buscar reserva</span>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cliente, email o excursión" className="h-11 rounded-lg border-slate-200 pl-9" />
            </label>
            <label>
              <span className="sr-only">Filtrar por estado</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 sm:w-44">
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="cancelled">Canceladas</option>
                <option value="expired">Retención vencida</option>
                <option value="completed">Completadas</option>
              </select>
            </label>
            <div className="flex rounded-lg border border-slate-200 p-1" role="group" aria-label="Vista de reservas"><Button type="button" variant={view === "calendar" ? "secondary" : "ghost"} className="h-9" aria-pressed={view === "calendar"} onClick={() => setView("calendar")}><CalendarDays className="mr-1.5 h-4 w-4" />Calendario</Button><Button type="button" variant={view === "list" ? "secondary" : "ghost"} className="h-9" aria-pressed={view === "list"} onClick={() => setView("list")}><List className="mr-1.5 h-4 w-4" />Lista</Button></div>
          </div>
        </div>

        {view === "calendar" && !loadError && <CalendarView month={calendarMonth} setMonth={setCalendarMonth} days={calendarDays} selectedDate={selectedDate} setSelectedDate={setSelectedDate} bookingsByDate={bookingsByDate} bookings={selectedDayBookings} onSelect={setSelected} />}

        {loadError ? (
          <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</div>
        ) : view === "calendar" ? null : visibleBookings.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><CalendarDays className="h-6 w-6" /></div>
            <h3 className="text-base font-semibold text-slate-900">{bookings.length ? "No hay resultados" : "Aún no hay reservas"}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{bookings.length ? "Prueba con otros términos o cambia el filtro de estado." : "Las solicitudes de la web aparecerán aquí. Cuando llegue una, podrás revisar sus datos y contactar con el cliente."}</p>
          </div>
        ) : (
          <>
            <div role="region" aria-label="Tabla de reservas" tabIndex={0} className="hidden overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-700 xl:block">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Experiencia</th><th className="px-5 py-3">Fecha solicitada</th><th className="px-5 py-3">Personas</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Detalle</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleBookings.map((booking) => (
                    <tr key={booking.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-5 py-4"><div className="font-medium text-slate-900">{booking.customer_name}</div><a href={`mailto:${booking.email}`} className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700"><Mail className="h-3.5 w-3.5" />{booking.email}</a></td>
                      <td className="px-5 py-4"><div className="flex items-center gap-2"><div className="max-w-56 truncate font-medium text-slate-800">{excursionName(booking)}</div>{booking.booking_source === "external" && <Badge variant="outline" className="shrink-0 border-violet-200 bg-violet-50 text-violet-800">Externa</Badge>}</div><div className="mt-1 text-sm text-slate-500">{bookingAmount(booking)}{booking.booking_source === "external" ? ` · ${channelLabel(booking.external_channel)}` : booking.departure_id ? " · inventario retenido" : " · solicitud"}</div></td>
                      <td className="px-5 py-4 text-sm text-slate-700">{formatDate(booking.preferred_date)}</td>
                      <td className="px-5 py-4 text-sm tabular-nums text-slate-700">{booking.number_of_people}</td>
                      <td className="px-5 py-4"><StatusControl booking={booking} /></td>
                      <td className="px-5 py-4 text-right"><Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => setSelected(booking)}>Ver detalles</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-3 xl:hidden">
              {visibleBookings.map((booking) => (
                <article key={booking.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-semibold text-slate-900">{booking.customer_name}</h3><a href={`mailto:${booking.email}`} className="mt-1 block truncate text-sm text-slate-500">{booking.email}</a></div><StatusBadge status={booking.status} /></div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600"><p className="truncate font-medium text-slate-800">{excursionName(booking)}</p><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(booking.preferred_date)}<span aria-hidden="true">·</span><Users className="h-4 w-4" />{booking.number_of_people}</p></div>
                  <div className="mt-4 flex items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><StatusControl booking={booking} />{booking.booking_source === "external" && <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-800">Externa</Badge>}</div><Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => setSelected(booking)}>Detalles</Button></div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-lg">
          {selected && <>
            <DialogHeader>
              <div className="mb-2 flex items-center justify-between gap-3"><div className="flex flex-wrap gap-2"><StatusBadge status={selected.status} />{selected.booking_source === "external" && <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-800">Externa · {channelLabel(selected.external_channel)}</Badge>}</div><span className="text-xs text-slate-500">{selected.departure_id ? "Reserva" : "Solicitud"} #{selected.id}</span></div>
              <DialogTitle className="text-2xl text-slate-900">{selected.customer_name}</DialogTitle>
              <DialogDescription>{excursionName(selected)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <Detail label="Email" value={selected.email} href={`mailto:${selected.email}`} />
              <Detail label="Teléfono" value={selected.phone || "No indicado"} />
              <Detail label="Fecha solicitada" value={formatDate(selected.preferred_date)} />
              <Detail label="Personas" value={String(selected.number_of_people)} />
              <Detail label={selected.departure_id ? "Total reservado" : "Total estimado"} value={bookingAmount(selected)} />
              {selected.external_reference && <Detail label="Referencia externa" value={selected.external_reference} />}
              <Detail label="Aceptación de términos" value={selected.accepted_terms_version ? `Versión ${selected.accepted_terms_version} · ${(selected.accepted_terms_locale ?? "").toUpperCase()} · ${selected.accepted_terms_at ? new Date(selected.accepted_terms_at).toLocaleString() : "fecha no disponible"}` : "Sin aceptación registrada (reserva anterior)"} />
              {selected.special_requests && <div className="border-t border-slate-200 pt-3"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Necesidades o comentarios</p><p className="whitespace-pre-wrap leading-6 text-slate-800">{selected.special_requests}</p></div>}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="h-11 flex-1 rounded-lg bg-emerald-700 hover:bg-emerald-800"><a href={whatsAppLink(selected)} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" />Contactar por WhatsApp<ExternalLink className="ml-auto h-4 w-4" /></a></Button>
              {canUpdate && selected.status === "pending" && <Button type="button" variant="outline" className="h-11 rounded-lg" disabled={isPending || updatingId === selected.id} onClick={() => changeStatus(selected, "confirmed")}><Check className="mr-2 h-4 w-4" />Marcar confirmada</Button>}
              {canUpdate && selected.status !== "cancelled" && <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <Button type="button" variant="ghost" className="h-11 rounded-lg text-slate-600 hover:text-red-700" disabled={isPending || updatingId === selected.id} onClick={() => setCancelDialogOpen(true)}><XCircle className="mr-2 h-4 w-4" />Cancelar reserva</Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
                    <AlertDialogDescription>La reserva quedará cancelada y no podrá reabrirse desde el panel. Si ya contactaste al cliente, asegúrate de haberle comunicado la cancelación.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Volver</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-700 hover:bg-red-800" onClick={() => { changeStatus(selected, "cancelled"); setCancelDialogOpen(false) }}>Confirmar cancelación</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>}
            </div>
            {canUpdate && selected.status !== "cancelled" && <p className="text-xs leading-5 text-slate-500">Confirma solo después de comprobar disponibilidad y acordar los detalles con el cliente. Este panel no envía mensajes ni procesa pagos.</p>}
            {selected.status === "cancelled" && <p className="text-xs leading-5 text-slate-500">Reserva cancelada. Este estado es definitivo en el MVP.</p>}
            {selected.status === "expired" && <p className="text-xs leading-5 text-slate-500">La retención temporal venció y el inventario volvió a estar disponible. No se puede confirmar esta solicitud.</p>}
          </>}
        </DialogContent>
      </Dialog>
      <ExternalBookingDialog open={externalDialogOpen} onOpenChange={setExternalDialogOpen} departures={departures} options={options} onCreated={() => router.refresh()} />
    </div>
  )
}

function CalendarView({ month, setMonth, days, selectedDate, setSelectedDate, bookingsByDate, bookings, onSelect }: {
  month: Date; setMonth: (date: Date) => void; days: Date[]; selectedDate: Date; setSelectedDate: (date: Date) => void
  bookingsByDate: Map<string, ManagedBooking[]>; bookings: ManagedBooking[]; onSelect: (booking: ManagedBooking) => void
}) {
  return <div className="grid gap-0 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]">
    <div className="border-b border-slate-100 p-4 sm:p-5 lg:border-b-0 lg:border-r">
      <div className="mb-4 flex items-center justify-between gap-2"><div><h3 className="text-base font-semibold capitalize text-slate-900">{format(month, "MMMM yyyy", { locale: es })}</h3><p className="text-xs text-slate-500">Selecciona un día para ver sus reservas</p></div><div className="flex gap-1"><Button variant="outline" className="h-10 px-3" onClick={() => setMonth(startOfMonth(new Date()))}>Hoy</Button><Button aria-label="Mes anterior" variant="outline" className="h-10 w-10 px-0" onClick={() => setMonth(addMonths(month, -1))}><ChevronLeft className="h-4 w-4" /></Button><Button aria-label="Mes siguiente" variant="outline" className="h-10 w-10 px-0" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight className="h-4 w-4" /></Button></div></div>
      <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500">{["L", "M", "X", "J", "V", "S", "D"].map((day, index) => <div key={`${day}-${index}`} className="py-2" aria-label={["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][index]}>{day}</div>)}</div>
      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-slate-100">{days.map((day) => { const key = format(day, "yyyy-MM-dd"); const entries = bookingsByDate.get(key) ?? []; const isSelected = isSameDay(day, selectedDate); return <button key={key} type="button" onClick={() => setSelectedDate(day)} aria-pressed={isSelected} aria-label={`${format(day, "d MMMM", { locale: es })}, ${entries.length} reservas`} className={`min-h-[58px] border-b border-r border-slate-100 p-1.5 text-left transition-colors hover:bg-teal-50 sm:min-h-[76px] sm:p-2 ${!isSameMonth(day, month) ? "bg-slate-50/70 text-slate-400" : "bg-white text-slate-800"} ${isSelected ? "ring-2 ring-inset ring-teal-700" : ""}`}><span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs ${isSameDay(day, new Date()) ? "bg-teal-800 font-semibold text-white" : ""}`}>{format(day, "d")}</span>{entries.length > 0 && <span className="mt-1 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" /><span className="text-[10px] font-medium text-slate-600">{entries.length} <span className="hidden sm:inline">reservas</span></span></span>}</button> })}</div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-600" />Día con reservas</span><span>Fechas según la zona horaria de Canarias.</span></div>
    </div>
    <div className="p-4 sm:p-5"><div className="mb-4"><h3 className="font-semibold capitalize text-slate-900">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</h3><p className="text-sm text-slate-500">{bookings.length} {bookings.length === 1 ? "reserva" : "reservas"} en esta fecha</p></div>{bookings.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center"><CalendarDays className="mx-auto h-6 w-6 text-slate-400" /><p className="mt-2 text-sm font-medium text-slate-700">Día sin reservas</p><p className="mt-1 text-xs text-slate-500">Prueba otra fecha o cambia los filtros.</p></div> : <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">{bookings.map((booking) => <button key={booking.id} onClick={() => onSelect(booking)} className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-teal-300 hover:bg-teal-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"><div className="flex items-start justify-between gap-2"><span className="truncate font-medium text-slate-900">{booking.customer_name}</span><StatusBadge status={booking.status} /></div><p className="mt-1 truncate text-sm text-slate-600">{excursionName(booking)}</p><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{booking.number_of_people}</span><span>{bookingAmount(booking)}</span>{booking.booking_source === "external" && <span className="rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-800">Externa</span>}</div></button>)}</div>}</div>
  </div>
}

function channelLabel(channel?: string | null) { const labels: Record<string, string> = { phone: "Teléfono", whatsapp: "WhatsApp", in_person: "Presencial", email: "Email", partner: "Colaborador", other: "Otro" }; return channel ? labels[channel] ?? "Externa" : "Externa" }

function ExternalBookingDialog({ open, onOpenChange, departures, options, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; departures: DepartureForBooking[]; options: OptionForBooking[]; onCreated: () => void }) {
  const [departureId, setDepartureId] = useState("")
  const [optionId, setOptionId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [participants, setParticipants] = useState(1)
  const [saving, setSaving] = useState(false)
  const selectedDeparture = departures.find((item) => item.id === departureId)
  const availableOptions = options.filter((item) => item.excursion_id === selectedDeparture?.excursion_id)
  const selectedOption = availableOptions.find((item) => item.id === optionId)

  function chooseDeparture(id: string) { setDepartureId(id); setOptionId(""); setQuantity(1); setParticipants(1) }
  function chooseOption(id: string) { const choice = availableOptions.find((item) => item.id === id); const initialQuantity = choice?.min_quantity ?? 1; setOptionId(id); setQuantity(initialQuantity); setParticipants(choice?.pricing_mode === "per_participant" ? initialQuantity : (choice?.min_participants_per_unit ?? 1) * initialQuantity) }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedOption || !departureId) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    const result = await createExternalBooking({ departureId, optionId, quantity, participants, customerName: String(form.get("customerName") ?? ""), email: String(form.get("email") ?? ""), phone: String(form.get("phone") ?? ""), language: String(form.get("language") ?? "es"), specialRequests: String(form.get("specialRequests") ?? ""), channel: String(form.get("channel") ?? "other"), externalReference: String(form.get("externalReference") ?? "") })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success(`Reserva externa confirmada${result.reference ? ` · ${result.reference.slice(0, 8).toUpperCase()}` : ""}. La capacidad se ha actualizado.`)
    onOpenChange(false); onCreated()
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl sm:max-w-2xl"><DialogHeader><DialogTitle className="text-xl">Añadir reserva externa</DialogTitle><DialogDescription>Registra una venta hecha por teléfono, WhatsApp, presencialmente o por un colaborador. La reserva se confirma y descuenta inventario.</DialogDescription></DialogHeader>{departures.length === 0 ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">No hay salidas futuras programadas para reservar. Crea primero la salida y su capacidad en Inventario y salidas.</div> : <form onSubmit={submit} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Salida" required><select required value={departureId} onChange={(event) => chooseDeparture(event.target.value)} className={selectClass}><option value="">Selecciona fecha y excursión</option>{departures.map((item) => <option key={item.id} value={item.id}>{item.excursions?.name_es ?? "Excursión"} · {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Atlantic/Canary" }).format(new Date(item.starts_at))}</option>)}</select></Field><Field label="Tarifa / opción" required><select required disabled={!departureId || availableOptions.length === 0} value={optionId} onChange={(event) => chooseOption(event.target.value)} className={selectClass}><option value="">{departureId ? availableOptions.length ? "Selecciona una tarifa" : "No hay tarifas activas para esta excursión" : "Elige primero una salida"}</option>{availableOptions.map((item) => <option key={item.id} value={item.id}>{item.name} · {(item.unit_price_minor / 100).toLocaleString("es-ES", { style: "currency", currency: item.currency_code })} {item.pricing_mode === "per_participant" ? "/ persona" : "/ unidad"}</option>)}</select></Field></div>
    <div className="grid gap-4 sm:grid-cols-2">
      {selectedOption && selectedOption.pricing_mode !== "per_participant" && (
        <Field label={selectedOption.pricing_mode === "per_resource" ? "Unidades / vehículos" : "Grupos"} required>
          <Input type="number" min={selectedOption.min_quantity} max={selectedOption.max_quantity} value={quantity} onChange={(event) => {
            const nextQuantity = Number(event.target.value)
            setQuantity(nextQuantity)
            const minPeople = selectedOption.min_participants_per_unit * nextQuantity
            const maxPeople = selectedOption.max_participants_per_unit * nextQuantity
            setParticipants((current) => Math.max(minPeople, Math.min(current, maxPeople)))
          }} required />
        </Field>
      )}
      <Field label={selectedOption?.pricing_mode === "per_participant" ? "Personas" : "Participantes"} required>
        <Input type="number"
          min={selectedOption?.pricing_mode === "per_participant" ? (selectedOption.min_quantity ?? 1) : (selectedOption?.min_participants_per_unit ?? 1) * quantity}
          max={selectedOption?.pricing_mode === "per_participant" ? Math.min(100, selectedOption.max_quantity ?? 100) : (selectedOption?.max_participants_per_unit ?? 100) * quantity}
          value={participants} onChange={(event) => {
            const value = Number(event.target.value)
            setParticipants(value)
            if (selectedOption?.pricing_mode === "per_participant") setQuantity(value)
          }} required />
      </Field>
    </div>
    {selectedOption && <p className="-mt-2 text-xs text-slate-500">Importe calculado: {((selectedOption.unit_price_minor * (selectedOption.pricing_mode === "per_participant" ? participants : quantity)) / 100).toLocaleString("es-ES", { style: "currency", currency: selectedOption.currency_code })}. Se registra la reserva, no se cobra ni concilia el pago externo.</p>}
    <div className="border-t border-slate-100 pt-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Datos del cliente</h3><div className="grid gap-4 sm:grid-cols-2"><Field label="Nombre completo" required><Input name="customerName" required minLength={2} maxLength={120} autoComplete="name" /></Field><Field label="Email" required><Input name="email" type="email" required maxLength={254} autoComplete="email" /></Field><Field label="Teléfono"><Input name="phone" type="tel" maxLength={40} autoComplete="tel" /></Field><Field label="Idioma"><select name="language" className={selectClass}><option value="es">Español</option><option value="en">English</option></select></Field></div><div className="mt-1 grid gap-4 sm:grid-cols-2"><Field label="Canal de venta" required><select name="channel" className={selectClass}><option value="phone">Teléfono</option><option value="whatsapp">WhatsApp</option><option value="in_person">Presencial</option><option value="email">Email</option><option value="partner">Colaborador / agencia</option><option value="other">Otro</option></select></Field><Field label="Referencia externa"><Input name="externalReference" maxLength={120} placeholder="Localizador o referencia del colaborador" /></Field></div><Field label="Notas internas (opcional)"><textarea name="specialRequests" maxLength={2000} rows={2} className={`${selectClass} h-auto py-2`} placeholder="Necesidades del cliente o información útil para el equipo" /></Field></div>
    <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs leading-5 text-sky-950">Quedará confirmada y ocupará plazas automáticamente. El pago se gestionó fuera del sistema; no se guardan datos de tarjeta ni se marca como cobrado.</div><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={saving || !selectedOption || !departureId} className="h-11 bg-teal-800 hover:bg-teal-900">{saving ? "Registrando…" : "Confirmar reserva externa"}</Button></div>
  </form>}</DialogContent></Dialog>
}

const selectClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 disabled:cursor-not-allowed disabled:bg-slate-50"
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <label className="mb-3 block text-sm font-medium text-slate-700">{label}{required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}<span className="mt-1.5 block">{children}</span></label> }

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof CalendarDays; label: string; value: number; detail?: string; tone: "teal" | "amber" | "slate" }) {
  const tones = { teal: "bg-teal-50 text-teal-800", amber: "bg-amber-50 text-amber-800", slate: "bg-slate-100 text-slate-700" }
  return <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>{detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}</div></div>
}

function Detail({ label, value, href }: { label: string; value: string; href?: string }) {
  return <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="text-slate-500">{label}</span>{href ? <a className="break-all text-right font-medium text-teal-800 hover:underline" href={href}>{value}</a> : <span className="text-right font-medium text-slate-900">{value}</span>}</div>
}
