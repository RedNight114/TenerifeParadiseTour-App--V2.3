"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Plus, Eye, Star, Calendar, Users, Clock, Filter, MoreVertical } from "lucide-react"
import type { Category, Excursion } from "@/lib/supabase"
import { CategoriesManager } from "@/components/admin/categories-manager"
import { deleteExcursion, setExcursionPublished } from "@/lib/excursion-actions"
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

export default function ManageExcursionsManager({ initialExcursions, initialCategories }: { initialExcursions: Excursion[]; initialCategories: Category[] }) {
  const router = useRouter()
  const [excursions, setExcursions] = useState<Excursion[]>(initialExcursions)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [activeSection, setActiveSection] = useState<"excursions" | "categories">("excursions")
  const [filteredExcursions, setFilteredExcursions] = useState<Excursion[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterFeatured, setFilterFeatured] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [excursionToDelete, setExcursionToDelete] = useState<Excursion | null>(null)
  const [publicationPending, setPublicationPending] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { setExcursions(initialExcursions) }, [initialExcursions])
  useEffect(() => { setCategories(initialCategories) }, [initialCategories])
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") === "categories") setActiveSection("categories")
  }, [])

  const loadExcursions = async () => { router.refresh() }

  const filterExcursions = useCallback(() => {
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
      filtered = filtered.filter((excursion) => filterFeatured === "published" ? excursion.is_published : !excursion.is_published)
    }

    setFilteredExcursions(filtered)
  }, [excursions, searchTerm, filterCategory, filterFeatured])

  useEffect(() => {
    filterExcursions()
  }, [filterExcursions])

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
    return categories.map((category) => category.name_es)
  }

  const changeSection = (section: "excursions" | "categories") => {
    setActiveSection(section)
    const url = new URL(window.location.href)
    if (section === "categories") url.searchParams.set("view", "categories")
    else url.searchParams.delete("view")
    router.replace(`${url.pathname}${url.search}`, { scroll: false })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handlePublicationToggle = async (excursion: Excursion) => {
    setPublicationPending(excursion.id)
    const result = await setExcursionPublished(excursion.id, !excursion.is_published)
    if (result.success) {
      toast.success(excursion.is_published ? "Excursión retirada del catálogo público." : "Excursión publicada.")
      await loadExcursions()
    } else {
      toast.error(result.error)
    }
    setPublicationPending(null)
  }

  return (
    <div className="min-h-full bg-transparent">
      <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Catálogo</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{activeSection === "excursions" ? "Excursiones" : "Categorías"}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{activeSection === "excursions" ? "Gestiona las experiencias que tu empresa ofrece a sus clientes." : "Organiza las experiencias desde el mismo catálogo y controla qué categorías aparecen en la web."}</p>
          <p className="mt-3 text-sm text-slate-500"><span className="font-semibold tabular-nums text-slate-800">{activeSection === "excursions" ? excursions.length : categories.length}</span> {activeSection === "excursions" ? "experiencias" : "categorías"}{activeSection === "excursions" && <> <span className="px-1.5 text-slate-300">·</span> <span className="font-semibold tabular-nums text-slate-800">{excursions.filter((e) => e.featured).length}</span> destacadas <span className="px-1.5 text-slate-300">·</span> <span className="font-semibold tabular-nums text-slate-800">{categories.filter((category) => category.active).length}</span> activas</>}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeSection === "excursions" && <Button onClick={() => router.push("/admin/excursion-form")} className="min-h-11 rounded-lg bg-teal-800 text-white hover:bg-teal-900"><Plus className="mr-2 h-4 w-4" />Nueva excursión</Button>}
        </div>
      </header>

      <div className="mb-5 flex w-full max-w-sm rounded-xl border border-slate-200 bg-white p-1" role="group" aria-label="Herramientas del catálogo">
        <Button type="button" variant={activeSection === "excursions" ? "secondary" : "ghost"} aria-pressed={activeSection === "excursions"} className="h-11 flex-1 rounded-lg" onClick={() => changeSection("excursions")}><Calendar className="mr-2 h-4 w-4" />Excursiones</Button>
        <Button type="button" variant={activeSection === "categories" ? "secondary" : "ghost"} aria-pressed={activeSection === "categories"} className="h-11 flex-1 rounded-lg" onClick={() => changeSection("categories")}><Filter className="mr-2 h-4 w-4" />Categorías</Button>
      </div>

      {activeSection === "categories" ? <CategoriesManager categories={categories} excursions={excursions} onChanged={() => router.refresh()} /> : <div className="py-2">
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
                    <option value="published">Publicadas</option>
                    <option value="draft">Borradores</option>
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
                className="overflow-hidden border-gray-200 bg-white transition-[border-color,box-shadow] duration-200 hover:shadow-lg"
              >
                {/* Keep existing card content */}
                <div className="relative h-56 bg-gray-100">
                  <Image
                    src={excursion.image_url || "/placeholder.svg"}
                    alt={excursion.name_es || "Excursión sin título"}
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
                  <Badge className={`absolute bottom-4 left-4 ${excursion.is_published ? "bg-emerald-700 text-white" : "bg-amber-100 text-amber-900"}`}>{excursion.is_published ? "Publicada" : "Borrador"}</Badge>

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
                        <DropdownMenuItem disabled={!excursion.is_published} onClick={() => router.push(`/excursions/${excursion.id}`)}>
                          <Eye className="h-4 w-4 mr-3" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/edit-excursion/${excursion.id}`)}>
                          <Edit className="h-4 w-4 mr-3" />
                          Editar Excursión
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={publicationPending === excursion.id} onClick={() => void handlePublicationToggle(excursion)}>
                          {excursion.is_published ? "Retirar del catálogo" : "Publicar excursión"}
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
                    <div className="text-lg font-bold text-green-700">{excursion.price > 0 ? `€${excursion.price}` : "Precio pendiente"}</div>
                    {excursion.price > 0 && <div className="text-xs text-gray-600 text-center">precio base</div>}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {excursion.name_es || <span className="italic text-slate-500">Excursión sin título</span>}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {excursion.short_description_es || <span className="italic text-slate-400">Resumen pendiente</span>}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{excursion.duration || "Duración pendiente"}</span>
                    </div>

                    {excursion.max_people && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                        <span className="truncate">Máx. {excursion.max_people}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600 col-span-2">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                      <span>Creada: {formatDate(excursion.created_at || "")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Badge variant="outline" className="text-xs font-medium">
                      {excursion.category || "Categoría pendiente"}
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
                      <Button variant="outline" size="sm" disabled={publicationPending === excursion.id} onClick={() => void handlePublicationToggle(excursion)} className={excursion.is_published ? "text-amber-800" : "text-emerald-800"}>
                        {publicationPending === excursion.id ? "Guardando…" : excursion.is_published ? "Retirar" : "Publicar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!excursion.is_published}
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
      </div>}

      {/* Keep existing delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed">
              Esta acción no se puede deshacer. Se eliminará permanentemente la excursión{" "}
              <strong className="text-gray-900">{excursionToDelete?.name_es || "Excursión sin título"}</strong> y todos sus datos asociados.
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
