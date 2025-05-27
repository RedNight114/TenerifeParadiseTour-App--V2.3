"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { getExcursionById, type Excursion } from "@/lib/supabase"
import { ExcursionGallery } from "@/components/excursion-gallery"
import { BookingModal } from "@/components/booking-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Star,
  Euro,
  Calendar,
} from "lucide-react"

// Helper function to extract schedules from special_notes - ACTUALIZADA para usar datos reales
const extractSchedules = (
  specialNotes: string | undefined,
  startTime: string | undefined,
  endTime: string | undefined,
) => {
  if (!specialNotes) {
    console.log("No special_notes found")
    return []
  }

  console.log("Special notes content:", specialNotes)
  console.log("Primary start_time:", startTime)
  console.log("Primary end_time:", endTime)

  const schedules = []

  // Buscar el patrón "Horarios disponibles:" seguido de una lista
  const horariosMatch = specialNotes.match(/Horarios disponibles:\s*([\s\S]*?)(?:\n\n|$)/i)

  if (horariosMatch) {
    const horariosText = horariosMatch[1]
    console.log("Found horarios text:", horariosText)

    // Extraer cada línea que empiece con • o -
    const lines = horariosText.split("\n")

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
        // Remover el bullet point y limpiar
        const scheduleText = trimmedLine.replace(/^[•\-*]\s*/, "").trim()

        if (scheduleText) {
          // Para el primer horario, usar los datos reales de start_time y end_time
          let actualStartTime = startTime || "09:00:00"
          let actualEndTime = endTime || "17:00:00"

          // Para horarios adicionales, intentar extraer información de tiempo del texto
          if (index > 0) {
            // Buscar patrones de tiempo en el texto
            const timePattern = /(\d{1,2}):(\d{2})/g
            const timeMatches = scheduleText.match(timePattern)

            if (timeMatches && timeMatches.length >= 2) {
              actualStartTime = timeMatches[0] + ":00"
              actualEndTime = timeMatches[1] + ":00"
            } else {
              // Si no encuentra horarios específicos, usar horarios por defecto basados en el texto
              if (scheduleText.toLowerCase().includes("mañana") || scheduleText.toLowerCase().includes("morning")) {
                actualStartTime = "09:00:00"
                actualEndTime = "13:00:00"
              } else if (
                scheduleText.toLowerCase().includes("tarde") ||
                scheduleText.toLowerCase().includes("afternoon")
              ) {
                actualStartTime = "14:00:00"
                actualEndTime = "18:00:00"
              } else if (
                scheduleText.toLowerCase().includes("sunset") ||
                scheduleText.toLowerCase().includes("puesta")
              ) {
                actualStartTime = "17:00:00"
                actualEndTime = "20:00:00"
              }
            }
          }

          schedules.push({
            label: scheduleText,
            startTime: actualStartTime,
            endTime: actualEndTime,
            timeInfo: "",
            originalText: scheduleText,
          })
        }
      }
    })
  }

  // Si no encuentra el patrón de "Horarios disponibles:", intentar buscar líneas con bullets directamente
  if (schedules.length === 0) {
    const lines = specialNotes.split("\n")
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
        const scheduleText = trimmedLine.replace(/^[•\-*]\s*/, "").trim()

        if (scheduleText && scheduleText.length > 3) {
          // Para el primer horario, usar los datos reales
          let actualStartTime = startTime || "09:00:00"
          let actualEndTime = endTime || "17:00:00"

          // Para horarios adicionales, usar horarios por defecto
          if (index > 0) {
            actualStartTime = "09:00:00"
            actualEndTime = "17:00:00"
          }

          schedules.push({
            label: scheduleText,
            startTime: actualStartTime,
            endTime: actualEndTime,
            timeInfo: "",
            originalText: scheduleText,
          })
        }
      }
    })
  }

  console.log("Extracted schedules from text:", schedules)
  return schedules
}

interface ExcursionDetailPageProps {
  params: {
    id: string
  }
}

