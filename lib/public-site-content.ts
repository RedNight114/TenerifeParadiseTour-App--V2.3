"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { defaultSiteContent, mergeSiteContent, type SiteLocale, type SitePageKey } from "@/lib/site-content"
import { useLanguage } from "@/lib/language-context"
import { useSitePreview } from "@/lib/site-preview-context"

export function usePublicSitePage(page: SitePageKey) {
  const { language } = useLanguage()
  const preview = useSitePreview()
  const locale: SiteLocale = language === "en" ? "en" : "es"
  const previewContent = preview.getPage(page)
  const [content, setContent] = useState(defaultSiteContent(page, locale))
  const [published, setPublished] = useState(false)

  useEffect(() => {
    const isVisualPreview = preview.active || new URLSearchParams(window.location.search).has("qa-site-preview")
    if (isVisualPreview) {
      setContent(previewContent ? mergeSiteContent(page, locale, previewContent) : defaultSiteContent(page, locale))
      setPublished(Boolean(previewContent))
      return
    }

    let active = true
    setPublished(false)
    setContent(defaultSiteContent(page, locale))
    const load = async () => {
      const { data } = await supabase.from("organization_site_pages")
        .select("content")
        .eq("page_key", page)
        .eq("locale", locale)
        .maybeSingle()
      if (data?.content) {
        if (active) { setContent(mergeSiteContent(page, locale, data.content as Record<string, unknown>)); setPublished(true) }
        return
      }
      if (locale === "en") {
        const { data: spanish } = await supabase.from("organization_site_pages")
          .select("content")
          .eq("page_key", page)
          .eq("locale", "es")
          .maybeSingle()
        if (active && spanish?.content) { setContent(mergeSiteContent(page, locale, spanish.content as Record<string, unknown>)); setPublished(true) }
      }
    }
    void load()
    return () => { active = false }
  }, [locale, page, preview.active, previewContent])

  return { content, locale, published: preview.active ? Boolean(previewContent) : published }
}
