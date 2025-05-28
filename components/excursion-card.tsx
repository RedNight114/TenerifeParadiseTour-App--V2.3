"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, Users, MessageCircle, Star, MapPin, CheckCircle, XCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Excursion } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"

interface ExcursionCardProps {
  excursion: Excursion
  className?: string
}

export function ExcursionCard({ excursion, className }: ExcursionCardProps) {
  const { language, t } = useLanguage()

  const handleWhatsAppBooking = () => {
    const excursionName = excursion[`name_${language}` as keyof Excursion] as string
    const message = encodeURIComponent(
      `${t("featured.whatsapp_interest")} "${excursionName}" (€${excursion.price}). ${t("featured.whatsapp_info")}`,
    )
    window.open(`https://wa.me/34617303929?text=${message}`, "_blank")
  }

  const getFeaturedLabel = () => {
    switch (language) {
      case "en":
        return "Featured"
      case "de":
        return "Hervorgehoben"
      default:
        return "Destacado"
    }
  }

  const getPerPersonLabel = () => {
    switch (language) {
      case "en":
        return "per person"
      case "de":
        return "pro Person"
      default:
        return "por persona"
    }
  }

  const getSmallGroupLabel = () => {
    if (excursion.max_people) {
      switch (language) {
        case "en":
          return `Max ${excursion.max_people} people`
        case "de":
          return `Max ${excursion.max_people} Personen`
        default:
          return `Máx ${excursion.max_people} personas`
      }
    }

    switch (language) {
      case "en":
        return "Small group"
      case "de":
        return "Kleine Gruppe"
      default:
        return "Grupo reducido"
    }
  }

  const getFreeCancellationLabel = () => {
    switch (language) {
      case "en":
        return "Free cancellation"
      case "de":
        return "Kostenlose Stornierung"
      default:
        return "Cancelación gratuita"
    }
  }

  const getReviewsLabel = () => {
    switch (language) {
      case "en":
        return "reviews"
      case "de":
        return "Bewertungen"
      default:
        return "reseñas"
    }
  }

  const getBookButtonLabel = () => {
    switch (language) {
      case "en":
        return "Book Now"
      case "de":
        return "Jetzt Buchen"
      default:
        return "Reservar"
    }
  }

  const getDetailsButtonLabel = () => {
    switch (language) {
      case "en":
        return "View Details"
      case "de":
        return "Details ansehen"
      default:
        return "Ver Detalles"
    }
  }

  const getHourLabel = () => {
    switch (language) {
      case "en":
        return "hour"
      case "de":
        return "Stunde"
      default:
        return "hora"
    }
  }

  const getHoursLabel = () => {
    switch (language) {
      case "en":
        return "hours"
      case "de":
        return "Stunden"
      default:
        return "horas"
    }
  }

  const formatDuration = (duration: string) => {
    const match = duration.match(/(\d+)/)
    if (match) {
      const hours = Number.parseInt(match[1])
      const hourText = hours === 1 ? getHourLabel() : getHoursLabel()
      return `${hours} ${hourText}`
    }
    return duration
  }

  const hasIncludedServices = excursion.included_services && excursion.included_services.length > 0
  const hasNotIncludedServices = excursion.not_included_services && excursion.not_included_services.length > 0

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white rounded-lg border border-gray-200 ${className}`}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={excursion.image_url || "/placeholder.svg"}
          alt={excursion[`name_${language}` as keyof Excursion] as string}
          fill
          className="object-cover"
        />

        {/* Overlay simple */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Badge Premium */}
        {excursion.featured && (
          <Badge className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 text-sm font-semibold">
            {getFeaturedLabel()}
          </Badge>
        )}

        {/* Precio */}
        <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-2 shadow-sm">
          <div className="text-xl font-bold text-gray-900">€{excursion.price}</div>
          <div className="text-xs text-gray-600">{getPerPersonLabel()}</div>
        </div>

        {/* Categoría */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-gray-900 text-white px-3 py-1 text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            {excursion.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {excursion[`name_${language}` as keyof Excursion] as string}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {excursion[`short_description_${language}` as keyof Excursion] as string}
        </p>

        {/* Información principal */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium">{formatDuration(excursion.duration)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium">{getSmallGroupLabel()}</span>
          </div>
        </div>

        {/* Servicios */}
        {(hasIncludedServices || hasNotIncludedServices) && (
          <div className="space-y-2 mb-4">
            {hasIncludedServices && (
              <div className="flex items-center text-sm text-green-700">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                <span>{excursion.included_services!.length} servicios incluidos</span>
              </div>
            )}

            {hasNotIncludedServices && (
              <div className="flex items-center text-sm text-red-700">
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                <span>{excursion.not_included_services!.length} servicios no incluidos</span>
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">4.9 (127)</span>
          </div>
        </div>

        {/* Cancelación gratuita */}
        <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md text-center">
          ✓ {getFreeCancellationLabel()}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        {/* Botones en grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Botón Ver Detalles */}
          <Link href={`/excursions/${excursion.id}`}>
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium py-3 rounded-lg transition-colors duration-200"
            >
              <Eye className="mr-2 h-4 w-4" />
              {getDetailsButtonLabel()}
            </Button>
          </Link>

          {/* Botón Reservar */}
          <Button
            onClick={handleWhatsAppBooking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {getBookButtonLabel()}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
