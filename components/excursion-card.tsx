"use client"

import { useState, memo } from "react"
import { useRouter } from "next/navigation"
import { Clock3, Star, Users, Compass } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/optimized-image"
import { BookingModal } from "@/components/booking-modal"
import { useLanguage } from "@/lib/language-context"
import { getExcursionPriceLabel, type Excursion } from "@/lib/supabase"

interface ExcursionCardProps {
  excursion: Excursion
  onBook?: () => void
  onViewDetails?: () => void
  layout?: "grid" | "list"
  categoryLabel?: string
}

function ExcursionImageFallback({ language }: { language: string }) {
  return (
    <div aria-hidden="true" className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#174b50] via-[#257175] to-[#d49a60]">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 72% 28%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 20% 68%, #fff 0 1px, transparent 1.5px)", backgroundSize: "34px 34px, 48px 48px" }} />
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="625" cy="145" r="58" fill="#F8D99C" fillOpacity=".82" />
        <path d="M0 344 146 242l88 74 121-160 116 153 74-74 83 66 80-110 92 107v202H0Z" fill="#16464B" fillOpacity=".62" />
        <path d="m0 390 143-60 96 34 122-55 111 43 96-39 111 57 121-44v174H0Z" fill="#103B42" fillOpacity=".74" />
        <path d="M0 433c106-28 160 21 264-2s145-20 238 2 184 15 298-11v78H0Z" fill="#D6B17D" fillOpacity=".5" />
      </svg>
      <div className="relative flex flex-col items-center gap-2 text-white drop-shadow-sm">
        <Compass className="h-8 w-8 text-amber-200" strokeWidth={1.5} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">{language === "en" ? "Local experiences" : "Experiencias locales"}</span>
      </div>
    </div>
  )
}

export const ExcursionCard = memo(function ExcursionCard({ excursion, onBook, onViewDetails, layout = "grid", categoryLabel }: ExcursionCardProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const title = (excursion[`name_${language}` as keyof Excursion] as string | undefined) || excursion.name_es
  const description = (excursion[`short_description_${language}` as keyof Excursion] as string | undefined) || excursion.short_description_es
  const formattedPrice = new Intl.NumberFormat(language, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(excursion.price)
  const priceUnitLabel = getExcursionPriceLabel(excursion.pricing_mode, language, t("featured.per_person"))

  const isList = layout === "list"
  return (
    <Card className={`excursion-card group flex h-full overflow-hidden border-slate-200/80 bg-white ${isList ? "flex-col sm:flex-row" : "flex-col"}`}>
      <button type="button" onClick={onViewDetails ?? (() => router.push(`/excursions/${excursion.id}`))} aria-label={`${t("excursion.viewDetails")}: ${title}`} className={`relative block shrink-0 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-700 ${isList ? "w-full sm:w-64 md:w-80" : "w-full"}`}>
        <div className={`relative overflow-hidden bg-slate-100 ${isList ? "aspect-[16/10] sm:aspect-auto sm:h-full sm:min-h-56" : "aspect-[16/10]"}`}>
          {excursion.image_url && !excursion.image_url.includes("placeholder") ? (
            <OptimizedImage
              src={excursion.image_url}
              alt={title}
              width={800}
              height={500}
              className="excursion-card__image h-full w-full object-cover"
              fallback={<ExcursionImageFallback language={language} />}
            />
          ) : <ExcursionImageFallback language={language} />}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
          <Badge className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm hover:bg-white">{categoryLabel || excursion.category}</Badge>
          {excursion.featured && <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white"><Star aria-hidden="true" className="h-4 w-4 fill-amber-300 text-amber-300" />{language === "en" ? "Featured experience" : "Experiencia destacada"}</span>}
          {excursion.rating != null && excursion.rating > 0 && <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-800"><Star aria-hidden="true" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{excursion.rating.toFixed(1)}</span>}
        </div>
      </button>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 min-h-[3.25rem] text-lg font-semibold leading-snug tracking-tight text-slate-900">{title}</h3>
        <p className={`mt-2 text-sm leading-6 text-slate-600 ${isList ? "line-clamp-3" : "line-clamp-2 min-h-11"}`}>{description}</p>
        <div className="mt-4 flex min-h-7 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          {!!excursion.duration && <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-700" />{excursion.duration}</span>}
          {excursion.max_people != null && excursion.max_people > 0 && <span className="inline-flex items-center gap-1.5"><Users aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-700" />{language === "en" ? "Up to" : "Hasta"} {excursion.max_people}</span>}
        </div>
        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0"><p className="text-xs font-medium text-slate-500">{priceUnitLabel}</p><p className="mt-0.5 text-2xl font-semibold tracking-tight text-teal-900">{formattedPrice}</p></div>
            {excursion.price_max != null && excursion.price_max > excursion.price && <p className="pb-1 text-right text-xs text-slate-500">{language === "en" ? "Up to" : "Hasta"} {new Intl.NumberFormat(language, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(excursion.price_max)}</p>}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onViewDetails ?? (() => router.push(`/excursions/${excursion.id}`))} className="min-w-0 border-slate-300 bg-white px-2 text-xs text-slate-700 hover:border-teal-700 hover:bg-teal-50 hover:text-teal-900 sm:text-sm">{t("excursion.viewDetails")}</Button>
            <Button type="button" size="sm" onClick={onBook ?? (() => setIsBookingModalOpen(true))} className="min-w-0 bg-brand-primary px-2 text-xs text-white hover:bg-brand-primary-hover sm:text-sm">{t("excursion.bookNow")}</Button>
          </div>
        </div>
      </div>
      {!onBook && <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} excursion={excursion} />}
    </Card>
  )
})
