import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/language-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#3B82F6",
}

export const metadata: Metadata = {
  title: "TenerifeParadiseTours - Excursiones Únicas en Tenerife",
  description:
    "Descubre la magia de Tenerife con nuestras excursiones únicas. Avistamiento de ballenas, senderismo, Teide y mucho más. Reserva fácil vía WhatsApp.",
  keywords: "Tenerife, excursiones, turismo, ballenas, Teide, senderismo, Canarias, tours",
  openGraph: {
    title: "TenerifeParadiseTours - Excursiones Únicas en Tenerife",
    description: "Descubre la magia de Tenerife con nuestras excursiones únicas",
    images: ["/placeholder.svg?height=630&width=1200&text=Tenerife+Paradise+Tours"],
  },
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <LanguageProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
