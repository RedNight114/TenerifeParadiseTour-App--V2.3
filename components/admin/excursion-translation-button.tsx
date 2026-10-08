"use client"

import { useState } from "react"
import { Languages, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { translateExcursionText } from "@/lib/translation-actions"

type Language = "es" | "en"

interface ExcursionTranslationButtonProps {
  source: Language
  target: Language
  sourceText: string
  targetText: string
  onTranslated: (text: string) => void
}

export function ExcursionTranslationButton({ source, target, sourceText, targetText, onTranslated }: ExcursionTranslationButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false)
  const sourceLabel = source === "es" ? "ES" : "EN"
  const targetLabel = target === "es" ? "ES" : "EN"

  const translate = async () => {
    if (!sourceText.trim()) {
      toast.error(`Añade primero el texto en ${sourceLabel}.`)
      return
    }

    if (targetText.trim() && !window.confirm(`La traducción sustituirá el texto actual en ${targetLabel}. ¿Quieres continuar?`)) return

    setIsTranslating(true)
    try {
      const result = await translateExcursionText(sourceText, source, target)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      onTranslated(result.text)
      toast.success(`Texto traducido a ${target === "es" ? "español" : "inglés"}. Revísalo antes de guardar.`)
    } catch {
      toast.error("No se pudo traducir el texto. Inténtalo de nuevo más tarde.")
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="mt-2 space-y-1">
      <Button type="button" variant="outline" size="sm" onClick={translate} disabled={isTranslating || !sourceText.trim()} className="min-h-9 gap-2 text-xs">
        {isTranslating ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Languages className="h-3.5 w-3.5" aria-hidden="true" />}
        {isTranslating ? "Traduciendo…" : `Traducir ${sourceLabel} → ${targetLabel}`}
      </Button>
      <p className="text-[11px] leading-4 text-slate-500">Gratuita y procesada por un servicio externo; sujeta a límites y disponibilidad. Revisa el resultado antes de guardarlo.</p>
    </div>
  )
}
