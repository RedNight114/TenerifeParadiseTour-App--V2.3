"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Building2, ClipboardList, Gauge, Globe2, LifeBuoy, LogOut, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOutAdmin } from "@/lib/auth-actions"
import type { ReactNode } from "react"

const items = [
  { href: "/platform", label: "Resumen", icon: Gauge },
  { href: "/platform/companies", label: "Empresas", icon: Building2 },
  { href: "/platform/domains", label: "Dominios y landings", icon: Globe2 },
  { href: "/platform/plans", label: "Planes", icon: ClipboardList },
  { href: "/platform/support", label: "Soporte", icon: LifeBuoy },
  { href: "/platform/audit", label: "Auditoría", icon: ScrollText },
]

export function PlatformShell({ children, email }: { children: ReactNode; email: string }) {
  const pathname = usePathname()
  const navigation = <><nav aria-label="Administración de QuickAgency Go" className="platform-mobile-nav flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1">{items.map(({ href, label, icon: Icon }) => {
    const active = pathname === href || pathname.startsWith(`${href}/`)
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${active ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-slate-100"}`}><Icon className="h-4 w-4" />{label}</Link>
  })}</nav><p className="mt-1 px-1 text-[11px] text-slate-500 lg:hidden">Desliza para ver todas las secciones</p></>

  return <div className="min-h-dvh bg-slate-50 text-slate-900">
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
      <Link href="/platform" aria-label="QuickAgency Go, control de plataforma" className="mb-7 flex items-center gap-3 rounded-xl p-2"><Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10 rounded-xl" /><span><strong className="block text-sm">QuickAgency Go</strong><small className="text-slate-500">Control de plataforma</small></span></Link>
      {navigation}
      <div className="mt-auto border-t border-slate-200 pt-4"><p className="truncate px-3 text-xs text-slate-500">{email}</p><form action={signOutAdmin}><Button variant="ghost" className="mt-2 w-full justify-start"><LogOut className="mr-2 h-4 w-4" />Cerrar sesión</Button></form></div>
    </aside>
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white p-3 lg:hidden"><Link href="/platform" className="mb-3 flex items-center gap-2.5 rounded-lg"><Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={32} height={32} className="h-8 w-8 rounded-lg" /><span className="text-sm font-semibold">QuickAgency Go</span></Link>{navigation}</header>
    <main className="route-content-enter mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:ml-64 lg:p-8">{children}</main>
  </div>
}
