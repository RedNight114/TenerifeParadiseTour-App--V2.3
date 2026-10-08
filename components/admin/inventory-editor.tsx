"use client"

import { useActionState, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { CalendarPlus, ChevronDown, PackagePlus, Plus, Trash2, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createDepartureAction, createInventoryResourceAction, createProductOptionAction, type InventoryActionState } from "@/app/admin/inventory/actions"

type ResourceType = { id: string; name: string; unit_label: string; allocation_mode: "pool" | "asset" }
type Resource = { id: string; name: string; capacity_units: number; inventory_resource_types: { name: string } | null }
type Excursion = { id: number; name_es: string; is_published: boolean }
type Requirement = { resource_type_id: string; demand_basis: "sale_units" | "participants"; units_per_basis: number }
type Assignment = { resource_id: string; capacity_units: number }

const initialState: InventoryActionState = { success: false, message: "" }
const inputClass = "h-10 rounded-lg border-slate-200"

export function InventoryEditor({ resourceTypes, resources, excursions }: { resourceTypes: ResourceType[]; resources: Resource[]; excursions: Excursion[] }) {
  return <section className="space-y-3" aria-label="Configuración de inventario">
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><PackagePlus className="h-5 w-5" aria-hidden="true" /></span><span><span className="block font-semibold text-slate-900">Crear recurso</span><span className="mt-0.5 block text-sm text-slate-500">Define un stock compartido o un activo asignable.</span></span></span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6"><ResourceForm /></div>
    </details>

    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><Wrench className="h-5 w-5" aria-hidden="true" /></span><span><span className="block font-semibold text-slate-900">Crear opción de venta</span><span className="mt-0.5 block text-sm text-slate-500">Configura precio, límites de grupo y recursos consumidos.</span></span></span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6"><OptionForm resourceTypes={resourceTypes} excursions={excursions} /></div>
    </details>

    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-800"><CalendarPlus className="h-5 w-5" aria-hidden="true" /></span><span><span className="block font-semibold text-slate-900">Programar salida</span><span className="mt-0.5 block text-sm text-slate-500">Asigna fecha y unidades disponibles; los solapes se rechazan.</span></span></span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6"><DepartureForm resources={resources} excursions={excursions} /></div>
    </details>
  </section>
}

function ResourceForm() {
  const [state, action, pending] = useActionState(createInventoryResourceAction, initialState)
  return <form action={action} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <Field label="Tipo de recurso" id="resource-type-name"><Input id="resource-type-name" name="typeName" required minLength={2} maxLength={80} placeholder="Vehículos 4x4" className={inputClass} /></Field>
    <Field label="Etiqueta de unidad" id="resource-unit"><Input id="resource-unit" name="unitLabel" required maxLength={32} placeholder="vehículo" className={inputClass} /></Field>
    <Field label="Modo de capacidad" id="resource-mode"><select id="resource-mode" name="allocationMode" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="asset">Activo asignable (vehículo, kayak, equipo)</option><option value="pool">Stock compartido (plazas, guías, material)</option></select></Field>
    <Field label="Nombre de este recurso" id="resource-name"><Input id="resource-name" name="resourceName" required minLength={2} maxLength={100} placeholder="4x4 Anaga 03" className={inputClass} /></Field>
    <Field label="Capacidad total" id="resource-capacity"><Input id="resource-capacity" name="capacityUnits" type="number" required min={1} max={10000} defaultValue={1} className={inputClass} /><span className="text-xs text-slate-500">Un activo exclusivo suele tener capacidad 1; usa asientos/unidades para stock agregado.</span></Field>
    <Field label="Máximo de personas por unidad (opcional)" id="resource-max-party"><Input id="resource-max-party" name="maxPartySize" type="number" min={1} max={100} placeholder="4" className={inputClass} /></Field>
    <ActionFeedback state={state} />
    <div className="md:col-span-2 xl:col-span-3"><Button type="submit" disabled={pending} className="h-10 rounded-lg bg-teal-800 hover:bg-teal-900">{pending ? "Guardando…" : "Crear recurso"}</Button></div>
  </form>
}

function OptionForm({ resourceTypes, excursions }: { resourceTypes: ResourceType[]; excursions: Excursion[] }) {
  const [state, action, pending] = useActionState(createProductOptionAction, initialState)
  const [mode, setMode] = useState("per_participant")
  const [requirements, setRequirements] = useState<Requirement[]>([{ resource_type_id: resourceTypes[0]?.id ?? "", demand_basis: "participants", units_per_basis: 1 }])
  useEffect(() => { if (state.success) setRequirements([{ resource_type_id: resourceTypes[0]?.id ?? "", demand_basis: "participants", units_per_basis: 1 }]) }, [state.success, resourceTypes])
  const submit = (formData: FormData) => { formData.set("requirements", JSON.stringify(requirements)); return action(formData) }
  return (
    <form action={submit} className="grid gap-4 md:grid-cols-2">
    <Field label="Excursión" id="option-excursion"><select id="option-excursion" name="excursionId" required className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="">Seleccionar excursión</option>{excursions.map((excursion) => <option key={excursion.id} value={excursion.id}>{excursion.name_es}{excursion.is_published ? " · publicada" : " · borrador"}</option>)}</select></Field>
    <Field label="Nombre visible de la opción" id="option-name"><Input id="option-name" name="name" required maxLength={100} placeholder="Adulto, grupo privado, vehículo…" className={inputClass} /></Field>
    <Field label="Forma de cobro" id="option-pricing-mode"><select id="option-pricing-mode" name="pricingMode" value={mode} onChange={(event) => setMode(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="per_participant">Por participante</option><option value="per_group">Por grupo</option><option value="per_resource">Por recurso / unidad</option></select></Field>
    <div className="grid grid-cols-[1fr_120px] gap-3"><Field label="Precio" id="option-price"><Input id="option-price" name="priceEuros" type="number" required min="0" max="20000000" step="0.01" placeholder="62,00" className={inputClass} /></Field><Field label="Moneda" id="option-currency"><select id="option-currency" name="currencyCode" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"><option>EUR</option><option>GBP</option><option>USD</option></select></Field></div>
    {mode === "per_resource" && <div className="grid grid-cols-2 gap-3"><Field label="Unidades mín." id="option-min-quantity"><Input id="option-min-quantity" name="minQuantity" type="number" required min={1} max={500} defaultValue={1} className={inputClass} /></Field><Field label="Unidades máx." id="option-max-quantity"><Input id="option-max-quantity" name="maxQuantity" type="number" required min={1} max={500} defaultValue={1} className={inputClass} /></Field></div>}
    {mode !== "per_participant" && <div className="grid grid-cols-2 gap-3"><Field label="Personas por unidad mín." id="option-min-people"><Input id="option-min-people" name="minParticipants" type="number" required min={1} max={100} defaultValue={mode === "per_group" ? 2 : 1} className={inputClass} /></Field><Field label="Personas por unidad máx." id="option-max-people"><Input id="option-max-people" name="maxParticipants" type="number" required min={1} max={100} defaultValue={mode === "per_group" ? 8 : 4} className={inputClass} /></Field></div>}
    {mode === "per_participant" && <><input type="hidden" name="minQuantity" value="1" /><input type="hidden" name="maxQuantity" value="500" /><input type="hidden" name="minParticipants" value="1" /><input type="hidden" name="maxParticipants" value="1" /></>}
    {mode === "per_group" && <><input type="hidden" name="minQuantity" value="1" /><input type="hidden" name="maxQuantity" value="1" /></>}
      <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4 md:col-span-2">
        <legend className="px-1 text-sm font-semibold text-slate-900">Recursos que consume cada reserva</legend>
        {resourceTypes.length === 0 ? (
          <p className="text-sm text-amber-800">Crea primero los tipos de recurso que necesita esta opción.</p>
        ) : (
          <div className="space-y-3">
            {requirements.map((requirement, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px_110px_auto] sm:items-end">
                <Field label="Recurso" id={`requirement-resource-${index}`}>
                  <select id={`requirement-resource-${index}`} value={requirement.resource_type_id} onChange={(event) => updateRequirement(setRequirements, index, { resource_type_id: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
                    {resourceTypes.map((type) => <option key={type.id} value={type.id}>{type.name} ({type.unit_label})</option>)}
                  </select>
                </Field>
                <Field label="Demanda por" id={`requirement-basis-${index}`}>
                  <select id={`requirement-basis-${index}`} value={requirement.demand_basis} onChange={(event) => updateRequirement(setRequirements, index, { demand_basis: event.target.value as Requirement["demand_basis"] })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
                    <option value="sale_units">Unidad vendida</option><option value="participants">Participante</option>
                  </select>
                </Field>
                <Field label="Unidades" id={`requirement-units-${index}`}>
                  <Input id={`requirement-units-${index}`} type="number" min={1} max={100} value={requirement.units_per_basis} onChange={(event) => updateRequirement(setRequirements, index, { units_per_basis: Number(event.target.value) || 1 })} className={inputClass} />
                </Field>
                <Button type="button" variant="ghost" size="icon" aria-label="Eliminar requisito" disabled={requirements.length <= 1} onClick={() => setRequirements((current) => current.filter((_, row) => row !== index))} className="h-10 w-10 text-slate-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setRequirements((current) => [...current, { resource_type_id: resourceTypes[0].id, demand_basis: "sale_units", units_per_basis: 1 }])} disabled={requirements.length >= 10} className="rounded-lg"><Plus className="mr-1.5 h-4 w-4" />Añadir recurso</Button>
          </div>
        )}
      </fieldset>
      <ActionFeedback state={state} />
      <div className="md:col-span-2"><Button type="submit" disabled={pending || resourceTypes.length === 0} className="h-10 rounded-lg bg-teal-800 hover:bg-teal-900">{pending ? "Validando reglas…" : "Crear opción de venta"}</Button></div>
    </form>
  )
}

function DepartureForm({ resources, excursions }: { resources: Resource[]; excursions: Excursion[] }) {
  const [state, action, pending] = useActionState(createDepartureAction, initialState)
  const [assignments, setAssignments] = useState<Assignment[]>([{ resource_id: resources[0]?.id ?? "", capacity_units: resources[0]?.capacity_units ?? 1 }])
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [cutoffAt, setCutoffAt] = useState("")
  const submit = (formData: FormData) => { formData.set("resourceAssignments", JSON.stringify(assignments)); return action(formData) }
  return (
    <form action={submit} className="grid gap-4 md:grid-cols-2">
    <Field label="Excursión" id="departure-excursion"><select id="departure-excursion" name="excursionId" required className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="">Seleccionar excursión</option>{excursions.map((excursion) => <option key={excursion.id} value={excursion.id}>{excursion.name_es}{excursion.is_published ? " · publicada" : " · borrador"}</option>)}</select></Field>
    <Field label="Notas internas (opcional)" id="departure-notes"><Input id="departure-notes" name="notes" maxLength={500} placeholder="Punto de encuentro, turno…" className={inputClass} /></Field>
    <Field label="Inicio" id="departure-start-local"><Input id="departure-start-local" type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className={inputClass} /><input type="hidden" name="startsAt" value={toIso(startsAt)} /></Field>
    <Field label="Fin" id="departure-end-local"><Input id="departure-end-local" type="datetime-local" required value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className={inputClass} /><input type="hidden" name="endsAt" value={toIso(endsAt)} /></Field>
    <Field label="Cierre de ventas" id="departure-cutoff-local"><Input id="departure-cutoff-local" type="datetime-local" required value={cutoffAt} onChange={(event) => setCutoffAt(event.target.value)} className={inputClass} /><input type="hidden" name="salesCutoffAt" value={toIso(cutoffAt)} /><span className="text-xs text-slate-500">Hora local del navegador, convertida a zona horaria explícita.</span></Field>
      <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4 md:col-span-2">
        <legend className="px-1 text-sm font-semibold text-slate-900">Recursos asignados a esta salida</legend>
        {resources.length === 0 ? (
          <p className="text-sm text-amber-800">Crea recursos antes de programar una salida.</p>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_auto] sm:items-end">
                <Field label="Recurso" id={`assignment-resource-${index}`}>
                  <select id={`assignment-resource-${index}`} value={assignment.resource_id} onChange={(event) => { const resource = resources.find((item) => item.id === event.target.value); updateAssignment(setAssignments, index, { resource_id: event.target.value, capacity_units: resource?.capacity_units ?? 1 }) }} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
                    {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name} · {resource.capacity_units} ({resource.inventory_resource_types?.name})</option>)}
                  </select>
                </Field>
                <Field label="Capacidad para esta salida" id={`assignment-capacity-${index}`}>
                  <Input id={`assignment-capacity-${index}`} type="number" min={1} max={resources.find((resource) => resource.id === assignment.resource_id)?.capacity_units ?? 10000} value={assignment.capacity_units} onChange={(event) => updateAssignment(setAssignments, index, { capacity_units: Number(event.target.value) || 1 })} className={inputClass} />
                </Field>
                <Button type="button" variant="ghost" size="icon" aria-label="Quitar recurso" disabled={assignments.length <= 1} onClick={() => setAssignments((current) => current.filter((_, row) => row !== index))} className="h-10 w-10 text-slate-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setAssignments((current) => [...current, { resource_id: resources[0].id, capacity_units: resources[0].capacity_units }])} disabled={assignments.length >= 50} className="rounded-lg"><Plus className="mr-1.5 h-4 w-4" />Añadir recurso</Button>
          </div>
        )}
      </fieldset>
      <ActionFeedback state={state} />
      <div className="md:col-span-2"><Button type="submit" disabled={pending || resources.length === 0 || !startsAt || !endsAt || !cutoffAt} className="h-10 rounded-lg bg-teal-800 hover:bg-teal-900">{pending ? "Comprobando asignaciones…" : "Programar salida"}</Button></div>
    </form>
  )
}

function updateRequirement(setter: Dispatch<SetStateAction<Requirement[]>>, index: number, values: Partial<Requirement>) {
  setter((current) => current.map((item, row) => row === index ? { ...item, ...values } : item))
}

function updateAssignment(setter: Dispatch<SetStateAction<Assignment[]>>, index: number, values: Partial<Assignment>) {
  setter((current) => current.map((item, row) => row === index ? { ...item, ...values } : item))
}

function toIso(value: string) {
  if (!value) return ""
  const parsed = new Date(value)
  return Number.isNaN(parsed.valueOf()) ? "" : parsed.toISOString()
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label htmlFor={id} className="text-sm text-slate-700">{label}</Label>{children}</div>
}

function ActionFeedback({ state }: { state: InventoryActionState }) {
  if (!state.message) return null
  return <p role={state.success ? "status" : "alert"} className={`rounded-lg px-3 py-2 text-sm md:col-span-2 ${state.success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{state.message}</p>
}
