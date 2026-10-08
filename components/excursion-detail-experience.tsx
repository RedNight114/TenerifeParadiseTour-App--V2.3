"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Clock3, MapPin, Users, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { getExcursionPriceLabel, type Excursion } from "@/lib/supabase"
import { BookingModal } from "@/components/booking-modal"
import { Button } from "@/components/ui/button"

type Props = { excursion: Excursion; preview?: boolean; categoryLabel?: string; categoryNames?: { es: string; en: string } }

export function ExcursionDetailExperience({ excursion, preview = false, categoryLabel, categoryNames }: Props) {
  const { language, t } = useLanguage()
  const [bookingOpen, setBookingOpen] = useState(false)
  const english = language === "en"
  const localizedCategory = (english ? categoryNames?.en : categoryNames?.es) || categoryLabel
  const title = (english && excursion.name_en) || excursion.name_es || (english ? "Experience title" : "Nombre de la excursión")
  const summary = (english && excursion.short_description_en) || excursion.short_description_es
  const description = (english && excursion.description_en) || excursion.description_es || summary
  const money = new Intl.NumberFormat(language, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(excursion.price) || 0)
  const unit = getExcursionPriceLabel(excursion.pricing_mode, language, english ? "per person" : "por persona")
  const gallery = [excursion.image_url, ...(excursion.gallery_images ?? [])].filter((url): url is string => Boolean(url) && !url.toLowerCase().includes("placeholder")).slice(0, 5)
  const heroImage = gallery[0] || null
  const included = excursion.included_services ?? []
  const excluded = excursion.not_included_services ?? []
  const faqs = (excursion.faqs ?? []).filter((item) => (english ? item.question_en || item.question_es : item.question_es) && (english ? item.answer_en || item.answer_es : item.answer_es))

  return <main className={`min-h-screen bg-[#f7f8f6] text-slate-900 ${preview ? "pb-8" : "pb-24 lg:pb-12"}`}>
    {!preview && <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8"><Link href="/excursions" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{english ? "All excursions" : "Todas las excursiones"}</Link></div>}
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-3 sm:px-6 lg:px-8 lg:pt-5" aria-labelledby="excursion-title">
      <div className="relative isolate overflow-hidden rounded-3xl bg-slate-900 shadow-lg">
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-teal-900" />
        {heroImage ? <Image src={heroImage} alt="" fill priority={!preview} unoptimized sizes="(max-width: 768px) 100vw, 1280px" className="z-0 object-cover opacity-45" /> : <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="absolute inset-0 z-0 h-full w-full opacity-70"><circle cx="970" cy="110" r="56" fill="#f5ca78" /><path d="m0 360 180-140 110 85 160-200 145 194 150-115 130 118 130-85 195 140v150H0z" fill="#17484d" /><path d="m0 412 190-70 155 34 165-63 158 58 145-30 190 64 197-76v121H0z" fill="#112f38" /></svg>}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/15" />
        <div className="relative z-10 flex min-h-[340px] flex-col justify-end p-6 text-white sm:min-h-[420px] sm:p-10 lg:min-h-[470px] lg:p-14">
          <div className="mb-4 flex flex-wrap gap-2"><span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">{localizedCategory || excursion.category || (english ? "Experience" : "Experiencia")}</span>{excursion.featured && <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-slate-950">{english ? "Featured" : "Destacada"}</span>}</div>
          <h1 id="excursion-title" className="max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          {summary && <p className="mt-4 max-w-3xl text-base leading-7 text-white/90 sm:text-lg">{summary}</p>}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/90">
            {excursion.duration && <span className="inline-flex items-center gap-2"><Clock3 aria-hidden="true" className="h-4 w-4" />{excursion.duration}</span>}
            {excursion.max_people && <span className="inline-flex items-center gap-2"><Users aria-hidden="true" className="h-4 w-4" />{english ? `Up to ${excursion.max_people} people` : `Hasta ${excursion.max_people} personas`}</span>}
            {excursion.meeting_point && <span className="inline-flex items-center gap-2"><MapPin aria-hidden="true" className="h-4 w-4" />{excursion.meeting_point}</span>}
          </div>
        </div>
      </div>
    </section>

    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
      <div className="min-w-0 space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="description-heading"><h2 id="description-heading" className="text-xl font-semibold">{english ? "About this experience" : "Sobre esta excursión"}</h2><p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-slate-700">{description || (english ? "More details will be available soon." : "Pronto publicaremos más detalles sobre esta experiencia.")}</p></section>
        {gallery.length > 1 && <section aria-labelledby="gallery-heading"><h2 id="gallery-heading" className="mb-4 text-xl font-semibold">{english ? "Experience gallery" : "Galería de la experiencia"}</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{gallery.slice(1).map((src, index) => <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200"><Image src={src} alt={`${title} · ${english ? "photo" : "foto"} ${index + 2}`} fill unoptimized sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" /></div>)}</div></section>}
        {(included.length > 0 || excluded.length > 0) && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="included-heading"><h2 id="included-heading" className="text-xl font-semibold">{english ? "What to expect" : "Qué incluye la experiencia"}</h2><div className="mt-5 grid gap-6 sm:grid-cols-2">{included.length > 0 && <div><h3 className="mb-3 font-medium text-slate-800">{english ? "Included" : "Incluido"}</h3><ul className="space-y-2.5">{included.map((item, i) => <li key={`${item}-${i}`} className="flex gap-2.5 text-sm leading-6 text-slate-700"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-teal-700" />{item}</li>)}</ul></div>}{excluded.length > 0 && <div><h3 className="mb-3 font-medium text-slate-800">{english ? "Not included" : "No incluido"}</h3><ul className="space-y-2.5">{excluded.map((item, i) => <li key={`${item}-${i}`} className="flex gap-2.5 text-sm leading-6 text-slate-700"><X aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-slate-400" />{item}</li>)}</ul></div>}</div></section>}
        {(excursion.what_to_bring || excursion.requirements || excursion.age_restrictions || excursion.cancellation_policy || excursion.difficulty_level) && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="practical-heading"><h2 id="practical-heading" className="text-xl font-semibold">{english ? "Good to know" : "Información práctica"}</h2><dl className="mt-4 divide-y divide-slate-100">{[[english ? "Difficulty" : "Dificultad", excursion.difficulty_level], [english ? "Bring" : "Qué llevar", excursion.what_to_bring], [english ? "Requirements" : "Requisitos", excursion.requirements], [english ? "Age restrictions" : "Restricciones de edad", excursion.age_restrictions], [english ? "Cancellation policy" : "Política de cancelación", excursion.cancellation_policy]].filter((row): row is [string, string] => Boolean(row[1])).map(([label, value]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]"><dt className="text-sm font-medium text-slate-600">{label}</dt><dd className="whitespace-pre-line text-sm leading-6 text-slate-800">{value}</dd></div>)}</dl></section>}
        {faqs.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-xl font-semibold">{english ? "Frequently asked questions" : "Preguntas frecuentes"}</h2><div className="mt-3 divide-y divide-slate-100">{faqs.map((faq, index) => <details key={`${faq.question_es}-${index}`} className="group py-4"><summary className="min-h-11 cursor-pointer list-none py-2 font-medium text-slate-800 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">{(english && faq.question_en) || faq.question_es}</summary><p className="pb-2 text-sm leading-6 text-slate-600">{(english && faq.answer_en) || faq.answer_es}</p></details>)}</div></section>}
      </div>
      <aside className="hidden lg:block"><div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-md"><p className="text-sm text-slate-500">{english ? "Price" : "Precio"} · {unit}</p><p className="mt-1 text-3xl font-bold tracking-tight text-teal-900">{money}</p>{excursion.price_max && excursion.price_max > excursion.price && <p className="mt-1 text-xs text-slate-500">{english ? "Up to" : "Hasta"} {new Intl.NumberFormat(language, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(excursion.price_max)}</p>}<Button type="button" disabled={preview} onClick={() => setBookingOpen(true)} className="mt-5 min-h-12 w-full bg-brand-primary text-white hover:bg-brand-primary-hover">{preview ? (english ? "Booking button preview" : "Vista del botón de reserva") : t("excursion.bookNow")}</Button>{!preview && <p className="mt-3 text-center text-xs leading-5 text-slate-500">{english ? "Choose an available date and confirm the details before paying." : "Elige una fecha disponible y revisa los detalles antes de pagar."}</p>}</div></aside>
    </div>
    {!preview && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_25px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><div className="min-w-0"><p className="text-xs text-slate-500">{unit}</p><p className="text-xl font-bold text-teal-900">{money}</p></div><Button type="button" onClick={() => setBookingOpen(true)} className="min-h-12 px-6 bg-brand-primary text-white hover:bg-brand-primary-hover">{t("excursion.bookNow")}</Button></div></div>}
    {!preview && <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} excursion={excursion} />}
  </main>
}
