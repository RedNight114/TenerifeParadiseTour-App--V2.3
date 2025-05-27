# 📋 Guía de Administración - TenerifeParadise Tours

## 🎯 Introducción

Esta guía te ayudará a administrar completamente el sistema de TenerifeParadise Tours. Aquí encontrarás instrucciones paso a paso para gestionar excursiones, categorías y toda la información del sitio web.

---

## 🏠 Panel Principal de Administración

### Acceso al Panel
1. Navega a `/admin` en tu navegador
2. Verás el dashboard principal con estadísticas generales
3. Desde aquí puedes acceder a todas las funciones administrativas

### Estadísticas Principales
El dashboard muestra:
- **Total de excursiones** creadas
- **Excursiones destacadas** activas
- **Categorías disponibles** en el sistema
- **Gráficos de rendimiento** y métricas importantes

---

## 🎯 Gestión de Excursiones

### 📝 Crear Nueva Excursión

#### Paso 1: Acceso
- Desde el panel principal, haz clic en **"Nueva Excursión"**
- O navega a `/admin/excursion-form`

#### Paso 2: Información Básica (6 Pasos)

**🔤 Paso 1 - Nombres (Obligatorio)**
- **Español**: Nombre principal de la excursión
- **Inglés**: Traducción para turistas internacionales  
- **Alemán**: Traducción para el mercado alemán
- ✅ **Consejo**: Usa nombres descriptivos y atractivos

**📝 Paso 2 - Descripciones Cortas (Obligatorio)**
- Máximo 150 caracteres por idioma
- Aparecen en las tarjetas de vista previa
- Deben ser atractivas y resumir la experiencia

**📖 Paso 3 - Descripciones Completas (Obligatorio)**
- Información detallada de la excursión
- Incluye itinerario, qué esperar, puntos destacados
- Mínimo 200 caracteres recomendado

**⚙️ Paso 4 - Información Básica (Obligatorio)**
- **Precio**: En euros, por persona
- **Precio niños**: Opcional, tarifa reducida
- **Duración**: Ej: "4 horas", "Día completo"
- **Máximo personas**: Límite de participantes
- **Categoría**: Selecciona de las categorías existentes
- **Dificultad**: Fácil, Moderado, Difícil, Extremo
- **Horarios**: Puedes añadir múltiples horarios
- **Imagen principal**: URL de la imagen destacada
- **Destacada**: Marca si aparece en la página principal

**🔧 Paso 5 - Detalles Adicionales (Opcional)**
- **Punto de encuentro**: Dirección exacta
- **Servicios incluidos**: Selecciona de la lista o añade personalizados
- **Servicios NO incluidos**: Lo que el cliente debe traer/pagar
- **Meses disponibles**: Cuándo se puede realizar
- **Qué traer**: Lista de elementos necesarios
- **Requisitos**: Condiciones físicas, edad mínima
- **Política de cancelación**: Términos y condiciones
- **Notas especiales**: Información adicional importante
- **FAQs**: Preguntas frecuentes en los 3 idiomas

**✅ Paso 6 - Resumen y Creación**
- Revisa toda la información
- Confirma y crea la excursión

### 📋 Gestionar Excursiones Existentes

#### Acceso a la Gestión
- Desde el panel principal: **"Ver Excursiones"**
- O navega a `/admin/manage-excursions`

#### Funciones Disponibles

**🔍 Búsqueda y Filtros**
- **Búsqueda por texto**: Nombre o categoría
- **Filtro por categoría**: Todas las categorías disponibles
- **Filtro por estado**: Todas, Destacadas, No destacadas

**📊 Vista de Excursiones**
- **Tarjetas visuales** con imagen, precio y detalles
- **Información rápida**: Duración, máximo personas, fecha creación
- **Estado visual**: Destacada o normal

**⚡ Acciones Rápidas**
- **👁️ Ver**: Abre la página pública de la excursión
- **✏️ Editar**: Modifica todos los datos
- **🗑️ Eliminar**: Borra permanentemente (con confirmación)

#### Editar Excursión
1. Haz clic en **"Editar"** en cualquier excursión
2. Sigue los mismos 6 pasos que en la creación
3. Los datos actuales aparecen pre-cargados
4. Guarda los cambios al final

#### Eliminar Excursión
1. Haz clic en **"Eliminar"** 
2. Confirma la acción en el diálogo
3. ⚠️ **Atención**: Esta acción no se puede deshacer

---

## 🏷️ Gestión de Categorías

### 📍 Acceso a Categorías
- Desde el panel principal: **"Ver Categorías"**
- O navega a `/admin/categories`

### 📊 Vista General
- **Estadísticas**: Total, activas, inactivas, promedio excursiones
- **Filtros**: Por estado, búsqueda por nombre
- **Vistas**: Tarjetas o lista detallada

### ➕ Crear Nueva Categoría

#### Información Requerida
**🔤 Nombres (Obligatorio)**
- Español, Inglés, Alemán

**📝 Descripciones (Opcional)**
- Explicación de qué tipo de excursiones incluye

**🎨 Personalización Visual**
- **Icono**: Emoji o símbolo representativo
- **Color**: Color de identificación (hex)
- **Vista previa**: Se muestra en tiempo real

**⚙️ Configuración**
- **Estado**: Activa/Inactiva
- **Orden**: Posición en la lista

### 🔧 Gestionar Categorías Existentes

#### Acciones Disponibles
- **✏️ Editar**: Modificar todos los datos
- **👁️ Activar/Desactivar**: Cambiar visibilidad
- **📋 Duplicar**: Crear copia para modificar
- **🔄 Reordenar**: Cambiar posición (flechas arriba/abajo)
- **🗑️ Eliminar**: Borrar permanentemente

