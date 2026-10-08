"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  updateOrganizationMembership,
  updateOrganizationMembershipStatus,
} from "@/lib/organization-actions"

type OrganizationMember = {
  id: string
  user_id: string
  email: string
  role: string
  status: string
  created_at: string
}

const roleLabels: Record<string, string> = {
  owner: "Propietario",
  admin: "Administrador",
  catalog_manager: "Gestor de catálogo",
  booking_manager: "Gestor de reservas",
  guide: "Guía",
}

export function OrganizationMembersPanel({
  members: initialMembers,
  actorUserId,
  actorRole,
}: {
  members: OrganizationMember[]
  actorUserId: string
  actorRole: string
}) {
  const [members, setMembers] = useState(initialMembers)
  const [email, setEmail] = useState("")
  const [inviteRole, setInviteRole] = useState(actorRole === "owner" ? "catalog_manager" : "catalog_manager")
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    startTransition(async () => {
      const response = await fetch("/api/admin/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole }),
      })
      const result = await response.json() as { success?: boolean; message?: string; error?: string }
      setMessage(result.message ?? result.error ?? "No se pudo completar la invitación.")
      if (response.ok) {
        setEmail("")
        router.refresh()
      }
    })
  }

  function changeRole(member: OrganizationMember, role: string) {
    startTransition(async () => {
      const result = await updateOrganizationMembership(member.id, role)
      setMessage(result.message ?? result.error ?? "No se pudo cambiar el rol.")
      if (result.success) setMembers((current) => current.map((item) => item.id === member.id ? { ...item, role } : item))
      else router.refresh()
    })
  }

  function changeStatus(member: OrganizationMember, status: "active" | "suspended") {
    startTransition(async () => {
      const result = await updateOrganizationMembershipStatus(member.id, status)
      setMessage(result.message ?? result.error ?? "No se pudo cambiar el acceso.")
      if (result.success) setMembers((current) => current.map((item) => item.id === member.id ? { ...item, status } : item))
      else router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleInvite} className="grid gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_15rem_auto] md:items-end">
        <div className="space-y-2">
          <label htmlFor="member-email" className="text-sm font-medium">Correo electrónico</label>
          <input id="member-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" placeholder="persona@empresa.com" />
        </div>
        <div className="space-y-2">
          <label htmlFor="member-role" className="text-sm font-medium">Rol inicial</label>
          <select id="member-role" value={inviteRole} onChange={(event) => setInviteRole(event.target.value)} className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
            {actorRole === "owner" && <option value="owner">Propietario</option>}
            <option value="admin">Administrador</option>
            <option value="catalog_manager">Gestor de catálogo</option>
            <option value="booking_manager">Gestor de reservas</option>
            <option value="guide">Guía</option>
          </select>
        </div>
        <Button type="submit" disabled={pending}>{pending ? "Enviando…" : "Invitar miembro"}</Button>
        {message && <p role="status" className="text-sm text-gray-700 md:col-span-3">{message}</p>}
      </form>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold">Miembros de esta empresa</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {members.map((member) => {
            const isSelf = member.user_id === actorUserId
            const isOwner = member.role === "owner"
            const mayManage = !isSelf && (!isOwner || actorRole === "owner")
            return (
              <div key={member.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_13rem_10rem_auto] md:items-center">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{member.email}</p>
                  <p className="text-xs text-gray-500">{isSelf ? "Tu cuenta" : `Miembro desde ${new Date(member.created_at).toLocaleDateString()}`}</p>
                </div>
                <div>
                  {mayManage ? (
                    <select aria-label={`Rol de ${member.email}`} value={member.role} disabled={pending} onChange={(event) => changeRole(member, event.target.value)} className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-sm">
                      {actorRole === "owner" && <option value="owner">Propietario</option>}
                      <option value="admin">Administrador</option>
                      <option value="catalog_manager">Gestor de catálogo</option>
                      <option value="booking_manager">Gestor de reservas</option>
                      <option value="guide">Guía</option>
                    </select>
                  ) : <span className="text-sm text-gray-700">{roleLabels[member.role] ?? member.role}</span>}
                </div>
                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${member.status === "active" ? "bg-green-50 text-green-700" : member.status === "invited" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                  {member.status === "active" ? "Activo" : member.status === "invited" ? "Pendiente" : "Suspendido"}
                </span>
                {mayManage && member.status !== "invited" && (
                  <Button variant="outline" size="sm" disabled={pending} onClick={() => changeStatus(member, member.status === "active" ? "suspended" : "active")}>
                    {member.status === "active" ? "Suspender" : "Reactivar"}
                  </Button>
                )}
              </div>
            )
          })}
          {members.length === 0 && <p className="p-6 text-sm text-gray-600">Todavía no hay miembros asociados a esta empresa.</p>}
        </div>
      </section>
      <p className="text-sm text-gray-500">La empresa debe conservar al menos un propietario activo. Los dominios y el alta de nuevas empresas se gestionan desde la administración de plataforma.</p>
    </div>
  )
}
