"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Clock,
  Users,
  Euro,
  MapPin,
  Calendar,
  Info,
  FileText,
  Settings,
  Star,
  Save,
  Loader2,
} from "lucide-react"
import { updateExcursion, type ExcursionFormData } from "@/lib/excursion-actions"
import {
  getExcursionById,
  getCategories,
  getIncludedServices,
  getNotIncludedServices,
  type Category,
  type PredefinedService,
} from "@/lib/supabase"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { ImageUpload } from "@/components/image-upload"
import { MultiImageUpload } from "@/components/multi-image-upload"

const DIFFICULTY_LEVELS = [
  { value: "facil", label: "Fácil" },
  { value: "moderado", label: "Moderado" },
  { value: "dificil", label: "Difícil" },
  { value: "extremo", label: "Extremo" },
]

const MONTHS = [
  { value: "enero", label: "Enero" },
  { value: "febrero", label: "Febrero" },
  { value: "marzo", label: "Marzo" },
  { value: "abril", label: "Abril" },
  { value: "mayo", label: "Mayo" },
  { value: "junio", label: "Junio" },
  { value: "julio", label: "Julio" },
  { value: "agosto", label: "Agosto" },
  { value: "septiembre", label: "Septiembre" },
  { value: "octubre", label: "Octubre" },
  { value: "noviembre", label: "Noviembre" },
  { value: "diciembre", label: "Diciembre" },
]

interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  label: string
}

