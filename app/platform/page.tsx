import Link from "next/link"
import { ArrowRight, Building2, CalendarDays, CheckCircle2, CircleAlert, CreditCard, LifeBuoy } from "lucide-react"
import { requirePlatformAdmin } from "@/lib/supabase-server"

type Metrics = { organizations: number; active_organizations: number; pending_organizations: number; suspended_organizations: number; organizations_created_30_days: number; companies_without_active_owner: number; unverified_domains: number; bookings: number; bookings_30_days: number; confirmed_bookings_30_days: number; successful_stripe_payments_30_days: number; excursions: number; published_excursions: number; open_tickets: number; high_priority_tickets: number }
type CompanyReadiness = { organization_id: string; organization_name: string; organization_slug: string; organization_status: string; plan_status: string; created_at: string; has_verified_primary_domain: boolean; has_active_owner: boolean; plan_name: string | null; plan_is_active: boolean; has_terms_es: boolean; has_terms_en: boolean; has_privacy_es: boolean; has_privacy_en: boolean; has_published_excursion: boolean; has_active_product_option: boolean; has_upcoming_departure: boolean }

function readinessLabel(organization: CompanyReadiness) {
  if (organization.organization_status === "suspended" || organization.plan_status === "suspended" || organization.plan_status === "cancelled") return "Servicio detenido"
  if (!organization.has_verified_primary_domain) return "Verificar dominio principal"
  if (!organization.has_active_owner) return "Asignar propietario activo"
  if (!organization.plan_name || !organization.plan_is_active) return "Asignar un plan disponible"
  if (organization.plan_status === "past_due") return "Revisar estado del plan"
  if (organization.organization_status !== "active") return "Empresa pendiente de activar"
  if (!organization.has_terms_es) return "Publicar condiciones en español"
  if (!organization.has_terms_en) return "Publicar condiciones en inglés"
  if (!organization.has_privacy_es) return "Publicar privacidad en español"
  if (!organization.has_privacy_en) return "Publicar privacidad en inglés"
  if (!organization.has_published_excursion) return "Publicar una excursión"
  if (!organization.has_active_product_option) return "Activar una opción de reserva"
  if (!organization.has_upcoming_departure) return "Programar una salida disponible"
  return "Preparación base para reservas completa"
}

function readinessTarget(organization: CompanyReadiness) {
  const id = organization.organization_id
  if (organization.organization_status === "suspended" || ["suspended", "cancelled", "past_due"].includes(organization.plan_status)) return `/platform/companies#organization-${id}-access`
  if (!organization.has_verified_primary_domain) return `/platform/companies#organization-${id}-domains`
  if (!organization.has_active_owner) return `/platform/companies#organization-${id}-owner`
  if (!organization.plan_name || !organization.plan_is_active) return `/platform/companies#organization-${id}-plan`
  if (organization.organization_status !== "active") return `/platform/companies#organization-${id}-access`
  return `/platform/companies#organization-${id}`
}

function organizationStatusLabel(status: string) {
  return status === "active" ? "Empresa activa" : status === "pending" ? "Pendiente" : "Suspendida"
}

function planStatusLabel(status: string) {
  return ({ trial: "Prueba manual", active: "Activo manual", past_due: "Revisión manual", suspended: "Suspendido", cancelled: "Cancelado" } as Record<string, string>)[status] ?? status
}

function isReady(organization: CompanyReadiness) {
  return readinessLabel(organization) === "Preparación base para reservas completa"
}

