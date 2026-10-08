"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, ChevronDown, CircleUserRound, Globe2, LogIn, Menu, TicketCheck, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage, type Language } from "@/lib/language-context"
import type { OrganizationBrand } from "@/lib/organization-context"
import { usePublicSitePage } from "@/lib/public-site-content"
import { getObject, getText } from "@/lib/site-content"
import { supabase } from "@/lib/supabase"

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
]

export function Navbar({ organization }: { organization: OrganizationBrand | null }) {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const { content: globalContent } = usePublicSitePage("global")
  const navCopy = getObject(globalContent, "nav")
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])
  useEffect(() => {
    const updateScrollState = () => setHasScrolled(window.scrollY > 24)
    updateScrollState()
    window.addEventListener("scroll", updateScrollState, { passive: true })
    return () => window.removeEventListener("scroll", updateScrollState)
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false)
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [menuOpen])

  if (pathname.startsWith("/admin") || pathname.startsWith("/platform") || pathname === "/login" || pathname === "/account" || pathname.startsWith("/account/")) return null

  const navItems = [
    { href: "/", key: "home", label: getText(navCopy, "home", t("nav.home")) },
    { href: "/excursions", key: "excursions", label: getText(navCopy, "excursions", t("nav.excursions")) },
    { href: "/about", key: "about", label: getText(navCopy, "about", t("nav.about")) },
    { href: "/contact", key: "contact", label: getText(navCopy, "contact", t("nav.contact")) },
  ]
  const currentLanguage = languages.find((item) => item.code === language) ?? languages[0]
  const transparent = pathname === "/" && !hasScrolled && !menuOpen

  return (
    <header className={`z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200 ease-out-strong motion-reduce:transition-none ${pathname === "/" ? "fixed inset-x-0 top-0" : "sticky top-0"} ${transparent ? "border-b-0 bg-transparent text-white" : "border-b-0 bg-white/95 text-slate-900 shadow-[0_1px_12px_rgba(16,44,51,0.06)] backdrop-blur-xl"}`}>
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[76px] lg:px-8">
        <Link href="/" aria-label={`${organization?.name ?? "Experiencias locales"} — inicio`} className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">
          <Image src={organization?.logo_url || "/logo.png"} alt="" width={44} height={44} unoptimized className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11" />
          <span className="min-w-0 leading-tight"><span className={`block truncate text-[15px] font-semibold tracking-tight sm:text-base ${transparent ? "text-white" : "text-[#15343b]"}`}>{organization?.name || "Experiencias locales"}</span><span data-site-edit-page="global" data-site-edit-path="brandTagline" data-site-edit-label="Lema de marca" className={`mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.17em] sm:block ${transparent ? "text-white/75" : "text-teal-700"}`}>{getText(globalContent, "brandTagline", language === "en" ? "Book direct with us" : "Reserva directamente")}</span></span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {navItems.map(({ href, key, label }) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
            return <Link key={href} href={href} data-site-edit-page="global" data-site-edit-path={`nav.${key}`} data-site-edit-label={`Menú · ${label}`} aria-current={active ? "page" : undefined} style={!transparent && active ? { color: "var(--brand-primary)", backgroundColor: "color-mix(in srgb, var(--brand-primary) 9%, white)" } : undefined} className={`navbar-link relative rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${transparent ? active ? "text-white" : "text-white/90 hover:bg-white/10 hover:text-white" : active ? "font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>{label}</Link>
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger aria-label={`Idioma: ${currentLanguage.label}`} className={`inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${transparent ? "text-white hover:bg-white/15" : "text-slate-600"}`}><Globe2 aria-hidden="true" className="h-4 w-4" /><span>{currentLanguage.flag}</span><ChevronDown aria-hidden="true" className="h-3.5 w-3.5" /></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-200 p-1.5 shadow-xl">
              {languages.map((item) => <DropdownMenuItem key={item.code} onClick={() => setLanguage(item.code)} className={`min-h-10 cursor-pointer rounded-lg ${item.code === language ? "bg-teal-50 font-semibold text-teal-900" : ""}`}><span className="mr-2">{item.flag}</span>{item.label}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          <CustomerProfileMenu transparent={transparent} language={language} />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <CustomerProfileMenu transparent={transparent} language={language} />
          <DropdownMenu>
            <DropdownMenuTrigger aria-label={`Idioma: ${currentLanguage.label}`} className="flex h-11 w-11 items-center justify-center rounded-lg text-lg transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">{currentLanguage.flag}</DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 p-1.5 shadow-xl">{languages.map((item) => <DropdownMenuItem key={item.code} onClick={() => setLanguage(item.code)} className="min-h-10 cursor-pointer rounded-lg"><span className="mr-2">{item.flag}</span>{item.label}</DropdownMenuItem>)}</DropdownMenuContent>
          </DropdownMenu>
          <button type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)} className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 motion-reduce:transition-none ${transparent ? "text-white hover:bg-white/10" : "text-slate-800"}`}>{menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}</button>
        </div>
      </div>

      {menuOpen && <nav id="mobile-navigation" aria-label="Principal" className="animate-in fade-in slide-in-from-top-2 duration-150 border-t border-slate-100 bg-white px-4 pb-4 pt-2 text-slate-900 shadow-lg motion-reduce:animate-none lg:hidden"><div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">{navItems.map(({ href, key, label }) => { const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} data-site-edit-page="global" data-site-edit-path={`nav.${key}`} data-site-edit-label={`Menú · ${label}`} aria-current={active ? "page" : undefined} style={active ? { color: "var(--brand-primary)", backgroundColor: "color-mix(in srgb, var(--brand-primary) 9%, white)" } : undefined} className={`flex min-h-12 items-center rounded-lg px-3.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${active ? "font-semibold" : "text-slate-700 hover:bg-slate-50"}`}>{label}</Link> })}</div></nav>}
    </header>
  )
}

function CustomerProfileMenu({ transparent, language }: { transparent: boolean; language: Language }) {
  const [email, setEmail] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => { if (mounted) setEmail(data.user?.email ?? null) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null))
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])
  const english = language === "en"
  return <DropdownMenu>
    <DropdownMenuTrigger aria-label={english ? (email ? "Open account menu" : "Sign in or check a booking") : (email ? "Abrir menú de cuenta" : "Iniciar sesión o consultar reserva")} className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 motion-reduce:transform-none motion-reduce:transition-none ${transparent ? "text-white hover:bg-white/15" : "text-slate-700 hover:bg-teal-50 hover:text-teal-900"}`}><CircleUserRound aria-hidden="true" className="h-5 w-5" /></DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={10} className="w-64 rounded-2xl border-slate-200 p-2 shadow-xl">
      <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-slate-500">{email || (english ? "Your account" : "Tu cuenta")}</DropdownMenuLabel>
      <DropdownMenuItem asChild className="min-h-11 cursor-pointer rounded-xl px-3"><Link href="/account"><LogIn aria-hidden="true" className="h-4 w-4 text-teal-800" />{email ? (english ? "My account" : "Mi cuenta") : (english ? "Sign in / Create account" : "Iniciar sesión / Crear cuenta")}</Link></DropdownMenuItem>
      <DropdownMenuItem asChild className="min-h-11 cursor-pointer rounded-xl px-3"><Link href={email ? "/account" : "/booking-status"}><CalendarDays aria-hidden="true" className="h-4 w-4 text-teal-800" />{english ? "My bookings" : "Ver mis reservas"}</Link></DropdownMenuItem>
      {!email && <DropdownMenuItem asChild className="min-h-11 cursor-pointer rounded-xl px-3"><Link href="/booking-status"><TicketCheck aria-hidden="true" className="h-4 w-4 text-teal-800" />{english ? "Track with booking code" : "Consultar con código de reserva"}</Link></DropdownMenuItem>}
    </DropdownMenuContent>
  </DropdownMenu>
}
