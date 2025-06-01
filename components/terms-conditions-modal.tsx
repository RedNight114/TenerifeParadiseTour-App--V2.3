"use client"
import { X, FileText, AlertTriangle, CreditCard, Calendar, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

interface TermsConditionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsConditionsModal({ isOpen, onClose }: TermsConditionsModalProps) {
  const { language } = useLanguage()

  if (!isOpen) return null

  const content = {
    es: {
      title: "Términos y Condiciones",
      subtitle: "Condiciones generales de contratación",
      intro: {
        title: "Información General",
        content:
          "Estos términos y condiciones regulan la contratación de servicios turísticos ofrecidos por Tenerife Paradise Tour & Excursion. Al realizar una reserva, usted acepta estos términos en su totalidad.",
      },
      sections: [
        {
          title: "Servicios y Reservas",
          content: [
            "• Ofrecemos excursiones y tours por la isla de Tenerife con guías especializados",
            "• Las reservas se confirman mediante pago del 50% del total como depósito",
            "• El resto del pago debe realizarse 24 horas antes del inicio del tour",
            "• Todas las reservas están sujetas a disponibilidad y confirmación",
          ],
        },
        {
          title: "Política de Cancelación",
          content: [
            "• Cancelación gratuita hasta 48 horas antes del tour",
            "• Cancelaciones entre 24-48 horas: reembolso del 50%",
            "• Cancelaciones con menos de 24 horas: sin reembolso",
            "• En caso de condiciones meteorológicas adversas, se ofrece reprogramación o reembolso completo",
          ],
        },
        {
          title: "Precios y Pagos",
          content: [
            "• Los precios incluyen transporte, guía y actividades especificadas",
            "• No incluyen comidas ni bebidas salvo indicación contraria",
            "• Aceptamos pagos en efectivo, tarjeta de crédito y transferencia bancaria",
            "• Los precios pueden variar según temporada y disponibilidad",
          ],
        },
        {
          title: "Responsabilidades y Limitaciones",
          content: [
            "• Los participantes deben seguir las instrucciones del guía en todo momento",
            "• No nos hacemos responsables de objetos personales perdidos o dañados",
            "• Los menores de edad deben estar acompañados por un adulto responsable",
            "• Recomendamos contratar seguro de viaje para mayor protección",
          ],
        },
        {
          title: "Protección de Datos",
          content: [
            "• Sus datos personales se utilizan únicamente para gestionar su reserva",
            "• No compartimos información personal con terceros sin consentimiento",
            "• Puede solicitar acceso, rectificación o eliminación de sus datos",
            "• Cumplimos con la normativa RGPD de protección de datos",
          ],
        },
        {
          title: "Condiciones Generales",
          content: [
            "• Estos términos se rigen por la legislación española",
            "• Cualquier disputa será resuelta por los tribunales de Santa Cruz de Tenerife",
            "• Nos reservamos el derecho de modificar estos términos con previo aviso",
            "• La participación en nuestros tours implica la aceptación de estos términos",
          ],
        },
      ],
      important_notice: {
        title: "Aviso Importante",
        content:
          "Al confirmar su reserva, usted declara haber leído, entendido y aceptado estos términos y condiciones. Para cualquier consulta, puede contactarnos antes de realizar su reserva.",
      },
      legal_info: {
        title: "Información Legal",
      },
      buttons: {
        accept: "Acepto los Términos",
        print: "Imprimir",
      },
    },
    en: {
      title: "Terms and Conditions",
      subtitle: "General terms of service",
      intro: {
        title: "General Information",
        content:
          "These terms and conditions govern the contracting of tourist services offered by Tenerife Paradise Tour & Excursion. By making a reservation, you accept these terms in their entirety.",
      },
      sections: [
        {
          title: "Services and Reservations",
          content: [
            "• We offer excursions and tours around Tenerife island with specialized guides",
            "• Reservations are confirmed by paying 50% of the total as a deposit",
            "• The remaining payment must be made 24 hours before the tour starts",
            "• All reservations are subject to availability and confirmation",
          ],
        },
        {
          title: "Cancellation Policy",
          content: [
            "• Free cancellation up to 48 hours before the tour",
            "• Cancellations between 24-48 hours: 50% refund",
            "• Cancellations with less than 24 hours: no refund",
            "• In case of adverse weather conditions, we offer rescheduling or full refund",
          ],
        },
        {
          title: "Prices and Payments",
          content: [
            "• Prices include transport, guide and specified activities",
            "• Does not include meals or drinks unless otherwise indicated",
            "• We accept cash, credit card and bank transfer payments",
            "• Prices may vary according to season and availability",
          ],
        },
        {
          title: "Responsibilities and Limitations",
          content: [
            "• Participants must follow the guide's instructions at all times",
            "• We are not responsible for lost or damaged personal items",
            "• Minors must be accompanied by a responsible adult",
            "• We recommend purchasing travel insurance for greater protection",
          ],
        },
        {
          title: "Data Protection",
          content: [
            "• Your personal data is used only to manage your reservation",
            "• We do not share personal information with third parties without consent",
            "• You can request access, rectification or deletion of your data",
            "• We comply with GDPR data protection regulations",
          ],
        },
        {
          title: "General Conditions",
          content: [
            "• These terms are governed by Spanish legislation",
            "• Any dispute will be resolved by the courts of Santa Cruz de Tenerife",
            "• We reserve the right to modify these terms with prior notice",
            "• Participation in our tours implies acceptance of these terms",
          ],
        },
      ],
      important_notice: {
        title: "Important Notice",
        content:
          "By confirming your reservation, you declare that you have read, understood and accepted these terms and conditions. For any questions, you can contact us before making your reservation.",
      },
      legal_info: {
        title: "Legal Information",
      },
      buttons: {
        accept: "Accept Terms",
        print: "Print",
      },
    },
  }

  const t = content[language as keyof typeof content] || content.es

  const sections = [
    {
      icon: FileText,
      title: t.sections[0].title,
      content: t.sections[0].content,
    },
    {
      icon: Calendar,
      title: t.sections[1].title,
      content: t.sections[1].content,
    },
    {
      icon: CreditCard,
      title: t.sections[2].title,
      content: t.sections[2].content,
    },
    {
      icon: AlertTriangle,
      title: t.sections[3].title,
      content: t.sections[3].content,
    },
    {
      icon: Shield,
      title: t.sections[4].title,
      content: t.sections[4].content,
    },
    {
      icon: Users,
      title: t.sections[5].title,
      content: t.sections[5].content,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t.title}</h2>
                <p className="text-green-100">{t.subtitle}</p>
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
          <div className="mb-8 p-6 bg-green-50 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">{t.intro.title}</h3>
            <p className="text-green-800 leading-relaxed">{t.intro.content}</p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-gray-900">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-lg">{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.content.map((item, itemIndex) => (
                      <p key={itemIndex} className="text-gray-600 leading-relaxed">
                        {item}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Important Notice */}
          <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">{t.important_notice.title}</h4>
                <p className="text-yellow-800 text-sm leading-relaxed">{t.important_notice.content}</p>
              </div>
            </div>
          </div>

          {/* Legal info */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">{t.legal_info.title}</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Razón Social:</strong> Tenerife Paradise Tour & Excursion
              </p>
              <p>
                <strong>NIF:</strong> Y7844662C
              </p>
              <p>
                <strong>Dirección:</strong> Santa Cruz de Tenerife, Canarias España
              </p>
              <p>
                <strong>Registro Mercantil:</strong> Santa Cruz de Tenerife
              </p>
              <p>
                <strong>Licencia Turística:</strong> No es necesario
              </p>
              <p>
                <strong>Jurisdicción:</strong> Tribunales de Santa Cruz de Tenerife
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button onClick={onClose} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              {t.buttons.accept}
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              {t.buttons.print}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
