"use client"

import { useState, useEffect } from "react"
import { ExcursionCard } from "@/components/excursion-card"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import type { Excursion } from "@/lib/supabase"

interface LazyExcursionGridProps {
  excursions: Excursion[]
  className?: string
  itemsPerPage?: number
}

export function LazyExcursionGrid({
  excursions,
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
  itemsPerPage = 6,
}: LazyExcursionGridProps) {
  const [visibleItems, setVisibleItems] = useState(itemsPerPage)
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: false,
  })

  useEffect(() => {
    if (isIntersecting && visibleItems < excursions.length) {
      setVisibleItems((prev) => Math.min(prev + itemsPerPage, excursions.length))
    }
  }, [isIntersecting, visibleItems, excursions.length, itemsPerPage])

  const visibleExcursions = excursions.slice(0, visibleItems)
  const hasMore = visibleItems < excursions.length

  return (
    <>
      <div className={className}>
        {visibleExcursions.map((excursion, index) => (
          <div
            key={excursion.id}
            className="animate-fade-in"
            style={{ animationDelay: `${(index % itemsPerPage) * 0.1}s` }}
          >
            <ExcursionCard excursion={excursion} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </>
  )
}
