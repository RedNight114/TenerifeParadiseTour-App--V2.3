import type { ReactNode } from "react"
import type { Metadata } from "next"
import { requirePlatformAdmin } from "@/lib/supabase-server"
import { PlatformShell } from "@/components/admin/platform-shell"

export const metadata: Metadata = {
  title: { default: "Control de plataforma | QuickAgency Go", template: "%s | QuickAgency Go" },
  icons: { icon: "/quickagency-go-badge.svg", apple: "/quickagency-go-badge.svg" },
}

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const { user } = await requirePlatformAdmin()
  return <PlatformShell email={user.email ?? "Administrador QuickAgency Go"}>{children}</PlatformShell>
}
