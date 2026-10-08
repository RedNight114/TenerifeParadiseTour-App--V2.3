"use client"

import { useMemo, useState, useTransition, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, Check, Clock3, Globe2, Info, MousePointer2, RotateCcw, Save, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { defaultSiteContent, getObject, getText, getTextList, mergeSiteContent, siteLocaleLabels, sitePageLabels, type SiteLocale, type SitePageKey, type SitePageRecord } from "@/lib/site-content"
import { publishSitePage, restoreSitePageVersion, saveFeaturedExcursions } from "@/lib/site-content-actions"
import { VisualWebsiteEditor } from "@/components/admin/visual-website-editor"

type HistoryRecord = { id: string; page_key: SitePageKey; locale: SiteLocale; version: number; published_at: string }
type ExcursionOption = { id: number; name_es: string; name_en: string; price: number }

const pages: SitePageKey[] = ["home", "about", "faq", "privacy", "terms", "global", "contact", "excursions"]
const locales: SiteLocale[] = ["es", "en"]

const pageHelp: Record<SitePageKey, { purpose: string; tip: string; preview: string }> = {
  home: {
    purpose: "La portada es la primera impresión de tu empresa. Aquí eliges el mensaje principal, las fotos, las excursiones que quieres recomendar y cómo explicas el proceso de reserva.",
    tip: "Empieza por un título claro y una foto horizontal de buena calidad. Si eliges «Oferta de excursión», selecciona también una excursión publicada para que aparezcan su precio y enlace reales.",
    preview: "Portada, bloques de confianza, proceso de reserva, galería y excursiones destacadas.",
  },
  about: {
    purpose: "Cuenta quién organiza las excursiones y qué hace especial a tu equipo. Cada bloque puede explicar una parte distinta de vuestra historia.",
    tip: "Usa párrafos breves y concretos. Puedes contar vuestra experiencia, cómo cuidáis a los visitantes o qué zonas conocéis mejor.",
    preview: "Página «Nosotros» y sus bloques de historia.",
  },
  faq: {
    purpose: "Responde dudas frecuentes antes de que el cliente reserve. Cada pregunta y respuesta se muestra como un bloque independiente.",
    tip: "Escribe la pregunta como la formularía un viajero. Incluye respuestas prácticas sobre horarios, punto de encuentro, cancelaciones y qué llevar.",
    preview: "Página de preguntas frecuentes. Puedes añadir hasta 30 preguntas.",
  },
  privacy: {
    purpose: "Explica qué datos personales recoge la empresa, para qué se usan y cómo puede ejercer sus derechos el cliente.",
    tip: "Completa cada marca pendiente con los datos reales de tu empresa y revisa el texto con una persona asesora antes de publicarlo.",
    preview: "Política de privacidad, abierta desde el pie de página.",
  },
  terms: {
    purpose: "Describe las condiciones de compra y participación en las excursiones para que el cliente sepa qué esperar.",
    tip: "Comprueba especialmente precios, pagos, cancelaciones, cambios, requisitos y datos de contacto. El texto base no sustituye asesoramiento jurídico.",
    preview: "Términos y condiciones, abiertos desde el pie de página.",
  },
  global: {
    purpose: "Cambia los textos compartidos por todo el sitio: lema de marca, nombres del menú y contenido del pie de página.",
    tip: "Aquí solo cambias las etiquetas visibles; los enlaces y acciones siguen funcionando igual. Las páginas legales se editan por separado.",
    preview: "Cabecera de navegación y pie de página de todas las páginas públicas.",
  },
  contact: {
    purpose: "Personaliza cómo se presenta el contacto, qué motivos para confiar en tu equipo destacas y los mensajes que invitan a escribirte.",
    tip: "Antes de publicar, comprueba que los datos de contacto de la empresa también estén actualizados en la configuración de empresa.",
    preview: "Página de contacto y sus llamadas a la acción.",
  },
  excursions: {
    purpose: "Ajusta el encabezado y los mensajes que acompañan al catálogo público de excursiones.",
    tip: "Estos textos no cambian los nombres, precios ni disponibilidad de cada excursión: esos datos se gestionan desde el módulo de excursiones.",
    preview: "Encabezado, descripción y mensajes del listado público de excursiones.",
  },
}

export function WebsiteEditor({ initialPages, history, excursions, initialFeaturedIds }: { initialPages: SitePageRecord[]; history: HistoryRecord[]; excursions: ExcursionOption[]; initialFeaturedIds: number[] }) {
  const router = useRouter()
  const [page, setPage] = useState<SitePageKey>("home")
  const [locale, setLocale] = useState<SiteLocale>("es")
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [version, setVersion] = useState(0)
  const [featuredIds, setFeaturedIds] = useState(initialFeaturedIds)
  const [featuredMessage, setFeaturedMessage] = useState("")
  const [visualOpen, setVisualOpen] = useState(false)
  const row = initialPages.find((item) => item.page_key === page && item.locale === locale)
  const expectedPublications = pages.length * locales.length
  const publishedPages = new Set(initialPages.map((item) => `${item.page_key}:${item.locale}`)).size
  const [drafts, setDrafts] = useState<Record<string, Record<string, unknown>>>(() => Object.fromEntries(initialPages.map((item) => [`${item.page_key}:${item.locale}`, mergeSiteContent(item.page_key, item.locale, item.content)])))
  const content = drafts[`${page}:${locale}`] ?? mergeSiteContent(page, locale, row?.content)
  const visualDrafts = useMemo(() => Object.fromEntries(pages.map((key) => {
    const record = initialPages.find((item) => item.page_key === key && item.locale === locale)
    return [key, drafts[`${key}:${locale}`] ?? mergeSiteContent(key, locale, record?.content)]
  })), [drafts, initialPages, locale]) as Partial<Record<SitePageKey, Record<string, unknown>>>
  const pageHistory = useMemo(() => history.filter((item) => item.page_key === page && item.locale === locale).slice(0, 8), [history, page, locale])

  function update(next: Record<string, unknown>) {
    setDrafts((current) => ({ ...current, [`${page}:${locale}`]: next }))
  }

  function setTop(key: string, value: string) { update({ ...content, [key]: value }) }
  function setNested(section: string, key: string, value: unknown) {
    update({ ...content, [section]: { ...getObject(content, section), [key]: value } })
  }

  function resetLegalTemplate() {
    const pageLabel = page === "privacy" ? "política de privacidad" : "términos y condiciones"
    if (!window.confirm(`Se restaurará la plantilla base en ${locale === "es" ? "español" : "inglés"} y se perderán los cambios no guardados de esta página. ¿Continuar?`)) return
    update(defaultSiteContent(page, locale))
    setMessage(`Plantilla base de ${pageLabel} cargada en el editor. Completa las marcas pendientes y publica cuando esté revisada.`)
  }

  function save() {
    setMessage("")
    startTransition(async () => {
      const result = await publishSitePage(page, locale, content)
      if (!result.success) { setMessage(result.error); return }
      setVersion(result.version)
      setMessage(`Publicado ahora · versión ${result.version}`)
      router.refresh()
    })
  }

  function updateVisualPath(targetPage: SitePageKey, path: string, value: string) {
    if (!/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(path) || path.split(".").some((part) => ["__proto__", "prototype", "constructor"].includes(part))) return
    const keys = path.split(".")
    setDrafts((current) => {
      const targetKey = `${targetPage}:${locale}`
      const source = current[targetKey] ?? mergeSiteContent(targetPage, locale, initialPages.find((item) => item.page_key === targetPage && item.locale === locale)?.content)
      const root = structuredClone(source)
      let cursor = root
      for (let index = 0; index < keys.length - 1; index += 1) {
        const key = keys[index]
        const child = cursor[key]
        if (Array.isArray(child)) {
          const itemIndex = Number(keys[index + 1])
          if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= child.length) return current
          cursor = child[itemIndex] as Record<string, unknown>
          index += 1
        } else {
          if (!child || typeof child !== "object") return current
          cursor = child as Record<string, unknown>
        }
      }
      cursor[keys[keys.length - 1]] = value
      return { ...current, [targetKey]: root }
    })
  }

  function publishVisualPage(targetPage: SitePageKey, targetLocale: SiteLocale) {
    const targetRow = initialPages.find((item) => item.page_key === targetPage && item.locale === targetLocale)
    const targetContent = drafts[`${targetPage}:${targetLocale}`] ?? mergeSiteContent(targetPage, targetLocale, targetRow?.content)
    setMessage("")
    startTransition(async () => {
      const result = await publishSitePage(targetPage, targetLocale, targetContent)
      if (!result.success) { setMessage(result.error); return }
      setPage(targetPage)
      setLocale(targetLocale)
      setVersion(result.version)
      setMessage(`Publicado ahora · versión ${result.version}`)
      router.refresh()
      setVisualOpen(false)
    })
  }

  function restore(id: string) {
    if (!window.confirm("Esto publicará esa versión inmediatamente. ¿Continuar?")) return
    setMessage("")
    startTransition(async () => {
      const result = await restoreSitePageVersion(id)
      if (!result.success) { setMessage(result.error); return }
      setVersion(result.version)
      setMessage(`Versión restaurada y publicada · versión ${result.version}`)
      router.refresh()
    })
  }

  function toggleFeatured(id: number) {
    setFeaturedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 8 ? [...current, id] : current)
  }

  function moveFeatured(index: number, delta: number) {
    setFeaturedIds((current) => {
      const nextIndex = index + delta
      if (nextIndex < 0 || nextIndex >= current.length) return current
      const next = [...current]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
  }

  function saveFeatured() {
    setFeaturedMessage("")
    startTransition(async () => {
      const result = await saveFeaturedExcursions(featuredIds)
      setFeaturedMessage(result.success ? "Selección publicada." : result.error)
      if (result.success) router.refresh()
    })
  }

  const nested = (name: string) => getObject(content, name)
  const nestedText = (name: string, key: string, fallback = "") => getText(nested(name), key, fallback)
  const galleryImages = Array.isArray(nested("gallery").images) ? (nested("gallery").images as unknown[]).filter((value): value is string => typeof value === "string") : []

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <section className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4 sm:p-5 xl:col-span-2" aria-label="Estado de personalización del sitio">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-semibold text-teal-950">Personalización por empresa</p><p className="mt-1 text-sm leading-6 text-teal-900/80">Cada página e idioma se guarda asociado a esta empresa. Guardar publica el cambio y conserva la versión anterior. La conexión del dominio se gestiona aparte.</p></div>
          <div className="min-w-36 rounded-xl border border-teal-200 bg-white px-3 py-2"><p className="text-xs font-medium text-slate-600">Páginas publicadas</p><p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-950">{publishedPages} <span className="text-sm font-medium text-slate-500">/ {expectedPublications}</span></p></div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-teal-100"><div className="h-full rounded-full bg-teal-700 transition-[width] duration-200" style={{ width: `${Math.round((publishedPages / expectedPublications) * 100)}%` }} /></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:col-span-2" aria-labelledby="editor-guide-title">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-lg bg-teal-50 p-2 text-teal-800"><Info className="h-4 w-4" aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <h2 id="editor-guide-title" className="font-semibold text-slate-950">Guía rápida: publica los cambios con seguridad</h2>
            <ol className="mt-3 grid gap-3 text-sm leading-5 text-slate-700 sm:grid-cols-2 xl:grid-cols-4">
              <li className="rounded-lg bg-slate-50 p-3"><span className="font-semibold text-slate-950">1. Elige página e idioma.</span><span className="mt-1 block">Cada combinación se edita y publica por separado.</span></li>
              <li className="rounded-lg bg-slate-50 p-3"><span className="font-semibold text-slate-950">2. Edita el contenido.</span><span className="mt-1 block">Los campos son textos visibles; las imágenes permiten subir un archivo o indicar una URL segura.</span></li>
              <li className="rounded-lg bg-slate-50 p-3"><span className="font-semibold text-slate-950">3. Revisa la vista previa.</span><span className="mt-1 block">«Editar visualmente» muestra dónde aparece cada texto y permite ajustarlo sobre la página.</span></li>
              <li className="rounded-lg bg-slate-50 p-3"><span className="font-semibold text-slate-950">4. Guarda y publica.</span><span className="mt-1 block">El cambio se hace público al instante. Se guarda una versión para poder restaurarla.</span></li>
            </ol>
            <p className="mt-3 text-xs leading-5 text-slate-600">Los cambios de este editor solo afectan al sitio de tu empresa. Si sales sin publicar, los cambios de los campos normales no se conservan como borrador.</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">¿Buscas cambiar el logotipo, el nombre o los colores de marca? Se configuran en <Link className="font-semibold text-teal-800 underline underline-offset-2" href="/admin/organization">Configuración de empresa</Link>; aquí editas los textos y las imágenes de cada página.</p>
          </div>
        </div>
      </section>
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Contenido público</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">{sitePageLabels[page]}</h2>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Seleccionar idioma">
              {locales.map((item) => <Button key={item} type="button" size="sm" variant={locale === item ? "default" : "outline"} onClick={() => setLocale(item)}><Globe2 className="mr-2 h-4 w-4" />{siteLocaleLabels[item]}</Button>)}
              <Button type="button" size="sm" variant="outline" onClick={() => setVisualOpen(true)}><MousePointer2 className="mr-2 h-4 w-4" />Editar visualmente</Button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Seleccionar página">
            {pages.map((item) => <Button key={item} type="button" variant={page === item ? "secondary" : "ghost"} size="sm" onClick={() => setPage(item)}>{sitePageLabels[item]}</Button>)}
          </div>
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4" aria-live="polite">
            <p className="text-sm font-semibold text-blue-950">¿Qué puedes cambiar aquí?</p>
            <p className="mt-1 text-sm leading-5 text-blue-950/90">{pageHelp[page].purpose}</p>
            <p className="mt-2 text-sm leading-5 text-blue-950"><span className="font-semibold">Consejo:</span> {pageHelp[page].tip}</p>
            <p className="mt-2 text-xs leading-5 text-blue-900"><span className="font-semibold">Se verá en:</span> {pageHelp[page].preview}</p>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {page === "home" && <>
            <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
              <h3 className="font-semibold text-slate-900">Hero principal</h3>
              <p className="mb-4 mt-1 text-xs leading-5 text-slate-600">Es el primer bloque que verá el visitante. «Con buscador» ayuda a encontrar excursiones; «Oferta de excursión» destaca una experiencia concreta.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Estilo del hero"><select className={selectClass} value={nestedText("hero", "variant", "search")} onChange={(event) => setNested("hero", "variant", event.target.value)}><option value="search">Con buscador</option><option value="offer">Oferta de excursión</option></select></Field>
                <TextField label="Texto breve" value={nestedText("hero", "badge")} onChange={(value) => setNested("hero", "badge", value)} />
                <TextField label="Título" value={nestedText("hero", "title")} onChange={(value) => setNested("hero", "title", value)} required />
                <TextField label="Subtítulo" value={nestedText("hero", "subtitle")} onChange={(value) => setNested("hero", "subtitle", value)} />
                <div className="sm:col-span-2"><TextAreaField label="Descripción" value={nestedText("hero", "description")} onChange={(value) => setNested("hero", "description", value)} /></div>
                <TextField label="Texto del botón" value={nestedText("hero", "ctaLabel")} onChange={(value) => setNested("hero", "ctaLabel", value)} required />
                <TextField label="Destino (ruta interna o URL HTTPS)" value={nestedText("hero", "ctaHref", "/excursions")} onChange={(value) => setNested("hero", "ctaHref", value)} />
                <div className="sm:col-span-2"><ImageUpload label="Imagen principal de portada" value={nestedText("hero", "imageUrl")} onChange={(value) => setNested("hero", "imageUrl", value)} placeholder="URL segura o sube una imagen" /></div>
                {nestedText("hero", "variant") === "offer" && <Field label="Excursión de la oferta"><select className={selectClass} value={String(nested("hero").offerExcursionId ?? "")} onChange={(event) => setNested("hero", "offerExcursionId", event.target.value ? Number(event.target.value) : null)}><option value="">Selecciona una excursión publicada</option>{excursions.map((item) => <option key={item.id} value={item.id}>{locale === "en" ? item.name_en || item.name_es : item.name_es} · {item.price} €</option>)}</select><p className="mt-1 text-xs text-slate-500">El precio y el enlace se obtienen del catálogo.</p></Field>}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
              <h3 className="font-semibold text-slate-900">Llamada final a la acción</h3>
              <p className="mb-4 mt-1 text-xs leading-5 text-slate-600">Es el bloque de cierre de la portada. El destino puede ser una ruta del sitio, por ejemplo <code>/excursions</code>, o una dirección HTTPS completa.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Etiqueta" value={nestedText("closing", "badge")} onChange={(value) => setNested("closing", "badge", value)} />
                <TextField label="Título" value={nestedText("closing", "title")} onChange={(value) => setNested("closing", "title", value)} required />
                <TextField label="Texto destacado" value={nestedText("closing", "highlight")} onChange={(value) => setNested("closing", "highlight", value)} />
                <TextField label="Botón principal" value={nestedText("closing", "primaryCta")} onChange={(value) => setNested("closing", "primaryCta", value)} required />
                <TextField label="Destino principal" value={nestedText("closing", "primaryHref", "/excursions")} onChange={(value) => setNested("closing", "primaryHref", value)} />
                <TextField label="Botón secundario" value={nestedText("closing", "secondaryCta")} onChange={(value) => setNested("closing", "secondaryCta", value)} required />
                <TextField label="Destino secundario" value={nestedText("closing", "secondaryHref", "/contact")} onChange={(value) => setNested("closing", "secondaryHref", value)} />
                <div className="sm:col-span-2"><TextAreaField label="Descripción" value={nestedText("closing", "description")} onChange={(value) => setNested("closing", "description", value)} /></div>
                <div className="sm:col-span-2"><TextAreaField label="Texto complementario" value={nestedText("closing", "secondaryDescription")} onChange={(value) => setNested("closing", "secondaryDescription", value)} /></div>
                <div className="sm:col-span-2"><ImageUpload label="Fondo de la llamada final" value={nestedText("closing", "imageUrl")} onChange={(value) => setNested("closing", "imageUrl", value)} /></div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-slate-900">Galería de fotos</h3><p className="mt-1 text-xs text-slate-500">Sube imágenes o usa URL seguras; máximo doce.</p></div><Button type="button" size="sm" variant="outline" disabled={galleryImages.length >= 12} onClick={() => setNested("gallery", "images", [...galleryImages, ""])}>Añadir imagen</Button></div>
              <div className="grid gap-4 sm:grid-cols-2"><TextField label="Etiqueta" value={nestedText("gallery", "badge")} onChange={(value) => setNested("gallery", "badge", value)} /><TextField label="Título" value={nestedText("gallery", "title")} onChange={(value) => setNested("gallery", "title", value)} required /><div className="sm:col-span-2"><TextAreaField label="Descripción" value={nestedText("gallery", "subtitle")} onChange={(value) => setNested("gallery", "subtitle", value)} /></div></div>
              <div className="mt-4 space-y-4">{galleryImages.map((image, index) => <div key={`${index}-${image.slice(0, 24)}`} className="flex items-end gap-3"><div className="min-w-0 flex-1"><ImageUpload label={`Imagen ${index + 1}`} value={image} onChange={(value) => { const next = [...galleryImages]; next[index] = value; setNested("gallery", "images", next) }} /></div><Button type="button" variant="outline" size="sm" onClick={() => setNested("gallery", "images", galleryImages.filter((_, position) => position !== index))}>Quitar</Button></div>)}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
              <h3 className="mb-4 font-semibold text-slate-900">Excursiones destacadas</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Etiqueta" value={nestedText("featured", "badge")} onChange={(value) => setNested("featured", "badge", value)} />
                <TextField label="Título de sección" value={nestedText("featured", "title")} onChange={(value) => setNested("featured", "title", value)} required />
                <div className="sm:col-span-2"><TextAreaField label="Descripción" value={nestedText("featured", "subtitle")} onChange={(value) => setNested("featured", "subtitle", value)} /></div>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-medium text-slate-900">Elige hasta ocho experiencias</p><p className="text-xs text-slate-500">Si no eliges ninguna, se mostrarán las publicadas más recientemente.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{featuredIds.length}/8</span></div>
                {excursions.length === 0 ? <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Publica alguna excursión para poder destacarla.</p> : <div className="grid gap-2 sm:grid-cols-2">{excursions.map((item) => <label key={item.id} className={`flex min-h-12 items-center gap-3 rounded-lg border p-3 text-sm ${featuredIds.includes(item.id) ? "border-teal-300 bg-teal-50" : "border-slate-200"}`}><input type="checkbox" checked={featuredIds.includes(item.id)} disabled={!featuredIds.includes(item.id) && featuredIds.length >= 8} onChange={() => toggleFeatured(item.id)} className="h-4 w-4 accent-teal-800" /><span className="min-w-0 flex-1 truncate">{locale === "en" ? item.name_en || item.name_es : item.name_es}</span><span className="text-xs text-slate-500">{item.price} €</span></label>)}</div>}
                {featuredIds.length > 0 && <ol className="mt-3 space-y-1">{featuredIds.map((id, index) => { const item = excursions.find((entry) => entry.id === id); return item ? <li key={id} className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm"><Star className="h-3.5 w-3.5 text-amber-600" /><span className="min-w-0 flex-1 truncate">{index + 1}. {item.name_es}</span><Button type="button" variant="ghost" size="icon" aria-label="Subir" disabled={index === 0} onClick={() => moveFeatured(index, -1)}><ArrowUp className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" aria-label="Bajar" disabled={index === featuredIds.length - 1} onClick={() => moveFeatured(index, 1)}><ArrowDown className="h-4 w-4" /></Button></li> : null })}</ol>}
                <div className="mt-3 flex flex-wrap items-center gap-3"><Button type="button" size="sm" variant="outline" onClick={saveFeatured} disabled={pending}>Guardar destacadas</Button><span role="status" className="text-sm text-slate-600">{featuredMessage}</span></div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
              <h3 className="font-semibold text-slate-900">Confianza y proceso de reserva</h3>
              <p className="mb-4 mt-1 text-xs leading-5 text-slate-600">Explica por qué reservar contigo y qué pasos seguirá el cliente. El enlace para consultar reservas debe apuntar a una página pública de tu sitio.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Frase: ubicación" value={nestedText("trust", "location")} onChange={(value) => setNested("trust", "location", value)} />
                <TextField label="Frase: equipo" value={nestedText("trust", "team")} onChange={(value) => setNested("trust", "team", value)} />
                <TextField label="Frase: reserva directa" value={nestedText("trust", "direct")} onChange={(value) => setNested("trust", "direct", value)} />
                <TextField label="Enlace para consultar una reserva" value={nestedText("trust", "bookingLink")} onChange={(value) => setNested("trust", "bookingLink", value)} />
                <TextField label="Texto antes del enlace de reserva" value={nestedText("trust", "bookingPrompt")} onChange={(value) => setNested("trust", "bookingPrompt", value)} />
                <TextField label="Indicador para bajar a excursiones" value={nestedText("trust", "scrollLabel")} onChange={(value) => setNested("trust", "scrollLabel", value)} />
                <TextField label="Etiqueta de la sección" value={nestedText("process", "eyebrow")} onChange={(value) => setNested("process", "eyebrow", value)} />
                <TextField label="Título de la sección" value={nestedText("process", "title")} onChange={(value) => setNested("process", "title", value)} required />
                <div className="sm:col-span-2"><TextAreaField label="Descripción" value={nestedText("process", "description")} onChange={(value) => setNested("process", "description", value)} /></div>
                {[1, 2, 3].map((step) => <div key={step} className="space-y-3 rounded-lg bg-slate-50 p-3"><p className="text-sm font-semibold text-slate-800">Paso {step}</p><TextField label="Título" value={nestedText("process", `step${step}Title`)} onChange={(value) => setNested("process", `step${step}Title`, value)} required /><TextAreaField label="Descripción" value={nestedText("process", `step${step}Body`)} onChange={(value) => setNested("process", `step${step}Body`, value)} /></div>)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
              <h3 className="mb-1 font-semibold text-slate-900">Buscadores y redes sociales</h3>
              <p className="mb-4 text-xs leading-5 text-slate-500">El nombre de la empresa se añadirá automáticamente al título. No incluyas información que no quieras hacer pública.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Título SEO" value={getText(nested("seo"), "title")} onChange={(value) => setNested("seo", "title", value)} />
                <TextField label="Palabras clave (separadas por comas)" value={getText(nested("seo"), "keywords")} onChange={(value) => setNested("seo", "keywords", value)} />
                <div className="sm:col-span-2"><TextAreaField label="Descripción SEO y de redes" value={getText(nested("seo"), "description")} onChange={(value) => setNested("seo", "description", value)} /></div>
              </div>
            </div>
          </>}

          {page === "about" && <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Etiqueta superior" value={getText(content, "eyebrow")} onChange={(value) => setTop("eyebrow", value)} />
              <TextField label="Título" value={getText(content, "title")} onChange={(value) => setTop("title", value)} required />
              <TextField label="Subtítulo" value={getText(content, "subtitle")} onChange={(value) => setTop("subtitle", value)} />
              <div className="sm:col-span-2"><TextAreaField label="Presentación" value={getText(content, "intro")} onChange={(value) => setTop("intro", value)} /></div>
              <div className="sm:col-span-2"><ImageUpload label="Imagen principal de Nosotros" value={getText(content, "heroImage")} onChange={(value) => setTop("heroImage", value)} placeholder="URL segura o sube una imagen" /></div>
              <TextField label="Botón para ver excursiones" value={getText(content, "ctaLabel")} onChange={(value) => setTop("ctaLabel", value)} />
            </div>
              {getTextList(content, "sections").map((section, index) => <div key={index} className="rounded-xl border border-slate-200 p-4"><h3 className="mb-3 font-semibold">Sección {index + 1}</h3><div className="space-y-3"><TextField label="Título" value={getText(section, "title")} onChange={(value) => { const list = getTextList(content, "sections"); list[index] = { ...list[index], title: value }; update({ ...content, sections: list }) }} /><TextAreaField label="Texto" value={getText(section, "body")} onChange={(value) => { const list = getTextList(content, "sections"); list[index] = { ...list[index], body: value }; update({ ...content, sections: list }) }} /></div></div>)}
          </>}

          {page === "faq" && <>
            <TextField label="Título de la página" value={getText(content, "title")} onChange={(value) => setTop("title", value)} required />
            {getTextList(content, "items").map((item, index) => <div key={index} className="rounded-xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Pregunta {index + 1}</h3><Button type="button" variant="ghost" size="sm" onClick={() => update({ ...content, items: getTextList(content, "items").filter((_, itemIndex) => itemIndex !== index) })}>Quitar</Button></div><div className="space-y-3"><TextField label="Pregunta" value={getText(item, "question")} onChange={(value) => updateListItem("items", index, "question", value)} /><TextAreaField label="Respuesta" value={getText(item, "answer")} onChange={(value) => updateListItem("items", index, "answer", value)} /></div></div>)}
            <Button type="button" variant="outline" disabled={getTextList(content, "items").length >= 30} onClick={() => update({ ...content, items: [...getTextList(content, "items"), { question: "", answer: "" }] })}>Añadir pregunta</Button>
          </>}
          {page === "global" && <>
            <div className="rounded-xl border border-slate-200 p-4 sm:p-5"><h3 className="mb-4 font-semibold text-slate-900">Marca de navegación</h3><TextField label="Lema junto al nombre y logotipo" value={getText(content, "brandTagline")} onChange={(value) => setTop("brandTagline", value)} /></div>
            <div className="rounded-xl border border-slate-200 p-4 sm:p-5"><h3 className="mb-4 font-semibold text-slate-900">Enlaces del menú</h3><div className="grid gap-4 sm:grid-cols-2">{[["home", "Inicio"], ["excursions", "Excursiones"], ["about", "Nosotros"], ["contact", "Contacto"], ["booking", "Reservar"], ["account", "Mis reservas"]].map(([key, label]) => <TextField key={key} label={label} value={getText(nested("nav"), key)} onChange={(value) => setNested("nav", key, value)} required />)}</div><p className="mt-3 text-xs leading-5 text-slate-500">Las rutas, el acceso a reservas y las acciones de cuenta no se modifican; solo cambia el texto visible.</p></div>
            <div className="rounded-xl border border-slate-200 p-4 sm:p-5"><h3 className="mb-4 font-semibold text-slate-900">Pie de página</h3><div className="grid gap-4 sm:grid-cols-2"><TextField label="Lema de empresa" value={getText(nested("footer"), "tagline")} onChange={(value) => setNested("footer", "tagline", value)} /><TextField label="Título de enlaces" value={getText(nested("footer"), "quickLinksTitle")} onChange={(value) => setNested("footer", "quickLinksTitle", value)} /><TextField label="Título de contacto" value={getText(nested("footer"), "contactTitle")} onChange={(value) => setNested("footer", "contactTitle", value)} /><TextField label="Título de excursiones" value={getText(nested("footer"), "discoverTitle")} onChange={(value) => setNested("footer", "discoverTitle", value)} /><TextField label="Texto del enlace a excursiones" value={getText(nested("footer"), "discoverCta")} onChange={(value) => setNested("footer", "discoverCta", value)} /><TextField label="Texto de derechos reservados" value={getText(nested("footer"), "rights")} onChange={(value) => setNested("footer", "rights", value)} /><div className="sm:col-span-2"><TextAreaField label="Presentación breve de la empresa" value={getText(nested("footer"), "summary")} onChange={(value) => setNested("footer", "summary", value)} /></div><div className="sm:col-span-2"><TextAreaField label="Invitación a descubrir excursiones" value={getText(nested("footer"), "discoverText")} onChange={(value) => setNested("footer", "discoverText", value)} /></div></div><p className="mt-3 text-xs leading-5 text-slate-500">La atribución de QuickAgency se mantiene como marca de la plataforma.</p></div>
          </>}
          {page === "contact" && <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><TextField label="Etiqueta superior" value={getText(content, "badge")} onChange={(value) => setTop("badge", value)} /><TextField label="Título principal" value={getText(content, "title")} onChange={(value) => setTop("title", value)} required /><TextField label="Subtítulo" value={getText(content, "subtitle")} onChange={(value) => setTop("subtitle", value)} /><div className="sm:col-span-2"><TextAreaField label="Descripción" value={getText(content, "description")} onChange={(value) => setTop("description", value)} /></div><TextField label="Título del formulario" value={getText(content, "formTitle")} onChange={(value) => setTop("formTitle", value)} /><TextField label="Texto del formulario" value={getText(content, "formSubtitle")} onChange={(value) => setTop("formSubtitle", value)} /><TextField label="Título de beneficios" value={getText(content, "benefitsTitle")} onChange={(value) => setTop("benefitsTitle", value)} /></div><div className="grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="space-y-3 rounded-lg bg-slate-50 p-3"><p className="text-sm font-semibold text-slate-800">Beneficio {item}</p><TextField label="Título" value={getText(content, `benefit${item}Title`)} onChange={(value) => setTop(`benefit${item}Title`, value)} /><TextAreaField label="Descripción" value={getText(content, `benefit${item}Body`)} onChange={(value) => setTop(`benefit${item}Body`, value)} /></div>)}</div><div className="grid gap-4 sm:grid-cols-2"><TextField label="Pregunta de contacto rápido" value={getText(content, "quickResponse")} onChange={(value) => setTop("quickResponse", value)} /><TextField label="Título de la llamada final" value={getText(content, "ctaTitle")} onChange={(value) => setTop("ctaTitle", value)} /><TextField label="Botón de contacto" value={getText(content, "ctaContact")} onChange={(value) => setTop("ctaContact", value)} /><TextField label="Botón de excursiones" value={getText(content, "ctaExcursions")} onChange={(value) => setTop("ctaExcursions", value)} /><div className="sm:col-span-2"><TextAreaField label="Descripción de la llamada final" value={getText(content, "ctaText")} onChange={(value) => setTop("ctaText", value)} /></div></div></div>}
          {page === "excursions" && <div className="grid gap-4 sm:grid-cols-2"><TextField label="Etiqueta superior" value={getText(content, "eyebrow")} onChange={(value) => setTop("eyebrow", value)} /><TextField label="Título principal" value={getText(content, "title")} onChange={(value) => setTop("title", value)} required /><TextField label="Texto destacado del título" value={getText(content, "titleAccent")} onChange={(value) => setTop("titleAccent", value)} /><div className="sm:col-span-2"><TextAreaField label="Descripción" value={getText(content, "description")} onChange={(value) => setTop("description", value)} /></div><TextField label="Etiqueta de contador" value={getText(content, "availableLabel")} onChange={(value) => setTop("availableLabel", value)} /><TextField label="Valor: ritmo" value={getText(content, "paceValue")} onChange={(value) => setTop("paceValue", value)} /><TextField label="Descripción: ritmo" value={getText(content, "paceLabel")} onChange={(value) => setTop("paceLabel", value)} /><TextField label="Valor: trato directo" value={getText(content, "directValue")} onChange={(value) => setTop("directValue", value)} /><TextField label="Descripción: trato directo" value={getText(content, "directLabel")} onChange={(value) => setTop("directLabel", value)} /></div>}

          {(page === "privacy" || page === "terms") && <>
            <div className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-950">Plantilla base editable · {locale === "es" ? "Español" : "English"}</p>
                <p className="mt-1 text-sm leading-5 text-amber-900">Puedes adaptar títulos y apartados libremente. Sustituye todas las marcas <code className="rounded bg-white/70 px-1">[[COMPLETAR: ...]]</code>; el sistema no publicará un texto legal si quedan campos pendientes.</p>
              </div>
              <Button type="button" variant="outline" onClick={resetLegalTemplate} className="shrink-0 border-amber-300 bg-white text-amber-950 hover:bg-amber-100">Restaurar plantilla base</Button>
            </div>
            <TextField label="Título" value={getText(content, "title")} onChange={(value) => setTop("title", value)} required />
            <TextAreaField label="Introducción" value={getText(content, "intro")} onChange={(value) => setTop("intro", value)} />
            {getTextList(content, "sections").map((section, index) => <div key={index} className="rounded-xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Apartado {index + 1}</h3><Button type="button" variant="ghost" size="sm" onClick={() => update({ ...content, sections: getTextList(content, "sections").filter((_, itemIndex) => itemIndex !== index) })}>Quitar</Button></div><div className="space-y-3"><TextField label="Título" value={getText(section, "title")} onChange={(value) => updateListItem("sections", index, "title", value)} /><TextAreaField label="Texto" value={getText(section, "body")} onChange={(value) => updateListItem("sections", index, "body", value)} /></div></div>)}
            <Button type="button" variant="outline" disabled={getTextList(content, "sections").length >= 20} onClick={() => update({ ...content, sections: [...getTextList(content, "sections"), { title: "", body: "" }] })}>Añadir apartado</Button>
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-700">
              <p>Guardar publica inmediatamente solo el idioma actual. Revisa los datos reales de la empresa, proveedores, plazos y políticas; la plantilla es un punto de partida, no asesoramiento jurídico.</p>
              <p>Guías oficiales: <a className="font-semibold text-teal-800 underline underline-offset-2" href="https://www.aepd.es/es/documento/guia-modelo-clausula-informativa.pdf" target="_blank" rel="noreferrer">modelo informativo de la AEPD</a> · <a className="font-semibold text-teal-800 underline underline-offset-2" href="https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555" target="_blank" rel="noreferrer">normativa de consumo (BOE)</a>.</p>
            </div>
          </>}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p role="status" className="min-h-5 text-sm text-slate-600">{message || (version ? `Versión ${version}` : row ? `Publicado · versión ${row.version}` : "Aún no guardado; se aplicará el contenido inicial al guardar.")}</p>
          <Button type="button" onClick={save} disabled={pending} className="bg-teal-800 text-white hover:bg-teal-900"><Save className="mr-2 h-4 w-4" />{pending ? "Publicando…" : "Guardar y publicar"}</Button>
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-teal-800" /><h3 className="font-semibold text-slate-900">Versiones publicadas</h3></div>
        <p className="mt-2 text-xs leading-5 text-slate-500">Guardar publica inmediatamente. Puedes volver a una versión anterior; esa restauración también crea una versión nueva.</p>
        <div className="mt-4 space-y-2">
          {pageHistory.length === 0 ? <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Todavía no hay historial.</p> : pageHistory.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 p-3"><div><p className="text-sm font-medium">Versión {item.version}</p><p className="text-xs text-slate-500">{new Date(item.published_at).toLocaleString(locale === "es" ? "es-ES" : "en-GB")}</p></div>{item.version !== row?.version && <Button type="button" size="icon" variant="ghost" title="Restaurar y publicar" onClick={() => restore(item.id)} disabled={pending}><RotateCcw className="h-4 w-4" /></Button>}{item.version === row?.version && <Check className="h-4 w-4 text-emerald-700" aria-label="Versión actual" />}</div>)}
        </div>
      </aside>

      <div className="xl:col-span-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950"><strong>Ayuda:</strong> este editor admite solo español e inglés. Si falta contenido en inglés, la web utiliza el texto en español como respaldo.</div>
      <details className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <summary className="cursor-pointer font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">¿Qué hago si algo no se ve como esperaba?</summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-5">
          <li>Abre «Editar visualmente» para localizar el bloque en la página; sus cambios se aplican al idioma seleccionado.</li>
          <li>Si el inglés no está completo, la página puede mostrar el texto en español como respaldo. Cambia a inglés para terminar esa traducción.</li>
          <li>Si una excursión, su precio o disponibilidad no es correcto, corrígelo en el catálogo; esta pantalla solo cambia textos de presentación.</li>
          <li>Si publicaste un cambio por error, elige una versión anterior en «Versiones publicadas». Restaurarla también se publica inmediatamente.</li>
          <li>El dominio se configura aparte; cambiar contenido aquí no cambia la dirección web.</li>
        </ul>
      </details>
      <VisualWebsiteEditor open={visualOpen} onOpenChange={setVisualOpen} page={page} onPageChange={setPage} locale={locale} onLocaleChange={setLocale} pagesDraft={visualDrafts} onChange={updateVisualPath} onPublish={publishVisualPage} pending={pending} />
    </div>
  )

  function updateListItem(listKey: string, index: number, key: string, value: string) {
    const list = getTextList(content, listKey)
    list[index] = { ...list[index], [key]: value }
    update({ ...content, [listKey]: list })
  }
}

const selectClass = "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}
function TextField({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <Field label={label}><Input value={value} onChange={(event) => onChange(event.target.value)} maxLength={2048} required={required} /></Field>
}
function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <Field label={label}><Textarea value={value} onChange={(event) => onChange(event.target.value)} maxLength={5000} rows={4} /></Field>
}
