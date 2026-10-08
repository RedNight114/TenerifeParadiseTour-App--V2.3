import "server-only"

import { isIP } from "node:net"

export type HostingStatus = "not_connected" | "pending_verification" | "pending_dns" | "verified" | "error"

export type HostingDetails = {
  apexName?: string
  verified?: boolean
  misconfigured?: boolean
  configuredBy?: string | null
  verification?: Array<{ type: string; domain: string; value: string; reason?: string }>
  recommendedIPv4?: string[]
  recommendedCNAME?: string[]
  message?: string
}

export type HostingInspection = { status: HostingStatus; details: HostingDetails }

type ProjectDomain = {
  name?: string
  apexName?: string
  verified?: boolean
  verification?: Array<{ type?: string; domain?: string; value?: string; reason?: string }>
}

type DomainConfig = {
  configuredBy?: string | null
  misconfigured?: boolean
  recommendedIPv4?: string[]
  recommendedCNAME?: string[]
}

class VercelApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = "VercelApiError"
  }
}

function getConfig() {
  const token = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID
  if (!token || !projectId || !teamId) {
    throw new Error("Falta configurar VERCEL_API_TOKEN, VERCEL_PROJECT_ID y VERCEL_TEAM_ID en el servidor.")
  }
  return { token, projectId, teamId }
}

function validatePublicHost(host: string) {
  const normalized = host.trim().toLowerCase().replace(/\.$/, "")
  const labels = normalized.split(".")
  if (normalized !== host.trim().toLowerCase() || labels.length < 2 || isIP(normalized) || labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) {
    throw new Error("Solo se pueden conectar dominios públicos válidos, sin protocolo ni ruta.")
  }
  if (["localhost", "local", "test", "invalid", "internal"].includes(labels[labels.length - 1])) {
    throw new Error("Los dominios locales o de prueba no se pueden conectar a Vercel.")
  }
  return normalized
}

async function vercelRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { token } = getConfig()
  let response: Response
  try {
    response = await fetch(`https://api.vercel.com${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
    })
  } catch {
    throw new Error("No se pudo conectar con Vercel. Comprueba la conexión e inténtalo de nuevo.")
  }

  const body = await response.json().catch(() => ({})) as { error?: { code?: string; message?: string } }
  if (!response.ok) {
    const code = body.error?.code
    if (response.status === 401 || response.status === 403) throw new VercelApiError("Vercel rechazó las credenciales o no tienen permisos para administrar dominios de este proyecto.", response.status)
    if (response.status === 404) throw new VercelApiError("El recurso de Vercel no existe o no es accesible con la configuración actual.", response.status)
    if (response.status === 409 || code === "domain_already_in_use") throw new VercelApiError("Este dominio ya está asociado a otro proyecto de Vercel. No se ha forzado su reasignación.", response.status)
    if (response.status === 400) throw new VercelApiError("Vercel no acepta este dominio. Comprueba si ya está asignado a otro proyecto o si el nombre es correcto.", response.status)
    throw new VercelApiError("Vercel no pudo completar la operación del dominio. Revisa la configuración e inténtalo de nuevo.", response.status)
  }
  return body as T
}

function queryPath(path: string, teamId: string, extra: Record<string, string> = {}) {
  const query = new URLSearchParams({ teamId, ...extra })
  return `${path}?${query.toString()}`
}

export async function inspectVercelDomain(hostValue: string, connectIfMissing = false): Promise<HostingInspection> {
  const host = validatePublicHost(hostValue)
  const { projectId, teamId } = getConfig()
  await vercelRequest(queryPath(`/v9/projects/${encodeURIComponent(projectId)}`, teamId))
  const projectPath = `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(host)}`
  let domain: ProjectDomain | null = null

  if (connectIfMissing) {
    const addPath = queryPath(`/v10/projects/${encodeURIComponent(projectId)}/domains`, teamId)
    try {
      domain = await vercelRequest<ProjectDomain>(addPath, { method: "POST", body: JSON.stringify({ name: host }) })
    } catch (error) {
      // Idempotently accept an existing association with this same project;
      // never use force or move a domain from another project.
      try {
        domain = await vercelRequest<ProjectDomain>(queryPath(projectPath, teamId))
      } catch {
        throw error
      }
    }
  } else {
    try {
      domain = await vercelRequest<ProjectDomain>(queryPath(projectPath, teamId))
    } catch (error) {
      if (error instanceof VercelApiError && error.status === 404) return { status: "not_connected", details: {} }
      throw error
    }
  }

  if (!domain) return { status: "not_connected", details: {} }
  const configPath = queryPath(`/v6/domains/${encodeURIComponent(host)}/config`, teamId, { projectIdOrName: projectId })
  const config = await vercelRequest<DomainConfig>(configPath)
  const verification = Array.isArray(domain.verification)
    ? domain.verification.flatMap((record) => record.type && record.domain && record.value
      ? [{ type: record.type, domain: record.domain, value: record.value, ...(record.reason ? { reason: record.reason } : {}) }]
      : [])
    : []
  const details: HostingDetails = {
    apexName: typeof domain.apexName === "string" ? domain.apexName : undefined,
    verified: domain.verified === true,
    misconfigured: config.misconfigured === true,
    configuredBy: typeof config.configuredBy === "string" ? config.configuredBy : null,
    verification,
    recommendedIPv4: Array.isArray(config.recommendedIPv4) ? config.recommendedIPv4.filter((value): value is string => typeof value === "string") : [],
    recommendedCNAME: Array.isArray(config.recommendedCNAME) ? config.recommendedCNAME.filter((value): value is string => typeof value === "string") : [],
  }
  const status: HostingStatus = !details.verified
    ? "pending_verification"
      : details.misconfigured !== false
      ? "pending_dns"
      : "verified"
  return { status, details }
}

export function isLocalDomain(host: string) {
  return host === "localhost" || host === "127.0.0.1"
}
