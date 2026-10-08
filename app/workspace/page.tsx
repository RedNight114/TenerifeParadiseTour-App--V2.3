import Image from "next/image"
import { redirect } from "next/navigation"
import { ArrowRight, Building2, Clock3, ShieldCheck } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { acceptWorkspaceInvitation, chooseOrganizationWorkspace } from "@/lib/workspace-actions"

type Workspace = {
  organization_id: string
  organization_name: string
  organization_slug: string
  organization_logo_url: string | null
  organization_status: "pending" | "active" | "suspended"
  member_role: string
  membership_status: "active" | "invited" | "suspended"
}

const roleNames: Record<string, string> = {
  owner: "Propietario",
  admin: "Administrador",
  catalog_manager: "Gestor de catálogo",
  booking_manager: "Gestor de reservas",
  guide: "Operaciones",
}

export default async function WorkspacePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: auth, error: authError } = await supabase.auth.getUser()
  if (authError || !auth.user) redirect("/login")

  const [{ data, error }, params] = await Promise.all([
    supabase.rpc("get_my_organization_workspaces"),
    searchParams,
  ])
  const workspaces = (data ?? []) as Workspace[]
  const message = params.error === "invitation"
    ? "No se pudo aceptar la invitación. Puede haber caducado o no pertenecer a esta cuenta."
    : params.error === "unauthorized"
      ? "Tu cuenta no tiene acceso activo a esa empresa."
      : params.error
        ? "No se pudo completar la selección. Vuelve a intentarlo."
        : ""

  return (
    <main className="min-h-dvh bg-[#f5f8f7] px-4 py-12 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={44} height={44} className="h-11 w-11 rounded-xl" />
          <div><p className="text-sm font-semibold text-slate-950">QuickAgency Go</p><p className="text-xs text-slate-500">Espacio de trabajo</p></div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Acceso de empresa</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Elige tu espacio de trabajo</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Has iniciado sesión como <span className="font-medium text-slate-800">{auth.user.email}</span>. Solo aparecen empresas vinculadas a tu cuenta.</p>

          {message && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</p>}
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">No se pudieron cargar tus empresas. Inténtalo de nuevo o contacta con QuickAgency.</p>}

          <div className="mt-7 space-y-3">
            {workspaces.map((workspace) => {
              const canEnter = workspace.membership_status === "active" && workspace.organization_status !== "suspended"
              const isInvited = workspace.membership_status === "invited" && workspace.organization_status !== "suspended"
              return <article key={workspace.organization_id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                  {workspace.organization_logo_url
                    ? <Image src={workspace.organization_logo_url} alt="" aria-hidden="true" width={44} height={44} unoptimized className="h-11 w-11 rounded-xl border border-slate-100 object-contain" />
                    : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><Building2 className="h-5 w-5" aria-hidden="true" /></span>}
                  <div className="min-w-0"><h2 className="truncate font-semibold text-slate-950">{workspace.organization_name}</h2><p className="mt-1 text-xs text-slate-500">{roleNames[workspace.member_role] ?? workspace.member_role} · {workspace.organization_status === "pending" ? "Configuración inicial" : workspace.organization_status === "suspended" ? "Suspendida" : "Activa"}</p></div>
                </div>
                {canEnter
                  ? <form action={chooseOrganizationWorkspace}><input type="hidden" name="organization_id" value={workspace.organization_id} /><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 text-sm font-semibold text-white hover:bg-teal-900">Abrir panel <ArrowRight className="h-4 w-4" aria-hidden="true" /></button></form>
                  : isInvited
                    ? <form action={acceptWorkspaceInvitation}><input type="hidden" name="organization_id" value={workspace.organization_id} /><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-teal-800 px-4 text-sm font-semibold text-teal-900 hover:bg-teal-50"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Aceptar invitación</button></form>
                    : <span className="inline-flex min-h-10 items-center gap-2 text-sm text-slate-500"><Clock3 className="h-4 w-4" aria-hidden="true" />Acceso no disponible</span>}
              </article>
            })}
            {!error && workspaces.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><Building2 className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" /><h2 className="mt-3 font-semibold text-slate-900">Aún no tienes empresas vinculadas</h2><p className="mt-2 text-sm leading-6 text-slate-600">Pide al propietario de tu empresa que te invite, o revisa el correo de invitación si estás empezando.</p></div>}
          </div>

          <div className="mt-7 border-t border-slate-100 pt-5"><p className="text-xs leading-5 text-slate-500">El acceso se comprueba en el servidor y en la base de datos. No necesitas que el dominio público de la empresa esté conectado para gestionar su configuración.</p></div>
        </div>
      </section>
    </main>
  )
}
