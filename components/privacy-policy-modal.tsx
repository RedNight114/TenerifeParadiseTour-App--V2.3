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
      title: t("privacy.section1.title"),
      content: [
        t("privacy.section1.content1"),
        t("privacy.section1.content2"),
        t("privacy.section1.content3"),
        t("privacy.section1.content4"),
      ],
    },
    {
      icon: Eye,
      title: t("privacy.section2.title"),
      content: [
        t("privacy.section2.content1"),
        t("privacy.section2.content2"),
        t("privacy.section2.content3"),
        t("privacy.section2.content4"),
      ],
    },
    {
      icon: Shield,
      title: t("privacy.section3.title"),
      content: [
        t("privacy.section3.content1"),
        t("privacy.section3.content2"),
        t("privacy.section3.content3"),
        t("privacy.section3.content4"),
      ],
    },
    {
      icon: UserCheck,
      title: t("privacy.section4.title"),
      content: [
        t("privacy.section4.content1"),
        t("privacy.section4.content2"),
        t("privacy.section4.content3"),
        t("privacy.section4.content4"),
      ],
    },
    {
      icon: Lock,
      title: t("privacy.section5.title"),
      content: [
        t("privacy.section5.content1"),
        t("privacy.section5.content2"),
        t("privacy.section5.content3"),
        t("privacy.section5.content4"),
      ],
    },
    {
      icon: Mail,
      title: t("privacy.section6.title"),
      content: [
        t("privacy.section6.content1"),
        t("privacy.section6.content2"),
        t("privacy.section6.content3"),
        t("privacy.section6.content4"),
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
                <h2 className="text-2xl font-bold">{t("privacy.title")}</h2>
                <p className="text-blue-100">{t("privacy.subtitle")}</p>
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
            <h3 className="text-lg font-semibold text-blue-900 mb-3">{t("privacy.intro.title")}</h3>
            <p className="text-blue-800 leading-relaxed">{t("privacy.intro.content")}</p>
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
            <h4 className="font-semibold text-gray-900 mb-3">{t("privacy.contact_info.title")}</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>{t("privacy.contact_info.company")}:</strong> {t("privacy.contact_info.company_name")}
              </p>
              <p>
                <strong>{t("privacy.contact_info.cif")}:</strong> {t("privacy.contact_info.cif_number")}
              </p>
              <p>
                <strong>{t("privacy.contact_info.address")}:</strong> {t("privacy.contact_info.address_text")}
              </p>
              <p>
                <strong>{t("privacy.contact_info.email")}:</strong> {t("privacy.contact_info.email_address")}
              </p>
              <p>
                <strong>{t("privacy.contact_info.phone")}:</strong> {t("privacy.contact_info.phone_number")}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button onClick={onClose} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {t("privacy.buttons.understood")}
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              {t("privacy.buttons.print")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
