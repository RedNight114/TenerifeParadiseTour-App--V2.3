import ManageExcursionsManager from "@/components/admin/manage-excursions-manager"
import type { Category, Excursion } from "@/lib/supabase"
import { requireOrganizationRole } from "@/lib/supabase-server"

export default async function ManageExcursionsPage() {
  const { client, organizationId } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const [excursionsResult, categoriesResult] = await Promise.all([
    client.from("excursions")
      .select("id, name_es, name_en, name_de, short_description_es, short_description_en, short_description_de, price, duration, category, image_url, featured, is_published, max_people, created_at")
      .eq("organization_id", organizationId).order("created_at", { ascending: false }),
    client.from("categories")
      .select("id, name_es, name_en, name_de, description_es, description_en, description_de, icon, color, active, sort_order, created_at, updated_at")
      .eq("organization_id", organizationId).order("sort_order", { ascending: true }),
  ])

  return (
    <>
      {(excursionsResult.error || categoriesResult.error) && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">No se pudo cargar todo el catálogo. Recarga la página y comprueba la conexión de la empresa.</div>}
      <ManageExcursionsManager
        initialExcursions={(excursionsResult.data ?? []) as unknown as Excursion[]}
        initialCategories={(categoriesResult.data ?? []) as unknown as Category[]}
      />
    </>
  )
}
