"use client"

import Image from "next/image"
import Link from "next/link"
import { usePublicSitePage } from "@/lib/public-site-content"
import { getText, getTextList, type SitePageKey } from "@/lib/site-content"

export function SiteContentPage({ page }: { page: Extract<SitePageKey, "about" | "faq" | "privacy" | "terms"> }) {
  const { content, locale, published } = usePublicSitePage(page)
  const title = getText(content, "title", page === "about" ? "Conócenos" : page === "faq" ? "Preguntas frecuentes" : page === "privacy" ? "Política de privacidad" : "Términos y condiciones")
  const subtitle = getText(content, "subtitle")
  const intro = (page === "privacy" || page === "terms") && !published ? "" : getText(content, "intro")
  const sections = getTextList(content, "sections")
  const items = getTextList(content, "items")
  const imageUrl = getText(content, "heroImage", "/team-tenerife.webp")

  return <div className="min-h-[65vh] bg-[#f7f8f6]">
    <header className="relative isolate overflow-hidden bg-[#123a42] text-white" data-site-edit-page={page} data-site-edit-path={page === "about" ? "heroImage" : undefined} data-site-edit-label={page === "about" ? "Imagen de portada" : undefined} data-site-edit-kind={page === "about" ? "image" : undefined}>
      {page === "about" && <div className="absolute inset-0 -z-10 opacity-25"><Image src={imageUrl || "/team-tenerife.webp"} alt="" fill unoptimized sizes="100vw" className="object-cover" /></div>}
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300" data-site-edit-page={page} data-site-edit-path="eyebrow" data-site-edit-label="Etiqueta superior">{page === "about" ? getText(content, "eyebrow", locale === "en" ? "Our company" : "Nuestra empresa") : page === "faq" ? (locale === "en" ? "Help center" : "Centro de ayuda") : (locale === "en" ? "Company information" : "Información de la empresa")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl" data-site-edit-page={page} data-site-edit-path="title" data-site-edit-label="Título principal">{title}</h1>
        {subtitle && <p className="mt-4 text-xl text-white/85" data-site-edit-page={page} data-site-edit-path="subtitle" data-site-edit-label="Subtítulo">{subtitle}</p>}
        {intro && <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-7 text-white/80" data-site-edit-page={page} data-site-edit-path="intro" data-site-edit-label="Introducción" data-site-edit-kind="multiline">{intro}</p>}
      </div>
    </header>
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-12 sm:px-6 lg:px-8">
      {page === "about" && sections.map((section, index) => <article key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-semibold text-slate-950" data-site-edit-page={page} data-site-edit-path={`sections.${index}.title`} data-site-edit-label={`Apartado ${index + 1} · título`}>{getText(section, "title")}</h2><p className="mt-4 whitespace-pre-line text-base leading-7 text-slate-600" data-site-edit-page={page} data-site-edit-path={`sections.${index}.body`} data-site-edit-label={`Apartado ${index + 1} · texto`} data-site-edit-kind="multiline">{getText(section, "body")}</p></article>)}
      {page === "faq" && (items.length ? items.map((item, index) => <details key={index} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><summary className="cursor-pointer list-none pr-8 font-semibold text-slate-950 marker:hidden" data-site-edit-page={page} data-site-edit-path={`items.${index}.question`} data-site-edit-label={`Pregunta ${index + 1}`}>{getText(item, "question")}</summary><p className="mt-4 whitespace-pre-line leading-7 text-slate-600" data-site-edit-page={page} data-site-edit-path={`items.${index}.answer`} data-site-edit-label={`Respuesta ${index + 1}`} data-site-edit-kind="multiline">{getText(item, "answer")}</p></details>) : <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">{locale === "en" ? "No questions have been added yet." : "Aún no se han añadido preguntas."}</p>)}
      {(page === "privacy" || page === "terms") && !published && <p className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-950">{locale === "en" ? "This company has not published this information yet. Please contact the company if you need details before booking." : "La empresa todavía no ha publicado esta información. Contacta con ella si necesitas consultarla antes de reservar."}</p>}
      {(page === "privacy" || page === "terms") && published && sections.map((section, index) => <article key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-950" data-site-edit-page={page} data-site-edit-path={`sections.${index}.title`} data-site-edit-label={`Apartado ${index + 1} · título`}>{getText(section, "title")}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600" data-site-edit-page={page} data-site-edit-path={`sections.${index}.body`} data-site-edit-label={`Apartado ${index + 1} · texto`} data-site-edit-kind="multiline">{getText(section, "body")}</p></article>)}
      {page === "about" && <Link href="/excursions" data-site-edit-page={page} data-site-edit-path="ctaLabel" data-site-edit-label="Texto del botón" className="inline-flex min-h-11 items-center rounded-lg bg-teal-800 px-5 font-semibold text-white hover:bg-teal-900">{getText(content, "ctaLabel", locale === "en" ? "Explore excursions" : "Ver excursiones")}</Link>}
    </main>
  </div>
}
