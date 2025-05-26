"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, Phone, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/lib/language-context"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { language, setLanguage, t } = useLanguage()

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
  ]

  const featuredExcursions = [
    { name: t("featured.teide_stars"), href: "/excursions?featured=teide" },
    { name: t("featured.whale_watching"), href: "/excursions?featured=whales" },
    { name: t("featured.anaga_hiking"), href: "/excursions?featured=anaga" },
  ]

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
              <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-lg border-gray-200 animate-fade-in">
                {featuredExcursions.map((excursion, index) => (
                  <DropdownMenuItem
                    key={excursion.href}
                    className="hover:bg-blue-50 transition-colors duration-300 animate-slide-in text-brand-text hover:text-brand-heading"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link href={excursion.href} className="w-full">
                      {excursion.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem className="border-t border-gray-200 hover:bg-blue-50 transition-colors duration-300">
                  <Link href="/excursions" className="w-full font-medium text-brand-text hover:text-brand-heading">
                    {t("featured.view_all_short")}
                  </Link>
                </DropdownMenuItem>
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
              <DropdownMenuContent className="bg-white/95 backdrop-blur-lg border-gray-200 animate-fade-in">
                {languages.map((lang, index) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className="hover:bg-blue-50 transition-colors duration-300 animate-slide-in text-brand-text hover:text-brand-heading"
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
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-all duration-500 hover:scale-110 animate-fade-in ${
                scrolled ? "text-brand-text hover:text-brand-heading" : "text-white hover:text-white/80"
              }`}
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                    isOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                  }`}
                />
                <X
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                    isOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation con animaciones mejoradas */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 rounded-b-2xl">
            <div className="px-4 pt-4 pb-6 space-y-3">
              {[
                { href: "/", label: t("nav.home") },
                { href: "/excursions", label: t("nav.excursions") },
                { href: "/contact", label: t("nav.contact") },
              ].map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 text-brand-text hover:text-brand-heading font-medium rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 transform ${
                    isOpen ? "animate-slide-in" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Language selector móvil */}
              <div className={`px-4 py-3 ${isOpen ? "animate-slide-in" : ""}`} style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center space-x-2 text-brand-accent text-sm mb-2">
                  <Globe className="h-4 w-4" />
                  <span>Idioma:</span>
                </div>
                <div className="flex space-x-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        language === lang.code
                          ? "bg-blue-100 text-brand-heading"
                          : "bg-gray-100 text-brand-text hover:bg-blue-50"
                      }`}
                    >
                      <span className="mr-1">{lang.flag}</span>
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
