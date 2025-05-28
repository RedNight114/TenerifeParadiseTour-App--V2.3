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
  publishedTime?: string
  modifiedTime?: string
  author?: string
  price?: number
  currency?: string
  availability?: "InStock" | "OutOfStock" | "PreOrder"
  rating?: number
  reviewCount?: number
  location?: {
    name: string
    address: string
    latitude: number
    longitude: number
  }
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
  structuredData?: object
}

export function SEOHead({
  title,
  description,
  keywords,
  image = "/hero-tenerife.jpg",
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  price,
  currency = "EUR",
  availability = "InStock",
  rating,
  reviewCount,
  location,
  breadcrumbs,
  structuredData,
}: SEOProps) {
  const { language } = useLanguage()

  const baseUrl = "https://tenerifeparadisetours.com"
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`

  const defaultTitle = {
    es: "TenerifeParadiseTours - Excursiones Únicas en Tenerife",
    en: "TenerifeParadiseTours - Unique Excursions in Tenerife",
    de: "TenerifeParadiseTours - Einzigartige Ausflüge auf Teneriffa",
  }

  const defaultDescription = {
    es: "Descubre la magia de Tenerife con nuestras excursiones únicas. Avistamiento de ballenas, senderismo, Teide y mucho más. Reserva fácil vía WhatsApp.",
    en: "Discover the magic of Tenerife with our unique excursions. Whale watching, hiking, Teide and much more. Easy booking via WhatsApp.",
    de: "Entdecken Sie die Magie Teneriffas mit unseren einzigartigen Ausflügen. Walbeobachtung, Wandern, Teide und vieles mehr. Einfache Buchung über WhatsApp.",
  }

  const finalTitle = title || defaultTitle[language]
  const finalDescription = description || defaultDescription[language]

  // Datos estructurados base de la organización
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "TenerifeParadiseTours",
    description: finalDescription,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: fullImageUrl,
    telephone: "+34617303929",
    email: "info@tenerifeparadisetours.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ES",
      addressRegion: "Canarias",
      addressLocality: "Tenerife",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.2916,
      longitude: -16.6291,
    },
    sameAs: [
      "https://www.instagram.com/tenerifeparadisetours",
      "https://www.facebook.com/tenerifeparadisetours",
      "https://wa.me/34617303929",
    ],
    areaServed: {
      "@type": "Place",
      name: "Tenerife, Canary Islands",
    },
    serviceType: ["Tour Operator", "Excursions", "Whale Watching", "Hiking Tours"],
  }

  // Breadcrumbs schema
  const breadcrumbSchema = breadcrumbs
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: `${baseUrl}${crumb.url}`,
        })),
      }
    : null

  // Website schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TenerifeParadiseTours",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/excursions?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  // Combinar todos los schemas
  const allSchemas = [organizationSchema, websiteSchema]
  if (breadcrumbSchema) allSchemas.push(breadcrumbSchema)
  if (structuredData) allSchemas.push(structuredData)

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="TenerifeParadiseTours" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Language and Region */}
      <meta httpEquiv="content-language" content={language} />
      <meta name="geo.region" content="ES-CN" />
      <meta name="geo.placename" content="Tenerife" />
      <meta name="geo.position" content="28.2916;-16.6291" />
      <meta name="ICBM" content="28.2916, -16.6291" />

      {/* Hreflang */}
      <link rel="alternate" hrefLang="es" href={`${baseUrl}/es${url || ""}`} />
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${url || ""}`} />
      <link rel="alternate" hrefLang="de" href={`${baseUrl}/de${url || ""}`} />
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="TenerifeParadiseTours" />
      <meta property="og:locale" content={language === "es" ? "es_ES" : language === "de" ? "de_DE" : "en_US"} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={finalTitle} />
      <meta name="twitter:site" content="@tenerifeparadise" />
      <meta name="twitter:creator" content="@tenerifeparadise" />

      {/* Product/Service specific */}
      {price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
        </>
      )}

      {/* Rating */}
      {rating && reviewCount && (
        <>
          <meta property="rating:value" content={rating.toString()} />
          <meta property="rating:scale" content="5" />
          <meta property="rating:count" content={reviewCount.toString()} />
        </>
      )}

      {/* Location */}
      {location && (
        <>
          <meta property="place:location:latitude" content={location.latitude.toString()} />
          <meta property="place:location:longitude" content={location.longitude.toString()} />
        </>
      )}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(allSchemas),
        }}
      />

      {/* Additional SEO */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=yes" />

      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      <link rel="dns-prefetch" href="//blob.v0.dev" />
    </Head>
  )
}
