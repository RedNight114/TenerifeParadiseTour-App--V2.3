"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Copy, ExternalLink, Plus, Search, Send, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { checkPlatformDomainOnVercel, connectPlatformDomainToVercel, createPlatformDomain, createPlatformOrganization, invitePlatformOwner, setPlatformPrimaryDomain, updatePlatformOrganization, verifyPlatformDomain } from "@/lib/platform-actions"

type Organization = { id: string; name: string; slug: string; status: string; platform_plan_id: string | null; platform_plan_status: string; created_at: string; has_active_owner: boolean }
type HostingStatus = "not_connected" | "pending_verification" | "pending_dns" | "verified" | "error"
type HostingDetails = { apexName?: string; verified?: boolean; misconfigured?: boolean; configuredBy?: string | null; verification?: Array<{ type: string; domain: string; value: string; reason?: string }>; recommendedIPv4?: string[]; recommendedCNAME?: string[]; message?: string }
type Domain = { id: string; organization_id: string; host: string; is_primary: boolean; verified_at: string | null; verification_token: string; hosting_status?: HostingStatus; hosting_checked_at?: string | null; hosting_details?: HostingDetails }
type Plan = { id: string; code: string; name: string; active: boolean; max_excursions: number | null; max_members: number | null }

const organizationStatusLabels: Record<string, string> = { pending: "Pendiente", active: "Activa", suspended: "Suspendida" }
const planStatusLabels: Record<string, string> = { trial: "Prueba manual", active: "Activo manual", past_due: "Revisión manual", suspended: "Suspendido", cancelled: "Cancelado" }
const hostingStatusLabels: Record<HostingStatus, string> = { not_connected: "Sin conectar a Vercel", pending_verification: "Pendiente de verificación Vercel", pending_dns: "Pendiente de DNS / HTTPS", verified: "Vercel, DNS y HTTPS listos", error: "Error de conexión" }

