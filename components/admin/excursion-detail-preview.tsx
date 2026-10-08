"use client"

import { Monitor, Smartphone } from "lucide-react"
import { useState } from "react"
import type { Excursion } from "@/lib/supabase"
import { ExcursionDetailExperience } from "@/components/excursion-detail-experience"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ExcursionDetailPreview({ excursion }: { excursion: Excursion }) {
  const [open, setOpen] = useState(false)
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop")

  return <>
    <Button type="button" variant="outline" onClick={() => setOpen(true)} className="min-h-11 gap-2 border-teal-200 text-teal-900 hover:bg-teal-50"><Monitor className="h-4 w-4" aria-hidden="true" />Vista previa de página completa</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex h-[96dvh] w-[calc(100vw-1rem)] max-w-[1440px] flex-col gap-3 overflow-hidden p-3 sm:w-[calc(100vw-2rem)] sm:p-5">
        <DialogHeader className="shrink-0 pr-10 text-left"><DialogTitle>Previsualización del detalle</DialogTitle><DialogDescription>Vista en tiempo real. No se guarda ni activa la excursión.</DialogDescription></DialogHeader>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 pb-3"><span className="text-xs text-slate-500">Se actualiza mientras editas el formulario</span><div className="flex gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label="Tamaño de previsualización"><Button type="button" size="sm" variant={viewport === "desktop" ? "default" : "ghost"} aria-pressed={viewport === "desktop"} onClick={() => setViewport("desktop")} className="min-h-10 gap-1.5"><Monitor className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Escritorio</span></Button><Button type="button" size="sm" variant={viewport === "mobile" ? "default" : "ghost"} aria-pressed={viewport === "mobile"} onClick={() => setViewport("mobile")} className="min-h-10 gap-1.5"><Smartphone className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Móvil</span></Button></div></div>
        <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-slate-100 p-2 sm:p-4" aria-label="Vista previa desplazable"><div className={`mx-auto min-h-full overflow-hidden bg-white shadow-sm ${viewport === "mobile" ? "max-w-[390px] rounded-[2rem] border-[6px] border-slate-800" : "w-full rounded-xl"}`}><ExcursionDetailExperience excursion={excursion} preview /></div></div>
      </DialogContent>
    </Dialog>
  </>
}
