import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/language-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CookieBanner } from "@/components/cookie-banner"
import { LanguageSelectorModal } from "@/components/language-selector-modal"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL("https://tenerifeparadisetours.com"),
  title: {
    default: "TenerifeParadiseTours - Excursiones Únicas en Tenerife",
    template: "%s | TenerifeParadiseTours",
  },
  description:
    "Descubre las mejores excursiones en Tenerife: avistamiento de ballenas, senderismo al Teide, tours por Anaga y Masca. Reserva fácil por WhatsApp. ¡Experiencias únicas te esperan!",
  keywords: [
    "excursiones Tenerife",
    "tours Tenerife",
    "avistamiento ballenas",
    "Teide",
    "Anaga",
    "Masca",
    "senderismo Tenerife",
    "actividades Canarias",
    "turismo Tenerife",
    "whale watching",
    "hiking tours",
    "Canary Islands",
  ],
  authors: [{ name: "TenerifeParadiseTours" }],
  creator: "TenerifeParadiseTours",
  publisher: "TenerifeParadiseTours",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://tenerifeparadisetours.com",
    siteName: "TenerifeParadiseTours",
    title: "TenerifeParadiseTours - Excursiones Únicas en Tenerife",
    description:
      "Descubre las mejores excursiones en Tenerife: avistamiento de ballenas, senderismo al Teide, tours por Anaga y Masca. Reserva fácil por WhatsApp.",
    images: [
      {
        url: "/hero-tenerife-v3.avif",
        width: 1200,
        height: 630,
        alt: "TenerifeParadiseTours - Paisajes espectaculares de Tenerife",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TenerifeParadiseTours - Excursiones Únicas en Tenerife",
    description:
      "Descubre las mejores excursiones en Tenerife: avistamiento de ballenas, senderismo al Teide, tours por Anaga y Masca.",
    images: ["/hero-tenerife-v3.avif"],
    creator: "@tenerifeparadise",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://tenerifeparadisetours.com",
    languages: {
      "es-ES": "https://tenerifeparadisetours.com/es",
      "en-US": "https://tenerifeparadisetours.com/en",
      "de-DE": "https://tenerifeparadisetours.com/de",
    },
  },
  category: "travel",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//blob.v0.dev" />
        <meta name="geo.region" content="ES-CN" />
        <meta name="geo.placename" content="Tenerife" />
        <meta name="geo.position" content="28.2916;-16.6291" />
        <meta name="ICBM" content="28.2916, -16.6291" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CookieBanner />
          <LanguageSelectorModal />
        </LanguageProvider>
      </body>
    </html>
  )
}
