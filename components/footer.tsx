"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ArrowRight, Building2, MapPin, Phone, Mail } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import type { OrganizationBrand } from "@/lib/organization-context"
import { usePublicSitePage } from "@/lib/public-site-content"
import { getObject, getText } from "@/lib/site-content"
import { TermsConditionsModal } from "@/components/terms-conditions-modal"
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal"

export function Footer({ organization }: { organization: OrganizationBrand | null }) {
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const { content: aboutContent } = usePublicSitePage("about")
  const { content: homeContent } = usePublicSitePage("home")
  const { content: globalContent } = usePublicSitePage("global")
  const footerCopy = getObject(globalContent, "footer")
  const navCopy = getObject(globalContent, "nav")
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const hasContact = Boolean(organization?.phone || organization?.support_email || organization?.address?.city)

  if (pathname.startsWith("/admin") || pathname.startsWith("/platform") || pathname === "/login" || pathname === "/account" || pathname.startsWith("/account/")) return null

  return (
    <>
      <footer className="relative overflow-hidden border-t border-teal-900 bg-[#10383c] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-48 h-[28rem] w-[28rem] rounded-full border border-white/[0.06]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/[0.06]" />
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/[0.045] p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
            <div className="flex items-center gap-4">
              <Image src={organization?.logo_url || "/logo.png"} alt={`${organization?.name || "Excursiones"} logo`} width={56} height={56} unoptimized className="h-12 w-12 shrink-0 rounded-full bg-white/95 object-contain p-1.5 sm:h-14 sm:w-14" />
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight text-white sm:text-xl">{organization?.name || "Experiencias locales"}</p>
                <p data-site-edit-page="global" data-site-edit-path="footer.tagline" data-site-edit-label="Pie · lema" className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">{getText(footerCopy, "tagline", language === "en" ? "Local experiences" : "Experiencias locales")}</p>
                <p data-site-edit-page="global" data-site-edit-path="footer.summary" data-site-edit-label="Pie · presentación" data-site-edit-kind="multiline" className="mt-3 max-w-xl text-sm leading-6 text-white/70">{getText(footerCopy, "summary", getText(aboutContent, "intro", language === "en" ? "Meet the local team behind each experience." : "Conoce al equipo local que prepara cada experiencia."))}</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 lg:max-w-sm lg:items-end lg:text-right">
              <h2 data-site-edit-page="global" data-site-edit-path="footer.discoverTitle" data-site-edit-label="Pie · título de excursiones" className="text-base font-semibold text-white">{getText(footerCopy, "discoverTitle", getText(navCopy, "excursions", t("nav.excursions")))}</h2>
              <p data-site-edit-page="global" data-site-edit-path="footer.discoverText" data-site-edit-label="Pie · texto de excursiones" data-site-edit-kind="multiline" className="text-sm leading-6 text-white/70">{getText(footerCopy, "discoverText", getText(getObject(homeContent, "featured"), "subtitle", language === "en" ? "Explore our experiences and book directly with us." : "Descubre nuestras experiencias y reserva directamente con nosotros."))}</p>
              <Link href="/excursions" className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#10383c] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10383c] motion-reduce:transform-none motion-reduce:transition-none">
                {getText(footerCopy, "discoverCta", t("featured.view_all_short"))}<ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
              </Link>
            </div>
          </div>

          <div className={`grid gap-9 border-b border-white/10 py-10 sm:grid-cols-2 ${hasContact ? "lg:grid-cols-[1fr_1fr_1.3fr]" : "lg:grid-cols-2"} lg:gap-12 lg:py-12`}>
            <nav aria-label={language === "en" ? "Explore" : "Explora"}>
              <h3 data-site-edit-page="global" data-site-edit-path="footer.quickLinksTitle" data-site-edit-label="Pie · título de enlaces" className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">{getText(footerCopy, "quickLinksTitle", t("footer.quick_links"))}</h3>
              <ul className="grid grid-cols-2 gap-x-5 gap-y-1">
                <li><FooterLink href="/">{getText(navCopy, "home", t("nav.home"))}</FooterLink></li>
                <li><FooterLink href="/excursions">{getText(navCopy, "excursions", t("nav.excursions"))}</FooterLink></li>
                <li><FooterLink href="/about">{getText(navCopy, "about", t("nav.about"))}</FooterLink></li>
                <li><FooterLink href="/contact">{getText(navCopy, "contact", t("nav.contact"))}</FooterLink></li>
                <li><FooterLink href="/booking">{getText(navCopy, "booking", t("nav.booking"))}</FooterLink></li>
              </ul>
            </nav>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">{language === "en" ? "Customer support" : "Atención al cliente"}</h3>
              <ul className="grid grid-cols-2 gap-x-5 gap-y-1 sm:grid-cols-1">
                <li><FooterLink href="/account">{getText(navCopy, "account", language === "en" ? "My bookings" : "Mis reservas")}</FooterLink></li>
                <li><FooterLink href="/faq">{t("footer.faq")}</FooterLink></li>
              </ul>
            </div>

            {hasContact && <address className="not-italic">
              <h3 data-site-edit-page="global" data-site-edit-path="footer.contactTitle" data-site-edit-label="Pie · título de contacto" className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">{getText(footerCopy, "contactTitle", t("footer.contact_info"))}</h3>
              <ul className="space-y-3">
                {organization?.phone && <li><a href={`tel:${organization.phone}`} className="inline-flex min-h-10 items-center gap-2.5 rounded-md text-sm text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"><Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-200" />{organization.phone}</a></li>}
                {organization?.support_email && <li><a href={`mailto:${organization.support_email}`} className="inline-flex min-h-10 items-center gap-2.5 break-all rounded-md text-sm text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"><Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-200" />{organization.support_email}</a></li>}
                {organization?.address?.city && <li className="flex min-h-10 items-center gap-2.5 text-sm text-white/80"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-200" />{[organization.address.city, organization.address.country].filter(Boolean).join(", ")}</li>}
              </ul>
            </address>}
          </div>

          <div className="flex flex-col gap-5 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="flex flex-col items-center gap-2 text-xs text-white/60 sm:flex-row sm:gap-4">
              <p>© {new Date().getFullYear()} {organization?.name || t("footer.title")}. {getText(footerCopy, "rights", t("footer.rights"))}</p>
              <a href="https://quickagence.com" target="_blank" rel="noopener noreferrer" aria-label="Visitar QuickAgency Go" className="inline-flex min-h-9 items-center gap-2 rounded-md text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                <span>{t("footer.designed_by")}</span>
                <Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={20} height={20} className="h-5 w-5 rounded object-contain" />
                <span className="font-semibold">QuickAgency Go</span>
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
              <Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 text-xs font-semibold text-white/75 shadow-sm shadow-black/10 transition-[background-color,border-color,color] duration-200 hover:border-teal-200/40 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10383c] motion-reduce:transition-none">
                <Building2 aria-hidden="true" className="h-4 w-4 text-teal-200" />
                {language === "en" ? "Business portal" : "Panel de empresas"}
              </Link>
              <button type="button" onClick={() => setPrivacyOpen(true)} className="inline-flex min-h-10 items-center rounded-md text-xs text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">{t("footer.privacy")}</button>
              <button type="button" onClick={() => setTermsOpen(true)} className="inline-flex min-h-10 items-center rounded-md text-xs text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">{t("footer.terms")}</button>
            </div>
          </div>
        </div>
      </footer>
      <TermsConditionsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <PrivacyPolicyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex min-h-10 items-center rounded-md pr-2 text-sm text-white/70 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 motion-reduce:transition-none">{children}</Link>
}
