"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Check, ChevronDown, ChevronLeft, Monitor, Smartphone, Tablet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { ImageUpload } from "@/components/image-upload"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { siteLocaleLabels, sitePageLabels, type SiteLocale, type SitePageKey } from "@/lib/site-content"

type Selection = { page: SitePageKey; path: string; label: string; kind: "text" | "multiline" | "image" }
type DraftPages = Partial<Record<SitePageKey, Record<string, unknown>>>
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: SitePageKey
  onPageChange: (page: SitePageKey) => void
  locale: SiteLocale
  onLocaleChange: (locale: SiteLocale) => void
  pagesDraft: DraftPages
  onChange: (page: SitePageKey, path: string, value: string) => void
  onPublish: (page: SitePageKey, locale: SiteLocale) => void
  pending: boolean
}

const pagePaths: Record<SitePageKey, string> = {
  home: "/", about: "/about", faq: "/faq", privacy: "/privacy", terms: "/terms", global: "/", contact: "/contact", excursions: "/excursions",
}
const pageKeys: SitePageKey[] = ["home", "about", "faq", "privacy", "terms", "global", "contact", "excursions"]
const locales: SiteLocale[] = ["es", "en"]
const safePath = (path: string) => /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(path) && !path.split(".").some((part) => ["__proto__", "prototype", "constructor"].includes(part))

function getPathValue(root: Record<string, unknown> | undefined, path: string): unknown {
  if (!root || !safePath(path)) return ""
  return path.split(".").reduce<unknown>((value, key) => value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, root) ?? ""
}

