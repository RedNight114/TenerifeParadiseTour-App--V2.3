"use server"

import { resolveTxt } from "node:dns/promises"
import { domainToASCII } from "node:url"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requirePlatformAdmin } from "@/lib/supabase-server"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { inspectVercelDomain, isLocalDomain, type HostingDetails, type HostingStatus } from "@/lib/vercel-domain"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const domainSchema = z.string().trim().transform((value) => domainToASCII(value.toLowerCase()))
  .refine((value) => {
    const labels = value.split(".")
    return value.length <= 253 && labels.length >= 2
      && labels.every((label) => label.length >= 1 && label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))
      && /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(labels[labels.length - 1])
      && !["localhost", "local", "test", "invalid", "internal"].includes(labels[labels.length - 1])
  }, "Introduce un dominio público válido, sin protocolo ni ruta.")
const optionalDomainSchema = z.union([z.literal(""), domainSchema])

export async function createPlatformOrganization(nameValue: string, slugValue: string, domainValue: string) {
  const { client } = await requirePlatformAdmin()
  const name = z.string().trim().min(2).max(120).safeParse(nameValue)
  const slug = z.string().trim().toLowerCase().regex(slugPattern).max(100).safeParse(slugValue)
  const domain = optionalDomainSchema.safeParse(domainValue)
  if (!name.success || !slug.success || !domain.success) return { success: false as const, error: "Revisa el nombre, slug y dominio." }
  const { data, error } = await client.rpc("create_platform_organization", { p_name: name.data, p_slug: slug.data, p_domain: domain.data })
  if (error) return { success: false as const, error: error.code === "23505" ? "El slug o el dominio ya están en uso." : "No se pudo crear la empresa." }
  revalidatePath("/platform")
  revalidatePath("/platform/companies")
  return { success: true as const, organizationId: data as string }
}

export async function createPlatformDomain(organizationIdValue: string, domainValue: string) {
  const { client } = await requirePlatformAdmin()
  const organizationId = z.string().uuid().safeParse(organizationIdValue)
  const domain = domainSchema.safeParse(domainValue)
  if (!organizationId.success || !domain.success) return { success: false as const, error: "Dominio no válido." }
  const { error } = await client.rpc("create_platform_domain", { p_organization_id: organizationId.data, p_domain: domain.data })
  if (error) return { success: false as const, error: error.code === "23505" ? "Ese dominio ya está asociado." : "No se pudo registrar el dominio." }
  revalidatePath("/platform/companies")
  return { success: true as const }
}

async function savePlatformDomainHostingState(client: Awaited<ReturnType<typeof requirePlatformAdmin>>["client"], domainId: string, status: HostingStatus, details: HostingDetails) {
  const { error } = await client.rpc("record_platform_domain_hosting_state", {
    p_domain_id: domainId,
    p_hosting_status: status,
    p_hosting_details: details,
  })
  if (error) throw new Error("No se pudo guardar el estado Vercel. Comprueba que la migración de dominios esté aplicada.")
}

async function inspectPlatformDomain(domainIdValue: string, connectIfMissing: boolean) {
  const { client } = await requirePlatformAdmin()
  const domainId = z.string().uuid().safeParse(domainIdValue)
  if (!domainId.success) return { success: false as const, error: "Dominio no válido." }
  const { data: domain, error } = await client.from("organization_domains")
    .select("host, verification_token, verified_at").eq("id", domainId.data).maybeSingle()
  if (error || !domain) return { success: false as const, error: "No se encontró el dominio." }
  if (isLocalDomain(domain.host)) return { success: false as const, error: "Los dominios locales no necesitan ni admiten conexión con Vercel." }

  let inspection: Awaited<ReturnType<typeof inspectVercelDomain>>
  try {
    inspection = await inspectVercelDomain(domain.host, connectIfMissing)
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "No se pudo comprobar la conexión con Vercel."
    try { await savePlatformDomainHostingState(client, domainId.data, "error", { message }) } catch { /* Keep the actionable hosting error. */ }
    revalidatePath("/platform/domains")
    revalidatePath("/platform/companies")
    return { success: false as const, error: message }
  }

  try {
    await savePlatformDomainHostingState(client, domainId.data, inspection.status, inspection.details)
  } catch (caught) {
    return { success: false as const, error: caught instanceof Error ? caught.message : "No se pudo guardar el estado del dominio." }
  }
  revalidatePath("/platform/domains")
  revalidatePath("/platform/companies")
  return {
    success: true as const,
    status: inspection.status,
    details: inspection.details,
    ownershipTxt: { name: `_quickagency-verification.${domain.host}`, value: domain.verification_token },
    ownershipVerified: Boolean(domain.verified_at),
  }
}

