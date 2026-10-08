import type { Metadata } from "next"
import { CustomerAccount } from "@/components/customer/customer-account"

export const metadata: Metadata = { title: "Mis reservas" }

export default function CustomerAccountPage() { return <CustomerAccount /> }
