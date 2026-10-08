import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

const escapeXml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;")

export async function GET() {
  try {
    const client = await createServerSupabaseClient()
    const [{ data: host }, { data: excursions }, { data: categories }] = await Promise.all([
      client.rpc("current_public_organization_domain"),
      client.from("excursions").select("id, updated_at, created_at").eq("is_published", true).order("updated_at", { ascending: false }),
      client.from("categories").select("id, updated_at").eq("active", true),
    ])
    if (!host) return new NextResponse("Domain is not configured", { status: 404 })
    const baseUrl = `${host === "localhost" || host === "127.0.0.1" ? "http" : "https"}://${host}`
    const now = new Date().toISOString()
    const entries = [
      [baseUrl, now], [`${baseUrl}/excursions`, now], [`${baseUrl}/about`, now],
      [`${baseUrl}/contact`, now], [`${baseUrl}/faq`, now], [`${baseUrl}/privacy`, now], [`${baseUrl}/terms`, now],
      ...(excursions ?? []).map((row) => [`${baseUrl}/excursions/${row.id}`, row.updated_at || row.created_at]),
      ...(categories ?? []).map((row) => [`${baseUrl}/excursions/category/${row.id}`, row.updated_at || now]),
    ] as Array<[string, string]>
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(([url, modified]) => `<url><loc>${escapeXml(url)}</loc><lastmod>${escapeXml(modified)}</lastmod></url>`).join("")}</urlset>`
    return new NextResponse(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" } })
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return new NextResponse("Error generating sitemap", { status: 500 })
  }
}
