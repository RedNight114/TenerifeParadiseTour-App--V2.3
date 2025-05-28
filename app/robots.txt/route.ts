import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = "https://tenerifeparadisetours.com"

  const robotsTxt = `# Robots.txt for TenerifeParadiseTours
User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Allow important crawlers
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Host
Host: ${baseUrl}
`

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
