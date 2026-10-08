"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowRight, Check, Compass, Mail, MapPin, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import { ExcursionCard } from "@/components/excursion-card"
import { supabase, addExcursionPricingModes, type Excursion } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"
import { PhotoGallery } from "@/components/photo-gallery"
import { SEOHead } from "@/components/seo/seo-head"
import { BookingModal } from "@/components/booking-modal"
import { usePublicSitePage } from "@/lib/public-site-content"
import { getObject, getText } from "@/lib/site-content"

export default function HomePage() {
  const [featuredExcursions, setFeaturedExcursions] = useState<Excursion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t, language } = useLanguage()
  const { content: homeContent } = usePublicSitePage("home")
  const [companyName, setCompanyName] = useState("Experiencias locales")

  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    // Preload critical resources
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = "/hero-tenerife-v3.avif"
    link.as = "image"
    document.head.appendChild(link)

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: selected }, { data: organization }, { data: published, error: publishedError }] = await Promise.all([
          supabase.from("organization_featured_excursions").select("excursion_id, position").order("position"),
          supabase.from("organizations").select("name").maybeSingle(),
          supabase.from("excursions").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(8),
        ])
        if (publishedError) throw publishedError
        if (organization?.name) setCompanyName(organization.name)
        const allPublished = (published ?? []) as Excursion[]
        let excursionsData: Excursion[] = allPublished.slice(0, 4)
        if (selected?.length) {
          const ids = selected.slice(0, 4).map((item) => item.excursion_id)
          const byId = new Map(allPublished.map((item) => [item.id, item]))
          excursionsData = ids.map((id) => byId.get(id)).filter((item): item is Excursion => !!item)
          if (excursionsData.length < 4) {
            const selectedIds = new Set(excursionsData.map((item) => item.id))
            excursionsData = [...excursionsData, ...allPublished.filter((item) => !selectedIds.has(item.id)).slice(0, 4 - excursionsData.length)]
          }
        }
        setFeaturedExcursions(await addExcursionPricingModes(excursionsData))
      } catch (error) {
        console.error("Error fetching excursions:", error)
        setError("Error al cargar las excursiones")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleBookExcursion = (excursion: Excursion) => {
    setSelectedExcursion(excursion)
    setIsBookingModalOpen(true)
  }

  const hero = getObject(homeContent, "hero")
  const featured = getObject(homeContent, "featured")
  const trust = getObject(homeContent, "trust")
  const process = getObject(homeContent, "process")
  const closing = getObject(homeContent, "closing")
  const gallery = getObject(homeContent, "gallery")
  const seo = getObject(homeContent, "seo")
  const heroVariant = getText(hero, "variant", "search")
  const offerExcursion = featuredExcursions.find((excursion) => String(excursion.id) === String(hero.offerExcursionId))
  const heroTitle = getText(hero, "title", t("hero.title"))
  const heroSubtitle = getText(hero, "subtitle", t("hero.subtitle"))
  const heroDescription = getText(hero, "description", t("hero.description"))
  const heroBadge = getText(hero, "badge", t("featured.badge"))
  const heroCtaLabel = getText(hero, "ctaLabel", t("featured.view_all"))
  const heroCtaHref = getText(hero, "ctaHref", "/excursions")
  const heroImage = getText(hero, "imageUrl", "/hero-tenerife-v3.avif") || "/hero-tenerife-v3.avif"
  const featuredTitle = getText(featured, "title", t("featured.title"))
  const featuredSubtitle = getText(featured, "subtitle", t("featured.subtitle"))
  const featuredBadge = getText(featured, "badge", t("featured.badge"))
  const closingTitle = getText(closing, "title", "Descubre experiencias hechas para ti")
  const closingDescription = getText(closing, "description", "Vive momentos memorables con una atención cercana.")
  const galleryImages = Array.isArray(gallery.images) ? gallery.images.filter((value): value is string => typeof value === "string" && value.length > 0) : []
  const displayedGalleryImages = galleryImages.length ? galleryImages : featuredExcursions.flatMap((item) => item.gallery_images ?? []).slice(0, 12)
  const seoData = {
    title: {
      es: "Experiencias y excursiones",
      en: "Experiences and excursions",
      de: "TenerifeParadiseTours - Einzigartige Ausflüge auf Teneriffa | Touren & Aktivitäten",
      fr: "TenerifeParadiseTours - Excursions Uniques à Tenerife | Tours & Activités",
      it: "TenerifeParadiseTours - Escursioni Uniche a Tenerife | Tour e Attività",
      pt: "TenerifeParadiseTours - Excursões Únicas em Tenerife | Tours e Atividades",
      nl: "TenerifeParadiseTours - Unieke Excursies op Tenerife | Tours & Activiteiten",
      ru: "TenerifeParadiseTours - Уникальные экскурсии на Тенерифе | Туры и мероприятия",
      zh: "TenerifeParadiseTours - 特内里费岛独特游览 | 旅游和活动",
    },
    description: {
      es: "Explora experiencias y reserva directamente con el equipo local.",
      en: "Explore experiences and book directly with the local team.",
      de: "Entdecken Sie die besten Ausflüge auf Teneriffa: Walbeobachtung, Teide-Wanderungen, Anaga- und Masca-Touren. Einfache WhatsApp-Buchung. Einzigartige Erlebnisse erwarten Sie!",
      fr: "Découvrez les meilleures excursions à Tenerife: observation des baleines, randonnée au Teide, visites d'Anaga et Masca. Réservation facile par WhatsApp. Des expériences uniques vous attendent!",
      it: "Scopri le migliori escursioni a Tenerife: avvistamento balene, escursioni sul Teide, tour di Anaga e Masca. Facile prenotazione WhatsApp. Esperienze uniche ti aspettano!",
      pt: "Descubra as melhores excursões em Tenerife: observação de baleias, caminhadas no Teide, passeios por Anaga e Masca. Reserva fácil por WhatsApp. Experiências únicas esperam por si!",
      nl: "Ontdek de beste excursies op Tenerife: walvissen spotten, Teide wandelen, Anaga en Masca tours. Eenvoudig boeken via WhatsApp. Unieke ervaringen wachten op u!",
      ru: "Откройте для себя лучшие экскурсии на Тенерифе: наблюдение за китами, походы на Тейде, туры по Анаге и Маске. Простое бронирование через WhatsApp. Уникальные впечатления ждут вас!",
      zh: "探索特内里费岛最佳游览：观鲸、泰德徒步、阿纳加和马斯卡之旅。通过WhatsApp轻松预订。独特体验等待您！",
    },
    keywords: {
      es: "excursiones, experiencias, reservas directas",
      en: "excursions, experiences, direct booking",
      de: "Teneriffa Ausflüge, Teneriffa Touren, Walbeobachtung, Teide, Anaga, Masca, Teneriffa Wandern, Kanarische Inseln Aktivitäten, Teneriffa Tourismus",
      fr: "excursions Tenerife, tours Tenerife, observation baleines, Teide, Anaga, Masca, randonnée Tenerife, activités Canaries, tourisme Tenerife",
      it: "escursioni Tenerife, tour Tenerife, avvistamento balene, Teide, Anaga, Masca, escursionismo Tenerife, attività Canarie, turismo Tenerife",
      pt: "excursões Tenerife, tours Tenerife, observação baleias, Teide, Anaga, Masca, caminhada Tenerife, atividades Canárias, turismo Tenerife",
      nl: "Tenerife excursies, Tenerife tours, walvissen spotten, Teide, Anaga, Masca, Tenerife wandelen, Canarische Eilanden activiteiten, Tenerife toerisme",
      ru: "экскурсии Тенерифе, туры Тенерифе, наблюдение за китами, Тейде, Анага, Маска, походы Тенерифе, мероприятия Канарские острова, туризм Тенерифе",
      zh: "特内里费游览, 特内里费旅游, 观鲸, 泰德, 阿纳加, 马斯卡, 特内里费徒步, 加那利群岛活动, 特内里费旅游",
    },
  }

  const seoTitle = getText(seo, "title", seoData.title[language] ?? seoData.title.es)
  const seoDescription = getText(seo, "description", seoData.description[language] ?? seoData.description.es)
  const seoKeywords = getText(seo, "keywords", seoData.keywords[language] ?? seoData.keywords.es)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-800 motion-reduce:animate-none" role="status" aria-label={t("common.preparing")} />
          <div className="text-base font-medium text-slate-700">{t("common.preparing")}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SEOHead
        title={`${seoTitle} | ${companyName}`}
        description={seoDescription}
        keywords={`${seoKeywords}, ${companyName}`}
        image={heroImage}
        url="/"
        type="website"
        organizationName={companyName}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${seoTitle} | ${companyName}`,
          description: seoDescription,
          url: "/",
          mainEntity: {
            "@type": "TravelAgency",
            name: companyName,
            description: seoDescription,
            hasOfferCatalog: {
              "@type": "OfferCatalog",
            name: companyName,
              itemListElement: featuredExcursions.map((excursion) => ({
                "@type": "Offer",
                name: language === "en" ? excursion.name_en || excursion.name_es : excursion.name_es,
                description: language === "en" ? excursion.short_description_en || excursion.short_description_es : excursion.short_description_es,
                price: excursion.price,
                priceCurrency: "EUR",
                url: `/excursions/${excursion.id}`,
              })),
            },
          },
        }}
      />

      {/* Hero Section */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-slate-950 pb-14 pt-28 sm:pt-32">
        {/* Background */}
        <div className="absolute inset-0" data-site-edit-page="home" data-site-edit-path="hero.imageUrl" data-site-edit-label="Imagen principal" data-site-edit-kind="image">
          <Image
            src={heroImage}
            alt={heroTitle}
            fill
            className="hero-image-enter object-cover"
            priority={true}
            quality={85}
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/35 to-slate-950/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,12,16,0.26)_100%)]" />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 text-center text-white sm:px-6 lg:px-8">
          {/* Título principal */}
          <div className="mx-auto mb-6 max-w-5xl animate-fade-in sm:mb-8" style={{ animationDelay: "0.12s" }}>
            <div data-site-edit-page="home" data-site-edit-path="hero.badge" data-site-edit-label="Etiqueta superior" className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md sm:text-xs"><Sparkles aria-hidden="true" style={{ color: "var(--brand-secondary)" }} className="h-4 w-4" />{heroBadge}</div>
            <h1 className="mx-auto mb-4 max-w-5xl text-balance text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span data-site-edit-page="home" data-site-edit-path="hero.title" data-site-edit-label="Título principal" className="block text-white">{heroTitle}</span>
              <span data-site-edit-page="home" data-site-edit-path="hero.subtitle" data-site-edit-label="Subtítulo" data-site-edit-kind="multiline" className="mx-auto mt-4 block max-w-4xl text-pretty text-lg font-medium leading-snug text-white/90 sm:text-xl md:text-2xl">
                {heroSubtitle}
              </span>
            </h1>
          </div>

          {/* Descripción */}
          <div className="mx-auto mb-7 max-w-3xl animate-fade-in sm:mb-8" style={{ animationDelay: "0.22s" }}>
            <p data-site-edit-page="home" data-site-edit-path="hero.description" data-site-edit-label="Descripción del hero" data-site-edit-kind="multiline" className="mx-auto mb-5 max-w-2xl text-pretty text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              <span className="block">{heroDescription}</span>
            </p>
          </div>

          {/* Barra de búsqueda */}
          {heroVariant === "search" ? <div className="mx-auto mb-7 max-w-3xl animate-fade-in sm:mb-8" style={{ animationDelay: "0.32s" }}><SearchBar /></div> : <div className="mx-auto mb-8 max-w-xl animate-fade-in rounded-2xl border border-white/20 bg-white/10 p-5 text-left shadow-2xl shadow-black/10 backdrop-blur sm:p-6">
            {offerExcursion ? <><p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">{language === "en" ? "Featured experience" : "Experiencia destacada"}</p><h2 className="mt-2 text-xl font-semibold">{language === "en" ? offerExcursion.name_en || offerExcursion.name_es : offerExcursion.name_es}</h2><p className="mt-2 text-sm text-white/80">{language === "en" ? offerExcursion.short_description_en || offerExcursion.short_description_es : offerExcursion.short_description_es}</p><p className="mt-3 text-lg font-semibold">{new Intl.NumberFormat(language === "en" ? "en-GB" : "es-ES", { style: "currency", currency: "EUR" }).format(offerExcursion.price)}</p></> : <p className="text-sm text-white/85">{language === "en" ? "Explore our available experiences." : "Descubre nuestras experiencias disponibles."}</p>}
            <Button asChild className="mt-4 bg-amber-400 text-slate-950 hover:bg-amber-300"><Link data-site-edit-page="home" data-site-edit-path="hero.ctaLabel" data-site-edit-label="Hero · texto del botón" href={offerExcursion ? `/excursions/${offerExcursion.id}` : heroCtaHref}>{offerExcursion ? heroCtaLabel : language === "en" ? "Explore excursions" : heroCtaLabel}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>}
          {heroVariant === "search" && <Button asChild size="lg" className="h-12 rounded-xl bg-amber-400 px-7 font-semibold text-slate-950 shadow-lg shadow-black/15 hover:bg-amber-300"><Link data-site-edit-page="home" data-site-edit-path="hero.ctaLabel" data-site-edit-label="Hero · texto del botón" href={heroCtaHref}>{heroCtaLabel}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>}
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-medium text-white/85 sm:text-sm">
            <span className="inline-flex items-center gap-2"><MapPin style={{ color: "var(--brand-secondary)" }} className="h-4 w-4" />{getText(trust, "location", language === "en" ? "Excursions across Tenerife" : "Excursiones por Tenerife")}</span>
            <span className="inline-flex items-center gap-2"><Compass style={{ color: "var(--brand-secondary)" }} className="h-4 w-4" />{getText(trust, "team", language === "en" ? "Organised by our team" : "Organizadas por nuestro equipo")}</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck style={{ color: "var(--brand-secondary)" }} className="h-4 w-4" />{getText(trust, "direct", language === "en" ? "Book directly with us" : "Reserva directa con nosotros")}</span>
          </div>
          <p className="mt-5 text-sm text-white/75">{getText(trust, "bookingPrompt", language === "en" ? "Already booked?" : "¿Ya tienes una reserva?")} <Link href="/booking-status" className="font-semibold text-white underline decoration-white/50 underline-offset-4 hover:text-amber-200">{getText(trust, "bookingLink", language === "en" ? "Check its status" : "Consulta su estado")}</Link></p>
        </div>

        {/* Indicador de scroll simple */}
        <a href="#featured-excursions" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-xs font-medium tracking-wide text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:block">{getText(trust, "scrollLabel", language === "en" ? "Explore our excursions" : "Descubre nuestras excursiones")} <span aria-hidden="true">↓</span></a>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="direct-booking-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center"><p data-site-edit-page="home" data-site-edit-path="process.eyebrow" data-site-edit-label="Proceso · etiqueta" className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-800">{getText(process, "eyebrow", language === "en" ? "A clear, direct experience" : "Una experiencia sencilla y directa")}</p><h2 id="direct-booking-heading" data-site-edit-page="home" data-site-edit-path="process.title" data-site-edit-label="Proceso · título" className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{getText(process, "title", language === "en" ? "From choosing an excursion to heading out" : "De elegir tu excursión a disfrutar la salida")}</h2><p data-site-edit-page="home" data-site-edit-path="process.description" data-site-edit-label="Proceso · descripción" data-site-edit-kind="multiline" className="mt-4 text-base leading-7 text-slate-600">{getText(process, "description", language === "en" ? `Our team organises each experience. Review the details and book directly with ${companyName}.` : `Nuestro equipo organiza cada experiencia. Consulta los detalles y reserva directamente con ${companyName}.`)}</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { number: "01", title: getText(process, "step1Title", language === "en" ? "Choose your excursion" : "Elige tu excursión"), body: getText(process, "step1Body", language === "en" ? "Compare the outings, details and prices published by our team." : "Compara las salidas, los detalles y los precios publicados por nuestro equipo.") },
              { number: "02", title: getText(process, "step2Title", language === "en" ? "Check date and availability" : "Revisa fecha y disponibilidad"), body: getText(process, "step2Body", language === "en" ? "Select an available departure and the option that suits your group." : "Selecciona una salida disponible y la opción que mejor encaje con tu grupo.") },
              { number: "03", title: getText(process, "step3Title", language === "en" ? "Book directly with us" : "Reserva directamente con nosotros"), body: getText(process, "step3Body", language === "en" ? "Send your booking to the company that will organise your excursion." : "Envía tu reserva a la empresa que organizará tu excursión.") },
            ].map((step) => <article key={step.number} className="rounded-2xl border border-slate-200 bg-[#fbfcfb] p-6 transition-[border-color,box-shadow] duration-150 hover:border-teal-200 hover:shadow-sm"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-900">{step.number}</span><h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p><Check className="mt-5 h-4 w-4 text-teal-700" aria-hidden="true" /></article>)}
          </div>
        </div>
      </section>

      {/* Excursiones Destacadas */}
      <section id="featured-excursions" className="overflow-x-hidden bg-[#f7f8f6] py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl sm:mb-12">
            <div data-site-edit-page="home" data-site-edit-path="featured.badge" data-site-edit-label="Destacadas · etiqueta" className="mb-4 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-amber-900">
              <Sparkles style={{ color: "var(--brand-secondary)" }} className="mr-2 h-4 w-4" />
              {featuredBadge}
            </div>
            <h2 data-site-edit-page="home" data-site-edit-path="featured.title" data-site-edit-label="Destacadas · título" className="mb-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{featuredTitle}</h2>
            <p data-site-edit-page="home" data-site-edit-path="featured.subtitle" data-site-edit-label="Destacadas · descripción" data-site-edit-kind="multiline" className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{featuredSubtitle}</p>
          </div>

          {/* Debug info */}
          {error && <div role="alert" className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{language === "en" ? "We couldn't load the excursions. Check your connection and try again." : "No hemos podido cargar las excursiones. Comprueba tu conexión y vuelve a intentarlo."}</div>}

          {/* Excursions Grid */}
          {featuredExcursions.length > 0 ? (
            <div className="grid w-full max-w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 lg:gap-6">
              {featuredExcursions.map((excursion, index) => (
                <div key={excursion.id} className="animate-fade-in motion-reduce:animate-none" style={{ animationDelay: `${Math.min(index, 3) * 40}ms` }}>
                  <ExcursionCard
                    excursion={excursion}
                    onBook={() => handleBookExcursion(excursion)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
              <div className="mb-4 text-slate-600">
                {loading ? (language === "en" ? "Loading excursions…" : "Cargando excursiones…") : (language === "en" ? "There are no published excursions at the moment." : "En este momento no hay excursiones publicadas.")}
              </div>
              {!loading && (
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                  {language === "en" ? "Reload page" : "Recargar página"}
                </Button>
              )}
            </div>
          )}

          <div className="text-center mt-16">
            <Button
              asChild
              size="lg"
              className="bg-brand-primary px-8 py-6 text-base font-semibold text-white shadow-lg transition-[background-color,box-shadow,transform] duration-200 hover:bg-brand-primary-hover sm:px-10 sm:text-lg"
            >
              <Link href="/excursions">
                {t("featured.view_all")}
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-[#123a42] py-16 sm:py-20">
          <div data-site-edit-page="home" data-site-edit-path="closing.imageUrl" data-site-edit-label="Cierre · imagen" data-site-edit-kind="image" className="absolute inset-0 opacity-[0.13]">{getText(closing, "imageUrl") && <Image src={getText(closing, "imageUrl")} alt="" fill sizes="100vw" className="object-cover" />}</div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 w-full">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 backdrop-blur-sm">
            <Sparkles style={{ color: "var(--brand-secondary)" }} className="mr-2 h-4 w-4" />
            <span className="text-sm font-semibold text-white">{getText(closing, "badge", language === "en" ? "Plan your next outing" : "Organiza tu próxima salida")}</span>
          </div>

          <h2 className="mb-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            <span data-site-edit-page="home" data-site-edit-path="closing.title" data-site-edit-label="Cierre · título" className="block">{closingTitle}</span>
            <span data-site-edit-page="home" data-site-edit-path="closing.highlight" data-site-edit-label="Cierre · texto destacado" className="block text-amber-300">{getText(closing, "highlight", language === "en" ? "We will take care of the details" : "Nosotros nos ocupamos de los detalles")}</span>
          </h2>

          <p className="mx-auto mb-9 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            <span data-site-edit-page="home" data-site-edit-path="closing.description" data-site-edit-label="Cierre · descripción" data-site-edit-kind="multiline">{closingDescription}</span>
            <span data-site-edit-page="home" data-site-edit-path="closing.secondaryDescription" data-site-edit-label="Cierre · texto secundario" data-site-edit-kind="multiline" className="block mt-2 text-lg text-gray-300">{getText(closing, "secondaryDescription", language === "en" ? "Choose an excursion and book in a few simple steps." : "Elige una excursión y reserva en unos pocos pasos.")}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-full">
            <Button
              asChild
              size="lg"
              className="h-12 border-0 bg-amber-400 px-7 text-base font-semibold text-slate-950 shadow-sm hover:bg-amber-300 sm:px-9"
            >
              <Link data-site-edit-page="home" data-site-edit-path="closing.primaryCta" data-site-edit-label="Cierre · botón principal" href={getText(closing, "primaryHref", "/excursions")}>
                <Compass className="mr-3 h-5 w-5" />
                {getText(closing, "primaryCta", language === "en" ? "Browse excursions" : "Ver excursiones")}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/35 bg-white/10 px-7 text-base font-semibold text-white hover:bg-white hover:text-teal-900 sm:px-9"
            >
              <Link data-site-edit-page="home" data-site-edit-path="closing.secondaryCta" data-site-edit-label="Cierre · botón secundario" href={getText(closing, "secondaryHref", "/contact")}>
                <Mail className="mr-3 h-5 w-5" />
                {getText(closing, "secondaryCta", language === "en" ? "Talk to our team" : "Hablar con el equipo")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Galería de Fotos */}
      {displayedGalleryImages.length > 0 && <PhotoGallery images={displayedGalleryImages} badge={getText(gallery, "badge", language === "en" ? "A taste of Tenerife" : "Así se vive Tenerife")} title={getText(gallery, "title", language === "en" ? "A look at our excursions" : "Un vistazo a nuestras excursiones")} subtitle={getText(gallery, "subtitle", language === "en" ? "Landscapes and moments from the experiences we organise." : "Paisajes y momentos de las experiencias que organizamos.")} />}

      {/* Admin Access - Solo visible para administradores */}

      {/* Booking Modal */}
      {selectedExcursion && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setSelectedExcursion(null)
          }}
          excursion={selectedExcursion}
        />
      )}
    </div>
  )
}