export function VisualWebsiteEditor({ open, onOpenChange, page, onPageChange, locale, onLocaleChange, pagesDraft, onChange, onPublish, pending }: Props) {
  const [session, setSession] = useState("")
  const [selection, setSelection] = useState<Selection | null>(null)
  const [ready, setReady] = useState(false)
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const frameRef = useRef<HTMLIFrameElement>(null)
  const pagesRef = useRef(pagesDraft)

  useEffect(() => {
    pagesRef.current = pagesDraft
  }, [pagesDraft])

  useEffect(() => {
    if (!open) return
    setReady(false)
    setSelection(null)
    setSession((current) => current || window.crypto.randomUUID())
  }, [open])

  const sendDraft = useCallback(() => {
    if (!session || !frameRef.current?.contentWindow) return
    frameRef.current.contentWindow.postMessage({ type: "qa-site-preview:update", session, pages: pagesRef.current }, window.location.origin)
  }, [session])

  useEffect(() => {
    if (!open || !session) return
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return
      const message = event.data as { type?: string; session?: string; selection?: Selection }
      if (!message || message.session !== session) return
      if (message.type === "qa-site-preview:ready") sendDraft()
      if (message.type === "qa-site-preview:applied") setReady(true)
      if (message.type === "qa-site-preview:selection" && message.selection && pageKeys.includes(message.selection.page) && safePath(message.selection.path) && ["text", "multiline", "image"].includes(message.selection.kind)) setSelection(message.selection)
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [open, sendDraft, session])

  useEffect(() => {
    if (!ready) return
    const timer = window.setTimeout(sendDraft, 45)
    return () => window.clearTimeout(timer)
  }, [pagesDraft, ready, sendDraft])

  useEffect(() => {
    setReady(false)
    setSelection(null)
  }, [page, locale])

  const frameUrl = useMemo(() => {
    if (!session) return ""
    const params = new URLSearchParams({ "qa-site-preview": session, "qa-site-locale": locale })
    return `${pagePaths[page]}?${params.toString()}`
  }, [locale, page, session])
  const selectedValue = selection ? getPathValue(pagesDraft[selection.page], selection.path) : ""

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="!fixed !inset-0 !left-0 !top-0 !h-dvh !w-screen !max-w-none !translate-x-0 !translate-y-0 !gap-0 !overflow-hidden !rounded-none !border-0 !bg-slate-100 !p-0 [&>button]:hidden">
      <DialogTitle className="sr-only">Editor visual del sitio</DialogTitle>
      <DialogDescription className="sr-only">Selecciona textos o imágenes directamente sobre la web. Los cambios solo se publican cuando pulsas Guardar y publicar.</DialogDescription>
      <header className="relative z-10 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2 shadow-sm sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <DialogClose asChild><Button type="button" size="icon" variant="ghost" aria-label="Cerrar editor visual"><ChevronLeft className="h-5 w-5" /></Button></DialogClose>
          <div className="hidden min-w-0 sm:block"><p className="text-sm font-semibold text-slate-900">Editor visual</p><p className="text-xs text-slate-500">Vista en vivo · publica solo al guardar</p></div>
          <label className="sr-only" htmlFor="visual-editor-page">Página</label>
          <div className="relative">
            <select id="visual-editor-page" className="h-10 max-w-44 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-800" value={page} onChange={(event) => onPageChange(event.target.value as SitePageKey)}>
              {pageKeys.map((key) => <option key={key} value={key}>{sitePageLabels[key]}</option>)}
            </select><ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-slate-500" />
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1" aria-label="Idioma de la vista previa">
            {locales.map((item) => <button key={item} type="button" onClick={() => onLocaleChange(item)} aria-pressed={locale === item} className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${locale === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>{item.toUpperCase()}</button>)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1" aria-label="Tamaño de vista previa">
            <ViewportButton active={viewport === "desktop"} label="Escritorio" onClick={() => setViewport("desktop")}><Monitor className="h-4 w-4" /></ViewportButton>
            <ViewportButton active={viewport === "tablet"} label="Tableta" onClick={() => setViewport("tablet")}><Tablet className="h-4 w-4" /></ViewportButton>
            <ViewportButton active={viewport === "mobile"} label="Móvil" onClick={() => setViewport("mobile")}><Smartphone className="h-4 w-4" /></ViewportButton>
          </div>
          <Button type="button" onClick={() => onPublish(selection?.page ?? page, locale)} disabled={pending} className="bg-teal-800 text-white hover:bg-teal-900"><Check className="mr-2 h-4 w-4" />{pending ? "Publicando…" : "Guardar y publicar"}</Button>
          <DialogClose asChild><Button type="button" size="icon" variant="outline" aria-label="Salir del editor"><X className="h-4 w-4" /></Button></DialogClose>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <main className="relative flex min-w-0 flex-1 justify-center overflow-auto p-2 sm:p-5" aria-label="Vista previa interactiva">
          {(!ready || !frameUrl) && <div className="absolute inset-0 z-[1] grid place-items-center bg-slate-100/80"><p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Cargando la vista previa…</p></div>}
          <div className="h-fit min-h-[70vh] w-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl" style={{ maxWidth: viewport === "desktop" ? "100%" : viewport === "tablet" ? 820 : 390 }}>
            {frameUrl && <iframe key={`${page}:${locale}`} ref={frameRef} title={`Vista previa: ${sitePageLabels[page]} · ${siteLocaleLabels[locale]}`} src={frameUrl} onLoad={() => { setReady(false); sendDraft() }} className="h-[calc(100dvh-7.5rem)] min-h-[620px] w-full border-0 bg-white" />}
          </div>
        </main>
        <aside className={`${selection ? "fixed inset-x-2 bottom-2 z-20 max-h-[40vh] w-auto rounded-xl shadow-2xl lg:static lg:max-h-none lg:w-[320px] lg:rounded-none lg:shadow-none" : "hidden lg:block"} shrink-0 overflow-y-auto border border-slate-200 bg-white p-4 lg:border-y-0 lg:border-r-0 lg:border-l lg:p-5`} aria-label="Inspector de contenido">
          {selection ? <>
            <div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Elemento seleccionado</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{selection.label}</h2><p className="mt-1 break-all text-xs text-slate-500">{sitePageLabels[selection.page]} · {selection.path}</p></div><Button type="button" size="icon" variant="ghost" onClick={() => setSelection(null)} aria-label="Deseleccionar"><X className="h-4 w-4" /></Button></div>
            <div className="mt-6 space-y-4">
              {selection.kind === "image" ? <ImageUpload label={selection.label} value={typeof selectedValue === "string" ? selectedValue : ""} onChange={(value) => onChange(selection.page, selection.path, value)} /> : selection.kind === "multiline" ? <div className="space-y-2"><label className="text-sm font-medium text-slate-800" htmlFor="visual-text-value">Contenido</label><Textarea id="visual-text-value" rows={7} value={typeof selectedValue === "string" ? selectedValue : ""} onChange={(event) => onChange(selection.page, selection.path, event.target.value)} /></div> : <div className="space-y-2"><label className="text-sm font-medium text-slate-800" htmlFor="visual-text-value">Contenido</label><Input id="visual-text-value" value={typeof selectedValue === "string" ? selectedValue : ""} onChange={(event) => onChange(selection.page, selection.path, event.target.value)} /></div>}
              <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-950">Los cambios se ven al instante en la vista previa y solo se guardan al pulsar «Guardar y publicar».</p>
            </div>
          </> : <div className="pt-3"><p className="text-sm font-semibold text-slate-900">Selecciona algo para editar</p><p className="mt-2 text-sm leading-6 text-slate-600">Haz clic en el texto o la imagen marcada en la página. El panel mostrará su campo editable.</p><div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">Para evitar cambios accidentales, los botones y enlaces de reserva no realizan acciones desde esta vista.</div></div>}
        </aside>
      </div>
    </DialogContent>
  </Dialog>
}

function ViewportButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active} onClick={onClick} className={`grid h-8 w-9 place-items-center rounded-md ${active ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>{children}</button>
}
