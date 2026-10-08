"use server"

import { requireOrganizationRole } from "@/lib/supabase-server"

type Language = "es" | "en"

const CHUNK_SIZE = 450
const MAX_TEXT_LENGTH = 4500

function splitText(text: string): string[] {
  const chunks: string[] = []
  let remaining = text.trim()

  while (remaining.length > CHUNK_SIZE) {
    let boundary = remaining.lastIndexOf("\n", CHUNK_SIZE)
    if (boundary < CHUNK_SIZE * 0.5) boundary = remaining.lastIndexOf(". ", CHUNK_SIZE) + 1
    if (boundary < CHUNK_SIZE * 0.5) boundary = remaining.lastIndexOf(" ", CHUNK_SIZE)
    if (boundary < 1) boundary = CHUNK_SIZE
    chunks.push(remaining.slice(0, boundary).trim())
    remaining = remaining.slice(boundary).trim()
  }

  if (remaining) chunks.push(remaining)
  return chunks
}

export async function translateExcursionText(text: string, source: Language, target: Language) {
  await requireOrganizationRole(["owner", "admin", "catalog_manager"])

  if (!(source === "es" || source === "en") || !(target === "es" || target === "en")) {
    return { success: false as const, error: "El idioma seleccionado no es válido." }
  }
  if (source === target) return { success: false as const, error: "Elige un idioma de destino diferente." }
  if (typeof text !== "string" || !text.trim()) return { success: false as const, error: "Escribe el texto que quieres traducir." }
  if (text.length > MAX_TEXT_LENGTH) return { success: false as const, error: `El texto supera el límite de ${MAX_TEXT_LENGTH.toLocaleString("es-ES")} caracteres para la traducción gratuita.` }

  try {
    const chunks = splitText(text)
    const translations: string[] = []

    for (const chunk of chunks) {
      const url = new URL("https://api.mymemory.translated.net/get")
      url.searchParams.set("q", chunk)
      url.searchParams.set("langpair", `${source}|${target}`)
      const response = await fetch(url, { signal: AbortSignal.timeout(12_000), cache: "no-store" })
      if (!response.ok) throw new Error("El servicio de traducción no está disponible en este momento.")

      const result = (await response.json()) as {
        responseStatus?: number
        responseDetails?: string
        responseData?: { translatedText?: string }
      }
      const translated = result.responseData?.translatedText?.trim()
      if (result.responseStatus !== 200 || !translated) {
        throw new Error(result.responseDetails || "No se pudo traducir el texto. Inténtalo más tarde.")
      }
      translations.push(translated)
    }

    return { success: true as const, text: translations.join(" ") }
  } catch (error) {
    console.error("Excursion translation failed:", error)
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "No se pudo traducir el texto. Inténtalo más tarde.",
    }
  }
}
