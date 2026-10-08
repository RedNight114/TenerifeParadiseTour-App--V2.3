import Link from "next/link"
import { ArrowRight, CalendarCheck2, CalendarDays, CreditCard, MapPinned, PackageOpen, Timer } from "lucide-react"
import { requireOrganizationAccess } from "@/lib/supabase-server"

type Metrics = { bookings_total: number; bookings_last_30_days: number; bookings_pending: number; bookings_confirmed_this_month: number; bookings_cancelled_last_30_days: number; published_excursions: number; upcoming_departures: number; payments_received_30_days_minor: number | null; currency_code: string }
type RecentBooking = { id: number; public_reference: string; status: string; preferred_date: string; number_of_people: number; created_at: string; excursions: { name_es: string; name_en: string } | { name_es: string; name_en: string }[] | null }

const cardStyle = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"

function MetricCard({ title, value, note, icon: Icon }: { title: string; value: string | number; note: string; icon: typeof CalendarDays }) {
  return <article className={cardStyle}><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-slate-600">{title}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><Icon className="h-4 w-4" /></span></div><p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums text-slate-950">{value}</p><p className="mt-1 text-xs leading-5 text-slate-500">{note}</p></article>
}

export default async function OrganizationDashboardPage() {
  const { client, organizationId, membership } = await requireOrganizationAccess()
  const [{ data: metricsData, error: metricsError }, { data: recentData, error: recentError }] = await Promise.all([
    client.rpc("get_organization_dashboard_metrics"),
    client.from("bookings").select("id, public_reference, status, preferred_date, number_of_people, created_at, excursions!bookings_excursion_same_org_fk(name_es, name_en)").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(6),
  ])
  const metrics = (metricsData ?? {}) as Metrics
  const recent = (recentData ?? []) as unknown as RecentBooking[]
  const role = membership.role
  const canManageCatalog = ["owner", "admin", "catalog_manager"].includes(role)
  const canManageBookings = ["owner", "admin", "booking_manager"].includes(role)
  const paymentTotal = metrics.payments_received_30_days_minor === null || metricsError
    ? "—"
    : new Intl.NumberFormat("es-ES", { style: "currency", currency: metrics.currency_code || "EUR", maximumFractionDigits: 0 }).format(metrics.payments_received_30_days_minor / 100)

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Panel de empresa</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Resumen de actividad</h1><p className="mt-2 text-sm text-slate-600">Reservas, cobros procesados y próximas salidas de tu empresa.</p></div><div className="flex flex-wrap gap-2">{canManageBookings && <Link href="/admin/bookings" className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-800 px-4 text-sm font-semibold text-white hover:bg-teal-900">Abrir reservas <ArrowRight className="h-4 w-4" /></Link>}{canManageCatalog && <Link href="/admin/inventory" className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><PackageOpen className="h-4 w-4" />Gestionar salidas</Link>}</div></header>

    {metricsError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">No se pudieron cargar las métricas. Comprueba la conexión con Supabase y que la migración de métricas esté aplicada.</p>}
    <section aria-label="Indicadores de empresa" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Reservas (30 días)" value={metricsError ? "—" : metrics.bookings_last_30_days ?? 0} note={`${metrics.bookings_total ?? 0} reservas en total`} icon={CalendarDays} />
      <MetricCard title="Pendientes" value={metricsError ? "—" : metrics.bookings_pending ?? 0} note={`${metrics.bookings_confirmed_this_month ?? 0} confirmadas este mes`} icon={Timer} />
      <MetricCard title="Cobros Stripe (30 días)" value={paymentTotal} note="Solo pagos online completados; no incluye efectivo ni transferencias." icon={CreditCard} />
      <MetricCard title="Próximas salidas" value={metricsError ? "—" : metrics.upcoming_departures ?? 0} note={`${metrics.published_excursions ?? 0} excursiones publicadas`} icon={MapPinned} />
    </section>

    <section aria-labelledby="dashboard-next" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><Timer className="h-4 w-4" /></span><div><h2 id="dashboard-next" className="font-semibold text-slate-950">Lectura rápida del negocio</h2><p className="mt-1 text-sm leading-6 text-slate-600">Las cifras ayudan a priorizar el trabajo de hoy; los pagos online son solo una parte de los ingresos.</p></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pendientes de atención</p><p className="mt-1 text-sm leading-5 text-slate-700">{metricsError ? "No disponible hasta recuperar las métricas." : (metrics.bookings_pending ?? 0) > 0 ? `Hay ${metrics.bookings_pending} reserva${metrics.bookings_pending === 1 ? "" : "s"} pendiente${metrics.bookings_pending === 1 ? "" : "s"}; revisa los detalles y confirma si corresponde.` : "No hay reservas pendientes en este momento."}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cobros mostrados</p><p className="mt-1 text-sm leading-5 text-slate-700">Stripe completado en los últimos 30 días. No incluye otros medios, importes reembolsados ni previsiones.</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Próxima acción</p><p className="mt-1 text-sm leading-5 text-slate-700">{(metrics.upcoming_departures ?? 0) === 0 ? "Programa salidas para que los clientes puedan elegir fecha y disponibilidad." : "Revisa capacidad y cierres de venta antes de las próximas salidas."}</p></div>
      </div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-950">Reservas recientes</h2><p className="mt-1 text-xs text-slate-500">Las más nuevas recibidas por la web.</p></div>{canManageBookings && <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800">Ver todas <ArrowRight className="h-4 w-4" /></Link>}</div>{recentError ? <p role="alert" className="p-5 text-sm text-rose-800">No se pudieron cargar las reservas recientes.</p> : recent.length ? <div className="divide-y divide-slate-100">{recent.map((booking) => { const excursion = Array.isArray(booking.excursions) ? booking.excursions[0] : booking.excursions; return <article key={booking.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="truncate font-medium text-slate-900">{excursion?.name_es || "Excursión"}</p><p className="mt-1 text-xs text-slate-500">Reserva ···{booking.public_reference.slice(-6)} · {booking.number_of_people} personas</p></div><div className="flex items-center gap-3"><span className="text-sm text-slate-600">{new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(`${booking.preferred_date}T12:00:00`))}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{booking.status === "confirmed" ? "Confirmada" : booking.status === "cancelled" ? "Cancelada" : booking.status === "expired" ? "Vencida" : booking.status === "completed" ? "Completada" : "Pendiente"}</span></div></article> })}</div> : <div className="px-5 py-10 text-center"><CalendarCheck2 className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 font-medium text-slate-800">Todavía no hay reservas</p><p className="mt-1 text-sm text-slate-500">Cuando un cliente reserve una de tus excursiones, aparecerá aquí.</p></div>}</section>

    <p className="text-xs leading-5 text-slate-500">Las métricas reflejan los registros actuales del sistema. Los cobros contabilizan únicamente intentos Stripe completados; no equivalen a la facturación total de la empresa si también recibe pagos fuera de la plataforma.</p>
  </div>
}
