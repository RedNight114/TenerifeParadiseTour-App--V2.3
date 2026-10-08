import { requireOrganizationRole } from "@/lib/supabase-server"
import { OrganizationSettingsForm } from "@/components/admin/organization-settings-form"

export default async function OrganizationSettingsPage() {
  const { client, organizationId } = await requireOrganizationRole(["owner", "admin"])
  const { data: organization, error } = await client
    .from("organizations")
    .select("id, slug, name, legal_name, support_email, phone, address, logo_url, primary_color, secondary_color, default_locale, currency_code, timezone")
    .eq("id", organizationId)
    .single()

  if (error || !organization) {
    return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">No se pudo cargar el perfil de la empresa. Comprueba tu conexión e inténtalo de nuevo.</div>
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Configuración</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Marca y empresa</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Identidad visual, contacto y preferencias operativas. La portada, textos, preguntas frecuentes y contenido legal se gestionan en “Contenido del sitio”.</p>
      </header>
      <OrganizationSettingsForm organization={organization} />
    </div>
  )
}
