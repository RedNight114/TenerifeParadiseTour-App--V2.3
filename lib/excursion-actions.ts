"use server"

import { supabase, supabaseAdmin } from "./supabase"

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

export async function createExcursion(formData: ExcursionFormData) {
  try {
    // Use admin client if available, otherwise fall back to regular client
    const client = supabaseAdmin || supabase

    if (!supabaseAdmin) {
      console.warn("Using regular Supabase client. Admin operations may fail due to RLS policies.")
    }

    const { data, error } = await client.from("excursions").insert([formData]).select().single()

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

export async function updateExcursion(id: number, formData: Partial<ExcursionFormData>) {
  try {
    // Use admin client if available, otherwise fall back to regular client
    const client = supabaseAdmin || supabase

    const { data, error } = await client.from("excursions").update(formData).eq("id", id).select().single()

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

export async function deleteExcursion(id: number) {
  try {
    // Use admin client if available, otherwise fall back to regular client
    const client = supabaseAdmin || supabase

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
