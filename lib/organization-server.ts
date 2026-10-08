import "server-only"
import { cache } from "react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { OrganizationBrand } from "@/lib/organization-context"

export const getPublicOrganization = cache(async (): Promise<OrganizationBrand | null> => {
  try {
    const client = await createServerSupabaseClient()
    const [{ data: organization }, { data: primaryDomain }] = await Promise.all([
      client
        .from("organizations")
        .select("id, slug, name, logo_url, primary_color, secondary_color, default_locale, support_email, phone, address")
        .maybeSingle(),
      client.rpc("current_public_organization_domain"),
    ])
    return organization ? { ...organization, primary_domain: primaryDomain ?? null } as OrganizationBrand : null
  } catch {
    return null
  }
})

export const getPublicSitePage = cache(async (page: "home" | "about" | "faq" | "privacy" | "terms", locale: "es" | "en") => {
  try {
    const client = await createServerSupabaseClient()
    const { data } = await client.from("organization_site_pages").select("content")
      .eq("page_key", page).eq("locale", locale).maybeSingle()
    if (data?.content) return data.content as Record<string, unknown>
    if (locale === "en") {
      const { data: spanish } = await client.from("organization_site_pages").select("content")
        .eq("page_key", page).eq("locale", "es").maybeSingle()
      if (spanish?.content) return spanish.content as Record<string, unknown>
    }
  } catch {
    return null
  }
  return null
})
