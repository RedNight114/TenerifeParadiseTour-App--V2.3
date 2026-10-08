"use client"

import { FormEvent, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarDays, Check, CircleUserRound, KeyRound, LogOut, Mail, ShieldCheck } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useOrganization } from "@/lib/organization-context"

type CustomerBooking = {
  reference: string
  status: string
  preferred_date: string
  number_of_people: number
  created_at: string
  excursion_name_es: string | null
  excursion_name_en: string | null
  amount_minor: number | null
  currency_code: string | null
  payment_status: string
}
type AccountMode = "signin" | "signup" | "recovery" | "update-password"
type SignInMethod = "password" | "email-link"

const labels = {
  es: { pending: "Pendiente", confirmed: "Confirmada", cancelled: "Cancelada", expired: "Vencida", completed: "Completada" },
  en: { pending: "Pending", confirmed: "Confirmed", cancelled: "Cancelled", expired: "Expired", completed: "Completed" },
}

export function CustomerAccount() {
  const router = useRouter()
  const organization = useOrganization()
  const { language } = useLanguage()
  const english = language === "en"
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<CustomerBooking[]>([])
  const [mode, setMode] = useState<AccountMode>("signin")
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("password")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    let alive = true
    if (new URLSearchParams(window.location.search).get("update-password") === "1") setMode("update-password")
    supabase.auth.getUser().then(({ data }) => { if (alive) setUser(data.user) })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return
      setUser(session?.user ?? null)
      if (event === "PASSWORD_RECOVERY") setMode("update-password")
    })
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!user || mode === "update-password") { setBookings([]); return }
    let alive = true
    void (async () => {
      if (user.email_confirmed_at) await supabase.rpc("claim_customer_bookings")
      const { data, error } = await supabase.rpc("get_my_customer_bookings")
      if (!alive) return
      if (error) setMessage(english ? "We couldn't load your bookings. Please refresh and try again." : "No pudimos cargar tus reservas. Actualiza la página e inténtalo de nuevo.")
      else setBookings((data ?? []) as CustomerBooking[])
    })()
    return () => { alive = false }
  }, [user, english, mode])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    const cleanEmail = email.trim()
    const accountReturn = `${window.location.origin}/auth/callback?next=%2Faccount`

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password, options: { emailRedirectTo: accountReturn } })
      if (error) setMessage(english ? "We couldn't create your account. Check the details or try signing in." : "No pudimos crear la cuenta. Revisa los datos o prueba a iniciar sesión.")
      else if (data.session) { setUser(data.user); setMessage(english ? "Account created. Your verified-email bookings will appear here." : "Cuenta creada. Aquí aparecerán las reservas asociadas a tu correo verificado.") }
      else setMessage(english ? "Check your inbox to verify your email. Then return here to see bookings made with this email." : "Revisa tu correo para verificar la cuenta. Después vuelve aquí para ver las reservas hechas con este correo.")
    } else if (mode === "recovery") {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/account?update-password=1")}` })
      setMessage(error ? (english ? "We couldn't send the reset email. Check the address and try again." : "No pudimos enviar el correo. Revisa la dirección e inténtalo de nuevo.") : (english ? "If an account exists for this email, you'll receive a password reset link." : "Si existe una cuenta con este correo, recibirás un enlace para restablecer la contraseña."))
    } else if (mode === "signin" && signInMethod === "email-link") {
      const { error } = await supabase.auth.signInWithOtp({ email: cleanEmail, options: { emailRedirectTo: accountReturn, shouldCreateUser: false } })
      setMessage(error ? (english ? "We couldn't send the sign-in link. Check the email and try again." : "No pudimos enviar el enlace. Revisa el correo e inténtalo de nuevo.") : (english ? "If an account exists for this email, a sign-in link is on its way." : "Si existe una cuenta con este correo, te enviaremos un enlace para iniciar sesión."))
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      if (error || !data.user) setMessage(english ? "Email or password not recognized." : "No reconocemos ese correo o contraseña.")
      else { setUser(data.user); router.refresh() }
    }
    setBusy(false)
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setMessage(english ? "We couldn't update your password. Please try again." : "No pudimos actualizar la contraseña. Inténtalo de nuevo.")
    else {
      setMode("signin")
      setPassword("")
      setNewPassword("")
      setMessage(english ? "Password updated. You can now sign in." : "Contraseña actualizada. Ya puedes iniciar sesión.")
      router.replace("/account")
    }
    setBusy(false)
  }

  async function signInWithGoogle() {
    setBusy(true)
    setMessage("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=%2Faccount` },
    })
    if (error) {
      setBusy(false)
      setMessage(english
        ? "Google sign-in isn't available yet. The site administrator needs to enable Google in Supabase Auth."
        : "El acceso con Google aún no está disponible. El administrador debe activar Google en Supabase Auth.")
    }
  }

  async function signOut() { await supabase.auth.signOut(); setUser(null); setBookings([]); setMessage("") }

  const authTitle = mode === "signup"
    ? english ? "Create your account" : "Crea tu cuenta"
    : mode === "recovery"
      ? english ? "Recover your access" : "Recupera el acceso"
      : english ? "Sign in to see your bookings" : "Accede para ver tus reservas"

  return <main className="relative min-h-screen overflow-hidden bg-[#f4f7f6] px-4 py-5 sm:px-6 sm:py-8">
    <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal-100/50 blur-3xl" aria-hidden="true" />
    <div className="relative mx-auto grid min-h-[calc(100svh-2.5rem)] max-w-6xl items-center gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
      <aside className="relative hidden min-h-[680px] overflow-hidden rounded-[2rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/10 lg:flex lg:flex-col">
        <Image src="/hero-tenerife-v3.avif" alt="Costa de Tenerife al atardecer" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/25 to-slate-950/85" />
        <div className="relative flex h-full flex-1 flex-col">
          <Link href="/" className="inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <Image src={organization?.logo_url || "/logo.png"} alt="" width={42} height={42} unoptimized className="h-10 w-10 rounded-full bg-white/95 object-contain p-1" />
            <span className="text-sm font-semibold tracking-tight">{organization?.name || "Tenerife Paradise Tours"}</span>
          </Link>
          <div className="mt-auto max-w-md pb-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur"><ShieldCheck className="h-4 w-4 text-amber-300" />{english ? "Your traveller space" : "Tu espacio de viajero"}</span>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">{english ? "Your next Tenerife experience starts here." : "Tu próxima experiencia en Tenerife empieza aquí."}</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">{english ? "Manage your bookings and get clear updates directly from the team organising your excursion." : "Consulta tus reservas y recibe información clara directamente del equipo que organiza tu excursión."}</p>
            <div className="mt-7 space-y-3 text-sm text-white/90">
              <p className="flex items-center gap-2.5"><Check className="h-4 w-4 text-amber-300" />{english ? "Your bookings, together in one place" : "Tus reservas, reunidas en un solo lugar"}</p>
              <p className="flex items-center gap-2.5"><Check className="h-4 w-4 text-amber-300" />{english ? "Private access to your reservation details" : "Acceso privado a los detalles de tus reservas"}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="mx-auto w-full max-w-md py-5 lg:py-10">
    <header className="mb-7">
      <Link href="/" className="mb-8 inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 lg:hidden">
        <Image src={organization?.logo_url || "/logo.png"} alt="" width={38} height={38} unoptimized className="h-9 w-9 rounded-full bg-white object-contain p-0.5 shadow-sm" />
        <span className="text-sm font-semibold text-slate-800">{organization?.name || "Tenerife Paradise Tours"}</span>
      </Link>
      <span className="mb-5 hidden h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-800 shadow-sm ring-1 ring-slate-200/80 lg:inline-flex"><CircleUserRound className="h-5 w-5" /></span>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">{english ? "Customer account" : "Cuenta de cliente"}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{english ? "Your bookings, in one place" : "Tus reservas, en un solo lugar"}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{english ? "Sign in or create an account with the email address you book with. Only your own booking summaries will be shown." : "Inicia sesión o crea una cuenta con el correo que utilizas al reservar. Solo verás los resúmenes de tus propias reservas."}</p>
    </header>

    {mode === "update-password" ? <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-semibold text-slate-950">{english ? "Choose a new password" : "Elige una nueva contraseña"}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{english ? "Use at least 8 characters." : "Utiliza al menos 8 caracteres."}</p>
      <form onSubmit={updatePassword} className="mt-5 space-y-4"><div><label htmlFor="customer-new-password" className="mb-1.5 block text-sm font-medium">{english ? "New password" : "Nueva contraseña"}</label><Input id="customer-new-password" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="h-12 rounded-lg" /></div>{message && <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-700">{message}</p>}<Button type="submit" disabled={busy} className="h-12 w-full rounded-lg bg-teal-800 text-white hover:bg-teal-900">{busy ? (english ? "Saving…" : "Guardando…") : (english ? "Update password" : "Actualizar contraseña")}</Button></form>
    </section> : !user ? <section className="mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/80 p-2"><button type="button" onClick={() => { setMode("signin"); setMessage("") }} aria-pressed={mode === "signin"} className={`min-h-11 rounded-lg text-sm font-semibold transition-colors ${mode === "signin" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>{english ? "Sign in" : "Iniciar sesión"}</button><button type="button" onClick={() => { setMode("signup"); setMessage("") }} aria-pressed={mode === "signup"} className={`min-h-11 rounded-lg text-sm font-semibold transition-colors ${mode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>{english ? "Create account" : "Crear cuenta"}</button></div>
      <div className="p-5 sm:p-7"><h2 className="text-xl font-semibold tracking-tight text-slate-950">{authTitle}</h2><p className="mt-1 text-sm text-slate-600">{mode === "signup" ? (english ? "Your account keeps your reservation details together." : "Reúne aquí la información de tus reservas.") : mode === "recovery" ? (english ? "We'll email you a secure password reset link." : "Te enviaremos un enlace seguro para restablecer la contraseña.") : (english ? "Choose how you'd like to access your customer account." : "Elige cómo quieres acceder a tu cuenta de cliente.")}</p>
        {mode === "signin" && <div className="mt-5 grid grid-cols-2 rounded-lg border border-slate-200 p-1"><button type="button" onClick={() => { setSignInMethod("password"); setMessage("") }} aria-pressed={signInMethod === "password"} className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-2 text-xs font-medium sm:text-sm ${signInMethod === "password" ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-slate-50"}`}><KeyRound className="h-4 w-4" />{english ? "Password" : "Contraseña"}</button><button type="button" onClick={() => { setSignInMethod("email-link"); setMessage("") }} aria-pressed={signInMethod === "email-link"} className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-2 text-xs font-medium sm:text-sm ${signInMethod === "email-link" ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-slate-50"}`}><Mail className="h-4 w-4" />{english ? "Email link" : "Enlace por correo"}</button></div>}
        {(mode === "signin" || mode === "signup") && <>
          <button type="button" onClick={signInWithGoogle} disabled={busy} className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"/><path fill="#4A90E2" d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8l6.8-5.2Z"/><path fill="#EA4335" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z"/></svg>
            {english ? "Continue with Google" : "Continuar con Google"}
          </button>
          <div className="relative my-5 flex items-center justify-center"><span className="absolute inset-x-0 border-t border-slate-200" /><span className="relative bg-white px-3 text-xs font-medium text-slate-500">{english ? "or continue with email" : "o continúa con tu correo"}</span></div>
        </>}
        <form onSubmit={submit} className="mt-5 space-y-4"><div><label htmlFor="customer-account-email" className="mb-1.5 block text-sm font-medium text-slate-800">{english ? "Email address" : "Correo electrónico"}</label><Input id="customer-account-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-lg" /></div>{(mode === "signup" || (mode === "signin" && signInMethod === "password")) && <div><div className="mb-1.5 flex items-center justify-between gap-2"><label htmlFor="customer-account-password" className="text-sm font-medium text-slate-800">{english ? "Password" : "Contraseña"}</label>{mode === "signin" && <button type="button" onClick={() => { setMode("recovery"); setMessage("") }} className="text-xs font-semibold text-teal-800 underline-offset-4 hover:underline">{english ? "Forgot password?" : "¿Olvidaste la contraseña?"}</button>}</div><Input id="customer-account-password" type="password" minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-lg" /></div>}
          {message && <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-700">{message}</p>}
          <Button type="submit" disabled={busy} className="h-12 w-full rounded-lg bg-teal-800 text-white hover:bg-teal-900">{busy ? (english ? "Please wait…" : "Un momento…") : mode === "signup" ? (english ? "Create customer account" : "Crear cuenta de cliente") : mode === "recovery" ? (english ? "Send reset link" : "Enviar enlace de recuperación") : signInMethod === "email-link" ? (english ? "Email me a sign-in link" : "Enviarme enlace de acceso") : (english ? "Sign in" : "Iniciar sesión")}</Button>
        </form>
        {mode === "recovery" && <button type="button" onClick={() => { setMode("signin"); setMessage("") }} className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" />{english ? "Back to sign in" : "Volver a iniciar sesión"}</button>}
        <div className="mt-5 border-t border-slate-100 pt-4"><p className="flex gap-2 text-xs leading-5 text-slate-500"><KeyRound className="mt-0.5 h-4 w-4 shrink-0" />{english ? "Your bookings are linked only after verifying the same email used at checkout." : "Tus reservas solo se vinculan tras verificar el mismo correo utilizado al reservar."}</p><p className="mt-4 text-center text-sm"><Link href="/booking-status" className="font-semibold text-teal-800 underline underline-offset-4">{english ? "Continue as guest with a booking code" : "Consultar como invitado con código de reserva"}</Link></p></div>
      </div>
    </section> : <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><div><h2 className="font-semibold text-slate-950">{english ? "My bookings" : "Mis reservas"}</h2><p className="mt-1 text-sm text-slate-600">{user.email}</p></div><Button variant="outline" onClick={signOut} className="rounded-lg"><LogOut className="mr-2 h-4 w-4" />{english ? "Sign out" : "Cerrar sesión"}</Button></div>{message && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}<div className="mt-4 divide-y divide-slate-100">{bookings.map((booking) => <article key={booking.reference} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><h3 className="font-medium text-slate-900">{(english ? booking.excursion_name_en || booking.excursion_name_es : booking.excursion_name_es || booking.excursion_name_en) ?? (english ? "Excursion" : "Excursión")}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><CalendarDays className="h-4 w-4" />{new Intl.DateTimeFormat(english ? "en-GB" : "es-ES", { dateStyle: "medium" }).format(new Date(`${booking.preferred_date}T12:00:00`))} · {booking.number_of_people} {english ? "people" : "personas"}</p><p className="mt-1 font-mono text-xs text-slate-500">{english ? "Code" : "Código"}: {booking.reference}</p></div><div className="text-right"><span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800">{labels[english ? "en" : "es"][booking.status as keyof typeof labels.es] ?? booking.status}</span>{booking.amount_minor !== null && booking.currency_code && <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{new Intl.NumberFormat(english ? "en-GB" : "es-ES", { style: "currency", currency: booking.currency_code }).format(booking.amount_minor / 100)}</p>}</div></article>)}{!bookings.length && <div className="py-10 text-center"><p className="font-medium text-slate-800">{english ? "No bookings linked yet" : "Todavía no hay reservas vinculadas"}</p><p className="mt-1 text-sm text-slate-600">{english ? "Bookings made with this verified email will appear here." : "Aquí aparecerán las reservas hechas con este correo verificado."}</p><Button asChild className="mt-4 bg-teal-800 text-white hover:bg-teal-900"><Link href="/excursions">{english ? "Explore excursions" : "Ver excursiones"}</Link></Button></div>}</div></section>}
      </div>
    </div>
  </main>
}
