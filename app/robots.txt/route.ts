import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  let sitemap = ""
  try {
    const client = await createServerSupabaseClient()
    const { data: host } = await client.rpc("current_public_organization_domain")
    if (host) {
      const protocol = host === "localhost" || host === "127.0.0.1" ? "http" : "https"
      sitemap = `Sitemap: ${protocol}://${host}/sitemap.xml\n`
    }
  } catch {
    // A not-yet-provisioned tenant can still receive a valid minimal robots file.
  }
  const body = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /platform/\nDisallow: /api/\nDisallow: /auth/\n${sitemap}`
  return new NextResponse(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } })
}
