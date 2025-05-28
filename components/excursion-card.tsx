"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star } from "lucide-react"
import { OptimizedImage } from "./optimized-image"
import { useLanguage } from "@/lib/language-context"
import { memo } from "react"
import type { Excursion } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BookingModal } from "./booking-modal"

interface ExcursionCardProps {
  excursion: Excursion
  onBook?: () => void
  onViewDetails?: () => void
}

export const ExcursionCard = memo(function ExcursionCard({ excursion, onBook, onViewDetails }: ExcursionCardProps) {
  const { t, language } = useLanguage()

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const router = useRouter()

  const title = excursion[`name_${language}` as keyof Excursion] as string
  const description = excursion[`short_description_${language}` as keyof Excursion] as string

  const handleViewDetails = () => {
    router.push(`/excursions/${excursion.id}`)
  }

  const handleBookNow = () => {
    if (onBook) {
      onBook()
    } else {
      setIsBookingModalOpen(true)
    }
  }

  const formatPrice = () => {
    if (excursion.price_max && excursion.price_max > excursion.price) {
      return (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {t("excursion.from")} €{excursion.price} - €{excursion.price_max}
          </div>
          <div className="text-xs text-gray-600">{t("featured.per_person")}</div>
        </div>
      )
    }
    return (
      <div className="text-center">
        <div className="text-lg font-bold text-blue-600">
          {t("excursion.from")} €{excursion.price}
        </div>
        <div className="text-xs text-gray-600">{t("featured.per_person")}</div>
      </div>
    )
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <OptimizedImage
            src={excursion.image_url}
            alt={title}
            width={400}
            height={250}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700">{excursion.category}</Badge>
          {excursion.rating && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center gap-1 text-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {excursion.rating.toFixed(1)}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>

        {/* Servicios incluidos/no incluidos */}
        {((excursion.included_services && excursion.included_services.length > 0) ||
          (excursion.not_included_services && excursion.not_included_services.length > 0)) && (
          <div className="space-y-2 mb-4">
            {excursion.included_services && excursion.included_services.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>
                  {excursion.included_services.length} {t("services.included")}
                </span>
              </div>
            )}

            {excursion.not_included_services && excursion.not_included_services.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-700">
                <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span>
                  {excursion.not_included_services.length} {t("services.not_included")}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              {excursion.duration} {t("excursion.hours")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Máx. {excursion.max_people} personas</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex items-center justify-center w-full">{formatPrice()}</div>

        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1" onClick={onViewDetails || handleViewDetails}>
            {t("excursion.viewDetails")}
          </Button>
          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onBook || handleBookNow}>
            {t("excursion.bookNow")}
          </Button>
        </div>
      </CardFooter>
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} excursion={excursion} />
    </Card>
  )
})
