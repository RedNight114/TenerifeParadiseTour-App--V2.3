"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Edit, Plus, Search, Tags, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Category, Excursion } from "@/lib/supabase"
import { createCategory, deleteCategory, reorderCategories, toggleCategoryStatus, updateCategory } from "@/lib/category-actions"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

type CategoryDraft = {
  name_es: string
  name_en: string
  description_es: string
  description_en: string
  icon: string
  color: string
  active: boolean
}

const emptyDraft: CategoryDraft = { name_es: "", name_en: "", description_es: "", description_en: "", icon: "", color: "#0F766E", active: true }
const controlClass = "h-11 rounded-lg border-slate-200 text-base focus-visible:ring-teal-700"

export function CategoriesManager({ categories: initialCategories, excursions, onChanged }: { categories: Category[]; excursions: Excursion[]; onChanged: () => void }) {
  const [categories, setCategories] = useState(initialCategories)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all")
  const [editing, setEditing] = useState<Category | null>(null)
  const [draft, setDraft] = useState<CategoryDraft>(emptyDraft)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => setCategories(initialCategories), [initialCategories])

  const usage = useMemo(() => {
    const counts = new Map<string, number>()
    excursions.forEach((excursion) => counts.set(excursion.category, (counts.get(excursion.category) ?? 0) + 1))
    return counts
  }, [excursions])

  const visible = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("es")
    return categories.filter((category) => {
      const matchesSearch = !needle || `${category.name_es} ${category.name_en} ${category.description_es ?? ""}`.toLocaleLowerCase("es").includes(needle)
      const matchesStatus = status === "all" || (status === "active" ? category.active : !category.active)
      return matchesSearch && matchesStatus
    }).sort((a, b) => a.sort_order - b.sort_order || a.name_es.localeCompare(b.name_es, "es"))
  }, [categories, search, status])

  function openCreate() { setEditing(null); setDraft(emptyDraft); setFormOpen(true) }
  function openEdit(category: Category) {
    setEditing(category)
    setDraft({ name_es: category.name_es, name_en: category.name_en, description_es: category.description_es ?? "", description_en: category.description_en ?? "", icon: category.icon ?? "", color: category.color || "#0F766E", active: category.active })
    setFormOpen(true)
  }

  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = { ...draft, name_de: draft.name_en.trim() || draft.name_es.trim(), description_de: draft.description_en, sort_order: editing?.sort_order ?? categories.length }
      if (editing) await updateCategory(editing.id, payload)
      else await createCategory(payload)
      toast.success(editing ? "Categoría actualizada" : "Categoría creada")
      setFormOpen(false)
      onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la categoría")
    } finally { setSaving(false) }
  }

  async function changeStatus(category: Category, active: boolean) {
    setSaving(true)
    try { await toggleCategoryStatus(category.id, active); toast.success(active ? "Categoría activada" : "Categoría desactivada"); onChanged() }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo actualizar la categoría") }
    finally { setSaving(false) }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try { await deleteCategory(deleteTarget.id); toast.success("Categoría eliminada"); setDeleteTarget(null); onChanged() }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo eliminar la categoría") }
    finally { setSaving(false) }
  }

  async function moveCategory(category: Category, direction: -1 | 1) {
    const ordered = [...categories].sort((a, b) => a.sort_order - b.sort_order || a.name_es.localeCompare(b.name_es, "es"))
    const index = ordered.findIndex((item) => item.id === category.id)
    const target = index + direction
    if (target < 0 || target >= ordered.length) return
    const [moved] = ordered.splice(index, 1)
    ordered.splice(target, 0, moved)
    setSaving(true)
    try { await reorderCategories(ordered.map((item, sort_order) => ({ id: item.id, sort_order }))); onChanged() }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo cambiar el orden") }
    finally { setSaving(false) }
  }

  const activeCount = categories.filter((category) => category.active).length
  const excursionCount = (category: Category) => (usage.get(category.name_es) ?? 0) + (usage.get(String(category.id)) ?? 0)
  const assignedCount = categories.filter((category) => excursionCount(category) > 0).length

  return <div className="space-y-5">
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumen de categorías">
      <Summary label="Total" value={categories.length} detail="En el catálogo" />
      <Summary label="Activas" value={activeCount} detail="Disponibles al crear excursiones" />
      <Summary label="Con excursiones" value={assignedCount} detail="Vinculadas a experiencias" />
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div><h2 className="font-semibold text-slate-900">Organizar categorías</h2><p className="mt-1 text-sm text-slate-500">Asigna las excursiones a grupos claros y controla el orden en la web.</p></div>
        <Button type="button" onClick={openCreate} className="h-11 rounded-lg bg-teal-800 text-white hover:bg-teal-900"><Plus className="mr-2 h-4 w-4" />Nueva categoría</Button>
      </div>
      <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[minmax(0,1fr)_200px] sm:p-5">
        <label className="relative"><span className="sr-only">Buscar categoría</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o descripción" className={`${controlClass} pl-9`} /></label>
        <label><span className="sr-only">Filtrar categorías por estado</span><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="all">Todos los estados</option><option value="active">Activas</option><option value="inactive">Inactivas</option></select></label>
      </div>
      {visible.length === 0 ? <div className="px-6 py-12 text-center"><Tags className="mx-auto h-8 w-8 text-slate-400" /><h3 className="mt-3 font-semibold text-slate-900">{categories.length ? "No hay categorías para este filtro" : "Aún no hay categorías"}</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{categories.length ? "Prueba otra búsqueda o cambia el estado." : "Crea una categoría para organizar tus excursiones; después podrás asignarla desde el formulario."}</p></div> : <div className="divide-y divide-slate-100">{visible.map((category) => {
        const count = excursionCount(category)
        const orderedIndex = categories.slice().sort((a, b) => a.sort_order - b.sort_order || a.name_es.localeCompare(b.name_es, "es")).findIndex((item) => item.id === category.id)
        return <article key={category.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-start gap-3"><span aria-hidden="true" className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold" style={{ color: category.color, backgroundColor: `${category.color}18` }}>{category.icon || category.name_es.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{category.name_es}</h3><Badge variant="outline" className={category.active ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-100 text-slate-700"}>{category.active ? "Activa" : "Inactiva"}</Badge></div><p className="mt-0.5 text-sm text-slate-600">{category.name_en}</p><p className="mt-1 text-xs text-slate-500">{count} {count === 1 ? "excursión asignada" : "excursiones asignadas"}{category.description_es ? ` · ${category.description_es}` : ""}</p></div></div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end"><div className="flex gap-1"><Button type="button" variant="outline" size="icon" aria-label={`Subir ${category.name_es}`} disabled={saving || orderedIndex === 0} onClick={() => void moveCategory(category, -1)} className="h-10 w-10"><ArrowUp className="h-4 w-4" /></Button><Button type="button" variant="outline" size="icon" aria-label={`Bajar ${category.name_es}`} disabled={saving || orderedIndex === categories.length - 1} onClick={() => void moveCategory(category, 1)} className="h-10 w-10"><ArrowDown className="h-4 w-4" /></Button></div><Button type="button" variant="outline" className="h-10" disabled={saving} onClick={() => void changeStatus(category, !category.active)}>{category.active ? "Desactivar" : "Activar"}</Button><Button type="button" variant="outline" className="h-10" onClick={() => openEdit(category)}><Edit className="mr-2 h-4 w-4" />Editar</Button><Button type="button" variant="ghost" className="h-10 text-red-700 hover:bg-red-50 hover:text-red-800" disabled={saving || count > 0} title={count > 0 ? "Reasigna las excursiones antes de eliminar" : undefined} onClick={() => setDeleteTarget(category)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</Button></div>
        </article>
      })}</div>}
    </section>
    <p className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950">Las categorías con excursiones no se pueden eliminar. Puedes desactivarlas sin perder su asignación; al renombrarlas, las excursiones vinculadas se actualizan en el mismo cambio.</p>

    <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-xl"><DialogHeader><DialogTitle>{editing ? "Editar categoría" : "Nueva categoría"}</DialogTitle><DialogDescription>Usa un nombre breve y fácil de entender. Edita el contenido en español e inglés; el campo legado de alemán se rellenará con el inglés para mantener la compatibilidad interna.</DialogDescription></DialogHeader><form onSubmit={saveCategory} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Nombre en español" required><Input className={controlClass} required minLength={2} maxLength={100} value={draft.name_es} onChange={(event) => setDraft({ ...draft, name_es: event.target.value })} /></Field><Field label="Name in English" required><Input className={controlClass} required minLength={2} maxLength={100} value={draft.name_en} onChange={(event) => setDraft({ ...draft, name_en: event.target.value })} /></Field></div>
      <div className="grid gap-4 sm:grid-cols-[1fr_160px]"><Field label="Descripción en español"><Textarea maxLength={1000} rows={3} value={draft.description_es} onChange={(event) => setDraft({ ...draft, description_es: event.target.value })} /></Field><Field label="Color"><div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-2"><input aria-label="Seleccionar color" type="color" value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} className="h-8 w-10 cursor-pointer border-0 bg-transparent" /><span className="text-sm text-slate-600">{draft.color}</span></div></Field></div>
      <div className="grid gap-4 sm:grid-cols-[1fr_160px]"><Field label="Description in English"><Textarea maxLength={1000} rows={3} value={draft.description_en} onChange={(event) => setDraft({ ...draft, description_en: event.target.value })} /></Field><Field label="Icono o símbolo (opcional)"><Input className={controlClass} maxLength={32} value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })} placeholder="Ej. 🌋" /></Field></div>
      <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"><span><span className="block text-sm font-medium text-slate-800">Categoría activa</span><span className="block text-xs text-slate-500">Aparecerá como opción al crear excursiones.</span></span><Switch checked={draft.active} onCheckedChange={(active) => setDraft({ ...draft, active })} aria-label="Categoría activa" /></label>
      <DialogFooter className="gap-2"><Button type="button" variant="outline" className="h-11" onClick={() => setFormOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving || draft.name_es.trim().length < 2 || draft.name_en.trim().length < 2} className="h-11 bg-teal-800 hover:bg-teal-900">{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear categoría"}</Button></DialogFooter>
    </form></DialogContent></Dialog>

    <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar esta categoría?</AlertDialogTitle><AlertDialogDescription>Se eliminará “{deleteTarget?.name_es}”. No podrás hacerlo si todavía tiene excursiones asignadas; en ese caso, desactívala.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel><AlertDialogAction disabled={saving} onClick={(event) => { event.preventDefault(); void confirmDelete() }} className="bg-red-700 hover:bg-red-800">{saving ? "Eliminando…" : "Eliminar categoría"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
}

function Summary({ label, value, detail }: { label: string; value: number; detail: string }) { return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></article> }
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700">{label}{required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}<span className="mt-1.5 block">{children}</span></label> }
