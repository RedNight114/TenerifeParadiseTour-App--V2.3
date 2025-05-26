"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal"
import { TermsConditionsModal } from "@/components/terms-conditions-modal"
import { FAQModal } from "@/components/faq-modal"
import { useLanguage } from "@/lib/language-context"

export function Footer() {
  const { t } = useLanguage()
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false)

  return (
    <>
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="TenerifeParadiseTours Logo"
                    width={48}
                    height={48}
                    className="relative w-12 h-auto object-contain transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">TenerifeParadise</span>
                  <div className="text-sm text-gray-900 font-medium">Tours & Excursions</div>
                </div>
              </div>
              <p className="text-brand-text text-sm leading-relaxed max-w-xs">{t("footer.company_description")}</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-brand-heading mb-4">{t("footer.quick_links")}</h3>
              <ul className="space-y-2">
                {[
                  { href: "/", label: t("nav.home") },
                  { href: "/excursions", label: t("nav.excursions") },
                  { href: "/about", label: t("nav.about") },
                  { href: "/contact", label: t("nav.contact") },
                  { href: "/booking", label: t("nav.booking") },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-900 hover:text-gray-700 text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{t("footer.contact_info")}</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-brand-text">
                  <Phone className="h-4 w-4 mr-2 text-gray-900" />
                  +34 617 30 39 29
                </div>
                <div className="flex items-start text-sm text-brand-text">
                  <Mail className="h-4 w-4 mr-2 text-gray-900 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 text-xs mb-1">Email</span>
                    <a
                      href="mailto:Tenerifeparadisetoursandexcursions@hotmail.com"
                      className="text-brand-text hover:text-brand-heading transition-colors duration-200 break-all leading-tight"
                      title="Tenerifeparadisetoursandexcursions@hotmail.com"
                    >
                      Tenerifeparadisetours
                      <br />
                      andexcursions@hotmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center text-sm text-brand-text">
                  <MapPin className="h-4 w-4 mr-2 text-gray-900" />
                  Santa Cruz de Tenerife, España
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{t("footer.newsletter")}</h3>
              <p className="text-brand-text mb-4 text-sm">{t("footer.newsletter_text")}</p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                <Input type="email" placeholder="tu@email.com" className="text-sm flex-1 border-gray-200" />
                <Button
                  size="sm"
                  className="bg-brand-primary hover:bg-brand-primary-hover text-brand-button-text whitespace-nowrap font-semibold"
                >
                  {t("footer.subscribe")}
                </Button>
              </div>

              {/* Social Media */}
              <div className="flex space-x-3">
                <a href="#" className="text-gray-900 hover:text-gray-700 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-900 hover:text-gray-700 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-900 hover:text-gray-700 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-brand-text text-sm">{t("footer.copyright")}</p>
              <div className="flex items-center text-xs text-gray-400">
                <span>{t("footer.designed_by")}</span>
                <a
                  href="https://quickagence.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 font-semibold text-blue-500 hover:text-blue-600 transition-colors duration-200"
                >
                  QuickAgence
                </a>
              </div>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="text-gray-900 hover:text-gray-700 text-sm transition-colors cursor-pointer"
              >
                {t("footer.privacy")}
              </button>
              <button
                onClick={() => setIsTermsModalOpen(true)}
                className="text-gray-900 hover:text-gray-700 text-sm transition-colors cursor-pointer"
              >
                {t("footer.terms")}
              </button>
              <button
                onClick={() => setIsFAQModalOpen(true)}
                className="text-gray-900 hover:text-gray-700 text-sm transition-colors cursor-pointer"
              >
                {t("footer.faq")}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />

      {/* Terms and Conditions Modal */}
      <TermsConditionsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />

      {/* FAQ Modal */}
      <FAQModal isOpen={isFAQModalOpen} onClose={() => setIsFAQModalOpen(false)} />
    </>
  )
}
