import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: { absolute: "Acceso de empresa | QuickAgency Go" },
  description: "Acceso seguro al panel de gestión de QuickAgency Go.",
  authors: [{ name: "QuickAgency Go" }],
  creator: "QuickAgency Go",
  publisher: "QuickAgency Go",
  icons: { icon: "/quickagency-go-badge.svg", apple: "/quickagency-go-badge.svg" },
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
