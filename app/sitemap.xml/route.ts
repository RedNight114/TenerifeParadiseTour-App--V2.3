import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const baseUrl = "https://tenerifeparadisetours.com"

  try {
    // Obtener todas las excursiones
    const { data: excursions } = await supabase
      .from("excursions")
      .select("id, updated_at, created_at")
      .order("updated_at", { ascending: false })

    // Obtener todas las categorías
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name_es, name_en, name_de, updated_at")
      .eq("active", true)

    const currentDate = new Date().toISOString()

    // URLs estáticas
    const staticUrls = [
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/excursions`,
        lastModified: currentDate,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: currentDate,
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: currentDate,
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/booking`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ]

    // URLs de excursiones
    const excursionUrls = (excursions || []).map((excursion) => ({
      url: `${baseUrl}/excursions/${excursion.id}`,
      lastModified: excursion.updated_at || excursion.created_at,
      changeFrequency: "weekly",
      priority: 0.8,
    }))

    // URLs de categorías
    const categoryUrls = (categories || []).map((category) => ({
      url: `${baseUrl}/excursions/category/${category.id}`,
      lastModified: category.updated_at,
      changeFrequency: "weekly",
      priority: 0.7,
    }))

    // URLs multiidioma
    const languages = ["es", "en", "de"]
    const multilingualUrls = languages.flatMap((lang) =>
      [...staticUrls, ...excursionUrls, ...categoryUrls].map((url) => ({
        ...url,
        url: url.url.replace(baseUrl, `${baseUrl}/${lang}`),
        priority: url.priority * 0.9, // Slightly lower priority for non-default language
      })),
    )

    const allUrls = [...staticUrls, ...excursionUrls, ...categoryUrls, ...multilingualUrls]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls
  .map(
    (url) => `
  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
    ${
      !url.url.includes("/es/") && !url.url.includes("/en/") && !url.url.includes("/de/")
        ? `
    <xhtml:link rel="alternate" hreflang="es" href="${url.url.replace(baseUrl, `${baseUrl}/es`)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${url.url.replace(baseUrl, `${baseUrl}/en`)}" />
    <xhtml:link rel="alternate" hreflang="de" href="${url.url.replace(baseUrl, `${baseUrl}/de`)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${url.url}" />`
        : ""
    }
  </url>`,
  )
  .join("")}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return new NextResponse("Error generating sitemap", { status: 500 })
  }
}
