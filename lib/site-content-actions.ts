"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireOrganizationRole } from "@/lib/supabase-server"
import type { SitePageKey } from "@/lib/site-content"

const localizedText = z.string().trim().max(5000)
const sectionSchema = z.object({ title: z.string().trim().min(1).max(140), body: localizedText }).strict()
const faqItemSchema = z.object({ question: z.string().trim().min(1).max(300), answer: localizedText.min(1) }).strict()
const safeUrl = z.string().trim().max(2048).refine((value) => {
  if (!value) return true
  if (value.startsWith("/")) return !value.startsWith("//")
  try { return new URL(value).protocol === "https:" } catch { return false }
}, "Usa una ruta interna o una URL HTTPS.")

const contentSchemas: Record<SitePageKey, z.ZodType<Record<string, unknown>>> = {
  home: z.object({
    hero: z.object({
      variant: z.enum(["search", "offer"]), badge: localizedText, title: z.string().trim().min(1).max(180),
      subtitle: localizedText, description: localizedText, ctaLabel: z.string().trim().min(1).max(80),
      ctaHref: safeUrl, imageUrl: safeUrl, offerExcursionId: z.number().int().positive().nullable(),
    }).strict(),
    featured: z.object({ badge: localizedText, title: z.string().trim().min(1).max(180), subtitle: localizedText }).strict(),
    trust: z.object({ location: localizedText, team: localizedText, direct: localizedText, bookingPrompt: localizedText, bookingLink: localizedText, scrollLabel: localizedText }).strict(),
    process: z.object({ eyebrow: localizedText, title: z.string().trim().min(1).max(180), description: localizedText, step1Title: z.string().trim().min(1).max(140), step1Body: localizedText, step2Title: z.string().trim().min(1).max(140), step2Body: localizedText, step3Title: z.string().trim().min(1).max(140), step3Body: localizedText }).strict(),
    closing: z.object({ badge: localizedText, title: z.string().trim().min(1).max(180), highlight: localizedText, description: localizedText, secondaryDescription: localizedText, primaryCta: z.string().trim().min(1).max(80), primaryHref: safeUrl, secondaryCta: z.string().trim().min(1).max(80), secondaryHref: safeUrl, imageUrl: safeUrl }).strict(),
    gallery: z.object({ badge: localizedText, title: z.string().trim().min(1).max(180), subtitle: localizedText, images: z.array(safeUrl).max(12) }).strict(),
    seo: z.object({ title: z.string().trim().max(180), description: z.string().trim().max(320), keywords: z.string().trim().max(500) }).strict(),
  }).strict() as z.ZodType<Record<string, unknown>>,
  about: z.object({
    eyebrow: localizedText, title: z.string().trim().min(1).max(180), subtitle: localizedText, intro: localizedText,
    heroImage: safeUrl, ctaLabel: z.string().trim().min(1).max(80), sections: z.array(sectionSchema).length(3),
  }).strict() as z.ZodType<Record<string, unknown>>,
  faq: z.object({ title: z.string().trim().min(1).max(180), items: z.array(faqItemSchema).max(30) }).strict() as z.ZodType<Record<string, unknown>>,
  privacy: z.object({ title: z.string().trim().min(1).max(180), intro: localizedText, sections: z.array(sectionSchema).min(1).max(20) }).strict() as z.ZodType<Record<string, unknown>>,
  terms: z.object({ title: z.string().trim().min(1).max(180), intro: localizedText, sections: z.array(sectionSchema).min(1).max(20) }).strict() as z.ZodType<Record<string, unknown>>,
  global: z.object({
    brandTagline: localizedText,
    nav: z.object({ home: z.string().trim().min(1).max(60), excursions: z.string().trim().min(1).max(60), about: z.string().trim().min(1).max(60), contact: z.string().trim().min(1).max(60), booking: z.string().trim().min(1).max(60), account: z.string().trim().min(1).max(60) }).strict(),
    footer: z.object({ tagline: localizedText, summary: localizedText, quickLinksTitle: localizedText, contactTitle: localizedText, discoverTitle: localizedText, discoverText: localizedText, discoverCta: z.string().trim().min(1).max(80), rights: localizedText }).strict(),
  }).strict() as z.ZodType<Record<string, unknown>>,
  contact: z.object({ badge: localizedText, title: z.string().trim().min(1).max(180), subtitle: localizedText, description: localizedText, formTitle: localizedText, formSubtitle: localizedText, benefitsTitle: localizedText, benefit1Title: localizedText, benefit1Body: localizedText, benefit2Title: localizedText, benefit2Body: localizedText, benefit3Title: localizedText, benefit3Body: localizedText, benefit4Title: localizedText, benefit4Body: localizedText, ctaTitle: localizedText, ctaText: localizedText, ctaContact: z.string().trim().min(1).max(80), ctaExcursions: z.string().trim().min(1).max(80), quickResponse: localizedText }).strict() as z.ZodType<Record<string, unknown>>,
  excursions: z.object({ eyebrow: localizedText, title: z.string().trim().min(1).max(180), titleAccent: localizedText, description: localizedText, availableLabel: localizedText, paceValue: localizedText, paceLabel: localizedText, directValue: localizedText, directLabel: localizedText }).strict() as z.ZodType<Record<string, unknown>>,
}

