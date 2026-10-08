import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/language-context"
import { SiteChrome } from "@/components/site-chrome"
import { OrganizationProvider } from "@/lib/organization-context"
import { getPublicOrganization } from "@/lib/organization-server"
import { getPublicSitePage } from "@/lib/organization-server"
import { cookies } from "next/headers"
import { getObject, getText } from "@/lib/site-content"
import { SitePreviewProvider } from "@/lib/site-preview-context"

const inter = Inter({ subsets: ["latin"], display: "swap" })

const baseMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Excursiones en Tenerife",
    template: "%s",
  },
  description:
    "Descubre nuestras excursiones en Tenerife y reserva directamente con el equipo que las organiza.",
  keywords: ["excursiones", "experiencias", "reservas directas", "excursions", "experiences", "direct booking"],
  authors: [{ name: "QuickAgency Go" }],
  creator: "QuickAgency Go",
  publisher: "QuickAgency Go",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Excursiones en Tenerife",
    title: "Excursiones en Tenerife",
    description: "Descubre nuestras excursiones en Tenerife y reserva directamente con el equipo que las organiza.",
    images: [
      {
        url: "/hero-tenerife-v3.avif",
        width: 1200,
        height: 630,
        alt: "Experiencias locales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Excursiones en Tenerife",
    description: "Descubre nuestras excursiones en Tenerife y reserva directamente con el equipo que las organiza.",
    images: ["/hero-tenerife-v3.avif"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "/" },
  icons: { icon: "/logo.png", apple: "/logo.png" },
  category: "travel",
    generator: 'v0.dev'
}

export async function generateMetadata(): Promise<Metadata> {
  const [organization, cookieStore] = await Promise.all([getPublicOrganization(), cookies()])
  if (!organization) return baseMetadata

  const baseUrl = organization.primary_domain
    ? `${organization.primary_domain === "localhost" || organization.primary_domain === "127.0.0.1" ? "http" : "https"}://${organization.primary_domain}`
    : baseMetadata.metadataBase?.toString()
  const companyName = organization.name
  const locale = cookieStore.get("NEXT_LOCALE")?.value === "en" ? "en" : "es"
  const pageContent = await getPublicSitePage("home", locale)
  const seo = getObject(pageContent ?? {}, "seo")
  const title = getText(seo, "title", locale === "en" ? "Excursions in Tenerife" : "Excursiones en Tenerife")
  const description = getText(seo, "description", locale === "en" ? "Explore our Tenerife excursions and book directly with the team that organises them." : "Descubre nuestras excursiones en Tenerife y reserva directamente con el equipo que las organiza.")
  const keywords = getText(seo, "keywords").split(",").map((keyword) => keyword.trim()).filter(Boolean)
  const publicTitle = `${title} | ${companyName}`

  return {
    ...baseMetadata,
    metadataBase: baseUrl ? new URL(baseUrl) : undefined,
    title: { default: publicTitle, template: `%s | ${companyName}` },
    description,
    keywords: keywords.length ? keywords : [companyName, locale === "en" ? "excursions" : "excursiones", locale === "en" ? "tours" : "experiencias"],
    authors: [{ name: companyName }],
    creator: companyName,
    publisher: companyName,
    openGraph: {
      ...baseMetadata.openGraph,
      siteName: companyName,
      title: publicTitle,
      description,
      url: baseUrl,
      images: organization.logo_url ? [{ url: organization.logo_url }] : baseMetadata.openGraph?.images,
    },
    twitter: { ...baseMetadata.twitter, title: publicTitle, description },
    icons: organization.logo_url ? { icon: organization.logo_url, apple: organization.logo_url } : baseMetadata.icons,
    alternates: baseUrl ? {
      canonical: baseUrl,
    } : baseMetadata.alternates,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organization = await getPublicOrganization()
  const brandStyle = {
    "--brand-primary": organization?.primary_color ?? "#0f766e",
    "--brand-primary-hover": `color-mix(in srgb, ${organization?.primary_color ?? "#0f766e"} 82%, #000)`,
    "--brand-secondary": organization?.secondary_color ?? "#f59e0b",
  } as React.CSSProperties

  return (
    <html lang={organization?.default_locale === "en" ? "en" : "es"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//blob.v0.dev" />
      </head>
      <body className={inter.className} style={brandStyle}>
        <LanguageProvider>
          <OrganizationProvider organization={organization}>
            <SitePreviewProvider>
              <SiteChrome organization={organization}>{children}</SiteChrome>
            </SitePreviewProvider>
          </OrganizationProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
