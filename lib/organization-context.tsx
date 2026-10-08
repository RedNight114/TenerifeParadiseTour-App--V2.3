"use client"

import { createContext, useContext, type ReactNode } from "react"

export interface OrganizationBrand {
  id: string
  slug: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  default_locale: string
  support_email: string | null
  phone: string | null
  address: Record<string, string>
  primary_domain?: string | null
}

const OrganizationContext = createContext<OrganizationBrand | null>(null)

export function OrganizationProvider({ organization, children }: { organization: OrganizationBrand | null; children: ReactNode }) {
  return <OrganizationContext.Provider value={organization}>{children}</OrganizationContext.Provider>
}

export function useOrganization() {
  return useContext(OrganizationContext)
}
