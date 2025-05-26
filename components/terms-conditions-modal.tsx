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
  const { t } = useLanguage()

  if (!isOpen) return null

  const sections = [
    {
      icon: FileText,
      title: "1. Aceptación de los Términos",
      content: [
        "• Al utilizar nuestros servicios, aceptas estos términos y condiciones",
        "• Estos términos se aplican a todas las reservas y servicios de TenerifeParadiseTours",
        "• Nos reservamos el derecho de modificar estos términos en cualquier momento",
        "• Es tu responsabilidad revisar periódicamente estos términos",
      ],
    },
    {
      icon: Calendar,
      title: "2. Reservas y Confirmaciones",
      content: [
        "• Las reservas se confirman mediante WhatsApp o email",
        "• Se requiere información personal válida para procesar la reserva",
        "• Los precios pueden variar según temporada y disponibilidad",
        "• La confirmación final depende de la disponibilidad en la fecha solicitada",
      ],
    },
    {
      icon: CreditCard,
      title: "3. Precios y Pagos",
      content: [
        "• Los precios incluyen transporte, guía y actividades especificadas",
        "• El pago se realiza el día de la excursión o por transferencia previa",
        "• Los precios están sujetos a cambios sin previo aviso",
        "• No se incluyen comidas ni gastos personales salvo indicación contraria",
      ],
    },
    {
      icon: AlertTriangle,
      title: "4. Cancelaciones y Modificaciones",
      content: [
        "• Cancelación gratuita hasta 24 horas antes de la excursión",
        "• Cancelaciones tardías pueden estar sujetas a penalizaciones",
        "• Modificaciones de fecha sujetas a disponibilidad",
        "• No se realizan reembolsos por no presentarse (no-show)",
      ],
    },
    {
      icon: Shield,
      title: "5. Responsabilidades y Seguros",
      content: [
        "• Todas las excursiones incluyen seguro de responsabilidad civil",
        "• Los participantes deben informar sobre condiciones médicas relevantes",
        "• TenerifeParadiseTours no se responsabiliza por objetos personales perdidos",
        "• Se requiere seguir las instrucciones del guía en todo momento",
      ],
    },
    {
      icon: Users,
      title: "6. Comportamiento y Normas",
      content: [
        "• Se espera un comportamiento respetuoso hacia guías y otros participantes",
        "• Prohibido el consumo de alcohol durante las excursiones",
        "• Nos reservamos el derecho de excluir a participantes disruptivos",
        "• Es obligatorio seguir las normas de seguridad establecidas",
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Términos y Condiciones</h2>
                <p className="text-green-100">TenerifeParadiseTours - Vigentes desde Enero 2024</p>
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
            <h3 className="text-lg font-semibold text-green-900 mb-3">Condiciones Generales de Contratación</h3>
            <p className="text-green-800 leading-relaxed">
              Estos términos y condiciones regulan la prestación de servicios turísticos por parte de
              TenerifeParadiseTours S.L. Al realizar una reserva, aceptas cumplir con estas condiciones. Te recomendamos
              leer detenidamente este documento antes de confirmar tu reserva.
            </p>
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
                  <ul className="space-y-2">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-600 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Important Notice */}
          <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">Aviso Importante</h4>
                <p className="text-yellow-800 text-sm leading-relaxed">
                  Las condiciones meteorológicas adversas pueden resultar en la cancelación o modificación de
                  excursiones por razones de seguridad. En estos casos, se ofrecerá una fecha alternativa o reembolso
                  completo.
                </p>
              </div>
            </div>
          </div>

          {/* Legal info */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Información Legal</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Razón Social:</strong> TenerifeParadiseTours S.L.
              </p>
              <p>
                <strong>CIF:</strong> B-12345678
              </p>
              <p>
                <strong>Licencia Turística:</strong> AT-123456
              </p>
              <p>
                <strong>Registro Mercantil:</strong> Santa Cruz de Tenerife, Tomo 1234, Folio 567
              </p>
              <p>
                <strong>Jurisdicción:</strong> Tribunales de Santa Cruz de Tenerife
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button onClick={onClose} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              Acepto los Términos
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              Imprimir Términos
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
