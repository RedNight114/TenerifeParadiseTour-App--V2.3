"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Globe, Check } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { usePathname } from "next/navigation"
import type { Language } from "@/lib/language-context"
import { useSitePreview } from "@/lib/site-preview-context"

const languages: { code: Language; name: string; flag: string; nativeName: string }[] = [
  { code: "es", name: "Español", flag: "🇪🇸", nativeName: "Español" },
  { code: "en", name: "English", flag: "🇬🇧", nativeName: "English" },
]

export function LanguageSelectorModal() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("es")
  const { setLanguage } = useLanguage()
  const preview = useSitePreview()

  useEffect(() => {
    if (preview.active || pathname.startsWith("/admin") || pathname.startsWith("/platform") || pathname === "/login") return
    const hasSelectedLanguage = localStorage.getItem("language")
    const hasSeenLanguageModal = localStorage.getItem("hasSeenLanguageModal")

    if (!hasSelectedLanguage && !hasSeenLanguageModal) {
      const browserLanguage = detectBrowserLanguage()
      setSelectedLanguage(browserLanguage)
      setIsVisible(true)
    } else if (hasSelectedLanguage) {
      if (languages.some((item) => item.code === hasSelectedLanguage)) {
        setSelectedLanguage(hasSelectedLanguage as Language)
      }
    } else {
      setSelectedLanguage(detectBrowserLanguage()) // Fallback if no stored language
    }
  }, [pathname, preview.active])

  const detectBrowserLanguage = (): Language => {
    if (typeof window === "undefined") return "es"
    const browserLanguages = navigator.languages || [navigator.language]
    for (const browserLang of browserLanguages) {
      const langCode = browserLang.split("-")[0].toLowerCase()
      const supportedLang = languages.find((lang) => lang.code === langCode)
      if (supportedLang) {
        return supportedLang.code
      }
    }
    return "es" // Default to Spanish if no browser match
  }

  const handleLanguageSelect = (langCode: Language) => {
    setSelectedLanguage(langCode)
  }

  if (preview.active) return null

  const handleConfirm = () => {
    setLanguage(selectedLanguage)
    localStorage.setItem("hasSeenLanguageModal", "true")
    setIsVisible(false)
  }

  const handleSkip = () => {
    // Use the already detected (and potentially user-selected in modal) language
    setLanguage(selectedLanguage)
    localStorage.setItem("hasSeenLanguageModal", "true")
    setIsVisible(false)
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/platform") || pathname === "/login" || !isVisible) return null

  const currentSelectedLangData = languages.find((lang) => lang.code === selectedLanguage)

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="bg-teal-800 p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-white/20 rounded-full">
              <Globe className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{selectedLanguage === "en" ? "Welcome" : "Bienvenido/a"}</h2>
          <p className="text-sm text-teal-50">{selectedLanguage === "en" ? "Choose your preferred language for a better experience" : "Selecciona tu idioma preferido para una mejor experiencia"}</p>
        </div>

        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 p-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentSelectedLangData?.flag}</span>
              <div>
                <p className="font-medium text-gray-900">{currentSelectedLangData?.nativeName}</p>
                <p className="text-sm text-teal-800">{selectedLanguage === "en" ? "Detected automatically" : "Detectado automáticamente"}</p>
              </div>
            </div>
            <Check className="h-5 w-5 text-teal-800" />
          </div>
        </div>

        <div className="p-6">
          <p className="mb-4 text-sm text-gray-600">{selectedLanguage === "en" ? "Or choose another language:" : "O elige otro idioma:"}</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {languages
              .filter((lang) => lang.code !== selectedLanguage) // Show other languages
              .map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700
                            ${selectedLanguage === lang.code ? "bg-teal-50 ring-2 ring-teal-700" : ""}`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium text-gray-700 truncate">{lang.nativeName}</span>
                </button>
              ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3">
          <Button onClick={handleSkip} variant="outline" className="flex-1">
            {selectedLanguage === "en" ? "Continue" : "Continuar"} ({currentSelectedLangData?.nativeName})
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-teal-800 text-white hover:bg-teal-900"
          >
            {selectedLanguage === "en" ? "Confirm" : "Confirmar"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