export default async function PlatformDashboardPage() {
  const { client } = await requirePlatformAdmin()
  const [{ data: metrics, error: metricsError }, { data: organizations, error: organizationsError }] = await Promise.all([
    client.rpc("get_platform_dashboard_metrics"),
    client.rpc("get_platform_company_readiness"),
  ])
  const stats = (metrics ?? {}) as Metrics
  const companies = (organizations ?? []) as CompanyReadiness[]
  const readyCompanies = companies.filter(isReady).length
  const blockedCompanies = companies.length - readyCompanies
  const cards = [
    { label: "Empresas activas", value: metricsError ? "—" : stats.active_organizations ?? 0, detail: metricsError ? "Datos no disponibles" : `${stats.organizations ?? 0} en total · ${stats.organizations_created_30_days ?? 0} nuevas en 30 días`, icon: Building2 },
    { label: "Reservas confirmadas", value: metricsError ? "—" : stats.confirmed_bookings_30_days ?? 0, detail: metricsError ? "Datos no disponibles" : `${stats.bookings_30_days ?? 0} recibidas en los últimos 30 días`, icon: CalendarDays },
    { label: "Pagos Stripe completados", value: metricsError ? "—" : stats.successful_stripe_payments_30_days ?? 0, detail: metricsError ? "Datos no disponibles" : "Operaciones en los últimos 30 días; no suma monedas distintas", icon: CreditCard },
    { label: "Dominios pendientes", value: metricsError ? "—" : stats.unverified_domains ?? 0, detail: metricsError ? "Datos no disponibles" : `${stats.companies_without_active_owner ?? 0} empresas sin propietario activo`, icon: Building2 },
    { label: "Soporte abierto", value: metricsError ? "—" : stats.open_tickets ?? 0, detail: metricsError ? "Datos no disponibles" : `${stats.high_priority_tickets ?? 0} de prioridad alta · ${stats.suspended_organizations ?? 0} empresas suspendidas`, icon: LifeBuoy },
  ]
  return <>
    <header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">QuickAgency</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Control de plataforma</h1><p className="mt-2 text-sm text-slate-600">Estado operativo de las empresas, sus reservas, dominios y soporte. La facturación SaaS automática sigue desactivada.</p></header>
    <section aria-label="Indicadores de plataforma" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(({ label, value, detail, icon: Icon }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-600">{label}</span><Icon className="h-5 w-5 text-teal-800" /></div><p className="mt-4 text-3xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></article>)}</section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5"><div><h2 className="font-semibold">Preparación de empresas</h2><p className="mt-1 text-sm text-slate-500">Checklist de las {companies.length} empresas más recientes: acceso, contenido legal, catálogo y próximas salidas.</p></div><div className="flex gap-2 text-xs"><span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-800">{readyCompanies} base completa</span><span className="rounded-full bg-amber-50 px-3 py-1.5 font-medium text-amber-900">{blockedCompanies} con tareas</span></div><div className="flex flex-wrap gap-4"><Link href="/platform/companies" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">Gestionar empresas <ArrowRight className="h-4 w-4" /></Link><Link href="/platform/domains" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">Mapa de dominios <ArrowRight className="h-4 w-4" /></Link></div></header>
      <p className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs leading-5 text-slate-600">La lista comprueba datos guardados, pero no certifica el enrutamiento DNS/hosting, la capacidad efectiva de cada salida ni la configuración de cobros. Esos controles se mantienen pendientes y no se presentan como validados.</p>
      {(metricsError || organizationsError) && <p role="alert" className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-800">No se pudieron cargar todos los datos del resumen. Comprueba la conexión con Supabase o aplica las migraciones pendientes.</p>}
      <div className="divide-y divide-slate-100">{companies.map((organization) => {
        const ready = isReady(organization)
        const checks = [
          { label: "Dominio", ok: organization.has_verified_primary_domain },
          { label: "Propietario", ok: organization.has_active_owner },
          { label: "Plan", ok: Boolean(organization.plan_name && organization.plan_is_active) },
          { label: "Términos ES", ok: organization.has_terms_es },
          { label: "Términos EN", ok: organization.has_terms_en },
          { label: "Privacidad ES", ok: organization.has_privacy_es },
          { label: "Privacidad EN", ok: organization.has_privacy_en },
          { label: "Excursión publicada", ok: organization.has_published_excursion },
          { label: "Opción activa", ok: organization.has_active_product_option },
          { label: "Próxima salida", ok: organization.has_upcoming_departure },
        ]
        return <article key={organization.organization_id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-48"><p className="font-medium">{organization.organization_name}</p><p className="text-xs text-slate-500">{organization.organization_slug}</p></div><div className="flex flex-wrap gap-2">{checks.map(({ label, ok }) => <span key={label} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}{label}</span>)}</div><div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-slate-100 px-2.5 py-1">{organizationStatusLabel(organization.organization_status)}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800">{organization.plan_name ? `${organization.plan_name} · ${planStatusLabel(organization.plan_status)}` : "Sin plan asignado"}</span></div><p className={`text-sm font-medium ${ready ? "text-emerald-800" : "text-amber-900"}`}>{readinessLabel(organization)}</p><Link href={readinessTarget(organization)} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:border-teal-700 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700" aria-label={`${ready ? "Abrir ficha" : "Resolver tarea"} de ${organization.organization_name}`}>{ready ? "Ver ficha" : "Resolver tarea"}</Link></article>
      })}{!companies.length && !organizationsError && <p className="p-5 text-sm text-slate-500">Todavía no hay empresas registradas.</p>}</div></section>
  </>
}
