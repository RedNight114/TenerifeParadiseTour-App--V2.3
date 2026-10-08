# Decisiones de arquitectura — fase 1

Revisión: 1 de octubre de 2026. Alcance: base SaaS multiempresa y servicios ya presentes en el repositorio.

Estado: aplicación, esquema y migraciones validados en Supabase local el 1 de octubre de 2026. Se probaron 17 casos RLS con dos empresas y 8 casos de backfill desde el esquema anterior con datos sintéticos; `supabase db advisors` no encontró problemas; TypeScript, ESLint y build pasan. Cierre sobre el proyecto real aún pendiente: no hay sesión autenticada de Supabase CLI en este entorno (`supabase whoami` devuelve `AccessTokenRequiredError`) y no se ha restaurado una copia anonimizada de la base existente. Las pruebas locales no sustituyen esa copia ni autorizan a aplicar migraciones remotas.

## Decisión

No migrar ahora de Next.js, Supabase ni Vercel Blob por la edad del repositorio. La aplicación ya depende de Supabase Auth y Postgres en el navegador, y la fase 0 añadió Supabase SSR/RLS. Cambiar base de datos o identidad en paralelo al aislamiento de empresas aumenta el riesgo de pérdida de sesiones/datos y duplica el trabajo sin una necesidad demostrada. La migración solo se reconsidera con métricas, incidentes, límites funcionales o un coste comparativo verificable.

## Servicios existentes y destino recomendado

| Servicio/capa | Uso actual | Decisión fase 1 | Motivo / condición para reconsiderar |
| --- | --- | --- | --- |
| Next.js + TypeScript | Web pública, panel y API de carga | Mantener | El producto es una aplicación web con administración; no hay evidencia de que el framework sea el cuello de botella. |
| Supabase Postgres | Excursiones, categorías, reservas y contactos | Mantener y endurecer con `organization_id`, claves foráneas compuestas, RLS y migraciones | Reduce el conjunto de cambios: Postgres ya es el modelo actual. Sus políticas se aplican también a las consultas hechas directamente desde el navegador. Revisar si hacen falta colas/workers, réplicas, residencia distinta o garantía/SLA que el plan actual no cubra. |
| Supabase Auth | Correo/contraseña de administradores | Mantener; pertenencia y permisos viven en Postgres, no en metadatos editables del cliente | La integración con RLS evita introducir un segundo sistema de identidad. Las invitaciones productivas requieren clave secreta solo de servidor y SMTP propio; no se debe abrir el alta pública ni entregar privilegios desde el cliente. |
| Vercel / hosting | README indica Vercel; el repositorio no acredita dónde está desplegado | No migrar ni declarar configurado | Confirmar cuenta, DNS, dominios, límites y gasto antes de cambiar. Vercel documenta el patrón de una app Next.js para varios dominios/subdominios; se adapta al objetivo si es el proveedor actual. |
| Vercel Blob | Imágenes públicas, cargadas desde una ruta de servidor | Mantener provisionalmente; prefijo por UUID de empresa y autorización en servidor | Adecuado a imágenes públicas y conectado al alojamiento si ya existe cuenta. No guardar documentos privados allí sin flujo de acceso firmado. En fase 2 comparar con Supabase Storage: sus objetos pueden aplicar RLS por carpeta/empresa, a cambio de mover medios y asumir sus costes de transferencia. Decidir con GB almacenados, GB servidos, operaciones y ubicación. |
| Email transaccional | No hay SMTP propio documentado | Bloqueo de activación de invitaciones | El SMTP por defecto de Supabase sirve para pruebas: limita envíos y no entrega a destinatarios arbitrarios del producto. Configurar proveedor SMTP transaccional y URLs permitidas en Auth antes de invitar a clientes reales. No elegir proveedor sin dominio, volumen y presupuesto. |
| Pagos | No existe integración | Fuera de fase 1 | Elegir en fase 3 una opción donde cada operador cobre en su propia cuenta y validar países, KYC, comisiones, reembolsos y obligaciones fiscales antes de integrar. |
| Analítica / IA | No existe integración | No añadir ahora | Primero asegurar separación de reservas/clientes y eventos fiables. En fase posterior escoger destino y proveedor según volumen, residencia, consentimiento y coste. |

