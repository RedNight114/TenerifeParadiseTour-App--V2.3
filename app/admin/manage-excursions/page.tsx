"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Plus, Eye, Star, Calendar, Users, Clock, Filter, MoreVertical, Hash } from "lucide-react"
import { getExcursions, type Excursion } from "@/lib/supabase"
import { deleteExcursion } from "@/lib/excursion-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const ManageExcursionsPage = () => {
  const router = useRouter()
  const [excursions, setExcursions] = useState<Excursion[]>([])
  const [filteredExcursions, setFilteredExcursions] = useState<Excursion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterFeatured, setFilterFeatured] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [excursionToDelete, setExcursionToDelete] = useState<Excursion | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadExcursions()
  }, [])

  useEffect(() => {
    filterExcursions()
  }, [excursions, searchTerm, filterCategory, filterFeatured])

  const loadExcursions = async () => {
    try {
      setLoading(true)
      const data = await getExcursions()
      setExcursions(data)
    } catch (error) {
      console.error("Error loading excursions:", error)
      toast.error("Error cargando excursiones")
    } finally {
      setLoading(false)
    }
  }

  const filterExcursions = () => {
    let filtered = excursions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (excursion) =>
          excursion.name_es.toLowerCase().includes(searchTerm.toLowerCase()) ||
          excursion.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          excursion.name_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
          excursion.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter((excursion) => excursion.category === filterCategory)
    }

    // Filter by featured
    if (filterFeatured !== "all") {
      filtered = filtered.filter((excursion) =>
        filterFeatured === "featured" ? excursion.featured : !excursion.featured,
      )
    }

    setFilteredExcursions(filtered)
  }

  const handleDeleteClick = (excursion: Excursion) => {
    setExcursionToDelete(excursion)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!excursionToDelete) return

    setDeleting(true)
    try {
      const result = await deleteExcursion(excursionToDelete.id)

      if (result.success) {
        toast.success("Excursión eliminada exitosamente")
        await loadExcursions() // Reload the list
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error deleting excursion:", error)
      toast.error("Error eliminando excursión")
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setExcursionToDelete(null)
    }
  }

  const getUniqueCategories = () => {
    const categories = excursions.map((excursion) => excursion.category)
    return [...new Set(categories)]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Cargando excursiones...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">Gestión de Excursiones</h1>
                <p className="text-xl lg:text-2xl text-blue-100 font-medium">
                  Administra, edita y elimina las excursiones existentes
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-blue-100">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Hash className="h-5 w-5" />
                  <span className="font-semibold">{excursions.length}</span>
                  <span className="text-sm">excursiones</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Star className="h-5 w-5" />
                  <span className="font-semibold">{excursions.filter((e) => e.featured).length}</span>
                  <span className="text-sm">destacadas</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Filter className="h-5 w-5" />
                  <span className="font-semibold">{getUniqueCategories().length}</span>
                  <span className="text-sm">categorías</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push("/admin")}
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm font-semibold"
              >
                Volver al Panel
              </Button>
              <Button
                onClick={() => router.push("/admin/categories")}
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm font-semibold"
              >
                <Filter className="h-5 w-5 mr-2" />
                Ver Categorías
              </Button>
              <Button
                onClick={() => router.push("/admin/excursion-form")}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nueva Excursión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Rest of the content remains the same */}
        {/* Filters Section */}
        <Card className="mb-8 shadow-sm border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar por nombre, categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  >
                    <option value="all">Todas las categorías</option>
                    {getUniqueCategories().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={filterFeatured}
                    onChange={(e) => setFilterFeatured(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  >
                    <option value="all">Todas</option>
                    <option value="featured">Destacadas</option>
                    <option value="not-featured">No destacadas</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-2 flex items-end">
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg w-full">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">
                      {filteredExcursions.length} de {excursions.length} excursiones
                    </span>
                    {(searchTerm || filterCategory !== "all" || filterFeatured !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("")
                          setFilterCategory("all")
                          setFilterFeatured("all")
                        }}
                        className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section - keep existing content */}
        {filteredExcursions.length === 0 ? (
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-6">
                <Search className="h-20 w-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No se encontraron excursiones</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || filterCategory !== "all" || filterFeatured !== "all"
                  ? "Intenta ajustar los filtros de búsqueda para encontrar lo que buscas"
                  : "Aún no hay excursiones creadas. ¡Comienza creando tu primera excursión!"}
              </p>
              {!searchTerm && filterCategory === "all" && filterFeatured === "all" && (
                <Button
                  onClick={() => router.push("/admin/excursion-form")}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Primera Excursión
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredExcursions.map((excursion) => (
              <Card
                key={excursion.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 bg-white"
              >
                {/* Keep existing card content */}
                <div className="relative h-56 bg-gray-100">
                  <Image
                    src={excursion.image_url || "/placeholder.svg"}
                    alt={excursion.name_es}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                  {excursion.featured && (
                    <Badge className="absolute top-4 left-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-3 py-1">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Destacada
                    </Badge>
                  )}

                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/95 hover:bg-white shadow-sm backdrop-blur-sm"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => router.push(`/excursions/${excursion.id}`)}>
                          <Eye className="h-4 w-4 mr-3" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/edit-excursion/${excursion.id}`)}>
                          <Edit className="h-4 w-4 mr-3" />
                          Editar Excursión
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(excursion)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-3" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div className="text-lg font-bold text-green-600">€{excursion.price}</div>
                    <div className="text-xs text-gray-600 text-center">por persona</div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {excursion.name_es}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {excursion.short_description_es}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{excursion.duration}</span>
                    </div>

                    {excursion.max_people && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                        <span className="truncate">Máx. {excursion.max_people}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600 col-span-2">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                      <span>Creada: {formatDate(excursion.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Badge variant="outline" className="text-xs font-medium">
                      {excursion.category}
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/edit-excursion/${excursion.id}`)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/excursions/${excursion.id}`)}
                        className="text-gray-600 hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Keep existing delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed">
              Esta acción no se puede deshacer. Se eliminará permanentemente la excursión{" "}
              <strong className="text-gray-900">{excursionToDelete?.name_es}</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel disabled={deleting} className="flex-1">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 flex-1"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ManageExcursionsPage
