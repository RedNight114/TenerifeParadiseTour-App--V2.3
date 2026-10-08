"use server"

import { requireOrganizationRole } from "@/lib/supabase-server"
import type { Category } from "@/lib/supabase"

export async function createCategory(category: Omit<Category, "id" | "created_at" | "updated_at">) {
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const { error } = await client.from("categories").insert(category)
  if (error) throw new Error(error.message)
  return true
}

export async function updateCategory(id: number, category: Partial<Category>) {
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const { error } = await client.rpc("update_category_catalog", {
    p_category_id: id,
    p_name_es: category.name_es,
    p_name_en: category.name_en,
    p_name_de: category.name_de || category.name_en,
    p_description_es: category.description_es ?? null,
    p_description_en: category.description_en ?? null,
    p_description_de: category.description_de ?? category.description_en ?? null,
    p_icon: category.icon ?? null,
    p_color: category.color,
    p_active: category.active,
    p_sort_order: category.sort_order,
  })
  if (error) throw new Error(error.message)
  return true
}

export async function deleteCategory(id: number) {
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const { error } = await client.rpc("delete_unused_category", { p_category_id: id })
  if (error) throw new Error(error.message)
  return true
}

export async function toggleCategoryStatus(id: number, active: boolean) {
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  const { error } = await client.from("categories").update({ active }).eq("id", id)
  if (error) throw new Error(error.message)
  return true
}

export async function reorderCategories(categories: { id: number; sort_order: number }[]) {
  const { client } = await requireOrganizationRole(["owner", "admin", "catalog_manager"])
  for (const category of categories) {
    const { error } = await client.from("categories").update({ sort_order: category.sort_order }).eq("id", category.id)
    if (error) throw new Error(error.message)
  }
  return true
}
