import { requireOrganizationRole } from "@/lib/supabase-server"
import type { SiteLocale, SitePageKey, SitePageRecord } from "@/lib/site-content"
import { WebsiteEditor } from "@/components/admin/website-editor"

export default async function WebsiteSettingsPage() {
  const { client, organizationId } = await requireOrganizationRole(["owner", "admin"])
  const [pagesResult, historyResult, excursionsResult, featuredResult] = await Promise.all([
    client.from("organization_site_pages").select("page_key, locale, content, version, updated_at").eq("organization_id", organizationId),
    client.from("organization_site_page_versions").select("id, page_key, locale, version, published_at").eq("organization_id", organizationId).order("published_at", { ascending: false }).limit(100),
    client.from("excursions").select("id, name_es, name_en, price").eq("organization_id", organizationId).eq("is_published", true).order("created_at", { ascending: false }),
    client.from("organization_featured_excursions").select("excursion_id, position").eq("organization_id", organizationId).order("position"),
  ])

  const loadError = pagesResult.error || historyResult.error || excursionsResult.error || featuredResult.error
  if (loadError) {
    console.error("Website editor data load failed:", loadError.code)
    return <div className="space-y-4"><header><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Tu web</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950">Contenido del sitio</h1></header><section role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-900"><h2 className="font-semibold">No se pudo cargar el editor</h2><p className="mt-1">No hemos cargado todas las páginas, el historial o las excursiones destacables. No edites ni publiques hasta resolverlo, para evitar sustituir contenido por valores iniciales. Comprueba la conexión y las migraciones de contenido del sitio.</p></section></div>
  }

  return <div className="space-y-6">
    <header>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Tu web</p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Contenido del sitio</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Personaliza en español e inglés la portada, navegación, pie de página, páginas informativas, contacto, catálogo, preguntas frecuentes y documentos legales. Cada cambio se publica al guardar y conserva versiones anteriores.</p>
    </header>
    <WebsiteEditor initialPages={(pagesResult.data ?? []) as SitePageRecord[]} history={(historyResult.data ?? []) as Array<{ id: string; page_key: SitePageKey; locale: SiteLocale; version: number; published_at: string }>} excursions={(excursionsResult.data ?? []) as Array<{ id: number; name_es: string; name_en: string; price: number }>} initialFeaturedIds={(featuredResult.data ?? []).map((item) => item.excursion_id)} />
  </div>
}
