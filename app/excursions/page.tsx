"use client"

import { useEffect, useState } from "react"
import { Search, Filter, Grid, List, MapPin, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ExcursionCard } from "@/components/excursion-card"
import { supabase, type Excursion, getCategories, type Category } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"
import { BookingModal } from "@/components/booking-modal"

export default function ExcursionsPage() {
  const [excursions, setExcursions] = useState<Excursion[]>([])
  const [filteredExcursions, setFilteredExcursions] = useState<Excursion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { language, t } = useLanguage()

  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const handleBookExcursion = (excursion: Excursion) => {
    setSelectedExcursion(excursion)
    setIsBookingModalOpen(true)
  }

  const handleViewExcursionDetails = (excursion: Excursion) => {
    window.location.href = `/excursions/${excursion.id}`
  }

  // Remover el array hardcodeado de categories y reemplazarlo con esta función
  const getCategoriesWithCounts = () => {
    const allCategory = {
      id: 0,
      name_es: "Todas las categorías",
      name_en: "All categories",
      name_de: "Alle Kategorien",
      color: "#3B82F6",
      active: true,
      sort_order: 0,
      created_at: "",
      updated_at: "",
    }

    const categoriesWithCounts = [
      {
        ...allCategory,
        value: "all",
        label: t("excursions.all_categories"),
        count: excursions.length,
        icon: "🌟",
      },
      ...categories.map((category) => {
        // Usar el nombre exacto de la categoría como está en la base de datos
        const count = excursions.filter((exc) => exc.category === category.name_es).length
        return {
          ...category,
          value: category.name_es, // Usar el nombre exacto, no en minúsculas
          label: category[`name_${language}` as keyof Category] as string,
          count,
          icon: getCategoryIcon(category.name_es),
        }
      }),
    ]

    return categoriesWithCounts
  }

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      "Deportes Acuáticos": "🌊",
      "Aventuras en Tierra": "🏔️",
      Naturaleza: "🌿",
      Marina: "🌊",
      Senderismo: "🥾",
      Gastronomía: "🍽️",
      Paisajes: "🏔️",
      Familia: "👨‍👩‍👧‍👦",
      Aventura: "🎯",
      Cultura: "🏛️",
      Deportes: "⚽",
      Relax: "🧘‍♀️",
    }
    return iconMap[categoryName] || "📍"
  }

  useEffect(() => {
    const fetchExcursions = async () => {
      try {
        const { data, error } = await supabase.from("excursions").select("*").order("featured", { ascending: false })

        if (error) throw error
        setExcursions(data || [])
        setFilteredExcursions(data || [])
      } catch (error) {
        console.error("Error fetching excursions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExcursions()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (excursions.length > 0) {
      console.log(
        "Excursions categories:",
        excursions.map((exc) => exc.category),
      )
      console.log(
        "Available categories:",
        categories.map((cat) => cat.name_es),
      )
    }
  }, [excursions, categories])

  useEffect(() => {
    let filtered = excursions

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (excursion) =>
          excursion[`name_${language}` as keyof Excursion]
            ?.toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          excursion[`description_${language}` as keyof Excursion]
            ?.toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((excursion) => excursion.category === categoryFilter)
    }

    // Price filter
    if (priceFilter !== "all") {
      switch (priceFilter) {
        case "low":
          filtered = filtered.filter((excursion) => excursion.price < 50)
          break
        case "medium":
          filtered = filtered.filter((excursion) => excursion.price >= 50 && excursion.price < 80)
          break
        case "high":
          filtered = filtered.filter((excursion) => excursion.price >= 80)
          break
      }
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered = filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered = filtered.sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered = filtered.sort((a, b) =>
          (a[`name_${language}` as keyof Excursion] as string).localeCompare(
            b[`name_${language}` as keyof Excursion] as string,
          ),
        )
        break
      default:
        filtered = filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    setFilteredExcursions(filtered)
  }, [excursions, searchQuery, categoryFilter, priceFilter, sortBy, language, categories])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="text-xl text-gray-700 font-semibold">{t("common.loading_experiences")}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/hero-tenerife.jpg')] bg-cover bg-center opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Descubre Tenerife
              <span className="block text-yellow-300">Como Nunca Antes</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Vive experiencias únicas en la isla más espectacular de Canarias. Desde aventuras en la naturaleza hasta
              tours gastronómicos, tenemos la excursión perfecta para ti.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">{excursions.length}+</div>
                <div className="text-sm text-blue-200">Experiencias Únicas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">4.9★</div>
                <div className="text-sm text-blue-200">Valoración Media</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300">100%</div>
                <div className="text-sm text-blue-200">Satisfacción Garantizada</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Section */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">{t("excursions.filters")}</h2>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="w-9 h-9 p-0"
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Vista de cuadrícula</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="w-9 h-9 p-0"
              >
                <List className="h-4 w-4" />
                <span className="sr-only">Vista de lista</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={t("excursions.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-full"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 rounded-xl border-gray-200">
                <div className="flex items-center">
                  <span className="text-amber-500 mr-2">🌟</span>
                  <SelectValue placeholder={t("excursions.all_categories")} />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {getCategoriesWithCounts().map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        <span>{category.label}</span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full ml-2">
                        {category.count}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Filter */}
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="h-10 rounded-xl border-gray-200">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">€</span>
                  <SelectValue placeholder={t("excursions.all_prices")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("excursions.all_prices")}</SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-1">€</span>
                    <span>{t("excursions.price_low")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-1">€€</span>
                    <span>{t("excursions.price_medium")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-1">€€€</span>
                    <span>{t("excursions.price_high")}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 rounded-xl border-gray-200">
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">↓</span>
                  <SelectValue placeholder={t("excursions.sort_featured")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">
                  <div className="flex items-center">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-current mr-2" />
                    <span>{t("excursions.sort_featured")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="price-low">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">↑</span>
                    <span>{t("excursions.sort_price_low")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="price-high">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">↓</span>
                    <span>{t("excursions.sort_price_high")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-2">A-Z</span>
                    <span>{t("excursions.sort_name")}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(searchQuery || categoryFilter !== "all" || priceFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Search className="h-3 w-3 mr-1" />
                  {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="ml-2 text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {getCategoriesWithCounts().find((c) => c.value === categoryFilter)?.icon}{" "}
                  {getCategoriesWithCounts().find((c) => c.value === categoryFilter)?.label}
                  <button onClick={() => setCategoryFilter("all")} className="ml-2 text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                </Badge>
              )}
              {priceFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {priceFilter === "low" && "€ Menos de €50"}
                  {priceFilter === "medium" && "€€ €50 - €80"}
                  {priceFilter === "high" && "€€€ Más de €80"}
                  <button onClick={() => setPriceFilter("all")} className="ml-2 text-gray-500 hover:text-gray-700">
                    ×
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("all")
                  setPriceFilter("all")
                }}
                className="text-blue-600 hover:text-blue-700 text-sm px-3 py-1.5 h-auto"
              >
                {t("excursions.clear_filters")}
              </Button>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredExcursions.length}{" "}
              {filteredExcursions.length === 1 ? t("excursions.found") : t("excursions.found_plural")}
            </h3>
            <p className="text-gray-600 mt-1">
              {filteredExcursions.length === excursions.length
                ? t("excursions.showing_all")
                : `${t("excursions.filtered_from")} ${excursions.length} ${t("excursions.total_experiences")}`}
            </p>
          </div>

          {filteredExcursions.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{t("common.all_ratings")}</span>
            </div>
          )}
        </div>

        {/* Results Grid/List */}
        {filteredExcursions.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
            {filteredExcursions.map((excursion, index) => (
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
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">{t("excursions.no_results")}</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">{t("excursions.no_results_text")}</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("all")
                setPriceFilter("all")
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t("excursions.view_all")}
            </Button>
          </div>
        )}

        {/* Call to Action */}
        {filteredExcursions.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">{t("excursions.custom_experience")}</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">{t("excursions.custom_text")}</p>
            <Button asChild className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
              <a href="/contact">{t("excursions.contact_custom")}</a>
            </Button>
          </div>
        )}

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
    </div>
  )
}
