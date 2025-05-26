"use client"
import { X, Shield, Eye, Lock, UserCheck, FileText, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const { t } = useLanguage()

  if (!isOpen) return null

  const sections = [
    {
      icon: FileText,
      title: "1. Información que Recopilamos",
      content: [
        "• Datos personales: nombre, email, teléfono cuando realizas una reserva",
        "• Información de contacto para comunicarnos contigo sobre tu excursión",
        "• Preferencias de idioma y solicitudes especiales",
        "• Datos de navegación para mejorar nuestro sitio web",
      ],
    },
    {
      icon: Eye,
      title: "2. Cómo Utilizamos tu Información",
      content: [
        "• Procesar y confirmar tus reservas de excursiones",
        "• Enviarte información relevante sobre tu experiencia",
        "• Mejorar nuestros servicios y experiencia del usuario",
        "• Cumplir con obligaciones legales y de seguridad",
      ],
    },
    {
      icon: Shield,
      title: "3. Protección de Datos",
      content: [
        "• Utilizamos encriptación SSL para proteger tus datos",
        "• No compartimos tu información con terceros sin tu consentimiento",
        "• Almacenamos tus datos de forma segura en servidores protegidos",
        "• Solo el personal autorizado tiene acceso a tu información",
      ],
    },
    {
      icon: UserCheck,
      title: "4. Tus Derechos",
      content: [
        "• Derecho a acceder a tus datos personales",
        "• Derecho a rectificar información incorrecta",
        "• Derecho a eliminar tus datos (derecho al olvido)",
        "• Derecho a la portabilidad de datos",
      ],
    },
    {
      icon: Lock,
      title: "5. Cookies y Tecnologías Similares",
      content: [
        "• Utilizamos cookies esenciales para el funcionamiento del sitio",
        "• Cookies de análisis para entender cómo usas nuestro sitio",
        "• Puedes gestionar las cookies desde tu navegador",
        "• No utilizamos cookies de terceros para publicidad",
      ],
    },
    {
      icon: Mail,
      title: "6. Contacto y Consultas",
      content: [
        "• Para ejercer tus derechos, contacta: info@tenerifeparadisetours.com",
        "• Responderemos a tu solicitud en un plazo máximo de 30 días",
        "• Puedes presentar una queja ante la Agencia Española de Protección de Datos",
        "• Nuestro delegado de protección de datos está disponible para consultas",
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Política de Privacidad</h2>
                <p className="text-blue-100">TenerifeParadiseTours - Actualizada: Enero 2024</p>
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
          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Compromiso con tu Privacidad</h3>
            <p className="text-blue-800 leading-relaxed">
              En TenerifeParadiseTours, respetamos y protegemos tu privacidad. Esta política explica cómo recopilamos,
              utilizamos y protegemos tu información personal cuando utilizas nuestros servicios. Cumplimos con el
              Reglamento General de Protección de Datos (RGPD) y la legislación española de protección de datos.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-gray-900">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-blue-600" />
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

          {/* Footer info */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Información de Contacto</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Empresa:</strong> TenerifeParadiseTours S.L.
              </p>
              <p>
                <strong>CIF:</strong> B-12345678
              </p>
              <p>
                <strong>Dirección:</strong> Santa Cruz de Tenerife, España
              </p>
              <p>
                <strong>Email:</strong> Tenerifeparadisetoursandexcursions@hotmail.com
              </p>
              <p>
                <strong>Teléfono:</strong> +34 617 30 39 29
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button onClick={onClose} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Entendido
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              Imprimir Política
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
