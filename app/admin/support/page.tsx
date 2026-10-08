import { requireOrganizationRole } from "@/lib/supabase-server"
import { SupportCenter } from "@/components/admin/support-center"

export default async function CompanySupportPage() {
  const { client, organizationId } = await requireOrganizationRole(["owner", "admin", "booking_manager"])
  const { data: tickets, error } = await client.from("support_tickets")
    .select("id, subject, category, status, priority, created_at, last_message_at")
    .eq("organization_id", organizationId).order("last_message_at", { ascending: false })
  if (error) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">No se pudo cargar el soporte.</div>
  const ids = (tickets ?? []).map((ticket) => ticket.id)
  const { data: messages } = ids.length ? await client.from("support_ticket_messages")
    .select("id, ticket_id, author_kind, body, created_at").in("ticket_id", ids).order("created_at") : { data: [] }

  return <div className="space-y-6"><header><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Ayuda</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950">Soporte QuickAgency</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Crea una solicitud y sigue la conversación desde este panel.</p></header><SupportCenter tickets={tickets ?? []} messages={messages ?? []} /></div>
}
