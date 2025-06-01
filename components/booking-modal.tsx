"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar, MessageCircle, User } from "lucide-react"
import type { Excursion } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  excursion: Excursion
}

interface BookingFormData {
  name: string
  email: string
  phone: string
  preferredDate: string
  numberOfPeople: string
  specialRequests: string
}

export function BookingModal({ isOpen, onClose, excursion }: BookingModalProps) {
  const { t, language } = useLanguage()

  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    numberOfPeople: "2",
    specialRequests: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  // Función para obtener el nombre de la excursión en el idioma actual
  const getExcursionName = () => {
    switch (language) {
      case "en":
        return excursion.name_en || excursion.name_es
      case "de":
        return excursion.name_de || excursion.name_es
      case "fr":
        return excursion.name_fr || excursion.name_es
      case "it":
        return excursion.name_it || excursion.name_es
      case "pt":
        return excursion.name_pt || excursion.name_es
      case "nl":
        return excursion.name_nl || excursion.name_es
      case "ru":
        return excursion.name_ru || excursion.name_es
      case "zh":
        return excursion.name_zh || excursion.name_es
      default:
        return excursion.name_es
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Calcular precio total
    const totalPrice = excursion.price * Number.parseInt(formData.numberOfPeople)

    // Generar mensaje de WhatsApp
    const message = encodeURIComponent(
      `🌟 *NUEVA RESERVA - TenerifeParadise Tours*\n\n` +
        `📍 *Excursión:* ${getExcursionName()}\n` +
        `💰 *Precio:* €${excursion.price} por persona\n` +
        `💵 *Total:* €${totalPrice} (${formData.numberOfPeople} personas)\n\n` +
        `👤 *DATOS DEL CLIENTE:*\n` +
        `• Nombre: ${formData.name}\n` +
        `• Email: ${formData.email}\n` +
        `• Teléfono: ${formData.phone}\n\n` +
        `📅 *DETALLES DE LA RESERVA:*\n` +
        `• Fecha preferida: ${formData.preferredDate}\n` +
        `• Número de personas: ${formData.numberOfPeople}\n` +
        `• Duración: ${excursion.duration}\n\n` +
        `${formData.specialRequests ? `📝 *Solicitudes especiales:*\n${formData.specialRequests}\n\n` : ""}` +
        `✅ *Por favor confirmen disponibilidad y envíen detalles de pago.*\n\n` +
        `¡Gracias por elegir TenerifeParadise Tours! 🏝️`,
    )

    // Simular envío (aquí podrías guardar en base de datos si quieres)
    setTimeout(() => {
      // Abrir WhatsApp
      window.open(`https://wa.me/34617303929?text=${message}`, "_blank")

      // Cerrar modal y resetear formulario
      onClose()
      setFormData({
        name: "",
        email: "",
        phone: "",
        preferredDate: "",
        numberOfPeople: "2",
        specialRequests: "",
      })
      setIsSubmitting(false)
    }, 1000)
  }

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = formData.name && formData.email && formData.phone && formData.preferredDate

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{t("booking.modal.title")}</DialogTitle>
          <div className="text-center text-gray-600">
            <h3 className="font-semibold text-lg">{getExcursionName()}</h3>
            <p className="text-sm">
              €{excursion.price} {t("featured.per_person")}
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Datos personales */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-2" />
              {t("booking.modal.personal_data")}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t("booking.modal.full_name")} *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("booking.modal.full_name_placeholder")}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">{t("booking.modal.phone")} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder={t("booking.modal.phone_placeholder")}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">{t("booking.modal.email")} *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder={t("booking.modal.email_placeholder")}
                className="mt-1"
              />
            </div>
          </div>

          {/* Detalles de la reserva */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {t("booking.modal.booking_details")}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">{t("booking.modal.preferred_date")} *</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  min={getTomorrowDate()}
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="people">{t("booking.modal.number_of_people")} *</Label>
                <Select
                  value={formData.numberOfPeople}
                  onValueChange={(value) => handleInputChange("numberOfPeople", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? t("booking.modal.person") : t("booking.modal.people")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="requests">{t("booking.modal.special_requests")}</Label>
              <Textarea
                id="requests"
                rows={3}
                value={formData.specialRequests}
                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                placeholder={t("booking.modal.special_requests_placeholder")}
                className="mt-1 resize-none"
              />
            </div>
          </div>

          {/* Resumen del precio */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">{t("booking.modal.price_summary")}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t("booking.modal.price_per_person")}</span>
                <span>€{excursion.price}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("booking.modal.number_of_people_summary")}</span>
                <span>{formData.numberOfPeople}</span>
              </div>
              <div className="flex justify-between font-semibold text-blue-900 border-t border-blue-200 pt-2">
                <span>{t("booking.modal.estimated_total")}</span>
                <span>€{excursion.price * Number.parseInt(formData.numberOfPeople || "1")}</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              {t("booking.modal.cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t("booking.modal.sending")}
                </div>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t("booking.modal.continue_whatsapp")}
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">{t("booking.modal.whatsapp_info")}</div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
