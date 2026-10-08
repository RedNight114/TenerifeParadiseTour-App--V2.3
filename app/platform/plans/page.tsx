import { PlatformPlansManager } from "@/components/admin/platform-plans-manager"
import { requirePlatformAdmin } from "@/lib/supabase-server"

export default async function PlatformPlansPage() {
  const { client } = await requirePlatformAdmin()
  const { data } = await client.from("platform_plans").select("id, code, name, active, max_excursions, max_members").order("name")
  return <div className="space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">QuickAgency</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Planes y límites</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Define límites operativos manuales. La facturación de suscripciones sigue fuera del MVP; archivar un plan no lo elimina ni afecta a empresas ya asignadas.</p></header><PlatformPlansManager plans={(data ?? []) as never} /></div>
}
