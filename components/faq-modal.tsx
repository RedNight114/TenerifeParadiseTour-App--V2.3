"use client"
import { X, HelpCircle, Clock, CreditCard, Users, MapPin, Phone, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"

interface FAQModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const { t } = useLanguage()
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  if (!isOpen) return null

  const faqCategories = [
    {
      icon: Calendar,
      title: "Reservas y Cancelaciones",
      faqs: [
        {
          question: "¿Cómo puedo reservar una excursión?",
          answer:
            "Puedes reservar de tres formas: 1) A través de nuestro formulario web, 2) Contactándonos por WhatsApp al +34 922 123 456, o 3) Llamándonos directamente. Te confirmaremos la disponibilidad en menos de 2 horas.",
        },
        {
          question: "¿Puedo cancelar mi reserva?",
          answer:
            "Sí, ofrecemos cancelación gratuita hasta 24 horas antes de la excursión. Para cancelaciones con menos de 24 horas, consulta nuestros términos y condiciones.",
        },
        {
          question: "¿Qué pasa si llueve el día de mi excursión?",
          answer:
            "Monitoreamos constantemente las condiciones meteorológicas. Si el tiempo no es seguro, te ofreceremos cambiar la fecha o un reembolso completo. La seguridad es nuestra prioridad.",
        },
      ],
    },
    {
      icon: CreditCard,
      title: "Precios y Pagos",
      faqs: [
        {
          question: "¿Qué incluye el precio de la excursión?",
          answer:
            "Nuestros precios incluyen: transporte en vehículo cómodo, guía profesional certificado, seguro de responsabilidad civil, y todas las actividades especificadas. No incluye comidas ni gastos personales.",
        },
        {
          question: "¿Cuándo debo pagar?",
          answer:
            "Puedes pagar el día de la excursión en efectivo o tarjeta, o realizar una transferencia bancaria previa. Te enviaremos los detalles de pago al confirmar tu reserva.",
        },
        {
          question: "¿Hay descuentos para grupos?",
          answer:
            "¡Sí! Ofrecemos descuentos especiales para grupos de 6 o más personas. También tenemos tarifas reducidas para niños menores de 12 años. Contacta con nosotros para más detalles.",
        },
      ],
    },
    {
      icon: Users,
      title: "Grupos y Participantes",
      faqs: [
        {
          question: "¿Cuál es el tamaño máximo del grupo?",
          answer:
            "Mantenemos grupos pequeños para una experiencia más personalizada. El máximo es de 8 personas por vehículo. Para grupos más grandes, utilizamos varios vehículos.",
        },
        {
          question: "¿Pueden participar niños?",
          answer:
            "¡Por supuesto! Nuestras excursiones son familiares. Los niños menores de 3 años viajan gratis. Tenemos asientos infantiles disponibles - solo avísanos al reservar.",
        },
        {
          question: "¿Qué nivel físico se requiere?",
          answer:
            "Cada excursión tiene un nivel de dificultad especificado. Desde paseos suaves hasta senderismo moderado. Te informaremos sobre los requisitos físicos al reservar.",
        },
      ],
    },
    {
      icon: MapPin,
      title: "Logística y Transporte",
      faqs: [
        {
          question: "¿Dónde es el punto de encuentro?",
          answer:
            "Tenemos varios puntos de recogida en las principales zonas turísticas. También ofrecemos recogida en hoteles en ciertas áreas. Te confirmaremos el punto exacto al reservar.",
        },
        {
          question: "¿Qué debo llevar?",
          answer:
            "Recomendamos: calzado cómodo, protector solar, agua, cámara, y ropa según la actividad. Te enviaremos una lista específica según tu excursión.",
        },
        {
          question: "¿Hablan otros idiomas además del español?",
          answer:
            "Sí, nuestros guías hablan español, inglés y alemán. Algunos también hablan francés e italiano. Especifica tu idioma preferido al reservar.",
        },
      ],
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Preguntas Frecuentes</h2>
                <p className="text-purple-100">Resolvemos tus dudas más comunes</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Introduction */}
          <div className="mb-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">¿Tienes alguna duda?</h3>
            <p className="text-purple-800 leading-relaxed">
              Aquí encontrarás respuestas a las preguntas más frecuentes sobre nuestras excursiones. Si no encuentras lo
              que buscas, no dudes en contactarnos por WhatsApp o teléfono.
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                </div>

                <div className="space-y-3">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 10 + faqIndex
                    return (
                      <Card
                        key={faqIndex}
                        className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                      >
                        <CardContent className="p-0">
                          <button
                            onClick={() => setOpenFAQ(openFAQ === globalIndex ? null : globalIndex)}
                            className="w-full text-left p-6 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 pr-4">{faq.question}</h4>
                              <div
                                className={`transform transition-transform duration-200 ${openFAQ === globalIndex ? "rotate-180" : ""}`}
                              >
                                <svg
                                  className="w-5 h-5 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </button>

                          {openFAQ === globalIndex && (
                            <div className="px-6 pb-6">
                              <div className="border-t border-gray-200 pt-4">
                                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-3">¿No encuentras tu respuesta?</h4>
              <p className="text-gray-600 mb-4">
                Nuestro equipo está disponible para resolver cualquier duda específica sobre tu excursión.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp: +34 617 30 39 29
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Horario: 8:00 - 20:00
                </Button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button onClick={onClose} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
              Cerrar FAQ
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              Imprimir FAQ
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
