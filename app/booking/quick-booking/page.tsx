"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, MessageCircle, Clock, Star, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, type Excursion } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"

export default function QuickBookingPage() {
  const [excursions, setExcursions] = useState<Excursion[]>([])
  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null)
  const [step, setStep] = useState(1)
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
  const { language, t } = useLanguage()

  useEffect(() => {
    const fetchExcursions = async () => {
      try {
        const { data, error } = await supabase.from("excursions").select("*").eq("featured", true).order("name_es")

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
    setStep(2)
  }

  const handleSubmit = async () => {
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
        `🌟 ¡Hola! Quiero reservar una excursión\n\n` +
          `📍 Excursión: ${excursionName}\n` +
          `👤 Nombre: ${formData.customer_name}\n` +
          `📧 Email: ${formData.email}\n` +
          `📱 Teléfono: ${formData.phone}\n` +
          `📅 Fecha preferida: ${formData.preferred_date}\n` +
          `👥 Personas: ${formData.number_of_people}\n` +
          `💰 Precio estimado: €${selectedExcursion?.price ? selectedExcursion.price * Number.parseInt(formData.number_of_people) : 0}\n` +
          `${formData.special_requests ? `📝 Solicitudes especiales: ${formData.special_requests}\n` : ""}` +
          `\n¿Podrían confirmar la disponibilidad? ¡Gracias! 🙏`,
      )

      // Open WhatsApp
      window.open(`https://wa.me/34617303929?text=${message}`, "_blank")

      setStep(4)
    } catch (error) {
      console.error("Error submitting booking:", error)
      alert("Error al procesar la reserva. Por favor, inténtelo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Link href="/" className="flex items-center text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al inicio
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-4">Reserva Rápida</h1>
          <p className="text-xl text-blue-100">Reserva tu aventura en 3 simples pasos</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[
              { number: 1, title: "Elegir Excursión", active: step >= 1, completed: step > 1 },
              { number: 2, title: "Tus Datos", active: step >= 2, completed: step > 2 },
              { number: 3, title: "Confirmar", active: step >= 3, completed: step > 3 },
              { number: 4, title: "¡Listo!", active: step >= 4, completed: false },
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    stepItem.completed
                      ? "bg-green-500 text-white"
                      : stepItem.active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepItem.completed ? <CheckCircle className="h-5 w-5" /> : stepItem.number}
                </div>
                <span
                  className={`ml-3 font-medium ${
                    stepItem.active ? "text-blue-600" : stepItem.completed ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {stepItem.title}
                </span>
                {index < 3 && <div className="flex-1 h-0.5 bg-gray-200 mx-6"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step 1: Choose Excursion */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Elige tu Experiencia Favorita</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {excursions.map((excursion) => (
                <Card
                  key={excursion.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => handleExcursionSelect(excursion.id.toString())}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {excursion[`name_${language}` as keyof Excursion] as string}
                      </h3>
                      <Badge className="bg-blue-100 text-blue-800">Destacada</Badge>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {excursion[`short_description_${language}` as keyof Excursion] as string}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {excursion.duration}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                        4.9 (127 reseñas)
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-blue-600">€{excursion.price}</div>
                      <Button className="bg-blue-600 hover:bg-blue-700">Seleccionar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">¿Buscas algo específico?</p>
              <Button asChild variant="outline">
                <Link href="/excursions">Ver todas las excursiones</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && selectedExcursion && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Tus Datos de Contacto</h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <Input
                    id="customer_name"
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="preferred_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha preferida *
                    </label>
                    <Input
                      id="preferred_date"
                      type="date"
                      required
                      min={getTomorrowDate()}
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label htmlFor="number_of_people" className="block text-sm font-medium text-gray-700 mb-2">
                      Número de personas *
                    </label>
                    <Select
                      value={formData.number_of_people}
                      onValueChange={(value) => setFormData({ ...formData, number_of_people: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "persona" : "personas"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700 mb-2">
                    Solicitudes especiales (opcional)
                  </label>
                  <Textarea
                    id="special_requests"
                    rows={3}
                    placeholder="Alergias, necesidades especiales, celebraciones, etc."
                    value={formData.special_requests}
                    onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Volver
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!formData.customer_name || !formData.email || !formData.phone || !formData.preferred_date}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Resumen de tu Reserva</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedExcursion[`name_${language}` as keyof Excursion] as string}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedExcursion[`short_description_${language}` as keyof Excursion] as string}
                      </p>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {selectedExcursion.duration}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Precio por persona:</span>
                        <span className="font-medium">€{selectedExcursion.price}</span>
                      </div>

                      {formData.number_of_people && (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Personas: {formData.number_of_people}</span>
                            <span className="font-medium">
                              €{selectedExcursion.price * Number.parseInt(formData.number_of_people)}
                            </span>
                          </div>

                          <div className="border-t pt-2 flex justify-between items-center">
                            <span className="font-semibold">Total estimado:</span>
                            <span className="text-xl font-bold text-blue-600">
                              €{selectedExcursion.price * Number.parseInt(formData.number_of_people)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedExcursion && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Confirma tu Reserva</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles de la Excursión</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {selectedExcursion[`name_${language}` as keyof Excursion] as string}
                      </h4>
                      <p className="text-gray-600 mt-2">
                        {selectedExcursion[`description_${language}` as keyof Excursion] as string}
                      </p>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-gray-600">Duración:</span>
                      <span className="font-medium">{selectedExcursion.duration}</span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Categoría:</span>
                      <Badge>{selectedExcursion.category}</Badge>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Precio por persona:</span>
                      <span className="font-semibold text-blue-600">€{selectedExcursion.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tus Datos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium">{formData.customer_name}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Teléfono:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Fecha preferida:</span>
                      <span className="font-medium">{formData.preferred_date}</span>
                    </div>

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Personas:</span>
                      <span className="font-medium">{formData.number_of_people}</span>
                    </div>

                    {formData.special_requests && (
                      <div className="py-2">
                        <span className="text-gray-600 block mb-2">Solicitudes especiales:</span>
                        <p className="text-sm bg-gray-50 p-3 rounded">{formData.special_requests}</p>
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg border-t-4 border-blue-500">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-blue-900">Total a pagar:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          €{selectedExcursion.price * Number.parseInt(formData.number_of_people)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Importante:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• El precio final se confirmará por WhatsApp según disponibilidad</li>
                <li>• Recibirás confirmación en las próximas 2 horas</li>
                <li>• Cancelación gratuita hasta 24h antes</li>
                <li>• Incluye transporte y guía profesional</li>
              </ul>
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Volver a editar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? "Procesando..." : "Confirmar y Continuar en WhatsApp"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Reserva Iniciada!</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Hemos abierto WhatsApp con todos tus datos. Nuestro equipo te confirmará la disponibilidad en breve.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">Próximos pasos:</h3>
              <ol className="text-sm text-blue-700 space-y-2 text-left">
                <li>1. Confirma tu reserva por WhatsApp</li>
                <li>2. Recibe los detalles del punto de encuentro</li>
                <li>3. ¡Disfruta tu aventura en Tenerife!</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/">Volver al inicio</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/excursions">Ver más excursiones</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
