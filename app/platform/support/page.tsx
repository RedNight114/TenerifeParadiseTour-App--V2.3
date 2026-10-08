import { PlatformSupportManager } from "@/components/admin/platform-support-manager"
import { requirePlatformAdmin } from "@/lib/supabase-server"

export default async function PlatformSupportPage() {
  const { client } = await requirePlatformAdmin()
  const [{ data: tickets }, { data: organizations }, { data: grants }] = await Promise.all([
    client.from("support_tickets").select("id, organization_id, subject, category, status, priority, last_message_at, organizations(name)").order("last_message_at", { ascending: false }).limit(100),
    client.from("organizations").select("id, name").order("name"),
    client.from("platform_support_access_grants").select("id, organization_id, reason, expires_at, revoked_at, organizations(name)").order("created_at", { ascending: false }).limit(50),
  ])
  const ticketIds = (tickets ?? []).map((ticket) => ticket.id)
  const { data: messages } = ticketIds.length ? await client.from("support_ticket_messages").select("id, ticket_id, author_kind, body, created_at").in("ticket_id", ticketIds).order("created_at") : { data: [] }
  return <div className="space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">QuickAgency</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Soporte</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Responde a las empresas y gestiona accesos temporales de soporte con motivo y caducidad.</p></header><PlatformSupportManager tickets={(tickets ?? []) as never} messages={(messages ?? []) as never} grants={(grants ?? []) as never} organizations={(organizations ?? []) as never} /></div>
}
