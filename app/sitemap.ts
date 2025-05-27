import type { MetadataRoute } from "next"
import { getExcursions } from "@/lib/supabase"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tenerifeparadisetours.com"

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/excursions`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]

  // Dynamic excursion pages
  try {
    const excursions = await getExcursions()
    const excursionPages = excursions.map((excursion) => ({
      url: `${baseUrl}/excursions/${excursion.id}`,
      lastModified: new Date(excursion.updated_at || excursion.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    return [...staticPages, ...excursionPages]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return staticPages
  }
}