## Modelo de tenant

- Una fila `organizations` representa una empresa cliente; una persona usuaria se identifica en Supabase Auth y recibe permisos por `organization_memberships`.
- Una persona puede pertenecer a más de una empresa; el host/domino verificado selecciona el tenant de la petición. No se acepta `organization_id` enviado por el navegador como autorización.
- `owner`, `admin`, `catalog_manager`, `booking_manager` y `guide` son roles internos almacenados en Postgres. La base de datos vuelve a comprobar el rol en cada operación.
- Las tablas comerciales llevan `organization_id`. Las reservas además tienen clave foránea compuesta empresa+excursión, de modo que no pueden apuntar a la excursión de otra empresa.
- El catálogo público es público por definición; la API solo permite ver contenido publicado del dominio resuelto. Contactos, reservas, miembros, perfil legal y auditoría no son públicos.
- Dominios propios/subdominios solo se marcan verificados desde el proceso de plataforma/DNS; los administradores de empresas no pueden apropiarse de dominios desde la aplicación.
- Los cambios de perfil de empresa, dominios, membresías, categorías y excursiones producen eventos de auditoría resumidos. En reservas solo se auditan los estados anterior/nuevo y el actor; no se copian nombre, email, teléfono, comentarios ni datos de contacto. Los contactos siguen fuera del registro.

## Límites conocidos que deben cerrarse antes de producción

1. Aplicar primero ambas migraciones en una copia con datos restaurados y comprobar el dominio de producción en `organization_domains`; la fase 1 es *fail-closed* y un dominio no registrado no publica catálogo.
2. **Completado en local:** pruebas pgTAP para visitante, propietario, guía y operador de otra empresa, con dos organizaciones, catálogo, reservas y escrituras permitidas/denegadas. Antes de cerrar contra el proyecto real, repetir en una restauración anonimizada y comprobar tablas/datos existentes; no ejecutar sobre producción.
3. Configurar SMTP transaccional, URL de retorno permitidas, `SUPABASE_SECRET_KEY` exclusivamente en servidor y `BLOB_READ_WRITE_TOKEN` si se usan cargas.
4. Provisionar nuevas organizaciones y dominios por un procedimiento operativo controlado. Esta base no expone un alta pública/autoservicio de clientes.
5. Acordar política de copias y restauración. Supabase documenta backups diarios en planes de pago; las copias de base de datos no contienen los objetos de Storage/Blob.

### Verificación local repetible

Las pruebas permanentes están en `supabase/tests/`. El test RLS puede ejecutarse en un entorno local limpio:

```powershell
pnpm dlx supabase start
pnpm dlx supabase db reset --local
pnpm dlx supabase test db --local supabase/tests/tenant_isolation_test.sql
pnpm dlx supabase db advisors --local --type all
```

El test de backfill requiere recrear primero solo el esquema antiguo y sembrar la fixture sintética; no se debe ejecutar contra una base con datos reales:

```powershell
pnpm dlx supabase db reset --local --version 20261001000100
Get-Content -Raw supabase/fixtures/legacy_migration_seed.sql | docker exec -i supabase_db_tenerife-paradise-tour-app-v23 psql -v ON_ERROR_STOP=1 -U postgres -d postgres
pnpm dlx supabase migration up --local
pnpm dlx supabase test db --local supabase/fixtures/legacy_migration_backfill_test.sql
pnpm dlx supabase db reset --local
```

Resultado verificado en esta revisión: **27/27** casos RLS/roles/ciclo de reserva y **8/8** casos de backfill; organización, categoría, excursión, servicio, reserva y contacto antiguos preservados; relación reserva-excursión coherente; administrador antiguo promovido a propietario; tabla `app_admins` retirada; Advisors sin incidencias en la revisión anterior. La última migración de reserva añade transiciones cerradas y auditoría sin PII; verificar siempre el estado local con `supabase migration list --local`. Las fixtures pgTAP son transaccionales y se revierten al terminar.

Para validar la restauración real, primero hay que autenticar la CLI en la sesión local con `pnpm dlx supabase login` (no compartir el token en el chat), identificar el proyecto correcto y obtener una copia restaurada/anonimizada en staging. Hasta completar ese ensayo, las pruebas solo acreditan el modelo local y la migración frente a la fixture conocida.

