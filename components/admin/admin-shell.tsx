"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Activity, Building2, CalendarDays, ChevronRight, CreditCard, Globe2, LifeBuoy, LogOut, MapPinned, PackageOpen, Users, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOutAdmin } from "@/lib/auth-actions"
import { useRouter } from "next/navigation"
import type { OrganizationRole } from "@/lib/supabase-server"
import type { ReactNode } from "react"

const roleLabels: Record<OrganizationRole, string> = {
  owner: "Propietario",
  admin: "Administrador",
  catalog_manager: "Gestión de catálogo",
  booking_manager: "Gestión de reservas",
  guide: "Guía",
}

const sectionNames: Record<string, string> = {
  "/admin": "Resumen",
  "/admin/manage-excursions": "Excursiones",
  "/admin/bookings": "Reservas",
  "/admin/inventory": "Inventario y salidas",
  "/admin/organization": "Marca y empresa",
  "/admin/website": "Contenido del sitio",
  "/admin/support": "Soporte",
  "/admin/payments": "Pagos de prueba",
  "/admin/members": "Equipo",
  "/admin/audit": "Actividad",
}

export function AdminShell({ children, role, organizationName, organizationLogoUrl }: { children: ReactNode; role: OrganizationRole; organizationName: string; organizationLogoUrl: string | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const canManageOrganization = role === "owner" || role === "admin"
  const canManagePayments = role === "owner"
  const canManageCatalog = canManageOrganization || role === "catalog_manager"
  const canViewBookings = canManageOrganization || role === "booking_manager"
  const groups = [
    { label: "General", links: [{ href: "/admin", label: "Resumen", icon: Activity }] },
    { label: "Ventas y operación", links: [
      ...(canManageCatalog ? [
        { href: "/admin/manage-excursions", label: "Excursiones", icon: MapPinned },
        { href: "/admin/inventory", label: "Inventario y salidas", icon: PackageOpen },
      ] : []),
      ...(canViewBookings ? [{ href: "/admin/bookings", label: "Reservas", icon: CalendarDays }] : []),
    ] },
    { label: "Empresa y web", links: canManageOrganization ? [
      { href: "/admin/organization", label: "Marca y empresa", icon: Building2 },
      { href: "/admin/website", label: "Contenido del sitio", icon: Globe2 },
      ...(canManagePayments ? [{ href: "/admin/payments", label: "Pagos de prueba", icon: CreditCard }] : []),
      { href: "/admin/members", label: "Equipo", icon: Users },
      { href: "/admin/audit", label: "Actividad", icon: Activity },
    ] : [] },
    { label: "Ayuda", links: canViewBookings ? [{ href: "/admin/support", label: "Soporte", icon: LifeBuoy }] : [] },
  ].filter((group) => group.links.length > 0)
  const links = groups.flatMap((group) => group.links)
  const currentSection = sectionNames[pathname] ?? links.find(({ href }) => pathname.startsWith(`${href}/`))?.label ?? "Administración"
  const initials = organizationName.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase()

  const Navigation = ({ compact = false }: { compact?: boolean }) => compact ? (
    <div className="relative">
      <label className="sr-only" htmlFor="admin-mobile-nav">Sección de administración</label>
      <select id="admin-mobile-nav" value={links.find(({ href }) => href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))?.href ?? ""} onChange={(event) => router.push(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800">
        {groups.map((group) => <optgroup key={group.label} label={group.label}>{group.links.map(({ href, label }) => <option key={href} value={href}>{label}</option>)}</optgroup>)}
      </select>
    </div>
  ) : (
    <nav aria-label="Navegación de administración" className="space-y-5">
      {groups.map((group) => <section key={group.label}>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.label}</p>
        <div className="space-y-1">{group.links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${compact ? "" : "w-full"} ${active ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
          >
            {active && !compact && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-teal-700" aria-hidden="true" />}
            <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-teal-800" : "text-slate-400 group-hover:text-slate-600"}`} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        )
      })}</div>
      </section>)}
    </nav>
  )

  return (
    <div className="admin-shell min-h-dvh bg-[#f6f8f7] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[256px] flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-3 rounded-xl px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
          {organizationLogoUrl ? <Image src={organizationLogoUrl} alt="" aria-hidden="true" width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded-xl object-contain" /> : <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-white"><MapPinned className="h-[18px] w-[18px]" aria-hidden="true" /></span>}
          <span className="min-w-0"><span className="block truncate text-sm font-semibold tracking-tight text-slate-900">{organizationName}</span><span className="mt-0.5 block text-xs text-slate-500">Panel de gestión</span></span>
        </Link>
        <Navigation />
        <div className="mt-auto border-t border-slate-200 pt-4">
          <Link href="/workspace" className="mb-3 flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"><ArrowLeftRight className="h-4 w-4" aria-hidden="true" />Cambiar empresa</Link>
          <div className="mb-3 flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{initials}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-800">{organizationName}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{roleLabels[role]}</span></span>
          </div>
          <form action={signOutAdmin}>
            <Button type="submit" variant="ghost" className="h-10 w-full justify-start rounded-lg px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900"><LogOut className="mr-3 h-4 w-4" aria-hidden="true" />Cerrar sesión</Button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
            {organizationLogoUrl ? <Image src={organizationLogoUrl} alt="" aria-hidden="true" width={36} height={36} unoptimized className="h-9 w-9 shrink-0 rounded-lg object-contain" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-800 text-white"><MapPinned className="h-4 w-4" aria-hidden="true" /></span>}
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{organizationName}</span><span className="block text-xs text-slate-500">{roleLabels[role]}</span><span className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500"><Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4 rounded-sm" />QuickAgency Go</span></span>
          </Link>
          <form action={signOutAdmin}><Button type="submit" variant="outline" size="sm" className="h-10 shrink-0 rounded-lg"><LogOut className="mr-2 h-4 w-4" aria-hidden="true" />Salir</Button></form>
        </div>
        <Link href="/workspace" className="mb-3 flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"><ArrowLeftRight className="h-4 w-4" aria-hidden="true" />Cambiar empresa</Link>
        <Navigation compact />
      </header>

      <div className="min-w-0 lg:ml-[256px]">
        <header className="sticky top-0 z-20 hidden h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur lg:flex">
          <div className="flex items-center gap-2 text-sm"><span className="text-slate-400">Administración</span><ChevronRight className="h-4 w-4 text-slate-300" aria-hidden="true" /><span className="font-medium text-slate-800" aria-current="page">{currentSection}</span></div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={18} height={18} className="h-[18px] w-[18px] rounded-sm opacity-80" /><span className="font-medium text-slate-600">QuickAgency Go</span><span aria-hidden="true" className="text-slate-300">·</span><span>Acceso · {roleLabels[role]}</span></div>
        </header>
        <main className="min-w-0">
          <div className="route-content-enter mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">{children}</div>
        </main>
      </div>
    </div>
  )
}
