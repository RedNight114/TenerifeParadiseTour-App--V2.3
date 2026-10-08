"use server"

import { requireOrganizationRole } from "@/lib/supabase-server"

export interface ExcursionFormData {
  name_es: string
  name_en: string
  name_de: string
  short_description_es: string
  short_description_en: string
  short_description_de: string
  description_es: string
  description_en: string
  description_de: string
  price: number
  duration: string
  category: string
  image_url: string
  featured: boolean
  is_published?: boolean
  recommended_sale_mode?: "person" | "group" | "vehicle" | "combination"
  included_services?: string[]
  not_included_services?: string[]
  difficulty_level?: string
  start_time?: string
  end_time?: string
  meeting_point?: string
  what_to_bring?: string
  cancellation_policy?: string
  age_restrictions?: string
  available_months?: string[]
  special_notes?: string
  requirements?: string
  faqs?: Array<{
    question_es: string
    question_en: string
    question_de: string
    answer_es: string
    answer_en: string
    answer_de: string
  }>
  max_people?: number
  gallery_images?: string[]
  children_price?: number
  children_age_range?: string
}

export async function createExcursion(formData: Partial<ExcursionFormData>) {
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  try {
    const safeData = {
      ...formData,
      name_es: formData.name_es?.trim() ?? "",
      name_en: formData.name_en?.trim() ?? "",
      name_de: formData.name_de?.trim() || formData.name_en?.trim() || formData.name_es?.trim() || "",
      short_description_es: formData.short_description_es?.trim() ?? "",
      short_description_en: formData.short_description_en?.trim() ?? "",
      short_description_de: formData.short_description_de?.trim() || formData.short_description_en?.trim() || formData.short_description_es?.trim() || "",
      description_es: formData.description_es?.trim() ?? "",
      description_en: formData.description_en?.trim() ?? "",
      description_de: formData.description_de?.trim() || formData.description_en?.trim() || formData.description_es?.trim() || "",
      price: typeof formData.price === "number" && Number.isFinite(formData.price) && formData.price >= 0 ? formData.price : 0,
      duration: formData.duration?.trim() ?? "",
      category: formData.category?.trim() ?? "",
      image_url: formData.image_url?.trim() ?? "",
      featured: formData.featured ?? false,
      is_published: false,
    }
    const { data, error } = await client.from("excursions").insert([safeData]).select().single()

    if (error) {
      console.error("Error creating excursion:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data, message: "Excursión creada exitosamente" }
  } catch (error) {
    console.error("Error creating excursion:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function setExcursionPublished(idValue: number, published: boolean) {
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  if (!Number.isSafeInteger(idValue) || idValue < 1) return { success: false as const, error: "Excursión no válida." }
  if (published) {
    const { data: excursion, error: excursionError } = await client.from("excursions")
      .select("name_es, name_en, short_description_es, short_description_en, description_es, description_en, price, duration, category, image_url")
      .eq("id", idValue).maybeSingle()
    if (excursionError || !excursion) return { success: false as const, error: "No se pudo comprobar la información de la excursión." }
    const missingDetails = !excursion.name_es?.trim() || !excursion.name_en?.trim()
      || !excursion.short_description_es?.trim() || !excursion.short_description_en?.trim()
      || !excursion.description_es?.trim() || !excursion.description_en?.trim()
      || !excursion.price || excursion.price <= 0 || !excursion.duration?.trim()
      || !excursion.category?.trim() || !excursion.image_url?.trim()
    if (missingDetails) return { success: false as const, error: "Completa nombre, resumen, descripción, precio, duración, categoría e imagen antes de publicar." }

    const [{ data: options }, { data: departures }] = await Promise.all([
      client.from("product_options").select("id").eq("excursion_id", idValue).eq("active", true),
      client.from("excursion_departures").select("id").eq("excursion_id", idValue).eq("status", "scheduled").gt("starts_at", new Date().toISOString()).limit(1),
    ])
    if (!options?.length || !departures?.length) return { success: false as const, error: "Antes de publicar, configura al menos una opción de venta y una salida futura en Inventario." }
    const { data: requirements } = await client.from("option_inventory_requirements").select("id").in("option_id", options.map((option) => option.id)).limit(1)
    if (!requirements?.length) return { success: false as const, error: "La opción de venta debe tener recursos de inventario asignados antes de publicar." }
  }
  const { error } = await client.from("excursions").update({ is_published: published }).eq("id", idValue)
  if (error) return { success: false as const, error: "No se pudo cambiar el estado de publicación." }
  return { success: true as const }
}

export async function updateExcursion(id: number, formData: Partial<ExcursionFormData>) {
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  try {
    const editableData = { ...formData }
    delete editableData.is_published
    const { data, error } = await client.from("excursions").update(editableData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating excursion:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data, message: "Excursión actualizada exitosamente" }
  } catch (error) {
    console.error("Error updating excursion:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function saveExcursionDraft(id: number, formData: Partial<ExcursionFormData>) {
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  if (!Number.isSafeInteger(id) || id < 1) return { success: false as const, error: "Excursión no válida." }

  try {
    const draftData = { ...formData, is_published: false }
    const { data, error } = await client.from("excursions").update(draftData).eq("id", id).select().single()
    if (error) {
      console.error("Error saving excursion draft:", error)
      return { success: false as const, error: error.message }
    }
    return { success: true as const, data, message: "Borrador guardado" }
  } catch (error) {
    console.error("Error saving excursion draft:", error)
    return { success: false as const, error: "Error interno del servidor" }
  }
}

export async function deleteExcursion(id: number) {
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  try {
    const { error } = await client.from("excursions").delete().eq("id", id)

    if (error) {
      console.error("Error deleting excursion:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Excursión eliminada exitosamente" }
  } catch (error) {
    console.error("Error deleting excursion:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}
