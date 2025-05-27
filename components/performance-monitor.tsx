"use client"

import { useEffect } from "react"
import { PerformanceMonitor, reportWebVitals } from "@/lib/performance"

export function PerformanceMonitorComponent() {
  useEffect(() => {
    // Initialize performance monitoring
    const monitor = PerformanceMonitor.getInstance()

    // Monitor page load
    monitor.startMeasure("page-load")

    const handleLoad = () => {
      monitor.endMeasure("page-load")
    }

    // Monitor largest contentful paint
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "largest-contentful-paint") {
            reportWebVitals({
              name: "LCP",
              value: entry.startTime,
              id: "lcp",
            })
          }
        }
      })

      observer.observe({ entryTypes: ["largest-contentful-paint"] })
    }

    // Monitor cumulative layout shift
    if ("PerformanceObserver" in window) {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }

        reportWebVitals({
          name: "CLS",
          value: clsValue,
          id: "cls",
        })
      })

      observer.observe({ entryTypes: ["layout-shift"] })
    }

    // Monitor first input delay
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          reportWebVitals({
            name: "FID",
            value: (entry as any).processingStart - entry.startTime,
            id: "fid",
          })
        }
      })

      observer.observe({ entryTypes: ["first-input"] })
    }

    window.addEventListener("load", handleLoad)

    return () => {
      window.removeEventListener("load", handleLoad)
    }
  }, [])

  return null
}
