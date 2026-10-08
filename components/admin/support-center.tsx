"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { LifeBuoy, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createCompanySupportTicket, replyCompanySupportTicket } from "@/lib/support-actions"

type Ticket = { id: string; subject: string; category: string; status: string; priority: string; created_at: string; last_message_at: string }
type Message = { id: string; ticket_id: string; author_kind: string; body: string; created_at: string }

const statusLabel: Record<string, string> = { open: "Abierto", in_progress: "En curso", waiting_company: "Esperando respuesta", resolved: "Resuelto" }
const categoryLabel: Record<string, string> = { bookings: "Reservas y cobros", inventory: "Inventario y salidas", website: "Web y contenido", payments: "Pagos", account: "Cuenta y equipo", other: "Otro" }

export function SupportCenter({ tickets, messages }: { tickets: Ticket[]; messages: Message[] }) {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState("bookings")
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  function createTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await createCompanySupportTicket(subject, body, category)
      setMessage(result.success ? "Solicitud enviada." : result.error)
      if (result.success) { setSubject(""); setBody(""); setCategory("bookings"); router.refresh() }
    })
  }

  function reply(ticketId: string) {
    startTransition(async () => {
      const result = await replyCompanySupportTicket(ticketId, responses[ticketId] ?? "")
      setMessage(result.success ? "Respuesta enviada." : result.error)
      if (result.success) { setResponses((current) => ({ ...current, [ticketId]: "" })); router.refresh() }
    })
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
    <form onSubmit={createTicket} className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><LifeBuoy className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-950">Nueva solicitud</h2><p className="mt-1 flex items-center gap-1 text-xs text-slate-500">El equipo de <Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={14} height={14} className="h-3.5 w-3.5 rounded-sm" /><span className="font-medium text-slate-700">QuickAgency Go</span> responderá aquí.</p></div></div>
      <label className="block space-y-2 text-sm font-medium" htmlFor="support-category">Tema<select id="support-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal"><option value="bookings">Reservas y cobros</option><option value="inventory">Inventario y salidas</option><option value="website">Web y contenido</option><option value="payments">Pagos</option><option value="account">Cuenta y equipo</option><option value="other">Otro</option></select></label>
      <label className="block space-y-2 text-sm font-medium" htmlFor="support-subject">Asunto<Input id="support-subject" required minLength={4} maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
      <label className="block space-y-2 text-sm font-medium" htmlFor="support-body">¿En qué podemos ayudarte?<Textarea id="support-body" required maxLength={8000} rows={7} value={body} onChange={(event) => setBody(event.target.value)} /></label>
      <p className="text-xs leading-5 text-slate-500">No incluyas contraseñas ni datos completos de tarjetas. Los adjuntos no están disponibles en esta primera versión.</p>
      <Button type="submit" disabled={pending} className="w-full bg-teal-800 text-white hover:bg-teal-900">{pending ? "Enviando…" : "Enviar solicitud"}</Button>
      {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
    </form>

    <section className="space-y-4">
      <div><h2 className="text-lg font-semibold text-slate-950">Tus solicitudes</h2><p className="text-sm text-slate-600">Filas de conversación por tema y estado, con respuestas visibles en el mismo lugar.</p><div className="mt-3 flex flex-wrap gap-2">{Object.entries(statusLabel).map(([status, label]) => <span key={status} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">{label}: {tickets.filter((ticket) => ticket.status === status).length}</span>)}</div></div>
      {tickets.map((ticket) => <article key={ticket.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-5"><div><span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-900">{categoryLabel[ticket.category] ?? "General"}</span><h3 className="mt-2 font-semibold text-slate-950">{ticket.subject}</h3><p className="mt-1 text-xs text-slate-500">Actualizado {new Date(ticket.last_message_at).toLocaleString()}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{statusLabel[ticket.status] ?? ticket.status}</span></header>
        <div className="max-h-72 space-y-3 overflow-y-auto bg-slate-50/70 p-4 sm:px-5">{messages.filter((item) => item.ticket_id === ticket.id).map((item) => <div key={item.id} className={`max-w-[92%] rounded-xl p-3 text-sm leading-6 ${item.author_kind === "company" ? "ml-auto bg-teal-800 text-white" : "border border-slate-200 bg-white text-slate-800"}`}><p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold opacity-75">{item.author_kind === "company" ? "Tu empresa" : <><Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={14} height={14} className="h-3.5 w-3.5 rounded-sm" />QuickAgency Go</>} · {new Date(item.created_at).toLocaleString()}</p><p className="whitespace-pre-wrap">{item.body}</p></div>)}</div>
        {ticket.status !== "resolved" && <div className="flex gap-2 p-4 sm:px-5"><Textarea aria-label={`Responder a ${ticket.subject}`} maxLength={8000} rows={2} value={responses[ticket.id] ?? ""} onChange={(event) => setResponses((current) => ({ ...current, [ticket.id]: event.target.value }))} placeholder="Escribe una respuesta…" /><Button type="button" aria-label="Enviar respuesta" disabled={pending || !responses[ticket.id]?.trim()} onClick={() => reply(ticket.id)} className="self-end bg-teal-800 text-white hover:bg-teal-900"><Send className="h-4 w-4" /></Button></div>}
      </article>)}
      {tickets.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Aún no hay solicitudes de soporte.</div>}
    </section>
  </div>
}
