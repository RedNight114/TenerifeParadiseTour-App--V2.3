import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

const inviteSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  role: z.enum(["owner", "admin", "catalog_manager", "booking_manager", "guide"]),
})

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 })

  const { data: organizationId } = await supabase.rpc("current_public_organization_id")
  if (!organizationId) return NextResponse.json({ error: "Este dominio no está asociado a una empresa." }, { status: 403 })

  const { data: actor } = await supabase
    .from("organization_memberships")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", authData.user.id)
    .eq("status", "active")
    .maybeSingle()
  if (!actor || !["owner", "admin"].includes(actor.role)) {
    return NextResponse.json({ error: "Solo el propietario o un administrador puede invitar miembros." }, { status: 403 })
  }

  const parsed = inviteSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Indica un correo válido y un rol permitido." }, { status: 400 })
  }
  const { email, role } = parsed.data
  if (role === "owner" && actor.role !== "owner") {
    return NextResponse.json({ error: "Solo un propietario puede invitar a otro propietario." }, { status: 403 })
  }

  const { data: currentMembership } = await supabase
    .from("organization_memberships")
    .select("id, status")
    .eq("organization_id", organizationId)
    .eq("email", email)
    .maybeSingle()
  if (currentMembership) {
    return NextResponse.json({ error: "Ya existe una invitación o pertenencia para ese correo." }, { status: 409 })
  }

  const { data: existingAccount, error: existingAccountError } = await supabase.rpc(
    "invite_existing_organization_member",
    { target_organization_id: organizationId, invited_email: email, requested_role: role },
  )
  if (existingAccountError) {
    if (existingAccountError.code === "23505") {
      return NextResponse.json({ error: "Ese usuario ya pertenece a esta empresa." }, { status: 409 })
    }
    console.error("Existing organization member invitation failed:", existingAccountError.code)
    return NextResponse.json({ error: "No se pudo preparar la invitación." }, { status: 500 })
  }
  if (existingAccount) {
    return NextResponse.json({
      success: true,
      existingAccount: true,
      message: "El usuario ya tiene cuenta. Su acceso quedará activo cuando vuelva a iniciar sesión.",
    })
  }

  if (!secretKey) {
    return NextResponse.json({ error: "Falta SUPABASE_SECRET_KEY en el servidor para enviar invitaciones nuevas." }, { status: 503 })
  }

  const adminClient = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const callback = new URL("/auth/callback", request.nextUrl.origin)
  callback.searchParams.set("next", "/admin/members")
  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: callback.toString(),
  })

  if (inviteError || !invited.user) {
    console.error("Supabase invitation failed:", inviteError?.code ?? "missing-user")
    return NextResponse.json({
      error: "No se pudo enviar la invitación. Comprueba el SMTP de Auth y las URL de retorno permitidas en Supabase.",
    }, { status: 502 })
  }

  const { error: membershipError } = await supabase.from("organization_memberships").insert({
    organization_id: organizationId,
    user_id: invited.user.id,
    email,
    role,
    status: "invited",
    invited_by: authData.user.id,
  })

  if (membershipError) {
    await adminClient.auth.admin.deleteUser(invited.user.id)
    console.error("Membership creation after invitation failed:", membershipError.code)
    return NextResponse.json({ error: "No se pudo registrar la pertenencia; la invitación ha sido cancelada." }, { status: 500 })
  }

  return NextResponse.json({ success: true, existingAccount: false, message: "Invitación enviada." }, { status: 201 })
}