#### Acciones Masivas
1. Selecciona múltiples categorías (checkbox)
2. Usa el menú **"Acciones masivas"**:
   - Activar seleccionadas
   - Desactivar seleccionadas
   - Eliminar seleccionadas

#### Exportar Datos
- Botón **"Exportar Datos"** descarga JSON con todas las categorías
- Útil para respaldos o migración

---

## 🎛️ Funciones Avanzadas

### 🔄 Reordenamiento de Categorías
1. En vista de lista, usa las flechas ⬆️⬇️
2. El orden afecta cómo aparecen en el sitio web
3. Los cambios se guardan automáticamente

### 🎯 Excursiones Destacadas
- Aparecen en la página principal
- Máximo recomendado: 6-8 excursiones
- Rotan automáticamente en el carrusel

### 📱 Responsive Design
- Todas las páginas de admin funcionan en móviles
- Interfaz adaptativa para tablets
- Optimizado para escritorio

---

## 🔧 Configuración del Sistema

### 🌐 Idiomas Soportados
- **Español**: Idioma principal
- **Inglés**: Para turistas internacionales
- **Alemán**: Mercado objetivo importante

### 📊 Base de Datos
- **Supabase**: Sistema de base de datos
- **Respaldos automáticos**: Configurados
- **Sincronización**: Tiempo real

### 🖼️ Gestión de Imágenes
- **Subida**: Mediante URL o upload
- **Formatos**: JPG, PNG, WebP recomendados
- **Tamaño**: Máximo 2MB por imagen
- **Optimización**: Automática para web

---

## 📋 Mejores Prácticas

### ✅ Para Excursiones
1. **Nombres atractivos**: Usa palabras clave que los turistas buscan
2. **Descripciones completas**: Incluye todo lo que necesitan saber
3. **Precios claros**: Especifica qué incluye y qué no
4. **Imágenes de calidad**: Fotos profesionales y atractivas
5. **Información actualizada**: Revisa regularmente precios y disponibilidad

### ✅ Para Categorías
1. **Nombres descriptivos**: Que los usuarios entiendan fácilmente
2. **Iconos representativos**: Que identifiquen rápidamente el tipo
3. **Colores distintivos**: Para diferenciación visual
4. **Orden lógico**: Las más populares primero

### ✅ Para el Sistema
1. **Respaldos regulares**: Exporta datos periódicamente
2. **Revisión de contenido**: Verifica traducciones
3. **Pruebas de usuario**: Navega como cliente
4. **Actualizaciones**: Mantén el contenido fresco

---

## 🚨 Solución de Problemas

### ❌ Problemas Comunes

**No se guarda la excursión**
- ✅ Verifica que todos los campos obligatorios estén completos
- ✅ Revisa la conexión a internet
- ✅ Intenta refrescar la página

**Las imágenes no cargan**
- ✅ Verifica que la URL sea válida
- ✅ Asegúrate de que la imagen sea accesible públicamente
- ✅ Prueba con otra URL de imagen

**Error al eliminar**
- ✅ Verifica que no haya excursiones usando esa categoría
- ✅ Intenta refrescar y volver a intentar
- ✅ Contacta soporte si persiste

**Traducciones faltantes**
- ✅ Completa todos los idiomas requeridos
- ✅ Usa el botón "Copiar desde Español" como base
- ✅ Revisa caracteres especiales

### 📞 Contacto de Soporte
- **Email**: admin@tenerifeParadise.com
- **Teléfono**: +34 XXX XXX XXX
- **Horario**: Lunes a Viernes, 9:00 - 18:00

---

## 📈 Métricas y Análisis

### 📊 Estadísticas Disponibles
- **Total de excursiones**: Número total creado
- **Excursiones activas**: Disponibles para reserva
- **Categorías**: Número total y distribución
- **Excursiones por categoría**: Análisis de contenido

### 📈 Recomendaciones
- **Mínimo 3 excursiones por categoría**
- **Máximo 8 excursiones destacadas**
- **Actualizar contenido mensualmente**
- **Revisar precios trimestralmente**

---

## 🔐 Seguridad y Permisos

### 👤 Acceso Administrativo
- Solo usuarios autorizados pueden acceder
- Sesiones con tiempo límite por seguridad
- Registro de todas las acciones

### 🛡️ Protección de Datos
- Información encriptada en tránsito
- Respaldos seguros en la nube
- Cumplimiento con GDPR

---

## 📚 Recursos Adicionales

### 📖 Documentación Técnica
- [Guía de Desarrollo](./development-guide.md)
- [API Documentation](./api-docs.md)
- [Database Schema](./database-schema.md)

### 🎓 Tutoriales en Video
- [Crear tu primera excursión](./videos/create-excursion.mp4)
- [Gestionar categorías](./videos/manage-categories.mp4)
- [Configuración avanzada](./videos/advanced-config.mp4)

### 📋 Plantillas
- [Plantilla de excursión](./templates/excursion-template.md)
- [Checklist de calidad](./templates/quality-checklist.md)
- [Guía de traducciones](./templates/translation-guide.md)

---

## 📝 Changelog

### Versión 2.3 (Actual)
- ✅ Nuevo diseño del formulario de excursiones
- ✅ Navegación mejorada entre pasos
- ✅ Validación en tiempo real
- ✅ Mejor gestión de categorías
- ✅ Interfaz más intuitiva

### Versión 2.2
- ✅ Sistema de categorías avanzado
- ✅ Gestión de imágenes mejorada
- ✅ Filtros y búsqueda

### Versión 2.1
- ✅ Soporte multiidioma completo
- ✅ Panel de administración inicial
- ✅ CRUD básico de excursiones

---

*📅 Última actualización: Enero 2025*
*👨‍💻 Mantenido por: Equipo de Desarrollo TenerifeParadise*
