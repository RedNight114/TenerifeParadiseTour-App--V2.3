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
  const { language } = useLanguage()

  if (!isOpen) return null

  const content = {
    es: {
      title: "Política de Privacidad",
      subtitle: "Última actualización: Enero 2024",
      intro: {
        title: "Compromiso con tu Privacidad",
        content:
          "En Tenerife Paradise Tour & Excursion, nos comprometemos a proteger y respetar tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tu información personal cuando utilizas nuestros servicios.",
      },
      sections: [
        {
          title: "Información que Recopilamos",
          content: [
            "Datos de contacto: nombre, email, teléfono cuando realizas una reserva",
            "Información de pago: datos necesarios para procesar tu reserva de forma segura",
            "Preferencias de excursiones y servicios para personalizar tu experiencia",
            "Datos de navegación para mejorar nuestro sitio web y servicios",
          ],
        },
        {
          title: "Cómo Utilizamos tu Información",
          content: [
            "Procesar y confirmar tus reservas de excursiones",
            "Enviarte información relevante sobre tus reservas y servicios",
            "Mejorar nuestros servicios y experiencia del cliente",
            "Cumplir con obligaciones legales y normativas del sector turístico",
          ],
        },
        {
          title: "Protección de Datos",
          content: [
            "Utilizamos encriptación SSL para proteger tus datos durante la transmisión",
            "Almacenamos tu información en servidores seguros con acceso restringido",
            "Realizamos auditorías regulares de seguridad para mantener altos estándares",
            "Solo compartimos datos con partners de confianza necesarios para el servicio",
          ],
        },
        {
          title: "Tus Derechos",
          content: [
            "Derecho de acceso: puedes solicitar una copia de tus datos personales",
            "Derecho de rectificación: puedes corregir datos inexactos o incompletos",
            "Derecho de supresión: puedes solicitar la eliminación de tus datos",
            "Derecho de portabilidad: puedes solicitar tus datos en formato portable",
          ],
        },
        {
          title: "Cookies y Tecnologías Similares",
          content: [
            "Utilizamos cookies esenciales para el funcionamiento del sitio web",
            "Cookies de análisis para entender cómo interactúas con nuestro sitio",
            "Cookies de personalización para recordar tus preferencias",
            "Puedes gestionar las cookies desde la configuración de tu navegador",
          ],
        },
        {
          title: "Contacto y Consultas",
          content: [
            "Para cualquier consulta sobre privacidad, contáctanos por email",
            "Responderemos a tus consultas en un plazo máximo de 30 días",
            "Puedes ejercer tus derechos enviando una solicitud por escrito",
            "Mantenemos un registro de todas las consultas de privacidad",
          ],
        },
      ],
      contactInfo: {
        title: "Información de Contacto",
        company: "Empresa",
        address: "Dirección",
        email: "Email",
        emailAddress: "info@tenerifetoursparadise.com",
        phone: "Teléfono",
        phoneNumber: "+34 123 456 789",
      },
      buttons: {
        understood: "Entendido",
        print: "Imprimir",
      },
    },
    en: {
      title: "Privacy Policy",
      subtitle: "Last updated: January 2024",
      intro: {
        title: "Our Privacy Commitment",
        content:
          "At Tenerife Paradise Tour & Excursion, we are committed to protecting and respecting your privacy. This policy explains how we collect, use and protect your personal information when you use our services.",
      },
      sections: [
        {
          title: "Information We Collect",
          content: [
            "Contact details: name, email, phone when you make a booking",
            "Payment information: data necessary to process your booking securely",
            "Excursion and service preferences to personalize your experience",
            "Navigation data to improve our website and services",
          ],
        },
        {
          title: "How We Use Your Information",
          content: [
            "Process and confirm your excursion bookings",
            "Send you relevant information about your bookings and services",
            "Improve our services and customer experience",
            "Comply with legal and regulatory obligations in the tourism sector",
          ],
        },
        {
          title: "Data Protection",
          content: [
            "We use SSL encryption to protect your data during transmission",
            "We store your information on secure servers with restricted access",
            "We conduct regular security audits to maintain high standards",
            "We only share data with trusted partners necessary for the service",
          ],
        },
        {
          title: "Your Rights",
          content: [
            "Right of access: you can request a copy of your personal data",
            "Right of rectification: you can correct inaccurate or incomplete data",
            "Right of erasure: you can request deletion of your data",
            "Right of portability: you can request your data in portable format",
          ],
        },
        {
          title: "Cookies and Similar Technologies",
          content: [
            "We use essential cookies for website functionality",
            "Analytics cookies to understand how you interact with our site",
            "Personalization cookies to remember your preferences",
            "You can manage cookies from your browser settings",
          ],
        },
        {
          title: "Contact and Queries",
          content: [
            "For any privacy queries, contact us by email",
            "We will respond to your queries within a maximum of 30 days",
            "You can exercise your rights by sending a written request",
            "We maintain a record of all privacy queries",
          ],
        },
      ],
      contactInfo: {
        title: "Contact Information",
        company: "Company",
        address: "Address",
        email: "Email",
        emailAddress: "info@tenerifetoursparadise.com",
        phone: "Phone",
        phoneNumber: "+34 123 456 789",
      },
      buttons: {
        understood: "Understood",
        print: "Print",
      },
    },
  }

  const currentContent = content[language as keyof typeof content] || content.es

  const sections = [
    {
      icon: FileText,
      title: currentContent.sections[0].title,
      content: currentContent.sections[0].content,
    },
    {
      icon: Eye,
      title: currentContent.sections[1].title,
      content: currentContent.sections[1].content,
    },
    {
      icon: Shield,
      title: currentContent.sections[2].title,
      content: currentContent.sections[2].content,
    },
    {
      icon: UserCheck,
      title: currentContent.sections[3].title,
      content: currentContent.sections[3].content,
    },
    {
      icon: Lock,
      title: currentContent.sections[4].title,
      content: currentContent.sections[4].content,
    },
    {
      icon: Mail,
      title: currentContent.sections[5].title,
      content: currentContent.sections[5].content,
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
                <h2 className="text-2xl font-bold">{currentContent.title}</h2>
                <p className="text-blue-100">{currentContent.subtitle}</p>
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
            <h3 className="text-lg font-semibold text-blue-900 mb-3">{currentContent.intro.title}</h3>
            <p className="text-blue-800 leading-relaxed">{currentContent.intro.content}</p>
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
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-600 leading-relaxed flex items-start">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
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
            <h4 className="font-semibold text-gray-900 mb-3">{currentContent.contactInfo.title}</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>{currentContent.contactInfo.company}:</strong> Tenerife Paradise Tour & Excursion
              </p>
              <p>
                <strong>NIF:</strong> Y7844662C
              </p>
              <p>
                <strong>{currentContent.contactInfo.address}:</strong> Santa Cruz de Tenerife, Canarias España
              </p>
              <p>
                <strong>Registro Mercantil:</strong> Santa Cruz de Tenerife
              </p>
              <p>
                <strong>Licencia Turística:</strong> No es necesario
              </p>
              <p>
                <strong>{currentContent.contactInfo.email}:</strong> {currentContent.contactInfo.emailAddress}
              </p>
              <p>
                <strong>{currentContent.contactInfo.phone}:</strong> {currentContent.contactInfo.phoneNumber}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button onClick={onClose} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {currentContent.buttons.understood}
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              {currentContent.buttons.print}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
