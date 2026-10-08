import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured.")
}

const tenantHost = typeof window === "undefined" ? "" : window.location.hostname.toLowerCase()
export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
  global: { headers: tenantHost ? { "x-tenant-host": tenantHost } : {} },
})

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
const cache = new Map<string, { data: unknown; timestamp: number }>()

// Función helper para cache:
function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  cache.delete(key)
  return null
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export interface Excursion {
  id: number
  organization_id?: string
  name_es: string
  name_en: string
  name_de: string
  short_description_es: string
  short_description_en: string
  short_description_de: string
  description_es?: string
  description_en?: string
  description_de?: string
  price: number
  pricing_mode?: "per_participant" | "per_group" | "per_resource"
  duration: string
  category: string
  image_url: string
  featured: boolean
  is_published?: boolean
  recommended_sale_mode?: "person" | "group" | "vehicle" | "combination"
  created_at?: string
  updated_at?: string
  price_max?: number
  rating?: number

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
  organization_id?: string
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

export interface Contact {
  id: number
  organization_id?: string
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
  const cacheKey = "excursions_all"
  const cached = getCachedData<Excursion[]>(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase
    .from("excursions")
    .select(
      "id, name_es, name_en, name_de, short_description_es, short_description_en, short_description_de, price, duration, category, image_url, featured, max_people",
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching excursions:", error)
    return []
  }

  const result = await addExcursionPricingModes((data || []) as Excursion[])
  setCachedData(cacheKey, result)
  return result
}

export async function getFeaturedExcursions(): Promise<Excursion[]> {
  const cacheKey = "excursions_featured"
  const cached = getCachedData<Excursion[]>(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase
    .from("excursions")
    .select(
      "id, name_es, name_en, name_de, short_description_es, short_description_en, short_description_de, price, duration, category, image_url, featured, included_services, not_included_services, max_people",
    )
    .eq("featured", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching featured excursions:", error)
    return []
  }

  const result = await addExcursionPricingModes((data || []) as Excursion[])
  setCachedData(cacheKey, result)
  return result
}

export async function getExcursionById(id: number): Promise<Excursion | null> {
  const { data, error } = await supabase.from("excursions").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching excursion:", error)
    return null
  }

  const [excursion] = await addExcursionPricingModes([data as Excursion])
  return excursion
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

  return addExcursionPricingModes((data || []) as Excursion[])
}

export async function addExcursionPricingModes(excursions: Excursion[]): Promise<Excursion[]> {
  if (excursions.length === 0) return excursions
  const { data, error } = await supabase
    .from("product_options")
    .select("excursion_id, pricing_mode, created_at")
    .eq("active", true)
    .in("excursion_id", excursions.map((excursion) => excursion.id))
    .order("created_at", { ascending: true })
  if (error || !data) return excursions
  const modes = new Map<number, Excursion["pricing_mode"]>()
  for (const option of data as Array<{ excursion_id: number; pricing_mode: Excursion["pricing_mode"] }>) {
    if (!modes.has(option.excursion_id)) modes.set(option.excursion_id, option.pricing_mode)
  }
  return excursions.map((excursion) => ({ ...excursion, pricing_mode: modes.get(excursion.id) }))
}

export function getExcursionPriceLabel(mode: Excursion["pricing_mode"], language: string, fallback: string) {
  if (!mode || mode === "per_participant") return fallback
  const labels: Record<string, Record<"per_group" | "per_resource", string>> = {
    es: { per_group: "por grupo", per_resource: "por unidad" },
    en: { per_group: "per group", per_resource: "per unit" },
    de: { per_group: "pro Gruppe", per_resource: "pro Einheit" },
    fr: { per_group: "par groupe", per_resource: "par unité" },
    ru: { per_group: "за группу", per_resource: "за единицу" },
    zh: { per_group: "按团", per_resource: "按件" },
  }
  return labels[language]?.[mode] ?? labels.es[mode]
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
