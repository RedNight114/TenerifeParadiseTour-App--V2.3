"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Globe, Check } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const languages = [
  { code: "es", name: "Español", flag: "🇪🇸", nativeName: "Español" },
  { code: "en", name: "English", flag: "🇬🇧", nativeName: "English" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "fr", name: "Français", flag: "🇫🇷", nativeName: "Français" },
  { code: "zh", name: "中文", flag: "🇨🇳", nativeName: "中文" },
  { code: "ru", name: "Русский", flag: "🇷🇺", nativeName: "Русский" },
]

export function LanguageSelectorModal() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const { language, setLanguage } = useLanguage() // language from context is the current app language

  useEffect(() => {
    const hasSelectedLanguage = localStorage.getItem("language")
    const hasSeenLanguageModal = localStorage.getItem("hasSeenLanguageModal")

    if (!hasSelectedLanguage && !hasSeenLanguageModal) {
      const browserLanguage = detectBrowserLanguage()
      setSelectedLanguage(browserLanguage) // Set modal's selection to browser language
      setIsVisible(true)
    } else if (hasSelectedLanguage) {
      setSelectedLanguage(hasSelectedLanguage) // Pre-select with stored language if modal re-opens
    } else {
      setSelectedLanguage(detectBrowserLanguage()) // Fallback if no stored language
    }
  }, [])

  const detectBrowserLanguage = (): string => {
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

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode)
  }

  const handleConfirm = () => {
    setLanguage(selectedLanguage as any) // Set app language
    localStorage.setItem("hasSeenLanguageModal", "true")
    setIsVisible(false)
  }

  const handleSkip = () => {
    // Use the already detected (and potentially user-selected in modal) language
    setLanguage(selectedLanguage as any)
    localStorage.setItem("hasSeenLanguageModal", "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  const currentSelectedLangData = languages.find((lang) => lang.code === selectedLanguage)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 bg-white shadow-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-white/20 rounded-full">
              <Globe className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">¡Bienvenido a TenerifeParadise!</h2>
          <p className="text-blue-100 text-sm">Selecciona tu idioma preferido para una mejor experiencia</p>
        </div>

        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentSelectedLangData?.flag}</span>
              <div>
                <p className="font-medium text-gray-900">{currentSelectedLangData?.nativeName}</p>
                <p className="text-sm text-blue-600">Detectado automáticamente</p>
              </div>
            </div>
            <Check className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">O elige otro idioma:</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {languages
              .filter((lang) => lang.code !== selectedLanguage) // Show other languages
              .map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left w-full
                            ${selectedLanguage === lang.code ? "bg-blue-100 ring-2 ring-blue-500" : ""}`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium text-gray-700 truncate">{lang.nativeName}</span>
                </button>
              ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3">
          <Button onClick={handleSkip} variant="outline" className="flex-1">
            Continuar ({currentSelectedLangData?.nativeName})
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            Confirmar
          </Button>
        </div>
      </Card>
    </div>
  )
}
