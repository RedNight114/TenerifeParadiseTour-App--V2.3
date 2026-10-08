import { requireOrganizationRole } from "@/lib/supabase-server"
import { OrganizationMembersPanel } from "@/components/admin/organization-members-panel"

export default async function OrganizationMembersPage() {
  const { client, organizationId, membership, user } = await requireOrganizationRole(["owner", "admin"])
  const { data: members, error } = await client
    .from("organization_memberships")
    .select("id, user_id, email, role, status, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true })

  if (error) {
    return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">No se pudo cargar el equipo. Comprueba tu conexión e inténtalo de nuevo.</div>
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Configuración</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Equipo y permisos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Invita al equipo y concede únicamente el acceso que necesita cada persona.</p>
      </header>
      <OrganizationMembersPanel members={members ?? []} actorUserId={user.id} actorRole={membership.role} />
    </div>
  )
}
