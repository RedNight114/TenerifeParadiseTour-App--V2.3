"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import type { OrganizationBrand } from "@/lib/organization-context"
import { updateOrganizationSettings } from "@/lib/organization-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"

type OrganizationSettings = OrganizationBrand & {
  legal_name: string | null
  currency_code: string
  timezone: string
}

export function OrganizationSettingsForm({ organization }: { organization: OrganizationSettings }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [logoUrl, setLogoUrl] = useState(organization.logo_url ?? "")
  const address = organization.address ?? {}

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setMessage("")
    startTransition(async () => {
      const result = await updateOrganizationSettings(formData)
      setMessage(result.success ? result.message ?? "Cambios guardados." : result.error ?? "No se pudieron guardar los cambios.")
      if (result.success) router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Identificación y contacto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Nombre comercial" required defaultValue={organization.name} />
          <Field name="legal_name" label="Razón social" defaultValue={organization.legal_name ?? ""} />
          <Field name="support_email" label="Correo de contacto" type="email" defaultValue={organization.support_email ?? ""} hint="Se muestra a los visitantes como canal de contacto." />
          <Field name="phone" label="Teléfono" defaultValue={organization.phone ?? ""} />
          <Field name="street" label="Dirección" defaultValue={address.street ?? ""} />
          <Field name="postal_code" label="Código postal" defaultValue={address.postal_code ?? ""} />
          <Field name="city" label="Municipio / ciudad" defaultValue={address.city ?? ""} />
          <Field name="region" label="Isla / región" defaultValue={address.region ?? ""} />
          <Field name="country" label="País" defaultValue={address.country ?? ""} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Marca y preferencias</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">Aquí se configura la identidad de la empresa. Los textos, secciones, preguntas frecuentes y documentos legales se editan por separado en “Contenido del sitio”.</p>
        <input type="hidden" name="logo_url" value={logoUrl} />
        <ImageUpload label="Logotipo de la empresa" value={logoUrl} onChange={setLogoUrl} placeholder="URL HTTPS del logotipo" />
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField name="primary_color" label="Color principal" defaultValue={organization.primary_color} />
          <ColorField name="secondary_color" label="Color secundario" defaultValue={organization.secondary_color} />
          <div className="space-y-2">
            <Label htmlFor="default_locale">Idioma predeterminado</Label>
            <select id="default_locale" name="default_locale" defaultValue={organization.default_locale} className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="es">Español</option><option value="en">English</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency_code">Moneda</Label>
            <select id="currency_code" name="currency_code" defaultValue={organization.currency_code} className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="EUR">EUR — Euro</option><option value="GBP">GBP — Libra esterlina</option><option value="USD">USD — Dólar estadounidense</option>
            </select>
          </div>
          <Field name="timezone" label="Zona horaria (IANA)" defaultValue={organization.timezone} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description-note">Aplicación de la marca</Label>
          <Textarea id="description-note" readOnly value="El nombre, logotipo y colores se aplican a la web pública. La moneda queda guardada como preferencia; todavía no modifica precios ni cobros." className="min-h-16 resize-none bg-gray-50 text-gray-600" />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar cambios"}</Button>
        {message && <p role="status" className="text-sm text-gray-700">{message}</p>}
      </div>
    </form>
  )
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  required = false,
  hint,
}: {
  name: string
  label: string
  defaultValue: string
  type?: string
  required?: boolean
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} maxLength={type === "url" ? 2048 : 254} />
      {hint && <p className="text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  )
}

function ColorField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [color, setColor] = useState(defaultValue)
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex gap-2">
        <input aria-label={`${label} selector`} type="color" value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#000000"} onChange={(event) => setColor(event.target.value)} className="h-10 w-12 cursor-pointer rounded border border-gray-300 p-1" />
        <Input id={name} name={name} value={color} onChange={(event) => setColor(event.target.value)} pattern="#[0-9A-Fa-f]{6}" maxLength={7} required />
      </div>
    </div>
  )
}
