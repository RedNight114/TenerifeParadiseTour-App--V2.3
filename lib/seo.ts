import type { Metadata } from "next"

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article" | "product"
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export function generateSEO({
  title,
  description,
  keywords = [],
  image = "/og-image.jpg",
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
}: SEOProps = {}): Metadata {
  const baseUrl = "https://tenerifeparadisetours.com"
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`

  const defaultTitle = "TenerifeParadiseTours - Excursiones Únicas en Tenerife"
  const defaultDescription =
    "Descubre la magia de Tenerife con nuestras excursiones únicas. Avistamiento de ballenas, senderismo al Teide y tours premium con guías locales expertos."

  const seoTitle = title ? `${title} | TenerifeParadiseTours` : defaultTitle
  const seoDescription = description || defaultDescription

  const allKeywords = ["Tenerife", "excursiones", "turismo", "Canarias", "tours", ...keywords]

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: allKeywords,
    openGraph: {
      type,
      locale: "es_ES",
      url: fullUrl,
      siteName: "TenerifeParadiseTours",
      title: seoTitle,
      description: seoDescription,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title || defaultTitle,
          type: "image/jpeg",
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section,
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      site: "@TenerifeParadise",
      creator: "@TenerifeParadise",
      title: seoTitle,
      description: seoDescription,
      images: [fullImageUrl],
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

// Structured data generators
export function generateTourStructuredData(excursion: any) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: excursion.name_es,
    description: excursion.description_es,
    image: excursion.image_url,
    url: `https://tenerifeparadisetours.com/excursions/${excursion.id}`,
    provider: {
      "@type": "TravelAgency",
      name: "TenerifeParadiseTours",
      url: "https://tenerifeparadisetours.com",
    },
    offers: {
      "@type": "Offer",
      price: excursion.price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    duration: excursion.duration,
    category: excursion.category,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
  }
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://tenerifeparadisetours.com${item.url}`,
    })),
  }
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}
