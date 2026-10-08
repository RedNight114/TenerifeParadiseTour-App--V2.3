"use client"

import Head from "next/head"
import { useLanguage } from "@/lib/language-context"

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: "website" | "article" | "product"
  organizationName?: string
  structuredData?: object
}

export function SEOHead({ title, description, keywords, image, url, type = "website", organizationName = "Experiencias locales", structuredData }: SEOProps) {
  const { language } = useLanguage()
  const fallbackTitle = language === "en" ? "Experiences and excursions" : "Experiencias y excursiones"
  const fallbackDescription = language === "en" ? "Explore experiences and book directly with the local team." : "Explora experiencias y reserva directamente con el equipo local."
  const finalTitle = title || `${fallbackTitle} | ${organizationName}`
  const finalDescription = description || fallbackDescription
  const origin = typeof window === "undefined" ? "" : window.location.origin
  const canonical = origin && url ? new URL(url, origin).toString() : undefined
  const imageUrl = image ? new URL(image, origin || "https://example.invalid").toString() : undefined

  return <Head>
    <title>{finalTitle}</title>
    <meta name="description" content={finalDescription} />
    {keywords && <meta name="keywords" content={keywords} />}
    {canonical && <link rel="canonical" href={canonical} />}
    <meta property="og:type" content={type} />
    <meta property="og:title" content={finalTitle} />
    <meta property="og:description" content={finalDescription} />
    <meta property="og:site_name" content={organizationName} />
    {canonical && <meta property="og:url" content={canonical} />}
    {imageUrl && <meta property="og:image" content={imageUrl} />}
    <meta property="og:locale" content={language === "en" ? "en_GB" : "es_ES"} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={finalTitle} />
    <meta name="twitter:description" content={finalDescription} />
    {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />}
  </Head>
}
