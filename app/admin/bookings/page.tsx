import { requireOrganizationRole } from "@/lib/supabase-server"
import { BookingsManager, type ManagedBooking } from "@/components/admin/bookings-manager"

type DepartureForBooking = {
  id: string
  excursion_id: number
  starts_at: string
  status: string
  excursions: { name_es: string } | null
}

type OptionForBooking = {
  id: string
  excursion_id: number
  name: string
  pricing_mode: "per_participant" | "per_group" | "per_resource"
  unit_price_minor: number
  currency_code: string
  min_quantity: number
  max_quantity: number
  min_participants_per_unit: number
  max_participants_per_unit: number
}

export default async function AdminBookingsPage() {
  const { client, membership, organizationId } = await requireOrganizationRole([
    "owner",
    "admin",
    "booking_manager",
  ])

  // Expired holds stop consuming capacity immediately in the allocator. This
  // tenant-scoped update keeps their displayed operational state in sync too.
  const { error: expiryError } = await client
    .from("bookings")
    .update({ status: "expired" })
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .not("hold_expires_at", "is", null)
    .lte("hold_expires_at", new Date().toISOString())

  const now = new Date().toISOString()
  const [bookingsResult, departuresResult, optionsResult] = await Promise.all([
    client.from("bookings")
      .select("id, excursion_id, departure_id, total_amount_minor, currency_code, public_reference, customer_name, email, phone, preferred_date, number_of_people, special_requests, language, created_at, status, accepted_terms_version, accepted_terms_locale, accepted_terms_at, booking_source, external_channel, external_reference, excursions!bookings_excursion_same_org_fk(name_es, name_en, name_de, price)")
      .eq("organization_id", organizationId).order("preferred_date", { ascending: true }),
    client.from("excursion_departures")
      .select("id, excursion_id, starts_at, status, excursions!excursion_departures_same_org_fk(name_es)")
      .eq("organization_id", organizationId).eq("status", "scheduled").gte("starts_at", now)
      .order("starts_at").limit(150),
    client.from("product_options")
      .select("id, excursion_id, name, pricing_mode, unit_price_minor, currency_code, min_quantity, max_quantity, min_participants_per_unit, max_participants_per_unit")
      .eq("organization_id", organizationId).eq("active", true).order("name"),
  ])

  return (
    <BookingsManager
      bookings={(bookingsResult.data ?? []) as unknown as ManagedBooking[]}
      departures={(departuresResult.data ?? []) as unknown as DepartureForBooking[]}
      options={(optionsResult.data ?? []) as OptionForBooking[]}
      loadError={bookingsResult.error || expiryError ? "No se pudieron cargar o actualizar las reservas. Comprueba tu conexión e inténtalo de nuevo." : null}
      canUpdate={membership.role !== "guide"}
    />
  )
}