export async function connectPlatformDomainToVercel(domainIdValue: string) {
  return inspectPlatformDomain(domainIdValue, true)
}

export async function checkPlatformDomainOnVercel(domainIdValue: string) {
  return inspectPlatformDomain(domainIdValue, false)
}

export async function verifyPlatformDomain(domainIdValue: string) {
  const { client } = await requirePlatformAdmin()
  const domainId = z.string().uuid().safeParse(domainIdValue)
  if (!domainId.success) return { success: false as const, error: "Dominio no válido." }
  const { data: domain, error: readError } = await client.from("organization_domains")
    .select("host, verification_token, verified_at").eq("id", domainId.data).maybeSingle()
  if (readError || !domain) return { success: false as const, error: "No se encontró el dominio." }
  if (domain.verified_at) return { success: true as const, message: "El dominio ya está verificado." }
  const recordName = `_quickagency-verification.${domain.host}`
  try {
    const records = await resolveTxt(recordName)
    const hasToken = records.some((record) => record.join("").trim() === domain.verification_token)
    if (!hasToken) return { success: false as const, error: `No se encontró el valor TXT esperado en ${recordName}.` }
  } catch {
    return { success: false as const, error: `No se pudo leer el TXT de ${recordName}. Comprueba que ya se haya propagado.` }
  }
  const { error } = await client.rpc("verify_platform_domain", { p_domain_id: domainId.data, p_verification_token: domain.verification_token })
  if (error) return { success: false as const, error: "No se pudo confirmar el dominio." }
  revalidatePath("/platform/companies")
  return { success: true as const, message: "Dominio verificado." }
}

export async function setPlatformPrimaryDomain(domainIdValue: string) {
  const { client } = await requirePlatformAdmin()
  const domainId = z.string().uuid().safeParse(domainIdValue)
  if (!domainId.success) return { success: false as const, error: "Dominio no válido." }
  const { data: domain, error: readError } = await client.from("organization_domains")
    .select("host, verified_at").eq("id", domainId.data).maybeSingle()
  if (readError || !domain) return { success: false as const, error: "No se encontró el dominio." }
  if (!domain.verified_at) return { success: false as const, error: "Verifica primero el registro TXT de propiedad de QuickAgency." }
  if (!isLocalDomain(domain.host)) {
    try {
      const inspection = await inspectVercelDomain(domain.host)
      await savePlatformDomainHostingState(client, domainId.data, inspection.status, inspection.details)
      revalidatePath("/platform/domains")
      revalidatePath("/platform/companies")
      if (inspection.status === "not_connected") return { success: false as const, error: "Conecta primero este dominio al proyecto Vercel compartido y vuelve a comprobarlo." }
      if (inspection.status === "pending_verification") return { success: false as const, error: "Vercel aún no ha verificado el dominio. Añade el registro de verificación indicado y vuelve a comprobarlo." }
      if (inspection.status === "pending_dns") return { success: false as const, error: "Vercel todavía detecta DNS o HTTPS sin configurar. Añade los registros recomendados y comprueba de nuevo." }
      if (inspection.status !== "verified") return { success: false as const, error: "Vercel no confirmó que el dominio esté listo." }
    } catch (caught) {
      return { success: false as const, error: caught instanceof Error ? caught.message : "No se pudo verificar la conexión con Vercel." }
    }
  }
  const { error } = await client.rpc("set_platform_primary_domain", { p_domain_id: domainId.data })
  if (error) return { success: false as const, error: "El dominio debe tener propiedad verificada y conexión Vercel/DNS/HTTPS lista antes de ser principal." }
  revalidatePath("/platform/companies")
  revalidatePath("/platform")
  return { success: true as const }
}

