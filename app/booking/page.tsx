"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Users,
  MessageCircle,
  Clock,
  MapPin,
  Star,
  Calendar,
  Phone,
  Mail,
  User,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, type Excursion } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"

export default function BookingPage() {
  const [excursions, setExcursions] = useState<Excursion[]>([])
  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null)
  const [formData, setFormData] = useState({
    customer_name: "",
    email: "",
    phone: "",
    excursion_id: "",
    preferred_date: "",
    number_of_people: "2",
    special_requests: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { language, t } = useLanguage()

  useEffect(() => {
    const fetchExcursions = async () => {
      try {
        const { data, error } = await supabase.from("excursions").select("*").order("featured", { ascending: false })

        if (error) throw error
        setExcursions(data || [])
      } catch (error) {
        console.error("Error fetching excursions:", error)
      }
    }

    fetchExcursions()
  }, [])

  // Add this useEffect right after the existing useEffect hooks
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleExcursionSelect = (excursionId: string) => {
    const excursion = excursions.find((e) => e.id.toString() === excursionId)
    setSelectedExcursion(excursion || null)
    setFormData({ ...formData, excursion_id: excursionId })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Save to database
      const { error } = await supabase.from("bookings").insert([
        {
          ...formData,
          excursion_id: Number.parseInt(formData.excursion_id),
          number_of_people: Number.parseInt(formData.number_of_people),
          language,
        },
      ])

      if (error) throw error

      // Generate WhatsApp message
      const excursionName = selectedExcursion?.[`name_${language}` as keyof Excursion] as string
      const message = encodeURIComponent(
        `🌟 ${t("booking.whatsapp_greeting")}\n\n` +
          `📍 ${t("booking.whatsapp_excursion")}: ${excursionName}\n` +
          `👤 ${t("contact.name")}: ${formData.customer_name}\n` +
          `📧 ${t("contact.email")}: ${formData.email}\n` +
          `📱 ${t("contact.phone")}: ${formData.phone}\n` +
          `📅 ${t("booking.whatsapp_date")}: ${formData.preferred_date}\n` +
          `👥 ${t("booking.whatsapp_people")}: ${formData.number_of_people}\n` +
          `💰 ${t("booking.whatsapp_price")}: €${selectedExcursion?.price ? selectedExcursion.price * Number.parseInt(formData.number_of_people) : 0}\n` +
          `${formData.special_requests ? `📝 ${t("booking.whatsapp_requests")}: ${formData.special_requests}\n` : ""}` +
          `\n${t("booking.whatsapp_confirm")} 🙏`,
      )

      // Show success and open WhatsApp
      setShowSuccess(true)
      setTimeout(() => {
        window.open(`https://wa.me/34617303929?text=${message}`, "_blank")
      }, 1500)

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          customer_name: "",
          email: "",
          phone: "",
          excursion_id: "",
          preferred_date: "",
          number_of_people: "2",
          special_requests: "",
        })
        setSelectedExcursion(null)
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error submitting booking:", error)
      alert(t("booking.error_message"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("booking.success_title")}</h2>
          <p className="text-lg text-gray-600 mb-6">{t("booking.success_message")}</p>
          <div className="w-16 h-1 bg-green-500 rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-tenerife.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-800/90"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
              <span className="text-sm font-semibold">{t("booking.hero_badge")}</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">{t("booking.title")}</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t("booking.subtitle")}
              <span className="block mt-2 text-lg text-yellow-300">{t("booking.subtitle2")}</span>
            </p>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-blue-100">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm">{t("booking.trust_confirmation")}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-blue-100">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm">{t("booking.trust_cancellation")}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-blue-100">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm">{t("booking.trust_support")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center">
                  <Calendar className="h-6 w-6 mr-3" />
                  {t("booking.form_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleSubmit} className="space-y-12">
                  {/* Personal Information Section */}
                  <div className="space-y-8">
                    <div className="flex items-center mb-8">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-6">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{t("booking.personal_info")}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      <div className="relative">
                        <label htmlFor="customer_name" className="block text-sm font-semibold text-gray-700 mb-4">
                          {t("contact.name")} *
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="customer_name"
                            type="text"
                            required
                            value={formData.customer_name}
                            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                            className="pl-12 h-14 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
                            placeholder={t("booking.name_placeholder")}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative">
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-4">
                            {t("contact.email")} *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="pl-12 h-14 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
                              placeholder={t("booking.email_placeholder")}
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-4">
                            {t("contact.phone")} *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="pl-12 h-14 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
                              placeholder="+34 600 000 000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Excursion Selection Section */}
                  <div className="space-y-8 border-t border-gray-200 pt-12">
                    <div className="flex items-center mb-8">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-6">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{t("booking.excursion_details")}</h3>
                    </div>

                    <div className="relative">
                      <label htmlFor="excursion" className="block text-sm font-semibold text-gray-700 mb-4">
                        {t("booking.select_excursion")} *
                      </label>
                      <Select value={formData.excursion_id} onValueChange={handleExcursionSelect} required>
                        <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg">
                          <SelectValue placeholder={t("booking.excursion_placeholder")} />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {excursions.map((excursion) => (
                            <SelectItem key={excursion.id} value={excursion.id.toString()} className="py-4">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3">
                                  {excursion.featured && (
                                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                      <Star className="h-3 w-3 mr-1" />
                                      {t("booking.premium_label")}
                                    </Badge>
                                  )}
                                  <span className="font-medium">
                                    {excursion[`name_${language}` as keyof Excursion] as string}
                                  </span>
                                </div>
                                <span className="text-blue-600 font-bold">€{excursion.price}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="relative">
                        <label htmlFor="preferred_date" className="block text-sm font-semibold text-gray-700 mb-4">
                          {t("booking.date")} *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="preferred_date"
                            type="date"
                            required
                            min={getTomorrowDate()}
                            value={formData.preferred_date}
                            onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                            className="pl-12 h-14 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <label htmlFor="number_of_people" className="block text-sm font-semibold text-gray-700 mb-4">
                          {t("booking.people")} *
                        </label>
                        <Select
                          value={formData.number_of_people}
                          onValueChange={(value) => setFormData({ ...formData, number_of_people: value })}
                        >
                          <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg">
                            <div className="flex items-center">
                              <Users className="h-5 w-5 text-gray-400 mr-3" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {t("booking.people_count", { count: num })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="relative">
                      <label htmlFor="special_requests" className="block text-sm font-semibold text-gray-700 mb-4">
                        {t("booking.requests")}
                      </label>
                      <Textarea
                        id="special_requests"
                        rows={4}
                        placeholder={t("booking.requests_placeholder")}
                        value={formData.special_requests}
                        onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                        className="border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg resize-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white h-16 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0"
                    disabled={isSubmitting || !formData.excursion_id}
                  >
                    <MessageCircle className="mr-3 h-6 w-6" />
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        {t("booking.processing")}
                      </div>
                    ) : (
                      <>
                        {t("booking.submit")}
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary Sidebar */}
          <div>
            <Card className="sticky top-8 shadow-xl border-0 bg-white/90 backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  {t("booking.summary")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedExcursion ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        {selectedExcursion[`name_${language}` as keyof Excursion] as string}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedExcursion[`short_description_${language}` as keyof Excursion] as string}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center bg-green-50 p-3 rounded-lg">
                        <Clock className="h-5 w-5 mr-3 text-green-600" />
                        <div>
                          <span className="text-sm text-gray-600">{t("booking.duration_label")}:</span>
                          <div className="font-semibold text-green-700">{selectedExcursion.duration}</div>
                        </div>
                      </div>

                      <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                        <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                        <div>
                          <span className="text-sm text-gray-600">{t("booking.category_label")}:</span>
                          <div className="font-semibold text-blue-700">{selectedExcursion.category}</div>
                        </div>
                      </div>

                      <div className="flex items-center bg-yellow-50 p-3 rounded-lg">
                        <Star className="h-5 w-5 mr-3 text-yellow-600" />
                        <div>
                          <span className="text-sm text-gray-600">{t("booking.rating_label")}:</span>
                          <div className="font-semibold text-yellow-700">
                            4.9/5 ⭐ (127 {t("booking.reviews_label")})
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t("booking.price_per_person")}:</span>
                          <span className="font-bold text-lg">€{selectedExcursion.price}</span>
                        </div>

                        {formData.number_of_people && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">
                                {t("booking.people_summary")}: {formData.number_of_people}
                              </span>
                              <span className="font-semibold">
                                €{selectedExcursion.price * Number.parseInt(formData.number_of_people)}
                              </span>
                            </div>

                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl text-white">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold">{t("booking.total_estimated")}:</span>
                                <span className="text-2xl font-bold">
                                  €{selectedExcursion.price * Number.parseInt(formData.number_of_people)}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-yellow-800 font-semibold mb-1">{t("booking.included_price")}:</p>
                          <ul className="text-xs text-yellow-700 space-y-1">
                            <li>• {t("booking.transport")}</li>
                            <li>• {t("booking.guide")}</li>
                            <li>• {t("booking.insurance")}</li>
                            <li>• {t("booking.photos")}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">{t("booking.select_excursion_message")}</p>
                    <p className="text-sm text-gray-400 mt-2">{t("booking.select_excursion_subtitle")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust badges */}
            <div className="mt-6 bg-white/90 backdrop-blur-xl rounded-xl p-6 shadow-lg">
              <h4 className="font-bold text-gray-900 mb-4 text-center">{t("booking.why_choose_us")}</h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{t("booking.trust_cancellation")}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{t("booking.trust_guides")}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{t("booking.trust_groups")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{t("booking.feature_confirmation")}</h3>
            <p className="text-sm text-gray-600">{t("booking.feature_confirmation_desc")}</p>
          </Card>

          <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{t("booking.feature_payment")}</h3>
            <p className="text-sm text-gray-600">{t("booking.feature_payment_desc")}</p>
          </Card>

          <Card className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-lg">
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{t("booking.feature_experience")}</h3>
            <p className="text-sm text-gray-600">{t("booking.feature_experience_desc")}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
