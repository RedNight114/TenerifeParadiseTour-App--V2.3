"use client"

import { useState } from "react"
import Link from "next/link"
import { ExcursionCard } from "@/components/excursion-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Excursion } from "@/lib/supabase"

export default function TestFormPage() {
  const [showPreview, setShowPreview] = useState(false)

  // Excursión de ejemplo con todos los campos
  const sampleExcursionComplete: Excursion = {
    id: 1,
    name_es: "Excursión Premium al Teide con Observación de Estrellas",
    name_en: "Premium Teide Excursion with Stargazing",
    name_de: "Premium Teide-Ausflug mit Sternenbeobachtung",
    short_description_es:
      "Una experiencia única para descubrir el volcán más alto de España y disfrutar de un cielo estrellado incomparable.",
    short_description_en:
      "A unique experience to discover Spain's highest volcano and enjoy an incomparable starry sky.",
    short_description_de:
      "Ein einzigartiges Erlebnis, um Spaniens höchsten Vulkan zu entdecken und einen unvergleichlichen Sternenhimmel zu genießen.",
    description_es:
      "Sumérgete en una aventura inolvidable que combina la majestuosidad del Parque Nacional del Teide con la magia de la observación astronómica. Durante el día, exploraremos los paisajes volcánicos únicos de Tenerife, incluyendo el teleférico del Teide y los miradores más espectaculares. Al anochecer, nos dirigiremos a uno de los mejores puntos de observación astronómica del mundo para contemplar las estrellas con telescopios profesionales.",
    description_en:
      "Immerse yourself in an unforgettable adventure that combines the majesty of Teide National Park with the magic of astronomical observation. During the day, we'll explore Tenerife's unique volcanic landscapes, including the Teide cable car and the most spectacular viewpoints. At nightfall, we'll head to one of the world's best astronomical observation points to contemplate the stars with professional telescopes.",
    description_de:
      "Tauchen Sie ein in ein unvergessliches Abenteuer, das die Majestät des Teide-Nationalparks mit der Magie der astronomischen Beobachtung verbindet. Tagsüber erkunden wir Teneriffas einzigartige Vulkanlandschaften, einschließlich der Teide-Seilbahn und der spektakulärsten Aussichtspunkte. Bei Einbruch der Dunkelheit begeben wir uns zu einem der besten astronomischen Beobachtungspunkte der Welt, um die Sterne mit professionellen Teleskopen zu betrachten.",
    price: 89,
    duration: "12 horas",
    image_url: "/hero-tenerife.jpg",
    category: "naturaleza",
    featured: true,
    created_at: "2024-01-01",

    // Campos opcionales completos
    included_services: [
      "Transporte ida y vuelta",
      "Guía profesional",
      "Seguro de actividad",
      "Fotos del recorrido",
      "Comida incluida",
      "Equipo especializado",
      "Entrada a parques/museos",
    ],
    not_included_services: ["Bebidas alcohólicas", "Propinas", "Gastos personales", "Recuerdos y souvenirs"],
    difficulty_level: "Moderado - Forma física básica",
    start_time: "08:00",
    end_time: "20:00",
    meeting_point: "Hotel Mencey, Santa Cruz de Tenerife",
    what_to_bring: "Ropa de abrigo para la noche, calzado cómodo, cámara fotográfica, protector solar, gafas de sol",
    cancellation_policy:
      "Cancelación gratuita hasta 24 horas antes del tour. Cancelaciones tardías sujetas a penalización del 50%.",
    age_restrictions: "Apto para todas las edades. Menores de 12 años con descuento del 20%",
    available_months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Octubre", "Noviembre", "Diciembre"],
    special_notes:
      "Esta excursión está sujeta a condiciones meteorológicas favorables. En caso de mal tiempo, se ofrecerá fecha alternativa o reembolso completo.",
    requirements: "Se recomienda experiencia básica en senderismo. No apto para personas con problemas de movilidad.",
    max_people: 12,
    faqs: [
      {
        question_es: "¿Qué pasa si hay mal tiempo?",
        question_en: "What happens if there's bad weather?",
        question_de: "Was passiert bei schlechtem Wetter?",
        answer_es:
          "En caso de condiciones meteorológicas adversas, reprogramaremos el tour o ofreceremos reembolso completo.",
        answer_en: "In case of adverse weather conditions, we will reschedule the tour or offer a full refund.",
        answer_de:
          "Bei ungünstigen Wetterbedingungen verschieben wir die Tour oder bieten eine vollständige Rückerstattung an.",
      },
      {
        question_es: "¿Está incluida la comida?",
        question_en: "Is food included?",
        question_de: "Ist das Essen inbegriffen?",
        answer_es: "Sí, incluimos almuerzo tradicional canario y cena ligera durante la observación de estrellas.",
        answer_en: "Yes, we include traditional Canarian lunch and light dinner during stargazing.",
        answer_de:
          "Ja, wir bieten ein traditionelles kanarisches Mittagessen und ein leichtes Abendessen während der Sternenbeobachtung.",
      },
    ],
  }

  // Excursión básica con campos mínimos
  const sampleExcursionBasic: Excursion = {
    id: 2,
    name_es: "Paseo en Barco por la Costa",
    name_en: "Coastal Boat Trip",
    name_de: "Küsten-Bootsfahrt",
    short_description_es: "Disfruta de un relajante paseo en barco por la hermosa costa de Tenerife.",
    short_description_en: "Enjoy a relaxing boat trip along the beautiful coast of Tenerife.",
    short_description_de: "Genießen Sie eine entspannende Bootsfahrt entlang der wunderschönen Küste Teneriffas.",
    description_es:
      "Un paseo tranquilo en barco para disfrutar del océano Atlántico y la costa volcánica de Tenerife. Perfecto para familias y personas que buscan una experiencia relajante en el mar.",
    description_en:
      "A peaceful boat trip to enjoy the Atlantic Ocean and Tenerife's volcanic coastline. Perfect for families and people looking for a relaxing experience at sea.",
    description_de:
      "Eine ruhige Bootsfahrt, um den Atlantischen Ozean und Teneriffas vulkanische Küste zu genießen. Perfekt für Familien und Menschen, die ein entspannendes Erlebnis auf dem Meer suchen.",
    price: 35,
    duration: "3 horas",
    image_url: "/hero-tenerife.jpg",
    category: "marina",
    featured: false,
    created_at: "2024-01-01",
    // Sin campos opcionales - excursión básica
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Prueba del Sistema de Excursiones</h1>
            <p className="text-xl text-green-100">
              Compara cómo se ven las tarjetas con información completa vs. información básica
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Controles */}
        <div className="text-center mb-8">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            {showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa de Tarjetas"}
          </Button>
        </div>

        {showPreview && (
          <>
            {/* Excursión Premium Completa */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  🌟 Excursión Premium (Todos los campos completados)
                </CardTitle>
                <p className="text-center text-gray-600">
                  Esta tarjeta muestra cómo se ve una excursión con toda la información opcional completada
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <ExcursionCard excursion={sampleExcursionComplete} />
                </div>

                {/* Información detallada */}
                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">Información incluida en esta excursión:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Servicios incluidos:</strong> {sampleExcursionComplete.included_services?.length || 0}
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {sampleExcursionComplete.included_services?.slice(0, 3).map((service, i) => (
                          <li key={i}>{service}</li>
                        ))}
                        {(sampleExcursionComplete.included_services?.length || 0) > 3 && <li>...</li>}
                      </ul>
                    </div>
                    <div>
                      <strong>Servicios NO incluidos:</strong>{" "}
                      {sampleExcursionComplete.not_included_services?.length || 0}
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {sampleExcursionComplete.not_included_services?.slice(0, 3).map((service, i) => (
                          <li key={i}>{service}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Dificultad:</strong> {sampleExcursionComplete.difficulty_level}
                    </div>
                    <div>
                      <strong>Horario:</strong> {sampleExcursionComplete.start_time} -{" "}
                      {sampleExcursionComplete.end_time}
                    </div>
                    <div>
                      <strong>Máx. personas:</strong> {sampleExcursionComplete.max_people}
                    </div>
                    <div>
                      <strong>FAQs:</strong> {sampleExcursionComplete.faqs?.length || 0} preguntas
                    </div>
                    <div>
                      <strong>Requisitos especiales:</strong> {sampleExcursionComplete.requirements ? "Sí" : "No"}
                    </div>
                    <div>
                      <strong>Meses disponibles:</strong> {sampleExcursionComplete.available_months?.length || 0} meses
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Excursión Básica */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl text-center">🚤 Excursión Básica (Solo campos obligatorios)</CardTitle>
                <p className="text-center text-gray-600">
                  Esta tarjeta muestra cómo se ve una excursión con solo la información básica requerida
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <ExcursionCard excursion={sampleExcursionBasic} />
                </div>

                {/* Información detallada */}
                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">Información incluida en esta excursión:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Servicios incluidos:</strong> No especificados
                    </div>
                    <div>
                      <strong>Servicios NO incluidos:</strong> No especificados
                    </div>
                    <div>
                      <strong>Dificultad:</strong> No especificada
                    </div>
                    <div>
                      <strong>Horario:</strong> No especificado
                    </div>
                    <div>
                      <strong>Máx. personas:</strong> Valor por defecto (8)
                    </div>
                    <div>
                      <strong>FAQs:</strong> Ninguna
                    </div>
                    <div>
                      <strong>Requisitos especiales:</strong> No
                    </div>
                    <div>
                      <strong>Meses disponibles:</strong> Todo el año (por defecto)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparación lado a lado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">⚖️ Comparación Lado a Lado</CardTitle>
                <p className="text-center text-gray-600">
                  Observa cómo el sistema se adapta automáticamente al contenido disponible
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-center">Excursión Premium</h3>
                    <ExcursionCard excursion={sampleExcursionComplete} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-center">Excursión Básica</h3>
                    <ExcursionCard excursion={sampleExcursionBasic} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Características del sistema */}
            <Card className="mt-8 bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-4 text-center">
                  ✨ Características del Sistema Adaptativo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">🎯 Campos Obligatorios (siempre visibles):</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Nombre en 3 idiomas</li>
                      <li>• Precio por persona</li>
                      <li>• Duración</li>
                      <li>• Categoría</li>
                      <li>• Descripciones cortas y completas</li>
                      <li>• Imagen principal</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">
                      ⚡ Campos Opcionales (solo si están completados):
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Servicios incluidos/no incluidos</li>
                      <li>• Nivel de dificultad con colores</li>
                      <li>• Horarios de inicio/fin</li>
                      <li>• Máximo de personas</li>
                      <li>• Requisitos especiales (con indicador)</li>
                      <li>• FAQs multiidioma</li>
                      <li>• Notas y políticas especiales</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">🚀 Ventajas del Sistema:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                    <div>
                      <strong>Flexibilidad Total:</strong> Cada excursión puede tener diferentes niveles de detalle
                    </div>
                    <div>
                      <strong>Interfaz Limpia:</strong> Solo se muestra información relevante disponible
                    </div>
                    <div>
                      <strong>Escalabilidad:</strong> Fácil añadir nuevos campos sin romper excursiones existentes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Enlaces a otras páginas */}
        <div className="mt-12 text-center space-y-4">
          <h3 className="text-xl font-semibold">🔗 Enlaces Útiles</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/excursion-form">📝 Crear Nueva Excursión</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/excursions">👀 Ver Página de Excursiones</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">🏠 Página Principal</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
