# Operación del panel, contenido y dominios

## Marca y contenido

- **Marca y empresa** guarda la identidad (nombre, contacto, logotipo y colores), domicilio y preferencias.
- **Contenido del sitio** publica, por empresa e idioma, la portada, navegación y pie de página, Nosotros, contacto, catálogo de excursiones, preguntas frecuentes y documentos legales. Guardar publica inmediatamente y añade una versión al historial.
- La portada permite editar la confianza y los pasos de reserva; contacto permite adaptar sus mensajes y beneficios; catálogo permite adaptar su presentación. Nombres, descripciones, precios, imágenes y condiciones de cada excursión siguen en el módulo de excursiones.
- La interfaz funcional (campos, validaciones, filtros, cuenta y pasos de reserva) y la atribución de QuickAgency siguen siendo parte del producto y no son texto de marca editable.
- Los registros de contenido se aíslan por `organization_id`; si una empresa no ha publicado una página/idioma, se muestra el contenido inicial común sin leer ni heredar la personalización de otra empresa.
- Si el editor de contenido no puede leer todas sus consultas necesarias, ahora muestra un error y no permite publicar sobre valores iniciales incompletos.
- La marca pública usa el logotipo de la empresa, el color primario en navegación y acciones, y el secundario como color de acento. En una primera carga se puede subir un logotipo si Vercel Blob está configurado; la URL HTTPS también sigue admitida.

## Inventario

Orden recomendado: modelar la capacidad (pool compartido o activo asignable), enlazarla con lo que vende cada tarifa y después programar fechas con su cierre de ventas y unidades. Revisa reservas antes de bajar la capacidad. Las reservas con Checkout pueden retenerla durante 30 minutos. La interfaz advierte que la hora se interpreta en Atlantic/Canary.

## Soporte

Las empresas pueden clasificar solicitudes en reservas/cobros, inventario, web, pagos, cuenta/equipo u otro. QuickAgency puede filtrar por estado/prioridad y elevar prioridad alta; estos cambios se registran en auditoría. La conversación y notificación quedan guardadas en base de datos/outbox. **No hay todavía un worker SMTP que garantice avisos por correo**, por lo que el equipo debe revisar el inbox del panel.

## Alta y conexión de un dominio

La tabla `organization_domains` permite resolver la empresa según el `Host`, pero la validación de propiedad de QuickAgency y la conexión de hosting son verificaciones independientes. Un dominio público solo resuelve a una landing cuando la empresa está activa y se han completado el TXT de QuickAgency, la asociación al proyecto Vercel, DNS y HTTPS. Los dominios locales siguen habilitados para desarrollo.

**Flujo de alta central:** el panel de administración vive en el origen estable de QuickAgency (`NEXT_PUBLIC_APP_URL`) y la landing pública sigue resolviéndose por el dominio propio de la empresa. El propietario puede aceptar su invitación y configurar una empresa pendiente desde `/workspace` aunque aún no exista DNS. El selector no concede acceso: la lista de empresas, el estado de la membresía y el contexto de tenant se validan en servidor y en RLS. El cookie `qa_active_organization` selecciona contexto, pero no sustituye autorización.

El panel de plataforma ahora separa y muestra los estados de propiedad (TXT QuickAgency), conexión Vercel, DNS y HTTPS. El flujo detallado, las variables privadas requeridas, los estados, las comprobaciones de no-interferencia y el procedimiento operativo están en [Dominios y hosting](dominios-y-hosting.md). La conexión nunca fuerza la reasignación de un host ya vinculado a otro proyecto.

El acceso de administración y la publicación de la landing son estados independientes: el equipo puede completar marca, contenido, catálogo, salidas y legales antes de conectar el dominio. La habilitación de ventas reales sigue requiriendo revisar el checklist de preparación y verificar por separado routing/HTTPS; el estado `active` actual no debe interpretarse como confirmación automática de esos chequeos externos.

### Estado encontrado en Vercel (lectura, 5 de octubre de 2026)

En la cuenta conectada aparece `tenerifeparadisetoursexcursions.com` redirigido a `www.tenerifeparadisetoursexcursions.com`, ambos asociados a `v0-vercel-full-stack-project`. El proyecto figura sin producción activa y sus despliegues recientes consultados están en `ERROR`; hay despliegues históricos `READY` de 2025. El proyecto `v0-tenerife-paradise-tour-app` devuelto por la búsqueda de proyectos no se pudo abrir (Vercel devolvió 404). No se reasignó ningún dominio ni se lanzó un despliegue.

Antes de anunciar la nueva aplicación en ese dominio, identifica el proyecto Vercel que se va a usar, comprueba que tenga una producción `READY` de este repositorio y confirma DNS/TLS. Vercel muestra los valores DNS exactos al añadir e inspeccionar un dominio: [configurar un dominio personalizado](https://vercel.com/docs/domains/set-up-custom-domain).

### Comprobación de seguimiento (7 de octubre de 2026)

- El DNS público responde: el apex `tenerifeparadisetoursexcursions.com` resuelve a Vercel y `www` apunta a `cname.vercel-dns.com`.
- `https://www.tenerifeparadisetoursexcursions.com/` devuelve HTTP 200 y presenta TLS válido en la comprobación desde este entorno. La respuesta es servida desde caché de Vercel; esto confirma que el dominio todavía entrega contenido, **no** que esté desplegada la versión actual de este repositorio.
- La cuenta de Vercel sigue mostrando ambos hosts en `v0-vercel-full-stack-project`, con el apex redirigido a `www`. Su último despliegue consultado está en `ERROR`; los despliegues recientes también fallan y la protección SSO está activa. Los metadatos de esos despliegues identifican el repositorio `RedNight114/TenerifeParadiseTourApp`, mientras que este checkout tiene como remoto `RedNight114/TenerifeParadiseTour-App--V2.3`.
- El proyecto `v0-tenerife-paradise-tour-app` aparece en el listado, pero sus operaciones de detalle y dominios devuelven 404. Este checkout tampoco tiene enlace local `.vercel/project.json`.

**Conclusión:** DNS y HTTPS del dominio existente están vivos, pero no se ha demostrado que sirvan el código actual ni se ha identificado un proyecto Vercel accesible, enlazado a este repositorio y con producción `READY`. No cambiar los dominios actuales ni desplegar sobre ellos hasta resolver esa identidad; hacerlo ahora podría reemplazar o interrumpir la web que está sirviendo contenido.

### Comprobación actual del proyecto QuickAgency Go (8 de octubre de 2026)

- En la inspección actual, el equipo conectado solo devuelve `v0-vercel-full-stack-project`; no devuelve `quickagency-go`. El `quickagency-go` documentado el 7 de octubre no es accesible mediante la cuenta/equipo conectados en esta sesión.
- Los dominios existentes siguen asociados al proyecto antiguo. No se modificaron DNS, dominios, proyectos ni despliegues durante esta revisión.

**Pendiente externo para cerrar la puesta en producción:** recuperar el acceso al proyecto correcto o crear/seleccionar el proyecto compartido, configurar las variables Vercel privadas del procedimiento y verificar primero un subdominio de prueba. Solo después de una producción `READY` y pruebas de tenant se planificará la migración del dominio público actual, con aprobación explícita.
