"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "es" | "en" | "fr" | "de"

interface Translations {
  [key: string]: {
    es: string
    en: string
    fr: string
    de: string
  }
}

const translations: Translations = {
  // Navigation
  "nav.home": {
    es: "Inicio",
    en: "Home",
    fr: "Accueil",
    de: "Startseite",
  },
  "nav.excursions": {
    es: "Excursiones",
    en: "Excursions",
    fr: "Excursions",
    de: "Ausflüge",
  },
  "nav.about": {
    es: "Nosotros",
    en: "About",
    fr: "À propos",
    de: "Über uns",
  },
  "nav.contact": {
    es: "Contacto",
    en: "Contact",
    fr: "Contact",
    de: "Kontakt",
  },
  "nav.booking": {
    es: "Reservar",
    en: "Book",
    fr: "Réserver",
    de: "Buchen",
  },

  // Featured Dropdown
  "featured.view_all_short": {
    es: "Ver todas las excursiones",
    en: "View all excursions",
    fr: "Voir toutes les excursions",
    de: "Alle Ausflüge ansehen",
  },

  // Contact Page - Complete
  "contact.hero_badge": {
    es: "Contacto Directo",
    en: "Direct Contact",
    fr: "Contact Direct",
    de: "Direkter Kontakt",
  },
  "contact.title": {
    es: "Conecta con Nosotros",
    en: "Connect with Us",
    fr: "Connectez-vous avec Nous",
    de: "Verbinden Sie sich mit uns",
  },
  "contact.hero_subtitle": {
    es: "Estamos aquí para hacer realidad tu aventura perfecta",
    en: "We're here to make your perfect adventure come true",
    fr: "Nous sommes là pour réaliser votre aventure parfaite",
    de: "Wir sind hier, um Ihr perfektes Abenteuer wahr werden zu lassen",
  },
  "contact.subtitle": {
    es: "Nuestro equipo de expertos está disponible para ayudarte a planificar la experiencia perfecta en Tenerife",
    en: "Our team of experts is available to help you plan the perfect experience in Tenerife",
    fr: "Notre équipe d'experts est disponible pour vous aider à planifier l'expérience parfaite à Tenerife",
    de: "Unser Expertenteam steht zur Verfügung, um Ihnen bei der Planung des perfekten Erlebnisses auf Teneriffa zu helfen",
  },
  "contact.subtitle_extended": {
    es: "Contáctanos por WhatsApp, teléfono o email y te responderemos en menos de 2 horas",
    en: "Contact us via WhatsApp, phone or email and we'll respond within 2 hours",
    fr: "Contactez-nous via WhatsApp, téléphone ou email et nous vous répondrons dans les 2 heures",
    de: "Kontaktieren Sie uns über WhatsApp, Telefon oder E-Mail und wir antworten innerhalb von 2 Stunden",
  },
  "contact_info.phone": {
    es: "Teléfono",
    en: "Phone",
    fr: "Téléphone",
    de: "Telefon",
  },
  "contact_info.whatsapp": {
    es: "WhatsApp",
    en: "WhatsApp",
    fr: "WhatsApp",
    de: "WhatsApp",
  },
  "contact_info.email": {
    es: "Email",
    en: "Email",
    fr: "Email",
    de: "E-Mail",
  },
  "contact_info.location": {
    es: "Ubicación",
    en: "Location",
    fr: "Localisation",
    de: "Standort",
  },
  "contact_info.available": {
    es: "Disponible 24/7",
    en: "Available 24/7",
    fr: "Disponible 24/7",
    de: "24/7 verfügbar",
  },
  "contact_info.immediate_response": {
    es: "Respuesta inmediata",
    en: "Immediate response",
    fr: "Réponse immédiate",
    de: "Sofortige Antwort",
  },
  "contact_info.canary_islands": {
    es: "Islas Canarias, España",
    en: "Canary Islands, Spain",
    fr: "Îles Canaries, Espagne",
    de: "Kanarische Inseln, Spanien",
  },

  // Booking Page - Complete
  "booking.hero_badge": {
    es: "Reserva Fácil",
    en: "Easy Booking",
    fr: "Réservation Facile",
    de: "Einfache Buchung",
  },
  "booking.title": {
    es: "Reserva tu Aventura",
    en: "Book your Adventure",
    fr: "Réservez votre Aventure",
    de: "Buchen Sie Ihr Abenteuer",
  },
  "booking.subtitle": {
    es: "Proceso de reserva simple y seguro para tu experiencia perfecta en Tenerife",
    en: "Simple and secure booking process for your perfect experience in Tenerife",
    fr: "Processus de réservation simple et sécurisé pour votre expérience parfaite à Tenerife",
    de: "Einfacher und sicherer Buchungsprozess für Ihr perfektes Erlebnis auf Teneriffa",
  },
  "booking.subtitle2": {
    es: "Confirmación inmediata por WhatsApp",
    en: "Instant confirmation via WhatsApp",
    fr: "Confirmation instantanée via WhatsApp",
    de: "Sofortige Bestätigung über WhatsApp",
  },
  "booking.trust_confirmation": {
    es: "Confirmación inmediata",
    en: "Instant confirmation",
    fr: "Confirmation instantanée",
    de: "Sofortige Bestätigung",
  },
  "booking.trust_cancellation": {
    es: "Cancelación gratuita",
    en: "Free cancellation",
    fr: "Annulation gratuite",
    de: "Kostenlose Stornierung",
  },
  "booking.trust_support": {
    es: "Soporte 24/7",
    en: "24/7 support",
    fr: "Support 24/7",
    de: "24/7 Support",
  },
  "booking.form_title": {
    es: "Formulario de Reserva",
    en: "Booking Form",
    fr: "Formulaire de Réservation",
    de: "Buchungsformular",
  },
  "booking.summary": {
    es: "Resumen de Reserva",
    en: "Booking Summary",
    fr: "Résumé de Réservation",
    de: "Buchungszusammenfassung",
  },
  "booking.personal_info": {
    es: "Información Personal",
    en: "Personal Information",
    fr: "Informations Personnelles",
    de: "Persönliche Informationen",
  },
  "booking.name_placeholder": {
    es: "Tu nombre completo",
    en: "Your full name",
    fr: "Votre nom complet",
    de: "Ihr vollständiger Name",
  },
  "booking.email_placeholder": {
    es: "tu@email.com",
    en: "your@email.com",
    fr: "votre@email.com",
    de: "ihre@email.com",
  },
  "booking.excursion_details": {
    es: "Detalles de la Excursión",
    en: "Excursion Details",
    fr: "Détails de l'Excursion",
    de: "Ausflug Details",
  },
  "booking.select_excursion": {
    es: "Seleccionar Excursión",
    en: "Select Excursion",
    fr: "Sélectionner l'Excursion",
    de: "Ausflug auswählen",
  },
  "booking.excursion_placeholder": {
    es: "Elige tu aventura perfecta",
    en: "Choose your perfect adventure",
    fr: "Choisissez votre aventure parfaite",
    de: "Wählen Sie Ihr perfektes Abenteuer",
  },
  "booking.date": {
    es: "Fecha Preferida",
    en: "Preferred Date",
    fr: "Date Préférée",
    de: "Bevorzugtes Datum",
  },
  "booking.people": {
    es: "Número de Personas",
    en: "Number of People",
    fr: "Nombre de Personnes",
    de: "Anzahl der Personen",
  },
  "booking.people_count": {
    es: "persona",
    en: "person",
    fr: "personne",
    de: "Person",
  },
  "booking.requests": {
    es: "Solicitudes Especiales",
    en: "Special Requests",
    fr: "Demandes Spéciales",
    de: "Besondere Wünsche",
  },
  "booking.requests_placeholder": {
    es: "¿Alguna solicitud especial o información adicional?",
    en: "Any special requests or additional information?",
    fr: "Des demandes spéciales ou des informations supplémentaires?",
    de: "Besondere Wünsche oder zusätzliche Informationen?",
  },
  "booking.submit": {
    es: "Confirmar Reserva por WhatsApp",
    en: "Confirm Booking via WhatsApp",
    fr: "Confirmer la Réservation via WhatsApp",
    de: "Buchung über WhatsApp bestätigen",
  },
  "booking.processing": {
    es: "Procesando...",
    en: "Processing...",
    fr: "Traitement...",
    de: "Verarbeitung...",
  },
  "booking.select_excursion_message": {
    es: "Selecciona una excursión para ver el resumen",
    en: "Select an excursion to see the summary",
    fr: "Sélectionnez une excursion pour voir le résumé",
    de: "Wählen Sie einen Ausflug, um die Zusammenfassung zu sehen",
  },
  "booking.select_excursion_subtitle": {
    es: "Elige tu aventura perfecta del formulario",
    en: "Choose your perfect adventure from the form",
    fr: "Choisissez votre aventure parfaite dans le formulaire",
    de: "Wählen Sie Ihr perfektes Abenteuer aus dem Formular",
  },
  "booking.premium_label": {
    es: "Premium",
    en: "Premium",
    fr: "Premium",
    de: "Premium",
  },
  "booking.duration_label": {
    es: "Duración",
    en: "Duration",
    fr: "Durée",
    de: "Dauer",
  },
  "booking.category_label": {
    es: "Categoría",
    en: "Category",
    fr: "Catégorie",
    de: "Kategorie",
  },
  "booking.rating_label": {
    es: "Valoración",
    en: "Rating",
    fr: "Évaluation",
    de: "Bewertung",
  },
  "booking.reviews_label": {
    es: "reseñas",
    en: "reviews",
    fr: "avis",
    de: "Bewertungen",
  },
  "booking.price_per_person": {
    es: "Precio por persona",
    en: "Price per person",
    fr: "Prix par personne",
    de: "Preis pro Person",
  },
  "booking.people_summary": {
    es: "Personas",
    en: "People",
    fr: "Personnes",
    de: "Personen",
  },
  "booking.total_estimated": {
    es: "Total Estimado",
    en: "Estimated Total",
    fr: "Total Estimé",
    de: "Geschätzter Gesamtbetrag",
  },
  "booking.included_price": {
    es: "Incluido en el precio",
    en: "Included in price",
    fr: "Inclus dans le prix",
    de: "Im Preis inbegriffen",
  },
  "booking.transport": {
    es: "Transporte",
    en: "Transport",
    fr: "Transport",
    de: "Transport",
  },
  "booking.guide": {
    es: "Guía experto",
    en: "Expert guide",
    fr: "Guide expert",
    de: "Expertenführer",
  },
  "booking.insurance": {
    es: "Seguro",
    en: "Insurance",
    fr: "Assurance",
    de: "Versicherung",
  },
  "booking.photos": {
    es: "Fotos",
    en: "Photos",
    fr: "Photos",
    de: "Fotos",
  },
  "booking.why_choose_us": {
    es: "¿Por qué elegirnos?",
    en: "Why choose us?",
    fr: "Pourquoi nous choisir?",
    de: "Warum uns wählen?",
  },
  "booking.trust_guides": {
    es: "Guías locales expertos",
    en: "Expert local guides",
    fr: "Guides locaux experts",
    de: "Erfahrene lokale Führer",
  },
  "booking.trust_groups": {
    es: "Grupos pequeños",
    en: "Small groups",
    fr: "Petits groupes",
    de: "Kleine Gruppen",
  },
  "booking.feature_confirmation": {
    es: "Confirmación Inmediata",
    en: "Instant Confirmation",
    fr: "Confirmation Instantanée",
    de: "Sofortige Bestätigung",
  },
  "booking.feature_confirmation_desc": {
    es: "Recibe confirmación al instante por WhatsApp",
    en: "Get instant confirmation via WhatsApp",
    fr: "Recevez une confirmation instantanée via WhatsApp",
    de: "Erhalten Sie sofortige Bestätigung über WhatsApp",
  },
  "booking.feature_payment": {
    es: "Pago Flexible",
    en: "Flexible Payment",
    fr: "Paiement Flexible",
    de: "Flexible Zahlung",
  },
  "booking.feature_payment_desc": {
    es: "Paga en el momento de la excursión",
    en: "Pay at the time of the excursion",
    fr: "Payez au moment de l'excursion",
    de: "Zahlen Sie zum Zeitpunkt des Ausflugs",
  },
  "booking.feature_experience": {
    es: "Experiencia Única",
    en: "Unique Experience",
    fr: "Expérience Unique",
    de: "Einzigartiges Erlebnis",
  },
  "booking.feature_experience_desc": {
    es: "Aventuras auténticas con guías locales",
    en: "Authentic adventures with local guides",
    fr: "Aventures authentiques avec des guides locaux",
    de: "Authentische Abenteuer mit lokalen Führern",
  },

  // Privacy Policy - Complete
  "privacy.title": {
    es: "Política de Privacidad",
    en: "Privacy Policy",
    fr: "Politique de Confidentialité",
    de: "Datenschutzrichtlinie",
  },
  "privacy.subtitle": {
    es: "Protegemos tu información personal",
    en: "We protect your personal information",
    fr: "Nous protégeons vos informations personnelles",
    de: "Wir schützen Ihre persönlichen Daten",
  },
  "privacy.intro.title": {
    es: "Introducción",
    en: "Introduction",
    fr: "Introduction",
    de: "Einführung",
  },
  "privacy.intro.content": {
    es: "En TenerifeParadise Tours & Excursions, nos comprometemos a proteger y respetar tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tu información personal.",
    en: "At TenerifeParadise Tours & Excursions, we are committed to protecting and respecting your privacy. This policy explains how we collect, use and protect your personal information.",
    fr: "Chez TenerifeParadise Tours & Excursions, nous nous engageons à protéger et respecter votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos informations personnelles.",
    de: "Bei TenerifeParadise Tours & Excursions verpflichten wir uns, Ihre Privatsphäre zu schützen und zu respektieren. Diese Richtlinie erklärt, wie wir Ihre persönlichen Daten sammeln, verwenden und schützen.",
  },
  "privacy.section1.title": {
    es: "Información que Recopilamos",
    en: "Information We Collect",
    fr: "Informations que Nous Collectons",
    de: "Informationen, die wir sammeln",
  },
  "privacy.section1.content1": {
    es: "Recopilamos información que nos proporcionas directamente, como nombre, email, teléfono y preferencias de excursiones.",
    en: "We collect information you provide directly to us, such as name, email, phone and excursion preferences.",
    fr: "Nous collectons les informations que vous nous fournissez directement, telles que nom, email, téléphone et préférences d'excursions.",
    de: "Wir sammeln Informationen, die Sie uns direkt zur Verfügung stellen, wie Name, E-Mail, Telefon und Ausflugspräferenzen.",
  },
  "privacy.section1.content2": {
    es: "Información de uso del sitio web para mejorar nuestros servicios.",
    en: "Website usage information to improve our services.",
    fr: "Informations d'utilisation du site web pour améliorer nos services.",
    de: "Website-Nutzungsinformationen zur Verbesserung unserer Dienstleistungen.",
  },
  "privacy.section1.content3": {
    es: "Datos de comunicación cuando nos contactas por WhatsApp, email o teléfono.",
    en: "Communication data when you contact us via WhatsApp, email or phone.",
    fr: "Données de communication lorsque vous nous contactez via WhatsApp, email ou téléphone.",
    de: "Kommunikationsdaten, wenn Sie uns über WhatsApp, E-Mail oder Telefon kontaktieren.",
  },
  "privacy.section1.content4": {
    es: "Información de reservas y preferencias para personalizar tu experiencia.",
    en: "Booking information and preferences to personalize your experience.",
    fr: "Informations de réservation et préférences pour personnaliser votre expérience.",
    de: "Buchungsinformationen und Präferenzen zur Personalisierung Ihres Erlebnisses.",
  },
  "privacy.section2.title": {
    es: "Cómo Usamos tu Información",
    en: "How We Use Your Information",
    fr: "Comment Nous Utilisons vos Informations",
    de: "Wie wir Ihre Informationen verwenden",
  },
  "privacy.section2.content1": {
    es: "Para procesar y confirmar tus reservas de excursiones.",
    en: "To process and confirm your excursion bookings.",
    fr: "Pour traiter et confirmer vos réservations d'excursions.",
    de: "Zur Bearbeitung und Bestätigung Ihrer Ausflugsbuchungen.",
  },
  "privacy.section2.content2": {
    es: "Para comunicarnos contigo sobre tu reserva y proporcionar soporte al cliente.",
    en: "To communicate with you about your booking and provide customer support.",
    fr: "Pour communiquer avec vous concernant votre réservation et fournir un support client.",
    de: "Um mit Ihnen über Ihre Buchung zu kommunizieren und Kundensupport zu bieten.",
  },
  "privacy.section2.content3": {
    es: "Para mejorar nuestros servicios y desarrollar nuevas excursiones.",
    en: "To improve our services and develop new excursions.",
    fr: "Pour améliorer nos services et développer de nouvelles excursions.",
    de: "Zur Verbesserung unserer Dienstleistungen und Entwicklung neuer Ausflüge.",
  },
  "privacy.section2.content4": {
    es: "Para enviarte información relevante sobre ofertas y novedades (solo si das tu consentimiento).",
    en: "To send you relevant information about offers and news (only with your consent).",
    fr: "Pour vous envoyer des informations pertinentes sur les offres et actualités (seulement avec votre consentement).",
    de: "Um Ihnen relevante Informationen über Angebote und Neuigkeiten zu senden (nur mit Ihrer Zustimmung).",
  },
  "privacy.section3.title": {
    es: "Protección de Datos",
    en: "Data Protection",
    fr: "Protection des Données",
    de: "Datenschutz",
  },
  "privacy.section3.content1": {
    es: "Implementamos medidas de seguridad técnicas y organizativas para proteger tu información.",
    en: "We implement technical and organizational security measures to protect your information.",
    fr: "Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos informations.",
    de: "Wir implementieren technische und organisatorische Sicherheitsmaßnahmen zum Schutz Ihrer Informationen.",
  },
  "privacy.section3.content2": {
    es: "Tus datos se almacenan de forma segura y solo son accesibles por personal autorizado.",
    en: "Your data is stored securely and only accessible by authorized personnel.",
    fr: "Vos données sont stockées de manière sécurisée et ne sont accessibles que par le personnel autorisé.",
    de: "Ihre Daten werden sicher gespeichert und sind nur für autorisiertes Personal zugänglich.",
  },
  "privacy.section3.content3": {
    es: "No vendemos, alquilamos o compartimos tu información personal con terceros sin tu consentimiento.",
    en: "We do not sell, rent or share your personal information with third parties without your consent.",
    fr: "Nous ne vendons, ne louons ni ne partageons vos informations personnelles avec des tiers sans votre consentement.",
    de: "Wir verkaufen, vermieten oder teilen Ihre persönlichen Daten nicht ohne Ihre Zustimmung mit Dritten.",
  },
  "privacy.section3.content4": {
    es: "Cumplimos con todas las regulaciones aplicables de protección de datos, incluyendo GDPR.",
    en: "We comply with all applicable data protection regulations, including GDPR.",
    fr: "Nous respectons toutes les réglementations applicables de protection des données, y compris le RGPD.",
    de: "Wir halten alle anwendbaren Datenschutzbestimmungen ein, einschließlich DSGVO.",
  },
  "privacy.section4.title": {
    es: "Tus Derechos",
    en: "Your Rights",
    fr: "Vos Droits",
    de: "Ihre Rechte",
  },
  "privacy.section4.content1": {
    es: "Tienes derecho a acceder, rectificar o eliminar tu información personal.",
    en: "You have the right to access, rectify or delete your personal information.",
    fr: "Vous avez le droit d'accéder, de rectifier ou de supprimer vos informations personnelles.",
    de: "Sie haben das Recht, auf Ihre persönlichen Daten zuzugreifen, sie zu berichtigen oder zu löschen.",
  },
  "privacy.section4.content2": {
    es: "Puedes solicitar la portabilidad de tus datos o limitar su procesamiento.",
    en: "You can request data portability or limit its processing.",
    fr: "Vous pouvez demander la portabilité de vos données ou limiter leur traitement.",
    de: "Sie können Datenportabilität beantragen oder deren Verarbeitung einschränken.",
  },
  "privacy.section4.content3": {
    es: "Tienes derecho a retirar tu consentimiento en cualquier momento.",
    en: "You have the right to withdraw your consent at any time.",
    fr: "Vous avez le droit de retirer votre consentement à tout moment.",
    de: "Sie haben das Recht, Ihre Zustimmung jederzeit zu widerrufen.",
  },
  "privacy.section4.content4": {
    es: "Para ejercer estos derechos, contáctanos a través de nuestros canales oficiales.",
    en: "To exercise these rights, contact us through our official channels.",
    fr: "Pour exercer ces droits, contactez-nous via nos canaux officiels.",
    de: "Um diese Rechte auszuüben, kontaktieren Sie uns über unsere offiziellen Kanäle.",
  },
  "privacy.section5.title": {
    es: "Cookies y Tecnologías Similares",
    en: "Cookies and Similar Technologies",
    fr: "Cookies et Technologies Similaires",
    de: "Cookies und ähnliche Technologien",
  },
  "privacy.section5.content1": {
    es: "Utilizamos cookies para mejorar tu experiencia en nuestro sitio web.",
    en: "We use cookies to improve your experience on our website.",
    fr: "Nous utilisons des cookies pour améliorer votre expérience sur notre site web.",
    de: "Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern.",
  },
  "privacy.section5.content2": {
    es: "Puedes controlar las cookies a través de la configuración de tu navegador.",
    en: "You can control cookies through your browser settings.",
    fr: "Vous pouvez contrôler les cookies via les paramètres de votre navigateur.",
    de: "Sie können Cookies über Ihre Browser-Einstellungen kontrollieren.",
  },
  "privacy.section5.content3": {
    es: "Algunas funcionalidades pueden verse afectadas si deshabilitas las cookies.",
    en: "Some functionalities may be affected if you disable cookies.",
    fr: "Certaines fonctionnalités peuvent être affectées si vous désactivez les cookies.",
    de: "Einige Funktionen können beeinträchtigt werden, wenn Sie Cookies deaktivieren.",
  },
  "privacy.section5.content4": {
    es: "Consulta nuestra política de cookies para más información detallada.",
    en: "Check our cookie policy for more detailed information.",
    fr: "Consultez notre politique de cookies pour plus d'informations détaillées.",
    de: "Lesen Sie unsere Cookie-Richtlinie für detailliertere Informationen.",
  },
  "privacy.section6.title": {
    es: "Contacto",
    en: "Contact",
    fr: "Contact",
    de: "Kontakt",
  },
  "privacy.section6.content1": {
    es: "Si tienes preguntas sobre esta política de privacidad, contáctanos.",
    en: "If you have questions about this privacy policy, contact us.",
    fr: "Si vous avez des questions sur cette politique de confidentialité, contactez-nous.",
    de: "Wenn Sie Fragen zu dieser Datenschutzrichtlinie haben, kontaktieren Sie uns.",
  },
  "privacy.section6.content2": {
    es: "Email: Tenerifeparadisetoursandexcursions@hotmail.com",
    en: "Email: Tenerifeparadisetoursandexcursions@hotmail.com",
    fr: "Email: Tenerifeparadisetoursandexcursions@hotmail.com",
    de: "Email: Tenerifeparadisetoursandexcursions@hotmail.com",
  },
  "privacy.section6.content3": {
    es: "WhatsApp: +34 617 30 39 29",
    en: "WhatsApp: +34 617 30 39 29",
    fr: "WhatsApp: +34 617 30 39 29",
    de: "WhatsApp: +34 617 30 39 29",
  },
  "privacy.section6.content4": {
    es: "Nos comprometemos a responder a tus consultas en un plazo máximo de 72 horas.",
    en: "We commit to responding to your inquiries within a maximum of 72 hours.",
    fr: "Nous nous engageons à répondre à vos demandes dans un délai maximum de 72 heures.",
    de: "Wir verpflichten uns, Ihre Anfragen innerhalb von maximal 72 Stunden zu beantworten.",
  },
  "privacy.contact_info.title": {
    es: "Información de Contacto",
    en: "Contact Information",
    fr: "Informations de Contact",
    de: "Kontaktinformationen",
  },
  "privacy.contact_info.company": {
    es: "Empresa",
    en: "Company",
    fr: "Entreprise",
    de: "Unternehmen",
  },
  "privacy.contact_info.address": {
    es: "Dirección",
    en: "Address",
    fr: "Adresse",
    de: "Adresse",
  },
  "privacy.contact_info.email": {
    es: "Email",
    en: "Email",
    fr: "Email",
    de: "E-Mail",
  },
  "privacy.contact_info.email_address": {
    es: "Tenerifeparadisetoursandexcursions@hotmail.com",
    en: "Tenerifeparadisetoursandexcursions@hotmail.com",
    fr: "Tenerifeparadisetoursandexcursions@hotmail.com",
    de: "Tenerifeparadisetoursandexcursions@hotmail.com",
  },
  "privacy.contact_info.phone": {
    es: "Teléfono",
    en: "Phone",
    fr: "Téléphone",
    de: "Telefon",
  },
  "privacy.contact_info.phone_number": {
    es: "+34 617 30 39 29",
    en: "+34 617 30 39 29",
    fr: "+34 617 30 39 29",
    de: "+34 617 30 39 29",
  },
  "privacy.buttons.understood": {
    es: "Entendido",
    en: "Understood",
    fr: "Compris",
    de: "Verstanden",
  },
  "privacy.buttons.print": {
    es: "Imprimir",
    en: "Print",
    fr: "Imprimer",
    de: "Drucken",
  },

  // Terms & Conditions - Complete
  "terms.title": {
    es: "Términos y Condiciones",
    en: "Terms & Conditions",
    fr: "Termes et Conditions",
    de: "Geschäftsbedingungen",
  },
  "terms.subtitle": {
    es: "Condiciones de uso de nuestros servicios",
    en: "Terms of use for our services",
    fr: "Conditions d'utilisation de nos services",
    de: "Nutzungsbedingungen für unsere Dienstleistungen",
  },
  "terms.intro.title": {
    es: "Introducción",
    en: "Introduction",
    fr: "Introduction",
    de: "Einführung",
  },
  "terms.intro.content": {
    es: "Estos términos y condiciones regulan el uso de los servicios ofrecidos por TenerifeParadise Tours & Excursions. Al reservar con nosotros, aceptas estos términos.",
    en: "These terms and conditions govern the use of services offered by TenerifeParadise Tours & Excursions. By booking with us, you accept these terms.",
    fr: "Ces termes et conditions régissent l'utilisation des services offerts par TenerifeParadise Tours & Excursions. En réservant avec nous, vous acceptez ces termes.",
    de: "Diese Geschäftsbedingungen regeln die Nutzung der von TenerifeParadise Tours & Excursions angebotenen Dienstleistungen. Durch eine Buchung bei uns akzeptieren Sie diese Bedingungen.",
  },
  "terms.section1.title": {
    es: "Reservas y Pagos",
    en: "Bookings and Payments",
    fr: "Réservations et Paiements",
    de: "Buchungen und Zahlungen",
  },
  "terms.section1.content1": {
    es: "Las reservas se confirman mediante WhatsApp tras completar el formulario de reserva.",
    en: "Bookings are confirmed via WhatsApp after completing the booking form.",
    fr: "Les réservations sont confirmées via WhatsApp après avoir complété le formulaire de réservation.",
    de: "Buchungen werden über WhatsApp bestätigt, nachdem das Buchungsformular ausgefüllt wurde.",
  },
  "terms.section1.content2": {
    es: "El pago se realiza en efectivo el día de la excursión, antes del inicio de la actividad.",
    en: "Payment is made in cash on the day of the excursion, before the start of the activity.",
    fr: "Le paiement s'effectue en espèces le jour de l'excursion, avant le début de l'activité.",
    de: "Die Zahlung erfolgt in bar am Tag des Ausflugs, vor Beginn der Aktivität.",
  },
  "terms.section1.content3": {
    es: "Los precios incluyen transporte, guía, seguro y servicios especificados en cada excursión.",
    en: "Prices include transport, guide, insurance and services specified in each excursion.",
    fr: "Les prix incluent transport, guide, assurance et services spécifiés dans chaque excursion.",
    de: "Die Preise beinhalten Transport, Führer, Versicherung und in jedem Ausflug spezifizierte Dienstleistungen.",
  },
  "terms.section1.content4": {
    es: "Nos reservamos el derecho de modificar precios con previo aviso de 48 horas.",
    en: "We reserve the right to modify prices with 48 hours prior notice.",
    fr: "Nous nous réservons le droit de modifier les prix avec un préavis de 48 heures.",
    de: "Wir behalten uns das Recht vor, Preise mit 48 Stunden Vorlaufzeit zu ändern.",
  },
  "terms.section2.title": {
    es: "Cancelaciones y Modificaciones",
    en: "Cancellations and Modifications",
    fr: "Annulations et Modifications",
    de: "Stornierungen und Änderungen",
  },
  "terms.section2.content1": {
    es: "Cancelación gratuita hasta 24 horas antes de la excursión.",
    en: "Free cancellation up to 24 hours before the excursion.",
    fr: "Annulation gratuite jusqu'à 24 heures avant l'excursion.",
    de: "Kostenlose Stornierung bis 24 Stunden vor dem Ausflug.",
  },
  "terms.section2.content2": {
    es: "Modificaciones de fecha sujetas a disponibilidad, sin costo adicional.",
    en: "Date modifications subject to availability, at no additional cost.",
    fr: "Modifications de date sous réserve de disponibilité, sans coût supplémentaire.",
    de: "Datumsänderungen je nach Verfügbarkeit, ohne zusätzliche Kosten.",
  },
  "terms.section2.content3": {
    es: "En caso de condiciones meteorológicas adversas, ofrecemos reprogramación o reembolso completo.",
    en: "In case of adverse weather conditions, we offer rescheduling or full refund.",
    fr: "En cas de conditions météorologiques défavorables, nous offrons une reprogrammation ou un remboursement complet.",
    de: "Bei widrigen Wetterbedingungen bieten wir Umplanung oder vollständige Rückerstattung an.",
  },
  "terms.section2.content4": {
    es: "Cancelaciones por nuestra parte por motivos de seguridad incluyen reembolso completo.",
    en: "Cancellations by us for safety reasons include full refund.",
    fr: "Les annulations de notre part pour des raisons de sécurité incluent un remboursement complet.",
    de: "Stornierungen unsererseits aus Sicherheitsgründen beinhalten eine vollständige Rückerstattung.",
  },
  "terms.section3.title": {
    es: "Responsabilidades y Seguros",
    en: "Responsibilities and Insurance",
    fr: "Responsabilités et Assurances",
    de: "Verantwortlichkeiten und Versicherungen",
  },
  "terms.section3.content1": {
    es: "Todos los participantes están cubiertos por seguro de responsabilidad civil y accidentes.",
    en: "All participants are covered by civil liability and accident insurance.",
    fr: "Tous les participants sont couverts par une assurance responsabilité civile et accidents.",
    de: "Alle Teilnehmer sind durch Haftpflicht- und Unfallversicherung abgedeckt.",
  },
  "terms.section3.content2": {
    es: "Los participantes deben seguir las instrucciones del guía en todo momento.",
    en: "Participants must follow the guide's instructions at all times.",
    fr: "Les participants doivent suivre les instructions du guide en tout temps.",
    de: "Teilnehmer müssen jederzeit den Anweisungen des Führers folgen.",
  },
  "terms.section3.content3": {
    es: "No nos hacemos responsables de objetos personales perdidos o dañados.",
    en: "We are not responsible for lost or damaged personal items.",
    fr: "Nous ne sommes pas responsables des objets personnels perdus ou endommagés.",
    de: "Wir sind nicht verantwortlich für verlorene oder beschädigte persönliche Gegenstände.",
  },
  "terms.section3.content4": {
    es: "Los participantes deben informar sobre condiciones médicas relevantes antes de la excursión.",
    en: "Participants must inform about relevant medical conditions before the excursion.",
    fr: "Les participants doivent informer des conditions médicales pertinentes avant l'excursion.",
    de: "Teilnehmer müssen über relevante medizinische Bedingungen vor dem Ausflug informieren.",
  },
  "terms.section4.title": {
    es: "Requisitos y Restricciones",
    en: "Requirements and Restrictions",
    fr: "Exigences et Restrictions",
    de: "Anforderungen und Beschränkungen",
  },
  "terms.section4.content1": {
    es: "Edad mínima y máxima según especificaciones de cada excursión.",
    en: "Minimum and maximum age according to each excursion's specifications.",
    fr: "Âge minimum et maximum selon les spécifications de chaque excursion.",
    de: "Mindest- und Höchstalter gemäß den Spezifikationen jedes Ausflugs.",
  },
  "terms.section4.content2": {
    es: "Condición física adecuada requerida para actividades de aventura.",
    en: "Adequate physical condition required for adventure activities.",
    fr: "Condition physique adéquate requise pour les activités d'aventure.",
    de: "Angemessene körperliche Verfassung für Abenteueraktivitäten erforderlich.",
  },
  "terms.section4.content3": {
    es: "Prohibido el consumo de alcohol o sustancias antes y durante las excursiones.",
    en: "Consumption of alcohol or substances before and during excursions is prohibited.",
    fr: "La consommation d'alcool ou de substances avant et pendant les excursions est interdite.",
    de: "Der Konsum von Alkohol oder Substanzen vor und während der Ausflüge ist verboten.",
  },
  "terms.section4.content4": {
    es: "Nos reservamos el derecho de rechazar participantes que no cumplan los requisitos.",
    en: "We reserve the right to refuse participants who do not meet the requirements.",
    fr: "Nous nous réservons le droit de refuser les participants qui ne répondent pas aux exigences.",
    de: "Wir behalten uns das Recht vor, Teilnehmer abzulehnen, die die Anforderungen nicht erfüllen.",
  },
  "terms.section5.title": {
    es: "Propiedad Intelectual",
    en: "Intellectual Property",
    fr: "Propriété Intellectuelle",
    de: "Geistiges Eigentum",
  },
  "terms.section5.content1": {
    es: "Las fotos y videos tomados durante las excursiones pueden ser utilizados con fines promocionales.",
    en: "Photos and videos taken during excursions may be used for promotional purposes.",
    fr: "Les photos et vidéos prises pendant les excursions peuvent être utilisées à des fins promotionnelles.",
    de: "Fotos und Videos, die während der Ausflüge aufgenommen werden, können für Werbezwecke verwendet werden.",
  },
  "terms.section5.content2": {
    es: "Los participantes pueden solicitar no aparecer en material promocional.",
    en: "Participants may request not to appear in promotional material.",
    fr: "Les participants peuvent demander de ne pas apparaître dans le matériel promotionnel.",
    de: "Teilnehmer können beantragen, nicht in Werbematerial zu erscheinen.",
  },
  "terms.section5.content3": {
    es: "Todo el contenido del sitio web está protegido por derechos de autor.",
    en: "All website content is protected by copyright.",
    fr: "Tout le contenu du site web est protégé par des droits d'auteur.",
    de: "Alle Website-Inhalte sind urheberrechtlich geschützt.",
  },
  "terms.section5.content4": {
    es: "Prohibida la reproducción sin autorización expresa de nuestro contenido.",
    en: "Reproduction without express authorization of our content is prohibited.",
    fr: "La reproduction sans autorisation expresse de notre contenu est interdite.",
    de: "Die Reproduktion ohne ausdrückliche Genehmigung unserer Inhalte ist verboten.",
  },
  "terms.section6.title": {
    es: "Jurisdicción y Ley Aplicable",
    en: "Jurisdiction and Applicable Law",
    fr: "Juridiction et Loi Applicable",
    de: "Gerichtsbarkeit und anwendbares Recht",
  },
  "terms.section6.content1": {
    es: "Estos términos se rigen por la legislación española.",
    en: "These terms are governed by Spanish legislation.",
    fr: "Ces termes sont régis par la législation espagnole.",
    de: "Diese Bedingungen unterliegen der spanischen Gesetzgebung.",
  },
  "terms.section6.content2": {
    es: "Cualquier disputa será resuelta en los tribunales de Santa Cruz de Tenerife.",
    en: "Any dispute will be resolved in the courts of Santa Cruz de Tenerife.",
    fr: "Tout litige sera résolu devant les tribunaux de Santa Cruz de Tenerife.",
    de: "Jede Streitigkeit wird vor den Gerichten von Santa Cruz de Tenerife gelöst.",
  },
  "terms.section6.content3": {
    es: "Intentaremos resolver cualquier conflicto de manera amistosa antes de recurrir a vías legales.",
    en: "We will try to resolve any conflict amicably before resorting to legal means.",
    fr: "Nous essaierons de résoudre tout conflit à l'amiable avant de recourir aux voies légales.",
    de: "Wir werden versuchen, jeden Konflikt gütlich zu lösen, bevor wir rechtliche Schritte einleiten.",
  },
  "terms.section6.content4": {
    es: "Estos términos pueden ser actualizados periódicamente, notificando a los usuarios registrados.",
    en: "These terms may be updated periodically, notifying registered users.",
    fr: "Ces termes peuvent être mis à jour périodiquement, en notifiant les utilisateurs enregistrés.",
    de: "Diese Bedingungen können regelmäßig aktualisiert werden, wobei registrierte Benutzer benachrichtigt werden.",
  },
  "terms.important_notice.title": {
    es: "Aviso Importante",
    en: "Important Notice",
    fr: "Avis Important",
    de: "Wichtiger Hinweis",
  },
  "terms.important_notice.content": {
    es: "Al realizar una reserva, confirmas que has leído, entendido y aceptado estos términos y condiciones en su totalidad.",
    en: "By making a booking, you confirm that you have read, understood and accepted these terms and conditions in their entirety.",
    fr: "En effectuant une réservation, vous confirmez avoir lu, compris et accepté ces termes et conditions dans leur intégralité.",
    de: "Durch eine Buchung bestätigen Sie, dass Sie diese Geschäftsbedingungen vollständig gelesen, verstanden und akzeptiert haben.",
  },
  "terms.legal_info.title": {
    es: "Información Legal",
    en: "Legal Information",
    fr: "Informations Légales",
    de: "Rechtliche Informationen",
  },
  "terms.buttons.accept": {
    es: "Aceptar",
    en: "Accept",
    fr: "Accepter",
    de: "Akzeptieren",
  },
  "terms.buttons.print": {
    es: "Imprimir",
    en: "Print",
    fr: "Imprimer",
    de: "Drucken",
  },

  // FAQ - Complete
  "faq.title": {
    es: "Preguntas Frecuentes",
    en: "Frequently Asked Questions",
    fr: "Questions Fréquemment Posées",
    de: "Häufig gestellte Fragen",
  },
  "faq.subtitle": {
    es: "Encuentra respuestas a las preguntas más comunes",
    en: "Find answers to the most common questions",
    fr: "Trouvez des réponses aux questions les plus courantes",
    de: "Finden Sie Antworten auf die häufigsten Fragen",
  },
  "faq.intro.title": {
    es: "¿Tienes dudas?",
    en: "Have questions?",
    fr: "Vous avez des questions?",
    de: "Haben Sie Fragen?",
  },
  "faq.intro.content": {
    es: "Aquí encontrarás respuestas a las preguntas más frecuentes sobre nuestras excursiones. Si no encuentras lo que buscas, no dudes en contactarnos directamente.",
    en: "Here you'll find answers to the most frequently asked questions about our excursions. If you don't find what you're looking for, don't hesitate to contact us directly.",
    fr: "Ici vous trouverez des réponses aux questions les plus fréquemment posées sur nos excursions. Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à nous contacter directement.",
    de: "Hier finden Sie Antworten auf die häufigsten Fragen zu unseren Ausflügen. Wenn Sie nicht finden, was Sie suchen, zögern Sie nicht, uns direkt zu kontaktieren.",
  },
  "faq.category1.title": {
    es: "Reservas y Cancelaciones",
    en: "Bookings and Cancellations",
    fr: "Réservations et Annulations",
    de: "Buchungen und Stornierungen",
  },
  "faq.category1.q1.question": {
    es: "¿Cómo puedo hacer una reserva?",
    en: "How can I make a booking?",
    fr: "Comment puis-je faire une réservation?",
    de: "Wie kann ich eine Buchung vornehmen?",
  },
  "faq.category1.q1.answer": {
    es: "Puedes reservar a través de nuestro formulario online o contactándonos directamente por WhatsApp. Te confirmaremos la disponibilidad y todos los detalles inmediatamente.",
    en: "You can book through our online form or by contacting us directly via WhatsApp. We'll confirm availability and all details immediately.",
    fr: "Vous pouvez réserver via notre formulaire en ligne ou en nous contactant directement par WhatsApp. Nous confirmerons la disponibilité et tous les détails immédiatement.",
    de: "Sie können über unser Online-Formular buchen oder uns direkt über WhatsApp kontaktieren. Wir bestätigen sofort die Verfügbarkeit und alle Details.",
  },
  "faq.category1.q2.question": {
    es: "¿Puedo cancelar mi reserva?",
    en: "Can I cancel my booking?",
    fr: "Puis-je annuler ma réservation?",
    de: "Kann ich meine Buchung stornieren?",
  },
  "faq.category1.q2.answer": {
    es: "Sí, ofrecemos cancelación gratuita hasta 24 horas antes de la excursión. Para cancelaciones de último momento, contáctanos y evaluaremos cada caso individualmente.",
    en: "Yes, we offer free cancellation up to 24 hours before the excursion. For last-minute cancellations, contact us and we'll evaluate each case individually.",
    fr: "Oui, nous offrons une annulation gratuite jusqu'à 24 heures avant l'excursion. Pour les annulations de dernière minute, contactez-nous et nous évaluerons chaque cas individuellement.",
    de: "Ja, wir bieten kostenlose Stornierung bis 24 Stunden vor dem Ausflug. Für Last-Minute-Stornierungen kontaktieren Sie uns und wir bewerten jeden Fall individuell.",
  },
  "faq.category1.q3.question": {
    es: "¿Qué pasa si llueve el día de mi excursión?",
    en: "What happens if it rains on the day of my excursion?",
    fr: "Que se passe-t-il s'il pleut le jour de mon excursion?",
    de: "Was passiert, wenn es am Tag meines Ausflugs regnet?",
  },
  "faq.category1.q3.answer": {
    es: "Monitoreamos constantemente las condiciones meteorológicas. Si el clima no es seguro, te ofreceremos reprogramar para otra fecha o un reembolso completo.",
    en: "We constantly monitor weather conditions. If the weather is not safe, we'll offer to reschedule for another date or provide a full refund.",
    fr: "Nous surveillons constamment les conditions météorologiques. Si le temps n'est pas sûr, nous vous proposerons de reprogrammer à une autre date ou un remboursement complet.",
    de: "Wir überwachen ständig die Wetterbedingungen. Wenn das Wetter nicht sicher ist, bieten wir eine Umplanung auf ein anderes Datum oder eine vollständige Rückerstattung an.",
  },
  "faq.category2.title": {
    es: "Pagos y Precios",
    en: "Payments and Prices",
    fr: "Paiements et Prix",
    de: "Zahlungen und Preise",
  },
  "faq.category2.q1.question": {
    es: "¿Cuándo debo pagar?",
    en: "When do I need to pay?",
    fr: "Quand dois-je payer?",
    de: "Wann muss ich bezahlen?",
  },
  "faq.category2.q1.answer": {
    es: "El pago se realiza en efectivo el día de la excursión, antes de comenzar la actividad. No requerimos pago por adelantado para confirmar tu reserva.",
    en: "Payment is made in cash on the day of the excursion, before starting the activity. We don't require advance payment to confirm your booking.",
    fr: "Le paiement s'effectue en espèces le jour de l'excursion, avant de commencer l'activité. Nous n'exigeons pas de paiement anticipé pour confirmer votre réservation.",
    de: "Die Zahlung erfolgt in bar am Tag des Ausflugs, vor Beginn der Aktivität. Wir benötigen keine Vorauszahlung zur Bestätigung Ihrer Buchung.",
  },
  "faq.category2.q2.question": {
    es: "¿Qué incluye el precio?",
    en: "What does the price include?",
    fr: "Qu'est-ce que le prix inclut?",
    de: "Was ist im Preis enthalten?",
  },
  "faq.category2.q2.answer": {
    es: "Nuestros precios incluyen transporte, guía experto, seguro, y todos los servicios especificados en cada excursión. Las comidas y bebidas se especifican por separado.",
    en: "Our prices include transport, expert guide, insurance, and all services specified in each excursion. Meals and drinks are specified separately.",
    fr: "Nos prix incluent le transport, un guide expert, l'assurance et tous les services spécifiés dans chaque excursion. Les repas et boissons sont spécifiés séparément.",
    de: "Unsere Preise beinhalten Transport, Expertenführer, Versicherung und alle in jedem Ausflug spezifizierten Dienstleistungen. Mahlzeiten und Getränke werden separat angegeben.",
  },
  "faq.category2.q3.question": {
    es: "¿Hay descuentos para grupos?",
    en: "Are there group discounts?",
    fr: "Y a-t-il des réductions de groupe?",
    de: "Gibt es Gruppenrabatte?",
  },
  "faq.category2.q3.answer": {
    es: "Sí, ofrecemos descuentos especiales para grupos de 6 o más personas. Contáctanos directamente para obtener una cotización personalizada.",
    en: "Yes, we offer special discounts for groups of 6 or more people. Contact us directly for a personalized quote.",
    fr: "Oui, nous offrons des réductions spéciales pour les groupes de 6 personnes ou plus. Contactez-nous directement pour un devis personnalisé.",
    de: "Ja, wir bieten spezielle Rabatte für Gruppen von 6 oder mehr Personen. Kontaktieren Sie uns direkt für ein personalisiertes Angebot.",
  },
  "faq.category3.title": {
    es: "Durante la Excursión",
    en: "During the Excursion",
    fr: "Pendant l'Excursion",
    de: "Während des Ausflugs",
  },
  "faq.category3.q1.question": {
    es: "¿Qué debo llevar?",
    en: "What should I bring?",
    fr: "Que dois-je apporter?",
    de: "Was soll ich mitbringen?",
  },
  "faq.category3.q1.answer": {
    es: "Te enviaremos una lista detallada según tu excursión. Generalmente incluye ropa cómoda, calzado adecuado, protector solar, agua y cámara. El equipo especializado lo proporcionamos nosotros.",
    en: "We'll send you a detailed list according to your excursion. Generally includes comfortable clothing, appropriate footwear, sunscreen, water and camera. We provide specialized equipment.",
    fr: "Nous vous enverrons une liste détaillée selon votre excursion. Comprend généralement des vêtements confortables, des chaussures appropriées, de la crème solaire, de l'eau et un appareil photo. Nous fournissons l'équipement spécialisé.",
    de: "Wir senden Ihnen eine detaillierte Liste entsprechend Ihrem Ausflug. Umfasst normalerweise bequeme Kleidung, geeignetes Schuhwerk, Sonnenschutz, Wasser und Kamera. Spezialausrüstung stellen wir zur Verfügung.",
  },
  "faq.category3.q2.question": {
    es: "¿Hay límite de edad?",
    en: "Is there an age limit?",
    fr: "Y a-t-il une limite d'âge?",
    de: "Gibt es eine Altersgrenze?",
  },
  "faq.category3.q2.answer": {
    es: "Cada excursión tiene sus propios requisitos de edad por seguridad. Tenemos opciones para todas las edades, desde actividades familiares hasta aventuras más extremas para adultos.",
    en: "Each excursion has its own age requirements for safety. We have options for all ages, from family activities to more extreme adventures for adults.",
    fr: "Chaque excursion a ses propres exigences d'âge pour la sécurité. Nous avons des options pour tous les âges, des activités familiales aux aventures plus extrêmes pour adultes.",
    de: "Jeder Ausflug hat aus Sicherheitsgründen seine eigenen Altersanforderungen. Wir haben Optionen für alle Altersgruppen, von Familienaktivitäten bis hin zu extremeren Abenteuern für Erwachsene.",
  },
  "faq.category3.q3.question": {
    es: "¿Qué pasa si tengo problemas de salud?",
    en: "What if I have health problems?",
    fr: "Et si j'ai des problèmes de santé?",
    de: "Was ist, wenn ich gesundheitliche Probleme habe?",
  },
  "faq.category3.q3.answer": {
    es: "Es importante que nos informes sobre cualquier condición médica al hacer la reserva. Adaptaremos la excursión a tus necesidades o te recomendaremos la actividad más adecuada.",
    en: "It's important that you inform us about any medical condition when booking. We'll adapt the excursion to your needs or recommend the most suitable activity.",
    fr: "Il est important que vous nous informiez de toute condition médicale lors de la réservation. Nous adapterons l'excursion à vos besoins ou vous recommanderons l'activité la plus appropriée.",
    de: "Es ist wichtig, dass Sie uns bei der Buchung über jede medizinische Bedingung informieren. Wir passen den Ausflug an Ihre Bedürfnisse an oder empfehlen die am besten geeignete Aktivität.",
  },
  "faq.category4.title": {
    es: "Seguridad y Equipamiento",
    en: "Safety and Equipment",
    fr: "Sécurité et Équipement",
    de: "Sicherheit und Ausrüstung",
  },
  "faq.category4.q1.question": {
    es: "¿Están aseguradas las excursiones?",
    en: "Are the excursions insured?",
    fr: "Les excursions sont-elles assurées?",
    de: "Sind die Ausflüge versichert?",
  },
  "faq.category4.q1.answer": {
    es: "Sí, todos nuestros participantes están cubiertos por seguro de responsabilidad civil y accidentes. Trabajamos solo con compañías de seguros reconocidas.",
    en: "Yes, all our participants are covered by civil liability and accident insurance. We work only with recognized insurance companies.",
    fr: "Oui, tous nos participants sont couverts par une assurance responsabilité civile et accidents. Nous travaillons uniquement avec des compagnies d'assurance reconnues.",
    de: "Ja, alle unsere Teilnehmer sind durch Haftpflicht- und Unfallversicherung abgedeckt. Wir arbeiten nur mit anerkannten Versicherungsunternehmen.",
  },
  "faq.category4.q2.question": {
    es: "¿Proporcionan el equipo necesario?",
    en: "Do you provide the necessary equipment?",
    fr: "Fournissez-vous l'équipement nécessaire?",
    de: "Stellen Sie die notwendige Ausrüstung zur Verfügung?",
  },
  "faq.category4.q2.answer": {
    es: "Sí, proporcionamos todo el equipo especializado necesario para cada actividad. Solo necesitas traer ropa cómoda y ganas de aventura.",
    en: "Yes, we provide all the specialized equipment necessary for each activity. You just need to bring comfortable clothes and a sense of adventure.",
    fr: "Oui, nous fournissons tout l'équipement spécialisé nécessaire pour chaque activité. Vous n'avez qu'à apporter des vêtements confortables et un esprit d'aventure.",
    de: "Ja, wir stellen die gesamte spezialisierte Ausrüstung zur Verfügung, die für jede Aktivität erforderlich ist. Sie müssen nur bequeme Kleidung und Abenteuerlust mitbringen.",
  },
  "faq.category4.q3.question": {
    es: "¿Qué medidas de seguridad tienen?",
    en: "What safety measures do you have?",
    fr: "Quelles mesures de sécurité avez-vous?",
    de: "Welche Sicherheitsmaßnahmen haben Sie?",
  },
  "faq.category4.q3.answer": {
    es: "Nuestros guías están certificados en primeros auxilios, seguimos protocolos estrictos de seguridad, y realizamos briefings detallados antes de cada actividad.",
    en: "Our guides are certified in first aid, we follow strict safety protocols, and conduct detailed briefings before each activity.",
    fr: "Nos guides sont certifiés en premiers secours, nous suivons des protocoles de sécurité stricts et effectuons des briefings détaillés avant chaque activité.",
    de: "Unsere Führer sind in Erster Hilfe zertifiziert, wir befolgen strenge Sicherheitsprotokolle und führen detaillierte Briefings vor jeder Aktivität durch.",
  },
  "faq.contact.title": {
    es: "¿No encuentras tu respuesta?",
    en: "Can't find your answer?",
    fr: "Vous ne trouvez pas votre réponse?",
    de: "Finden Sie Ihre Antwort nicht?",
  },
  "faq.contact.content": {
    es: "Nuestro equipo está disponible 24/7 para resolver cualquier duda que tengas.",
    en: "Our team is available 24/7 to resolve any questions you may have.",
    fr: "Notre équipe est disponible 24/7 pour résoudre toutes les questions que vous pourriez avoir.",
    de: "Unser Team ist 24/7 verfügbar, um alle Fragen zu beantworten, die Sie haben könnten.",
  },
  "faq.contact.whatsapp": {
    es: "WhatsApp",
    en: "WhatsApp",
    fr: "WhatsApp",
    de: "WhatsApp",
  },
  "faq.contact.schedule": {
    es: "Horarios",
    en: "Schedule",
    fr: "Horaires",
    de: "Zeitplan",
  },
  "faq.buttons.close": {
    es: "Cerrar",
    en: "Close",
    fr: "Fermer",
    de: "Schließen",
  },
  "faq.buttons.print": {
    es: "Imprimir",
    en: "Print",
    fr: "Imprimer",
    de: "Drucken",
  },

  // About Page - Complete
  "about.story_badge": {
    es: "Nuestra Historia",
    en: "Our Story",
    fr: "Notre Histoire",
    de: "Unsere Geschichte",
  },
  "about.story_title": {
    es: "Nuestra Historia",
    en: "Our Story",
    fr: "Notre Histoire",
    de: "Unsere Geschichte",
  },
  "about.hero_badge": {
    es: "Nuestra Historia",
    en: "Our Story",
    fr: "Notre Histoire",
    de: "Unsere Geschichte",
  },
  "about.title": {
    es: "Descubre Quiénes Somos",
    en: "Discover Who We Are",
    fr: "Découvrez Qui Nous Sommes",
    de: "Entdecken Sie Wer Wir Sind",
  },
  "about.subtitle": {
    es: "Expertos en aventuras inolvidables en Tenerife",
    en: "Experts in unforgettable adventures in Tenerife",
    fr: "Experts en aventures inoubliables à Tenerife",
    de: "Experten für unvergessliche Abenteuer auf Teneriffa",
  },
  "about.description": {
    es: "Somos un equipo apasionado de guías locales con años de experiencia mostrando la belleza de Tenerife a visitantes de todo el mundo. Nuestra misión es crear experiencias auténticas que conecten a nuestros clientes con la naturaleza, cultura y tradiciones de nuestra isla.",
    en: "We are a passionate team of local guides with years of experience showing the beauty of Tenerife to visitors from around the world. Our mission is to create authentic experiences that connect our clients with the nature, culture and traditions of our island.",
    fr: "Nous sommes une équipe passionnée de guides locaux avec des années d'expérience montrant la beauté de Tenerife aux visiteurs du monde entier. Notre mission est de créer des expériences authentiques qui connectent nos clients avec la nature, la culture et les traditions de notre île.",
    de: "Wir sind ein leidenschaftliches Team lokaler Führer mit jahrelanger Erfahrung, die Schönheit Teneriffas Besuchern aus aller Welt zu zeigen. Unsere Mission ist es, authentische Erlebnisse zu schaffen, die unsere Kunden mit der Natur, Kultur und den Traditionen unserer Insel verbinden.",
  },

  // Mission, Vision, Values
  "about.mission": {
    es: "Misión",
    en: "Mission",
    fr: "Mission",
    de: "Mission",
  },
  "about.mission_text": {
    es: "Crear experiencias auténticas e inolvidables que conecten a nuestros visitantes con la verdadera esencia de Tenerife, promoviendo el turismo sostenible y responsable.",
    en: "Create authentic and unforgettable experiences that connect our visitors with the true essence of Tenerife, promoting sustainable and responsible tourism.",
    fr: "Créer des expériences authentiques et inoubliables qui connectent nos visiteurs avec la véritable essence de Tenerife, en promouvant un tourisme durable et responsable.",
    de: "Authentische und unvergessliche Erlebnisse schaffen, die unsere Besucher mit der wahren Essenz Teneriffas verbinden und nachhaltigen und verantwortlichen Tourismus fördern.",
  },
  "about.vision": {
    es: "Visión",
    en: "Vision",
    fr: "Vision",
    de: "Vision",
  },
  "about.vision_text": {
    es: "Ser la empresa líder en excursiones de Tenerife, reconocida por nuestra excelencia en el servicio, innovación y compromiso con la preservación del patrimonio natural y cultural de la isla.",
    en: "To be the leading excursion company in Tenerife, recognized for our excellence in service, innovation and commitment to preserving the island's natural and cultural heritage.",
    fr: "Être la société d'excursions leader à Tenerife, reconnue pour notre excellence dans le service, l'innovation et l'engagement à préserver le patrimoine naturel et culturel de l'île.",
    de: "Das führende Ausflugsunternehmen auf Teneriffa zu sein, anerkannt für unsere Exzellenz im Service, Innovation und Engagement für die Erhaltung des natürlichen und kulturellen Erbes der Insel.",
  },
  "about.values": {
    es: "Valores",
    en: "Values",
    fr: "Valeurs",
    de: "Werte",
  },
  "about.values_text": {
    es: "Pasión, respeto por la naturaleza, calidad en el servicio y compromiso con nuestros clientes son los pilares fundamentales que guían cada una de nuestras acciones.",
    en: "Passion, respect for nature, quality service and commitment to our clients are the fundamental pillars that guide each of our actions.",
    fr: "La passion, le respect de la nature, la qualité du service et l'engagement envers nos clients sont les piliers fondamentaux qui guident chacune de nos actions.",
    de: "Leidenschaft, Respekt vor der Natur, Servicequalität und Engagement für unsere Kunden sind die grundlegenden Säulen, die jede unserer Handlungen leiten.",
  },

  // Individual Values
  "about.value_passion_title": {
    es: "Pasión",
    en: "Passion",
    fr: "Passion",
    de: "Leidenschaft",
  },
  "about.value_passion_desc": {
    es: "Amamos lo que hacemos y esa pasión se refleja en cada excursión que organizamos, transmitiendo nuestro entusiasmo por Tenerife a cada visitante.",
    en: "We love what we do and that passion is reflected in every excursion we organize, transmitting our enthusiasm for Tenerife to every visitor.",
    fr: "Nous aimons ce que nous faisons et cette passion se reflète dans chaque excursion que nous organisons, transmettant notre enthousiasme pour Tenerife à chaque visiteur.",
    de: "Wir lieben was wir tun und diese Leidenschaft spiegelt sich in jedem Ausflug wider, den wir organisieren, und überträgt unsere Begeisterung für Teneriffa auf jeden Besucher.",
  },
  "about.value_experience_title": {
    es: "Experiencia",
    en: "Experience",
    fr: "Expérience",
    de: "Erfahrung",
  },
  "about.value_experience_desc": {
    es: "Nuestro equipo cuenta con años de experiencia explorando cada rincón de Tenerife, conocimiento que compartimos para crear aventuras únicas e inolvidables.",
    en: "Our team has years of experience exploring every corner of Tenerife, knowledge that we share to create unique and unforgettable adventures.",
    fr: "Notre équipe a des années d'expérience à explorer chaque coin de Tenerife, des connaissances que nous partageons pour créer des aventures uniques et inoubliables.",
    de: "Unser Team hat jahrelange Erfahrung bei der Erkundung jeder Ecke Teneriffas, Wissen, das wir teilen, um einzigartige und unvergessliche Abenteuer zu schaffen.",
  },
  "about.value_security_title": {
    es: "Seguridad",
    en: "Security",
    fr: "Sécurité",
    de: "Sicherheit",
  },
  "about.value_security_desc": {
    es: "La seguridad de nuestros clientes es nuestra máxima prioridad. Contamos con protocolos estrictos y equipamiento de primera calidad para garantizar experiencias seguras.",
    en: "The safety of our clients is our top priority. We have strict protocols and top-quality equipment to guarantee safe experiences.",
    fr: "La sécurité de nos clients est notre priorité absolue. Nous avons des protocoles stricts et un équipement de première qualité pour garantir des expériences sûres.",
    de: "Die Sicherheit unserer Kunden hat für uns oberste Priorität. Wir haben strenge Protokolle und erstklassige Ausrüstung, um sichere Erlebnisse zu gewährleisten.",
  },
  "about.value_quality_title": {
    es: "Calidad",
    en: "Quality",
    fr: "Qualité",
    de: "Qualität",
  },
  "about.value_quality_desc": {
    es: "Nos comprometemos a ofrecer el más alto nivel de calidad en todos nuestros servicios, desde la planificación hasta la ejecución de cada excursión.",
    en: "We are committed to offering the highest level of quality in all our services, from planning to execution of each excursion.",
    fr: "Nous nous engageons à offrir le plus haut niveau de qualité dans tous nos services, de la planification à l'exécution de chaque excursion.",
    de: "Wir verpflichten uns, das höchste Qualitätsniveau in all unseren Dienstleistungen zu bieten, von der Planung bis zur Durchführung jedes Ausflugs.",
  },

  // Excursions Page
  "excursions.all_categories": {
    es: "Todas las categorías",
    en: "All categories",
    fr: "Toutes les catégories",
    de: "Alle Kategorien",
  },
  "excursions.filters": {
    es: "Filtros",
    en: "Filters",
    fr: "Filtres",
    de: "Filter",
  },
  "excursions.search_placeholder": {
    es: "Buscar excursiones...",
    en: "Search excursions...",
    fr: "Rechercher des excursions...",
    de: "Ausflüge suchen...",
  },
  "excursions.all_prices": {
    es: "Todos los precios",
    en: "All prices",
    fr: "Tous les prix",
    de: "Alle Preise",
  },
  "excursions.price_low": {
    es: "Menos de €50",
    en: "Under €50",
    fr: "Moins de 50€",
    de: "Unter 50€",
  },
  "excursions.price_medium": {
    es: "€50 - €80",
    en: "€50 - €80",
    fr: "50€ - 80€",
    de: "50€ - 80€",
  },
  "excursions.price_high": {
    es: "Más de €80",
    en: "Over €80",
    fr: "Plus de 80€",
    de: "Über 80€",
  },
  "excursions.sort_featured": {
    es: "Destacados",
    en: "Featured",
    fr: "En vedette",
    de: "Empfohlen",
  },
  "excursions.sort_price_low": {
    es: "Precio: Menor a mayor",
    en: "Price: Low to high",
    fr: "Prix: Croissant",
    de: "Preis: Niedrig bis hoch",
  },
  "excursions.sort_price_high": {
    es: "Precio: Mayor a menor",
    en: "Price: High to low",
    fr: "Prix: Décroissant",
    de: "Preis: Hoch bis niedrig",
  },
  "excursions.sort_name": {
    es: "Nombre A-Z",
    en: "Name A-Z",
    fr: "Nom A-Z",
    de: "Name A-Z",
  },
  "excursions.found": {
    es: "excursión encontrada",
    en: "excursion found",
    fr: "excursion trouvée",
    de: "Ausflug gefunden",
  },
  "excursions.found_plural": {
    es: "excursiones encontradas",
    en: "excursions found",
    fr: "excursions trouvées",
    de: "Ausflüge gefunden",
  },
  "excursions.showing_all": {
    es: "Mostrando todas las experiencias disponibles",
    en: "Showing all available experiences",
    fr: "Affichage de toutes les expériences disponibles",
    de: "Alle verfügbaren Erlebnisse anzeigen",
  },
  "excursions.filtered_from": {
    es: "Filtrado de",
    en: "Filtered from",
    fr: "Filtré de",
    de: "Gefiltert von",
  },
  "excursions.total_experiences": {
    es: "experiencias totales",
    en: "total experiences",
    fr: "expériences totales",
    de: "Gesamterlebnisse",
  },
  "excursions.no_results": {
    es: "No se encontraron resultados",
    en: "No results found",
    fr: "Aucun résultat trouvé",
    de: "Keine Ergebnisse gefunden",
  },
  "excursions.no_results_text": {
    es: "Intenta ajustar tus filtros o buscar con términos diferentes para encontrar la excursión perfecta.",
    en: "Try adjusting your filters or searching with different terms to find the perfect excursion.",
    fr: "Essayez d'ajuster vos filtres ou de rechercher avec des termes différents pour trouver l'excursion parfaite.",
    de: "Versuchen Sie, Ihre Filter anzupassen oder mit anderen Begriffen zu suchen, um den perfekten Ausflug zu finden.",
  },
  "excursions.view_all": {
    es: "Ver todas las excursiones",
    en: "View all excursions",
    fr: "Voir toutes les excursions",
    de: "Alle Ausflüge ansehen",
  },
  "excursions.custom_experience": {
    es: "¿Buscas una experiencia personalizada?",
    en: "Looking for a custom experience?",
    fr: "Vous cherchez une expérience personnalisée?",
    de: "Suchen Sie ein individuelles Erlebnis?",
  },
  "excursions.custom_text": {
    es: "Creamos excursiones únicas adaptadas a tus intereses y necesidades específicas.",
    en: "We create unique excursions tailored to your specific interests and needs.",
    fr: "Nous créons des excursions uniques adaptées à vos intérêts et besoins spécifiques.",
    de: "Wir erstellen einzigartige Ausflüge, die auf Ihre spezifischen Interessen und Bedürfnisse zugeschnitten sind.",
  },
  "excursions.contact_custom": {
    es: "Contactar para experiencia personalizada",
    en: "Contact for custom experience",
    fr: "Contacter pour une expérience personnalisée",
    de: "Kontakt für individuelles Erlebnis",
  },
  "excursions.clear_filters": {
    es: "Limpiar filtros",
    en: "Clear filters",
    fr: "Effacer les filtres",
    de: "Filter löschen",
  },
  "excursions.search_label": {
    es: "Búsqueda",
    en: "Search",
    fr: "Recherche",
    de: "Suche",
  },

  // Categories
  "category.naturaleza": {
    es: "Naturaleza",
    en: "Nature",
    fr: "Nature",
    de: "Natur",
  },
  "category.marina": {
    es: "Marina",
    en: "Marine",
    fr: "Marine",
    de: "Meerestiere",
  },
  "category.senderismo": {
    es: "Senderismo",
    en: "Hiking",
    fr: "Randonnée",
    de: "Wandern",
  },
  "category.gastronomia": {
    es: "Gastronomía",
    en: "Gastronomy",
    fr: "Gastronomie",
    de: "Gastronomie",
  },
  "category.paisajes": {
    es: "Paisajes",
    en: "Landscapes",
    fr: "Paysages",
    de: "Landschaften",
  },
  "category.familia": {
    es: "Familia",
    en: "Family",
    fr: "Famille",
    de: "Familie",
  },

  // Common
  "common.loading_experiences": {
    es: "Cargando experiencias...",
    en: "Loading experiences...",
    fr: "Chargement des expériences...",
    de: "Erlebnisse werden geladen...",
  },
  "common.all_ratings": {
    es: "Todas las valoraciones verificadas",
    en: "All verified ratings",
    fr: "Toutes les évaluations vérifiées",
    de: "Alle verifizierten Bewertungen",
  },

  // Footer
  "footer.company_description": {
    es: "Descubre la magia de Tenerife con nuestras excursiones únicas. Experiencias inolvidables en la isla de la eterna primavera.",
    en: "Discover the magic of Tenerife with our unique excursions. Unforgettable experiences on the island of eternal spring.",
    fr: "Découvrez la magie de Tenerife avec nos excursions uniques. Des expériences inoubliables sur l'île de l'éternel printemps.",
    de: "Entdecken Sie die Magie Teneriffas mit unseren einzigartigen Ausflügen. Unvergessliche Erlebnisse auf der Insel des ewigen Frühlings.",
  },
  "footer.quick_links": {
    es: "Enlaces Rápidos",
    en: "Quick Links",
    fr: "Liens Rapides",
    de: "Schnelle Links",
  },
  "footer.contact_info": {
    es: "Información de Contacto",
    en: "Contact Information",
    fr: "Informations de Contact",
    de: "Kontaktinformationen",
  },
  "footer.newsletter": {
    es: "Newsletter",
    en: "Newsletter",
    fr: "Newsletter",
    de: "Newsletter",
  },
  "footer.newsletter_text": {
    es: "Suscríbete para recibir ofertas especiales y novedades sobre nuestras excursiones.",
    en: "Subscribe to receive special offers and news about our excursions.",
    fr: "Abonnez-vous pour recevoir des offres spéciales et des nouvelles sur nos excursions.",
    de: "Abonnieren Sie, um Sonderangebote und Neuigkeiten über unsere Ausflüge zu erhalten.",
  },
  "footer.subscribe": {
    es: "Suscribirse",
    en: "Subscribe",
    fr: "S'abonner",
    de: "Abonnieren",
  },
  "footer.copyright": {
    es: "© 2024 TenerifeParadise Tours & Excursions. Todos los derechos reservados.",
    en: "© 2024 TenerifeParadise Tours & Excursions. All rights reserved.",
    fr: "© 2024 TenerifeParadise Tours & Excursions. Tous droits réservés.",
    de: "© 2024 TenerifeParadise Tours & Excursions. Alle Rechte vorbehalten.",
  },
  "footer.designed_by": {
    es: "Diseñado por",
    en: "Designed by",
    fr: "Conçu par",
    de: "Entworfen von",
  },
  "footer.privacy": {
    es: "Política de Privacidad",
    en: "Privacy Policy",
    fr: "Politique de Confidentialité",
    de: "Datenschutzrichtlinie",
  },
  "footer.terms": {
    es: "Términos y Condiciones",
    en: "Terms & Conditions",
    fr: "Termes et Conditions",
    de: "Geschäftsbedingungen",
  },
  "footer.faq": {
    es: "Preguntas Frecuentes",
    en: "FAQ",
    fr: "FAQ",
    de: "FAQ",
  },

  // Gallery
  "gallery.badge": {
    es: "Galería de fotos",
    en: "Photo gallery",
    fr: "Galerie de photos",
    de: "Fotogalerie",
  },
  "gallery.title": {
    es: "Momentos Inolvidables",
    en: "Unforgettable Moments",
    fr: "Moments Inoubliables",
    de: "Unvergessliche Momente",
  },
  "gallery.subtitle": {
    es: "Descubre la belleza de Tenerife a través de nuestras aventuras",
    en: "Discover the beauty of Tenerife through our adventures",
    fr: "Découvrez la beauté de Tenerife à travers nos aventures",
    de: "Entdecken Sie die Schönheit Teneriffas durch unsere Abenteuer",
  },
  "gallery.loading": {
    es: "Cargando galería...",
    en: "Loading gallery...",
    fr: "Chargement de la galerie...",
    de: "Galerie wird geladen...",
  },
  "gallery.no_images": {
    es: "No hay imágenes disponibles",
    en: "No images available",
    fr: "Aucune image disponible",
    de: "Keine Bilder verfügbar",
  },
  "gallery.close": {
    es: "Cerrar",
    en: "Close",
    fr: "Fermer",
    de: "Schließen",
  },
  "gallery.previous": {
    es: "Anterior",
    en: "Previous",
    fr: "Précédent",
    de: "Vorherige",
  },
  "gallery.next": {
    es: "Siguiente",
    en: "Next",
    fr: "Suivant",
    de: "Nächste",
  },
  "gallery.instructions": {
    es: "Usa las flechas del teclado o haz clic para navegar",
    en: "Use keyboard arrows or click to navigate",
    fr: "Utilisez les flèches du clavier ou cliquez pour naviguer",
    de: "Verwenden Sie die Pfeiltasten oder klicken Sie zum Navigieren",
  },

  // Home page
  "home.hero.title": {
    es: "Descubre la Magia de Tenerife",
    en: "Discover the Magic of Tenerife",
    fr: "Découvrez la Magie de Tenerife",
    de: "Entdecke die Magie von Teneriffa",
  },
  "home.hero.subtitle": {
    es: "Explora paisajes volcánicos únicos, playas paradisíacas y experiencias inolvidables en la isla de la eterna primavera.",
    en: "Explore unique volcanic landscapes, paradise beaches and unforgettable experiences on the island of eternal spring.",
    fr: "Explorez des paysages volcaniques uniques, des plages paradisiaques et des expériences inoubliables sur l'île de l'éternel printemps.",
    de: "Erkunden Sie einzigartige Vulkanlandschaften, paradiesische Strände und unvergessliche Erlebnisse auf der Insel des ewigen Frühlings.",
  },
  "home.hero.cta": {
    es: "Ver Excursiones",
    en: "View Excursions",
    fr: "Voir les Excursions",
    de: "Ausflüge ansehen",
  },
  "home.featured.title": {
    es: "Excursiones Destacadas",
    en: "Featured Excursions",
    fr: "Excursions en Vedette",
    de: "Empfohlene Ausflüge",
  },
  "home.featured.subtitle": {
    es: "Descubre nuestras experiencias más populares",
    en: "Discover our most popular experiences",
    fr: "Découvrez nos expériences les plus populaires",
    de: "Entdecken Sie unsere beliebtesten Erlebnisse",
  },

  // ExcursionCard
  "excursion.duration": {
    es: "Duración",
    en: "Duration",
    fr: "Durée",
    de: "Dauer",
  },
  "excursion.hours": {
    es: "horas",
    en: "hours",
    fr: "heures",
    de: "Stunden",
  },
  "excursion.from": {
    es: "Desde",
    en: "From",
    fr: "À partir de",
    de: "Ab",
  },
  "excursion.to": {
    es: "hasta",
    en: "to",
    fr: "jusqu'à",
    de: "bis",
  },
  "excursion.bookNow": {
    es: "Reservar Ahora",
    en: "Book Now",
    fr: "Réserver Maintenant",
    de: "Jetzt Buchen",
  },
  "excursion.viewDetails": {
    es: "Ver Detalles",
    en: "View Details",
    fr: "Voir les Détails",
    de: "Details ansehen",
  },

  // Search
  "search.placeholder": {
    es: "Buscar excursiones...",
    en: "Search excursions...",
    fr: "Rechercher des excursions...",
    de: "Ausflüge suchen...",
  },
  "search.popular": {
    es: "Excursiones Populares",
    en: "Popular Excursions",
    fr: "Excursions Populaires",
    de: "Beliebte Ausflüge",
  },
  "search.results": {
    es: "Resultados de búsqueda",
    en: "Search results",
    fr: "Résultats de recherche",
    de: "Suchergebnisse",
  },
  "search.noResults": {
    es: "No se encontraron resultados",
    en: "No results found",
    fr: "Aucun résultat trouvé",
    de: "Keine Ergebnisse gefunden",
  },

  // Home
  "hero.title": {
    es: "Descubre la Magia de Tenerife",
    en: "Discover the Magic of Tenerife",
    fr: "Découvrez la Magie de Tenerife",
    de: "Entdecke die Magie von Teneriffa",
  },
  "hero.subtitle": {
    es: "Explora paisajes volcánicos únicos, playas paradisíacas y experiencias inolvidables en la isla de la eterna primavera.",
    en: "Explore unique volcanic landscapes, paradise beaches and unforgettable experiences on the island of eternal spring.",
    fr: "Explorez des paysages volcaniques uniques, des plages paradisiaques et des expériences inoubliables sur l'île de l'éternel printemps.",
    de: "Erkunden Sie einzigartige Vulkanlandschaften, paradiesische Strände und unvergessliche Erlebnisse auf der Insel des ewigen Frühlings.",
  },
  "hero.description": {
    es: "Vive aventuras inolvidables en Tenerife. Excursiones para todos los gustos.",
    en: "Live unforgettable adventures in Tenerife. Excursions for all tastes.",
    fr: "Vivez des aventures inoubliables à Tenerife. Des excursions pour tous les goûts.",
    de: "Erleben Sie unvergessliche Abenteuer auf Teneriffa. Ausflüge für jeden Geschmack.",
  },
  "hero.description2": {
    es: "Reserva ahora y explora la isla de la eterna primavera.",
    en: "Book now and explore the island of eternal spring.",
    fr: "Réservez maintenant et explorez l'île de l'éternel printemps.",
    de: "Buchen Sie jetzt und erkunden Sie die Insel des ewigen Frühlings.",
  },
  "featured.title": {
    es: "Excursiones Destacadas",
    en: "Featured Excursions",
    fr: "Excursions en Vedette",
    de: "Empfohlene Ausflüge",
  },
  "featured.subtitle": {
    es: "Descubre nuestras experiencias más populares",
    en: "Discover our most popular experiences",
    fr: "Découvrez nos expériences les plus populaires",
    de: "Entdecken Sie unsere beliebtesten Erlebnisse",
  },
  "featured.badge": {
    es: "Más vendido",
    en: "Best Seller",
    fr: "Meilleures ventes",
    de: "Bestseller",
  },
  "featured.view_all": {
    es: "Ver todas las excursiones",
    en: "View all excursions",
    fr: "Voir toutes les excursions",
    de: "Alle Ausflüge ansehen",
  },
  "featured.whatsapp_interest": {
    es: "¿Te interesa esta excursión?",
    en: "Are you interested in this excursion?",
    fr: "Cette excursion vous intéresse-t-elle ?",
    de: "Interessieren Sie sich für diesen Ausflug?",
  },
  "featured.whatsapp_info": {
    es: "¡Pregúntanos por WhatsApp!",
    en: "Ask us on WhatsApp!",
    fr: "Demandez-nous sur WhatsApp !",
    de: "Fragen Sie uns auf WhatsApp!",
  },
  "featured.per_person": {
    es: "por persona",
    en: "per person",
    fr: "par personne",
    de: "pro Person",
  },
  "featured.small_group": {
    es: "Grupo pequeño",
    en: "Small group",
    fr: "Petit groupe",
    de: "Kleine Gruppe",
  },
  "featured.max_people": {
    es: "Máx. {maxPeople} personas",
    en: "Max. {maxPeople} people",
    fr: "Max. {maxPeople} personnes",
    de: "Max. {maxPeople} Personen",
  },
  "featured.free_cancellation": {
    es: "Cancelación gratuita",
    en: "Free cancellation",
    fr: "Annulation gratuite",
    de: "Kostenlose Stornierung",
  },
  "featured.book_now": {
    es: "Reservar ahora",
    en: "Book now",
    fr: "Réserver maintenant",
    de: "Jetzt buchen",
  },
  "featured.view_details": {
    es: "Ver detalles",
    en: "View details",
    fr: "Voir les détails",
    de: "Details ansehen",
  },
  "featured.featured_badge": {
    es: "Destacado",
    en: "Featured",
    fr: "En vedette",
    de: "Empfohlen",
  },
  "featured.hour": {
    es: "hora",
    en: "hour",
    fr: "heure",
    de: "Stunde",
  },
  "featured.hours": {
    es: "horas",
    en: "hours",
    fr: "heures",
    de: "Stunden",
  },
  "featured.services_included": {
    es: "Servicios incluidos",
    en: "Services included",
    fr: "Services inclus",
    de: "Inkludierte Leistungen",
  },
  "featured.services_not_included": {
    es: "Servicios no incluidos",
    en: "Services not included",
    fr: "Services non inclus",
    de: "Nicht inkludierte Leistungen",
  },
  "services.included": {
    es: "servicios incluidos",
    en: "services included",
    fr: "services inclus",
    de: "Leistungen inbegriffen",
  },
  "services.not_included": {
    es: "servicios no incluidos",
    en: "services not included",
    fr: "services non inclus",
    de: "Leistungen nicht inbegriffen",
  },
  "featured.reviews": {
    es: "Reseñas",
    en: "Reviews",
    fr: "Avis",
    de: "Bewertungen",
  },
  "featured.review": {
    es: "Reseña",
    en: "Review",
    fr: "Avis",
    de: "Bewertung",
  },
  "cta.ready_title": {
    es: "¿Listo para la aventura?",
    en: "Ready for adventure?",
    fr: "Prêt pour l'aventure ?",
    de: "Bereit für das Abenteuer?",
  },
  "cta.adventure_title": {
    es: "Descubre Tenerife con nuestras",
    en: "Discover Tenerife with our",
    fr: "Découvrez Tenerife avec nos",
    de: "Entdecken Sie Teneriffa mit unseren",
  },
  "cta.adventure_title2": {
    es: "excursiones",
    en: "excursions",
    fr: "excursions",
    de: "Ausflügen",
  },
  "cta.adventure_text": {
    es: "Vive experiencias inolvidables explorando la isla.",
    en: "Live unforgettable experiences exploring the island.",
    fr: "Vivez des expériences inoubliables en explorant l'île.",
    de: "Erleben Sie unvergessliche Erlebnisse bei der Erkundung der Insel.",
  },
  "cta.adventure_text2": {
    es: "¡Reserva ahora y comienza tu aventura!",
    en: "Book now and start your adventure!",
    fr: "Réservez maintenant et commencez votre aventure !",
    de: "Buchen Sie jetzt und starten Sie Ihr Abenteuer!",
  },
  "cta.book_now": {
    es: "Reservar ahora",
    en: "Book now",
    fr: "Réserver maintenant",
    de: "Jetzt buchen",
  },
  "cta.more_info": {
    es: "Más información",
    en: "More info",
    fr: "Plus d'informations",
    de: "Mehr Informationen",
  },
  "common.preparing": {
    es: "Preparando...",
    en: "Preparing...",
    fr: "Préparation...",
    de: "Vorbereitung...",
  },
  "cookies.title": {
    es: "Política de Cookies",
    en: "Cookies Policy",
    fr: "Politique de Cookies",
    de: "Cookie-Richtlinie",
  },
  "cookies.description": {
    es: "Utilizamos cookies para mejorar tu experiencia en nuestra web. Al continuar navegando, aceptas nuestra política de cookies.",
    en: "We use cookies to improve your experience on our website. By continuing to browse, you accept our cookies policy.",
    fr: "Nous utilisons des cookies pour améliorer votre expérience sur notre site web. En continuant à naviguer, vous acceptez notre politique de cookies.",
    de: "Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern. Durch das weitere Surfen akzeptieren Sie unsere Cookie-Richtlinie.",
  },
  "cookies.accept_all": {
    es: "Aceptar todas",
    en: "Accept all",
    fr: "Tout accepter",
    de: "Alle akzeptieren",
  },
  "cookies.necessary_only": {
    es: "Solo necesarias",
    en: "Necessary only",
    fr: "Nécessaires seulement",
    de: "Nur notwendige",
  },
  "cookies.customize": {
    es: "Personalizar",
    en: "Customize",
    fr: "Personnaliser",
    de: "Anpassen",
  },
  "cookies.more_info": {
    es: "Más información",
    en: "More information",
    fr: "Plus d'informations",
    de: "Mehr Informationen",
  },
  "cookies.privacy_policy": {
    es: "Política de privacidad",
    en: "Privacy policy",
    fr: "Politique de confidentialité",
    de: "Datenschutzrichtlinie",
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
