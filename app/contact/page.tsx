"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle, Star, Globe, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { language, t } = useLanguage()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("contacts").insert([
        {
          ...formData,
          language,
        },
      ])

      if (error) throw error

      setSubmitted(true)
      setFormData({ name: "", email: "", phone: "", message: "" })
    } catch (error) {
      console.error("Error submitting contact form:", error)
      alert("Error al enviar el mensaje. Por favor, inténtelo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Hola! Me gustaría obtener más información sobre sus excursiones.")
    window.open(`https://wa.me/34617303929?text=${message}`, "_blank")
  }

  const contactInfo = [
    {
      icon: Phone,
      title: t("contact_info.phone"),
      value: "+34 617 30 39 29",
      description: t("contact_info.available"),
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      action: () => window.open("tel:+34617303929"),
    },
    {
      icon: MessageCircle,
      title: t("contact_info.whatsapp"),
      value: "+34 617 30 39 29",
      description: t("contact_info.immediate_response"),
      color: "from-green-600 to-green-700",
      bgColor: "bg-green-50",
      action: handleWhatsAppContact,
    },
    {
      icon: Mail,
      title: t("contact_info.email"),
      value: (
        <div className="flex flex-col">
          <span className="font-semibold text-blue-700 leading-tight">
            Tenerifeparadisetours
            <br />
            andexcursions@hotmail.com
          </span>
        </div>
      ),
      description: t("contact_info.response_time"),
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      action: () => window.open("mailto:Tenerifeparadisetoursandexcursions@hotmail.com"),
    },
    {
      icon: MapPin,
      title: t("contact_info.location"),
      value: "Santa Cruz de Tenerife",
      description: t("contact_info.canary_islands"),
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      action: () => window.open("https://maps.google.com/?q=Santa+Cruz+de+Tenerife"),
    },
  ]

  const features = [
    {
      icon: CheckCircle,
      title: t("trust.guaranteed_response"),
      description: t("trust.guaranteed_text"),
    },
    {
      icon: Star,
      title: t("trust.personal_attention"),
      description: t("trust.personal_text"),
    },
    {
      icon: Globe,
      title: t("trust.multilingual"),
      description: t("trust.multilingual_text"),
    },
    {
      icon: Heart,
      title: t("trust.service_passion"),
      description: t("trust.service_text"),
    },
  ]

  // Traducciones dinámicas para las estadísticas del hero
  const getHeroStats = () => {
    switch (language) {
      case "en":
        return [
          { value: "Less than 2 hours", label: "Response time" },
          { value: "24/7", label: "WhatsApp available" },
          { value: "3", label: "Languages" },
          { value: "100%", label: "Satisfaction" },
        ]
      case "de":
        return [
          { value: "Weniger als 2 Stunden", label: "Antwortzeit" },
          { value: "24/7", label: "WhatsApp verfügbar" },
          { value: "3", label: "Sprachen" },
          { value: "100%", label: "Zufriedenheit" },
        ]
      default:
        return [
          { value: "Menos de 2 horas", label: "Tiempo respuesta" },
          { value: "24/7", label: "WhatsApp disponible" },
          { value: "3", label: "Idiomas" },
          { value: "100%", label: "Satisfacción" },
        ]
    }
  }

  const heroStats = getHeroStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Hero Header Enhanced */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-tenerife.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-700/80 to-purple-800/70"></div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-yellow-300/30 to-orange-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-32 right-32 w-16 h-16 bg-white/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-green-400/30 to-blue-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 left-40 w-12 h-12 bg-yellow-300/40 rounded-full blur-lg animate-pulse"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30 mb-8 px-6 py-2 text-sm font-semibold shadow-lg">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t("contact.hero_badge")}
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight drop-shadow-lg">
              <span className="block">{t("contact.title")}</span>
              <span className="block text-3xl md:text-4xl font-light text-yellow-300 mt-4 drop-shadow-md">
                {t("contact.hero_subtitle")}
              </span>
            </h1>

            <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed drop-shadow-md mb-8">
              {t("contact.subtitle")}. {t("contact.subtitle_extended")}
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {heroStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <Card
              key={index}
              className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:scale-105 border-0 bg-white/80 backdrop-blur-xl"
              onClick={info.action}
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <info.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                <div className="text-gray-900 font-semibold mb-2 text-center">
                  {typeof info.value === "string" ? info.value : info.value}
                </div>
                <p className="text-sm text-gray-600">{info.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center">
                  <Send className="h-6 w-6 mr-3" />
                  {t("contact.form_title")}
                </CardTitle>
                <p className="text-blue-100 mt-2">{t("contact.form_subtitle")}</p>
              </CardHeader>
              <CardContent className="p-10">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("contact.success_title")}</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">{t("contact.success_message")}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button onClick={() => setSubmitted(false)} className="bg-blue-600 hover:bg-blue-700">
                        {t("contact.send_another")}
                      </Button>
                      <Button onClick={handleWhatsAppContact} className="bg-green-600 hover:bg-green-700">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {t("contact.whatsapp_contact")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                          {t("contact.name")} *
                        </label>
                        <Input
                          id="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-base"
                          placeholder={
                            language === "en"
                              ? "Your full name"
                              : language === "de"
                                ? "Ihr vollständiger Name"
                                : "Tu nombre completo"
                          }
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                          {t("contact.email")} *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-base"
                          placeholder={
                            language === "en" ? "your@email.com" : language === "de" ? "ihre@email.com" : "tu@email.com"
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                        {t("contact.phone")}
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-base"
                        placeholder="+34 600 000 000"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-3">
                        {t("contact.message")} *
                      </label>
                      <Textarea
                        id="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="border-2 border-gray-200 focus:border-blue-500 rounded-xl text-base resize-none"
                        placeholder={
                          language === "en"
                            ? "Tell us about your ideal trip: dates, number of people, special interests, etc."
                            : language === "de"
                              ? "Erzählen Sie uns von Ihrer idealen Reise: Daten, Anzahl der Personen, besondere Interessen, etc."
                              : "Cuéntanos sobre tu viaje ideal: fechas, número de personas, intereses especiales, etc."
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white h-14 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          {language === "en" ? "Sending..." : language === "de" ? "Senden..." : "Enviando..."}
                        </div>
                      ) : (
                        <>
                          <Send className="mr-3 h-5 w-5" />
                          {t("contact.send")}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {t("contact.immediate_contact")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-6">{t("contact.quick_response_question")}</p>
                <Button
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t("contact.open_whatsapp")}
                </Button>

                <div className="mt-6 p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center text-green-800 mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-semibold">{t("contact.attention_schedule")}</span>
                  </div>
                  <p className="text-sm text-green-700">{t("contact.schedule_text")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">{t("contact.why_choose_us")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Preview */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">{t("contact.faq")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t("contact.how_to_book")}</h4>
                    <p className="text-sm text-gray-600">{t("contact.how_to_book_answer")}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t("contact.what_includes")}</h4>
                    <p className="text-sm text-gray-600">{t("contact.what_includes_answer")}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t("contact.group_discounts")}</h4>
                    <p className="text-sm text-gray-600">{t("contact.group_discounts_answer")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-tenerife.jpg')] bg-cover bg-center opacity-20 rounded-3xl"></div>
          <div className="relative">
            <h3 className="text-3xl font-bold mb-6">{t("cta.ready_title")}</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{t("cta.ready_text")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleWhatsAppContact}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {t("cta.contact_now")}
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/20 hover:bg-white hover:text-blue-600 border-white/30 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <a href="/excursions">{t("cta.view_excursions")}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
