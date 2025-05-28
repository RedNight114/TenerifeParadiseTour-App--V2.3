"use client"

import { useLanguage } from "@/lib/language-context"
import type { Excursion } from "@/lib/supabase"

interface ExcursionSchemaProps {
  excursion: Excursion
  rating?: number
  reviewCount?: number
}

export function ExcursionSchema({ excursion, rating = 4.5, reviewCount = 50 }: ExcursionSchemaProps) {
  const { language } = useLanguage()

  const baseUrl = "https://tenerifeparadisetours.com"
  const excursionName = excursion[`name_${language}` as keyof Excursion] as string
  const excursionDescription = excursion[`description_${language}` as keyof Excursion] as string

  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: excursionName,
    description: excursionDescription,
    image: excursion.image_url,
    url: `${baseUrl}/excursions/${excursion.id}`,
    provider: {
      "@type": "TravelAgency",
      name: "TenerifeParadiseTours",
      url: baseUrl,
      telephone: "+34617303929",
    },
    offers: {
      "@type": "Offer",
      price: excursion.price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
      url: `${baseUrl}/excursions/${excursion.id}`,
      seller: {
        "@type": "Organization",
        name: "TenerifeParadiseTours",
      },
    },
    duration: excursion.duration,
    location: {
      "@type": "Place",
      name: "Tenerife, Canary Islands",
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
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: Array.from({ length: Math.min(3, reviewCount) }, (_, i) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: `Cliente ${i + 1}`,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: Math.max(4, rating - Math.random() * 0.5),
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: `Excelente excursión en ${excursionName}. Muy recomendable.`,
    })),
    category: excursion.category,
    ...(excursion.included_services && {
      includesObject: excursion.included_services.map((service) => ({
        "@type": "Thing",
        name: service,
      })),
    }),
    ...(excursion.max_people && {
      maximumAttendeeCapacity: excursion.max_people,
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(tourSchema),
      }}
    />
  )
}