export async function updatePlatformOrganization(organizationIdValue: string, status: string, planIdValue: string, planStatus: string) {
  const { client } = await requirePlatformAdmin()
  const organizationId = z.string().uuid().safeParse(organizationIdValue)
  const parsedStatus = z.enum(["pending", "active", "suspended"]).safeParse(status)
  const parsedPlanStatus = z.enum(["trial", "active", "past_due", "suspended", "cancelled"]).safeParse(planStatus)
  const planId = z.string().uuid().safeParse(planIdValue)
  if (!organizationId.success || !parsedStatus.success || !parsedPlanStatus.success || !planId.success) return { success: false as const, error: "Estado o plan no válido." }
  const { error } = await client.rpc("update_platform_organization", { p_organization_id: organizationId.data, p_status: parsedStatus.data, p_plan_id: planId.data, p_plan_status: parsedPlanStatus.data })
  if (error) return { success: false as const, error: "No se pudo actualizar la empresa." }
  revalidatePath("/platform")
  revalidatePath("/platform/companies")
  return { success: true as const }
}

export async function createPlatformPlan(input: { code: string; name: string; maxExcursions: string; maxMembers: string }) {
  const { client } = await requirePlatformAdmin()
  const parsed = z.object({ code: z.string().trim().toLowerCase().regex(slugPattern).max(80), name: z.string().trim().min(2).max(100), maxExcursions: z.string(), maxMembers: z.string() }).safeParse(input)
  if (!parsed.success) return { success: false as const, error: "Revisa el código y el nombre del plan." }
  const toLimit = (value: string) => value.trim() ? Number(value) : null
  const maxExcursions = toLimit(parsed.data.maxExcursions)
  const maxMembers = toLimit(parsed.data.maxMembers)
  if ((maxExcursions !== null && (!Number.isInteger(maxExcursions) || maxExcursions < 0)) || (maxMembers !== null && (!Number.isInteger(maxMembers) || maxMembers < 1))) return { success: false as const, error: "Los límites deben ser enteros positivos o estar vacíos para ilimitado." }
  const { error } = await client.rpc("create_platform_plan", { p_code: parsed.data.code, p_name: parsed.data.name, p_max_excursions: maxExcursions, p_max_members: maxMembers, p_features: {} })
  if (error) return { success: false as const, error: error.code === "23505" ? "Ese código de plan ya existe." : "No se pudo crear el plan." }
  revalidatePath("/platform/plans")
  revalidatePath("/platform/companies")
  return { success: true as const }
}

export async function updatePlatformPlan(input: { id: string; name: string; maxExcursions: string; maxMembers: string; active: boolean }) {
  const { client } = await requirePlatformAdmin()
  const parsed = z.object({ id: z.string().uuid(), name: z.string().trim().min(2).max(100), maxExcursions: z.string(), maxMembers: z.string(), active: z.boolean() }).safeParse(input)
  if (!parsed.success) return { success: false as const, error: "Revisa los campos del plan." }
  const parseLimit = (value: string) => value.trim() ? Number(value) : null
  const maxExcursions = parseLimit(parsed.data.maxExcursions)
  const maxMembers = parseLimit(parsed.data.maxMembers)
  if ((maxExcursions !== null && (!Number.isInteger(maxExcursions) || maxExcursions < 0)) || (maxMembers !== null && (!Number.isInteger(maxMembers) || maxMembers < 1))) return { success: false as const, error: "Los límites deben ser enteros o vacíos para ilimitado." }
  const { error } = await client.rpc("update_platform_plan", { p_plan_id: parsed.data.id, p_name: parsed.data.name, p_max_excursions: maxExcursions, p_max_members: maxMembers, p_features: {}, p_active: parsed.data.active })
  if (error) return { success: false as const, error: "No se pudo actualizar el plan." }
  revalidatePath("/platform/plans")
  revalidatePath("/platform/companies")
  return { success: true as const }
}

