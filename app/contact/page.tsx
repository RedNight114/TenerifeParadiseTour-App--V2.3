"use client"

import type React from "react"
import Link from "next/link"

import { useState, useEffect } from "react"
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle, Star, Globe, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"
import { useOrganization } from "@/lib/organization-context"
import { usePublicSitePage } from "@/lib/public-site-content"
import { getText, getTextList } from "@/lib/site-content"

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
  const organization = useOrganization()
  const { content: faqContent } = usePublicSitePage("faq")
  const { content: contactContent } = usePublicSitePage("contact")
  const companyFaqs = getTextList(faqContent, "items")

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
    const phone = organization?.phone?.replace(/\D/g, "")
    if (!phone) {
      document.getElementById("contact-message")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    const message = encodeURIComponent(language === "en" ? "Hello! I would like more information about your excursions." : "Hola, me gustaría obtener más información sobre sus excursiones.")
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener,noreferrer")
  }

  const contactInfo = [
    ...(organization?.phone ? [{
      icon: Phone,
      title: t("contact_info.phone"),
      value: organization.phone,
      description: t("contact_info.available"),
      color: "from-green-500 to-emerald-600",
      action: () => window.open(`tel:${organization.phone}`),
    }] : []),
    ...(organization?.phone ? [{
      icon: MessageCircle,
      title: t("contact_info.whatsapp"),
      value: organization.phone,
      description: t("contact_info.immediate_response"),
      color: "from-green-600 to-green-700",
      action: handleWhatsAppContact,
    }] : []),
    ...(organization?.support_email ? [{
      icon: Mail,
      title: t("contact_info.email"),
      value: organization.support_email,
      description: t("contact_info.response_time"),
      color: "from-blue-500 to-indigo-600",
      action: () => window.open(`mailto:${organization.support_email}`),
    }] : []),
    ...((organization?.address?.city || organization?.address?.country) ? [{
      icon: MapPin,
      title: t("contact_info.location"),
      value: [organization.address.city, organization.address.region, organization.address.country].filter(Boolean).join(", "),
      description: language === "en" ? "Our service area" : "Nuestra zona de actividad",
      color: "from-purple-500 to-pink-600",
      action: () => window.open(`https://maps.google.com/?q=${encodeURIComponent([organization.address.city, organization.address.country].filter(Boolean).join(", "))}`, "_blank", "noopener,noreferrer"),
    }] : []),
  ]

  const features = [
    {
      icon: CheckCircle,
      title: getText(contactContent, "benefit1Title", t("trust.guaranteed_response")),
      description: getText(contactContent, "benefit1Body", t("trust.guaranteed_text")),
    },
    {
      icon: Star,
      title: getText(contactContent, "benefit2Title", t("trust.personal_attention")),
      description: getText(contactContent, "benefit2Body", t("trust.personal_text")),
    },
    {
      icon: Globe,
      title: getText(contactContent, "benefit3Title", t("trust.multilingual")),
      description: getText(contactContent, "benefit3Body", t("trust.multilingual_text")),
    },
    {
      icon: Heart,
      title: getText(contactContent, "benefit4Title", t("trust.service_passion")),
      description: getText(contactContent, "benefit4Body", t("trust.service_text")),
    },
  ]

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      {/* Hero Header Enhanced */}
      <div className="relative isolate overflow-hidden border-b border-white/10 bg-[#123a42] text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-[url('/hero-tenerife-v3.avif')] bg-cover bg-center opacity-25" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#102f37]/95 via-[#123a42]/90 to-[#123a42]/65" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-36 h-96 w-96 rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/[0.07]" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-22">
          <div className="max-w-3xl">
            <Badge data-site-edit-page="contact" data-site-edit-path="badge" data-site-edit-label="Contacto · etiqueta" className="mb-6 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white shadow-sm backdrop-blur-sm sm:text-sm">
              <MessageCircle aria-hidden="true" className="mr-2 h-4 w-4 text-amber-300" />
              {getText(contactContent, "badge", t("contact.hero_badge"))}
            </Badge>

            <h1 className="mb-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
              <span data-site-edit-page="contact" data-site-edit-path="title" data-site-edit-label="Contacto · título" className="block">{getText(contactContent, "title", t("contact.title"))}</span>
              <span data-site-edit-page="contact" data-site-edit-path="subtitle" data-site-edit-label="Contacto · subtítulo" className="mt-3 block text-xl font-medium leading-snug text-amber-200 sm:text-2xl">
                {getText(contactContent, "subtitle", t("contact.hero_subtitle"))}
              </span>
            </h1>

            <p data-site-edit-page="contact" data-site-edit-path="description" data-site-edit-label="Contacto · descripción" data-site-edit-kind="multiline" className="mb-0 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              {getText(contactContent, "description", `${t("contact.subtitle")}. ${t("contact.subtitle_extended")}`)}
            </p>

          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        {/* Contact Methods Grid */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-14 lg:grid-cols-4">
          {contactInfo.length === 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 sm:col-span-2 lg:col-span-4">
              {language === "en" ? "The company has not added its contact details yet." : "La empresa aún no ha añadido sus datos de contacto."}
            </div>
          )}
          {contactInfo.map((info, index) => (
            <Card
              key={index}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-900/5 motion-reduce:transform-none motion-reduce:transition-none"
              onClick={info.action}
            >
              <CardContent className="p-5 text-left sm:p-6">
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${info.color} shadow-sm`}
                >
                  <info.icon aria-hidden="true" className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-slate-600">{info.title}</h3>
                <div className="mb-2 break-words text-base font-semibold text-slate-950">
                  {typeof info.value === "string" ? info.value : info.value}
                </div>
                <p className="text-sm leading-5 text-slate-500">{info.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.8fr)] lg:gap-8">
          {/* Contact Form */}
          <div>
            <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
              <CardHeader className="border-b border-slate-100 bg-white p-5 text-slate-950 sm:p-7">
                <CardTitle className="flex items-center text-xl font-semibold tracking-tight sm:text-2xl">
                  <span className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><Send aria-hidden="true" className="h-5 w-5" /></span>
                  <span data-site-edit-page="contact" data-site-edit-path="formTitle" data-site-edit-label="Contacto · título del formulario">{getText(contactContent, "formTitle", t("contact.form_title"))}</span>
                </CardTitle>
                <p data-site-edit-page="contact" data-site-edit-path="formSubtitle" data-site-edit-label="Contacto · texto del formulario" className="mt-3 text-sm leading-6 text-slate-600">{getText(contactContent, "formSubtitle", t("contact.form_subtitle"))}</p>
              </CardHeader>
              <CardContent className="p-5 sm:p-7">
                {submitted ? (
                  <div className="py-8 text-center sm:py-12">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                      <CheckCircle aria-hidden="true" className="h-9 w-9 text-emerald-700" />
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold tracking-tight text-slate-950">{t("contact.success_title")}</h3>
                    <p className="mx-auto mb-8 max-w-md leading-6 text-slate-600">{t("contact.success_message")}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button onClick={() => setSubmitted(false)} className="bg-teal-800 text-white hover:bg-teal-900">
                        {t("contact.send_another")}
                      </Button>
                      {organization?.phone && <Button onClick={handleWhatsAppContact} className="bg-green-600 hover:bg-green-700">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {t("contact.whatsapp_contact")}
                      </Button>}
                    </div>
                  </div>
                ) : (
                  <form id="contact-message" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-800">
                          {t("contact.name")} *
                        </label>
                        <Input
                          id="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          autoComplete="name"
                          className="h-12 rounded-xl border-slate-300 bg-white text-base shadow-sm focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
                          placeholder={
                            language === "en"
                              ? "Your full name"
                            : "Tu nombre completo"
                          }
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-800">
                          {t("contact.email")} *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          autoComplete="email"
                          className="h-12 rounded-xl border-slate-300 bg-white text-base shadow-sm focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
                          placeholder={
                          language === "en" ? "your@email.com" : "tu@email.com"
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-800">
                        {t("contact.phone")}
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        autoComplete="tel"
                        className="h-12 rounded-xl border-slate-300 bg-white text-base shadow-sm focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
                        placeholder="+34 600 000 000"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-800">
                        {t("contact.message")} *
                      </label>
                      <Textarea
                        id="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="min-h-36 resize-y rounded-xl border-slate-300 bg-white text-base shadow-sm focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20"
                        placeholder={
                          language === "en"
                            ? "Tell us about your ideal trip: dates, number of people, special interests, etc."
                            : "Cuéntanos sobre tu viaje ideal: fechas, número de personas, intereses especiales, etc."
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl bg-teal-800 text-base font-semibold text-white shadow-sm transition-[background-color,box-shadow] duration-200 hover:bg-teal-900 hover:shadow-md sm:h-14 sm:text-base"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          {language === "en" ? "Sending..." : "Enviando..."}
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
          <div className="space-y-5 lg:sticky lg:top-24">
            {/* Quick Contact */}
            {organization?.phone && <Card className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/70 shadow-sm">
              <CardHeader className="p-5 pb-0 text-slate-950">
                <CardTitle className="flex items-center text-lg font-semibold tracking-tight">
                  <span className="mr-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><MessageCircle aria-hidden="true" className="h-4 w-4" /></span>
                  {t("contact.immediate_contact")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="mb-5 text-sm leading-6 text-slate-700">{getText(contactContent, "quickResponse", t("contact.quick_response_question"))}</p>
                <Button
                  onClick={handleWhatsAppContact}
                  className="h-12 w-full rounded-xl bg-emerald-700 font-semibold text-white shadow-sm transition-[background-color,box-shadow] duration-200 hover:bg-emerald-800 hover:shadow-md"
                >
                  <MessageCircle aria-hidden="true" className="mr-2 h-5 w-5" />
                  {t("contact.open_whatsapp")}
                </Button>

              </CardContent>
            </Card>}

            {/* Features */}
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardHeader className="p-5 pb-2">
                <CardTitle data-site-edit-page="contact" data-site-edit-path="benefitsTitle" data-site-edit-label="Contacto · título de beneficios" className="text-lg font-semibold tracking-tight text-slate-950">{getText(contactContent, "benefitsTitle", t("contact.why_choose_us"))}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3">
                <div className="space-y-5">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                        <feature.icon aria-hidden="true" className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="mb-1 text-sm font-semibold text-slate-900">{feature.title}</h4>
                        <p className="text-sm leading-5 text-slate-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Preview */}
            {companyFaqs.length > 0 && <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-lg font-semibold tracking-tight text-slate-950">{t("contact.faq")}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3">
                <div className="space-y-4">
                  {companyFaqs.slice(0, 3).map((item, index) => <div key={index}>
                    <h4 className="mb-1.5 text-sm font-semibold text-slate-900">{getText(item, "question")}</h4>
                    <p className="text-sm leading-5 text-slate-600">{getText(item, "answer")}</p>
                  </div>)}
                  <Link href="/faq" className="inline-flex min-h-10 items-center text-sm font-semibold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">{language === "en" ? "View all questions" : "Ver todas las preguntas"}</Link>
                </div>
              </CardContent>
            </Card>}
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-teal-900 bg-[#123a42] p-6 text-center text-white shadow-lg shadow-slate-900/10 sm:mt-16 sm:p-10 lg:p-12">
          <div aria-hidden="true" className="absolute inset-0 bg-[url('/hero-tenerife.jpg')] bg-cover bg-center opacity-15" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#102f37]/90 via-[#123a42]/85 to-[#123a42]/75" />
          <div className="relative mx-auto max-w-3xl">
            <h3 data-site-edit-page="contact" data-site-edit-path="ctaTitle" data-site-edit-label="Contacto · título final" className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">{getText(contactContent, "ctaTitle", t("cta.ready_title"))}</h3>
            <p data-site-edit-page="contact" data-site-edit-path="ctaText" data-site-edit-label="Contacto · texto final" data-site-edit-kind="multiline" className="mx-auto mb-7 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{getText(contactContent, "ctaText", t("cta.ready_text"))}</p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                onClick={handleWhatsAppContact}
                className="min-h-12 rounded-xl bg-amber-400 px-6 text-base font-semibold text-slate-950 shadow-sm transition-[background-color,box-shadow] duration-200 hover:bg-amber-300 hover:shadow-md sm:px-7"
              >
                <MessageCircle aria-hidden="true" className="mr-2 h-5 w-5" />
                <span data-site-edit-page="contact" data-site-edit-path="ctaContact" data-site-edit-label="Contacto · botón de contacto">{getText(contactContent, "ctaContact", t("cta.contact_now"))}</span>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-12 rounded-xl border-white/30 bg-white/10 px-6 text-base font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-teal-900 sm:px-7"
              >
                <Link data-site-edit-page="contact" data-site-edit-path="ctaExcursions" data-site-edit-label="Contacto · botón de excursiones" href="/excursions">{getText(contactContent, "ctaExcursions", t("cta.view_excursions"))}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
