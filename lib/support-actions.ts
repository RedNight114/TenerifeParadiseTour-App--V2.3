"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireOrganizationRole, requirePlatformAdmin } from "@/lib/supabase-server"

const bodySchema = z.string().trim().min(1).max(8000)
const supportCategorySchema = z.enum(["bookings", "inventory", "website", "payments", "account", "other"])

export async function createCompanySupportTicket(subjectValue: string, bodyValue: string, categoryValue: string) {
  const { client } = await requireOrganizationRole(["owner", "admin", "booking_manager"])
  const subject = z.string().trim().min(4).max(160).safeParse(subjectValue)
  const body = bodySchema.safeParse(bodyValue)
  const category = supportCategorySchema.safeParse(categoryValue)
  if (!subject.success || !body.success || !category.success) return { success: false as const, error: "Revisa el asunto, el mensaje y la categoría seleccionada." }
  const { data, error } = await client.rpc("create_support_ticket", { p_subject: subject.data, p_body: body.data, p_category: category.data })
  if (error || !data) return { success: false as const, error: "No se pudo crear la solicitud." }
  revalidatePath("/admin/support")
  return { success: true as const, ticketId: data as string }
}

export async function replyCompanySupportTicket(ticketId: string, bodyValue: string) {
  const { client } = await requireOrganizationRole(["owner", "admin", "booking_manager"])
  const id = z.string().uuid().safeParse(ticketId)
  const body = bodySchema.safeParse(bodyValue)
  if (!id.success || !body.success) return { success: false as const, error: "La respuesta no es válida." }
  const { error } = await client.rpc("reply_support_ticket", { p_ticket_id: id.data, p_body: body.data })
  if (error) return { success: false as const, error: "No se pudo enviar la respuesta." }
  revalidatePath("/admin/support")
  return { success: true as const }
}

export async function replyPlatformSupportTicket(ticketId: string, bodyValue: string) {
  const { client } = await requirePlatformAdmin()
  const id = z.string().uuid().safeParse(ticketId)
  const body = bodySchema.safeParse(bodyValue)
  if (!id.success || !body.success) return { success: false as const, error: "La respuesta no es válida." }
  const { error } = await client.rpc("reply_support_ticket", { p_ticket_id: id.data, p_body: body.data })
  if (error) return { success: false as const, error: "No se pudo enviar la respuesta." }
  revalidatePath("/platform/support")
  return { success: true as const }
}

export async function updatePlatformTicketStatus(ticketId: string, status: string) {
  const { client } = await requirePlatformAdmin()
  const id = z.string().uuid().safeParse(ticketId)
  const parsedStatus = z.enum(["open", "in_progress", "waiting_company", "resolved"]).safeParse(status)
  if (!id.success || !parsedStatus.success) return { success: false as const, error: "Estado no válido." }
  const { error } = await client.rpc("update_platform_support_ticket_status", { p_ticket_id: id.data, p_status: parsedStatus.data })
  if (error) return { success: false as const, error: "No se pudo actualizar el estado." }
  revalidatePath("/platform/support")
  return { success: true as const }
}

export async function updatePlatformTicketPriority(ticketId: string, priority: string) {
  const { client } = await requirePlatformAdmin()
  const id = z.string().uuid().safeParse(ticketId)
  const parsedPriority = z.enum(["normal", "high"]).safeParse(priority)
  if (!id.success || !parsedPriority.success) return { success: false, error: "Prioridad no válida." }
  const { error } = await client.rpc("set_platform_support_ticket_priority", { p_ticket_id: id.data, p_priority: parsedPriority.data })
  if (error) return { success: false, error: "No se pudo actualizar la prioridad." }
  revalidatePath("/platform/support")
  return { success: true }
}

export async function createTemporarySupportAccess(organizationId: string, reasonValue: string) {
  const { client } = await requirePlatformAdmin()
  const id = z.string().uuid().safeParse(organizationId)
  const reason = z.string().trim().min(10).max(500).safeParse(reasonValue)
  if (!id.success || !reason.success) return { success: false as const, error: "Indica un motivo de entre 10 y 500 caracteres." }
  const { data, error } = await client.rpc("create_platform_support_access_grant", { p_organization_id: id.data, p_reason: reason.data })
  if (error) return { success: false as const, error: "No se pudo conceder el acceso temporal." }
  revalidatePath("/platform/support")
  return { success: true as const, grantId: data as string }
}

export async function revokeTemporarySupportAccess(grantId: string) {
  const { client } = await requirePlatformAdmin()
  const id = z.string().uuid().safeParse(grantId)
  if (!id.success) return { success: false as const, error: "Acceso no válido." }
  const { error } = await client.rpc("revoke_platform_support_access", { p_grant_id: id.data })
  if (error) return { success: false as const, error: "No se pudo revocar el acceso." }
  revalidatePath("/platform/support")
  return { success: true as const }
}
