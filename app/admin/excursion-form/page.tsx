"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock, Euro, Users, FileText, Star, CheckCircle, AlertCircle, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  getIncludedServices,
  getNotIncludedServices,
  getCategories,
  type PredefinedService,
  type FAQ,
  type Category,
} from "@/lib/supabase"
import { ImageUpload } from "@/components/image-upload"
import { MultiImageUpload } from "@/components/multi-image-upload"

interface ExcursionData {
  // Campos obligatorios
  name_es: string
  name_en: string
  name_de: string
  short_description_es: string
  short_description_en: string
  short_description_de: string
  description_es: string
  description_en: string
  description_de: string
  price: string
  duration: string
  category: string
  image_url: string
  featured: boolean

  // Campos opcionales
  included_services: string[]
  not_included_services: string[]
  difficulty_level: string
  start_time: string
  end_time: string
  meeting_point: string
  what_to_bring: string
  cancellation_policy: string
  age_restrictions: string
  available_months: string[]
  special_notes: string
  requirements: string
  faqs: FAQ[]
  max_people: string
  gallery_images: string[]
  children_price: string
  children_age_range: string
}

export default function ExcursionFormPage() {
  const [formData, setFormData] = useState<ExcursionData>({
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
    included_services: [],
    not_included_services: [],
    difficulty_level: "",
    start_time: "",
    end_time: "",
    meeting_point: "",
    what_to_bring: "",
    cancellation_policy: "",
    age_restrictions: "",
    available_months: [],
    special_notes: "",
    requirements: "",
    faqs: [],
    max_people: "",
    gallery_images: [],
    children_price: "",
    children_age_range: "",
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [generatedSQL, setGeneratedSQL] = useState("")
  const [predefinedIncludedServices, setPredefinedIncludedServices] = useState<PredefinedService[]>([])
  const [predefinedNotIncludedServices, setPredefinedNotIncludedServices] = useState<PredefinedService[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [customIncludedService, setCustomIncludedService] = useState("")
  const [customNotIncludedService, setCustomNotIncludedService] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [included, notIncluded, categoriesData] = await Promise.all([
        getIncludedServices(),
        getNotIncludedServices(),
        getCategories(),
      ])
      setPredefinedIncludedServices(included)
      setPredefinedNotIncludedServices(notIncluded)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const difficultyLevels = [
    "Fácil - Para todos",
    "Moderado - Forma física básica",
    "Difícil - Buena forma física",
    "Muy difícil - Excelente forma física",
  ]

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const handleServiceToggle = (service: string, type: "included" | "not_included") => {
    const field = type === "included" ? "included_services" : "not_included_services"
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(service) ? prev[field].filter((s) => s !== service) : [...prev[field], service],
    }))
  }

  const handleMonthToggle = (month: string) => {
    setFormData((prev) => ({
      ...prev,
      available_months: prev.available_months.includes(month)
        ? prev.available_months.filter((m) => m !== month)
        : [...prev.available_months, month],
    }))
  }

  const addCustomService = (type: "included" | "not_included") => {
    const service = type === "included" ? customIncludedService : customNotIncludedService
    if (service.trim()) {
      handleServiceToggle(service.trim(), type)
      if (type === "included") {
        setCustomIncludedService("")
      } else {
        setCustomNotIncludedService("")
      }
    }
  }

  const addFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          question_es: "",
          question_en: "",
          question_de: "",
          answer_es: "",
          answer_en: "",
          answer_de: "",
        },
      ],
    }))
  }

  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)),
    }))
  }

  const removeFAQ = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }))
  }

  const generateSQL = () => {
    const sql = `INSERT INTO excursions (
  name_es, name_en, name_de,
  short_description_es, short_description_en, short_description_de,
  description_es, description_en, description_de,
  price, duration, category, image_url, featured,
  included_services, not_included_services,
  difficulty_level, start_time, end_time,
  meeting_point, what_to_bring, cancellation_policy,
  age_restrictions, available_months, special_notes,
  requirements, faqs, max_people,
  gallery_images,
  created_at,
  children_price, children_age_range
) VALUES (
  '${formData.name_es}',
  '${formData.name_en}',
  '${formData.name_de}',
  '${formData.short_description_es}',
  '${formData.short_description_en}',
  '${formData.short_description_de}',
  '${formData.description_es}',
  '${formData.description_en}',
  '${formData.description_de}',
  ${formData.price || 0},
  '${formData.duration}',
  '${formData.category}',
  '${formData.image_url}',
  ${formData.featured},
  '${JSON.stringify(formData.included_services)}',
  '${JSON.stringify(formData.not_included_services)}',
  ${formData.difficulty_level ? `'${formData.difficulty_level}'` : "NULL"},
  ${formData.start_time ? `'${formData.start_time}'` : "NULL"},
  ${formData.end_time ? `'${formData.end_time}'` : "NULL"},
  ${formData.meeting_point ? `'${formData.meeting_point}'` : "NULL"},
  ${formData.what_to_bring ? `'${formData.what_to_bring}'` : "NULL"},
  ${formData.cancellation_policy ? `'${formData.cancellation_policy}'` : "NULL"},
  ${formData.age_restrictions ? `'${formData.age_restrictions}'` : "NULL"},
  '${JSON.stringify(formData.available_months)}',
  ${formData.special_notes ? `'${formData.special_notes}'` : "NULL"},
  ${formData.requirements ? `'${formData.requirements}'` : "NULL"},
  '${JSON.stringify(formData.faqs)}',
  ${formData.max_people || 8},
  '${JSON.stringify(formData.gallery_images)}',
  NOW(),
  ${formData.children_price ? formData.children_price : "NULL"},
  ${formData.children_age_range ? `'${formData.children_age_range}'` : "NULL"}
);`

    setGeneratedSQL(sql)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSQL)
    alert("SQL copiado al portapapeles!")
  }

  const downloadSQL = () => {
    const blob = new Blob([generatedSQL], { type: "text/sql" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `excursion_${formData.name_es.toLowerCase().replace(/\s+/g, "_")}.sql`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const steps = [
    { number: 1, title: "Información Básica", icon: FileText },
    { number: 2, title: "Descripciones", icon: FileText },
    { number: 3, title: "Detalles Operativos", icon: Clock },
    { number: 4, title: "Servicios", icon: Star },
    { number: 5, title: "FAQ y Extras", icon: HelpCircle },
    { number: 6, title: "Generar SQL", icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Formulario de Nueva Excursión</h1>
            <p className="text-xl text-blue-100">Sistema completo y flexible para crear excursiones personalizadas</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.number ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span
                  className={`ml-3 font-medium hidden sm:block ${
                    currentStep >= step.number ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 mx-6 hidden sm:block"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step 1: Información Básica */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-6 w-6 mr-3" />
                Información Básica (Obligatoria)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombres en diferentes idiomas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Nombres de la Excursión *</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name_es">Nombre en Español *</Label>
                    <Input
                      id="name_es"
                      value={formData.name_es}
                      onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                      placeholder="Ej: Excursión al Teide y Observación de Estrellas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_en">Nombre en Inglés *</Label>
                    <Input
                      id="name_en"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      placeholder="Ex: Teide Excursion and Stargazing"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_de">Nombre en Alemán *</Label>
                    <Input
                      id="name_de"
                      value={formData.name_de}
                      onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                      placeholder="Z.B: Teide-Ausflug und Sternenbeobachtung"
                    />
                  </div>
                </div>
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="price">
                    <Euro className="h-4 w-4 inline mr-1" />
                    Precio Base (€) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="65"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="children_price">
                      <Euro className="h-4 w-4 inline mr-1" />
                      Precio Niños (€) - Opcional
                    </Label>
                    <Input
                      id="children_price"
                      type="number"
                      value={formData.children_price}
                      onChange={(e) => setFormData({ ...formData, children_price: e.target.value })}
                      placeholder="35"
                    />
                  </div>
                  <div>
                    <Label htmlFor="children_age_range">Rango de Edad Niños</Label>
                    <Input
                      id="children_age_range"
                      value={formData.children_age_range}
                      onChange={(e) => setFormData({ ...formData, children_age_range: e.target.value })}
                      placeholder="3-12 años"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Duración *
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="8 horas"
                  />
                </div>
                <div>
                  <Label htmlFor="category">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Categoría *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name_es}>
                          <div className="flex items-center space-x-2">
                            <span style={{ color: cat.color }}>{cat.icon}</span>
                            <span>{cat.name_es}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max_people">
                    <Users className="h-4 w-4 inline mr-1" />
                    Máx. Personas
                  </Label>
                  <Input
                    id="max_people"
                    type="number"
                    value={formData.max_people}
                    onChange={(e) => setFormData({ ...formData, max_people: e.target.value })}
                    placeholder="8"
                  />
                </div>
              </div>

              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Imagen Principal de la Excursión"
                placeholder="https://ejemplo.com/imagen-excursion.jpg"
                required
              />

              <MultiImageUpload
                value={formData.gallery_images}
                onChange={(urls) => setFormData({ ...formData, gallery_images: urls })}
                label="Galería de Imágenes Adicionales (Opcional)"
                maxImages={6}
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
                />
                <Label htmlFor="featured">
                  <Star className="h-4 w-4 inline mr-1 text-yellow-500" />
                  Marcar como excursión destacada
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Los demás pasos permanecen igual... */}
        {/* Step 2: Descripciones */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Descripciones de la Excursión (Obligatorias)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Descripciones cortas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Descripciones Cortas (para tarjetas) *</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="short_desc_es">Descripción corta en Español *</Label>
                    <Textarea
                      id="short_desc_es"
                      rows={2}
                      value={formData.short_description_es}
                      onChange={(e) => setFormData({ ...formData, short_description_es: e.target.value })}
                      placeholder="Una experiencia única para descubrir el volcán más alto de España y disfrutar de un cielo estrellado incomparable."
                    />
                  </div>
                  <div>
                    <Label htmlFor="short_desc_en">Descripción corta en Inglés *</Label>
                    <Textarea
                      id="short_desc_en"
                      rows={2}
                      value={formData.short_description_en}
                      onChange={(e) => setFormData({ ...formData, short_description_en: e.target.value })}
                      placeholder="A unique experience to discover Spain's highest volcano and enjoy an incomparable starry sky."
                    />
                  </div>
                  <div>
                    <Label htmlFor="short_desc_de">Descripción corta en Alemán *</Label>
                    <Textarea
                      id="short_desc_de"
                      rows={2}
                      value={formData.short_description_de}
                      onChange={(e) => setFormData({ ...formData, short_description_de: e.target.value })}
                      placeholder="Ein einzigartiges Erlebnis, um Spaniens höchsten Vulkan zu entdecken und einen unvergleichlichen Sternenhimmel zu genießen."
                    />
                  </div>
                </div>
              </div>

              {/* Descripciones completas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Descripciones Completas *</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="desc_es">Descripción completa en Español *</Label>
                    <Textarea
                      id="desc_es"
                      rows={6}
                      value={formData.description_es}
                      onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                      placeholder="Describe detalladamente la excursión, qué verán, qué harán, puntos destacados, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc_en">Descripción completa en Inglés *</Label>
                    <Textarea
                      id="desc_en"
                      rows={6}
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      placeholder="Describe in detail the excursion, what they will see, what they will do, highlights, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc_de">Descripción completa en Alemán *</Label>
                    <Textarea
                      id="desc_de"
                      rows={6}
                      value={formData.description_de}
                      onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                      placeholder="Beschreiben Sie den Ausflug im Detail, was sie sehen werden, was sie tun werden, Höhepunkte, etc."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Los demás pasos (3, 4, 5, 6) permanecen exactamente igual que antes... */}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            variant="outline"
          >
            Anterior
          </Button>

          {currentStep < 6 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={() => {
                setCurrentStep(1)
                setFormData({
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
                  included_services: [],
                  not_included_services: [],
                  difficulty_level: "",
                  start_time: "",
                  end_time: "",
                  meeting_point: "",
                  what_to_bring: "",
                  cancellation_policy: "",
                  age_restrictions: "",
                  available_months: [],
                  special_notes: "",
                  requirements: "",
                  faqs: [],
                  max_people: "",
                  gallery_images: [],
                  children_price: "",
                  children_age_range: "",
                })
                setGeneratedSQL("")
              }}
              variant="outline"
            >
              Nueva Excursión
            </Button>
          )}
        </div>

        {/* Información de ayuda */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Sistema Mejorado - Información Importante</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • <strong>Campos obligatorios:</strong> Nombre, precio, duración, categoría, imagen y descripciones
                  </li>
                  <li>
                    • <strong>Categorías dinámicas:</strong> Las categorías se cargan desde la base de datos
                  </li>
                  <li>
                    • <strong>Gestión de categorías:</strong> Ve a /admin/categories para administrar categorías
                  </li>
                  <li>
                    • <strong>Servicios flexibles:</strong> Combina servicios predefinidos con personalizados
                  </li>
                  <li>
                    • <strong>Sistema adaptativo:</strong> Las tarjetas solo muestran información disponible
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
