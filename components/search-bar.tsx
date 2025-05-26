"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Clock, Euro, MapPin, TrendingUp, Star, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase, type Excursion } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"

interface SearchBarProps {
  onSelect?: (excursion: Excursion) => void
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Excursion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const { language, t } = useLanguage()
  const searchRef = useRef<HTMLDivElement>(null)

  const getPopularSearches = () => {
    switch (language) {
      case "en":
        return [
          { term: "Teide", icon: "🏔️" },
          { term: "Whales", icon: "🐋" },
          { term: "Hiking", icon: "🥾" },
          { term: "Anaga", icon: "🌿" },
          { term: "Masca", icon: "⛰️" },
        ]
      case "de":
        return [
          { term: "Teide", icon: "🏔️" },
          { term: "Wale", icon: "🐋" },
          { term: "Wandern", icon: "🥾" },
          { term: "Anaga", icon: "🌿" },
          { term: "Masca", icon: "⛰️" },
        ]
      default:
        return [
          { term: "Teide", icon: "🏔️" },
          { term: "Ballenas", icon: "🐋" },
          { term: "Senderismo", icon: "🥾" },
          { term: "Anaga", icon: "🌿" },
          { term: "Masca", icon: "⛰️" },
        ]
    }
  }

  const popularSearches = getPopularSearches()

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

  useEffect(() => {
    const searchExcursions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        setIsOpen(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("excursions")
          .select("*")
          .or(`name_${language}.ilike.%${query}%,short_description_${language}.ilike.%${query}%`)
          .limit(5)

        if (error) throw error
        setSuggestions(data || [])
        setIsOpen(true)
      } catch (error) {
        console.error("Error searching excursions:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchExcursions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, language])

  const handleSelect = (excursion: Excursion) => {
    setQuery(excursion[`name_${language}` as keyof Excursion] as string)
    setIsOpen(false)
    setIsFocused(false)
    onSelect?.(excursion)
  }

  const handlePopularSearch = (term: string) => {
    setQuery(term)
    setIsFocused(false)
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (query.length === 0) {
      setIsOpen(true)
    }
  }

  const getSearchPlaceholder = () => {
    switch (language) {
      case "en":
        return "Search excursions... (e.g. Teide, whales, hiking)"
      case "de":
        return "Ausflüge suchen... (z.B. Teide, Wale, Wandern)"
      default:
        return "Buscar excursiones... (ej: Teide, ballenas, senderismo)"
    }
  }

  const getPopularSearchesLabel = () => {
    switch (language) {
      case "en":
        return "Popular searches"
      case "de":
        return "Beliebte Suchen"
      default:
        return "Búsquedas populares"
    }
  }

  const getNoResultsText = () => {
    switch (language) {
      case "en":
        return {
          title: "No results found",
          subtitle: "Try other terms like Teide, whales or hiking",
        }
      case "de":
        return {
          title: "Keine Ergebnisse gefunden",
          subtitle: "Versuchen Sie andere Begriffe wie Teide, Wale oder Wandern",
        }
      default:
        return {
          title: "No encontramos resultados",
          subtitle: "Intenta con otros términos como Teide, ballenas o senderismo",
        }
    }
  }

  const noResultsText = getNoResultsText()

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
              placeholder={getSearchPlaceholder()}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              className="flex-1 border-0 bg-transparent py-6 text-lg placeholder:text-gray-400 font-medium focus:ring-0 focus:outline-none text-gray-900"
            />

            {isLoading && (
              <div className="px-4">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}

            <button className="m-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Popular searches when no query */}
          {query.length === 0 && (
            <div className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm font-semibold text-gray-700">{getPopularSearchesLabel()}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((item) => (
                  <button
                    key={item.term}
                    onClick={() => handlePopularSearch(item.term)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>{item.icon}</span>
                    <span>{item.term}</span>
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
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                    index !== suggestions.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-600" />
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
              <p className="text-lg font-semibold text-gray-700 mb-2">{noResultsText.title}</p>
              <p className="text-sm text-gray-500 mb-4">{noResultsText.subtitle}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {popularSearches.slice(0, 3).map((item) => (
                  <button
                    key={item.term}
                    onClick={() => handlePopularSearch(item.term)}
                    className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>{item.icon}</span>
                    <span>{item.term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
