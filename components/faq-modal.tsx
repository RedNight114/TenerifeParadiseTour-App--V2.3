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
  const { t, language } = useLanguage()
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)
  const isSpanish = language === "es"

  if (!isOpen) return null

  const faqCategories = [
    {
      icon: Calendar,
      title: isSpanish ? "Reservas y Cancelaciones" : "Bookings and Cancellations",
      faqs: [
        {
          question: isSpanish ? "¿Cómo puedo hacer una reserva?" : "How can I make a booking?",
          answer: isSpanish
            ? "Puedes hacer tu reserva directamente a través de nuestra web, por WhatsApp (+34 123 456 789) o llamándonos. Te pediremos algunos datos básicos y un depósito del 30% para confirmar tu plaza."
            : "You can book directly through our website, via WhatsApp (+34 123 456 789) or by calling us. We'll need some basic information and a 30% deposit to confirm your spot.",
        },
        {
          question: isSpanish ? "¿Puedo cancelar mi reserva?" : "Can I cancel my booking?",
          answer: isSpanish
            ? "Sí, puedes cancelar hasta 48 horas antes de la excursión sin coste adicional. Para cancelaciones con menos de 48 horas, se aplicará una penalización del 50%. No se realizan reembolsos por cancelaciones el mismo día."
            : "Yes, you can cancel up to 48 hours before the excursion at no extra cost. For cancellations with less than 48 hours notice, a 50% penalty applies. No refunds for same-day cancellations.",
        },
        {
          question: isSpanish ? "¿Qué pasa si hay mal tiempo?" : "What happens if there's bad weather?",
          answer: isSpanish
            ? "Si las condiciones meteorológicas no permiten realizar la excursión de forma segura, la reprogramaremos sin coste adicional o te ofreceremos un reembolso completo."
            : "If weather conditions don't allow the excursion to be carried out safely, we'll reschedule at no extra cost or offer you a full refund.",
        },
      ],
    },
    {
      icon: CreditCard,
      title: isSpanish ? "Pagos y Precios" : "Payments and Prices",
      faqs: [
        {
          question: isSpanish ? "¿Qué métodos de pago aceptan?" : "What payment methods do you accept?",
          answer: isSpanish
            ? "Aceptamos tarjetas de crédito/débito (Visa, Mastercard), transferencia bancaria, PayPal y pago en efectivo. Para reservas online se requiere pago con tarjeta o PayPal."
            : "We accept credit/debit cards (Visa, Mastercard), bank transfer, PayPal and cash payment. Online bookings require card or PayPal payment.",
        },
        {
          question: isSpanish ? "¿Los precios incluyen todo?" : "Do prices include everything?",
          answer: isSpanish
            ? "Nuestros precios incluyen transporte, guía profesional, seguro básico y todas las actividades descritas. No incluyen comidas (salvo que se especifique), bebidas adicionales ni gastos personales."
            : "Our prices include transport, professional guide, basic insurance and all described activities. They don't include meals (unless specified), additional drinks or personal expenses.",
        },
        {
          question: isSpanish ? "¿Hay descuentos para grupos?" : "Are there group discounts?",
          answer: isSpanish
            ? "Sí, ofrecemos descuentos para grupos de 8 o más personas (10% descuento), grupos de 15+ personas (15% descuento). También tenemos precios especiales para niños menores de 12 años."
            : "Yes, we offer discounts for groups of 8+ people (10% discount), groups of 15+ people (15% discount). We also have special prices for children under 12.",
        },
      ],
    },
    {
      icon: Users,
      title: isSpanish ? "Grupos y Participantes" : "Groups and Participants",
      faqs: [
        {
          question: isSpanish ? "¿Cuál es el tamaño máximo del grupo?" : "What's the maximum group size?",
          answer: isSpanish
            ? "Para garantizar una experiencia personalizada, limitamos nuestros grupos a máximo 16 personas. Para grupos privados podemos hacer excepciones según la actividad."
            : "To ensure a personalized experience, we limit our groups to maximum 16 people. For private groups we can make exceptions depending on the activity.",
        },
        {
          question: isSpanish ? "¿Pueden participar niños?" : "Can children participate?",
          answer: isSpanish
            ? "Sí, la mayoría de nuestras excursiones son aptas para niños a partir de 6 años. Los menores de 18 años deben ir acompañados de un adulto. Consulta cada excursión para restricciones específicas de edad."
            : "Yes, most of our excursions are suitable for children from 6 years old. Under 18s must be accompanied by an adult. Check each excursion for specific age restrictions.",
        },
        {
          question: isSpanish ? "¿Qué nivel físico se requiere?" : "What fitness level is required?",
          answer: isSpanish
            ? "Cada excursión tiene un nivel de dificultad indicado: Fácil (apto para todos), Moderado (requiere forma física básica) y Difícil (requiere buena condición física). Consulta la descripción de cada tour."
            : "Each excursion has an indicated difficulty level: Easy (suitable for everyone), Moderate (requires basic fitness) and Difficult (requires good physical condition). Check each tour description.",
        },
      ],
    },
    {
      icon: MapPin,
      title: isSpanish ? "Ubicaciones y Logística" : "Locations and Logistics",
      faqs: [
        {
          question: isSpanish ? "¿Dónde son los puntos de encuentro?" : "Where are the meeting points?",
          answer: isSpanish
            ? "Tenemos varios puntos de recogida en las principales zonas turísticas: Playa de las Américas, Los Cristianos, Costa Adeje y Puerto de la Cruz. También ofrecemos recogida en hoteles por un pequeño suplemento."
            : "We have several pickup points in the main tourist areas: Playa de las Américas, Los Cristianos, Costa Adeje and Puerto de la Cruz. We also offer hotel pickup for a small supplement.",
        },
        {
          question: isSpanish ? "¿Qué debo llevar?" : "What should I bring?",
          answer: isSpanish
            ? "Recomendamos: calzado cómodo, protección solar, agua, cámara y ropa adecuada según la actividad. Para cada excursión enviamos una lista específica de recomendaciones 24h antes."
            : "We recommend: comfortable shoes, sun protection, water, camera and appropriate clothing for the activity. For each excursion we send a specific list of recommendations 24h before.",
        },
        {
          question: isSpanish ? "¿Proporcionan transporte?" : "Do you provide transport?",
          answer: isSpanish
            ? "Sí, todas nuestras excursiones incluyen transporte en vehículos cómodos y climatizados desde los puntos de recogida hasta el destino y vuelta. Nuestros conductores son profesionales con licencia."
            : "Yes, all our excursions include transport in comfortable, air-conditioned vehicles from pickup points to the destination and back. Our drivers are licensed professionals.",
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
                <h2 className="text-2xl font-bold">{t("faq.title")}</h2>
                <p className="text-purple-100">{t("faq.subtitle")}</p>
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
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              {isSpanish ? "¿Tienes dudas sobre nuestras excursiones?" : "Have questions about our excursions?"}
            </h3>
            <p className="text-purple-800 leading-relaxed">
              {isSpanish
                ? "Aquí encontrarás respuestas a las preguntas más frecuentes sobre nuestros tours en Tenerife. Si no encuentras lo que buscas, no dudes en contactarnos directamente."
                : "Here you'll find answers to the most frequently asked questions about our tours in Tenerife. If you can't find what you're looking for, don't hesitate to contact us directly."}
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
              <h4 className="font-semibold text-gray-900 mb-3">
                {isSpanish ? "¿Aún tienes preguntas?" : "Still have questions?"}
              </h4>
              <p className="text-gray-600 mb-4">
                {isSpanish
                  ? "Nuestro equipo está disponible para ayudarte a planificar tu aventura perfecta en Tenerife."
                  : "Our team is available to help you plan your perfect adventure in Tenerife."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Phone className="h-4 w-4 mr-2" />
                  {isSpanish ? "WhatsApp: +34 123 456 789" : "WhatsApp: +34 123 456 789"}
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  {isSpanish ? "Horario: 9:00 - 20:00" : "Hours: 9:00 - 20:00"}
                </Button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button onClick={onClose} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
              {isSpanish ? "Cerrar" : "Close"}
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              {isSpanish ? "Imprimir FAQ" : "Print FAQ"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
