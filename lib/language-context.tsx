"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "es" | "en" | "de"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.excursions": "Excursiones",
    "nav.contact": "Contacto",
    "nav.about": "Sobre Nosotros",
    "nav.booking": "Reservas",
    "nav.language": "Idioma",

    // Hero Section
    "hero.title": "Vive Tenerife",
    "hero.subtitle": "de forma extraordinaria",
    "hero.description": "¿Listo para vivir experiencias que cambiarán tu perspectiva de Tenerife para siempre?",
    "hero.description2": "Tu próxima gran aventura está a solo un mensaje de distancia.",
    "hero.search": "Buscar excursiones...",

    // Featured Excursions
    "featured.title": "Aventuras que Enamoran",
    "featured.subtitle": "Cada experiencia está diseñada para crear recuerdos que durarán toda la vida",
    "featured.book": "Reservar por WhatsApp",
    "featured.from": "Desde",
    "featured.badge": "Experiencias Más Valoradas",
    "featured.view_all": "Descubrir Todas las Aventuras",
    "featured.whatsapp_interest": "Hola! Me interesa la excursión",
    "featured.whatsapp_info": "¿Podrían darme más información?",
    // Featured Excursions - Dropdown específico
    "featured.teide_stars": "Teide y Estrellas",
    "featured.whale_watching": "Avistamiento Ballenas",
    "featured.anaga_hiking": "Senderismo Anaga",
    "featured.view_all_short": "Ver Todas",

    // Reviews
    "reviews.title": "Lo que Dicen Nuestros Clientes",
    "reviews.subtitle": "Experiencias reales de viajeros satisfechos",

    // Footer
    "footer.quick_links": "Enlaces Rápidos",
    "footer.contact_info": "Información de Contacto",
    "footer.follow_us": "Síguenos",
    "footer.newsletter": "Newsletter",
    "footer.newsletter_text": "Suscríbete para recibir ofertas especiales",
    "footer.subscribe": "Suscribirse",
    "footer.privacy": "Política de Privacidad",
    "footer.terms": "Términos y Condiciones",
    "footer.faq": "Preguntas Frecuentes",
    // Footer - Textos específicos
    "footer.company_description":
      "Explora Tenerife como nunca antes con excursiones diseñadas para crear recuerdos inolvidables.",
    "footer.copyright": "© 2024 TenerifeParadiseTours. Todos los derechos reservados.",
    "footer.designed_by": "Diseñado por",

    // Contact
    "contact.title": "Contáctanos",
    "contact.subtitle": "Estamos aquí para ayudarte a planificar tu aventura perfecta",
    "contact.subtitle_extended":
      "Nuestro equipo de expertos locales está listo para diseñar la experiencia de tus sueños en Tenerife.",
    "contact.name": "Nombre",
    "contact.email": "Email",
    "contact.phone": "Teléfono",
    "contact.message": "Mensaje",
    "contact.send": "Enviar Mensaje",
    "contact.success_title": "¡Mensaje Enviado!",
    "contact.success_message":
      "Gracias por contactarnos. Nuestro equipo se pondrá en contacto contigo muy pronto para ayudarte a planificar tu aventura perfecta.",
    "contact.whatsapp_contact": "Contactar por WhatsApp",
    "contact.send_another": "Enviar Otro Mensaje",

    // Contact Page Specific
    "contact.here_to_help": "Estamos Aquí Para Ayudarte",
    "contact.perfect_adventure_starts": "Tu Aventura Perfecta Comienza Aquí",
    "contact.send_consultation": "Envíanos tu Consulta",
    "contact.tell_us_about_trip": "Cuéntanos sobre tu viaje ideal y te ayudaremos a hacerlo realidad",
    "contact.immediate_contact": "Contacto Inmediato",
    "contact.why_choose_us": "¿Por Qué Elegirnos?",
    "contact.faq_preview": "Preguntas Frecuentes",
    "contact.quick_response_question":
      "¿Necesitas una respuesta rápida? Contáctanos directamente por WhatsApp para atención inmediata.",
    "contact.open_whatsapp": "Abrir WhatsApp",
    "contact.attention_schedule": "Horario de Atención",
    "contact.schedule_text": "Lunes - Domingo: 8:00 - 20:00\nWhatsApp: 24/7 disponible",
    "contact.how_to_book": "¿Cómo puedo reservar?",
    "contact.how_to_book_answer":
      "Puedes reservar fácilmente a través de WhatsApp, nuestro formulario web o llamándonos directamente.",
    "contact.what_includes": "¿Qué incluyen las excursiones?",
    "contact.what_includes_answer":
      "Transporte, guía profesional, seguro y todas las actividades especificadas en cada tour.",
    "contact.group_discounts": "¿Hay descuentos para grupos?",
    "contact.group_discounts_answer": "Sí, ofrecemos descuentos especiales para grupos de 6 o más personas.",
    "contact.hero_badge": "Estamos Aquí Para Ayudarte",
    "contact.hero_subtitle": "Tu Aventura Perfecta Comienza Aquí",
    "contact.form_title": "Envíanos tu Consulta",
    "contact.form_subtitle": "Cuéntanos sobre tu viaje ideal y te ayudaremos a hacerlo realidad",
    "contact.faq": "Preguntas Frecuentes",

    // About
    "about.title": "Sobre TenerifeParadiseTours",
    "about.subtitle": "Tu Ventana al Paraíso",
    "about.description":
      "Somos una empresa familiar apasionada por mostrar la verdadera esencia de Tenerife. Con más de 15 años de experiencia, hemos ayudado a miles de viajeros a descubrir los rincones más mágicos de nuestra hermosa isla.",
    "about.mission": "Nuestra Misión",
    "about.mission_text":
      "Ofrecer experiencias auténticas y memorables que conecten a nuestros visitantes con la verdadera esencia de Tenerife, promoviendo un turismo responsable y sostenible.",
    "about.vision": "Nuestra Visión",
    "about.vision_text":
      "Ser la empresa de turismo más reconocida y respetada de Tenerife, siendo referente en calidad, sostenibilidad y experiencias únicas.",
    "about.values": "Nuestros Valores",
    "about.values_text":
      "Pasión, autenticidad, respeto por el medio ambiente, excelencia en el servicio y compromiso con la comunidad local.",
    "about.story_title": "Nuestra Historia",
    "about.story_badge": "Desde 2009",
    // About Page Specific
    "about.hero_badge": "Conoce Nuestra Historia",
    "about.achievements": "Nuestros Logros",
    "about.achievements_subtitle": "Números que reflejan nuestro compromiso con la excelencia",
    "about.stat_excursions": "Excursiones Diferentes",
    "about.stat_rating": "Valoración Media",
    "about.story_p1":
      "TenerifeParadiseTours nació del amor profundo por nuestra isla y el deseo de compartir sus tesoros ocultos con viajeros de todo el mundo. Fundada en 2009 por una familia local, comenzamos con un pequeño grupo de guías apasionados.",
    "about.story_p2":
      "A lo largo de los años, hemos crecido manteniendo siempre nuestros valores fundamentales: autenticidad, respeto por el medio ambiente y un servicio personalizado que hace que cada cliente se sienta especial.",
    "about.story_p3":
      "Hoy, somos reconocidos como una de las empresas de turismo más confiables de Tenerife, pero seguimos siendo esa familia que ama mostrar los secretos mejor guardados de nuestra isla.",
    "about.pillars_title": "Nuestros Pilares",
    "about.pillars_subtitle": "Los valores que nos definen y nos impulsan cada día",
    "about.value_passion_title": "Pasión por Tenerife",
    "about.value_passion_desc":
      "Amamos nuestra isla y queremos compartir su belleza contigo de la manera más auténtica posible.",
    "about.value_experience_title": "Experiencia Personalizada",
    "about.value_experience_desc": "Cada excursión está diseñada para ofrecerte una experiencia única y memorable.",
    "about.value_security_title": "Seguridad Garantizada",
    "about.value_security_desc":
      "Tu seguridad es nuestra prioridad. Todos nuestros tours cumplen con los más altos estándares.",
    "about.value_quality_title": "Calidad Excepcional",
    "about.value_quality_desc": "Nos esforzamos por superar tus expectativas en cada detalle de nuestros servicios.",
    "about.certifications_title": "Certificaciones y Reconocimientos",
    "about.certifications_subtitle": "Avalados por las principales organizaciones turísticas",
    "about.cert_sustainable": "Certificado de Turismo Sostenible",
    "about.cert_guides": "Guías Oficiales de Canarias",
    "about.cert_responsible": "Empresa Responsable",
    "about.cert_excellence": "Excelencia TripAdvisor",
    "about.cta_title": "¿Listo para Vivir la Experiencia?",
    "about.cta_description":
      "Únete a miles de aventureros que han confiado en nosotros para descubrir la verdadera magia de Tenerife",
    "about.cta_view_excursions": "Ver Nuestras Excursiones",
    "about.cta_contact": "Contactar Ahora",
    "about.team_caption": "Nuestro equipo",
    "about.team_subtitle": "Compartiendo pasión por Tenerife",
    // About Page - Certificaciones corregidas
    "about.cert_sustainable_tourism": "Certificado de Turismo Sostenible",
    "about.cert_official_guides": "Guías Oficiales de Canarias",
    "about.cert_responsible_company": "Empresa Responsable",
    "about.cert_tripadvisor_excellence": "Excelencia TripAdvisor",

    // Booking
    "booking.title": "Reservar Excursión",
    "booking.subtitle": "Completa el formulario y continúa tu reserva por WhatsApp.",
    "booking.subtitle2": "¡Tu próxima aventura está a solo unos clics!",
    "booking.select_excursion": "Seleccionar Excursión",
    "booking.date": "Fecha Preferida",
    "booking.people": "Número de Personas",
    "booking.requests": "Solicitudes Especiales",
    "booking.submit": "Continuar en WhatsApp",
    "booking.personal_info": "Información Personal",
    "booking.excursion_details": "Detalles de la Excursión",
    "booking.summary": "Resumen de Reserva",
    "booking.total_estimated": "Total estimado",
    "booking.per_person": "por persona",
    "booking.included_price": "Incluido en el precio:",
    "booking.transport": "Transporte ida y vuelta",
    "booking.guide": "Guía profesional",
    "booking.insurance": "Seguro de actividad",
    "booking.photos": "Fotos del recorrido",

    // Booking - Traducciones adicionales
    "booking.hero_badge": "Reserva tu aventura perfecta",
    "booking.form_title": "Información de Reserva",
    "booking.name_placeholder": "Tu nombre completo",
    "booking.email_placeholder": "tu@email.com",
    "booking.excursion_placeholder": "Elige tu aventura perfecta...",
    "booking.premium_label": "Premium",
    "booking.people_count": "persona|personas",
    "booking.requests_placeholder":
      "Cuéntanos sobre alergias, necesidades especiales, celebraciones o cualquier cosa que debamos saber...",
    "booking.processing": "Procesando...",
    "booking.duration_label": "Duración",
    "booking.category_label": "Categoría",
    "booking.rating_label": "Valoración",
    "booking.reviews_label": "reseñas",
    "booking.price_per_person": "Precio por persona",
    "booking.people_summary": "Personas",
    "booking.select_excursion_message": "Selecciona una excursión para ver el resumen",
    "booking.select_excursion_subtitle": "Elige tu aventura perfecta del formulario",
    "booking.why_choose_us": "¿Por qué elegirnos?",
    "booking.trust_guides": "Guías locales expertos",
    "booking.trust_groups": "Grupos reducidos",
    "booking.feature_confirmation": "Confirmación Inmediata",
    "booking.feature_confirmation_desc": "Recibe confirmación de tu reserva en WhatsApp en menos de 2 horas",
    "booking.feature_payment": "Pago Seguro",
    "booking.feature_payment_desc": "Paga de forma segura el día de la excursión o por transferencia",
    "booking.feature_experience": "Experiencia Premium",
    "booking.feature_experience_desc": "Grupos reducidos y atención personalizada para una experiencia única",
    "booking.trust_confirmation": "Confirmación inmediata",
    "booking.trust_cancellation": "Cancelación gratuita 24h",
    "booking.trust_support": "Soporte 24/7",
    "booking.success_title": "¡Reserva Iniciada!",
    "booking.success_message": "Abriendo WhatsApp con todos tus datos...",
    "booking.error_message": "Error al procesar la reserva. Por favor, inténtelo de nuevo.",
    "booking.whatsapp_greeting": "¡Hola! Quiero reservar una excursión",
    "booking.whatsapp_excursion": "Excursión",
    "booking.whatsapp_date": "Fecha preferida",
    "booking.whatsapp_people": "Personas",
    "booking.whatsapp_price": "Precio estimado",
    "booking.whatsapp_requests": "Solicitudes especiales",
    "booking.whatsapp_confirm": "¿Podrían confirmar la disponibilidad? ¡Gracias!",

    // Excursions Page
    "excursions.title": "Todas Nuestras",
    "excursions.title2": "Experiencias",
    "excursions.subtitle":
      "Descubre la magia de Tenerife con nuestras excursiones cuidadosamente seleccionadas. Desde aventuras en la naturaleza hasta experiencias gastronómicas únicas.",
    "excursions.filters": "Filtros y Búsqueda",
    "excursions.search_placeholder": "Buscar por nombre o descripción...",
    "excursions.all_categories": "Todas las categorías",
    "excursions.all_prices": "Todos los precios",
    "excursions.price_low": "Menos de €50",
    "excursions.price_medium": "€50 - €80",
    "excursions.price_high": "Más de €80",
    "excursions.sort_featured": "Destacadas",
    "excursions.sort_price_low": "Precio: Menor a Mayor",
    "excursions.sort_price_high": "Precio: Mayor a Menor",
    "excursions.sort_name": "Nombre A-Z",
    "excursions.found": "Experiencia",
    "excursions.found_plural": "Experiencias Encontradas",
    "excursions.showing_all": "Mostrando todas nuestras experiencias disponibles",
    "excursions.filtered_from": "Filtrado de",
    "excursions.total_experiences": "experiencias totales",
    "excursions.no_results": "No se encontraron excursiones",
    "excursions.no_results_text":
      "No encontramos excursiones que coincidan con tus filtros. Prueba ajustando los criterios de búsqueda.",
    "excursions.view_all": "Ver todas las excursiones",
    "excursions.clear_filters": "Limpiar todos",
    "excursions.custom_experience": "¿No encuentras lo que buscas?",
    "excursions.custom_text":
      "Nuestro equipo puede crear experiencias personalizadas según tus intereses. Contáctanos y diseñaremos la aventura perfecta para ti.",
    "excursions.contact_custom": "Contactar para Experiencia Personalizada",

    // Common
    "common.loading": "Cargando...",
    "common.error": "Error al cargar datos",
    "common.success": "Éxito",
    "common.duration": "Duración",
    "common.price": "Precio",
    "common.category": "Categoría",
    "common.rating": "Valoración",
    "common.reviews": "reseñas",
    "common.free_cancellation": "Cancelación gratuita",
    "common.small_group": "Grupo reducido",
    "common.all_ratings": "Todas con valoración 4.8+ ⭐",
    "common.preparing": "Preparando tu aventura...",
    "common.loading_experiences": "Cargando experiencias...",

    // CTA Sections
    "cta.adventure_title": "Comienza tu",
    "cta.adventure_title2": "Aventura Perfecta",
    "cta.adventure_text": "Empieza esta aventura con nosotros y descubre la cara más auténtica de la isla",
    "cta.adventure_text2": "Tu historia extraordinaria comienza con un solo clic.",
    "cta.book_now": "Reservar Ahora",
    "cta.more_info": "Más Información",
    "cta.ready_title": "¿Listo Para Tu Próxima Aventura?",
    "cta.ready_text":
      "Nuestro equipo está esperando para ayudarte a crear recuerdos inolvidables en Tenerife. ¡Tu aventura perfecta está a solo un mensaje de distancia!",
    "cta.contact_now": "Contactar Ahora",
    "cta.view_excursions": "Ver Excursiones",

    // Contact Info
    "contact_info.phone": "Teléfono",
    "contact_info.whatsapp": "WhatsApp",
    "contact_info.email": "Email",
    "contact_info.location": "Ubicación",
    "contact_info.available": "Disponible 8:00 - 20:00",
    "contact_info.immediate_response": "Respuesta inmediata",
    "contact_info.response_time": "Respuesta en 2-4 horas",
    "contact_info.canary_islands": "Islas Canarias, España",

    // Trust Indicators
    "trust.guaranteed_response": "Respuesta Garantizada",
    "trust.guaranteed_text": "Te respondemos en menos de 2 horas",
    "trust.personal_attention": "Atención Personalizada",
    "trust.personal_text": "Cada consulta recibe atención individual",
    "trust.multilingual": "Multiidioma",
    "trust.multilingual_text": "Hablamos español, inglés y alemán",
    "trust.service_passion": "Pasión por el Servicio",
    "trust.service_text": "Nos encanta ayudarte a planificar tu aventura",

    // Quick Booking
    "quick.title": "Reserva Rápida",
    "quick.subtitle": "Reserva tu aventura en 3 simples pasos",
    "quick.step1": "Elegir Excursión",
    "quick.step2": "Tus Datos",
    "quick.step3": "Confirmar",
    "quick.step4": "¡Listo!",
    "quick.choose_experience": "Elige tu Experiencia Favorita",
    "quick.contact_data": "Tus Datos de Contacto",
    "quick.confirm_booking": "Confirma tu Reserva",
    "quick.booking_started": "¡Reserva Iniciada!",
    "quick.whatsapp_opening": "Abriendo WhatsApp con todos tus datos...",

    // Categories
    "category.naturaleza": "Naturaleza",
    "category.marina": "Marina",
    "category.senderismo": "Senderismo",
    "category.gastronomia": "Gastronomía",
    "category.paisajes": "Paisajes",
    "category.familia": "Familia",
    "category.aventura": "Aventura",
    "category.cultural": "Cultural",

    // Gallery
    "gallery.badge": "Galería de Fotos",
    "gallery.title": "Descubre Tenerife",
    "gallery.subtitle": "Una colección de los momentos más increíbles de nuestras excursiones",
    "gallery.loading": "Cargando galería...",
    "gallery.no_images": "No hay imágenes disponibles",
    "gallery.close": "Cerrar",
    "gallery.previous": "Anterior",
    "gallery.next": "Siguiente",
    "gallery.instructions": "Usa las flechas del teclado o haz clic para navegar",

    // Privacy Policy
    "privacy.title": "Política de Privacidad",
    "privacy.subtitle": "TenerifeParadiseTours - Actualizada: Enero 2024",
    "privacy.intro.title": "Compromiso con tu Privacidad",
    "privacy.intro.content":
      "En TenerifeParadiseTours, respetamos y protegemos tu privacidad. Esta política explica cómo recopilamos, utilizamos y protegemos tu información personal cuando utilizas nuestros servicios. Cumplimos con el Reglamento General de Protección de Datos (RGPD) y la legislación española de protección de datos.",

    "privacy.section1.title": "1. Información que Recopilamos",
    "privacy.section1.content1": "• Datos personales: nombre, email, teléfono cuando realizas una reserva",
    "privacy.section1.content2": "• Información de contacto para comunicarnos contigo sobre tu excursión",
    "privacy.section1.content3": "• Preferencias de idioma y solicitudes especiales",
    "privacy.section1.content4": "• Datos de navegación para mejorar nuestro sitio web",

    "privacy.section2.title": "2. Cómo Utilizamos tu Información",
    "privacy.section2.content1": "• Procesar y confirmar tus reservas de excursiones",
    "privacy.section2.content2": "• Enviarte información relevante sobre tu experiencia",
    "privacy.section2.content3": "• Mejorar nuestros servicios y experiencia del usuario",
    "privacy.section2.content4": "• Cumplir con obligaciones legales y de seguridad",

    "privacy.section3.title": "3. Protección de Datos",
    "privacy.section3.content1": "• Utilizamos encriptación SSL para proteger tus datos",
    "privacy.section3.content2": "• No compartimos tu información con terceros sin tu consentimiento",
    "privacy.section3.content3": "• Almacenamos tus datos de forma segura en servidores protegidos",
    "privacy.section3.content4": "• Solo el personal autorizado tiene acceso a tu información",

    "privacy.section4.title": "4. Tus Derechos",
    "privacy.section4.content1": "• Derecho a acceder a tus datos personales",
    "privacy.section4.content2": "• Derecho a rectificar información incorrecta",
    "privacy.section4.content3": "• Derecho a eliminar tus datos (derecho al olvido)",
    "privacy.section4.content4": "• Derecho a la portabilidad de datos",

    "privacy.section5.title": "5. Cookies y Tecnologías Similares",
    "privacy.section5.content1": "• Utilizamos cookies esenciales para el funcionamiento del sitio",
    "privacy.section5.content2": "• Cookies de análisis para entender cómo usas nuestro sitio",
    "privacy.section5.content3": "• Puedes gestionar las cookies desde tu navegador",
    "privacy.section5.content4": "• No utilizamos cookies de terceros para publicidad",

    "privacy.section6.title": "6. Contacto y Consultas",
    "privacy.section6.content1": "• Para ejercer tus derechos, contacta: info@tenerifeparadisetours.com",
    "privacy.section6.content2": "• Responderemos a tu solicitud en un plazo máximo de 30 días",
    "privacy.section6.content3": "• Puedes presentar una queja ante la Agencia Española de Protección de Datos",
    "privacy.section6.content4": "• Nuestro delegado de protección de datos está disponible para consultas",

    "privacy.contact_info.title": "Información de Contacto",
    "privacy.contact_info.company": "Empresa",
    "privacy.contact_info.company_name": "TenerifeParadiseTours S.L.",
    "privacy.contact_info.cif": "CIF",
    "privacy.contact_info.cif_number": "B-12345678",
    "privacy.contact_info.address": "Dirección",
    "privacy.contact_info.address_text": "Santa Cruz de Tenerife, España",
    "privacy.contact_info.email": "Email",
    "privacy.contact_info.email_address": "Tenerifeparadisetoursandexcursions@hotmail.com",
    "privacy.contact_info.phone": "Teléfono",
    "privacy.contact_info.phone_number": "+34 617 30 39 29",

    "privacy.buttons.understood": "Entendido",
    "privacy.buttons.print": "Imprimir Política",

    // Terms and Conditions
    "terms.title": "Términos y Condiciones",
    "terms.subtitle": "TenerifeParadiseTours - Vigentes desde Enero 2024",
    "terms.intro.title": "Condiciones Generales de Contratación",
    "terms.intro.content":
      "Estos términos y condiciones regulan la prestación de servicios turísticos por parte de TenerifeParadiseTours S.L. Al realizar una reserva, aceptas cumplir con estas condiciones. Te recomendamos leer detenidamente este documento antes de confirmar tu reserva.",

    "terms.section1.title": "1. Aceptación de los Términos",
    "terms.section1.content1": "• Al utilizar nuestros servicios, aceptas estos términos y condiciones",
    "terms.section1.content2": "• Estos términos se aplican a todas las reservas y servicios de TenerifeParadiseTours",
    "terms.section1.content3": "• Nos reservamos el derecho de modificar estos términos en cualquier momento",
    "terms.section1.content4": "• Es tu responsabilidad revisar periódicamente estos términos",

    "terms.section2.title": "2. Reservas y Confirmaciones",
    "terms.section2.content1": "• Las reservas se confirman mediante WhatsApp o email",
    "terms.section2.content2": "• Se requiere información personal válida para procesar la reserva",
    "terms.section2.content3": "• Los precios pueden variar según temporada y disponibilidad",
    "terms.section2.content4": "• La confirmación final depende de la disponibilidad en la fecha solicitada",

    "terms.section3.title": "3. Precios y Pagos",
    "terms.section3.content1": "• Los precios incluyen transporte, guía y actividades especificadas",
    "terms.section3.content2": "• El pago se realiza el día de la excursión o por transferencia previa",
    "terms.section3.content3": "• Los precios están sujetos a cambios sin previo aviso",
    "terms.section3.content4": "• No se incluyen comidas ni gastos personales salvo indicación contraria",

    "terms.section4.title": "4. Cancelaciones y Modificaciones",
    "terms.section4.content1": "• Cancelación gratuita hasta 24 horas antes de la excursión",
    "terms.section4.content2": "• Cancelaciones tardías pueden estar sujetas a penalizaciones",
    "terms.section4.content3": "• Modificaciones de fecha sujetas a disponibilidad",
    "terms.section4.content4": "• No se realizan reembolsos por no presentarse (no-show)",

    "terms.section5.title": "5. Responsabilidades y Seguros",
    "terms.section5.content1": "• Todas las excursiones incluyen seguro de responsabilidad civil",
    "terms.section5.content2": "• Los participantes deben informar sobre condiciones médicas relevantes",
    "terms.section5.content3": "• TenerifeParadiseTours no se responsabiliza por objetos personales perdidos",
    "terms.section5.content4": "• Se requiere seguir las instrucciones del guía en todo momento",

    "terms.section6.title": "6. Comportamiento y Normas",
    "terms.section6.content1": "• Se espera un comportamiento respetuoso hacia guías y otros participantes",
    "terms.section6.content2": "• Prohibido el consumo de alcohol durante las excursiones",
    "terms.section6.content3": "• Nos reservamos el derecho de excluir a participantes disruptivos",
    "terms.section6.content4": "• Es obligatorio seguir las normas de seguridad establecidas",

    "terms.important_notice.title": "Aviso Importante",
    "terms.important_notice.content":
      "Las condiciones meteorológicas adversas pueden resultar en la cancelación o modificación de excursiones por razones de seguridad. En estos casos, se ofrecerá una fecha alternativa o reembolso completo.",

    "terms.legal_info.title": "Información Legal",
    "terms.legal_info.company": "Razón Social",
    "terms.legal_info.company_name": "TenerifeParadiseTours S.L.",
    "terms.legal_info.cif": "CIF",
    "terms.legal_info.cif_number": "B-12345678",
    "terms.legal_info.license": "Licencia Turística",
    "terms.legal_info.license_number": "AT-123456",
    "terms.legal_info.registry": "Registro Mercantil",
    "terms.legal_info.registry_text": "Santa Cruz de Tenerife, Tomo 1234, Folio 567",
    "terms.legal_info.jurisdiction": "Jurisdicción",
    "terms.legal_info.jurisdiction_text": "Tribunales de Santa Cruz de Tenerife",

    "terms.buttons.accept": "Acepto los Términos",
    "terms.buttons.print": "Imprimir Términos",

    // FAQ
    "faq.title": "Preguntas Frecuentes",
    "faq.subtitle": "Resolvemos tus dudas más comunes",
    "faq.intro.title": "¿Tienes alguna duda?",
    "faq.intro.content":
      "Aquí encontrarás respuestas a las preguntas más frecuentes sobre nuestras excursiones. Si no encuentras lo que buscas, no dudes en contactarnos por WhatsApp o teléfono.",

    // FAQ Category 1: Reservas y Cancelaciones
    "faq.category1.title": "Reservas y Cancelaciones",
    "faq.category1.q1.question": "¿Cómo puedo reservar una excursión?",
    "faq.category1.q1.answer":
      "Puedes reservar de tres formas: 1) A través de nuestro formulario web, 2) Contactándonos por WhatsApp al +34 617 30 39 29, o 3) Llamándonos directamente. Te confirmaremos la disponibilidad en menos de 2 horas.",
    "faq.category1.q2.question": "¿Puedo cancelar mi reserva?",
    "faq.category1.q2.answer":
      "Sí, ofrecemos cancelación gratuita hasta 24 horas antes de la excursión. Para cancelaciones con menos de 24 horas, consulta nuestros términos y condiciones.",
    "faq.category1.q3.question": "¿Qué pasa si llueve el día de mi excursión?",
    "faq.category1.q3.answer":
      "Monitoreamos constantemente las condiciones meteorológicas. Si el tiempo no es seguro, te ofreceremos cambiar la fecha o un reembolso completo. La seguridad es nuestra prioridad.",

    // FAQ Category 2: Precios y Pagos
    "faq.category2.title": "Precios y Pagos",
    "faq.category2.q1.question": "¿Qué incluye el precio de la excursión?",
    "faq.category2.q1.answer":
      "Nuestros precios incluyen: transporte en vehículo cómodo, guía profesional certificado, seguro de responsabilidad civil, y todas las actividades especificadas. No incluye comidas ni gastos personales.",
    "faq.category2.q2.question": "¿Cuándo debo pagar?",
    "faq.category2.q2.answer":
      "Puedes pagar el día de la excursión en efectivo o tarjeta, o realizar una transferencia bancaria previa. Te enviaremos los detalles de pago al confirmar tu reserva.",
    "faq.category2.q3.question": "¿Hay descuentos para grupos?",
    "faq.category2.q3.answer":
      "¡Sí! Ofrecemos descuentos especiales para grupos de 6 o más personas. También tenemos tarifas reducidas para niños menores de 12 años. Contacta con nosotros para más detalles.",

    // FAQ Category 3: Grupos y Participantes
    "faq.category3.title": "Grupos y Participantes",
    "faq.category3.q1.question": "¿Cuál es el tamaño máximo del grupo?",
    "faq.category3.q1.answer":
      "Mantenemos grupos pequeños para una experiencia más personalizada. El máximo es de 8 personas por vehículo. Para grupos más grandes, utilizamos varios vehículos.",
    "faq.category3.q2.question": "¿Pueden participar niños?",
    "faq.category3.q2.answer":
      "¡Por supuesto! Nuestras excursiones son familiares. Los niños menores de 3 años viajan gratis. Tenemos asientos infantiles disponibles - solo avísanos al reservar.",
    "faq.category3.q3.question": "¿Qué nivel físico se requiere?",
    "faq.category3.q3.answer":
      "Cada excursión tiene un nivel de dificultad especificado. Desde paseos suaves hasta senderismo moderado. Te informaremos sobre los requisitos físicos al reservar.",

    // FAQ Category 4: Logística y Transporte
    "faq.category4.title": "Logística y Transporte",
    "faq.category4.q1.question": "¿Dónde es el punto de encuentro?",
    "faq.category4.q1.answer":
      "Tenemos varios puntos de recogida en las principales zonas turísticas. También ofrecemos recogida en hoteles en ciertas áreas. Te confirmaremos el punto exacto al reservar.",
    "faq.category4.q2.question": "¿Qué debo llevar?",
    "faq.category4.q2.answer":
      "Recomendamos: calzado cómodo, protector solar, agua, cámara, y ropa según la actividad. Te enviaremos una lista específica según tu excursión.",
    "faq.category4.q3.question": "¿Hablan otros idiomas además del español?",
    "faq.category4.q3.answer":
      "Sí, nuestros guías hablan español, inglés y alemán. Algunos también hablan francés e italiano. Especifica tu idioma preferido al reservar.",

    // FAQ Contact Section
    "faq.contact.title": "¿No encuentras tu respuesta?",
    "faq.contact.content": "Nuestro equipo está disponible para resolver cualquier duda específica sobre tu excursión.",
    "faq.contact.whatsapp": "WhatsApp: +34 617 30 39 29",
    "faq.contact.schedule": "Horario: 8:00 - 20:00",

    // FAQ Buttons
    "faq.buttons.close": "Cerrar FAQ",
    "faq.buttons.print": "Imprimir FAQ",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.excursions": "Excursions",
    "nav.contact": "Contact",
    "nav.about": "About Us",
    "nav.booking": "Booking",
    "nav.language": "Language",

    // Hero Section
    "hero.title": "Experience Tenerife",
    "hero.subtitle": "in an extraordinary way",
    "hero.description": "Ready to live experiences that will change your perspective of Tenerife forever?",
    "hero.description2": "Your next great adventure is just one message away.",
    "hero.search": "Search excursions...",

    // Featured Excursions
    "featured.title": "Adventures that Captivate",
    "featured.subtitle": "Each experience is designed to create memories that will last a lifetime",
    "featured.book": "Book via WhatsApp",
    "featured.from": "From",
    "featured.badge": "Most Valued Experiences",
    "featured.view_all": "Discover All Adventures",
    "featured.whatsapp_interest": "Hello! I'm interested in the excursion",
    "featured.whatsapp_info": "Could you give me more information?",
    // Featured Excursions - Dropdown específico
    "featured.teide_stars": "Teide & Stars",
    "featured.whale_watching": "Whale Watching",
    "featured.anaga_hiking": "Anaga Hiking",
    "featured.view_all_short": "View All",

    // Reviews
    "reviews.title": "What Our Customers Say",
    "reviews.subtitle": "Real experiences from satisfied travelers",

    // Footer
    "footer.quick_links": "Quick Links",
    "footer.contact_info": "Contact Information",
    "footer.follow_us": "Follow Us",
    "footer.newsletter": "Newsletter",
    "footer.newsletter_text": "Subscribe to receive special offers",
    "footer.subscribe": "Subscribe",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms and Conditions",
    "footer.faq": "FAQ",
    // Footer - Textos específicos
    "footer.company_description":
      "Explore Tenerife like never before with excursions designed to create unforgettable memories.",
    "footer.copyright": "© 2024 TenerifeParadiseTours. All rights reserved.",
    "footer.designed_by": "Designed by",

    // Contact
    "contact.title": "Contact Us",
    "contact.subtitle": "We are here to help you plan your perfect adventure",
    "contact.subtitle_extended": "Our team of local experts is ready to design your dream experience in Tenerife.",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.message": "Message",
    "contact.send": "Send Message",
    "contact.success_title": "Message Sent!",
    "contact.success_message":
      "Thank you for contacting us. Our team will get in touch with you very soon to help you plan your perfect adventure.",
    "contact.whatsapp_contact": "Contact via WhatsApp",
    "contact.send_another": "Send Another Message",

    // Contact Page Specific
    "contact.here_to_help": "We Are Here To Help You",
    "contact.perfect_adventure_starts": "Your Perfect Adventure Starts Here",
    "contact.send_consultation": "Send Us Your Inquiry",
    "contact.tell_us_about_trip": "Tell us about your ideal trip and we'll help you make it a reality",
    "contact.immediate_contact": "Immediate Contact",
    "contact.why_choose_us": "Why Choose Us?",
    "contact.faq_preview": "Frequently Asked Questions",
    "contact.quick_response_question":
      "Need a quick response? Contact us directly via WhatsApp for immediate attention.",
    "contact.open_whatsapp": "Open WhatsApp",
    "contact.attention_schedule": "Service Hours",
    "contact.schedule_text": "Monday - Sunday: 8:00 AM - 8:00 PM\nWhatsApp: 24/7 available",
    "contact.how_to_book": "How can I book?",
    "contact.how_to_book_answer": "You can easily book through WhatsApp, our web form or by calling us directly.",
    "contact.what_includes": "What do the excursions include?",
    "contact.what_includes_answer":
      "Transport, professional guide, insurance and all activities specified in each tour.",
    "contact.group_discounts": "Are there group discounts?",
    "contact.group_discounts_answer": "Yes, we offer special discounts for groups of 6 or more people.",
    "contact.hero_badge": "We Are Here To Help You",
    "contact.hero_subtitle": "Your Perfect Adventure Starts Here",
    "contact.form_title": "Send Us Your Inquiry",
    "contact.form_subtitle": "Tell us about your ideal trip and we'll help you make it a reality",
    "contact.faq": "Frequently Asked Questions",

    // About
    "about.title": "About TenerifeParadiseTours",
    "about.subtitle": "Your Gateway to Paradise",
    "about.description":
      "We are a family business passionate about showing the true essence of Tenerife. With over 15 years of experience, we have helped thousands of travelers discover the most magical corners of our beautiful island.",
    "about.mission": "Our Mission",
    "about.mission_text":
      "To offer authentic and memorable experiences that connect our visitors with the true essence of Tenerife, promoting responsible and sustainable tourism.",
    "about.vision": "Our Vision",
    "about.vision_text":
      "To be the most recognized and respected tourism company in Tenerife, being a reference in quality, sustainability and unique experiences.",
    "about.values": "Our Values",
    "about.values_text":
      "Passion, authenticity, respect for the environment, excellence in service and commitment to the local community.",
    "about.story_title": "Our Story",
    "about.story_badge": "Since 2009",
    // About Page Specific
    "about.hero_badge": "Learn Our Story",
    "about.achievements": "Our Achievements",
    "about.achievements_subtitle": "Numbers that reflect our commitment to excellence",
    "about.stat_excursions": "Different Excursions",
    "about.stat_rating": "Average Rating",
    "about.story_p1":
      "TenerifeParadiseTours was born from a deep love for our island and the desire to share its hidden treasures with travelers from around the world. Founded in 2009 by a local family, we started with a small group of passionate guides.",
    "about.story_p2":
      "Over the years, we have grown while always maintaining our core values: authenticity, respect for the environment, and personalized service that makes every client feel special.",
    "about.story_p3":
      "Today, we are recognized as one of the most trusted tourism companies in Tenerife, but we remain that family that loves to show the best-kept secrets of our island.",
    "about.pillars_title": "Our Pillars",
    "about.pillars_subtitle": "The values that define us and drive us every day",
    "about.value_passion_title": "Passion for Tenerife",
    "about.value_passion_desc":
      "We love our island and want to share its beauty with you in the most authentic way possible.",
    "about.value_experience_title": "Personalized Experience",
    "about.value_experience_desc": "Each excursion is designed to offer you a unique and memorable experience.",
    "about.value_security_title": "Guaranteed Safety",
    "about.value_security_desc": "Your safety is our priority. All our tours meet the highest standards.",
    "about.value_quality_title": "Exceptional Quality",
    "about.value_quality_desc": "We strive to exceed your expectations in every detail of our services.",
    "about.certifications_title": "Certifications and Recognition",
    "about.certifications_subtitle": "Endorsed by leading tourism organizations",
    "about.cert_sustainable": "Sustainable Tourism Certificate",
    "about.cert_guides": "Official Canary Islands Guides",
    "about.cert_responsible": "Responsible Company",
    "about.cert_excellence": "TripAdvisor Excellence",
    "about.cta_title": "Ready to Live the Experience?",
    "about.cta_description": "Join thousands of adventurers who have trusted us to discover the true magic of Tenerife",
    "about.cta_view_excursions": "View Our Excursions",
    "about.cta_contact": "Contact Now",
    "about.team_caption": "Our team",
    "about.team_subtitle": "Sharing passion for Tenerife",
    // About Page - Certificaciones corregidas
    "about.cert_sustainable_tourism": "Sustainable Tourism Certificate",
    "about.cert_official_guides": "Official Canary Islands Guides",
    "about.cert_responsible_company": "Responsible Company",
    "about.cert_tripadvisor_excellence": "TripAdvisor Excellence",

    // Booking
    "booking.title": "Book Excursion",
    "booking.subtitle": "Complete the form and continue your booking via WhatsApp.",
    "booking.subtitle2": "Your next adventure is just a few clicks away!",
    "booking.select_excursion": "Select Excursion",
    "booking.date": "Preferred Date",
    "booking.people": "Number of People",
    "booking.requests": "Special Requests",
    "booking.submit": "Continue on WhatsApp",
    "booking.personal_info": "Personal Information",
    "booking.excursion_details": "Excursion Details",
    "booking.summary": "Booking Summary",
    "booking.total_estimated": "Estimated total",
    "booking.per_person": "per person",
    "booking.included_price": "Included in the price:",
    "booking.transport": "Round trip transport",
    "booking.guide": "Professional guide",
    "booking.insurance": "Activity insurance",
    "booking.photos": "Tour photos",

    // Booking - Traducciones adicionales
    "booking.hero_badge": "Book your perfect adventure",
    "booking.form_title": "Booking Information",
    "booking.name_placeholder": "Your full name",
    "booking.email_placeholder": "your@email.com",
    "booking.excursion_placeholder": "Choose your perfect adventure...",
    "booking.premium_label": "Premium",
    "booking.people_count": "person|people",
    "booking.requests_placeholder":
      "Tell us about allergies, special needs, celebrations or anything we should know...",
    "booking.processing": "Processing...",
    "booking.duration_label": "Duration",
    "booking.category_label": "Category",
    "booking.rating_label": "Rating",
    "booking.reviews_label": "reviews",
    "booking.price_per_person": "Price per person",
    "booking.people_summary": "People",
    "booking.select_excursion_message": "Select an excursion to see the summary",
    "booking.select_excursion_subtitle": "Choose your perfect adventure from the form",
    "booking.why_choose_us": "Why choose us?",
    "booking.trust_guides": "Expert local guides",
    "booking.trust_groups": "Small groups",
    "booking.feature_confirmation": "Immediate Confirmation",
    "booking.feature_confirmation_desc": "Receive booking confirmation via WhatsApp in less than 2 hours",
    "booking.feature_payment": "Secure Payment",
    "booking.feature_payment_desc": "Pay securely on the day of the excursion or by bank transfer",
    "booking.feature_experience": "Premium Experience",
    "booking.feature_experience_desc": "Small groups and personalized attention for a unique experience",
    "booking.trust_confirmation": "Immediate confirmation",
    "booking.trust_cancellation": "Free cancellation 24h",
    "booking.trust_support": "24/7 Support",
    "booking.success_title": "Booking Started!",
    "booking.success_message": "Opening WhatsApp with all your details...",
    "booking.error_message": "Error processing booking. Please try again.",
    "booking.whatsapp_greeting": "Hello! I want to book an excursion",
    "booking.whatsapp_excursion": "Excursion",
    "booking.whatsapp_date": "Preferred date",
    "booking.whatsapp_people": "People",
    "booking.whatsapp_price": "Estimated price",
    "booking.whatsapp_requests": "Special requests",
    "booking.whatsapp_confirm": "Could you confirm availability? Thank you!",

    // Excursions Page
    "excursions.title": "All Our",
    "excursions.title2": "Experiences",
    "excursions.subtitle":
      "Discover the magic of Tenerife with our carefully selected excursions. From nature adventures to unique gastronomic experiences.",
    "excursions.filters": "Filters and Search",
    "excursions.search_placeholder": "Search by name or description...",
    "excursions.all_categories": "All categories",
    "excursions.all_prices": "All prices",
    "excursions.price_low": "Less than €50",
    "excursions.price_medium": "€50 - €80",
    "excursions.price_high": "More than €80",
    "excursions.sort_featured": "Featured",
    "excursions.sort_price_low": "Price: Low to High",
    "excursions.sort_price_high": "Price: High to Low",
    "excursions.sort_name": "Name A-Z",
    "excursions.found": "Experience",
    "excursions.found_plural": "Experiences Found",
    "excursions.showing_all": "Showing all our available experiences",
    "excursions.filtered_from": "Filtered from",
    "excursions.total_experiences": "total experiences",
    "excursions.no_results": "No excursions found",
    "excursions.no_results_text":
      "We couldn't find excursions matching your filters. Try adjusting your search criteria.",

    "excursions.view_all": "View all excursions",
    "excursions.clear_filters": "Clear all",
    "excursions.custom_experience": "Can't find what you're looking for?",
    "excursions.custom_text":
      "Our team can create personalized experiences according to your interests. Contact us and we'll design the perfect adventure for you.",
    "excursions.contact_custom": "Contact for Custom Experience",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error loading data",
    "common.success": "Success",
    "common.duration": "Duration",
    "common.price": "Price",
    "common.category": "Category",
    "common.rating": "Rating",
    "common.reviews": "reviews",
    "common.free_cancellation": "Free cancellation",
    "common.small_group": "Small group",
    "common.all_ratings": "All with 4.8+ rating ⭐",
    "common.preparing": "Preparing your adventure...",
    "common.loading_experiences": "Loading experiences...",

    // CTA Sections
    "cta.adventure_title": "Start your",
    "cta.adventure_title2": "Perfect Adventure",
    "cta.adventure_text": "Start this adventure with us and discover the most authentic face of the island",
    "cta.adventure_text2": "Your extraordinary story begins with a single click.",
    "cta.book_now": "Book Now",
    "cta.more_info": "More Information",
    "cta.ready_title": "Ready For Your Next Adventure?",
    "cta.ready_text":
      "Our team is waiting to help you create unforgettable memories in Tenerife. Your perfect adventure is just one message away!",
    "cta.contact_now": "Contact Now",
    "cta.view_excursions": "View Excursions",

    // Contact Info
    "contact_info.phone": "Phone",
    "contact_info.whatsapp": "WhatsApp",
    "contact_info.email": "Email",
    "contact_info.location": "Location",
    "contact_info.available": "Available 8:00 AM - 8:00 PM",
    "contact_info.immediate_response": "Immediate response",
    "contact_info.response_time": "Response in 2-4 hours",
    "contact_info.canary_islands": "Canary Islands, Spain",

    // Trust Indicators
    "trust.guaranteed_response": "Guaranteed Response",
    "trust.guaranteed_text": "We respond in less than 2 hours",
    "trust.personal_attention": "Personal Attention",
    "trust.personal_text": "Each inquiry receives individual attention",
    "trust.multilingual": "Multilingual",
    "trust.multilingual_text": "We speak Spanish, English and German",
    "trust.service_passion": "Passion for Service",
    "trust.service_text": "We love helping you plan your adventure",

    // Quick Booking
    "quick.title": "Quick Booking",
    "quick.subtitle": "Book your adventure in 3 simple steps",
    "quick.step1": "Choose Excursion",
    "quick.step2": "Your Details",
    "quick.step3": "Confirm",
    "quick.step4": "Done!",
    "quick.choose_experience": "Choose Your Favorite Experience",
    "quick.contact_data": "Your Contact Details",
    "quick.confirm_booking": "Confirm Your Booking",
    "quick.booking_started": "Booking Started!",
    "quick.whatsapp_opening": "Opening WhatsApp with all your details...",

    // Categories
    "category.naturaleza": "Nature",
    "category.marina": "Marine",
    "category.senderismo": "Hiking",
    "category.gastronomia": "Gastronomy",
    "category.paisajes": "Landscapes",
    "category.familia": "Family",
    "category.aventura": "Adventure",
    "category.cultural": "Cultural",

    // Gallery
    "gallery.badge": "Photo Gallery",
    "gallery.title": "Discover Tenerife",
    "gallery.subtitle": "A collection of the most incredible moments from our excursions",
    "gallery.loading": "Loading gallery...",
    "gallery.no_images": "No images available",
    "gallery.close": "Close",
    "gallery.previous": "Previous",
    "gallery.next": "Next",
    "gallery.instructions": "Use keyboard arrows or click to navigate",

    // Privacy Policy
    "privacy.title": "Privacy Policy",
    "privacy.subtitle": "TenerifeParadiseTours - Updated: January 2024",
    "privacy.intro.title": "Commitment to Your Privacy",
    "privacy.intro.content":
      "At TenerifeParadiseTours, we respect and protect your privacy. This policy explains how we collect, use and protect your personal information when you use our services. We comply with the General Data Protection Regulation (GDPR) and Spanish data protection legislation.",

    "privacy.section1.title": "1. Information We Collect",
    "privacy.section1.content1": "• Personal data: name, email, phone when you make a booking",
    "privacy.section1.content2": "• Contact information to communicate with you about your excursion",
    "privacy.section1.content3": "• Language preferences and special requests",
    "privacy.section1.content4": "• Browsing data to improve our website",

    "privacy.section2.title": "2. How We Use Your Information",
    "privacy.section2.content1": "• Process and confirm your excursion bookings",
    "privacy.section2.content2": "• Send you relevant information about your experience",
    "privacy.section2.content3": "• Improve our services and user experience",
    "privacy.section2.content4": "• Comply with legal and security obligations",

    "privacy.section3.title": "3. Data Protection",
    "privacy.section3.content1": "• We use SSL encryption to protect your data",
    "privacy.section3.content2": "• We do not share your information with third parties without your consent",
    "privacy.section3.content3": "• We store your data securely on protected servers",
    "privacy.section3.content4": "• Only authorized personnel have access to your information",

    "privacy.section4.title": "4. Your Rights",
    "privacy.section4.content1": "• Right to access your personal data",
    "privacy.section4.content2": "• Right to rectify incorrect information",
    "privacy.section4.content3": "• Right to delete your data (right to be forgotten)",
    "privacy.section4.content4": "• Right to data portability",

    "privacy.section5.title": "5. Cookies and Similar Technologies",
    "privacy.section5.content1": "• We use essential cookies for site functionality",
    "privacy.section5.content2": "• Analytics cookies to understand how you use our site",
    "privacy.section5.content3": "• You can manage cookies from your browser",
    "privacy.section5.content4": "• We do not use third-party cookies for advertising",

    "privacy.section6.title": "6. Contact and Inquiries",
    "privacy.section6.content1": "• To exercise your rights, contact: info@tenerifeparadisetours.com",
    "privacy.section6.content2": "• We will respond to your request within a maximum of 30 days",
    "privacy.section6.content3": "• You can file a complaint with the Spanish Data Protection Agency",
    "privacy.section6.content4": "• Our data protection officer is available for inquiries",

    "privacy.contact_info.title": "Contact Information",
    "privacy.contact_info.company": "Company",
    "privacy.contact_info.company_name": "TenerifeParadiseTours S.L.",
    "privacy.contact_info.cif": "Tax ID",
    "privacy.contact_info.cif_number": "B-12345678",
    "privacy.contact_info.address": "Address",
    "privacy.contact_info.address_text": "Santa Cruz de Tenerife, Spain",
    "privacy.contact_info.email": "Email",
    "privacy.contact_info.email_address": "Tenerifeparadisetoursandexcursions@hotmail.com",
    "privacy.contact_info.phone": "Phone",
    "privacy.contact_info.phone_number": "+34 617 30 39 29",

    "privacy.buttons.understood": "Understood",
    "privacy.buttons.print": "Print Policy",

    // Terms and Conditions
    "terms.title": "Terms and Conditions",
    "terms.subtitle": "TenerifeParadiseTours - Effective from January 2024",
    "terms.intro.title": "General Terms of Service",
    "terms.intro.content":
      "These terms and conditions govern the provision of tourism services by TenerifeParadiseTours S.L. By making a booking, you agree to comply with these conditions. We recommend reading this document carefully before confirming your booking.",

    "terms.section1.title": "1. Acceptance of Terms",
    "terms.section1.content1": "• By using our services, you accept these terms and conditions",
    "terms.section1.content2": "• These terms apply to all bookings and services of TenerifeParadiseTours",
    "terms.section1.content3": "• We reserve the right to modify these terms at any time",
    "terms.section1.content4": "• It is your responsibility to periodically review these terms",

    "terms.section2.title": "2. Bookings and Confirmations",
    "terms.section2.content1": "• Bookings are confirmed via WhatsApp or email",
    "terms.section2.content2": "• Valid personal information is required to process the booking",
    "terms.section2.content3": "• Prices may vary according to season and availability",
    "terms.section2.content4": "• Final confirmation depends on availability on the requested date",

    "terms.section3.title": "3. Prices and Payments",
    "terms.section3.content1": "• Prices include transport, guide and specified activities",
    "terms.section3.content2": "• Payment is made on the day of the excursion or by prior transfer",
    "terms.section3.content3": "• Prices are subject to change without prior notice",
    "terms.section3.content4": "• Meals and personal expenses are not included unless otherwise indicated",

    "terms.section4.title": "4. Cancellations and Modifications",
    "terms.section4.content1": "• Free cancellation up to 24 hours before the excursion",
    "terms.section4.content2": "• Late cancellations may be subject to penalties",
    "terms.section4.content3": "• Date modifications subject to availability",
    "terms.section4.content4": "• No refunds for no-shows",

    "terms.section5.title": "5. Responsibilities and Insurance",
    "terms.section5.content1": "• All excursions include civil liability insurance",
    "terms.section5.content2": "• Participants must report relevant medical conditions",
    "terms.section5.content3": "• TenerifeParadiseTours is not responsible for lost personal items",
    "terms.section5.content4": "• Following guide instructions is required at all times",

    "terms.section6.title": "6. Behavior and Rules",
    "terms.section6.content1": "• Respectful behavior towards guides and other participants is expected",
    "terms.section6.content2": "• Alcohol consumption during excursions is prohibited",
    "terms.section6.content3": "• We reserve the right to exclude disruptive participants",
    "terms.section6.content4": "• Following established safety rules is mandatory",

    "terms.important_notice.title": "Important Notice",
    "terms.important_notice.content":
      "Adverse weather conditions may result in cancellation or modification of excursions for safety reasons. In these cases, an alternative date or full refund will be offered.",

    "terms.legal_info.title": "Legal Information",
    "terms.legal_info.company": "Company Name",
    "terms.legal_info.company_name": "TenerifeParadiseTours S.L.",
    "terms.legal_info.cif": "Tax ID",
    "terms.legal_info.cif_number": "B-12345678",
    "terms.legal_info.license": "Tourism License",
    "terms.legal_info.license_number": "AT-123456",
    "terms.legal_info.registry": "Commercial Registry",
    "terms.legal_info.registry_text": "Santa Cruz de Tenerife, Volume 1234, Folio 567",
    "terms.legal_info.jurisdiction": "Jurisdiction",
    "terms.legal_info.jurisdiction_text": "Courts of Santa Cruz de Tenerife",

    "terms.buttons.accept": "Accept Terms",
    "terms.buttons.print": "Print Terms",

    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "We solve your most common doubts",
    "faq.intro.title": "Do you have any questions?",
    "faq.intro.content":
      "Here you will find answers to the most frequently asked questions about our excursions. If you can't find what you're looking for, don't hesitate to contact us via WhatsApp or phone.",

    // FAQ Category 1: Bookings and Cancellations
    "faq.category1.title": "Bookings and Cancellations",
    "faq.category1.q1.question": "How can I book an excursion?",
    "faq.category1.q1.answer":
      "You can book in three ways: 1) Through our web form, 2) Contacting us via WhatsApp at +34 617 30 39 29, or 3) Calling us directly. We will confirm availability in less than 2 hours.",
    "faq.category1.q2.question": "Can I cancel my booking?",
    "faq.category1.q2.answer":
      "Yes, we offer free cancellation up to 24 hours before the excursion. For cancellations with less than 24 hours, check our terms and conditions.",
    "faq.category1.q3.question": "What happens if it rains on the day of my excursion?",
    "faq.category1.q3.answer":
      "We constantly monitor weather conditions. If the weather is not safe, we will offer you to change the date or a full refund. Safety is our priority.",

    // FAQ Category 2: Prices and Payments
    "faq.category2.title": "Prices and Payments",
    "faq.category2.q1.question": "What does the excursion price include?",
    "faq.category2.q1.answer":
      "Our prices include: transport in comfortable vehicle, certified professional guide, civil liability insurance, and all specified activities. It does not include meals or personal expenses.",
    "faq.category2.q2.question": "When should I pay?",
    "faq.category2.q2.answer":
      "You can pay on the day of the excursion in cash or card, or make a prior bank transfer. We will send you payment details when confirming your booking.",
    "faq.category2.q3.question": "Are there group discounts?",
    "faq.category2.q3.answer":
      "Yes! We offer special discounts for groups of 6 or more people. We also have reduced rates for children under 12 years. Contact us for more details.",

    // FAQ Category 3: Groups and Participants
    "faq.category3.title": "Groups and Participants",
    "faq.category3.q1.question": "What is the maximum group size?",
    "faq.category3.q1.answer":
      "We keep groups small for a more personalized experience. The maximum is 8 people per vehicle. For larger groups, we use multiple vehicles.",
    "faq.category3.q2.question": "Can children participate?",
    "faq.category3.q2.answer":
      "Of course! Our excursions are family-friendly. Children under 3 years travel free. We have child seats available - just let us know when booking.",
    "faq.category3.q3.question": "What fitness level is required?",
    "faq.category3.q3.answer":
      "Each excursion has a specified difficulty level. From gentle walks to moderate hiking. We will inform you about physical requirements when booking.",

    // FAQ Category 4: Logistics and Transport
    "faq.category4.title": "Logistics and Transport",
    "faq.category4.q1.question": "Where is the meeting point?",
    "faq.category4.q1.answer":
      "We have several pickup points in the main tourist areas. We also offer hotel pickup in certain areas. We will confirm the exact point when booking.",
    "faq.category4.q2.question": "What should I bring?",
    "faq.category4.q2.answer":
      "We recommend: comfortable shoes, sunscreen, water, camera, and clothing according to the activity. We will send you a specific list according to your excursion.",
    "faq.category4.q3.question": "Do you speak other languages besides English?",
    "faq.category4.q3.answer":
      "Yes, our guides speak Spanish, English and German. Some also speak French and Italian. Specify your preferred language when booking.",

    // FAQ Contact Section
    "faq.contact.title": "Can't find your answer?",
    "faq.contact.content": "Our team is available to resolve any specific questions about your excursion.",
    "faq.contact.whatsapp": "WhatsApp: +34 617 30 39 29",
    "faq.contact.schedule": "Hours: 8:00 AM - 8:00 PM",

    // FAQ Buttons
    "faq.buttons.close": "Close FAQ",
    "faq.buttons.print": "Print FAQ",
  },
  de: {
    // Navigation
    "nav.home": "Startseite",
    "nav.excursions": "Ausflüge",
    "nav.contact": "Kontakt",
    "nav.about": "Über Uns",
    "nav.booking": "Buchung",
    "nav.language": "Sprache",

    // Hero Section
    "hero.title": "Erleben Sie Teneriffa",
    "hero.subtitle": "auf außergewöhnliche Weise",
    "hero.description": "Bereit für Erlebnisse, die Ihre Sicht auf Teneriffa für immer verändern werden?",
    "hero.description2": "Ihr nächstes großes Abenteuer ist nur eine Nachricht entfernt.",
    "hero.search": "Ausflüge suchen...",

    // Featured Excursions
    "featured.title": "Abenteuer, die Begeistern",
    "featured.subtitle": "Jedes Erlebnis ist darauf ausgelegt, Erinnerungen zu schaffen, die ein Leben lang halten",
    "featured.book": "Über WhatsApp buchen",
    "featured.from": "Ab",
    "featured.badge": "Bestbewertete Erlebnisse",
    "featured.view_all": "Alle Abenteuer Entdecken",
    "featured.whatsapp_interest": "Hallo! Ich interessiere mich für den Ausflug",
    "featured.whatsapp_info": "Könnten Sie mir weitere Informationen geben?",
    // Featured Excursions - Dropdown específico
    "featured.teide_stars": "Teide & Sterne",
    "featured.whale_watching": "Walbeobachtung",
    "featured.anaga_hiking": "Anaga Wanderung",
    "featured.view_all_short": "Alle Anzeigen",

    // Reviews
    "reviews.title": "Was Unsere Kunden Sagen",
    "reviews.subtitle": "Echte Erfahrungen zufriedener Reisender",

    // Footer
    "footer.quick_links": "Schnelle Links",
    "footer.contact_info": "Kontaktinformationen",
    "footer.follow_us": "Folgen Sie Uns",
    "footer.newsletter": "Newsletter",
    "footer.newsletter_text": "Abonnieren Sie für spezielle Angebote",
    "footer.subscribe": "Abonnieren",
    "footer.privacy": "Datenschutz",
    "footer.terms": "Geschäftsbedingungen",
    "footer.faq": "FAQ",
    // Footer - Textos específicos
    "footer.company_description":
      "Entdecken Sie Teneriffa wie nie zuvor mit Ausflügen, die unvergessliche Erinnerungen schaffen.",
    "footer.copyright": "© 2024 TenerifeParadiseTours. Alle Rechte vorbehalten.",
    "footer.designed_by": "Entworfen von",

    // Contact
    "contact.title": "Kontaktieren Sie Uns",
    "contact.subtitle": "Wir helfen Ihnen bei der Planung Ihres perfekten Abenteuers",
    "contact.subtitle_extended":
      "Unser Team lokaler Experten ist bereit, Ihr Traumerlebnis auf Teneriffa zu gestalten.",
    "contact.name": "Name",
    "contact.email": "E-Mail",
    "contact.phone": "Telefon",
    "contact.message": "Nachricht",
    "contact.send": "Nachricht Senden",
    "contact.success_title": "Nachricht Gesendet!",
    "contact.success_message":
      "Vielen Dank für Ihre Kontaktaufnahme. Unser Team wird sich sehr bald mit Ihnen in Verbindung setzen, um Ihnen bei der Planung Ihres perfekten Abenteuers zu helfen.",
    "contact.whatsapp_contact": "Über WhatsApp kontaktieren",
    "contact.send_another": "Weitere Nachricht senden",

    // Contact Page Specific
    "contact.here_to_help": "Wir Sind Hier, Um Ihnen Zu Helfen",
    "contact.perfect_adventure_starts": "Ihr Perfektes Abenteuer Beginnt Hier",
    "contact.send_consultation": "Senden Sie Uns Ihre Anfrage",
    "contact.tell_us_about_trip": "Erzählen Sie uns von Ihrer idealen Reise und wir helfen Ihnen, sie zu verwirklichen",
    "contact.immediate_contact": "Sofortiger Kontakt",
    "contact.why_choose_us": "Warum Uns Wählen?",
    "contact.faq_preview": "Häufig Gestellte Fragen",
    "contact.quick_response_question":
      "Benötigen Sie eine schnelle Antwort? Kontaktieren Sie uns direkt über WhatsApp für sofortige Betreuung.",
    "contact.open_whatsapp": "WhatsApp Öffnen",
    "contact.attention_schedule": "Servicezeiten",
    "contact.schedule_text": "Montag - Sonntag: 8:00 - 20:00\nWhatsApp: 24/7 verfügbar",
    "contact.how_to_book": "Wie kann ich buchen?",
    "contact.how_to_book_answer":
      "Sie können einfach über WhatsApp, unser Webformular oder durch direkten Anruf buchen.",
    "contact.what_includes": "Was beinhalten die Ausflüge?",
    "contact.what_includes_answer":
      "Transport, professioneller Führer, Versicherung und alle in jeder Tour angegebenen Aktivitäten.",
    "contact.group_discounts": "Gibt es Gruppenrabatte?",
    "contact.group_discounts_answer": "Ja, wir bieten spezielle Rabatte für Gruppen ab 6 Personen.",
    "contact.hero_badge": "Wir Sind Hier, Um Ihnen Zu Helfen",
    "contact.hero_subtitle": "Ihr Perfektes Abenteuer Beginnt Hier",
    "contact.form_title": "Senden Sie Uns Ihre Anfrage",
    "contact.form_subtitle": "Erzählen Sie uns von Ihrer idealen Reise und wir helfen Ihnen, sie zu verwirklichen",
    "contact.faq": "Häufig Gestellte Fragen",

    // About
    "about.title": "Über TenerifeParadiseTours",
    "about.subtitle": "Ihr Tor zum Paradies",
    "about.description":
      "Wir sind ein Familienunternehmen mit Leidenschaft dafür, die wahre Essenz Teneriffas zu zeigen. Mit über 15 Jahren Erfahrung haben wir Tausenden von Reisenden geholfen, die magischsten Ecken unserer wunderschönen Insel zu entdecken.",
    "about.mission": "Unsere Mission",
    "about.mission_text":
      "Authentische und unvergessliche Erlebnisse zu bieten, die unsere Besucher mit der wahren Essenz Teneriffas verbinden und verantwortlichen und nachhaltigen Tourismus fördern.",
    "about.vision": "Unsere Vision",
    "about.vision_text":
      "Das anerkannteste und respektierteste Tourismusunternehmen auf Teneriffa zu sein und eine Referenz für Qualität, Nachhaltigkeit und einzigartige Erlebnisse zu werden.",
    "about.values": "Unsere Werte",
    "about.values_text":
      "Leidenschaft, Authentizität, Respekt für die Umwelt, Exzellenz im Service und Engagement für die lokale Gemeinschaft.",
    "about.story_title": "Unsere Geschichte",
    "about.story_badge": "Seit 2009",
    // About Page Specific
    "about.hero_badge": "Lernen Sie Unsere Geschichte Kennen",
    "about.achievements": "Unsere Erfolge",
    "about.achievements_subtitle": "Zahlen, die unser Engagement für Exzellenz widerspiegeln",
    "about.stat_excursions": "Verschiedene Ausflüge",
    "about.stat_rating": "Durchschnittliche Bewertung",
    "about.story_p1":
      "TenerifeParadiseTours entstand aus der tiefen Liebe zu unserer Insel und dem Wunsch, ihre verborgenen Schätze mit Reisenden aus aller Welt zu teilen. 2009 von einer einheimischen Familie gegründet, begannen wir mit einer kleinen Gruppe leidenschaftlicher Führer.",
    "about.story_p2":
      "Im Laufe der Jahre sind wir gewachsen, haben aber immer unsere Grundwerte beibehalten: Authentizität, Respekt für die Umwelt und persönlichen Service, der jeden Kunden sich besonders fühlen lässt.",
    "about.story_p3":
      "Heute sind wir als eines der vertrauenswürdigsten Tourismusunternehmen auf Teneriffa anerkannt, aber wir bleiben diese Familie, die es liebt, die bestgehüteten Geheimnisse unserer Insel zu zeigen.",
    "about.pillars_title": "Unsere Säulen",
    "about.pillars_subtitle": "Die Werte, die uns definieren und jeden Tag antreiben",
    "about.value_passion_title": "Leidenschaft für Teneriffa",
    "about.value_passion_desc":
      "Wir lieben unsere Insel und möchten ihre Schönheit auf die authentischste Art mit Ihnen teilen.",
    "about.value_experience_title": "Personalisierte Erfahrung",
    "about.value_experience_desc":
      "Jeder Ausflug ist darauf ausgelegt, Ihnen ein einzigartiges und unvergessliches Erlebnis zu bieten.",
    "about.value_security_title": "Garantierte Sicherheit",
    "about.value_security_desc":
      "Ihre Sicherheit ist unsere Priorität. Alle unsere Touren erfüllen die höchsten Standards.",
    "about.value_quality_title": "Außergewöhnliche Qualität",
    "about.value_quality_desc":
      "Wir bemühen uns, Ihre Erwartungen in jedem Detail unserer Dienstleistungen zu übertreffen.",
    "about.certifications_title": "Zertifizierungen und Anerkennungen",
    "about.certifications_subtitle": "Unterstützt von führenden Tourismusorganisationen",
    "about.cert_sustainable": "Nachhaltiges Tourismus-Zertifikat",
    "about.cert_guides": "Offizielle Kanarische Inseln Führer",
    "about.cert_responsible": "Verantwortliches Unternehmen",
    "about.cert_excellence": "TripAdvisor Exzellenz",
    "about.cta_title": "Bereit, Das Erlebnis Zu Leben?",
    "about.cta_description":
      "Schließen Sie sich Tausenden von Abenteurern an, die uns vertraut haben, um die wahre Magie Teneriffas zu entdecken",
    "about.cta_view_excursions": "Unsere Ausflüge Anzeigen",
    "about.cta_contact": "Jetzt Kontaktieren",
    "about.team_caption": "Unser Team",
    "about.team_subtitle": "Leidenschaft für Teneriffa teilen",
    // About Page - Certificaciones corregidas
    "about.cert_sustainable_tourism": "Nachhaltiges Tourismus-Zertifikat",
    "about.cert_official_guides": "Offizielle Kanarische Inseln Führer",
    "about.cert_responsible_company": "Verantwortliches Unternehmen",
    "about.cert_tripadvisor_excellence": "TripAdvisor Exzellenz",

    // Booking
    "booking.title": "Ausflug Buchen",
    "booking.subtitle": "Füllen Sie das Formular aus und setzen Sie Ihre Buchung über WhatsApp fort.",
    "booking.subtitle2": "Ihr nächstes Abenteuer ist nur wenige Klicks entfernt!",
    "booking.select_excursion": "Ausflug Auswählen",
    "booking.date": "Bevorzugtes Datum",
    "booking.people": "Anzahl Personen",
    "booking.requests": "Besondere Wünsche",
    "booking.submit": "Weiter auf WhatsApp",
    "booking.personal_info": "Persönliche Informationen",
    "booking.excursion_details": "Ausflug Details",
    "booking.summary": "Buchungsübersicht",
    "booking.total_estimated": "Geschätzte Gesamtsumme",
    "booking.per_person": "pro Person",
    "booking.included_price": "Im Preis enthalten:",
    "booking.transport": "Hin- und Rücktransport",
    "booking.guide": "Professioneller Führer",
    "booking.insurance": "Aktivitätsversicherung",
    "booking.photos": "Tour-Fotos",

    // Booking - Traducciones adicionales
    "booking.hero_badge": "Buchen Sie Ihr perfektes Abenteuer",
    "booking.form_title": "Buchungsinformationen",
    "booking.name_placeholder": "Ihr vollständiger Name",
    "booking.email_placeholder": "ihre@email.com",
    "booking.excursion_placeholder": "Wählen Sie Ihr perfektes Abenteuer...",
    "booking.premium_label": "Premium",
    "booking.people_count": "Person|Personen",
    "booking.requests_placeholder":
      "Erzählen Sie uns von Allergien, besonderen Bedürfnissen, Feiern oder allem, was wir wissen sollten...",
    "booking.processing": "Verarbeitung...",
    "booking.duration_label": "Dauer",
    "booking.category_label": "Kategorie",
    "booking.rating_label": "Bewertung",
    "booking.reviews_label": "Bewertungen",
    "booking.price_per_person": "Preis pro Person",
    "booking.people_summary": "Personen",
    "booking.select_excursion_message": "Wählen Sie einen Ausflug, um die Zusammenfassung zu sehen",
    "booking.select_excursion_subtitle": "Wählen Sie Ihr perfektes Abenteuer aus dem Formular",
    "booking.why_choose_us": "Warum uns wählen?",
    "booking.trust_guides": "Erfahrene lokale Führer",
    "booking.trust_groups": "Kleine Gruppen",
    "booking.feature_confirmation": "Sofortige Bestätigung",
    "booking.feature_confirmation_desc": "Erhalten Sie Buchungsbestätigung per WhatsApp in weniger als 2 Stunden",
    "booking.feature_payment": "Sichere Zahlung",
    "booking.feature_payment_desc": "Zahlen Sie sicher am Tag des Ausflugs oder per Banküberweisung",
    "booking.feature_experience": "Premium-Erlebnis",
    "booking.feature_experience_desc": "Kleine Gruppen und persönliche Betreuung für ein einzigartiges Erlebnis",
    "booking.trust_confirmation": "Sofortige Bestätigung",
    "booking.trust_cancellation": "Kostenlose Stornierung 24h",
    "booking.trust_support": "24/7 Support",
    "booking.success_title": "Buchung Gestartet!",
    "booking.success_message": "WhatsApp wird mit all Ihren Daten geöffnet...",
    "booking.error_message": "Fehler bei der Buchungsverarbeitung. Bitte versuchen Sie es erneut.",
    "booking.whatsapp_greeting": "Hallo! Ich möchte einen Ausflug buchen",
    "booking.whatsapp_excursion": "Ausflug",
    "booking.whatsapp_date": "Bevorzugtes Datum",
    "booking.whatsapp_people": "Personen",
    "booking.whatsapp_price": "Geschätzter Preis",
    "booking.whatsapp_requests": "Besondere Wünsche",
    "booking.whatsapp_confirm": "Könnten Sie die Verfügbarkeit bestätigen? Danke!",

    // Excursions Page
    "excursions.title": "Alle Unsere",
    "excursions.title2": "Erlebnisse",
    "excursions.subtitle":
      "Entdecken Sie die Magie Teneriffas mit unseren sorgfältig ausgewählten Ausflügen. Von Naturabenteuern bis hin zu einzigartigen gastronomischen Erlebnissen.",
    "excursions.filters": "Filter und Suche",
    "excursions.search_placeholder": "Nach Name oder Beschreibung suchen...",
    "excursions.all_categories": "Alle Kategorien",
    "excursions.all_prices": "Alle Preise",
    "excursions.price_low": "Weniger als €50",
    "excursions.price_medium": "€50 - €80",
    "excursions.price_high": "Mehr als €80",
    "excursions.sort_featured": "Empfohlen",
    "excursions.sort_price_low": "Preis: Niedrig zu Hoch",
    "excursions.sort_price_high": "Preis: Hoch zu Niedrig",
    "excursions.sort_name": "Name A-Z",
    "excursions.found": "Erlebnis",
    "excursions.found_plural": "Erlebnisse Gefunden",
    "excursions.showing_all": "Zeige alle unsere verfügbaren Erlebnisse",
    "excursions.filtered_from": "Gefiltert von",
    "excursions.total_experiences": "Gesamterlebnisse",
    "excursions.no_results": "Keine Ausflüge gefunden",
    "excursions.no_results_text":
      "Wir konnten keine Ausflüge finden, die Ihren Filtern entsprechen. Versuchen Sie, Ihre Suchkriterien anzupassen.",
    "excursions.view_all": "Alle Ausflüge anzeigen",
    "excursions.clear_filters": "Alle löschen",
    "excursions.custom_experience": "Finden Sie nicht, was Sie suchen?",
    "excursions.custom_text":
      "Unser Team kann personalisierte Erlebnisse nach Ihren Interessen erstellen. Kontaktieren Sie uns und wir gestalten das perfekte Abenteuer für Sie.",
    "excursions.contact_custom": "Kontakt für Maßgeschneidertes Erlebnis",

    // Common
    "common.loading": "Laden...",
    "common.error": "Fehler beim Laden der Daten",
    "common.success": "Erfolg",
    "common.duration": "Dauer",
    "common.price": "Preis",
    "common.category": "Kategorie",
    "common.rating": "Bewertung",
    "common.reviews": "Bewertungen",
    "common.free_cancellation": "Kostenlose Stornierung",
    "common.small_group": "Kleine Gruppe",
    "common.all_ratings": "Alle mit 4.8+ Bewertung ⭐",
    "common.preparing": "Ihr Abenteuer wird vorbereitet...",
    "common.loading_experiences": "Erlebnisse werden geladen...",

    // CTA Sections
    "cta.adventure_title": "Beginnen Sie Ihr",
    "cta.adventure_title2": "Perfektes Abenteuer",
    "cta.adventure_text":
      "Beginnen Sie dieses Abenteuer mit uns und entdecken Sie das authentischste Gesicht der Insel",
    "cta.adventure_text2": "Ihre außergewöhnliche Geschichte beginnt mit einem einzigen Klick.",
    "cta.book_now": "Jetzt Buchen",
    "cta.more_info": "Mehr Informationen",
    "cta.ready_title": "Bereit Für Ihr Nächstes Abenteuer?",
    "cta.ready_text":
      "Unser Team wartet darauf, Ihnen zu helfen, unvergessliche Erinnerungen auf Teneriffa zu schaffen. Ihr perfektes Abenteuer ist nur eine Nachricht entfernt!",
    "cta.contact_now": "Jetzt Kontaktieren",
    "cta.view_excursions": "Ausflüge Anzeigen",

    // Contact Info
    "contact_info.phone": "Telefon",
    "contact_info.whatsapp": "WhatsApp",
    "contact_info.email": "E-Mail",
    "contact_info.location": "Standort",
    "contact_info.available": "Verfügbar 8:00 - 20:00",
    "contact_info.immediate_response": "Sofortige Antwort",
    "contact_info.response_time": "Antwort in 2-4 Stunden",
    "contact_info.canary_islands": "Kanarische Inseln, Spanien",

    // Trust Indicators
    "trust.guaranteed_response": "Garantierte Antwort",
    "trust.guaranteed_text": "Wir antworten in weniger als 2 Stunden",
    "trust.personal_attention": "Persönliche Betreuung",
    "trust.personal_text": "Jede Anfrage erhält individuelle Aufmerksamkeit",
    "trust.multilingual": "Mehrsprachig",
    "trust.multilingual_text": "Wir sprechen Spanisch, Englisch und Deutsch",
    "trust.service_passion": "Leidenschaft für Service",
    "trust.service_text": "Wir lieben es, Ihnen bei der Planung Ihres Abenteuers zu helfen",

    // Quick Booking
    "quick.title": "Schnellbuchung",
    "quick.subtitle": "Buchen Sie Ihr Abenteuer in 3 einfachen Schritten",
    "quick.step1": "Ausflug Wählen",
    "quick.step2": "Ihre Daten",
    "quick.step3": "Bestätigen",
    "quick.step4": "Fertig!",
    "quick.choose_experience": "Wählen Sie Ihr Lieblingserlebnis",
    "quick.contact_data": "Ihre Kontaktdaten",
    "quick.confirm_booking": "Bestätigen Sie Ihre Buchung",
    "quick.booking_started": "Buchung Gestartet!",
    "quick.whatsapp_opening": "WhatsApp wird mit all Ihren Daten geöffnet...",

    // Categories
    "category.naturaleza": "Natur",
    "category.marina": "Meeresbereich",
    "category.senderismo": "Wandern",
    "category.gastronomia": "Gastronomie",
    "category.paisajes": "Landschaften",
    "category.familia": "Familie",
    "category.aventura": "Abenteuer",
    "category.cultural": "Kulturell",

    // Gallery
    "gallery.badge": "Fotogalerie",
    "gallery.title": "Entdecke Teneriffa",
    "gallery.subtitle": "Eine Sammlung der unglaublichsten Momente unserer Ausflüge",
    "gallery.loading": "Galerie wird geladen...",
    "gallery.no_images": "Keine Bilder verfügbar",
    "gallery.close": "Schließen",
    "gallery.previous": "Zurück",
    "gallery.next": "Weiter",
    "gallery.instructions": "Verwenden Sie die Pfeiltasten oder klicken Sie zum Navigieren",

    // Privacy Policy
    "privacy.title": "Datenschutzrichtlinie",
    "privacy.subtitle": "TenerifeParadiseTours - Aktualisiert: Januar 2024",
    "privacy.intro.title": "Unser Engagement für Ihren Datenschutz",
    "privacy.intro.content":
      "Bei TenerifeParadiseTours respektieren und schützen wir Ihre Privatsphäre. Diese Richtlinie erklärt, wie wir Ihre persönlichen Daten sammeln, verwenden und schützen, wenn Sie unsere Dienste nutzen. Wir halten uns an die Datenschutz-Grundverordnung (DSGVO) und die spanische Datenschutzgesetzgebung.",

    "privacy.section1.title": "1. Informationen, die wir sammeln",
    "privacy.section1.content1": "• Persönliche Daten: Name, E-Mail, Telefon bei einer Buchung",
    "privacy.section1.content2": "• Kontaktinformationen zur Kommunikation über Ihren Ausflug",
    "privacy.section1.content3": "• Sprachpräferenzen und besondere Wünsche",
    "privacy.section1.content4": "• Browsing-Daten zur Verbesserung unserer Website",

    "privacy.section2.title": "2. Wie wir Ihre Informationen verwenden",
    "privacy.section2.content1": "• Verarbeitung und Bestätigung Ihrer Ausflugsbuchungen",
    "privacy.section2.content2": "• Zusendung relevanter Informationen über Ihr Erlebnis",
    "privacy.section2.content3": "• Verbesserung unserer Dienste und Benutzererfahrung",
    "privacy.section2.content4": "• Erfüllung rechtlicher und sicherheitstechnischer Verpflichtungen",

    "privacy.section3.title": "3. Datenschutz",
    "privacy.section3.content1": "• Wir verwenden SSL-Verschlüsselung zum Schutz Ihrer Daten",
    "privacy.section3.content2": "• Wir geben Ihre Informationen nicht ohne Ihre Zustimmung an Dritte weiter",
    "privacy.section3.content3": "• Wir speichern Ihre Daten sicher auf geschützten Servern",
    "privacy.section3.content4": "• Nur autorisiertes Personal hat Zugang zu Ihren Informationen",

    "privacy.section4.title": "4. Ihre Rechte",
    "privacy.section4.content1": "• Recht auf Zugang zu Ihren persönlichen Daten",
    "privacy.section4.content2": "• Recht auf Berichtigung falscher Informationen",
    "privacy.section4.content3": "• Recht auf Löschung Ihrer Daten (Recht auf Vergessenwerden)",
    "privacy.section4.content4": "• Recht auf Datenübertragbarkeit",

    "privacy.section5.title": "5. Cookies und ähnliche Technologien",
    "privacy.section5.content1": "• Wir verwenden wesentliche Cookies für die Website-Funktionalität",
    "privacy.section5.content2": "• Analyse-Cookies, um zu verstehen, wie Sie unsere Website nutzen",
    "privacy.section5.content3": "• Sie können Cookies über Ihren Browser verwalten",
    "privacy.section5.content4": "• Wir verwenden keine Drittanbieter-Cookies für Werbung",

    "privacy.section6.title": "6. Kontakt und Anfragen",
    "privacy.section6.content1": "• Zur Ausübung Ihrer Rechte kontaktieren Sie: info@tenerifeparadisetours.com",
    "privacy.section6.content2": "• Wir antworten auf Ihre Anfrage innerhalb von maximal 30 Tagen",
    "privacy.section6.content3": "• Sie können eine Beschwerde bei der spanischen Datenschutzbehörde einreichen",
    "privacy.section6.content4": "• Unser Datenschutzbeauftragter steht für Anfragen zur Verfügung",

    "privacy.contact_info.title": "Kontaktinformationen",
    "privacy.contact_info.company": "Unternehmen",
    "privacy.contact_info.company_name": "TenerifeParadiseTours S.L.",
    "privacy.contact_info.cif": "Steuer-ID",
    "privacy.contact_info.cif_number": "B-12345678",
    "privacy.contact_info.address": "Adresse",
    "privacy.contact_info.address_text": "Santa Cruz de Tenerife, Spanien",
    "privacy.contact_info.email": "E-Mail",
    "privacy.contact_info.email_address": "Tenerifeparadisetoursandexcursions@hotmail.com",
    "privacy.contact_info.phone": "Telefon",
    "privacy.contact_info.phone_number": "+34 617 30 39 29",

    "privacy.buttons.understood": "Verstanden",
    "privacy.buttons.print": "Richtlinie drucken",

    // Terms and Conditions
    "terms.title": "Geschäftsbedingungen",
    "terms.subtitle": "TenerifeParadiseTours - Gültig ab Januar 2024",
    "terms.intro.title": "Allgemeine Geschäftsbedingungen",
    "terms.intro.content":
      "Diese Geschäftsbedingungen regeln die Erbringung von Tourismusdienstleistungen durch TenerifeParadiseTours S.L. Mit einer Buchung stimmen Sie zu, diese Bedingungen einzuhalten. Wir empfehlen, dieses Dokument vor der Bestätigung Ihrer Buchung sorgfältig zu lesen.",

    "terms.section1.title": "1. Annahme der Bedingungen",
    "terms.section1.content1": "• Durch die Nutzung unserer Dienste akzeptieren Sie diese Geschäftsbedingungen",
    "terms.section1.content2": "• Diese Bedingungen gelten für alle Buchungen und Dienste von TenerifeParadiseTours",
    "terms.section1.content3": "• Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern",
    "terms.section1.content4": "• Es liegt in Ihrer Verantwortung, diese Bedingungen regelmäßig zu überprüfen",

    "terms.section2.title": "2. Buchungen und Bestätigungen",
    "terms.section2.content1": "• Buchungen werden über WhatsApp oder E-Mail bestätigt",
    "terms.section2.content2": "• Gültige persönliche Informationen sind zur Bearbeitung der Buchung erforderlich",
    "terms.section2.content3": "• Preise können je nach Saison und Verfügbarkeit variieren",
    "terms.section2.content4": "• Die endgültige Bestätigung hängt von der Verfügbarkeit am gewünschten Datum ab",

    "terms.section3.title": "3. Preise und Zahlungen",
    "terms.section3.content1": "• Preise beinhalten Transport, Führer und spezifizierte Aktivitäten",
    "terms.section3.content2": "• Zahlung erfolgt am Tag des Ausflugs oder per Vorabüberweisung",
    "terms.section3.content3": "• Preise können ohne Vorankündigung geändert werden",
    "terms.section3.content4":
      "• Mahlzeiten und persönliche Ausgaben sind nicht enthalten, sofern nicht anders angegeben",

    "terms.section4.title": "4. Stornierungen und Änderungen",
    "terms.section4.content1": "• Kostenlose Stornierung bis 24 Stunden vor dem Ausflug",
    "terms.section4.content2": "• Späte Stornierungen können Strafen unterliegen",
    "terms.section4.content3": "• Datumsänderungen je nach Verfügbarkeit",
    "terms.section4.content4": "• Keine Rückerstattung bei Nichterscheinen",

    "terms.section5.title": "5. Verantwortlichkeiten und Versicherung",
    "terms.section5.content1": "• Alle Ausflüge beinhalten eine Haftpflichtversicherung",
    "terms.section5.content2": "• Teilnehmer müssen relevante medizinische Bedingungen melden",
    "terms.section5.content3": "• TenerifeParadiseTours ist nicht verantwortlich für verlorene persönliche Gegenstände",
    "terms.section5.content4": "• Das Befolgen der Anweisungen des Führers ist jederzeit erforderlich",

    "terms.section6.title": "6. Verhalten und Regeln",
    "terms.section6.content1": "• Respektvolles Verhalten gegenüber Führern und anderen Teilnehmern wird erwartet",
    "terms.section6.content2": "• Alkoholkonsum während der Ausflüge ist verboten",
    "terms.section6.content3": "• Wir behalten uns das Recht vor, störende Teilnehmer auszuschließen",
    "terms.section6.content4": "• Das Befolgen der festgelegten Sicherheitsregeln ist obligatorisch",

    "terms.important_notice.title": "Wichtiger Hinweis",
    "terms.important_notice.content":
      "Ungünstige Wetterbedingungen können zur Stornierung oder Änderung von Ausflügen aus Sicherheitsgründen führen. In diesen Fällen wird ein alternatives Datum oder eine vollständige Rückerstattung angeboten.",

    "terms.legal_info.title": "Rechtliche Informationen",
    "terms.legal_info.company": "Firmenname",
    "terms.legal_info.company_name": "TenerifeParadiseTours S.L.",
    "terms.legal_info.cif": "Steuer-ID",
    "terms.legal_info.cif_number": "B-12345678",
    "terms.legal_info.license": "Tourismuslizenz",
    "terms.legal_info.license_number": "AT-123456",
    "terms.legal_info.registry": "Handelsregister",
    "terms.legal_info.registry_text": "Santa Cruz de Tenerife, Band 1234, Blatt 567",
    "terms.legal_info.jurisdiction": "Gerichtsbarkeit",
    "terms.legal_info.jurisdiction_text": "Gerichte von Santa Cruz de Tenerife",

    "terms.buttons.accept": "Bedingungen Akzeptieren",
    "terms.buttons.print": "Bedingungen Drucken",

    // FAQ
    "faq.title": "Häufig Gestellte Fragen",
    "faq.subtitle": "Wir lösen Ihre häufigsten Zweifel",
    "faq.intro.title": "Haben Sie Fragen?",
    "faq.intro.content":
      "Hier finden Sie Antworten auf die häufigsten Fragen zu unseren Ausflügen. Wenn Sie nicht finden, was Sie suchen, zögern Sie nicht, uns über WhatsApp oder Telefon zu kontaktieren.",

    // FAQ Category 1: Buchungen und Stornierungen
    "faq.category1.title": "Buchungen und Stornierungen",
    "faq.category1.q1.question": "Wie kann ich einen Ausflug buchen?",
    "faq.category1.q1.answer":
      "Sie können auf drei Arten buchen: 1) Über unser Webformular, 2) Kontaktieren Sie uns per WhatsApp unter +34 617 30 39 29, oder 3) Rufen Sie uns direkt an. Wir bestätigen die Verfügbarkeit in weniger als 2 Stunden.",
    "faq.category1.q2.question": "Kann ich meine Buchung stornieren?",
    "faq.category1.q2.answer":
      "Ja, wir bieten kostenlose Stornierung bis 24 Stunden vor dem Ausflug. Für Stornierungen mit weniger als 24 Stunden, überprüfen Sie unsere Geschäftsbedingungen.",
    "faq.category1.q3.question": "Was passiert, wenn es am Tag meines Ausflugs regnet?",
    "faq.category1.q3.answer":
      "Wir überwachen ständig die Wetterbedingungen. Wenn das Wetter nicht sicher ist, bieten wir Ihnen an, das Datum zu ändern oder eine vollständige Rückerstattung. Sicherheit ist unsere Priorität.",

    // FAQ Category 2: Preise und Zahlungen
    "faq.category2.title": "Preise und Zahlungen",
    "faq.category2.q1.question": "Was beinhaltet der Ausflugspreis?",
    "faq.category2.q1.answer":
      "Unsere Preise beinhalten: Transport in komfortablem Fahrzeug, zertifizierten professionellen Führer, Haftpflichtversicherung und alle spezifizierten Aktivitäten. Es beinhaltet keine Mahlzeiten oder persönliche Ausgaben.",
    "faq.category2.q2.question": "Wann soll ich bezahlen?",
    "faq.category2.q2.answer":
      "Sie können am Tag des Ausflugs bar oder mit Karte bezahlen oder eine vorherige Banküberweisung vornehmen. Wir senden Ihnen die Zahlungsdetails bei der Bestätigung Ihrer Buchung.",
    "faq.category2.q3.question": "Gibt es Gruppenrabatte?",
    "faq.category2.q3.answer":
      "Ja! Wir bieten spezielle Rabatte für Gruppen ab 6 Personen. Wir haben auch reduzierte Tarife für Kinder unter 12 Jahren. Kontaktieren Sie uns für weitere Details.",

    // FAQ Category 3: Gruppen und Teilnehmer
    "faq.category3.title": "Gruppen und Teilnehmer",
    "faq.category3.q1.question": "Wie groß ist die maximale Gruppengröße?",
    "faq.category3.q1.answer":
      "Wir halten Gruppen klein für ein persönlicheres Erlebnis. Das Maximum sind 8 Personen pro Fahrzeug. Für größere Gruppen verwenden wir mehrere Fahrzeuge.",
    "faq.category3.q2.question": "Können Kinder teilnehmen?",
    "faq.category3.q2.answer":
      "Natürlich! Unsere Ausflüge sind familienfreundlich. Kinder unter 3 Jahren reisen kostenlos. Wir haben Kindersitze verfügbar - teilen Sie uns dies einfach bei der Buchung mit.",
    "faq.category3.q3.question": "Welches Fitnessniveau ist erforderlich?",
    "faq.category3.q3.answer":
      "Jeder Ausflug hat ein spezifiziertes Schwierigkeitsniveau. Von sanften Spaziergängen bis zu moderatem Wandern. Wir informieren Sie über die körperlichen Anforderungen bei der Buchung.",

    // FAQ Category 4: Logistik und Transport
    "faq.category4.title": "Logistik und Transport",
    "faq.category4.q1.question": "Wo ist der Treffpunkt?",
    "faq.category4.q1.answer":
      "Wir haben mehrere Abholpunkte in den wichtigsten Touristengebieten. Wir bieten auch Hotelabholung in bestimmten Bereichen an. Wir bestätigen den genauen Punkt bei der Buchung.",
    "faq.category4.q2.question": "Was soll ich mitbringen?",
    "faq.category4.q2.answer":
      "Wir empfehlen: bequeme Schuhe, Sonnenschutz, Wasser, Kamera und Kleidung je nach Aktivität. Wir senden Ihnen eine spezifische Liste entsprechend Ihrem Ausflug.",
    "faq.category4.q3.question": "Sprechen Sie andere Sprachen außer Deutsch?",
    "faq.category4.q3.answer":
      "Ja, unsere Führer sprechen Spanisch, Englisch und Deutsch. Einige sprechen auch Französisch und Italienisch. Geben Sie Ihre bevorzugte Sprache bei der Buchung an.",

    // FAQ Contact Section
    "faq.contact.title": "Finden Sie Ihre Antwort nicht?",
    "faq.contact.content": "Unser Team steht zur Verfügung, um spezifische Fragen zu Ihrem Ausflug zu lösen.",
    "faq.contact.whatsapp": "WhatsApp: +34 617 30 39 29",
    "faq.contact.schedule": "Öffnungszeiten: 8:00 - 20:00",

    // FAQ Buttons
    "faq.buttons.close": "FAQ Schließen",
    "faq.buttons.print": "FAQ Drucken",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["es", "en", "de"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
