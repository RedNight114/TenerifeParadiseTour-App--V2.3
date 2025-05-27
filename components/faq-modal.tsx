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
      title: t("faq.category1.title"),
      faqs: [
        {
          question: t("faq.category1.q1.question"),
          answer: t("faq.category1.q1.answer"),
        },
        {
          question: t("faq.category1.q2.question"),
          answer: t("faq.category1.q2.answer"),
        },
        {
          question: t("faq.category1.q3.question"),
          answer: t("faq.category1.q3.answer"),
        },
      ],
    },
    {
      icon: CreditCard,
      title: t("faq.category2.title"),
      faqs: [
        {
          question: t("faq.category2.q1.question"),
          answer: t("faq.category2.q1.answer"),
        },
        {
          question: t("faq.category2.q2.question"),
          answer: t("faq.category2.q2.answer"),
        },
        {
          question: t("faq.category2.q3.question"),
          answer: t("faq.category2.q3.answer"),
        },
      ],
    },
    {
      icon: Users,
      title: t("faq.category3.title"),
      faqs: [
        {
          question: t("faq.category3.q1.question"),
          answer: t("faq.category3.q1.answer"),
        },
        {
          question: t("faq.category3.q2.question"),
          answer: t("faq.category3.q2.answer"),
        },
        {
          question: t("faq.category3.q3.question"),
          answer: t("faq.category3.q3.answer"),
        },
      ],
    },
    {
      icon: MapPin,
      title: t("faq.category4.title"),
      faqs: [
        {
          question: t("faq.category4.q1.question"),
          answer: t("faq.category4.q1.answer"),
        },
        {
          question: t("faq.category4.q2.question"),
          answer: t("faq.category4.q2.answer"),
        },
        {
          question: t("faq.category4.q3.question"),
          answer: t("faq.category4.q3.answer"),
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
            <h3 className="text-lg font-semibold text-purple-900 mb-3">{t("faq.intro.title")}</h3>
            <p className="text-purple-800 leading-relaxed">{t("faq.intro.content")}</p>
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
              <h4 className="font-semibold text-gray-900 mb-3">{t("faq.contact.title")}</h4>
              <p className="text-gray-600 mb-4">{t("faq.contact.content")}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Phone className="h-4 w-4 mr-2" />
                  {t("faq.contact.whatsapp")}
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  {t("faq.contact.schedule")}
                </Button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button onClick={onClose} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
              {t("faq.buttons.close")}
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              {t("faq.buttons.print")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
