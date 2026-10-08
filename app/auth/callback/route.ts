import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const requestedPath = request.nextUrl.searchParams.get("next")
  const invitedOrganizationId = request.nextUrl.searchParams.get("organization_id")
  const destination = requestedPath && !requestedPath.startsWith("//") && (requestedPath === "/account" || requestedPath.startsWith("/account/") || requestedPath.startsWith("/account?") || requestedPath === "/admin" || requestedPath.startsWith("/admin/") || requestedPath === "/workspace")
    ? requestedPath
    : "/admin/manage-excursions"

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=invitation-link-invalid", request.url))
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL("/login?error=invitation-link-expired", request.url))
  }

  if (invitedOrganizationId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(invitedOrganizationId)) {
    const { data: accepted, error: acceptError } = await supabase.rpc("accept_organization_invitation", { target_organization_id: invitedOrganizationId })
    if (acceptError || accepted !== 1) {
      return NextResponse.redirect(new URL("/login?error=invitation-invalid", request.url))
    }
    const response = NextResponse.redirect(new URL(destination, request.url))
    response.cookies.set("qa_active_organization", invitedOrganizationId, { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 })
    return response
  }

  const { data: organizationId } = await supabase.rpc("current_public_organization_id")
  if (organizationId) {
    await supabase.rpc("accept_organization_invitation", { target_organization_id: organizationId })
  }
  return NextResponse.redirect(new URL(destination, request.url))
}
