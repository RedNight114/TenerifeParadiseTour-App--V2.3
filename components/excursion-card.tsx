"use client"

import Image from "next/image"
import {
  Clock,
  Users,
  MessageCircle,
  Star,
  MapPin,
  Heart,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
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

  const getPremiumLabel = () => {
    switch (language) {
      case "en":
        return "Premium"
      case "de":
        return "Premium"
      default:
        return "Premium"
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
        return "✓ Free cancellation"
      case "de":
        return "✓ Kostenlose Stornierung"
      default:
        return "✓ Cancelación gratuita"
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
        return "Book via WhatsApp"
      case "de":
        return "Über WhatsApp buchen"
      default:
        return "Reservar por WhatsApp"
    }
  }

  const getDifficultyLabel = () => {
    if (!excursion.difficulty_level) return null

    switch (language) {
      case "en":
        return "Difficulty"
      case "de":
        return "Schwierigkeit"
      default:
        return "Dificultad"
    }
  }

  const getDifficultyColor = () => {
    if (!excursion.difficulty_level) return "bg-gray-100"

    const level = excursion.difficulty_level.toLowerCase()
    if (level.includes("fácil") || level.includes("easy") || level.includes("leicht")) {
      return "bg-green-100 text-green-800"
    }
    if (level.includes("moderado") || level.includes("moderate") || level.includes("mäßig")) {
      return "bg-yellow-100 text-yellow-800"
    }
    if (level.includes("difícil") || level.includes("difficult") || level.includes("schwer")) {
      return "bg-red-100 text-red-800"
    }
    return "bg-gray-100 text-gray-800"
  }

  const getTimeLabel = () => {
    if (!excursion.start_time) return null

    switch (language) {
      case "en":
        return "Start time"
      case "de":
        return "Startzeit"
      default:
        return "Hora inicio"
    }
  }

  const hasIncludedServices = excursion.included_services && excursion.included_services.length > 0
  const hasRequirements = excursion.requirements && excursion.requirements.trim() !== ""

  return (
    <Card
      className={`group overflow-hidden hover:shadow-xl transition-all duration-500 border-0 bg-white rounded-3xl hover:scale-105 ${className}`}
    >
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={excursion.image_url || "/placeholder.svg"}
          alt={excursion[`name_${language}` as keyof Excursion] as string}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Overlay simple */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-text/20 to-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badge destacado */}
        {excursion.featured && (
          <Badge className="absolute top-6 left-6 bg-gradient-to-r from-brand-primary to-brand-primary-hover text-brand-button-text border-0 shadow-lg px-4 py-2 font-semibold">
            <Sparkles className="h-3 w-3 mr-1" />
            {getPremiumLabel()}
          </Badge>
        )}

        {/* Indicadores especiales */}
        <div className="absolute top-6 right-6 flex flex-col gap-2">
          {/* Botón favorito */}
          <button className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110">
            <Heart className="h-5 w-5 text-white hover:text-brand-accent transition-colors duration-300" />
          </button>

          {/* Indicador de requisitos especiales */}
          {hasRequirements && (
            <div
              className="w-12 h-12 bg-orange-500/80 backdrop-blur-xl rounded-full flex items-center justify-center cursor-help"
              title={excursion.requirements}
            >
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Precio */}
        <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-xl">
          <div className="text-2xl font-bold text-brand-primary">€{excursion.price}</div>
          <div className="text-xs text-brand-text text-center font-medium">{getPerPersonLabel()}</div>
          {excursion.children_price && (
            <div className="text-sm text-brand-text text-center mt-1">
              Niños: €{excursion.children_price}
              {excursion.children_age_range && (
                <div className="text-xs opacity-75">({excursion.children_age_range})</div>
              )}
            </div>
          )}
        </div>

        {/* Categoría y dificultad */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2">
          <Badge className="bg-brand-text/80 backdrop-blur-xl text-white border-0 px-4 py-2">
            <MapPin className="h-3 w-3 mr-1" />
            {excursion.category}
          </Badge>

          {excursion.difficulty_level && (
            <Badge className={`backdrop-blur-xl border-0 px-4 py-2 ${getDifficultyColor()}`}>
              {getDifficultyLabel()}: {excursion.difficulty_level.split(" - ")[0]}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-brand-heading mb-4 group-hover:text-brand-primary transition-all duration-500 line-clamp-2">
          {excursion[`name_${language}` as keyof Excursion] as string}
        </h3>

        <p className="text-brand-text text-sm mb-6 line-clamp-2 leading-relaxed">
          {excursion[`short_description_${language}` as keyof Excursion] as string}
        </p>

        <div className="flex items-center justify-between text-sm text-brand-text mb-6">
          <div className="flex items-center bg-gradient-to-r from-green-50 to-green-100 rounded-full px-4 py-2">
            <Clock className="h-4 w-4 mr-2 text-brand-accent" />
            <span className="font-semibold text-brand-text">{excursion.duration}</span>
          </div>
          <div className="flex items-center bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-full px-4 py-2">
            <Users className="h-4 w-4 mr-2 text-brand-primary" />
            <span className="font-semibold text-brand-text">{getSmallGroupLabel()}</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-3 mb-6">
          {excursion.start_time && (
            <div className="flex items-center text-sm text-brand-text">
              <Calendar className="h-4 w-4 mr-2 text-brand-primary" />
              <span>
                {getTimeLabel()}: {excursion.start_time}
              </span>
            </div>
          )}

          {hasIncludedServices && (
            <div className="flex items-center text-sm text-brand-text">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              <span>{excursion.included_services!.length} servicios incluidos</span>
            </div>
          )}

          {excursion.not_included_services && excursion.not_included_services.length > 0 && (
            <div className="flex items-center text-sm text-brand-text">
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              <span>{excursion.not_included_services.length} servicios no incluidos</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-brand-text ml-3 font-semibold">4.9 (127 {getReviewsLabel()})</span>
          </div>
          <div className="text-xs text-brand-accent bg-green-50 px-3 py-1 rounded-full font-semibold">
            {getFreeCancellationLabel()}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-0">
        <Button
          onClick={handleWhatsAppBooking}
          className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-button-text font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 py-4 text-base rounded-2xl"
        >
          <MessageCircle className="mr-3 h-5 w-5" />
          {getBookButtonLabel()}
        </Button>
      </CardFooter>
    </Card>
  )
}
