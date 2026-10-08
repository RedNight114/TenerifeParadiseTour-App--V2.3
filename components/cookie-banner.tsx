"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Cookie, Settings } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSitePreview } from "@/lib/site-preview-context"

export function CookieBanner() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const { t } = useLanguage()
  const preview = useSitePreview()

  useEffect(() => {
    if (preview.active || pathname.startsWith("/admin") || pathname.startsWith("/platform") || pathname === "/login") return
    const cookieConsent = localStorage.getItem("cookieConsent")
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [pathname, preview.active])

  const acceptAllCookies = () => {
    localStorage.setItem("cookieConsent", "accepted")
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: false,
        functional: true,
      }),
    )
    setIsVisible(false)
  }

  const acceptNecessaryOnly = () => {
    localStorage.setItem("cookieConsent", "necessary")
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
      }),
    )
    setIsVisible(false)
  }

  const savePreferences = () => {
    const necessary = (document.getElementById("necessary") as HTMLInputElement)?.checked || true
    const analytics = (document.getElementById("analytics") as HTMLInputElement)?.checked || false
    const functional = (document.getElementById("functional") as HTMLInputElement)?.checked || false

    localStorage.setItem("cookieConsent", "custom")
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify({
        necessary,
        analytics,
        marketing: false,
        functional,
      }),
    )
    setIsVisible(false)
  }

  if (preview.active || pathname.startsWith("/admin") || pathname === "/login" || !isVisible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5">
      <Card className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_60px_-18px_rgba(15,23,42,0.35)]">
        <div className="p-4 sm:p-6">
          <div className="relative z-10">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 rounded-xl bg-teal-50 p-2.5 text-teal-800">
                <Cookie className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">
                  {t("cookies.title")}
                </h3>

                <p className="mb-4 text-sm leading-6 text-slate-600">{t("cookies.description")}</p>

                {showDetails && (
                  <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="font-medium text-gray-900">{t("cookies.preferences_title")}</h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label htmlFor="necessary" className="text-sm font-medium text-gray-700">
                            {t("cookies.necessary")}
                          </label>
                          <p className="text-xs text-gray-500">{t("cookies.necessary_desc")}</p>
                        </div>
                        <input
                          id="necessary"
                          type="checkbox"
                          checked={true}
                          disabled={true}
                          className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label htmlFor="analytics" className="text-sm font-medium text-gray-700">
                            {t("cookies.analytics")}
                          </label>
                          <p className="text-xs text-gray-500">{t("cookies.analytics_desc")}</p>
                        </div>
                        <input
                          id="analytics"
                          type="checkbox"
                          defaultChecked={false}
                          className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label htmlFor="functional" className="text-sm font-medium text-gray-700">
                            {t("cookies.functional")}
                          </label>
                          <p className="text-xs text-gray-500">{t("cookies.functional_desc")}</p>
                        </div>
                        <input
                          id="functional"
                          type="checkbox"
                          defaultChecked={true}
                          className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button
                    onClick={acceptAllCookies}
                    className="bg-teal-800 px-4 text-white hover:bg-teal-900 sm:px-5"
                  >
                    {t("cookies.accept_all")}
                  </Button>

                  <Button
                    onClick={acceptNecessaryOnly}
                    variant="outline"
                    className="border-slate-300 px-4 text-slate-700 hover:bg-slate-50 sm:px-5"
                  >
                    {t("cookies.necessary_only")}
                  </Button>

                  <Button
                    onClick={() => setShowDetails(!showDetails)}
                    variant="ghost"
                    className="px-4 text-teal-800 hover:bg-teal-50 sm:px-5"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t("cookies.customize")}
                  </Button>

                  {showDetails && (
                    <Button
                      onClick={savePreferences}
                      className="bg-teal-800 px-4 text-white hover:bg-teal-900 sm:px-5"
                    >
                      {t("cookies.save_preferences")}
                    </Button>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  {t("cookies.more_info")}{" "}
                  <Link href="/privacy" className="text-teal-800 underline-offset-4 hover:underline">{t("cookies.privacy_policy")}</Link>
                </p>
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="-mr-1 -mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label={t("cookies.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
