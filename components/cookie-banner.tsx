"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Cookie, Settings } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookieConsent")
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

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

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto bg-gradient-to-br from-white via-blue-50/30 to-white shadow-2xl border border-blue-100/50 backdrop-blur-md overflow-hidden rounded-2xl">
        <div className="p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Cookie className="h-6 w-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  {t("cookies.title")}
                </h3>

                <p className="text-gray-700 text-base mb-6 leading-relaxed">{t("cookies.description")}</p>

                {showDetails && (
                  <div className="space-y-4 mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
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
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
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
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
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
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={acceptAllCookies}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    {t("cookies.accept_all")}
                  </Button>

                  <Button
                    onClick={acceptNecessaryOnly}
                    variant="outline"
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    {t("cookies.necessary_only")}
                  </Button>

                  <Button
                    onClick={() => setShowDetails(!showDetails)}
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t("cookies.customize")}
                  </Button>

                  {showDetails && (
                    <Button
                      onClick={savePreferences}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                    >
                      {t("cookies.save_preferences")}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  {t("cookies.more_info")}{" "}
                  <button className="text-blue-600 hover:underline">{t("cookies.privacy_policy")}</button>
                </p>
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
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