## Plan de crecimiento y migración

### Principios

- El plan gratuito es una opción para validar el MVP, no una garantía de operación productiva. Revisar límites y condiciones vigentes antes de activar clientes; no poner datos reales delicados hasta acordar copias, restauración y respuesta a incidentes.
- Escalar no significa migrar por defecto. Primero medir; si el límite es del plan, subir de plan en el mismo proveedor suele ser el cambio de menor riesgo. Migrar de proveedor solo si una necesidad medible (coste total, disponibilidad/recuperación, capacidad, residencia de datos, soporte o requisito contractual) no se resuelve razonablemente allí.
- La aplicación, Postgres, Auth, archivos, correo y pagos son componentes separados. Se pueden cambiar uno a uno. No hacer una reescritura total para resolver un cuello de botella localizado.
- Mantener migraciones de esquema versionadas en el repositorio, configuración reproducible, secretos fuera del código, identificadores internos estables y copias exportables. La portabilidad se demuestra con ensayos, no se da por supuesta.

### Señales para revisar el plan

Revisar mensualmente uso, gasto y límites disponibles en los paneles de cada proveedor. Abrir una evaluación de escalado cuando ocurra cualquiera de estos casos: límite o pausa que afecte clientes; consumo previsto que se acerque al límite antes de la siguiente revisión; copias/RPO/RTO insuficientes; degradación sostenida de latencia o errores; necesidad de una región, soporte, contrato o función no disponible; o coste total recurrente que supere una alternativa comparable. Definir antes del lanzamiento los umbrales numéricos del MVP (latencia, errores, pérdida máxima de datos, tiempo máximo de recuperación y presupuesto); no inventar esos valores sin datos de uso y acuerdos comerciales.

### Ruta gradual

1. **MVP controlado en plan gratuito.** Usar datos ficticios durante la verificación; limitar el acceso al equipo. Medir requests, almacenamiento, transferencia, tamaño de base, conexiones, Auth/emails, logs, gasto y disponibilidad. Confirmar las reglas actuales del plan y sus condiciones de inactividad/pausa.
2. **Antes de datos reales o pagos.** Completar aislamiento RLS entre empresas, configurar dominio y SMTP, documentar quién accede a producción, definir retención/borrado, y ensayar copia y restauración. Activar pagos solo con pasarela tokenizada/hosted checkout; nuestra base guarda identificadores del proveedor, importes, moneda y estados, nunca PAN completo ni CVV. Confirmar obligaciones legales y requisitos de la pasarela.
3. **Escalar sin migrar.** Si el uso o la operación lo exige, comparar primero un plan superior del mismo proveedor: disponibilidad, backups/PITR, soporte, límites, ubicación, transferencia y coste total. Aplicar el cambio en ventana controlada y verificarlo. Un cambio de plan no sustituye una prueba de recuperación.
4. **Migrar un componente solo si hay motivo documentado.** Crear una ADR nueva con problema medido, alternativas (incluido permanecer), coste a 12 meses, riesgos, requisitos, responsable, criterio de éxito, ventana y plan de vuelta. Probar con una copia anonimizada y un entorno de ensayo antes de tocar producción.
5. **Ensayar y autorizar el corte.** Restaurar/importar; comparar recuentos y relaciones; ejecutar migraciones; probar RLS con al menos dos empresas y los roles relevantes; verificar reservas y webhooks idempotentes, login, correos, cargas, dominios, tareas programadas, observabilidad, carga y recuperación. Acordar duración máxima de corte y pérdida de datos aceptable. No autorizar el corte si una comprobación crítica falla.
6. **Corte y vigilancia.** Copia consistente inmediatamente antes del cambio; detener escrituras o establecer un mecanismo probado de replicación/captura de cambios; cambiar secretos/conexiones y DNS si aplica; comprobar operaciones críticas con tráfico controlado; monitorizar errores, latencia, colas, pagos y divergencias. Mantener el origen intacto y de solo lectura durante la ventana de reversión. No aceptar escrituras simultáneas en origen y destino sin un diseño explícito de consistencia.
7. **Reversión y cierre.** Volver a las conexiones/DNS anteriores si falla un criterio acordado. Si el destino ya aceptó escrituras, primero reconciliar esos datos con un procedimiento ensayado: apuntar atrás sin reconciliación puede perder reservas o pagos. Retirar el origen solo después del periodo acordado, reconciliación final, copia verificada y autorización; revocar claves antiguas y documentar el resultado.

