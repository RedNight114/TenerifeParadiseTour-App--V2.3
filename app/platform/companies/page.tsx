import { PlatformCompaniesManager } from "@/components/admin/platform-companies-manager"
import { requirePlatformAdmin } from "@/lib/supabase-server"

type OwnerStatus = { organization_id: string; has_active_owner: boolean }

export default async function PlatformCompaniesPage() {
  const { client } = await requirePlatformAdmin()
  const [{ data: organizations, error: organizationsError }, { data: domains, error: domainsError }, { data: plans, error: plansError }] = await Promise.all([
    client.from("organizations").select("id, name, slug, status, platform_plan_id, platform_plan_status, created_at").order("created_at", { ascending: false }),
    client.from("organization_domains").select("id, organization_id, host, is_primary, verified_at, verification_token, hosting_status, hosting_checked_at, hosting_details").order("created_at"),
    client.from("platform_plans").select("id, code, name, active, max_excursions, max_members").order("name"),
  ])
  const organizationIds = (organizations ?? []).map((organization) => organization.id)
  const { data: ownerStatus, error: ownerStatusError } = organizationIds.length
    ? await client.rpc("get_platform_active_owner_status", { p_organization_ids: organizationIds })
    : { data: [], error: null }
  const activeOwners = new Map(((ownerStatus ?? []) as OwnerStatus[]).map((item) => [item.organization_id, item.has_active_owner]))
  const organizationsWithOwnerStatus = (organizations ?? []).map((organization) => ({ ...organization, has_active_owner: activeOwners.get(organization.id) ?? false }))
  const loadError = organizationsError || domainsError || plansError || ownerStatusError
  return <div className="space-y-6">
    <header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">QuickAgency</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Empresas</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Alta, dominios verificados, asignación inicial de propietarios, estado del servicio y límites manuales. La baja es reversible; esta consola no elimina empresas.</p></header>
    {loadError ? <section role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-900"><h2 className="font-semibold">No se pudo cargar la gestión de empresas</h2><p className="mt-1">Comprueba la conexión con Supabase y que las migraciones del panel QuickAgency estén aplicadas. No se mostrarán listas vacías como si no hubiera empresas.</p></section> : <PlatformCompaniesManager organizations={organizationsWithOwnerStatus as never} domains={(domains ?? []) as never} plans={(plans ?? []) as never} vercelIntegrationReady={Boolean(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID && process.env.VERCEL_TEAM_ID)} />}
  </div>
}
