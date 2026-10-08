"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"

type Workspace = {
  organization_id: string
  organization_status: string
  membership_status: string
}

async function requireUser() {
  const client = await createServerSupabaseClient()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) redirect("/login")
  return { client, user: data.user }
}

export async function chooseOrganizationWorkspace(formData: FormData) {
  const organizationId = String(formData.get("organization_id") ?? "")
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId)) redirect("/workspace?error=invalid")

  const { client } = await requireUser()
  const { data, error } = await client.rpc("get_my_organization_workspaces")
  const workspace = ((data ?? []) as Workspace[]).find((item) => item.organization_id === organizationId)
  if (error || !workspace || workspace.membership_status !== "active" || !["pending", "active"].includes(workspace.organization_status)) {
    redirect("/workspace?error=unauthorized")
  }

  const cookieStore = await cookies()
  cookieStore.set("qa_active_organization", organizationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  redirect("/admin")
}

export async function acceptWorkspaceInvitation(formData: FormData) {
  const organizationId = String(formData.get("organization_id") ?? "")
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId)) redirect("/workspace?error=invalid")

  const { client } = await requireUser()
  const { data, error } = await client.rpc("accept_organization_invitation", { target_organization_id: organizationId })
  if (error || data !== 1) redirect("/workspace?error=invitation")

  const cookieStore = await cookies()
  cookieStore.set("qa_active_organization", organizationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  redirect("/admin")
}
