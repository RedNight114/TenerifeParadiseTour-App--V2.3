"use client"

import Image from "next/image"
import { Award, Users, Heart, Shield, Star, MapPin, Globe, Mountain } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { useEffect } from "react"

export default function AboutPage() {
  const { t } = useLanguage()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const values = [
    {
      icon: Heart,
      title: t("about.value_passion_title"),
      description: t("about.value_passion_desc"),
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      icon: Users,
      title: t("about.value_experience_title"),
      description: t("about.value_experience_desc"),
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: Shield,
      title: t("about.value_security_title"),
      description: t("about.value_security_desc"),
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: Award,
      title: t("about.value_quality_title"),
      description: t("about.value_quality_desc"),
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
  ]

  const stats = [
    { number: "50+", label: t("about.stat_excursions"), icon: Mountain, color: "text-green-600" },
    { number: "4.9/5", label: t("about.stat_rating"), icon: Star, color: "text-yellow-600" },
  ]

  const certifications = [
    { name: t("about.cert_sustainable_tourism"), icon: Globe },
    { name: t("about.cert_official_guides"), icon: Award },
    { name: t("about.cert_responsible_company"), icon: Shield },
    { name: t("about.cert_tripadvisor_excellence"), icon: Star },
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="w-full max-w-full overflow-x-hidden">
        {/* Hero Header Enhanced */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-tenerife.jpg')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-indigo-700/70 to-purple-800/60"></div>

          {/* Enhanced Decorative elements */}
          <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-yellow-300/30 to-orange-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-32 right-32 w-24 h-24 bg-white/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-green-400/30 to-blue-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-40 left-40 w-16 h-16 bg-yellow-300/40 rounded-full blur-lg animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-2xl animate-float"></div>

          {/* Geometric patterns */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
          <div
            className="absolute top-40 left-32 w-1 h-1 bg-yellow-300/80 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-32 right-20 w-2 h-2 bg-white/60 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-20 right-40 w-1 h-1 bg-yellow-300/80 rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30 mb-8 px-6 py-2 text-sm font-semibold shadow-lg">
                {t("about.hero_badge")}
              </Badge>
              <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight drop-shadow-lg">
                <span className="block">{t("about.title")}</span>
                <span className="block text-4xl md:text-5xl font-light text-yellow-300 mt-4 drop-shadow-md">
                  {t("about.subtitle")}
                </span>
              </h1>
              <p className="text-xl opacity-90 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
                {t("about.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section Enhanced */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-x-hidden">
          <div className="absolute inset-0 bg-[url('/hero-tenerife.jpg')] bg-cover bg-center opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("about.achievements")}</h2>
              <p className="text-xl text-gray-600">{t("about.achievements_subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-full">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="text-center p-8 bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group max-w-full"
                >
                  <CardContent className="p-0">
                    <div
                      className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section Enhanced */}
        <section className="py-20 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-full">
              <div className="order-2 lg:order-1">
                <Badge className="bg-blue-100 text-blue-800 mb-6 px-4 py-2">{t("about.story_badge")}</Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-8">{t("about.story_title")}</h2>
                <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                  <p>
                    Fundada en 2025 por un equipo de apasionados exploradores locales, Tenerife Paradise Tours nace con
                    la misión de revolucionar la forma en que los visitantes experimentan nuestra hermosa isla. Como
                    empresa joven e innovadora, combinamos la frescura de las nuevas ideas con el profundo conocimiento
                    ancestral de Tenerife.
                  </p>
                  <p>
                    Nuestros fundadores, nativos de la isla con décadas de experiencia en turismo y aventura,
                    identificaron la necesidad de crear experiencias más auténticas y personalizadas. Desde nuestros
                    primeros días, nos hemos comprometido a utilizar la tecnología más avanzada para ofrecer reservas
                    seamless y experiencias inmersivas que conecten a nuestros huéspedes con la verdadera esencia de
                    Tenerife.
                  </p>
                  <p>
                    Aunque somos nuevos en el mercado, nuestro equipo aporta una rica experiencia colectiva y una visión
                    fresca del turismo sostenible. Cada excursión que diseñamos refleja nuestro compromiso con la
                    innovación, la sostenibilidad y la creación de recuerdos inolvidables que perdurarán toda la vida.
                  </p>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative max-w-full">
                <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl max-w-full">
                  <Image src="/team-tenerife.webp" alt="Nuestro equipo en Tenerife" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-lg font-semibold">Nuestra Isla</p>
                    <p className="text-sm opacity-90">{t("about.team_subtitle")}</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-300 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-300 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values Enhanced */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("about.pillars_title")}</h2>
              <p className="text-xl text-gray-600">{t("about.pillars_subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 max-w-full">
              {/* Mission */}
              <Card className="text-center p-10 bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group max-w-full">
                <CardContent className="p-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("about.mission")}</h3>
                  <p className="text-gray-600 leading-relaxed">{t("about.mission_text")}</p>
                </CardContent>
              </Card>

              {/* Vision */}
              <Card className="text-center p-10 bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group max-w-full">
                <CardContent className="p-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("about.vision")}</h3>
                  <p className="text-gray-600 leading-relaxed">{t("about.vision_text")}</p>
                </CardContent>
              </Card>

              {/* Values */}
              <Card className="text-center p-10 bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group max-w-full">
                <CardContent className="p-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("about.values")}</h3>
                  <p className="text-gray-600 leading-relaxed">{t("about.values_text")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Values Grid Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-full">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="p-8 bg-white/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group max-w-full"
                >
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-6">
                      <div
                        className={`w-16 h-16 ${value.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <value.icon className={`h-8 w-8 ${value.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications Enhanced */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("about.certifications_title")}</h2>
              <p className="text-xl text-gray-600">{t("about.certifications_subtitle")}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-full">
              {certifications.map((cert, index) => (
                <Card
                  key={index}
                  className="text-center p-8 bg-white/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group max-w-full"
                >
                  <CardContent className="p-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <cert.icon className="h-10 w-10 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{cert.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-tenerife.jpg')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90"></div>

          <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("about.cta_title")}</h2>
            <p className="text-xl mb-8 opacity-90">{t("about.cta_description")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-full">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                {t("about.cta_view_excursions")}
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                {t("about.cta_contact")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
