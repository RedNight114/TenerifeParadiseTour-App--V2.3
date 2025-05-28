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
import { AdminAccess } from "@/components/admin-access"
import { SEOHead } from "@/components/seo/seo-head"
import { BookingModal } from "@/components/booking-modal"

export default function HomePage() {
  const [featuredExcursions, setFeaturedExcursions] = useState<Excursion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t, language } = useLanguage()

  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    // Preload critical resources
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = "/hero-tenerife.jpg"
    link.as = "image"
    document.head.appendChild(link)

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching featured excursions...")

        // Cargar excursiones destacadas
        const { data: excursionsData, error: excursionsError } = await supabase
          .from("excursions")
          .select("*")
          .eq("featured", true)
          .limit(6)

        if (excursionsError) {
          console.error("Supabase error:", excursionsError)
          throw excursionsError
        }

        console.log("Fetched excursions:", excursionsData)
        setFeaturedExcursions(excursionsData || [])

        // Si no hay excursiones destacadas, cargar las primeras 6
        if (!excursionsData || excursionsData.length === 0) {
          console.log("No featured excursions found, fetching first 6...")
          const { data: allExcursions, error: allError } = await supabase.from("excursions").select("*").limit(6)

          if (allError) {
            console.error("Error fetching all excursions:", allError)
          } else {
            console.log("Fetched all excursions:", allExcursions)
            setFeaturedExcursions(allExcursions || [])
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error al cargar las excursiones")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleBookExcursion = (excursion: Excursion) => {
    setSelectedExcursion(excursion)
    setIsBookingModalOpen(true)
  }

  const handleViewExcursionDetails = (excursion: Excursion) => {
    window.location.href = `/excursions/${excursion.id}`
  }

  const seoData = {
    title: {
      es: "TenerifeParadiseTours - Excursiones Únicas en Tenerife | Tours y Actividades",
      en: "TenerifeParadiseTours - Unique Excursions in Tenerife | Tours & Activities",
      de: "TenerifeParadiseTours - Einzigartige Ausflüge auf Teneriffa | Touren & Aktivitäten",
    },
    description: {
      es: "Descubre las mejores excursiones en Tenerife: avistamiento de ballenas, senderismo al Teide, tours por Anaga y Masca. Reserva fácil por WhatsApp. ¡Experiencias únicas te esperan!",
      en: "Discover the best excursions in Tenerife: whale watching, Teide hiking, Anaga and Masca tours. Easy WhatsApp booking. Unique experiences await you!",
      de: "Entdecken Sie die besten Ausflüge auf Teneriffa: Walbeobachtung, Teide-Wanderungen, Anaga- und Masca-Touren. Einfache WhatsApp-Buchung. Einzigartige Erlebnisse erwarten Sie!",
    },
    keywords: {
      es: "excursiones Tenerife, tours Tenerife, avistamiento ballenas, Teide, Anaga, Masca, senderismo Tenerife, actividades Canarias, turismo Tenerife",
      en: "Tenerife excursions, Tenerife tours, whale watching, Teide, Anaga, Masca, Tenerife hiking, Canary Islands activities, Tenerife tourism",
      de: "Teneriffa Ausflüge, Teneriffa Touren, Walbeobachtung, Teide, Anaga, Masca, Teneriffa Wandern, Kanarische Inseln Aktivitäten, Teneriffa Tourismus",
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-brand-primary rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-xl text-brand-text font-semibold">{t("common.preparing")}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SEOHead
        title={seoData.title[language]}
        description={seoData.description[language]}
        keywords={seoData.keywords[language]}
        image="/hero-tenerife.jpg"
        url="/"
        type="website"
        location={{
          name: "Tenerife, Canary Islands",
          address: "Tenerife, Canarias, España",
          latitude: 28.2916,
          longitude: -16.6291,
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: seoData.title[language],
          description: seoData.description[language],
          url: "https://tenerifeparadisetours.com",
          mainEntity: {
            "@type": "TravelAgency",
            name: "TenerifeParadiseTours",
            description: seoData.description[language],
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Excursiones en Tenerife",
              itemListElement: featuredExcursions.map((excursion) => ({
                "@type": "Offer",
                name: excursion[`name_${language}` as keyof Excursion],
                description: excursion[`short_description_${language}` as keyof Excursion],
                price: excursion.price,
                priceCurrency: "EUR",
                url: `https://tenerifeparadisetours.com/excursions/${excursion.id}`,
              })),
            },
          },
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-x-hidden pt-20 pb-12">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/hero-tenerife.jpg"
            alt="Los Gigantes, Tenerife - Excursiones únicas en las Islas Canarias"
            fill
            className="object-cover"
            priority={true}
            quality={85}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Título principal */}
          <div className="mb-8 sm:mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              <span className="block text-white">{t("hero.title")}</span>
              <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white mt-2">
                {t("hero.subtitle")}
              </span>
            </h1>
          </div>

          {/* Descripción */}
          <div className="mb-8 sm:mb-12 lg:mb-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <p className="text-base sm:text-lg md:text-xl text-white mb-6 sm:mb-8 lg:mb-12 leading-relaxed max-w-4xl mx-auto px-4">
              <span className="block mb-2">{t("hero.description")}</span>
              <span className="block text-sm sm:text-base md:text-lg text-white/90">{t("hero.description2")}</span>
            </p>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-16 sm:mb-20 lg:mb-24 animate-fade-in px-4" style={{ animationDelay: "0.6s" }}>
            <SearchBar />
          </div>
        </div>

        {/* Indicador de scroll simple */}
        <div className="absolute bottom-6 sm:bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Excursiones Destacadas */}
      <section id="featured-excursions" className="py-24 bg-gray-50 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-100 to-blue-100 text-brand-text rounded-full text-sm font-semibold mb-8">
              <Sparkles className="h-4 w-4 mr-2 text-brand-accent" />
              {t("featured.badge")}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">{t("featured.title")}</h2>
            <p className="text-xl text-brand-text max-w-3xl mx-auto">{t("featured.subtitle")}</p>
          </div>

          {/* Debug info */}
          {error && <div className="text-center mb-8 p-4 bg-red-100 text-red-700 rounded-lg">Error: {error}</div>}

          {/* Excursions Grid */}
          {featuredExcursions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-full">
              {featuredExcursions.map((excursion, index) => (
                <div key={excursion.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ExcursionCard
                    excursion={excursion}
                    onBook={() => handleBookExcursion(excursion)}
                    onViewDetails={() => handleViewExcursionDetails(excursion)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {loading ? "Cargando excursiones..." : "No hay excursiones disponibles en este momento."}
              </div>
              {!loading && (
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                  Recargar página
                </Button>
              )}
            </div>
          )}

          <div className="text-center mt-16">
            <Button
              asChild
              size="lg"
              className="bg-brand-heading hover:bg-blue-700 text-white px-12 py-6 text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-105 border-0"
            >
              <Link href="/excursions">
                {t("featured.view_all")}
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-gradient-to-br from-brand-heading via-gray-800 to-gray-900 relative overflow-x-hidden">
        <div className="absolute inset-0 bg-[url('/hero-tenerife.jpg')] opacity-10 bg-cover bg-center"></div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 w-full">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8">
            <Sparkles className="h-5 w-5 mr-2 text-brand-accent" />
            <span className="text-sm font-semibold text-white">{t("cta.ready_title")}</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            <span className="block">{t("cta.adventure_title")}</span>
            <span className="block text-brand-primary">{t("cta.adventure_title2")}</span>
          </h2>

          <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
            {t("cta.adventure_text")}
            <span className="block mt-2 text-lg text-gray-300">{t("cta.adventure_text2")}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-full">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-105 border-0"
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
              className="bg-white/10 backdrop-blur-xl border-white/30 text-white hover:bg-white hover:text-brand-text px-12 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              <Link href="/contact">
                <Mail className="mr-3 h-5 w-5" />
                {t("cta.more_info")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Galería de Fotos */}
      <PhotoGallery />

      {/* Admin Access - Solo visible para administradores */}
      <AdminAccess />

      {/* Booking Modal */}
      {selectedExcursion && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setSelectedExcursion(null)
          }}
          excursion={selectedExcursion}
        />
      )}
    </div>
  )
}
