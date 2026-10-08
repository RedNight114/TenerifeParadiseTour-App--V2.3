"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireOrganizationRole } from "@/lib/supabase-server"

const settingsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  legal_name: z.string().trim().max(160),
  support_email: z.union([z.literal(""), z.string().trim().email().max(254)]),
  phone: z.string().trim().max(40),
  street: z.string().trim().max(160),
  postal_code: z.string().trim().max(20),
  city: z.string().trim().max(100),
  region: z.string().trim().max(100),
  country: z.string().trim().max(100),
  logo_url: z.union([z.literal(""), z.string().trim().url().max(2048)]),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  default_locale: z.enum(["es", "en"]),
  currency_code: z.enum(["EUR", "GBP", "USD"]),
  timezone: z.string().trim().min(1).max(80),
})

function readForm(formData: FormData) {
  return settingsSchema.safeParse(Object.fromEntries(formData.entries()))
}

export async function updateOrganizationSettings(formData: FormData) {
  const { client, organizationId } = await requireOrganizationRole(["owner", "admin"])
  const parsed = readForm(formData)
  if (!parsed.success) return { success: false, error: "Revisa los campos del formulario; hay valores inválidos." }

  const { street, postal_code, city, region, country, ...fields } = parsed.data
  const { error } = await client
    .from("organizations")
    .update({
      ...fields,
      support_email: fields.support_email || null,
      logo_url: fields.logo_url || null,
      address: { street, postal_code, city, region, country },
    })
    .eq("id", organizationId)

  if (error) {
    console.error("Organization settings update failed:", error.code)
    return { success: false, error: "No se pudieron guardar los cambios." }
  }

  revalidatePath("/")
  revalidatePath("/admin/organization")
  return { success: true, message: "Cambios guardados." }
}

const roleSchema = z.enum(["owner", "admin", "catalog_manager", "booking_manager", "guide"])

export async function updateOrganizationMembership(membershipId: string, nextRole: string) {
  const { client, organizationId, membership: actor } = await requireOrganizationRole(["owner", "admin"])
  const parsedRole = roleSchema.safeParse(nextRole)
  if (!parsedRole.success || (parsedRole.data === "owner" && actor.role !== "owner")) {
    return { success: false, error: "No tienes permiso para asignar ese rol." }
  }

  const { data: target } = await client
    .from("organization_memberships")
    .select("role")
    .eq("id", membershipId)
    .eq("organization_id", organizationId)
    .maybeSingle()
  if (!target || (target.role === "owner" && actor.role !== "owner")) {
    return { success: false, error: "Solo un propietario puede modificar el rol de otro propietario." }
  }

  const { error } = await client
    .from("organization_memberships")
    .update({ role: parsedRole.data })
    .eq("id", membershipId)
    .eq("organization_id", organizationId)
  if (error) {
    console.error("Membership role update failed:", error.code)
    return { success: false, error: "No se pudo actualizar el rol. La empresa debe conservar un propietario activo." }
  }

  revalidatePath("/admin/members")
  return { success: true, message: "Rol actualizado." }
}

export async function updateOrganizationMembershipStatus(membershipId: string, status: "active" | "suspended") {
  const { client, organizationId, user, membership: actor } = await requireOrganizationRole(["owner", "admin"])
  const { data: target } = await client
    .from("organization_memberships")
    .select("user_id, role")
    .eq("id", membershipId)
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (!target || target.user_id === user.id || (target.role === "owner" && actor.role !== "owner")) {
    return { success: false, error: "No tienes permiso para cambiar este miembro." }
  }

  const { error } = await client
    .from("organization_memberships")
    .update({ status })
    .eq("id", membershipId)
    .eq("organization_id", organizationId)
  if (error) {
    console.error("Membership status update failed:", error.code)
    return { success: false, error: "No se pudo actualizar el acceso." }
  }

  revalidatePath("/admin/members")
  return { success: true, message: status === "active" ? "Acceso activado." : "Acceso suspendido." }
}
