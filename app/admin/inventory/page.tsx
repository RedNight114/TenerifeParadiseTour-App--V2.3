import { AlertTriangle, Boxes, CalendarClock, CircleCheck, Clock3, PackageOpen } from "lucide-react"
import { requireOrganizationRole } from "@/lib/supabase-server"
import { InventoryEditor } from "@/components/admin/inventory-editor"
import { EditDepartureDialog } from "@/components/admin/edit-departure-dialog"

type ResourceRow = {
  id: string
  name: string
  capacity_units: number
  max_party_size: number | null
  active: boolean
  inventory_resource_types: { name: string; unit_label: string; allocation_mode: "pool" | "asset" } | null
}

type DepartureRow = {
  id: string
  starts_at: string
  ends_at: string
  sales_cutoff_at: string
  status: string
  notes: string | null
  excursions: { name_es: string } | null
  departure_inventory: Array<{ resource_id: string; capacity_units: number; inventory_resources: { name: string } | null }>
}
type ResourceTypeRow = { id: string; name: string; unit_label: string; allocation_mode: "pool" | "asset" }
type ExcursionRow = { id: number; name_es: string; is_published: boolean }

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Atlantic/Canary",
})

function CapacityMode({ mode }: { mode: "pool" | "asset" }) {
  const label = mode === "asset" ? "Recurso asignable" : "Stock compartido"
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${mode === "asset" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}>{label}</span>
}

