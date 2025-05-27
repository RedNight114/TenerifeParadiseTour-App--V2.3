"use client"

import type React from "react"

import { Suspense, lazy, type ComponentType } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyComponentProps {
  fallback?: React.ReactNode
  className?: string
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
) {
  const LazyComponent = lazy(importFunc)

  return function LazyWrapper(props: React.ComponentProps<T> & LazyComponentProps) {
    const { fallback: customFallback, className, ...componentProps } = props

    const defaultFallback = (
      <div className={className}>
        <Skeleton className="w-full h-64" />
      </div>
    )

    return (
      <Suspense fallback={customFallback || fallback || defaultFallback}>
        <LazyComponent {...componentProps} />
      </Suspense>
    )
  }
}

// Componentes lazy pre-configurados
export const LazyPhotoGallery = createLazyComponent(
  () => import("@/components/photo-gallery"),
  <div className="py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-64 mx-auto mb-4" />
      <Skeleton className="h-4 w-96 mx-auto mb-12" />
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className={`w-full ${i % 3 === 0 ? "h-80" : i % 3 === 1 ? "h-64" : "h-96"} mb-6`} />
        ))}
      </div>
    </div>
  </div>,
)

export const LazyBookingModal = createLazyComponent(() => import("@/components/booking-modal"))

export const LazyExcursionGallery = createLazyComponent(() => import("@/components/excursion-gallery"))
