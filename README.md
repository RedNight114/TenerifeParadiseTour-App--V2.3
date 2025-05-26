# Tenerife Paradise Tours - Sistema de Gestión

Sistema completo de gestión de excursiones para Tenerife Paradise Tours con panel de administración, gestión de categorías, reservas y contenido multiidioma.

## 🚀 Características

### ✨ **Funcionalidades Principales**
- **Gestión de Categorías**: Sistema completo de administración de categorías con soporte multiidioma
- **Panel de Excursiones**: Creación y gestión de excursiones con información detallada
- **Sistema de Reservas**: Integración con WhatsApp para confirmación de reservas
- **Multiidioma**: Soporte completo para Español, Inglés y Alemán
- **Responsive Design**: Optimizado para todos los dispositivos

### 🛠 **Tecnologías Utilizadas**
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Storage**: Vercel Blob para imágenes
- **Deployment**: Vercel

## 📦 Instalación

### 1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd tenerife-paradise-tours
\`\`\`

### 2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

### 3. **Configurar variables de entorno**
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edita `.env.local` con tus credenciales:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
BLOB_READ_WRITE_TOKEN=tu_token_de_vercel_blob
\`\`\`

### 4. **Configurar base de datos**
Ejecuta los scripts SQL proporcionados en tu proyecto Supabase:
- `01-create-categories-table.sql`
- `02-insert-default-categories.sql`
- `03-create-predefined-services.sql`
- `04-update-excursions-table.sql`
- `05-setup-security-policies.sql`

### 5. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
├── app/                          # App Router de Next.js
│   ├── admin/                    # Panel de administración
│   │   ├── categories/           # Gestión de categorías
│   │   └── excursion-form/       # Formulario de excursiones
│   ├── booking/                  # Sistema de reservas
│   ├── excursions/              # Páginas de excursiones
│   └── globals.css              # Estilos globales
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes de shadcn/ui
│   └── [otros-componentes]      # Componentes específicos
├── lib/                         # Utilidades y configuración
│   ├── supabase.ts             # Cliente y funciones de Supabase
│   └── utils.ts                # Utilidades generales
└── docs/                       # Documentación
    └── excursion-creation-guide.md
\`\`\`

## 🎯 Funcionalidades Implementadas

### **Panel de Administración**
- ✅ Gestión completa de categorías
- ✅ Vista de tarjetas y lista
- ✅ Filtros y búsqueda avanzada
- ✅ Acciones masivas
- ✅ Reordenación drag & drop
- ✅ Exportación de datos

### **Sistema de Categorías**
- ✅ Soporte multiidioma (ES/EN/DE)
- ✅ Iconos y colores personalizables
- ✅ Estados activo/inactivo
- ✅ Ordenación personalizada
- ✅ Descripciones opcionales

### **Gestión de Excursiones**
- ✅ Formulario completo paso a paso
- ✅ Servicios incluidos/no incluidos
- ✅ Galería de imágenes
- ✅ Precios para adultos y niños
- ✅ FAQs y información detallada

### **Sistema de Reservas**
- ✅ Integración con WhatsApp
- ✅ Formulario de reserva completo
- ✅ Confirmación automática
- ✅ Gestión de disponibilidad

## 🔧 Configuración Avanzada

### **Supabase RLS (Row Level Security)**
Las políticas de seguridad están configuradas para:
- Lectura pública de categorías y excursiones
- Escritura solo para usuarios autenticados
- Inserción pública para reservas y contactos

### **Vercel Blob Storage**
Configurado para subida de imágenes con:
- Soporte para múltiples formatos
- Optimización automática
- URLs públicas seguras

## 📱 Responsive Design

El sistema está completamente optimizado para:
- **Móviles**: Layout adaptativo y controles táctiles
- **Tablets**: Diseño intermedio optimizado
- **Desktop**: Aprovechamiento completo del espacio
- **Ultra-wide**: Soporte para pantallas grandes

## 🌍 Multiidioma

Soporte completo para:
- **Español**: Idioma principal
- **Inglés**: Traducción completa
- **Alemán**: Mercado objetivo principal

## 🚀 Deployment

### **Vercel (Recomendado)**
\`\`\`bash
npm run build
vercel --prod
\`\`\`

### **Variables de Entorno en Producción**
Asegúrate de configurar todas las variables de entorno en tu plataforma de deployment.

## 📖 Documentación Adicional

- [Guía de Creación de Excursiones](docs/excursion-creation-guide.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@tenerifeaparadisetours.com
- WhatsApp: +34 617 303 929

---

**Desarrollado con ❤️ para Tenerife Paradise Tours**