export default async function AdminInventoryPage() {
  const { client, organizationId } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const now = new Date().toISOString()
  const [resourcesResult, departuresResult, optionsResult, resourceTypesResult, excursionsResult] = await Promise.all([
    client.from("inventory_resources")
      .select("id, name, capacity_units, max_party_size, active, inventory_resource_types(name, unit_label, allocation_mode)")
      .eq("organization_id", organizationId).order("created_at", { ascending: false }),
    client.from("excursion_departures")
      .select("id, starts_at, ends_at, sales_cutoff_at, status, notes, excursions!excursion_departures_same_org_fk(name_es), departure_inventory(resource_id, capacity_units, inventory_resources(name))")
      .eq("organization_id", organizationId).gte("starts_at", now).order("starts_at").limit(30),
    client.from("product_options").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("active", true),
    client.from("inventory_resource_types").select("id, name, unit_label, allocation_mode").eq("organization_id", organizationId).order("name"),
    client.from("excursions").select("id, name_es, is_published").eq("organization_id", organizationId).order("name_es"),
  ])
  const resources = (resourcesResult.data ?? []) as unknown as ResourceRow[]
  const departures = (departuresResult.data ?? []) as unknown as DepartureRow[]
  const optionsCount = optionsResult.count ?? 0
  const activeResources = resources.filter((resource) => resource.active).length
  const scheduledDepartures = departures.filter((departure) => departure.status === "scheduled").length
  const hasError = resourcesResult.error || departuresResult.error || optionsResult.error || resourceTypesResult.error || excursionsResult.error
  const resourceTypes = (resourceTypesResult.data ?? []) as ResourceTypeRow[]
  const excursions = (excursionsResult.data ?? []) as ExcursionRow[]

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Operaciones</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Inventario y salidas</h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">Centraliza plazas, grupos, vehículos y otros recursos que limitan cada reserva.</p>
        </div>
      </header>

      {hasError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">No se pudo cargar toda la configuración del inventario. Comprueba las migraciones locales y vuelve a cargar.</div>}

      <section aria-label="Resumen de inventario" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Boxes} label="Recursos activos" value={activeResources} detail="Unidades y activos operativos" />
        <Metric icon={CalendarClock} label="Salidas próximas" value={scheduledDepartures} detail="En las 30 próximas fechas cargadas" />
        <Metric icon={PackageOpen} label="Opciones vendibles" value={optionsCount} detail="Tarifas configuradas en catálogo" />
        <Metric icon={CircleCheck} label="Tipos de capacidad" value={new Set(resources.map((resource) => resource.inventory_resource_types?.allocation_mode).filter(Boolean)).size} detail="Stock agregado y recursos asignables" />
      </section>

      <section aria-labelledby="inventory-guide" className="rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-6">
        <div className="flex items-start gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-800"><PackageOpen className="h-4 w-4" /></span><div><h2 id="inventory-guide" className="font-semibold text-sky-950">Cómo se relacionan las opciones, los recursos y las salidas</h2><p className="mt-1 max-w-4xl text-sm leading-6 text-sky-900">Una opción define qué se vende y su precio; un recurso limita cuántas unidades caben; una salida concreta une una excursión, una fecha y la capacidad vendible.</p></div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <GuideStep number="1" title="Define la capacidad" text="Usa stock compartido para plazas o grupos; usa recursos asignables cuando no se pueda ocupar el mismo vehículo o equipo en dos salidas a la vez." />
          <GuideStep number="2" title="Configura qué compra el cliente" text="Asocia cada tarifa con el recurso que consume: por persona, grupo, vehículo o una combinación. No asignes capacidad si la opción no debe consumir inventario." />
          <GuideStep number="3" title="Programa una salida" text="Indica hora, cierre de ventas y unidades disponibles. Revisa reservas antes de reducir capacidad; el sistema protege las plazas ya reservadas." />
        </div>
        <p className="mt-3 text-xs leading-5 text-sky-900">Las fechas se muestran en la zona horaria de Canarias. El pago en Checkout puede retener capacidad durante 30 minutos; las reservas pendientes de pago no son plazas confirmadas.</p>
      </section>

      <InventoryEditor resourceTypes={resourceTypes} resources={resources} excursions={excursions} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">Próximas salidas</h2>
          <p className="text-sm text-slate-500">Cada salida combina una fecha con los recursos concretos que se pueden vender.</p>
        </div>
        {departures.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Todavía no hay salidas programadas" body="Primero configura opciones de venta e inventario para una excursión; después podrás asignar esos recursos a fechas concretas." />
        ) : (
          <div className="divide-y divide-slate-100">
            {departures.map((departure) => (
              <article key={departure.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{departure.excursions?.name_es ?? "Excursión"}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${departure.status === "scheduled" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{departure.status === "scheduled" ? "Programada" : departure.status}</span></div>
                  <p className="mt-1 text-sm text-slate-600">{dateFormatter.format(new Date(departure.starts_at))} · cierre de ventas {dateFormatter.format(new Date(departure.sales_cutoff_at))}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{departure.departure_inventory.map((assignment, index) => <span key={`${departure.id}-${index}`} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{assignment.inventory_resources?.name ?? "Recurso"} · {assignment.capacity_units} ud.</span>)}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="text-xs text-slate-400">{departure.departure_inventory.length} recurso{departure.departure_inventory.length === 1 ? "" : "s"}</span>
                  {departure.status === "scheduled" && new Date(departure.starts_at) > new Date() && <EditDepartureDialog departure={departure} resources={resources} />}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">Recursos de la empresa</h2>
          <p className="text-sm text-slate-500">El stock compartido limita cantidades; los activos evitan asignar el mismo vehículo o equipo a la vez.</p>
        </div>
        {resources.length === 0 ? (
          <EmptyState icon={Boxes} title="Aún no hay recursos de inventario" body="Puedes modelar plazas de autobús, guías, vehículos, kayaks, equipos u otros límites operativos." />
        ) : (
          <>
          <div className="grid gap-3 p-4 sm:grid-cols-2 md:hidden">{resources.map((resource) => <article key={resource.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold text-slate-900">{resource.name}</h3><p className="mt-1 text-sm text-slate-600">{resource.inventory_resource_types?.name}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${resource.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{resource.active ? "Activo" : "Inactivo"}</span></div><div className="mt-3 flex flex-wrap items-center gap-2"><CapacityMode mode={resource.inventory_resource_types?.allocation_mode ?? "pool"} /><span className="text-xs text-slate-600">{resource.capacity_units} {resource.inventory_resource_types?.unit_label ?? "unidades"}</span></div><p className="mt-2 text-xs text-slate-500">Límite por grupo: {resource.max_party_size ?? "sin límite"}</p></article>)}</div>
          <div role="region" aria-label="Tabla de recursos de inventario" tabIndex={0} className="hidden overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-700 md:block">
            <table className="w-full min-w-[660px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3">Recurso</th><th className="px-6 py-3">Tipo</th><th className="px-6 py-3">Capacidad</th><th className="px-6 py-3">Límite de grupo</th><th className="px-6 py-3">Estado</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{resources.map((resource) => <tr key={resource.id} className="text-sm"><td className="px-6 py-4 font-medium text-slate-900">{resource.name}</td><td className="px-6 py-4"><CapacityMode mode={resource.inventory_resource_types?.allocation_mode ?? "pool"} /><span className="ml-2 text-slate-500">{resource.inventory_resource_types?.name}</span></td><td className="px-6 py-4 tabular-nums text-slate-700">{resource.capacity_units} {resource.inventory_resource_types?.unit_label ?? "unidades"}</td><td className="px-6 py-4 text-slate-700">{resource.max_party_size ?? "Sin límite por grupo"}</td><td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-medium ${resource.active ? "text-emerald-700" : "text-slate-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${resource.active ? "bg-emerald-500" : "bg-slate-400"}`} />{resource.active ? "Activo" : "Inactivo"}</span></td></tr>)}</tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {departuresResult.error && <p className="flex items-center gap-2 text-sm text-amber-800"><AlertTriangle className="h-4 w-4" />No se han podido consultar todas las salidas.</p>}
      <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />Las reservas de checkout retienen inventario durante 30 minutos, alineadas con el pago alojado. Las solicitudes antiguas por WhatsApp no consumen este inventario.</p>
    </div>
  )
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Boxes; label: string; value: number; detail: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-600">{label}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><Icon className="h-4 w-4" aria-hidden="true" /></span></div><p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></article>
}

function EmptyState({ icon: Icon, title, body }: { icon: typeof Boxes; title: string; body: string }) {
  return <div className="px-6 py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><Icon className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-4 font-semibold text-slate-900">{title}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{body}</p></div>
}

function GuideStep({ number, title, text }: { number: string; title: string; text: string }) {
  return <article className="rounded-xl border border-sky-100 bg-white/80 p-4"><div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-900">{number}</span><h3 className="text-sm font-semibold text-slate-900">{title}</h3></div><p className="mt-2 text-xs leading-5 text-slate-600">{text}</p></article>
}
