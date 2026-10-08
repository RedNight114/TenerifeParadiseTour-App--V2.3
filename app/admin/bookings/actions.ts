"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireOrganizationRole } from "@/lib/supabase-server"

const bookingStatusSchema = z.object({
  bookingId: z.number().int().positive(),
  status: z.enum(["confirmed", "cancelled"]),
})

export async function updateBookingStatus(input: { bookingId: number; status: string }) {
  const parsed = bookingStatusSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: "Datos de reserva no válidos." }

  const { client, organizationId } = await requireOrganizationRole(["owner", "admin", "booking_manager"])
  const { data: current, error: currentError } = await client
    .from("bookings")
    .select("status, departure_id")
    .eq("id", parsed.data.bookingId)
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (currentError) return { success: false, error: "No se pudo consultar el estado actual de la reserva." }
  if (!current) return { success: false, error: "No se encontró la reserva en esta empresa." }
  if (current.status === parsed.data.status) return { success: true }

  const allowedNextStatuses: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["cancelled"],
    cancelled: [],
  }
  if (!allowedNextStatuses[current.status]?.includes(parsed.data.status)) {
    return { success: false, error: "Ese cambio de estado no está permitido. Las reservas canceladas no se pueden reabrir." }
  }

  if (parsed.data.status === "confirmed" && current.departure_id) {
    const { error } = await client.rpc("confirm_inventory_booking", { p_booking_id: parsed.data.bookingId })
    if (error) return { success: false, error: "No se pudo confirmar: la reserva puede haber perdido su retención de inventario. Recarga la página y comprueba la disponibilidad." }
    revalidatePath("/admin/bookings")
    return { success: true }
  }

  const { data, error } = await client
    .from("bookings")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.bookingId)
    .eq("organization_id", organizationId)
    .eq("status", current.status)
    .select("id")
    .maybeSingle()

  if (error) return { success: false, error: "No se pudo actualizar la reserva. Inténtalo de nuevo." }
  if (!data) return { success: false, error: "La reserva cambió mientras la actualizabas. Recarga la página y vuelve a intentarlo." }

  revalidatePath("/admin/bookings")
  return { success: true }
}

const externalBookingSchema = z.object({
  departureId: z.string().uuid(),
  customerName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40),
  language: z.enum(["es", "en"]),
  optionId: z.string().uuid(),
  quantity: z.number().int().min(1).max(500),
  participants: z.number().int().min(1).max(100),
  specialRequests: z.string().trim().max(2000),
  channel: z.enum(["phone", "whatsapp", "in_person", "email", "partner", "other"]),
  externalReference: z.string().trim().max(120),
})

export async function createExternalBooking(input: unknown) {
  const parsed = externalBookingSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: "Revisa los datos de la reserva; hay campos no válidos." }

  const { client } = await requireOrganizationRole(["owner", "admin", "booking_manager"])
  const { data, error } = await client.rpc("create_external_inventory_booking", {
    p_departure_id: parsed.data.departureId,
    p_customer_name: parsed.data.customerName,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
    p_language: parsed.data.language,
    p_option_id: parsed.data.optionId,
    p_quantity: parsed.data.quantity,
    p_participants: parsed.data.participants,
    p_special_requests: parsed.data.specialRequests || null,
    p_external_channel: parsed.data.channel,
    p_external_reference: parsed.data.externalReference || null,
  })

  if (error) {
    const message = error.message.toLowerCase()
    const safeMessage = error.code === "23505"
      ? "Ya existe una reserva externa con esa referencia. Comprueba el localizador antes de repetirla."
      : message.includes("disponibilidad") || message.includes("disponible")
      ? "No hay capacidad suficiente o la salida ya no está disponible. Comprueba el inventario."
      : message.includes("opción") || message.includes("cantidad")
        ? "La tarifa o las cantidades no son válidas para esta salida."
        : "No se pudo registrar la reserva externa. Comprueba la salida y vuelve a intentarlo."
    return { success: false, error: safeMessage }
  }

  revalidatePath("/admin/bookings")
  revalidatePath("/admin/inventory")
  return { success: true, reference: (data as { reference?: string } | null)?.reference ?? null }
}
