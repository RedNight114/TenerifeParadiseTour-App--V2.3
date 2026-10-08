"use client"

import { FormEvent, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import Image from "next/image"
import { Eye, EyeOff, LockKeyhole, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase =
  supabaseUrl && supabaseKey
    ? createBrowserClient(supabaseUrl, supabaseKey, {
        global: { headers: typeof window === "undefined" ? {} : { "x-tenant-host": window.location.hostname.toLowerCase() } },
      })
    : null

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (!supabase) {
      setError("Falta configurar la conexión con Supabase. Revisa .env.local.")
      return
    }

    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    setLoading(true)
    let redirecting = false
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

      if (signInError || !data.user) {
        setError("No se pudo iniciar sesión. Comprueba el correo y la contraseña.")
        return
      }

      const requestedPath = searchParams.get("next")
      const { data: platformAdmin, error: platformAdminError } = await supabase
        .from("platform_admins")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle()

      if (platformAdminError) {
        setError("La sesión se inició, pero no pudimos comprobar los permisos. Comprueba tu conexión e inténtalo de nuevo.")
        return
      }

      if (platformAdmin) {
        const destination = requestedPath === "/platform" || requestedPath?.startsWith("/platform/")
          ? requestedPath
          : "/platform"
        redirecting = true
        window.location.assign(destination)
        return
      }

      let centralHostname = process.env.NEXT_PUBLIC_APP_URL ? "" : "localhost"
      try { centralHostname = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").hostname.toLowerCase() } catch { /* Local development fallback below. */ }
      const isCentralWorkspace = window.location.hostname.toLowerCase() === centralHostname
        || (process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1"].includes(window.location.hostname.toLowerCase()))
      if (isCentralWorkspace) {
        redirecting = true
        window.location.assign("/workspace")
        return
      }

      const { data: organizationId, error: organizationError } = await supabase.rpc("current_public_organization_id")
      if (!organizationError && !organizationId) {
        redirecting = true
        window.location.assign("/workspace")
        return
      }
      if (organizationError || !organizationId) {
        await supabase.auth.signOut()
        setError("No se pudo comprobar la empresa asociada a este acceso.")
        return
      }

      await supabase.rpc("accept_organization_invitation", { target_organization_id: organizationId })
      const { data: membership, error: membershipError } = await supabase
        .from("organization_memberships")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("user_id", data.user.id)
        .eq("status", "active")
        .maybeSingle()

      if (membershipError) {
        setError("La sesión se inició, pero no pudimos verificar los permisos de empresa. Comprueba tu conexión e inténtalo de nuevo.")
        return
      }

      if (!membership) {
        await supabase.auth.signOut()
        setError("Esta cuenta no tiene permisos de administración en esta empresa.")
        return
      }

      const destination = requestedPath?.startsWith("/admin/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/admin"
      // A document navigation ensures the server middleware sees the auth cookies
      // written by Supabase before it evaluates the protected admin route.
      redirecting = true
      window.location.assign(destination)
    } catch {
      setError("No se pudo completar el inicio de sesión por un problema de conexión. Inténtalo de nuevo.")
    } finally {
      if (!redirecting) setLoading(false)
    }
  }

  const queryError = searchParams.get("error")
  const queryMessage = queryError === "not-authorized"
    ? "Esta cuenta no tiene permisos de administración."
    : queryError === "not-platform-admin"
      ? "Esta cuenta no está autorizada para la consola de QuickAgency."
    : queryError === "auth-not-configured"
      ? "Supabase no está configurado en este entorno."
      : queryError === "tenant-not-configured"
        ? "Este dominio todavía no está asociado a una empresa."
        : queryError === "insufficient-role"
          ? "Tu perfil no tiene permisos para esta sección."
          : ""

  return (
    <>
    <main aria-busy={loading} inert={loading} className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.82fr)]">
      <section className="relative hidden overflow-hidden bg-[#123a42] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-28 -top-24 h-[28rem] w-[28rem] rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute -right-8 -top-4 h-[19rem] w-[19rem] rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={44} height={44} className="h-11 w-11 rounded-xl" />
          <span className="text-sm font-semibold tracking-wide">QuickAgency Go</span>
        </div>
        <div className="relative max-w-xl py-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">Portal de operaciones</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">Tu negocio de excursiones, bajo control.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-teal-50/80">Accede para gestionar experiencias, solicitudes de reserva y la información de tu empresa.</p>
        </div>
        <p className="relative text-xs text-teal-100/60">Acceso exclusivo para miembros autorizados.</p>
      </section>

      <section className="flex min-h-dvh items-center justify-center bg-[#f7f9f8] px-5 py-10 sm:px-8 lg:bg-white">
        <Card className="w-full max-w-[420px] rounded-2xl border-slate-200 bg-white shadow-[0_18px_55px_-35px_rgba(15,23,42,0.35)] lg:border-0 lg:shadow-none">
          <CardHeader className="space-y-4 px-6 pt-7 sm:px-8 sm:pt-8">
            <div className="flex items-center gap-3 lg:hidden"><Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={44} height={44} className="h-11 w-11 rounded-xl" /><span className="text-sm font-semibold text-slate-900">QuickAgency Go</span></div>
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-950">Accede a tu cuenta</CardTitle>
              <CardDescription className="mt-2 text-sm leading-6 text-slate-600">Inicia sesión con las credenciales de tu empresa para continuar.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-7 pt-3 sm:px-8 sm:pb-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-800">Correo electrónico</Label>
                <Input id="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-lg border-slate-300 bg-white px-3.5 text-base focus-visible:ring-teal-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-800">Contraseña</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-lg border-slate-300 bg-white px-3.5 pr-12 text-base focus-visible:ring-teal-700" />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>
              {(error || queryMessage) && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800">{error || queryMessage}</p>}
              <Button className="h-12 w-full rounded-lg bg-teal-800 text-sm font-semibold text-white hover:bg-teal-900" type="submit" disabled={loading}>
                {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />Iniciando sesión…</> : <><LockKeyhole className="h-4 w-4" aria-hidden="true" />Iniciar sesión</>}
              </Button>
            </form>
            <p className="mt-6 text-center text-xs leading-5 text-slate-500">Si no puedes acceder, solicita ayuda al propietario de tu empresa.</p>
          </CardContent>
        </Card>
      </section>
    </main>
    {loading && <div className="fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-hidden bg-[#ffe600] px-6 py-10 text-[#15140f]" role="status" aria-live="polite" aria-busy="true">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full border border-[#15140f]/10 sm:h-[28rem] sm:w-[28rem]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-[#15140f]/10" />
      <div className="auth-loading-content relative flex w-full max-w-sm flex-col items-center text-center">
        <Image src="/quickagency-go-badge.svg" alt="" aria-hidden="true" width={96} height={96} priority className="h-24 w-24 rounded-[26px]" />
        <p className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">QuickAgency Go</p>
        <p className="mt-2 text-sm font-medium text-[#15140f]/65">Portal de operaciones</p>
        <div className="mt-10 flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#15140f]/15 bg-white/35 px-5 py-3 shadow-sm">
          <LoaderCircle className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span className="text-sm font-semibold">Validando acceso y preparando tu panel…</span>
        </div>
      </div>
    </div>}
    </>
  )
}
