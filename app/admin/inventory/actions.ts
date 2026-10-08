"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireOrganizationRole } from "@/lib/supabase-server"

export type InventoryActionState = { success: boolean; message: string }
const failure = (message: string): InventoryActionState => ({ success: false, message })

export async function createInventoryResourceAction(_previous: InventoryActionState, formData: FormData): Promise<InventoryActionState> {
  const input = z.object({
    typeName: z.string().trim().min(2).max(80),
    unitLabel: z.string().trim().min(1).max(32),
    allocationMode: z.enum(["pool", "asset"]),
    resourceName: z.string().trim().min(2).max(100),
    capacityUnits: z.coerce.number().int().min(1).max(10000),
    maxPartySize: z.union([z.literal(""), z.coerce.number().int().min(1).max(100)]).optional(),
  }).safeParse(Object.fromEntries(formData))
  if (!input.success) return failure("Revisa los campos del recurso; hay valores no válidos.")
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const { error } = await client.rpc("create_inventory_resource", {
    p_type_name: input.data.typeName,
    p_unit_label: input.data.unitLabel,
    p_allocation_mode: input.data.allocationMode,
    p_resource_name: input.data.resourceName,
    p_capacity_units: input.data.capacityUnits,
    p_max_party_size: input.data.maxPartySize === "" ? null : input.data.maxPartySize ?? null,
  })
  if (error) return failure(error.code === "23505" ? "Ya existe un recurso con ese nombre dentro del tipo." : error.message)
  revalidatePath("/admin/inventory")
  return { success: true, message: "Recurso creado. Ya puedes vincularlo a opciones y salidas." }
}

export async function createProductOptionAction(_previous: InventoryActionState, formData: FormData): Promise<InventoryActionState> {
  let requirements: unknown
  try { requirements = JSON.parse(String(formData.get("requirements") ?? "")) } catch { return failure("Añade al menos un requisito de inventario válido.") }
  const input = z.object({
    excursionId: z.coerce.number().int().positive(),
    name: z.string().trim().min(2).max(100),
    pricingMode: z.enum(["per_participant", "per_group", "per_resource"]),
    priceEuros: z.string().regex(/^\d{1,8}(?:[.,]\d{1,2})?$/, "Precio no válido"),
    currencyCode: z.string().regex(/^[A-Z]{3}$/),
    minQuantity: z.coerce.number().int().min(1).max(500),
    maxQuantity: z.coerce.number().int().min(1).max(500),
    minParticipants: z.coerce.number().int().min(1).max(100),
    maxParticipants: z.coerce.number().int().min(1).max(100),
  }).safeParse(Object.fromEntries(formData))
  const parsedRequirements = z.array(z.object({
    resource_type_id: z.string().uuid(),
    demand_basis: z.enum(["sale_units", "participants"]),
    units_per_basis: z.number().int().min(1).max(100),
  })).min(1).max(10).safeParse(requirements)
  if (!input.success || !parsedRequirements.success) return failure("Revisa el precio, los límites y los recursos consumidos por esta opción.")
  const priceMinor = Math.round(Number(input.data.priceEuros.replace(",", ".")) * 100)
  if (!Number.isSafeInteger(priceMinor) || priceMinor < 0 || priceMinor > 2_000_000_000) return failure("El precio máximo permitido es 20.000.000 €.")
  const mode = input.data.pricingMode
  const minQuantity = mode === "per_participant" || mode === "per_group" ? 1 : input.data.minQuantity
  const maxQuantity = mode === "per_participant" ? 500 : mode === "per_group" ? 1 : input.data.maxQuantity
  const minParticipants = mode === "per_participant" ? 1 : input.data.minParticipants
  const maxParticipants = mode === "per_participant" ? 1 : input.data.maxParticipants
  if (maxQuantity < minQuantity || maxParticipants < minParticipants) return failure("El límite máximo debe ser igual o superior al mínimo.")

  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const { error } = await client.rpc("create_product_option_with_requirements", {
    p_excursion_id: input.data.excursionId,
    p_name: input.data.name,
    p_pricing_mode: mode,
    p_unit_price_minor: priceMinor,
    p_currency_code: input.data.currencyCode,
    p_min_quantity: minQuantity,
    p_max_quantity: maxQuantity,
    p_min_participants_per_unit: minParticipants,
    p_max_participants_per_unit: maxParticipants,
    p_requirements: parsedRequirements.data,
  })
  if (error) return failure(error.code === "23505" ? "Ya existe esa regla de consumo para uno de los recursos." : error.message)
  revalidatePath("/admin/inventory")
  revalidatePath("/excursions")
  return { success: true, message: "Opción de venta y reglas de inventario creadas de forma atómica." }
}

