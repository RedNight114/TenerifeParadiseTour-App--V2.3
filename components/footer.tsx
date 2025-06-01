"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal"
import { TermsConditionsModal } from "@/components/terms-conditions-modal"
import { FAQModal } from "@/components/faq-modal"
import { useLanguage } from "@/lib/language-context"

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

export function Footer() {
  const { t } = useLanguage()
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para suscribir al newsletter
    console.log("Suscribiendo email:", email)
    setEmail("")
    alert(t("footer.subscribe_success"))
  }

  return (
    <>
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-4">
                <Image src="/logo.png" alt="TenerifeParadiseTours Logo" width={48} height={48} className="mr-3" />
                <div>
                  <h3 className="text-gray-900">{t("footer.title")}</h3>
                  <p className="text-xs text-gray-600">{t("footer.subtitle")}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{t("footer.description")}</p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/share/16HZZK6eA1/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/tenerifeparadisetoursexcursion?igsh=MWs4em9zMHQ2OWps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@tenerifeparadisetours?_t=ZN-8wjOzUGK0DG&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gray-900 mb-4">{t("footer.quick_links")}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t("nav.home")}
                  </Link>
                </li>
                <li>
                  <Link href="/excursions" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t("nav.excursions")}
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t("nav.about")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t("nav.contact")}
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="text-gray-600 hover:text-gray-900 transition-colors">
                    {t("nav.booking")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-gray-900 mb-4">{t("footer.contact_info")}</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-600" />
                  <span>+34 617 30 39 29</span>
                </li>
                <li className="flex items-start">
                  <Mail className="h-4 w-4 mr-2 text-gray-600 mt-1" />
                  <div>
                    <span className="block text-sm text-blue-400">{t("footer.email")}</span>
                    <a
                      href="mailto:tenerifeparadisetoursandexcursions@hotmail.com"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Tenerifeparadisetours
                      <br />
                      andexcursions@hotmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                  <span>Santa Cruz de Tenerife, España</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-gray-900 mb-4">{t("footer.newsletter")}</h3>
              <p className="text-gray-600 text-sm mb-4">{t("footer.newsletter_text")}</p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <Input
                  type="email"
                  placeholder={t("footer.email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  {t("footer.subscribe")}
                </Button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-gray-600 text-sm">© 2024 TenerifeParadise Tours & Excursions. {t("footer.rights")}</p>
              <div className="flex items-center text-xs text-gray-500">
                <span>{t("footer.designed_by")}</span>
                <a
                  href="https://quickagence.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 hover:opacity-80 transition-opacity duration-200"
                >
                  <Image
                    src="/quickagence-logo.png"
                    alt="QuickAgence"
                    width={120}
                    height={30}
                    className="h-5 w-auto object-contain"
                  />
                </a>
              </div>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors cursor-pointer"
              >
                {t("footer.privacy")}
              </button>
              <button
                onClick={() => setIsTermsModalOpen(true)}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors cursor-pointer"
              >
                {t("footer.terms")}
              </button>
              <button
                onClick={() => setIsFAQModalOpen(true)}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors cursor-pointer"
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
