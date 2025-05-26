import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Excursion {
  id: number
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
  created_at: string
  updated_at?: string

  // Nuevos campos opcionales
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
  faqs?: FAQ[]
  max_people?: number
  gallery_images?: string[]
  children_price?: number
  children_age_range?: string
}

export interface Category {
  id: number
  name_es: string
  name_en: string
  name_de: string
  description_es?: string
  description_en?: string
  description_de?: string
  icon?: string
  color: string
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface FAQ {
  question_es: string
  question_en: string
  question_de: string
  answer_es: string
  answer_en: string
  answer_de: string
}

export interface PredefinedService {
  id: number
  name_es: string
  name_en: string
  name_de: string
  category: string
  icon?: string
}

export interface Booking {
  id: number
  excursion_id: number
  customer_name: string
  email: string
  phone: string
  preferred_date: string
  number_of_people: number
  special_requests?: string
  language: string
  created_at: string
}

export interface Contact {
  id: number
  name: string
  email: string
  phone?: string
  message: string
  language: string
  created_at: string
}

// Funciones para categorías
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching all categories:", error)
    return []
  }

  return data || []
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching category:", error)
    return null
  }

  return data
}

export async function createCategory(category: Omit<Category, "id" | "created_at" | "updated_at">): Promise<boolean> {
  const { error } = await supabase.from("categories").insert([category])

  if (error) {
    console.error("Error creating category:", error)
    return false
  }

  return true
}

export async function updateCategory(id: number, category: Partial<Category>): Promise<boolean> {
  const { error } = await supabase.from("categories").update(category).eq("id", id)

  if (error) {
    console.error("Error updating category:", error)
    return false
  }

  return true
}

export async function deleteCategory(id: number): Promise<boolean> {
  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    console.error("Error deleting category:", error)
    return false
  }

  return true
}

export async function toggleCategoryStatus(id: number, active: boolean): Promise<boolean> {
  const { error } = await supabase.from("categories").update({ active }).eq("id", id)

  if (error) {
    console.error("Error toggling category status:", error)
    return false
  }

  return true
}

export async function reorderCategories(categories: { id: number; sort_order: number }[]): Promise<boolean> {
  try {
    for (const category of categories) {
      const { error } = await supabase
        .from("categories")
        .update({ sort_order: category.sort_order })
        .eq("id", category.id)

      if (error) throw error
    }
    return true
  } catch (error) {
    console.error("Error reordering categories:", error)
    return false
  }
}

// Funciones para excursiones
export async function getExcursions(): Promise<Excursion[]> {
  const { data, error } = await supabase.from("excursions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching excursions:", error)
    return []
  }

  return data || []
}

export async function getFeaturedExcursions(): Promise<Excursion[]> {
  const { data, error } = await supabase
    .from("excursions")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching featured excursions:", error)
    return []
  }

  return data || []
}

export async function getExcursionById(id: number): Promise<Excursion | null> {
  const { data, error } = await supabase.from("excursions").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching excursion:", error)
    return null
  }

  return data
}

export async function getExcursionsByCategory(category: string): Promise<Excursion[]> {
  const { data, error } = await supabase
    .from("excursions")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching excursions by category:", error)
    return []
  }

  return data || []
}

// Funciones para servicios predefinidos
export async function getIncludedServices(): Promise<PredefinedService[]> {
  const { data, error } = await supabase
    .from("predefined_services")
    .select("*")
    .eq("category", "included")
    .order("name_es")

  if (error) {
    console.error("Error fetching included services:", error)
    return []
  }

  return data || []
}

export async function getNotIncludedServices(): Promise<PredefinedService[]> {
  const { data, error } = await supabase
    .from("predefined_services")
    .select("*")
    .eq("category", "not_included")
    .order("name_es")

  if (error) {
    console.error("Error fetching not included services:", error)
    return []
  }

  return data || []
}

// Funciones para reservas
export async function createBooking(booking: Omit<Booking, "id" | "created_at">): Promise<boolean> {
  const { error } = await supabase.from("bookings").insert([booking])

  if (error) {
    console.error("Error creating booking:", error)
    return false
  }

  return true
}

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      excursions (
        name_es,
        name_en,
        name_de,
        price
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
    return []
  }

  return data || []
}

// Funciones para contactos
export async function createContact(contact: Omit<Contact, "id" | "created_at">): Promise<boolean> {
  const { error } = await supabase.from("contacts").insert([contact])

  if (error) {
    console.error("Error creating contact:", error)
    return false
  }

  return true
}

export async function getContacts(): Promise<Contact[]> {
  const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contacts:", error)
    return []
  }

  return data || []
}
