// Performance monitoring and optimization utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startMeasure(name: string): void {
    if (typeof window !== "undefined" && "performance" in window) {
      performance.mark(`${name}-start`)
    }
  }

  endMeasure(name: string): number {
    if (typeof window !== "undefined" && "performance" in window) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)

      const measure = performance.getEntriesByName(name, "measure")[0]
      const duration = measure?.duration || 0

      this.metrics.set(name, duration)

      // Log slow operations
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`)
      }

      return duration
    }
    return 0
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  clearMetrics(): void {
    this.metrics.clear()
    if (typeof window !== "undefined" && "performance" in window) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }
}

// Web Vitals monitoring
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === "production") {
    // Send to analytics service
    console.log("Web Vital:", metric)

    // Example: Send to Google Analytics
    if (typeof window !== "undefined" && "gtag" in window) {
      ;(window as any).gtag("event", metric.name, {
        event_category: "Web Vitals",
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }
  }
}

// Image optimization utilities
export function generateImageSizes(breakpoints: number[] = [640, 768, 1024, 1280, 1536]): string {
  return breakpoints
    .map((bp, index) => {
      if (index === 0) return `(max-width: ${bp}px) 100vw`
      if (index === breakpoints.length - 1) return `${bp}px`
      return `(max-width: ${bp}px) ${Math.round((bp / breakpoints[breakpoints.length - 1]) * 100)}vw`
    })
    .join(", ")
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === "undefined") return

  // Preload critical images
  const criticalImages = ["/hero-tenerife.jpg", "/logo.png"]

  criticalImages.forEach((src) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = src
    document.head.appendChild(link)
  })

  // Preload critical fonts
  const criticalFonts = ["https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"]

  criticalFonts.forEach((href) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "style"
    link.href = href
    document.head.appendChild(link)
  })
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {},
): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null
  }

  return new IntersectionObserver(callback, {
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  })
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
