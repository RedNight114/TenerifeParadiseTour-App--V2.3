"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Hash,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  MoreHorizontal,
  Copy,
  BarChart3,
  TrendingUp,
  Activity,
  Grid,
  List,
  Filter,
  SortAsc,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories,
  getExcursions,
  type Category,
  type Excursion,
} from "@/lib/supabase"

interface CategoryFormData {
  name_es: string
  name_en: string
  name_de: string
  description_es: string
  description_en: string
  description_de: string
  icon: string
  color: string
  active: boolean
  sort_order: number
}

interface CategoryWithStats extends Category {
  excursion_count: number
}

const defaultColors = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#6366F1",
  "#84CC16",
  "#F43F5E",
  "#8B5A2B",
  "#6B7280",
  "#1F2937",
  "#7C3AED",
]

const defaultIcons = [
  "🌿",
  "🌊",
  "🥾",
  "🍽️",
  "🏔️",
  "👨‍👩‍👧‍👦",
  "⚡",
  "🏛️",
  "🎨",
  "🎭",
  "🏖️",
  "🚁",
  "🐋",
  "🌋",
  "🏄‍♂️",
  "🚤",
  "🎪",
  "🎯",
  "🎭",
  "🎨",
]

type ViewMode = "grid" | "list"
type SortField = "name" | "created_at" | "sort_order" | "excursion_count"
type SortOrder = "asc" | "desc"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [excursions, setExcursions] = useState<Excursion[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortField, setSortField] = useState<SortField>("sort_order")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [formData, setFormData] = useState<CategoryFormData>({
    name_es: "",
    name_en: "",
    name_de: "",
    description_es: "",
    description_en: "",
    description_de: "",
    icon: "🌿",
    color: "#3B82F6",
    active: true,
    sort_order: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [categoriesData, excursionsData] = await Promise.all([getAllCategories(), getExcursions()])

      const categoriesWithStats = categoriesData.map((category) => ({
        ...category,
        excursion_count: excursionsData.filter((exc) => exc.category === category.name_es).length,
      }))

      setCategories(categoriesWithStats)
      setExcursions(excursionsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = useMemo(() => {
    const filtered = categories.filter((category) => {
      const matchesSearch =
        category.name_es.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.name_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description_es?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.active) ||
        (statusFilter === "inactive" && !category.active)

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case "name":
          aValue = a.name_es
          bValue = b.name_es
          break
        case "created_at":
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case "sort_order":
          aValue = a.sort_order
          bValue = b.sort_order
          break
        case "excursion_count":
          aValue = a.excursion_count
          bValue = b.excursion_count
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [categories, searchTerm, statusFilter, sortField, sortOrder])

  const stats = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((c) => c.active).length,
      inactive: categories.filter((c) => !c.active).length,
      totalExcursions: categories.reduce((sum, c) => sum + c.excursion_count, 0),
      avgExcursionsPerCategory:
        categories.length > 0
          ? Math.round((categories.reduce((sum, c) => sum + c.excursion_count, 0) / categories.length) * 10) / 10
          : 0,
    }),
    [categories],
  )

  const resetForm = () => {
    setFormData({
      name_es: "",
      name_en: "",
      name_de: "",
      description_es: "",
      description_en: "",
      description_de: "",
      icon: "🌿",
      color: "#3B82F6",
      active: true,
      sort_order: categories.length,
    })
    setEditingCategory(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setFormData((prev) => ({ ...prev, sort_order: categories.length }))
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name_es: category.name_es,
      name_en: category.name_en,
      name_de: category.name_de,
      description_es: category.description_es || "",
      description_en: category.description_en || "",
      description_de: category.description_de || "",
      icon: category.icon || "🌿",
      color: category.color,
      active: category.active,
      sort_order: category.sort_order,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
      } else {
        await createCategory(formData)
      }
      await loadData()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id)
      await loadData()
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleToggleStatus = async (id: number, active: boolean) => {
    try {
      await toggleCategoryStatus(id, active)
      await loadData()
    } catch (error) {
      console.error("Error toggling category status:", error)
    }
  }

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    try {
      for (const id of selectedCategories) {
        switch (action) {
          case "activate":
            await toggleCategoryStatus(id, true)
            break
          case "deactivate":
            await toggleCategoryStatus(id, false)
            break
          case "delete":
            await handleDelete(id)
            break
        }
      }
      await loadData()
      setSelectedCategories([])
    } catch (error) {
      console.error("Error performing bulk action:", error)
    }
  }

  const moveCategory = async (id: number, direction: "up" | "down") => {
    const currentIndex = categories.findIndex((cat) => cat.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= categories.length) return

    const newCategories = [...categories]
    const [movedCategory] = newCategories.splice(currentIndex, 1)
    newCategories.splice(newIndex, 0, movedCategory)

    const updates = newCategories.map((cat, index) => ({
      id: cat.id,
      sort_order: index,
    }))

    try {
      await reorderCategories(updates)
      await loadData()
    } catch (error) {
      console.error("Error reordering categories:", error)
    }
  }

  const duplicateCategory = (category: Category) => {
    setFormData({
      name_es: `${category.name_es}-copia`,
      name_en: `${category.name_en}-copy`,
      name_de: `${category.name_de}-kopie`,
      description_es: category.description_es || "",
      description_en: category.description_en || "",
      description_de: category.description_de || "",
      icon: category.icon || "🌿",
      color: category.color,
      active: false,
      sort_order: categories.length,
    })
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const exportCategories = () => {
    const dataStr = JSON.stringify(categories, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `categorias-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-400 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargando categorías</h2>
            <p className="text-gray-600">Preparando el panel de administración...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">Gestión de Categorías</h1>
                  <p className="text-xl lg:text-2xl text-blue-100 font-medium">
                    Administra las categorías de excursiones
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                    <Hash className="h-5 w-5" />
                    <span className="font-semibold">{stats.total}</span>
                    <span className="text-sm">categorías</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                    <Activity className="h-5 w-5" />
                    <span className="font-semibold">{stats.totalExcursions}</span>
                    <span className="text-sm">excursiones</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">{stats.avgExcursionsPerCategory}</span>
                    <span className="text-sm">promedio</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={exportCategories}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm font-semibold"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Exportar Datos
                </Button>
                <Button
                  onClick={openCreateDialog}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nueva Categoría
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8 lg:mb-12">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <Hash className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Activas</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Inactivas</p>
                    <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                    <EyeOff className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Excursiones</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalExcursions}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Promedio</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.avgExcursionsPerCategory}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Filters and Controls */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6 lg:p-8">
              <div className="space-y-6">
                {/* Search and Primary Filters */}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Buscar categorías por nombre o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                      <SelectTrigger className="w-full sm:w-48 h-12 border-gray-200">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        <SelectItem value="active">Solo activas</SelectItem>
                        <SelectItem value="inactive">Solo inactivas</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={`${sortField}-${sortOrder}`}
                      onValueChange={(value) => {
                        const [field, order] = value.split("-")
                        setSortField(field as SortField)
                        setSortOrder(order as SortOrder)
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-56 h-12 border-gray-200">
                        <SortAsc className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sort_order-asc">Orden personalizado</SelectItem>
                        <SelectItem value="name-asc">Nombre A-Z</SelectItem>
                        <SelectItem value="name-desc">Nombre Z-A</SelectItem>
                        <SelectItem value="created_at-desc">Más recientes</SelectItem>
                        <SelectItem value="created_at-asc">Más antiguos</SelectItem>
                        <SelectItem value="excursion_count-desc">Más excursiones</SelectItem>
                        <SelectItem value="excursion_count-asc">Menos excursiones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Secondary Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {selectedCategories.length > 0 && (
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="px-3 py-1 text-sm">
                          {selectedCategories.length} seleccionadas
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                              Acciones masivas
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                              <Eye className="h-4 w-4 mr-2" />
                              Activar seleccionadas
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Desactivar seleccionadas
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar seleccionadas
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 mr-2">Vista:</span>
                    <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-8 px-3"
                      >
                        <Grid className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Tarjetas</span>
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-8 px-3"
                      >
                        <List className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Lista</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Categories Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className={`group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${
                    category.active ? "bg-white hover:scale-[1.02]" : "bg-gray-50 opacity-75 hover:opacity-90"
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category.id])
                          } else {
                            setSelectedCategories(selectedCategories.filter((id) => id !== category.id))
                          }
                        }}
                        className="bg-white border-2 shadow-sm"
                      />
                    </div>

                    {/* Actions Menu */}
                    <div className="absolute top-4 right-4 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-sm"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar categoría
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateCategory(category)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar categoría
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleStatus(category.id, !category.active)}>
                            {category.active ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar categoría
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente la categoría "
                                  {category.name_es}" y todas sus asociaciones.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Category Content */}
                    <div className="text-center pt-8 space-y-4">
                      {/* Icon */}
                      <div className="relative mx-auto">
                        <div
                          className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon}
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                          <Badge
                            variant={category.active ? "default" : "secondary"}
                            className="text-xs px-2 py-1 shadow-sm"
                          >
                            {category.active ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                      </div>

                      {/* Title and Stats */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">{category.name_es}</h3>
                        <Badge variant="outline" className="text-xs">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          {category.excursion_count} excursiones
                        </Badge>
                      </div>

                      {/* Description */}
                      {category.description_es && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed px-2">
                          {category.description_es}
                        </p>
                      )}

                      {/* Translations */}
                      <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-medium">EN:</span>
                          <span className="truncate">{category.name_en}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-medium">DE:</span>
                          <span className="truncate">{category.name_de}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="space-y-0">
                  {filteredCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between p-6 lg:p-8 border-b last:border-b-0 hover:bg-gray-50/50 transition-all duration-200 ${
                        category.active ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <div className="flex items-center space-x-4 lg:space-x-6 flex-1 min-w-0">
                        <Checkbox
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category.id])
                            } else {
                              setSelectedCategories(selectedCategories.filter((id) => id !== category.id))
                            }
                          }}
                        />

                        {sortField === "sort_order" && (
                          <div className="flex flex-col space-y-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveCategory(category.id, "up")}
                                  disabled={index === 0}
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Mover arriba</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveCategory(category.id, "down")}
                                  disabled={index === filteredCategories.length - 1}
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Mover abajo</TooltipContent>
                            </Tooltip>
                          </div>
                        )}

                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl shadow-md flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <h3 className="font-bold text-lg text-gray-900 truncate">{category.name_es}</h3>
                            <Badge
                              variant={category.active ? "default" : "secondary"}
                              className="text-xs flex-shrink-0"
                            >
                              {category.active ? "Activa" : "Inactiva"}
                            </Badge>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              {category.excursion_count} excursiones
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              <span>
                                <span className="font-medium">EN:</span> {category.name_en}
                              </span>
                              <span>
                                <span className="font-medium">DE:</span> {category.name_de}
                              </span>
                            </div>
                            {category.description_es && (
                              <p className="text-gray-500 max-w-2xl leading-relaxed">{category.description_es}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <Switch
                          checked={category.active}
                          onCheckedChange={(checked) => handleToggleStatus(category.id, checked)}
                        />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(category)}
                              className="hover:bg-blue-50 hover:border-blue-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar categoría</TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="hover:bg-gray-50">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => duplicateCategory(category)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar categoría
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar categoría
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente la categoría "
                                    {category.name_es}" y todas sus asociaciones.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(category.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {filteredCategories.length === 0 && (
                    <div className="text-center py-16 lg:py-24">
                      <div className="space-y-6">
                        <div className="text-gray-400">
                          <Search className="h-16 w-16 mx-auto" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-gray-900">No se encontraron categorías</h3>
                          <p className="text-gray-600 max-w-md mx-auto">
                            {searchTerm || statusFilter !== "all"
                              ? "Intenta ajustar los filtros de búsqueda para encontrar las categorías que buscas."
                              : "Comienza creando tu primera categoría de excursiones para organizar mejor tu contenido."}
                          </p>
                        </div>
                        {!searchTerm && statusFilter === "all" && (
                          <Button onClick={openCreateDialog} size="lg" className="mt-4">
                            <Plus className="h-5 w-5 mr-2" />
                            Crear Primera Categoría
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
            <DialogHeader className="space-y-4 pb-6">
              <DialogTitle className="text-2xl font-bold">
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                {editingCategory
                  ? "Modifica los datos de la categoría existente. Los cambios se aplicarán inmediatamente."
                  : "Completa la información para crear una nueva categoría. Todos los campos marcados con * son obligatorios."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8">
              {/* Nombres */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">Nombres en diferentes idiomas</h4>
                  <Badge variant="outline" className="text-xs">
                    Obligatorio
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name_es" className="text-sm font-medium">
                      Español *
                    </Label>
                    <Input
                      id="name_es"
                      value={formData.name_es}
                      onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                      placeholder="naturaleza"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name_en" className="text-sm font-medium">
                      Inglés *
                    </Label>
                    <Input
                      id="name_en"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      placeholder="nature"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name_de" className="text-sm font-medium">
                      Alemán *
                    </Label>
                    <Input
                      id="name_de"
                      value={formData.name_de}
                      onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                      placeholder="natur"
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Descripciones */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">Descripciones</h4>
                  <Badge variant="secondary" className="text-xs">
                    Opcional
                  </Badge>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="desc_es" className="text-sm font-medium">
                      Descripción en Español
                    </Label>
                    <Textarea
                      id="desc_es"
                      rows={3}
                      value={formData.description_es}
                      onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                      placeholder="Excursiones en entornos naturales y paisajes únicos"
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc_en" className="text-sm font-medium">
                      Descripción en Inglés
                    </Label>
                    <Textarea
                      id="desc_en"
                      rows={3}
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      placeholder="Excursions in natural environments and unique landscapes"
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc_de" className="text-sm font-medium">
                      Descripción en Alemán
                    </Label>
                    <Textarea
                      id="desc_de"
                      rows={3}
                      value={formData.description_de}
                      onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                      placeholder="Ausflüge in natürlichen Umgebungen und einzigartigen Landschaften"
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Icono y Color */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Icono de la categoría</Label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-8 gap-3">
                      {defaultIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl hover:bg-gray-50 transition-all duration-200 ${
                            formData.icon === icon
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom_icon" className="text-sm font-medium">
                        O escribe tu propio icono
                      </Label>
                      <Input
                        id="custom_icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="🌿"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Color de la categoría</Label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-3">
                      {defaultColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                            formData.color === color
                              ? "border-gray-800 ring-4 ring-gray-200"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom_color" className="text-sm font-medium">
                        O elige un color personalizado
                      </Label>
                      <Input
                        id="custom_color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="h-11 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Vista previa mejorada */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Vista previa de la categoría</Label>
                <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-6">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg"
                        style={{ backgroundColor: formData.color }}
                      >
                        {formData.icon}
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h3 className="font-bold text-xl text-gray-900">
                            {formData.name_es || "Nombre de categoría"}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {formData.description_es || "Descripción de la categoría"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={formData.active ? "default" : "secondary"}>
                            {formData.active ? "Activa" : "Inactiva"}
                          </Badge>
                          <Badge variant="outline">
                            <BarChart3 className="h-3 w-3 mr-1" />0 excursiones
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estado */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <div className="space-y-1">
                  <Label htmlFor="active" className="text-sm font-medium">
                    Categoría activa
                  </Label>
                  <p className="text-xs text-gray-600">
                    Las categorías inactivas no aparecen en el formulario de excursiones
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} size="lg">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name_es || !formData.name_en || !formData.name_de}
                size="lg"
                className="min-w-[140px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingCategory ? "Actualizar" : "Crear"} Categoría
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