export default function ExcursionDetailPage({ params }: ExcursionDetailPageProps) {
  const [excursion, setExcursion] = useState<Excursion | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    const loadExcursion = async () => {
      try {
        const data = await getExcursionById(Number.parseInt(params.id))
        console.log("Loaded excursion data:", data)
        setExcursion(data)
      } catch (error) {
        console.error("Error loading excursion:", error)
      } finally {
        setLoading(false)
      }
    }

    loadExcursion()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando excursión...</p>
        </div>
      </div>
    )
  }

  if (!excursion) {
    notFound()
  }

  const handleBookingClick = () => {
    setIsBookingModalOpen(true)
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

  // Preparar todos los horarios disponibles - ACTUALIZADO para usar datos reales
  const additionalSchedules = extractSchedules(excursion.special_notes, excursion.start_time, excursion.end_time)
  console.log("Extracted additional schedules:", additionalSchedules)

  const allSchedules = []

  // Agregar horario principal si existe y no hay horarios adicionales
  if (excursion.start_time && additionalSchedules.length === 0) {
    allSchedules.push({
      label: "Horario Principal",
      startTime: excursion.start_time,
      endTime: excursion.end_time || "",
      isPrimary: true,
    })
  }

  // Agregar horarios extraídos del texto
  additionalSchedules.forEach((schedule: any, index: number) => {
    allSchedules.push({
      label: schedule.label,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      timeInfo: schedule.timeInfo,
      isPrimary: index === 0, // El primero será el principal
    })
  })

  console.log("All schedules prepared:", allSchedules)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Badge className="bg-white/20 text-white border-0 px-3 py-1">
                <MapPin className="h-4 w-4 mr-2" />
                {excursion.category}
              </Badge>
              {excursion.featured && (
                <Badge className="bg-yellow-500 text-yellow-900 border-0 px-3 py-1">
                  <Star className="h-4 w-4 mr-2" />
                  Premium
                </Badge>
              )}
              {excursion.difficulty_level && (
                <Badge className={getDifficultyColor()}>{excursion.difficulty_level}</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{excursion.name_es}</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">{excursion.short_description_es}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-lg mt-12">
              <div className="flex items-center bg-white/10 rounded-xl p-6">
                <Euro className="h-6 w-6 mr-3 text-yellow-300" />
                <div>
                  <div className="font-bold text-2xl">€{excursion.price}</div>
                  <div className="text-blue-200 text-sm">por persona</div>
                  {excursion.children_price && (
                    <div className="text-blue-200 text-sm">
                      €{excursion.children_price} niños{" "}
                      {excursion.children_age_range && `(${excursion.children_age_range})`}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center bg-white/10 rounded-lg p-4">
                <Clock className="h-6 w-6 mr-3 text-green-300" />
                <div>
                  <div className="font-semibold">{excursion.duration}</div>
                  <div className="text-blue-200 text-sm">duración</div>
                </div>
              </div>

              {excursion.max_people && (
                <div className="flex items-center bg-white/10 rounded-lg p-4">
                  <Users className="h-6 w-6 mr-3 text-purple-300" />
                  <div>
                    <div className="font-semibold">Máx {excursion.max_people}</div>
                    <div className="text-blue-200 text-sm">personas</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-12">
            {/* Galería de imágenes */}
            <ExcursionGallery
              mainImage={excursion.image_url}
              galleryImages={excursion.gallery_images}
              altText={excursion.name_es}
            />

            {/* Horarios disponibles - Sección principal */}
            {allSchedules.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl">
                    <Calendar className="h-6 w-6 mr-3 text-blue-600" />
                    Horarios Disponibles ({allSchedules.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allSchedules.map((schedule, index) => (
                      <div
                        key={index}
                        className={`${
                          schedule.isPrimary
                            ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100"
                            : "bg-gray-50 border-gray-200"
                        } border rounded-xl p-4 transition-all hover:shadow-md`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Clock
                              className={`h-4 w-4 mr-2 ${schedule.isPrimary ? "text-blue-600" : "text-gray-600"}`}
                            />
                            <span className={`font-semibold ${schedule.isPrimary ? "text-blue-900" : "text-gray-900"}`}>
                              {schedule.label}
                            </span>
                            {schedule.isPrimary && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Destacado</Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Horario:</span>
                            <span
                              className={`font-bold text-lg ${schedule.isPrimary ? "text-blue-800" : "text-gray-800"}`}
                            >
                              {schedule.startTime.slice(0, 5)}
                              {schedule.endTime && ` - ${schedule.endTime.slice(0, 5)}`}
                            </span>
                          </div>

                          {schedule.timeInfo && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Modalidad:</span>
                              <span className="text-sm font-medium text-gray-700 capitalize">{schedule.timeInfo}</span>
                            </div>
                          )}

                          {excursion.duration && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Duración:</span>
                              <span className="text-sm font-medium text-gray-700">{excursion.duration}</span>
                            </div>
                          )}

                          {excursion.max_people && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Capacidad:</span>
                              <span className="text-sm font-medium text-gray-700">
                                Máx. {excursion.max_people} personas
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm">ℹ️</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Información sobre horarios</h4>
                        <p className="text-sm text-blue-700">
                          Todos los horarios están disponibles para reserva. Confirmaremos la disponibilidad específica
                          y el punto de encuentro al contactarte por WhatsApp.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Si no hay horarios, mostrar mensaje */}
            {allSchedules.length === 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl">
                    <Calendar className="h-6 w-6 mr-3 text-gray-400" />
                    Horarios
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay horarios específicos configurados para esta excursión.</p>
                    <p className="text-sm text-gray-400 mt-2">Contacta con nosotros para consultar disponibilidad.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Descripción */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">Descripción de la Excursión</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">{excursion.description_es}</p>
              </CardContent>
            </Card>

            {/* Servicios incluidos */}
            {excursion.included_services && excursion.included_services.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl">
                    <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
                    Servicios Incluidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {excursion.included_services.map((service, index) => (
                      <div key={index} className="flex items-center py-2">
                        <CheckCircle className="h-5 w-5 mr-3 text-green-600 flex-shrink-0" />
                        <span className="text-base">{service}</span>
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
          <div className="space-y-8">
            {/* Reserva */}
            <Card className="sticky top-8 shadow-xl border-0">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">Reservar Excursión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
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
                  onClick={handleBookingClick}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Reservar Ahora
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  ✓ Cancelación gratuita hasta 24h antes
                  <br />✓ Confirmación inmediata por WhatsApp
                </div>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
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

      {/* Modal de reserva */}
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} excursion={excursion} />
    </div>
  )
}