const EditExcursionPage = () => {
  const router = useRouter()
  const params = useParams()
  const excursionId = Number.parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [includedServices, setIncludedServices] = useState<PredefinedService[]>([])
  const [notIncludedServices, setNotIncludedServices] = useState<PredefinedService[]>([])
  const [customIncludedService, setCustomIncludedService] = useState("")
  const [customNotIncludedService, setCustomNotIncludedService] = useState("")
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [newTimeSlot, setNewTimeSlot] = useState({
    start_time: "",
    end_time: "",
    label: "",
  })
  const [newFAQ, setNewFAQ] = useState({
    question_es: "",
    question_en: "",
    question_de: "",
    answer_es: "",
    answer_en: "",
    answer_de: "",
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name_es: "",
    name_en: "",
    name_de: "",
    short_description_es: "",
    short_description_en: "",
    short_description_de: "",
    description_es: "",
    description_en: "",
    description_de: "",
    price: "",
    duration: "",
    category: "",
    image_url: "",
    featured: false,
    included_services: [] as string[],
    not_included_services: [] as string[],
    difficulty_level: "",
    meeting_point: "",
    what_to_bring: "",
    cancellation_policy: "",
    age_restrictions: "",
    available_months: [] as string[],
    special_notes: "",
    requirements: "",
    faqs: [] as Array<{
      question_es: string
      question_en: string
      question_de: string
      answer_es: string
      answer_en: string
      answer_de: string
    }>,
    max_people: "",
    children_price: "",
    children_age_range: "",
    gallery_images: [] as string[],
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [excursionData, categoriesData, includedData, notIncludedData] = await Promise.all([
          getExcursionById(excursionId),
          getCategories(),
          getIncludedServices(),
          getNotIncludedServices(),
        ])

        if (!excursionData) {
          toast.error("Excursión no encontrada")
          router.push("/admin/manage-excursions")
          return
        }

        // Populate form with existing data
        setFormData({
          name_es: excursionData.name_es || "",
          name_en: excursionData.name_en || "",
          name_de: excursionData.name_de || "",
          short_description_es: excursionData.short_description_es || "",
          short_description_en: excursionData.short_description_en || "",
          short_description_de: excursionData.short_description_de || "",
          description_es: excursionData.description_es || "",
          description_en: excursionData.description_en || "",
          description_de: excursionData.description_de || "",
          price: excursionData.price?.toString() || "",
          duration: excursionData.duration || "",
          category: excursionData.category || "",
          image_url: excursionData.image_url || "",
          featured: excursionData.featured || false,
          included_services: excursionData.included_services || [],
          not_included_services: excursionData.not_included_services || [],
          difficulty_level: excursionData.difficulty_level || "",
          meeting_point: excursionData.meeting_point || "",
          what_to_bring: excursionData.what_to_bring || "",
          cancellation_policy: excursionData.cancellation_policy || "",
          age_restrictions: excursionData.age_restrictions || "",
          available_months: excursionData.available_months || [],
          special_notes: excursionData.special_notes || "",
          requirements: excursionData.requirements || "",
          faqs: excursionData.faqs || [],
          max_people: excursionData.max_people?.toString() || "",
          children_price: excursionData.children_price?.toString() || "",
          children_age_range: excursionData.children_age_range || "",
          gallery_images: excursionData.gallery_images || [],
        })

        // Extract time slots from special_notes if they exist
        if (excursionData.special_notes) {
          const timeSlotMatches = excursionData.special_notes.match(/Horarios disponibles:\n((?:• .+\n?)+)/)
          if (timeSlotMatches) {
            const slots = timeSlotMatches[1]
              .split("\n")
              .filter((line) => line.startsWith("• "))
              .map((line, index) => ({
                id: `slot-${index}`,
                start_time: excursionData.start_time || "",
                end_time: excursionData.end_time || "",
                label: line.replace("• ", ""),
              }))
            setTimeSlots(slots)
          }
        }

        setCategories(categoriesData)
        setIncludedServices(includedData)
        setNotIncludedServices(notIncludedData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error cargando datos")
      } finally {
        setLoading(false)
      }
    }

    if (excursionId) {
      loadData()
    }
  }, [excursionId, router])

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: "" }))
  }, [])

  const addTimeSlot = useCallback(() => {
    if (newTimeSlot.start_time && newTimeSlot.end_time) {
      const timeSlot: TimeSlot = {
        id: Date.now().toString(),
        start_time: newTimeSlot.start_time,
        end_time: newTimeSlot.end_time,
        label: newTimeSlot.label || `${newTimeSlot.start_time} - ${newTimeSlot.end_time}`,
      }
      setTimeSlots((prev) => [...prev, timeSlot])
      setNewTimeSlot({ start_time: "", end_time: "", label: "" })
    }
  }, [newTimeSlot])

  const removeTimeSlot = useCallback((id: string) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== id))
  }, [])

  const addCustomIncludedService = useCallback(() => {
    if (customIncludedService.trim()) {
      setFormData((prev) => ({
        ...prev,
        included_services: [...prev.included_services, customIncludedService.trim()],
      }))
      setCustomIncludedService("")
    }
  }, [customIncludedService])

  const addCustomNotIncludedService = useCallback(() => {
    if (customNotIncludedService.trim()) {
      setFormData((prev) => ({
        ...prev,
        not_included_services: [...prev.not_included_services, customNotIncludedService.trim()],
      }))
      setCustomNotIncludedService("")
    }
  }, [customNotIncludedService])

  const removeIncludedService = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      included_services: prev.included_services.filter((_, i) => i !== index),
    }))
  }, [])

  const removeNotIncludedService = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      not_included_services: prev.not_included_services.filter((_, i) => i !== index),
    }))
  }, [])

  const addFAQ = useCallback(() => {
    if (newFAQ.question_es && newFAQ.answer_es) {
      setFormData((prev) => ({
        ...prev,
        faqs: [...prev.faqs, newFAQ],
      }))
      setNewFAQ({
        question_es: "",
        question_en: "",
        question_de: "",
        answer_es: "",
        answer_en: "",
        answer_de: "",
      })
    }
  }, [newFAQ])

  const removeFAQ = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }))
  }, [])

  const toggleMonth = useCallback((month: string) => {
    setFormData((prev) => {
      const months = prev.available_months.includes(month)
        ? prev.available_months.filter((m) => m !== month)
        : [...prev.available_months, month]
      return { ...prev, available_months: months }
    })
  }, [])

  const toggleIncludedService = useCallback((service: string) => {
    setFormData((prev) => {
      const services = prev.included_services.includes(service)
        ? prev.included_services.filter((s) => s !== service)
        : [...prev.included_services, service]
      return { ...prev, included_services: services }
    })
  }, [])

  const toggleNotIncludedService = useCallback((service: string) => {
    setFormData((prev) => {
      const services = prev.not_included_services.includes(service)
        ? prev.not_included_services.filter((s) => s !== service)
        : [...prev.not_included_services, service]
      return { ...prev, not_included_services: services }
    })
  }, [])

  const validateField = useCallback((field: string, value: any): string => {
    switch (field) {
      case "name_es":
      case "name_en":
      case "name_de":
        return !value ? "Este campo es obligatorio" : ""
      case "price":
        return !value || isNaN(Number(value)) || Number(value) <= 0 ? "Debe ser un precio válido mayor a 0" : ""
      default:
        return ""
    }
  }, [])

  const stepValidation = useMemo(() => {
    const validation: Record<number, boolean> = {}
    validation[1] = !!(formData.name_es && formData.name_en && formData.name_de)
    validation[2] = !!(formData.short_description_es && formData.short_description_en && formData.short_description_de)
    validation[3] = !!(formData.description_es && formData.description_en && formData.description_de)
    validation[4] = !!(formData.price && formData.duration && formData.category && formData.image_url)
    validation[5] = true
    validation[6] = true
    return validation
  }, [formData])

  const validateStepWithErrors = useCallback(
    (step: number): boolean => {
      let isValid = true
      const newFieldErrors: Record<string, string> = {}

      switch (step) {
        case 1:
          ;["name_es", "name_en", "name_de"].forEach((field) => {
            const error = validateField(field, formData[field as keyof typeof formData])
            if (error) {
              newFieldErrors[field] = error
              isValid = false
            }
          })
          break
        case 4:
          const priceError = validateField("price", formData.price)
          if (priceError) {
            newFieldErrors.price = priceError
            isValid = false
          }
          if (!formData.duration || !formData.category || !formData.image_url) {
            isValid = false
          }
          break
        default:
          isValid = stepValidation[step] || false
      }

      setFieldErrors(newFieldErrors)
      return isValid
    },
    [formData, validateField, stepValidation],
  )

  const nextStep = useCallback(() => {
    if (validateStepWithErrors(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6))
    } else {
      toast.error("Por favor completa todos los campos obligatorios")
    }
  }, [currentStep, validateStepWithErrors])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }, [])

  const handleUpdateExcursion = useCallback(async () => {
    setIsSubmitting(true)

    try {
      const requiredFields = [
        "name_es",
        "name_en",
        "name_de",
        "short_description_es",
        "short_description_en",
        "short_description_de",
        "description_es",
        "description_en",
        "description_de",
        "price",
        "duration",
        "category",
        "image_url",
      ]

      const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

      if (missingFields.length > 0) {
        toast.error(`Faltan campos obligatorios: ${missingFields.join(", ")}`)
        setIsSubmitting(false)
        return
      }

      const excursionData: Partial<ExcursionFormData> = {
        ...formData,
        price: Number(formData.price),
        max_people: formData.max_people ? Number(formData.max_people) : undefined,
        children_price: formData.children_price ? Number(formData.children_price) : undefined,
        start_time: timeSlots.length > 0 ? timeSlots[0].start_time : undefined,
        end_time: timeSlots.length > 0 ? timeSlots[0].end_time : undefined,
        special_notes:
          timeSlots.length > 1
            ? `${formData.special_notes}\n\nHorarios disponibles:\n${timeSlots.map((slot) => `• ${slot.label}`).join("\n")}`
            : formData.special_notes,
      }

      const result = await updateExcursion(excursionId, excursionData)

      if (result.success) {
        toast.success("¡Excursión actualizada exitosamente!")
        router.push("/admin/manage-excursions")
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error updating excursion:", error)
      toast.error("Error interno del servidor")
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, timeSlots, excursionId, router])

  const steps = useMemo(
    () => [
      { number: 1, title: "Nombres", icon: FileText },
      { number: 2, title: "Descripciones Cortas", icon: Info },
      { number: 3, title: "Descripciones Completas", icon: FileText },
      { number: 4, title: "Información Básica", icon: Settings },
      { number: 5, title: "Detalles Adicionales", icon: Plus },
      { number: 6, title: "Guardar Cambios", icon: Save },
    ],
    [],
  )

  if (loading) {
    return (
      <div className="container py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-gray-600">Cargando datos de la excursión...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/manage-excursions")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Editar Excursión</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Modifica los datos de la excursión. Todos los campos marcados con * son obligatorios.
        </p>
      </div>

      <div className="mb-12">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Progreso de Edición</h2>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              const isValid = stepValidation[step.number]

              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                          ? isValid
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-red-500 border-red-500 text-white"
                          : "bg-gray-200 border-gray-300 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Card className="mb-12 shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b px-8 py-6">
          <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
            {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6 mr-3 text-blue-600" })}
            Paso {currentStep}: {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 py-8 space-y-8">
          {/* Paso 1: Nombres */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name_es" className="text-sm font-semibold text-gray-700 flex items-center">
                    Nombre en Español <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name_es"
                    value={formData.name_es}
                    onChange={(e) => updateFormData("name_es", e.target.value)}
                    placeholder="Ej: Tour en Buggy por Tenerife"
                    className="mt-2 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {fieldErrors.name_es && <p className="text-red-500 text-sm mt-1">{fieldErrors.name_es}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en" className="text-sm font-semibold text-gray-700 flex items-center">
                    Nombre en Inglés <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => updateFormData("name_en", e.target.value)}
                    placeholder="Ex: Buggy Tour in Tenerife"
                    className="mt-2 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {fieldErrors.name_en && <p className="text-red-500 text-sm mt-1">{fieldErrors.name_en}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_de" className="text-sm font-semibold text-gray-700 flex items-center">
                    Nombre en Alemán <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name_de"
                    value={formData.name_de}
                    onChange={(e) => updateFormData("name_de", e.target.value)}
                    placeholder="Z.B: Buggy-Tour auf Teneriffa"
                    className="mt-2 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {fieldErrors.name_de && <p className="text-red-500 text-sm mt-1">{fieldErrors.name_de}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Descripciones Cortas */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="short_description_es" className="text-sm font-semibold text-gray-700">
                    Descripción Corta en Español <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="short_description_es"
                    value={formData.short_description_es}
                    onChange={(e) => updateFormData("short_description_es", e.target.value)}
                    placeholder="Descripción breve de la excursión (máximo 150 caracteres)"
                    className="mt-2 text-base"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.short_description_es.length}/150 caracteres</p>
                </div>
                <div>
                  <Label htmlFor="short_description_en" className="text-sm font-semibold text-gray-700">
                    Descripción Corta en Inglés <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="short_description_en"
                    value={formData.short_description_en}
                    onChange={(e) => updateFormData("short_description_en", e.target.value)}
                    placeholder="Brief description of the excursion (maximum 150 characters)"
                    className="mt-2 text-base"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.short_description_en.length}/150 caracteres</p>
                </div>
                <div>
                  <Label htmlFor="short_description_de" className="text-sm font-semibold text-gray-700">
                    Descripción Corta en Alemán <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="short_description_de"
                    value={formData.short_description_de}
                    onChange={(e) => updateFormData("short_description_de", e.target.value)}
                    placeholder="Kurze Beschreibung der Exkursion (maximal 150 Zeichen)"
                    className="mt-2 text-base"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.short_description_de.length}/150 caracteres</p>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Descripciones Completas */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="description_es" className="text-sm font-semibold text-gray-700">
                    Descripción Completa en Español <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description_es"
                    value={formData.description_es}
                    onChange={(e) => updateFormData("description_es", e.target.value)}
                    placeholder="Descripción detallada de la excursión, itinerario, qué incluye, etc."
                    className="mt-2 text-base"
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="description_en" className="text-sm font-semibold text-gray-700">
                    Descripción Completa en Inglés <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => updateFormData("description_en", e.target.value)}
                    placeholder="Detailed description of the excursion, itinerary, what's included, etc."
                    className="mt-2 text-base"
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="description_de" className="text-sm font-semibold text-gray-700">
                    Descripción Completa en Alemán <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description_de"
                    value={formData.description_de}
                    onChange={(e) => updateFormData("description_de", e.target.value)}
                    placeholder="Detaillierte Beschreibung der Exkursion, Reiseverlauf, was enthalten ist, etc."
                    className="mt-2 text-base"
                    rows={6}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Información Básica */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                    <Euro className="h-4 w-4 inline mr-1" />
                    Precio por Persona <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData("price", e.target.value)}
                    placeholder="120"
                    className="mt-2 h-12 text-base"
                  />
                  {fieldErrors.price && <p className="text-red-500 text-sm mt-1">{fieldErrors.price}</p>}
                </div>
                <div>
                  <Label htmlFor="children_price" className="text-sm font-semibold text-gray-700">
                    <Euro className="h-4 w-4 inline mr-1" />
                    Precio Niños (Opcional)
                  </Label>
                  <Input
                    id="children_price"
                    type="number"
                    value={formData.children_price}
                    onChange={(e) => updateFormData("children_price", e.target.value)}
                    placeholder="80"
                    className="mt-2 h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Duración <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => updateFormData("duration", e.target.value)}
                    placeholder="4 horas"
                    className="mt-2 h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="max_people" className="text-sm font-semibold text-gray-700">
                    <Users className="h-4 w-4 inline mr-1" />
                    Máximo de Personas
                  </Label>
                  <Input
                    id="max_people"
                    type="number"
                    value={formData.max_people}
                    onChange={(e) => updateFormData("max_people", e.target.value)}
                    placeholder="8"
                    className="mt-2 h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                    Categoría <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => updateFormData("category", e.target.value)}
                    className="mt-2 w-full h-12 px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name_es}>
                        {category.name_es}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="difficulty_level" className="text-sm font-semibold text-gray-700">
                    Nivel de Dificultad
                  </Label>
                  <select
                    id="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={(e) => updateFormData("difficulty_level", e.target.value)}
                    className="mt-2 w-full h-12 px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar dificultad</option>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horarios Múltiples */}
              <div className="bg-gray-50 rounded-lg p-6">
                <Label className="text-base font-semibold text-gray-900 mb-4 block">
                  <Clock className="h-5 w-5 inline mr-2" />
                  Horarios Disponibles
                </Label>
                <div className="space-y-4">
                  {timeSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                      <div>
                        <span className="font-medium">{slot.label}</span>
                        <span className="text-gray-500 ml-2">
                          ({slot.start_time} - {slot.end_time})
                        </span>
                      </div>
                      <Button onClick={() => removeTimeSlot(slot.id)} variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Card className="p-4 border-dashed">
                    <h4 className="font-medium mb-4">Añadir Nuevo Horario</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Hora de Inicio</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.start_time}
                          onChange={(e) => setNewTimeSlot((prev) => ({ ...prev, start_time: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Hora de Fin</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.end_time}
                          onChange={(e) => setNewTimeSlot((prev) => ({ ...prev, end_time: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Etiqueta (Opcional)</Label>
                        <Input
                          value={newTimeSlot.label}
                          onChange={(e) => setNewTimeSlot((prev) => ({ ...prev, label: e.target.value }))}
                          placeholder="Ej: Mañana, Tarde"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button onClick={addTimeSlot} size="sm" className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Horario
                    </Button>
                  </Card>
                </div>
              </div>

              <div className="space-y-6">
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => updateFormData("image_url", url)}
                  label="Imagen Principal de la Excursión"
                  placeholder="URL de la imagen principal"
                  required
                />

                {/* Galería de Imágenes Secundarias */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <Label className="text-base font-semibold text-gray-900 mb-4 block flex items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      Galería de Imágenes Secundarias
                    </div>
                  </Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Añade hasta 6 imágenes adicionales que se mostrarán en la galería de la excursión
                  </p>
                  <MultiImageUpload
                    value={formData.gallery_images}
                    onChange={(urls) => updateFormData("gallery_images", urls)}
                    maxImages={6}
                    label="Imágenes de la Galería"
                  />
                  <div className="mt-3 text-xs text-gray-500">{formData.gallery_images.length}/6 imágenes añadidas</div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => updateFormData("featured", checked)}
                  />
                  <Label htmlFor="featured" className="flex items-center text-base font-medium">
                    <Star className="h-5 w-5 mr-2 text-yellow-600" />
                    Marcar como Excursión Destacada
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Paso 5: Detalles Adicionales */}
          {currentStep === 5 && (
            <div className="space-y-8">
              {/* Punto de encuentro */}
              <div>
                <Label htmlFor="meeting_point" className="text-sm font-semibold text-gray-700">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Punto de Encuentro
                </Label>
                <Textarea
                  id="meeting_point"
                  value={formData.meeting_point}
                  onChange={(e) => updateFormData("meeting_point", e.target.value)}
                  placeholder="Dirección exacta del punto de encuentro"
                  className="mt-2 text-base"
                  rows={2}
                />
              </div>

              {/* Servicios Incluidos */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <Label className="text-lg font-bold text-green-900 mb-6 block flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  Servicios Incluidos
                </Label>

                <div className="space-y-6">
                  {/* Servicios Predefinidos */}
                  <div>
                    <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Servicios Predefinidos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {includedServices
                        .filter((service) => !formData.included_services.includes(service.name_es))
                        .map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition-colors cursor-pointer"
                            onClick={() => toggleIncludedService(service.name_es)}
                          >
                            <div className="w-5 h-5 border-2 border-green-400 rounded flex items-center justify-center">
                              <Plus className="w-3 h-3 text-green-600" />
                            </div>
                            <Label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                              {service.name_es}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Servicios Seleccionados */}
                  {formData.included_services.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Servicios Seleccionados ({formData.included_services.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.included_services.map((service, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-300"
                          >
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-800">{service}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeIncludedService(index)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Añadir Servicio Personalizado */}
                  <div className="border-t border-green-200 pt-4">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Añadir Servicio Personalizado
                    </h4>
                    <div className="flex gap-3">
                      <Input
                        value={customIncludedService}
                        onChange={(e) => setCustomIncludedService(e.target.value)}
                        placeholder="Escribir servicio personalizado..."
                        className="flex-1 border-green-300 focus:border-green-500 focus:ring-green-500"
                        onKeyPress={(e) => e.key === "Enter" && addCustomIncludedService()}
                      />
                      <Button
                        type="button"
                        onClick={addCustomIncludedService}
                        disabled={!customIncludedService.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white px-6"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Servicios No Incluidos */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
                <Label className="text-lg font-bold text-red-900 mb-6 block flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                    <X className="w-4 h-4 text-white" />
                  </div>
                  Servicios No Incluidos
                </Label>

                <div className="space-y-6">
                  {/* Servicios Predefinidos */}
                  <div>
                    <h4 className="font-semibold text-red-800 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Servicios Predefinidos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {notIncludedServices
                        .filter((service) => !formData.not_included_services.includes(service.name_es))
                        .map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                            onClick={() => toggleNotIncludedService(service.name_es)}
                          >
                            <div className="w-5 h-5 border-2 border-red-400 rounded flex items-center justify-center">
                              <Plus className="w-3 h-3 text-red-600" />
                            </div>
                            <Label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                              {service.name_es}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Servicios Seleccionados */}
                  {formData.not_included_services.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-800 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Servicios Seleccionados ({formData.not_included_services.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.not_included_services.map((service, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-red-100 rounded-lg border border-red-300"
                          >
                            <div className="flex items-center space-x-3">
                              <X className="w-5 h-5 text-red-600" />
                              <span className="text-sm font-medium text-red-800">{service}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNotIncludedService(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Añadir Servicio Personalizado */}
                  <div className="border-t border-red-200 pt-4">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Añadir Servicio Personalizado
                    </h4>
                    <div className="flex gap-3">
                      <Input
                        value={customNotIncludedService}
                        onChange={(e) => setCustomNotIncludedService(e.target.value)}
                        placeholder="Escribir servicio no incluido personalizado..."
                        className="flex-1 border-red-300 focus:border-red-500 focus:ring-red-500"
                        onKeyPress={(e) => e.key === "Enter" && addCustomNotIncludedService()}
                      />
                      <Button
                        type="button"
                        onClick={addCustomNotIncludedService}
                        disabled={!customNotIncludedService.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white px-6"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meses Disponibles */}
              <div>
                <Label className="text-base font-semibold text-gray-900 mb-4 block">
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Meses Disponibles
                </Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {MONTHS.map((month) => (
                    <div
                      key={month.value}
                      className="flex items-center space-x-2 p-3 bg-white rounded-lg border hover:bg-blue-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`month-${month.value}`}
                        checked={formData.available_months.includes(month.value)}
                        onChange={() => toggleMonth(month.value)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <Label htmlFor={`month-${month.value}`} className="text-sm font-medium cursor-pointer">
                        {month.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campos adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="what_to_bring" className="text-sm font-semibold text-gray-700">
                    Qué Traer
                  </Label>
                  <Textarea
                    id="what_to_bring"
                    value={formData.what_to_bring}
                    onChange={(e) => updateFormData("what_to_bring", e.target.value)}
                    placeholder="Lista de elementos que deben traer los participantes"
                    className="mt-2 text-base"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="requirements" className="text-sm font-semibold text-gray-700">
                    Requisitos
                  </Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => updateFormData("requirements", e.target.value)}
                    placeholder="Requisitos físicos, edad mínima, etc."
                    className="mt-2 text-base"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="age_restrictions" className="text-sm font-semibold text-gray-700">
                    Restricciones de Edad
                  </Label>
                  <Input
                    id="age_restrictions"
                    value={formData.age_restrictions}
                    onChange={(e) => updateFormData("age_restrictions", e.target.value)}
                    placeholder="Ej: Mínimo 18 años"
                    className="mt-2 h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="children_age_range" className="text-sm font-semibold text-gray-700">
                    Rango de Edad para Niños
                  </Label>
                  <Input
                    id="children_age_range"
                    value={formData.children_age_range}
                    onChange={(e) => updateFormData("children_age_range", e.target.value)}
                    placeholder="Ej: 6-12 años"
                    className="mt-2 h-12 text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cancellation_policy" className="text-sm font-semibold text-gray-700">
                  Política de Cancelación
                </Label>
                <Textarea
                  id="cancellation_policy"
                  value={formData.cancellation_policy}
                  onChange={(e) => updateFormData("cancellation_policy", e.target.value)}
                  placeholder="Términos y condiciones de cancelación"
                  className="mt-2 text-base"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="special_notes" className="text-sm font-semibold text-gray-700">
                  Notas Especiales
                </Label>
                <Textarea
                  id="special_notes"
                  value={formData.special_notes}
                  onChange={(e) => updateFormData("special_notes", e.target.value)}
                  placeholder="Información adicional importante"
                  className="mt-2 text-base"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Paso 6: Guardar Cambios */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-8">
                <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                  <Save className="h-6 w-6 mr-3" />
                  Confirmar Cambios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3">Información Básica</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Nombre (ES):</strong> {formData.name_es}
                      </div>
                      <div>
                        <strong>Precio:</strong> €{formData.price}
                      </div>
                      <div>
                        <strong>Duración:</strong> {formData.duration}
                      </div>
                      <div>
                        <strong>Categoría:</strong> {formData.category}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3">Horarios</h4>
                    <div className="space-y-2 text-sm">
                      {timeSlots.length > 0 ? (
                        timeSlots.map((slot, index) => (
                          <div key={slot.id}>
                            <strong>Horario {index + 1}:</strong> {slot.label}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">No se han definido horarios específicos</div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3">Detalles Adicionales</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Máx. personas:</strong> {formData.max_people || "No especificado"}
                      </div>
                      <div>
                        <strong>Dificultad:</strong> {formData.difficulty_level || "No especificado"}
                      </div>
                      <div>
                        <strong>Destacada:</strong> {formData.featured ? "Sí" : "No"}
                      </div>
                      <div>
                        <strong>Precio Niños:</strong>{" "}
                        {formData.children_price ? `€${formData.children_price}` : "No especificado"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUpdateExcursion}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Guardando Cambios...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8 border-t bg-gray-50 px-8 py-6 -mx-8 -mb-8 rounded-b-xl">
        <Button
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
          size="lg"
          className="flex items-center px-6 py-3 text-base font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center space-x-4">
          {/* Step indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
            <span>
              Paso {currentStep} de {steps.length}
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {currentStep < 6 ? (
            <Button
              onClick={nextStep}
              disabled={!stepValidation[currentStep]}
              size="lg"
              className="flex items-center px-6 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700"
            >
              Siguiente
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleUpdateExcursion}
              disabled={isSubmitting}
              size="lg"
              className="flex items-center px-6 py-3 text-base font-medium bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Guardando Cambios...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditExcursionPage
