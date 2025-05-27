"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowRight, Phone, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import { ExcursionCard } from "@/components/excursion-card"
import { supabase, type Excursion } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"
import { PhotoGallery } from "@/components/photo-gallery"

export default function HomePage() {
  const [featuredExcursions, setFeaturedExcursions] = useState<Excursion[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: excursionsData, error: excursionsError } = await supabase
          .from("excursions")
          .select("*")
          .eq("featured", true)
          .limit(6)

        if (excursionsError) throw excursionsError

        setFeaturedExcursions(excursionsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-xl text-gray-700 font-semibold">{t("common.preparing")}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/hero-tenerife.jpg"
            alt="Los Gigantes, Tenerife"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 w-full max-w-7xl mx-auto mt-12">
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-tight">
              <span className="block text-white">{t("hero.title")}</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white">
                {t("hero.subtitle")}
              </span>
            </h1>
          </div>

          <div className="mb-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <p className="text-lg sm:text-xl text-white mb-12 leading-relaxed max-w-3xl mx-auto px-2">
              <span className="text-base">{t("hero.description")}</span>
              <span className="block mt-1 text-base text-white">{t("hero.description2")}</span>
            </p>
          </div>

          <div className="mb-12 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <SearchBar />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Featured Excursions */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-100 to-blue-100 text-gray-800 rounded-full text-sm font-semibold mb-8">
              <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
              {t("featured.badge")}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">{t("featured.title")}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("featured.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
            {featuredExcursions.map((excursion, index) => (
              <div key={excursion.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ExcursionCard excursion={excursion} />
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-105 border-0"
            >
              <Link href="/excursions">
                {t("featured.view_all")}
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-[url('/hero-tenerife.jpg')] opacity-10 bg-cover bg-center"></div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 w-full">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
            <span className="text-sm font-semibold text-white">{t("cta.ready_title")}</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            <span className="block">{t("cta.adventure_title")}</span>
            <span className="block text-blue-400">{t("cta.adventure_title2")}</span>
          </h2>

          <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
            {t("cta.adventure_text")}
            <span className="block mt-2 text-lg text-gray-300">{t("cta.adventure_text2")}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-105 border-0"
            >
              <Link href="/booking">
                <Phone className="mr-3 h-5 w-5" />
                {t("cta.book_now")}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white/10 backdrop-blur-xl border-white/30 text-white hover:bg-white hover:text-gray-900 px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              <Link href="/contact">
                <Mail className="mr-3 h-5 w-5" />
                {t("cta.more_info")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <PhotoGallery />
    </div>
  )
}
