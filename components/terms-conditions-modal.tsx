"use client"

import { Printer, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/language-context"
import { usePublicSitePage } from "@/lib/public-site-content"
import { getText, getTextList } from "@/lib/site-content"

export function TermsConditionsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language } = useLanguage()
  const { content, published } = usePublicSitePage("terms")
  const english = language === "en"
  const sections = getTextList(content, "sections")
  const title = getText(content, "title", english ? "Booking terms and conditions" : "Términos y condiciones de reserva")
  const intro = getText(content, "intro")

  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className="max-h-[88dvh] max-w-2xl overflow-y-auto rounded-2xl border-slate-200 p-0">
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-5 py-5 backdrop-blur sm:px-7">
        <DialogHeader className="pr-8 text-left">
          <span className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800"><Scale className="h-4 w-4" />{english ? "Company information" : "Información de la empresa"}</span>
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">{title}</DialogTitle>
          <DialogDescription>{english ? "Review the terms published by the company before booking." : "Consulta las condiciones publicadas por la empresa antes de reservar."}</DialogDescription>
        </DialogHeader>
      </div>
      <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
        {!published ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{english ? "The company has not published its booking terms yet. Please contact the company before booking." : "La empresa todavía no ha publicado sus condiciones de reserva. Contacta con ella antes de reservar."}</p> : <>{intro && <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{intro}</p>}{sections.map((section, index) => <section key={`${getText(section, "title")}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"><h3 className="font-semibold text-slate-900">{getText(section, "title")}</h3><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{getText(section, "body")}</p></section>)}{!sections.length && !intro && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{english ? "The company has not published its booking terms yet. Please contact the company before booking." : "La empresa todavía no ha publicado sus condiciones de reserva. Contacta con ella antes de reservar."}</p>}<div className="flex justify-end border-t border-slate-100 pt-4"><Button type="button" variant="outline" onClick={() => window.print()} className="rounded-lg"><Printer className="mr-2 h-4 w-4" />{english ? "Print" : "Imprimir"}</Button></div></>}
      </div>
    </DialogContent>
  </Dialog>
}