export function PlatformCompaniesManager({ organizations, domains, plans, vercelIntegrationReady }: { organizations: Organization[]; domains: Domain[]; plans: Plan[]; vercelIntegrationReady: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [createValues, setCreateValues] = useState({ name: "", slug: "", domain: "" })
  const [domainValues, setDomainValues] = useState<Record<string, string>>({})
  const [ownerEmails, setOwnerEmails] = useState<Record<string, string>>({})
  const [companyQuery, setCompanyQuery] = useState("")
  const [companyStatusFilter, setCompanyStatusFilter] = useState("all")
  const [organizationSettings, setOrganizationSettings] = useState<Record<string, { status: string; planId: string; planStatus: string }>>(() => Object.fromEntries(organizations.map((organization) => [organization.id, { status: organization.status, planId: organization.platform_plan_id ?? "", planStatus: organization.platform_plan_status }])))
  const [message, setMessage] = useState("")
  const [hostingState, setHostingState] = useState<Record<string, { status: HostingStatus; details: HostingDetails }>>(() => Object.fromEntries(domains.map((domain) => [domain.id, { status: domain.hosting_status ?? "not_connected", details: domain.hosting_details ?? {} }])))
  const statusCounts = { all: organizations.length, active: organizations.filter((item) => item.status === "active").length, pending: organizations.filter((item) => item.status === "pending").length, suspended: organizations.filter((item) => item.status === "suspended").length }
  const visibleOrganizations = organizations.filter((organization) => {
    const query = companyQuery.trim().toLocaleLowerCase()
    const matchesStatus = companyStatusFilter === "all" || organization.status === companyStatusFilter
    const matchesQuery = !query || `${organization.name} ${organization.slug} ${domains.filter((domain) => domain.organization_id === organization.id).map((domain) => domain.host).join(" ")}`.toLocaleLowerCase().includes(query)
    return matchesStatus && matchesQuery
  })

  function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("")
    startTransition(async () => {
      const result = await createPlatformOrganization(createValues.name, createValues.slug, createValues.domain)
      setMessage(result.success ? "Empresa creada como pendiente. Ya puedes invitar a su propietario; el dominio se conectará después." : result.error)
      if (result.success) { setCreateValues({ name: "", slug: "", domain: "" }); router.refresh() }
    })
  }

  function saveOrganization(organizationId: string) {
    const current = organizationSettings[organizationId]
    if (!current) return
    startTransition(async () => {
      const result = await updatePlatformOrganization(organizationId, current.status, current.planId, current.planStatus)
      setMessage(result.success ? "Cambios de empresa guardados." : result.error)
      if (result.success) router.refresh()
    })
  }

  function addDomain(organizationId: string) {
    startTransition(async () => {
      const result = await createPlatformDomain(organizationId, domainValues[organizationId] ?? "")
      setMessage(result.success ? "Dominio añadido; configura el TXT para verificarlo." : result.error)
      if (result.success) { setDomainValues((current) => ({ ...current, [organizationId]: "" })); router.refresh() }
    })
  }

  function verify(domain: Domain) {
    startTransition(async () => {
      const result = await verifyPlatformDomain(domain.id)
      setMessage(result.message ?? result.error ?? "No se pudo verificar el dominio.")
      if (result.success) router.refresh()
    })
  }

  function makePrimary(domainId: string) {
    startTransition(async () => {
      const result = await setPlatformPrimaryDomain(domainId)
      setMessage(result.success ? "Dominio principal actualizado." : result.error)
      router.refresh()
    })
  }

  function syncDomainHosting(domain: Domain, connect: boolean) {
    startTransition(async () => {
      setMessage("")
      const result = connect ? await connectPlatformDomainToVercel(domain.id) : await checkPlatformDomainOnVercel(domain.id)
      if (!result.success) { setMessage(result.error); router.refresh(); return }
      setHostingState((current) => ({ ...current, [domain.id]: { status: result.status, details: result.details } }))
      const label = hostingStatusLabels[result.status]
      setMessage(`${domain.host}: ${label}. ${result.ownershipVerified ? "TXT de QuickAgency verificado." : `Añade también el TXT ${result.ownershipTxt.name}.`}`)
      router.refresh()
    })
  }

  function inviteOwner(organizationId: string) {
    startTransition(async () => {
      const result = await invitePlatformOwner(organizationId, ownerEmails[organizationId] ?? "")
      setMessage(result.message ?? result.error ?? "No se pudo asignar al propietario.")
      if (result.success) { setOwnerEmails((current) => ({ ...current, [organizationId]: "" })); router.refresh() }
    })
  }

  return <div className="space-y-6">
    {!vercelIntegrationReady && <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><h2 className="font-semibold">Falta conectar este panel con Vercel</h2><p className="mt-1">Configura <code>VERCEL_API_TOKEN</code>, <code>VERCEL_PROJECT_ID</code> y <code>VERCEL_TEAM_ID</code> como variables privadas del servidor. Usa el proyecto QuickAgency que servirá todas las webs de las empresas; no se necesita un proyecto por dominio.</p></section>}
    <form onSubmit={create} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1.1fr_0.8fr_1fr_auto] md:items-end">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Alta controlada</p><label htmlFor="company-name" className="mt-2 block text-sm font-medium">Nombre comercial</label><Input id="company-name" required minLength={2} maxLength={120} value={createValues.name} onChange={(event) => setCreateValues((current) => ({ ...current, name: event.target.value, slug: current.slug || event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }))} /></div>
      <div><label htmlFor="company-slug" className="text-sm font-medium">Slug</label><Input id="company-slug" required value={createValues.slug} onChange={(event) => setCreateValues((current) => ({ ...current, slug: event.target.value }))} /></div>
      <div><label htmlFor="company-domain" className="text-sm font-medium">Dominio propio <span className="font-normal text-slate-500">(opcional)</span></label><Input id="company-domain" placeholder="excursiones.ejemplo.com" value={createValues.domain} onChange={(event) => setCreateValues((current) => ({ ...current, domain: event.target.value }))} /><span className="mt-1 block text-xs leading-5 text-slate-500">Escribe solo el dominio, sin https:// ni ruta. Puedes añadirlo más adelante.</span></div>
      <Button type="submit" disabled={pending} className="bg-teal-800 text-white hover:bg-teal-900"><Plus className="mr-2 h-4 w-4" />Crear empresa</Button>
      {message && <p role="status" className="text-sm text-slate-600 md:col-span-4">{message}</p>}
    </form>

    <section aria-label="Filtros de empresas" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input aria-label="Buscar empresa o dominio" placeholder="Buscar por empresa, slug o dominio" value={companyQuery} onChange={(event) => setCompanyQuery(event.target.value)} className="h-11 rounded-lg pl-9" /></div>
      <div className="flex flex-wrap gap-2">{(["all", "active", "pending", "suspended"] as const).map((status) => <button key={status} type="button" aria-pressed={companyStatusFilter === status} onClick={() => setCompanyStatusFilter(status)} className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors ${companyStatusFilter === status ? "border-teal-800 bg-teal-800 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>{({ all: "Todas", active: "Activas", pending: "Pendientes", suspended: "Suspendidas" } as const)[status]} <span className="ml-1 tabular-nums opacity-80">{statusCounts[status]}</span></button>)}</div>
      <p className="text-xs text-slate-500">Mostrando {visibleOrganizations.length} de {organizations.length} empresas</p>
    </section>

    {visibleOrganizations.map((organization) => {
      const settings = organizationSettings[organization.id] ?? { status: organization.status, planId: organization.platform_plan_id ?? "", planStatus: organization.platform_plan_status }
      const companyDomains = domains.filter((domain) => domain.organization_id === organization.id)
      return <article id={`organization-${organization.id}`} key={organization.id} tabIndex={-1} className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm outline-none target:ring-2 target:ring-teal-600 target:ring-offset-2">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Empresa</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{organization.name}</h2><p className="mt-1 text-xs text-slate-500">Slug <code>{organization.slug}</code> · alta {new Date(organization.created_at).toLocaleDateString("es-ES")}</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700">{companyDomains.length} dominio{companyDomains.length === 1 ? "" : "s"}</span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700">{organization.has_active_owner ? "Propietario asignado" : "Sin propietario"}</span><span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800">{organizationStatusLabels[organization.status] ?? organization.status}</span><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800">Plan · {planStatusLabels[organization.platform_plan_status] ?? organization.platform_plan_status}</span></div></header>
        <div className="grid gap-5 p-5 xl:grid-cols-[0.8fr_1.2fr]">
          <div id={`organization-${organization.id}-access`} tabIndex={-1} className="scroll-mt-6 space-y-4 rounded-xl bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-teal-600">
            <h3 className="font-semibold">Plan y acceso</h3>
            <label className="block space-y-1 text-sm">Estado de la empresa<select value={settings.status} onChange={(event) => setOrganizationSettings((current) => ({ ...current, [organization.id]: { ...settings, status: event.target.value } }))} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3">{Object.entries(organizationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label id={`organization-${organization.id}-plan`} tabIndex={-1} className="block scroll-mt-6 space-y-1 text-sm outline-none focus:ring-2 focus:ring-teal-600">Plan manual<select required value={settings.planId} onChange={(event) => setOrganizationSettings((current) => ({ ...current, [organization.id]: { ...settings, planId: event.target.value } }))} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3">{plans.filter((plan) => plan.active || settings.planId === plan.id).map((plan) => <option key={plan.id} value={plan.id}>{plan.name}{plan.active ? "" : " (archivado, ya asignado)"} · {plan.max_excursions ?? "∞"} excursiones · {plan.max_members ?? "∞"} miembros</option>)}</select><span className="block text-xs text-slate-500">El plan Piloto sin límites no activa cobros de suscripción.</span></label>
            <label className="block space-y-1 text-sm">Estado del plan (manual, sin cobro automático)<select value={settings.planStatus} onChange={(event) => setOrganizationSettings((current) => ({ ...current, [organization.id]: { ...settings, planStatus: event.target.value } }))} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3">{Object.entries(planStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <Button type="button" variant="outline" className="w-full" disabled={pending} onClick={() => saveOrganization(organization.id)}>Guardar empresa</Button>
            <div id={`organization-${organization.id}-owner`} tabIndex={-1} className="scroll-mt-6 border-t border-slate-200 pt-4 outline-none focus:ring-2 focus:ring-teal-600">{organization.has_active_owner ? <><h4 className="text-sm font-medium">Propietario asignado</h4><p className="mt-1 text-xs leading-5 text-slate-600">Ya hay un propietario activo. Para transferir la propiedad, debe hacerlo desde la gestión del equipo de la empresa.</p></> : <><label className="block space-y-1 text-sm">Propietario inicial<Input type="email" placeholder="propietario@empresa.com" value={ownerEmails[organization.id] ?? ""} onChange={(event) => setOwnerEmails((current) => ({ ...current, [organization.id]: event.target.value }))} /></label><Button type="button" size="sm" variant="outline" className="mt-2" disabled={pending} onClick={() => inviteOwner(organization.id)}><Send className="mr-2 h-4 w-4" />Asignar / invitar propietario</Button><p className="mt-2 text-xs text-slate-500">El acceso se activa al aceptar la invitación en QuickAgency. Se necesita SMTP de Supabase Auth configurado para enviar el correo.</p></>}</div>
          </div>

          <div id={`organization-${organization.id}-domains`} tabIndex={-1} className="scroll-mt-6 space-y-4 rounded-xl outline-none focus:ring-2 focus:ring-teal-600">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">Dominios y landing pública</h3><p className="text-xs leading-5 text-slate-500">La puesta en marcha tiene dos comprobaciones: propiedad del dominio en QuickAgency y conexión real a Vercel (DNS + HTTPS). Solo cuando ambas estén listas podrás usarlo como principal.</p></div></div>
            {companyDomains.map((domain) => <div key={domain.id} className="rounded-xl border border-slate-200 p-4">
              {(() => {
                const state = hostingState[domain.id] ?? { status: domain.hosting_status ?? "not_connected", details: domain.hosting_details ?? {} }
                const canBePrimary = domain.verified_at && state.status === "verified"
                const apexName = state.details.apexName
                const hostLabel = apexName ? domain.host === apexName ? "@" : domain.host.slice(0, -(apexName.length + 1)) : domain.host
                return <>
                  <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{domain.host}</p>{domain.verified_at ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" />Propiedad QuickAgency verificada</span> : <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800">Pendiente de TXT</span>}{domain.is_primary && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-800">Principal</span>}</div><div className="flex flex-wrap gap-2">{!domain.verified_at && <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => verify(domain)}><ShieldCheck className="mr-2 h-4 w-4" />Verificar TXT</Button>}{vercelIntegrationReady && <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => syncDomainHosting(domain, state.status === "not_connected" || state.status === "error")}><ExternalLink className="mr-2 h-4 w-4" />{state.status === "not_connected" || state.status === "error" ? "Conectar a Vercel" : "Comprobar DNS / HTTPS"}</Button>}{domain.verified_at && !domain.is_primary && <Button type="button" size="sm" variant="outline" disabled={pending || !canBePrimary} title={!canBePrimary ? "Conecta el dominio a Vercel y comprueba DNS/HTTPS antes de hacerlo principal." : undefined} onClick={() => makePrimary(domain.id)}>Hacer principal</Button>}</div></div>
                  <p className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${state.status === "verified" ? "bg-emerald-50 text-emerald-800" : state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-slate-50 text-slate-700"}`}>Hosting: {hostingStatusLabels[state.status]}{domain.hosting_checked_at ? ` · última comprobación ${new Date(domain.hosting_checked_at).toLocaleString("es-ES")}` : " · aún no comprobado"}</p>
                  {(state.details.verification?.length || state.details.recommendedIPv4?.length || state.details.recommendedCNAME?.length) ? <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                    <p className="font-semibold text-slate-900">Registros DNS que solicita Vercel</p>
                    {state.details.verification?.map((record, index) => <p key={`verify-${index}`} className="break-all"><span className="font-semibold">{record.type} · {record.domain}:</span> <code>{record.value}</code></p>)}
                    {state.details.recommendedIPv4?.map((value, index) => <p key={`a-${index}`} className="break-all"><span className="font-semibold">A · {hostLabel}:</span> <code>{value}</code></p>)}
                    {state.details.recommendedCNAME?.map((value, index) => <p key={`cname-${index}`} className="break-all"><span className="font-semibold">CNAME · {hostLabel}:</span> <code>{value}</code></p>)}
                    {!domain.verified_at && <p className="border-t border-slate-200 pt-2">Añade también el TXT de QuickAgency que aparece abajo; son verificaciones distintas.</p>}
                    <p className="border-t border-slate-200 pt-2">No borres registros de correo (MX) ni otros TXT. Tras guardar los DNS, espera la propagación y pulsa «Comprobar DNS / HTTPS».</p>
                  </div> : null}
                  {!domain.verified_at && <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs"><p className="font-medium text-slate-700">TXT de propiedad de QuickAgency</p><p className="mt-1 break-all"><code>_quickagency-verification.{domain.host}</code></p><div className="mt-1 flex items-center justify-between gap-2"><code className="break-all text-slate-600">{domain.verification_token}</code><button type="button" title="Copiar token" aria-label="Copiar token" onClick={() => navigator.clipboard.writeText(domain.verification_token)}><Copy className="h-4 w-4" /></button></div><p className="mt-2 text-slate-600">Este TXT acredita la propiedad ante QuickAgency. No sustituye los registros DNS que solicita Vercel.</p></div>}
                </>
              })()}
            </div>)}
            <div className="flex gap-2"><Input aria-label="Añadir otro dominio" placeholder="otro-dominio.ejemplo.com" value={domainValues[organization.id] ?? ""} onChange={(event) => setDomainValues((current) => ({ ...current, [organization.id]: event.target.value }))} /><Button type="button" variant="outline" disabled={pending} onClick={() => addDomain(organization.id)}>Añadir dominio</Button></div>
          </div>
        </div>
      </article>
    })}
    {!visibleOrganizations.length && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{organizations.length ? "No hay empresas con esos filtros." : "No hay empresas en la plataforma."}</div>}
  </div>
}
