"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Search, Clock, Euro, TrendingUp, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase, addExcursionPricingModes, type Excursion } from "@/lib/supabase"
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

      let finalData = (data || []) as Excursion[]

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
        finalData = (allData || []) as Excursion[]
      }

      finalData = await addExcursionPricingModes(finalData)

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
      const safeQuery = query.trim().replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ").trim()
      if (safeQuery.length < 2) {
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
          .or(`name_${language}.ilike.%${safeQuery}%,short_description_${language}.ilike.%${safeQuery}%`)
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(5)
          .abortSignal(signal)

        if (error) throw error

        if (!signal.aborted) {
          setSuggestions(await addExcursionPricingModes((data || []) as Excursion[]))
          setIsOpen(true)
        }
      } catch (error: unknown) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
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

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSearch()
  }, [handleSearch])

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
    <div ref={searchRef} className="relative mx-auto w-full max-w-xl px-4 lg:max-w-3xl">
      <div className="relative">
        {/* Main search container */}
        <form role="search" onSubmit={handleSubmit} className="relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_18px_55px_rgba(3,16,24,0.28)] ring-offset-2 transition-shadow focus-within:ring-2 focus-within:ring-teal-300">
          <div className="flex items-center">
            <div className="pl-5 pr-2 sm:pl-6 sm:pr-3">
              <Search
                aria-hidden="true"
                className={`h-5 w-5 transition-colors duration-200 sm:h-6 sm:w-6 ${isFocused ? "text-teal-800" : "text-slate-400"}`}
              />
            </div>

            <Input
              id="hero-excursion-search"
              type="text"
              placeholder={texts.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              onKeyDown={handleKeyPress}
              role="combobox"
              aria-label={language === "en" ? "Search excursions" : "Buscar excursiones"}
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls="hero-excursion-search-results"
              className="h-[60px] flex-1 rounded-none border-0 bg-transparent py-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-[68px] sm:text-lg"
              autoComplete="off"
              spellCheck="false"
            />

            {isLoading && (
              <div className="px-3" role="status" aria-label={texts.searching}>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-800 motion-reduce:animate-none"></div>
              </div>
            )}

            <button
              type="submit"
              disabled={!query.trim()}
              className="m-1.5 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 font-semibold text-white transition-colors duration-200 hover:bg-brand-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:m-2 sm:min-h-12 sm:px-6"
              aria-label={texts.searchButton}
            >
              <Search aria-hidden="true" className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only">{texts.searchButton}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div id="hero-excursion-search-results" role="listbox" className="absolute left-4 right-4 top-full z-[9999] mt-3 max-h-96 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-md sm:left-4 sm:right-4">
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
                      <Image
                        width={48}
                        height={48}
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
                  role="option"
                  aria-selected="false"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelect(excursion)
                    }
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        width={64}
                        height={64}
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
