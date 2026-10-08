import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Supabase is not configured. Set the public URL and anon key.")
  }

  const cookieStore = await cookies()
  const requestHeaders = await headers()
  const requestHost = (
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    ""
  ).split(":")[0].toLowerCase()
  const adminOrganizationId = requestHeaders.get("x-admin-organization-id")
  const scopedHeaders: Record<string, string> = {}
  if (requestHost) scopedHeaders["x-tenant-host"] = requestHost
  if (adminOrganizationId) {
    scopedHeaders["x-admin-organization-id"] = adminOrganizationId
  }

  return createServerClient(url, key, {
    global: { headers: scopedHeaders },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server components cannot write cookies; middleware refreshes the session.
        }
      },
    },
  })
}

export type OrganizationRole = "owner" | "admin" | "catalog_manager" | "booking_manager" | "guide"

export async function requireOrganizationAccess(allowedRoles?: OrganizationRole[]) {
  const client = await createServerSupabaseClient()
  const { data, error } = await client.auth.getUser()

  if (error || !data.user) {
    redirect("/login?error=authentication-required")
  }

  const { data: organizationId, error: organizationError } = await client.rpc("current_public_organization_id")

  if (organizationError || !organizationId) {
    redirect("/admin/workspace")
  }

  const { data: membership, error: membershipError } = await client
    .from("organization_memberships")
    .select("organization_id, role, organizations(id, slug, name, logo_url)")
    .eq("organization_id", organizationId)
    .eq("user_id", data.user.id)
    .eq("status", "active")
    .maybeSingle()

  if (membershipError || !membership) {
    redirect("/login?error=not-authorized")
  }

  if (allowedRoles && !allowedRoles.includes(membership.role as OrganizationRole)) {
    redirect("/login?error=insufficient-role")
  }

  return { client, user: data.user, organizationId, membership }
}

export async function requireAdmin() {
  return requireOrganizationAccess()
}

export async function requireOrganizationRole(allowedRoles: OrganizationRole[]) {
  return requireOrganizationAccess(allowedRoles)
}

export async function requirePlatformAdmin() {
  const client = await createServerSupabaseClient()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) redirect("/login?error=authentication-required")
  const { data: platformAdmin, error: adminError } = await client.from("platform_admins")
    .select("user_id").eq("user_id", data.user.id).maybeSingle()
  if (adminError || !platformAdmin) redirect("/login?error=not-platform-admin")
  return { client, user: data.user }
}
