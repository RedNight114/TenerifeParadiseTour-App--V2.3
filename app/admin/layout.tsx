import type { ReactNode } from "react"
import type { Metadata } from "next"
import { requireOrganizationAccess } from "@/lib/supabase-server"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata: Metadata = {
  title: { default: "Panel de empresa | QuickAgency Go", template: "%s | QuickAgency Go" },
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { membership } = await requireOrganizationAccess()
  const organization = membership.organizations as { name?: string; logo_url?: string | null } | { name?: string; logo_url?: string | null }[] | null
  const organizationName = Array.isArray(organization) ? organization[0]?.name : organization?.name
  const organizationLogoUrl = Array.isArray(organization) ? organization[0]?.logo_url : organization?.logo_url

  return <AdminShell role={membership.role} organizationName={organizationName ?? "Tu empresa"} organizationLogoUrl={organizationLogoUrl ?? null}>{children}</AdminShell>
}
