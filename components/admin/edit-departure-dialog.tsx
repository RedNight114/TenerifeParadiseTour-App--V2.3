"use client"

import { useActionState, useState } from "react"
import { CalendarClock, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateDepartureAction, type InventoryActionState } from "@/app/admin/inventory/actions"

type Resource = { id: string; name: string; capacity_units: number; inventory_resource_types: { name: string } | null }
type Departure = {
  id: string
  starts_at: string
  ends_at: string
  sales_cutoff_at: string
  notes: string | null
  departure_inventory: Array<{ resource_id: string; capacity_units: number; inventory_resources: { name: string } | null }>
}
type Assignment = { resource_id: string; capacity_units: number }

const initialState: InventoryActionState = { success: false, message: "" }
const canaryZone = "Atlantic/Canary"
const inputClass = "h-10 rounded-lg border-slate-200"

export function EditDepartureDialog({ departure, resources, disabled = false }: { departure: Departure; resources: Resource[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(updateDepartureAction, initialState)
  const [assignments, setAssignments] = useState<Assignment[]>(departure.departure_inventory.map((item) => ({ resource_id: item.resource_id, capacity_units: item.capacity_units })))
  const [startsAt, setStartsAt] = useState(() => toCanaryInput(departure.starts_at))
  const [endsAt, setEndsAt] = useState(() => toCanaryInput(departure.ends_at))
  const [cutoffAt, setCutoffAt] = useState(() => toCanaryInput(departure.sales_cutoff_at))
  const [dateError, setDateError] = useState("")

  function submit(formData: FormData) {
    const initialStarts = toCanaryInput(departure.starts_at)
    const initialEnds = toCanaryInput(departure.ends_at)
    const initialCutoff = toCanaryInput(departure.sales_cutoff_at)
    const startsIso = startsAt === initialStarts ? departure.starts_at : fromCanaryInput(startsAt)
    const endsIso = endsAt === initialEnds ? departure.ends_at : fromCanaryInput(endsAt)
    const cutoffIso = cutoffAt === initialCutoff ? departure.sales_cutoff_at : fromCanaryInput(cutoffAt)
    if (!startsIso || !endsIso || !cutoffIso) {
      setDateError("Una de las horas locales no existe por el cambio horario. Elige otra hora.")
      return
    }
    setDateError("")
    formData.set("departureId", departure.id)
    formData.set("startsAt", startsIso)
    formData.set("endsAt", endsIso)
    formData.set("salesCutoffAt", cutoffIso)
    formData.set("resourceAssignments", JSON.stringify(assignments))
    action(formData)
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button type="button" variant="outline" size="sm" disabled={disabled} className="h-10 rounded-lg"><CalendarClock className="mr-2 h-4 w-4" />Editar salida</Button></DialogTrigger>
    <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Editar salida</DialogTitle>
        <DialogDescription>Actualiza horario, cierre de ventas, notas y recursos asignados. Los cambios se guardan juntos o no se aplican.</DialogDescription>
      </DialogHeader>
      <form action={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Inicio · hora de Canarias" id={`edit-start-${departure.id}`}><Input id={`edit-start-${departure.id}`} type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className={inputClass} /></Field>
        <Field label="Fin · hora de Canarias" id={`edit-end-${departure.id}`}><Input id={`edit-end-${departure.id}`} type="datetime-local" required value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className={inputClass} /></Field>
        <Field label="Cierre de ventas · hora de Canarias" id={`edit-cutoff-${departure.id}`}><Input id={`edit-cutoff-${departure.id}`} type="datetime-local" required value={cutoffAt} onChange={(event) => setCutoffAt(event.target.value)} className={inputClass} /></Field>
        <Field label="Notas internas" id={`edit-notes-${departure.id}`}><Input id={`edit-notes-${departure.id}`} name="notes" maxLength={500} defaultValue={departure.notes ?? ""} placeholder="Punto de encuentro, turno…" className={inputClass} /></Field>

        <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4 sm:col-span-2">
          <legend className="px-1 text-sm font-semibold text-slate-900">Recursos y capacidad de esta salida</legend>
          {assignments.map((assignment, index) => {
            const resource = resources.find((item) => item.id === assignment.resource_id)
            return <div key={`${assignment.resource_id}-${index}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_auto] sm:items-end">
              <Field label="Recurso" id={`edit-resource-${departure.id}-${index}`}>
                <select id={`edit-resource-${departure.id}-${index}`} value={assignment.resource_id} onChange={(event) => {
                  const selected = resources.find((item) => item.id === event.target.value)
                  setAssignments((current) => current.map((row, rowIndex) => rowIndex === index ? { resource_id: event.target.value, capacity_units: selected?.capacity_units ?? 1 } : row))
                }} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
                  {resources.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.inventory_resource_types?.name ?? "Recurso"}</option>)}
                </select>
              </Field>
              <Field label="Unidades" id={`edit-capacity-${departure.id}-${index}`}><Input id={`edit-capacity-${departure.id}-${index}`} type="number" min={1} max={resource?.capacity_units ?? 10000} value={assignment.capacity_units} onChange={(event) => setAssignments((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, capacity_units: Number(event.target.value) || 1 } : row))} className={inputClass} /></Field>
              <Button type="button" variant="ghost" size="icon" aria-label="Quitar recurso" disabled={assignments.length <= 1 || pending} onClick={() => setAssignments((current) => current.filter((_, rowIndex) => rowIndex !== index))} className="h-10 w-10 text-slate-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
            </div>
          })}
          <Button type="button" variant="outline" size="sm" disabled={assignments.length >= 50 || resources.length <= assignments.length || pending} onClick={() => {
            const unused = resources.find((resource) => !assignments.some((assignment) => assignment.resource_id === resource.id))
            if (unused) setAssignments((current) => [...current, { resource_id: unused.id, capacity_units: unused.capacity_units }])
          }} className="min-h-10 rounded-lg"><Plus className="mr-1.5 h-4 w-4" />Añadir recurso</Button>
        </fieldset>

        <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900 sm:col-span-2">Si hay reservas pendientes o confirmadas, el horario queda bloqueado. No se puede retirar un recurso que tenga historial de asignaciones ni reducir la capacidad ocupada. Los vehículos y equipos no pueden solaparse.</p>
        {(dateError || state.message) && <p role={state.success ? "status" : "alert"} className={`rounded-lg px-3 py-2 text-sm sm:col-span-2 ${state.success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{dateError || state.message}</p>}
        <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="h-11 rounded-lg" disabled={pending} onClick={() => setOpen(false)}>Cerrar</Button>
          <Button type="submit" disabled={pending || assignments.length === 0 || !startsAt || !endsAt || !cutoffAt} className="h-11 rounded-lg bg-teal-800 hover:bg-teal-900">{pending ? "Validando cambios…" : "Guardar cambios"}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label htmlFor={id} className="text-sm text-slate-700">{label}</Label>{children}</div>
}

function toCanaryInput(value: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: canaryZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value))
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ""
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`
}

function fromCanaryInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day, hour, minute] = match
  const wallTime = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))
  const offsetAt = (timestamp: number) => {
    const text = new Intl.DateTimeFormat("en-US", { timeZone: canaryZone, timeZoneName: "shortOffset" }).formatToParts(new Date(timestamp)).find((part) => part.type === "timeZoneName")?.value ?? "GMT"
    const offset = /^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/.exec(text)
    if (!offset || !offset[1]) return 0
    const minutes = Number(offset[2]) * 60 + Number(offset[3] ?? 0)
    return (offset[1] === "+" ? 1 : -1) * minutes
  }
  let timestamp = wallTime
  for (let pass = 0; pass < 3; pass++) timestamp = wallTime - offsetAt(timestamp) * 60_000
  const check = toCanaryInput(new Date(timestamp).toISOString())
  return check === value ? new Date(timestamp).toISOString() : null
}
