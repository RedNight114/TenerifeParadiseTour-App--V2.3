import { requireOrganizationRole } from "@/lib/supabase-server"

const entityLabels: Record<string, string> = {
  organizations: "Perfil de empresa",
  organization_memberships: "Miembro",
  organization_domains: "Dominio",
  excursions: "Excursión",
  categories: "Categoría",
  bookings: "Reserva",
}

const bookingStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
}

export default async function OrganizationAuditPage() {
  const { client, organizationId } = await requireOrganizationRole(["owner", "admin"])
  const { data: events, error } = await client
    .from("organization_audit_events")
    .select("id, actor_user_id, action, entity, entity_id, before_data, after_data, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">No se pudo cargar la actividad. Comprueba tu conexión e inténtalo de nuevo.</div>

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Seguridad</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Registro de actividad</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Últimos 100 cambios de equipo, empresa, catálogo y estados de reservas. En las reservas solo se registran los estados anterior y nuevo; nunca sus datos personales.</p>
      </header>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100">
          {(events ?? []).map((event) => (
            <div key={event.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[12rem_8rem_1fr_10rem] sm:items-center">
              <time dateTime={event.created_at} className="text-sm tabular-nums text-slate-500">{new Date(event.created_at).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Atlantic/Canary" })}</time>
              <span className="text-sm font-medium text-slate-800">{event.action === "INSERT" ? "Creado" : event.action === "UPDATE" ? "Modificado" : "Eliminado"}</span>
              <span className="text-sm text-slate-700">
                {entityLabels[event.entity] ?? event.entity} · {event.entity_id}
                {event.entity === "bookings" && event.before_data?.status && event.after_data?.status
                  ? ` · ${bookingStatusLabels[event.before_data.status] ?? event.before_data.status} → ${bookingStatusLabels[event.after_data.status] ?? event.after_data.status}`
                  : ""}
              </span>
              <span className="truncate text-xs text-slate-500" title={event.actor_user_id ?? "Sistema"}>{event.actor_user_id ? `Usuario ${event.actor_user_id.slice(0, 8)}` : "Sistema"}</span>
            </div>
          ))}
          {!events?.length && <p className="p-6 text-sm text-slate-600">Aún no se han registrado cambios.</p>}
        </div>
      </div>
    </div>
  )
}