export async function publishSitePage(pageKeyValue: string, localeValue: string, content: unknown) {
  const pageKey = z.enum(["home", "about", "faq", "privacy", "terms", "global", "contact", "excursions"]).safeParse(pageKeyValue)
  const locale = z.enum(["es", "en"]).safeParse(localeValue)
  if (!pageKey.success || !locale.success) return { success: false as const, error: "Página o idioma no válido." }
  const parsed = contentSchemas[pageKey.data].safeParse(content)
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message ?? "Revisa los campos." }
  if (pageKey.data === "privacy" || pageKey.data === "terms") {
    const hasIncompleteTemplateFields = /\[\[(?:COMPLETAR|COMPLETE):[^\]]*\]\]/i.test(JSON.stringify(parsed.data))
    if (hasIncompleteTemplateFields) return { success: false as const, error: "Completa o elimina todas las marcas [[COMPLETAR: ...]] / [[COMPLETE: ...]] antes de publicar el contenido legal." }
  }

  const { client } = await requireOrganizationRole(["owner", "admin"])
  if (pageKey.data === "home" && (parsed.data.hero as { variant: string; offerExcursionId: number | null }).variant === "offer") {
    const offerExcursionId = (parsed.data.hero as { offerExcursionId: number | null }).offerExcursionId
    if (!offerExcursionId) return { success: false as const, error: "Selecciona una excursión publicada para mostrar la oferta." }
    const { data: offer } = await client.from("excursions").select("id").eq("id", offerExcursionId).eq("is_published", true).maybeSingle()
    if (!offer) return { success: false as const, error: "La excursión de la oferta no está publicada o ya no existe." }
  }
  const { data: version, error } = await client.rpc("publish_organization_site_page", {
    p_page_key: pageKey.data,
    p_locale: locale.data,
    p_content: parsed.data,
  })
  if (error) {
    console.error("Site page publish failed:", error.code)
    return { success: false as const, error: "No se pudo publicar el contenido." }
  }
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/contact")
  revalidatePath("/excursions")
  revalidatePath("/faq")
  revalidatePath("/admin/website")
  return { success: true as const, version: version as number }
}

export async function restoreSitePageVersion(versionId: string) {
  const id = z.string().uuid().safeParse(versionId)
  if (!id.success) return { success: false as const, error: "Versión no válida." }
  const { client } = await requireOrganizationRole(["owner", "admin"])
  const { data: version, error } = await client.rpc("restore_organization_site_page_version", { p_version_id: id.data })
  if (error) {
    console.error("Site page restore failed:", error.code)
    return { success: false as const, error: "No se pudo restaurar la versión." }
  }
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/admin/website")
  return { success: true as const, version: version as number }
}

export async function saveFeaturedExcursions(excursionIds: number[]) {
  const parsed = z.array(z.number().int().positive()).max(8).safeParse(excursionIds)
  if (!parsed.success || new Set(excursionIds).size !== excursionIds.length) {
    return { success: false as const, error: "Selecciona hasta ocho excursiones distintas." }
  }
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const { error } = await client.rpc("replace_organization_featured_excursions", { p_excursion_ids: parsed.data })
  if (error) {
    console.error("Featured excursion update failed:", error.code)
    return { success: false as const, error: "Solo se pueden destacar excursiones publicadas de esta empresa." }
  }
  revalidatePath("/")
  revalidatePath("/admin/manage-excursions")
  return { success: true as const }
}