### Qué migra y qué no se debe asumir

| Componente | Tratamiento al crecer | Verificación obligatoria |
| --- | --- | --- |
| Next.js / hosting | Puede moverse sin mover Postgres. Mantener variables por entorno, dominios, callbacks de Auth, límites de funciones y Blob/API compatibles. | Despliegue paralelo, smoke checks de web y rutas de servidor, SSL, dominio, redirecciones, variables y vuelta al despliegue anterior. |
| Supabase Postgres | Primero optimizar/ajustar plan. Si se cambia de proveedor, comprobar compatibilidad con extensiones, versión, funciones, triggers, grants, RLS y migraciones; importar una copia y ensayar el corte. | Comparar esquema, secuencias, recuentos, relaciones, restricciones, políticas y flujos por tenant; restaurar una copia en tiempo medido. Una exportación de datos sola no es una migración probada. |
| Supabase Auth | Es una migración separada. No asumir que contraseñas, MFA, sesiones activas, identidades sociales, enlaces de invitación o tokens se trasladan de forma transparente. | Probar altas/invitaciones, login, recuperación de contraseña, callback por cada dominio, revocación y transición de usuarios. Preparar reautenticación/recuperación si no se pueden conservar credenciales o sesiones. |
| Blob / Storage | Inventariar objetos, rutas por organización, metadatos, tamaños y URLs referenciadas; copiar objetos por separado de la base. Mantener alias/redirects si cambian URLs públicas. | Verificar número/tamaño/hash de objetos, permisos privados, imágenes públicas y que ninguna ruta cruce empresas. La copia de Postgres no contiene los objetos. |
| Correo | Mantener el proveedor independiente de la base; mover credenciales, SPF/DKIM/DMARC, dominio remitente, plantillas, callbacks y reputación con cuidado. | Entrega a destinatarios de prueba, rebotes, enlaces de Auth y DNS antes del cambio. |
| Pagos | Mantener el proveedor de pagos independiente. Migrar referencias/tokenización solo mediante mecanismos oficiales del procesador y autorización; nunca exportar números completos de tarjeta ni CVV a la base o a logs. | Conciliar pagos, reembolsos, suscripciones/mandatos si existieran, cuentas conectadas, webhooks, firmas, claves e idempotencia. Coordinar el cambio con el procesador y no duplicar cobros. |
| Analítica / IA | Mantener exportaciones/eventos separados y limitar datos personales; definir retención, consentimiento y borrado. No usar datos reales para pruebas sin anonimización y autorización. | Comparar eventos, identidad/consentimiento, residencia y borrado extremo a extremo. |

### Condiciones para considerar cerrado un cambio

Una migración no se considera terminada hasta que: los checks de negocio y seguridad acordados pasan; las empresas no ven ni alteran datos ajenos; pagos y reservas quedan conciliados; copias del destino se restauran dentro del objetivo acordado; observabilidad y alertas están activas; existe responsable operativo; la reversión o reconciliación posterior al corte está probada; y los secretos y accesos del origen se revocan solo al terminar la ventana de vuelta.

## Fuentes de evaluación

- [RLS y seguridad de Postgres en Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Backups y recuperación de Supabase](https://supabase.com/docs/guides/platform/backups)
- [SMTP personalizado para Supabase Auth](https://supabase.com/docs/guides/auth/auth-smtp)
- [Control de acceso de Supabase Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Patrón multi-tenant de Vercel](https://vercel.com/kb/guide/nextjs-multi-tenant-application)
- [Precios actuales de Vercel Blob](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Precios actuales de Supabase](https://supabase.com/pricing)
- [Precios actuales de Cloudflare R2](https://developers.cloudflare.com/r2/pricing/)
- [Migración de una aplicación multi-tenant de Next.js en Vercel](https://vercel.com/kb/guide/nextjs-multi-tenant-application)
