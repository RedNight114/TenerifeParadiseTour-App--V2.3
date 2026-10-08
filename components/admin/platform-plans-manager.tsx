"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPlatformPlan, updatePlatformPlan } from "@/lib/platform-actions"

type Plan = { id: string; code: string; name: string; active: boolean; max_excursions: number | null; max_members: number | null }

export function PlatformPlansManager({ plans }: { plans: Plan[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [draft, setDraft] = useState({ code: "", name: "", maxExcursions: "", maxMembers: "" })
  const [edits, setEdits] = useState<Record<string, { name: string; maxExcursions: string; maxMembers: string; active: boolean }>>(() => Object.fromEntries(plans.map((plan) => [plan.id, { name: plan.name, maxExcursions: plan.max_excursions?.toString() ?? "", maxMembers: plan.max_members?.toString() ?? "", active: plan.active }])))
  function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => { const result = await createPlatformPlan(draft); setMessage(result.success ? "Plan creado." : result.error); if (result.success) { setDraft({ code: "", name: "", maxExcursions: "", maxMembers: "" }); router.refresh() } })
  }
  function save(id: string) {
    const input = edits[id]
    if (!input) return
    startTransition(async () => { const result = await updatePlatformPlan({ id, ...input }); setMessage(result.success ? "Plan actualizado." : result.error); if (result.success) router.refresh() })
  }
  return <div className="space-y-6">
    <form onSubmit={create} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-[0.7fr_1fr_0.8fr_0.8fr_auto] xl:items-end">
      <div><label className="text-sm font-medium" htmlFor="new-plan-code">Código</label><Input id="new-plan-code" required value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="starter" /></div>
      <div><label className="text-sm font-medium" htmlFor="new-plan-name">Nombre</label><Input id="new-plan-name" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Inicial" /></div>
      <div><label className="text-sm font-medium" htmlFor="new-plan-excursions">Máx. excursiones</label><Input id="new-plan-excursions" type="number" min="0" value={draft.maxExcursions} onChange={(e) => setDraft({ ...draft, maxExcursions: e.target.value })} placeholder="Ilimitado" /></div>
      <div><label className="text-sm font-medium" htmlFor="new-plan-members">Máx. miembros</label><Input id="new-plan-members" type="number" min="1" value={draft.maxMembers} onChange={(e) => setDraft({ ...draft, maxMembers: e.target.value })} placeholder="Ilimitado" /></div>
      <Button disabled={pending} className="bg-teal-800 text-white hover:bg-teal-900">Crear plan</Button>
      {message && <p className="text-sm text-slate-600 sm:col-span-2 xl:col-span-5" role="status">{message}</p>}
    </form>
    <div className="grid gap-4 lg:grid-cols-2">{plans.map((plan) => {
      const edit = edits[plan.id] ?? { name: plan.name, maxExcursions: plan.max_excursions?.toString() ?? "", maxMembers: plan.max_members?.toString() ?? "", active: plan.active }
      return <article key={plan.id} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="flex items-center justify-between"><div><h2 className="font-semibold">{plan.name}</h2><p className="font-mono text-xs text-slate-500">{plan.code}</p></div><span className={`rounded-full px-3 py-1 text-xs ${edit.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{edit.active ? "Disponible" : "Archivado"}</span></header>
        <label className="block space-y-1 text-sm">Nombre<Input value={edit.name} onChange={(e) => setEdits({ ...edits, [plan.id]: { ...edit, name: e.target.value } })} /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-sm">Máx. excursiones (vacío = sin límite)<Input type="number" min="0" value={edit.maxExcursions} onChange={(e) => setEdits({ ...edits, [plan.id]: { ...edit, maxExcursions: e.target.value } })} /></label><label className="space-y-1 text-sm">Máx. miembros (vacío = sin límite)<Input type="number" min="1" value={edit.maxMembers} onChange={(e) => setEdits({ ...edits, [plan.id]: { ...edit, maxMembers: e.target.value } })} /></label></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.active} onChange={(e) => setEdits({ ...edits, [plan.id]: { ...edit, active: e.target.checked } })} />Disponible para nuevas asignaciones</label>
        <Button variant="outline" disabled={pending} onClick={() => save(plan.id)}>Guardar plan</Button>
      </article>
    })}{!plans.length && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 lg:col-span-2">Aún no hay planes.</p>}</div>
  </div>
}
