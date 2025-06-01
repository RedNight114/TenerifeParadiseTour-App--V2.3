"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, Phone, Globe, Home, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/lib/language-context"
import { supabase } from "@/lib/supabase"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const [excursions, setExcursions] = useState([])
  const [loadingExcursions, setLoadingExcursions] = useState(true)
  const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const languages = [
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
  ]

  // Función para truncar nombres largos
  const truncateName = (name, maxLength = 25) => {
    if (!name) return ""
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name
  }

  const fetchExcursions = async () => {
    try {
      const { data, error } = await supabase
        .from("excursions")
        .select("id, name_es, name_en, name_de, featured, price")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6)

      if (error) throw error
      setExcursions(data || [])
    } catch (error) {
      console.error("Error fetching excursions:", error)
    } finally {
      setLoadingExcursions(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchExcursions()
    }
  }, [mounted])

  if (!mounted) {
    return (
      <nav className="fixed top-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20"></div>
        </div>
      </nav>
    )
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-700 ease-out ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200 translate-y-0"
          : "bg-transparent translate-y-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo con animación mejorada */}
          <div className="flex items-center animate-fade-in">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-accent rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-all duration-500"></div>
                <Image
                  src="/logo.png"
                  alt="TenerifeParadiseTours Logo"
                  width={48}
                  height={48}
                  className="relative w-12 h-auto object-contain transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="hidden sm:block text-center">
                <span
                  className={`text-xl font-bold transition-all duration-500 ${
                    scrolled ? "text-gray-900" : "text-white"
                  }`}
                >
                  TenerifeParadise
                </span>
                <div
                  className={`text-xs font-medium transition-all duration-500 ${
                    scrolled ? "text-gray-700" : "text-white/90"
                  }`}
                >
                  Tours & Excursions
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation con animaciones escalonadas */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className={`font-medium transition-all duration-500 hover:scale-105 relative group animate-slide-in ${
                scrolled ? "text-brand-text hover:text-brand-heading" : "text-white/90 hover:text-white"
              }`}
              style={{ animationDelay: "0.1s" }}
            >
              {t("nav.home")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary group-hover:w-full transition-all duration-300"></span>
            </Link>

            {/* Excursions Dropdown con animación */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center font-medium transition-all duration-500 hover:scale-105 relative group animate-slide-in ${
                  scrolled ? "text-brand-text hover:text-brand-heading" : "text-white/90 hover:text-white"
                }`}
                style={{ animationDelay: "0.2s" }}
              >
                {t("nav.excursions")}
                <ChevronDown className="ml-1 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary group-hover:w-full transition-all duration-300"></span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 bg-white shadow-xl rounded-lg p-1 animate-fade-in max-h-[500px] overflow-y-auto border border-gray-100">
                {loadingExcursions ? (
                  <DropdownMenuItem className="justify-center py-6">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-sm text-gray-600 font-medium">Cargando excursiones...</span>
                    </div>
                  </DropdownMenuItem>
                ) : excursions.length > 0 ? (
                  <>
                    <div className="px-4 py-3 bg-blue-600 text-white rounded-lg mb-2">
                      <h3 className="text-sm font-semibold uppercase tracking-wide">
                        {t("excursions.featured_title")}
                      </h3>
                    </div>
                    {excursions.map((excursion, index) => (
                      <DropdownMenuItem
                        key={excursion.id}
                        className="hover:bg-gray-50 transition-all duration-200 animate-slide-in rounded-lg p-0 mb-1"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Link
                          href={`/excursions/${excursion.id}`}
                          className="w-full p-4 flex items-center justify-between group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
                                {truncateName(
                                  language === "es"
                                    ? excursion.name_es
                                    : language === "en"
                                      ? excursion.name_en
                                      : language === "de"
                                        ? excursion.name_de
                                        : excursion.name_es,
                                  20,
                                )}
                              </h4>
                              {excursion.featured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  TOP
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                              {t("excursions.unforgettable_adventure")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end ml-4">
                            {excursion.price && (
                              <div className="text-lg font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                                €{excursion.price}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">{t("featured.per_person")}</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <DropdownMenuItem className="hover:bg-blue-600 hover:text-white transition-all duration-200 rounded-lg p-0">
                        <Link
                          href="/excursions"
                          className="w-full p-3 font-medium text-center text-blue-600 hover:text-white transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <span>{t("featured.view_all_short")}</span>
                          <svg
                            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </>
                ) : (
                  <DropdownMenuItem className="text-gray-500 py-6 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.207-2.175M5.636 5.636L18.364 18.364"
                        />
                      </svg>
                      <span>No hay excursiones disponibles</span>
                    </div>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Dropdown con animación */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center font-medium transition-all duration-500 hover:scale-105 relative group animate-slide-in ${
                  scrolled ? "text-brand-text hover:text-brand-heading" : "text-white/90 hover:text-white"
                }`}
                style={{ animationDelay: "0.3s" }}
              >
                <Globe className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="transform group-hover:scale-110 transition-transform duration-300">
                  {languages.find((l) => l.code === language)?.flag}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary group-hover:w-full transition-all duration-300"></span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-gray-100 shadow-lg rounded-lg animate-fade-in">
                {languages.map((lang, index) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className="hover:bg-gray-50 transition-colors duration-200 animate-slide-in text-gray-700 hover:text-gray-900"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="mr-2 transform hover:scale-110 transition-transform duration-300">
                      {lang.flag}
                    </span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA Button con animación */}
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 animate-fade-in font-semibold"
              style={{ animationDelay: "0.4s" }}
            >
              <Link href="/contact" className="group">
                <Phone className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                {t("nav.contact")}
              </Link>
            </Button>
          </div>

          {/* Mobile menu button con animación */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Selector de idioma móvil */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`p-2 rounded-full transition-all duration-300 ${
                  scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/20"
                }`}
              >
                <span className="text-lg">{languages.find((l) => l.code === language)?.flag}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-xl border-0 p-2 w-[280px]">
                <div className="grid grid-cols-3 gap-1">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                        language === lang.code ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="text-2xl mb-1">{lang.flag}</span>
                      <span className="text-xs font-medium">{lang.name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botón de menú */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-full transition-all duration-300 ${
                scrolled
                  ? isOpen
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                  : isOpen
                    ? "bg-white text-blue-600"
                    : "text-white hover:bg-white/20"
              }`}
              aria-label="Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation PROFESIONAL */}
        {isOpen && (
          <div className="lg:hidden bg-white shadow-xl rounded-b-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-5">
            <div className="divide-y divide-gray-100">
              {/* Enlaces principales */}
              <div className="grid grid-cols-2 gap-px bg-gray-100 p-px">
                <Link
                  href="/"
                  className="flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <Home className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-800">{t("nav.home")}</span>
                </Link>

                <Link
                  href="/excursions"
                  className="flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                    <Map className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="font-medium text-gray-800">{t("nav.excursions")}</span>
                </Link>
              </div>

              {/* CTA */}
              <div className="p-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-md"
                  onClick={() => setIsOpen(false)}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  <span className="font-medium">{t("nav.contact")}</span>
                </Link>
              </div>

              {/* Excursiones destacadas */}
              {excursions.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {t("excursions.featured_title")}
                  </h3>
                  <div className="space-y-2">
                    {excursions.slice(0, 3).map((excursion) => (
                      <Link
                        key={excursion.id}
                        href={`/excursions/${excursion.id}`}
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                        onClick={() => setIsOpen(false)}
                      >
                        <div>
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {truncateName(
                              language === "es"
                                ? excursion.name_es
                                : language === "en"
                                  ? excursion.name_en
                                  : language === "de"
                                    ? excursion.name_de
                                    : excursion.name_es,
                              18,
                            )}
                          </h4>
                        </div>
                        {excursion.price && <div className="text-blue-600 font-semibold">€{excursion.price}</div>}
                      </Link>
                    ))}
                    <Link
                      href="/excursions"
                      className="flex items-center justify-center p-3 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="font-medium">{t("featured.view_all_short")}</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
