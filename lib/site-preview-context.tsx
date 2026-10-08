"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { SitePageKey } from "@/lib/site-content"

type PreviewPages = Partial<Record<SitePageKey, Record<string, unknown>>>
type PreviewSelection = { page: SitePageKey; path: string; label: string; kind: "text" | "multiline" | "image" }
type PreviewContextValue = {
  active: boolean
  pages: PreviewPages
  getPage: (page: SitePageKey) => Record<string, unknown> | null
}

const SitePreviewContext = createContext<PreviewContextValue>({ active: false, pages: {}, getPage: () => null })

export function SitePreviewProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)
  const [pages, setPages] = useState<PreviewPages>({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const session = params.get("qa-site-preview")
    if (!session || window.parent === window) return

    setActive(true)
    document.documentElement.classList.add("qa-site-visual-preview")

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return
      const message = event.data as { type?: string; session?: string; pages?: PreviewPages }
      if (!message || message.session !== session || message.type !== "qa-site-preview:update" || !message.pages) return
      setPages(message.pages)
      window.parent.postMessage({ type: "qa-site-preview:applied", session }, window.location.origin)
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return
      const editable = target.closest<HTMLElement>("[data-site-edit-path]")
      if (editable) {
        if (!(editable instanceof HTMLElement && editable.tagName === "SUMMARY")) event.preventDefault()
        event.stopPropagation()
        const page = editable.dataset.siteEditPage as SitePageKey | undefined
        const path = editable.dataset.siteEditPath
        const label = editable.dataset.siteEditLabel
        const kind = editable.dataset.siteEditKind || "text"
        if (page && ["home", "about", "faq", "privacy", "terms", "global", "contact", "excursions"].includes(page) && path && label && (kind === "text" || kind === "multiline" || kind === "image")) {
          document.querySelector("[data-site-edit-selected='true']")?.removeAttribute("data-site-edit-selected")
          editable.setAttribute("data-site-edit-selected", "true")
          const selection: PreviewSelection = { page, path, label, kind }
          window.parent.postMessage({ type: "qa-site-preview:selection", session, selection }, window.location.origin)
        }
        return
      }

      // Editing mode never activates customer-facing navigation or booking actions.
      if (target.closest("a,button,summary,form,input,select,textarea")) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const sendReady = () => window.parent.postMessage({ type: "qa-site-preview:ready", session }, window.location.origin)
    window.addEventListener("message", handleMessage)
    document.addEventListener("click", handleClick, true)
    sendReady()
    const readyTimer = window.setTimeout(sendReady, 250)

    return () => {
      window.clearTimeout(readyTimer)
      window.removeEventListener("message", handleMessage)
      document.removeEventListener("click", handleClick, true)
      document.documentElement.classList.remove("qa-site-visual-preview")
    }
  }, [])

  const getPage = useCallback((page: SitePageKey) => pages[page] ?? null, [pages])
  const value = useMemo(() => ({ active, pages, getPage }), [active, getPage, pages])

  return <SitePreviewContext.Provider value={value}>{children}</SitePreviewContext.Provider>
}

export function useSitePreview() {
  return useContext(SitePreviewContext)
}
