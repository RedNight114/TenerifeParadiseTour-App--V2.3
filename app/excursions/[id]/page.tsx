"use client"

import { notFound } from "next/navigation"
import { getExcursionById } from "@/lib/supabase"
import { ExcursionGallery } from "@/components/excursion-gallery"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Star,
  Euro,
} from "lucide-react"

interface ExcursionDetailPageProps {
  params: {
    id: string
  }
}

export default async function ExcursionDetailPage({ params }: ExcursionDetailPageProps) {
  const excursion = await getExcursionById(Number.parseInt(params.id))

  if (!excursion) {
    notFound()
  }

  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent(
      `Hola! Me interesa la excursión "${excursion.name_es}" (€${excursion.price}). ¿Podrían darme más información?`,
    )
    window.open(`https://wa.me/34617303929?text=${message}`, "_blank")
  }

  const getDifficultyColor = () => {
    if (!excursion.difficulty_level) return "bg-gray-100 text-gray-800"

    const level = excursion.difficulty_level.toLowerCase()
    if (level.includes("fácil") || level.includes("easy")) {
      return "bg-green-100 text-green-800"
    }
    if (level.includes("moderado") || level.includes("moderate")) {
      return "bg-yellow-100 text-yellow-800"
    }
    if (level.includes("difícil") || level.includes("difficult")) {
      return "bg-red-100 text-red-800"
    }
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-primary-hover text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <Badge className="bg-white/20 text-white border-0">
                <MapPin className="h-3 w-3 mr-1" />
                {excursion.category}
              </Badge>
              {excursion.featured && (
                <Badge className="bg-yellow-500 text-yellow-900 border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              {excursion.difficulty_level && (
                <Badge className={`border-0 ${getDifficultyColor()}`}>
                  {excursion.difficulty_level.split(" - ")[0]}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{excursion.name_es}</h1>
            <p className="text-xl text-blue-100 mb-6">{excursion.short_description_es}</p>
            <div className="flex items-center gap-6 text-lg">
              <div className="flex items-center">
                <Euro className="h-5 w-5 mr-2" />
                <div>
                  <span className="font-semibold">€{excursion.price}</span>
                  <span className="ml-1 opacity-80">por persona</span>
                  {excursion.children_price && (
                    <div className="text-base">
                      <span className="font-semibold">€{excursion.children_price}</span>
                      <span className="ml-1 opacity-80">
                        niños {excursion.children_age_range ? `(${excursion.children_age_range})` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>{excursion.duration}</span>
              </div>
              {excursion.max_people && (
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>Máx {excursion.max_people} personas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galería de imágenes */}
            <ExcursionGallery
              mainImage={excursion.image_url}
              galleryImages={excursion.gallery_images}
              altText={excursion.name_es}
            />

            {/* Descripción */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción de la Excursión</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{excursion.description_es}</p>
              </CardContent>
            </Card>

            {/* Servicios incluidos */}
            {excursion.included_services && excursion.included_services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Servicios Incluidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {excursion.included_services.map((service, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Servicios NO incluidos */}
            {excursion.not_included_services && excursion.not_included_services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <XCircle className="h-5 w-5 mr-2 text-red-600" />
                    No Incluido en el Precio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {excursion.not_included_services.map((service, index) => (
                      <div key={index} className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                        <span className="text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQs */}
            {excursion.faqs && excursion.faqs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preguntas Frecuentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {excursion.faqs.map((faq, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-gray-900 mb-2">{faq.question_es}</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{faq.answer_es}</p>
                      {index < excursion.faqs!.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reserva */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-center">Reservar Excursión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-primary">€{excursion.price}</div>
                  <div className="text-sm text-gray-600">por persona</div>
                  {excursion.children_price && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <div className="text-xl font-semibold text-blue-700">€{excursion.children_price}</div>
                      <div className="text-xs text-blue-600">
                        niños {excursion.children_age_range ? `(${excursion.children_age_range})` : ""}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleWhatsAppBooking}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Reservar por WhatsApp
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  ✓ Cancelación gratuita hasta 24h antes
                  <br />✓ Confirmación inmediata
                </div>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {excursion.start_time && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-sm">Inicio: {excursion.start_time}</span>
                  </div>
                )}

                {excursion.meeting_point && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Punto de encuentro:</div>
                      <div className="text-sm text-gray-600">{excursion.meeting_point}</div>
                    </div>
                  </div>
                )}

                {excursion.what_to_bring && (
                  <div>
                    <div className="text-sm font-medium mb-1">Qué traer:</div>
                    <div className="text-sm text-gray-600">{excursion.what_to_bring}</div>
                  </div>
                )}

                {excursion.requirements && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-orange-800">Requisitos especiales:</div>
                        <div className="text-sm text-orange-700">{excursion.requirements}</div>
                      </div>
                    </div>
                  </div>
                )}

                {excursion.age_restrictions && (
                  <div>
                    <div className="text-sm font-medium mb-1">Restricciones de edad:</div>
                    <div className="text-sm text-gray-600">{excursion.age_restrictions}</div>
                  </div>
                )}

                {excursion.cancellation_policy && (
                  <div>
                    <div className="text-sm font-medium mb-1">Política de cancelación:</div>
                    <div className="text-sm text-gray-600">{excursion.cancellation_policy}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
