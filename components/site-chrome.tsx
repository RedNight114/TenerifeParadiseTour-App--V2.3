"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CookieBanner } from "@/components/cookie-banner"
import { LanguageSelectorModal } from "@/components/language-selector-modal"
import type { OrganizationBrand } from "@/lib/organization-context"

export function SiteChrome({ organization, children }: { organization: OrganizationBrand | null; children: React.ReactNode }) {
  const pathname = usePathname()
  const isPrivate = pathname === "/login" || pathname.startsWith("/workspace") || pathname.startsWith("/admin") || pathname.startsWith("/platform")

  return <>
    {!isPrivate && <Navbar organization={organization} />}
    <div className="route-content-enter min-h-dvh">{children}</div>
    {!isPrivate && <Footer organization={organization} />}
    {!isPrivate && <CookieBanner />}
    {!isPrivate && <LanguageSelectorModal />}
  </>
}
