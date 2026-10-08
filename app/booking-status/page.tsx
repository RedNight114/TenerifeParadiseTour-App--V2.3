import type { Metadata } from "next"
import { BookingStatusLookup } from "@/components/customer/booking-status-lookup"

export const metadata: Metadata = { title: "Consultar reserva" }

export default function BookingStatusPage() { return <BookingStatusLookup /> }
