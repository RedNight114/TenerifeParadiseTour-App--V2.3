"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function PaymentStatusPoller({ active }: { active: boolean }) {
  const router = useRouter()
  useEffect(() => {
    if (!active) return

    let delay = 2_000
    let timer: number | undefined

    const schedule = () => {
      timer = window.setTimeout(() => {
        if (document.visibilityState === "visible" && navigator.onLine) {
          router.refresh()
          delay = Math.min(delay * 2, 15_000)
        }
        schedule()
      }, delay)
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return
      if (timer !== undefined) window.clearTimeout(timer)
      router.refresh()
      delay = 2_000
      schedule()
    }

    schedule()
    document.addEventListener("visibilitychange", refreshWhenVisible)
    window.addEventListener("online", refreshWhenVisible)

    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
      window.removeEventListener("online", refreshWhenVisible)
    }
  }, [active, router])
  return null
}
