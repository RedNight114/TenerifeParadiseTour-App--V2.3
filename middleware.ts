import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.set("x-tenant-host", request.nextUrl.hostname.toLowerCase())
  const selectedOrganization = request.cookies.get("qa_active_organization")?.value
  if (pathname.startsWith("/admin") && selectedOrganization) {
    forwardedHeaders.set("x-admin-organization-id", selectedOrganization)
  } else {
    forwardedHeaders.delete("x-admin-organization-id")
  }
  let response = NextResponse.next({ request: { headers: forwardedHeaders } })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    const loginUrl = new URL("/login?error=auth-not-configured", request.url)
    return NextResponse.redirect(loginUrl)
  }

  const supabase = createServerClient(url, key, {
    global: { headers: Object.fromEntries([...forwardedHeaders.entries()].filter(([name]) => name === "x-tenant-host" || name === "x-admin-organization-id")) },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        forwardedHeaders.set("cookie", request.cookies.toString())
        response = NextResponse.next({ request: { headers: forwardedHeaders } })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (request.nextUrl.pathname.startsWith("/platform")) {
    const { data: platformAdmin } = await supabase
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle()
    if (!platformAdmin) return NextResponse.redirect(new URL("/login?error=not-platform-admin", request.url))
    return response
  }

  if (pathname.startsWith("/workspace")) return response

  const centralHostname = (() => {
    try {
      if (process.env.NEXT_PUBLIC_APP_URL) return new URL(process.env.NEXT_PUBLIC_APP_URL).hostname.toLowerCase()
      return process.env.NODE_ENV === "development" ? "localhost" : ""
    } catch {
      return "localhost"
    }
  })()
  if (pathname.startsWith("/admin") && !selectedOrganization && request.nextUrl.hostname.toLowerCase() === centralHostname) {
    return NextResponse.redirect(new URL("/workspace", request.url))
  }

  const { data: organizationId, error: organizationError } = await supabase.rpc("current_public_organization_id")
  const { data: membership, error: membershipError } = organizationId
    ? await supabase
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", data.user.id)
    .eq("status", "active")
    .maybeSingle()
    : { data: null, error: organizationError }

  if (membershipError || !membership) {
    return NextResponse.redirect(new URL("/login?error=not-authorized", request.url))
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*", "/platform/:path*", "/workspace/:path*"],
}