export async function invitePlatformOwner(organizationIdValue: string, emailValue: string) {
  const { client } = await requirePlatformAdmin()
  const organizationId = z.string().uuid().safeParse(organizationIdValue)
  const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase()).safeParse(emailValue)
  if (!organizationId.success || !email.success) return { success: false as const, error: "Indica una empresa y un correo válidos." }
  const { data: ownerStatus, error: ownerStatusError } = await client.rpc("get_platform_active_owner_status", { p_organization_ids: [organizationId.data] })
  if (ownerStatusError) return { success: false as const, error: "No se pudo comprobar si la empresa ya tiene propietario." }
  const ownerStatusRows = (ownerStatus ?? []) as Array<{ has_active_owner: boolean }>
  if (ownerStatusRows.some((item) => item.has_active_owner)) return { success: false as const, error: "La empresa ya tiene un propietario activo. Para transferir la propiedad, hazlo desde la gestión del equipo de la empresa." }
  const { data: organization, error: organizationError } = await client.from("organizations").select("status").eq("id", organizationId.data).maybeSingle()
  if (organizationError || !organization) return { success: false as const, error: "No se encontró la empresa." }
  if (organization.status === "suspended") return { success: false as const, error: "No se puede invitar al propietario de una empresa suspendida." }
  const { data: existing, error: assignmentError } = await client.rpc("platform_assign_organization_owner", { p_organization_id: organizationId.data, p_email: email.data })
  if (assignmentError) return { success: false as const, error: "No se pudo asignar el propietario." }
  if (existing) {
    revalidatePath("/platform/companies")
    return { success: true as const, message: "La cuenta ya existe. La invitación queda pendiente; podrá aceptarla al iniciar sesión en QuickAgency." }
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "")
  if (!appUrl) return { success: false as const, error: "Configura NEXT_PUBLIC_APP_URL con el dominio estable de QuickAgency antes de enviar invitaciones." }
  let callback: URL
  try { callback = new URL("/auth/callback", appUrl) } catch { return { success: false as const, error: "NEXT_PUBLIC_APP_URL no es una URL válida." } }
  callback.searchParams.set("next", "/admin")
  callback.searchParams.set("organization_id", organizationId.data)
  const admin = createSupabaseAdminClient()
  const { data: invitation, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email.data, { redirectTo: callback.toString() })
  if (inviteError || !invitation.user) {
    const { data: racedAssignment } = await client.rpc("platform_assign_organization_owner", { p_organization_id: organizationId.data, p_email: email.data })
    if (racedAssignment) return { success: true as const, message: "La cuenta ya existe. La invitación queda pendiente; podrá aceptarla al iniciar sesión en QuickAgency." }
    return { success: false as const, error: "No se pudo invitar al propietario. Comprueba el SMTP de Supabase Auth y las URL permitidas." }
  }
  const { data: assigned, error: ownerError } = await client.rpc("platform_assign_organization_owner", { p_organization_id: organizationId.data, p_email: email.data })
  if (ownerError || !assigned) {
    await admin.auth.admin.deleteUser(invitation.user.id)
    return { success: false as const, error: "No se pudo vincular la invitación; se canceló la cuenta pendiente." }
  }
  revalidatePath("/platform/companies")
  return { success: true as const, message: "Invitación enviada al propietario." }
}
