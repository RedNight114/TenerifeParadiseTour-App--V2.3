"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AdminAccess() {
  return (
    <Button asChild variant="outline" className="fixed bottom-6 right-6 z-40 shadow-lg">
      <Link href="/login">Acceso de administración</Link>
    </Button>
  )
}
