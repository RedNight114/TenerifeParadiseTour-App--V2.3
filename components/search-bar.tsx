"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Search, Clock, Euro, TrendingUp, Star, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase, type Excursion } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"
import { useRouter } from "next/navigation"

interface SearchBarProps {
  onSelect?: (excursion: Excursion) => void
}

// Cache para excursiones populares
let popularExcursionsCache: { data: Excursion[]; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Excursion[]>([])
  const [popularExcursions, setPopularExcursions] = useState<Excursion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const { language } = useLanguage()
  console.log("Current language in SearchBar:", language)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const abortControllerRef = useRef<AbortController | null>(null)

  // Función optimizada para cargar excursiones populares con cache
  const fetchPopularExcursions = useCallback(async () => {
    const now = Date.now()

    // Verificar cache
    if (popularExcursionsCache && now - popularExcursionsCache.timestamp < CACHE_DURATION) {
      setPopularExcursions(popularExcursionsCache.data)
      return
    }

    try {
      const { data, error } = await supabase
        .from("excursions")
        .select(
          "id, name_es, name_en, name_de, short_description_es, short_description_en, short_description_de, price, duration, image_url, featured",
        )
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error

      let finalData = data || []

      // Si no hay excursiones destacadas, tomar las primeras 5
      if (finalData.length === 0) {
        const { data: allData, error: allError } = await supabase
          .from("excursions")
          .select(
            "id, name_es, name_en, name_de, short_description_es, short_description_en, short_description_de, price, duration, image_url, featured",
          )
          .order("created_at", { ascending: false })
          .limit(5)

        if (allError) throw allError
        finalData = allData || []
      }

      // Actualizar cache
      popularExcursionsCache = {
        data: finalData,
        timestamp: now,
      }

      setPopularExcursions(finalData)
    } catch (error) {
      console.error("Error fetching popular excursions:", error)
      setPopularExcursions([])
    }
  }, [])

  // Cargar excursiones populares al montar
  useEffect(() => {
    fetchPopularExcursions()
  }, [fetchPopularExcursions])

  // Manejar clics fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Búsqueda optimizada con debounce y cancelación
  useEffect(() => {
    const searchExcursions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        setIsOpen(false)
        setIsLoading(false)
        return
      }

      // Cancelar búsqueda anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Crear nuevo controlador de cancelación
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from("excursions")
          .select(
            "id, name_es, name_en, name_de, short_description_es, short_description_en, short_description_de, price, duration, image_url, featured",
          )
          .or(`name_${language}.ilike.%${query}%,short_description_${language}.ilike.%${query}%`)
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5)
          .abortSignal(signal)

        if (error) throw error

        if (!signal.aborted) {
          setSuggestions(data || [])
          setIsOpen(true)
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error searching excursions:", error)
          setSuggestions([])
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    const debounceTimer = setTimeout(searchExcursions, 300)
    return () => {
      clearTimeout(debounceTimer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query, language])

  // Handlers optimizados con useCallback
  const handleSelect = useCallback(
    (excursion: Excursion) => {
      const name = excursion[`name_${language}` as keyof Excursion] as string
      setQuery(name)
      setIsOpen(false)
      setIsFocused(false)
      router.push(`/excursions/${excursion.id}`)
      onSelect?.(excursion)
    },
    [language, router, onSelect],
  )

  const handlePopularSelect = useCallback(
    (excursion: Excursion) => {
      const name = excursion[`name_${language}` as keyof Excursion] as string
      setQuery(name)
      setIsFocused(false)
      router.push(`/excursions/${excursion.id}`)
    },
    [language, router],
  )

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    if (query.length === 0) {
      setIsOpen(true)
    }
  }, [query.length])

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      router.push(`/excursions?search=${encodeURIComponent(query)}`)
      setIsOpen(false)
      setIsFocused(false)
    }
  }, [query, router])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch()
      }
      if (e.key === "Escape") {
        setIsOpen(false)
        setIsFocused(false)
      }
    },
    [handleSearch],
  )

  // Textos memoizados para evitar recálculos
  const texts = useMemo(() => {
    const translations = {
      es: {
        placeholder: "Buscar excursiones... (ej: Teide, ballenas, senderismo)",
        popularLabel: "Excursiones populares",
        searchButton: "Buscar",
        searching: "Buscando...",
        noResults: {
          title: "No encontramos resultados",
          subtitle: "Intenta buscar otras excursiones o explora todos los tours disponibles",
          button: "Ver Todas las Excursiones",
        },
        duration: "Duración",
        price: "Precio",
        from: "Desde",
        featured: "DESTACADO",
        rating: "Valoración",
      },
      en: {
        placeholder: "Search excursions... (e.g. Teide, whales, hiking)",
        popularLabel: "Popular excursions",
        searchButton: "Search",
        searching: "Searching...",
        noResults: {
          title: "No results found",
          subtitle: "Try searching for other excursions or browse all available tours",
          button: "Browse All Excursions",
        },
        duration: "Duration",
        price: "Price",
        from: "From",
        featured: "FEATURED",
        rating: "Rating",
      },
      de: {
        placeholder: "Ausflüge suchen... (z.B. Teide, Wale, Wandern)",
        popularLabel: "Beliebte Ausflüge",
        searchButton: "Suchen",
        searching: "Suche läuft...",
        noResults: {
          title: "Keine Ergebnisse gefunden",
          subtitle: "Versuchen Sie andere Ausflüge zu suchen oder durchsuchen Sie alle verfügbaren Touren",
          button: "Alle Ausflüge durchsuchen",
        },
        duration: "Dauer",
        price: "Preis",
        from: "Ab",
        featured: "EMPFOHLEN",
        rating: "Bewertung",
      },
      fr: {
        placeholder: "Rechercher des excursions... (ex: Teide, baleines, randonnée)",
        popularLabel: "Excursions populaires",
        searchButton: "Rechercher",
        searching: "Recherche en cours...",
        noResults: {
          title: "Aucun résultat trouvé",
          subtitle: "Essayez de rechercher d'autres excursions ou parcourez tous les tours disponibles",
          button: "Voir Toutes les Excursions",
        },
        duration: "Durée",
        price: "Prix",
        from: "À partir de",
        featured: "VEDETTE",
        rating: "Note",
      },
      it: {
        placeholder: "Cerca escursioni... (es: Teide, balene, trekking)",
        popularLabel: "Escursioni popolari",
        searchButton: "Cerca",
        searching: "Ricerca in corso...",
        noResults: {
          title: "Nessun risultato trovato",
          subtitle: "Prova a cercare altre escursioni o sfoglia tutti i tour disponibili",
          button: "Vedi Tutte le Escursioni",
        },
        duration: "Durata",
        price: "Prezzo",
        from: "Da",
        featured: "IN EVIDENZA",
        rating: "Valutazione",
      },
      nl: {
        placeholder: "Zoek excursies... (bijv. Teide, walvissen, wandelen)",
        popularLabel: "Populaire excursies",
        searchButton: "Zoeken",
        searching: "Zoeken...",
        noResults: {
          title: "Geen resultaten gevonden",
          subtitle: "Probeer andere excursies te zoeken of bekijk alle beschikbare tours",
          button: "Bekijk Alle Excursies",
        },
        duration: "Duur",
        price: "Prijs",
        from: "Vanaf",
        featured: "UITGELICHT",
        rating: "Beoordeling",
      },
    }

    return translations[language as keyof typeof translations] || translations.es
  }, [language])

  return (
    <div ref={searchRef} className="relative w-full max-w-xl lg:max-w-3xl mx-auto px-4">
      <div className="relative">
        {/* Main search container */}
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center">
            <div className="pl-6 pr-3">
              <Search
                className={`h-6 w-6 transition-colors duration-200 ${isFocused ? "text-blue-600" : "text-gray-400"}`}
              />
            </div>

            <Input
              type="text"
              placeholder={texts.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              onKeyDown={handleKeyPress}
              className="flex-1 border-0 bg-transparent py-6 text-lg placeholder:text-gray-400 font-medium focus:ring-0 focus:outline-none text-gray-900"
              autoComplete="off"
              spellCheck="false"
            />

            {isLoading && (
              <div className="px-4" aria-label={texts.searching}>
                <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}

            <button
              onClick={handleSearch}
              className="m-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={texts.searchButton}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 z-[9999] max-h-96 overflow-hidden ring-1 ring-black/5">
          {/* Popular excursions when no query */}
          {query.length === 0 && popularExcursions.length > 0 && (
            <div className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm font-semibold text-gray-700">{texts.popularLabel}</span>
              </div>
              <div className="space-y-3">
                {popularExcursions.map((excursion) => (
                  <button
                    key={excursion.id}
                    onClick={() => handlePopularSelect(excursion)}
                    className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          excursion.image_url ||
                          `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(excursion[`name_${language || "/placeholder.svg"}` as keyof Excursion] as string)}`
                        }
                        alt={excursion[`name_${language}` as keyof Excursion] as string}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(excursion[`name_${language}` as keyof Excursion] as string)}`
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">
                          {excursion[`name_${language}` as keyof Excursion] as string}
                        </h4>
                        {excursion.featured && (
                          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            {texts.featured}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-blue-600 font-semibold">€{excursion.price}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{excursion.duration}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          {suggestions.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((excursion, index) => (
                <div
                  key={excursion.id}
                  onClick={() => handleSelect(excursion)}
                  className={`group p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    index !== suggestions.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelect(excursion)
                    }
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          excursion.image_url ||
                          `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(excursion[`name_${language || "/placeholder.svg"}` as keyof Excursion] as string)}`
                        }
                        alt={excursion[`name_${language}` as keyof Excursion] as string}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(excursion[`name_${language}` as keyof Excursion] as string)}`
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {excursion[`name_${language}` as keyof Excursion] as string}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                        {excursion[`short_description_${language}` as keyof Excursion] as string}
                      </p>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-green-50 px-3 py-1 rounded-lg">
                          <Clock className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-sm font-medium text-green-700">{excursion.duration}</span>
                        </div>

                        <div className="flex items-center bg-blue-50 px-3 py-1 rounded-lg">
                          <Euro className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-700">€{excursion.price}</span>
                        </div>

                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm text-gray-600">4.9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && suggestions.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">{texts.noResults.title}</p>
              <p className="text-sm text-gray-500 mb-4">{texts.noResults.subtitle}</p>
              <button
                onClick={() => router.push("/excursions")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {texts.noResults.button}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