export async function createDepartureAction(_previous: InventoryActionState, formData: FormData): Promise<InventoryActionState> {
  let assignments: unknown
  try { assignments = JSON.parse(String(formData.get("resourceAssignments") ?? "")) } catch { return failure("Añade al menos un recurso a la salida.") }
  const input = z.object({
    excursionId: z.coerce.number().int().positive(),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    salesCutoffAt: z.string().datetime({ offset: true }),
    notes: z.string().max(500),
  }).safeParse(Object.fromEntries(formData))
  const parsedAssignments = z.array(z.object({ resource_id: z.string().uuid(), capacity_units: z.number().int().min(1).max(10000) })).min(1).max(50).safeParse(assignments)
  if (!input.success || !parsedAssignments.success) return failure("Revisa las fechas y los recursos asignados a la salida.")
  if (new Date(input.data.endsAt) <= new Date(input.data.startsAt) || new Date(input.data.salesCutoffAt) > new Date(input.data.startsAt)) return failure("La salida debe terminar después de comenzar y el cierre de ventas no puede ser posterior al inicio.")
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const { error } = await client.rpc("create_excursion_departure", {
    p_excursion_id: input.data.excursionId,
    p_starts_at: input.data.startsAt,
    p_ends_at: input.data.endsAt,
    p_sales_cutoff_at: input.data.salesCutoffAt,
    p_notes: input.data.notes,
    p_resource_assignments: parsedAssignments.data,
  })
  if (error) return failure(error.code === "23P01" ? "Uno de los vehículos o activos ya está asignado a una salida que se solapa." : error.message)
  revalidatePath("/admin/inventory")
  revalidatePath("/excursions")
  return { success: true, message: "Salida y asignaciones de inventario creadas." }
}

export async function updateDepartureAction(_previous: InventoryActionState, formData: FormData): Promise<InventoryActionState> {
  let assignments: unknown
  try { assignments = JSON.parse(String(formData.get("resourceAssignments") ?? "")) } catch { return failure("Añade al menos un recurso a la salida.") }
  const input = z.object({
    departureId: z.string().uuid(),
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    salesCutoffAt: z.string().datetime({ offset: true }),
    notes: z.string().max(500),
  }).safeParse(Object.fromEntries(formData))
  const parsedAssignments = z.array(z.object({ resource_id: z.string().uuid(), capacity_units: z.number().int().min(1).max(10000) })).min(1).max(50).safeParse(assignments)
  if (!input.success || !parsedAssignments.success) return failure("Revisa las fechas y los recursos asignados a la salida.")
  if (new Date(input.data.endsAt) <= new Date(input.data.startsAt) || new Date(input.data.salesCutoffAt) > new Date(input.data.startsAt)) return failure("La salida debe terminar después de comenzar y el cierre de ventas no puede ser posterior al inicio.")
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const { error } = await client.rpc("update_excursion_departure", {
    p_departure_id: input.data.departureId,
    p_starts_at: input.data.startsAt,
    p_ends_at: input.data.endsAt,
    p_sales_cutoff_at: input.data.salesCutoffAt,
    p_notes: input.data.notes,
    p_resource_assignments: parsedAssignments.data,
  })
  if (error?.code === "23P01") return failure("El vehículo o activo coincide con otra salida. Cambia el horario o selecciona otro recurso.")
  if (error?.code === "23514" || error?.code === "22023") return failure(error.message)
  if (error) return failure("No se pudo guardar la salida. Comprueba los datos e inténtalo de nuevo.")
  revalidatePath("/admin/inventory")
  revalidatePath("/excursions")
  return { success: true, message: "Cambios guardados. La salida y sus recursos siguen sincronizados." }
}
