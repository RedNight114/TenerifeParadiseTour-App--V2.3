# Tenerife Paradise Tours

Aplicación web para vender excursiones propias. El esquema soporta varias empresas en una sola plataforma con marca, miembros y permisos separados; no es un marketplace público.

## Requisitos

- Node.js 20 o superior
- pnpm 10 o superior
- Proyecto Supabase (Auth + Postgres)
- Vercel Blob opcional para las imágenes que se cargan desde el panel

## Instalación local

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.local.example .env.local
```

Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con valores del proyecto adecuado. La clave pública puede usarse en navegador porque todas las tablas están protegidas con RLS. Nunca pongas `SUPABASE_SECRET_KEY` o una clave `service_role` en `NEXT_PUBLIC_*`.

En Supabase, crea una copia de seguridad y ejecuta en orden las migraciones de `supabase/migrations/`:

1. `20261001000100_initial_schema_and_security.sql` — esquema original, autenticación y políticas base.
2. `20261001000200_multi_tenant_core.sql` — organización inicial, pertenencias, dominios, auditoría, claves de empresa y RLS multiempresa.
3. `20261002000100_booking_workflow.sql` — estado inicial de las solicitudes de reserva.
4. `20261002000200_booking_status_transitions_and_audit.sql` — transiciones permitidas y auditoría de estado sin datos personales.

En una instalación nueva, antes de ejecutar la segunda migración, crea/invita el primer usuario en Supabase Auth y registra su UUID en `app_admins` con SQL. La migración lo convertirá en propietario de `tenerife-paradise-tours` y después eliminará la tabla de administradores anterior. En una base ya usada, la migración conserva los registros y asigna el contenido existente a esa organización; no reemplaza la copia de seguridad.

El entorno local reconoce `localhost` y `127.0.0.1` como dominios de la empresa inicial. Para producción, añade el dominio real, verificado y principal de la empresa a `organization_domains` antes de servir tráfico. Las filas de dominio se gestionan desde operación de plataforma; no se permite que un cliente reclame un dominio de otra empresa.

Para invitar usuarios nuevos se requieren `SUPABASE_SECRET_KEY` exclusivamente en el servidor, SMTP transaccional configurado en Supabase Auth y URLs de retorno permitidas para cada dominio. No configures la clave secreta en el navegador. Una cuenta que ya existe puede recibir una pertenencia pendiente desde el panel; se activa cuando inicia sesión en el dominio de esa empresa.

`BLOB_READ_WRITE_TOKEN` solo se necesita para cargar imágenes. Las rutas se guardan bajo el UUID de la empresa. Si no hay token, el resto de la aplicación sigue disponible pero no se pueden cargar archivos.

Para habilitar pagos locales de prueba, configura `STRIPE_SECRET_KEY` con una clave `sk_test_`, `STRIPE_WEBHOOK_SECRET` con el secreto del webhook de desarrollo y `NEXT_PUBLIC_APP_URL=http://localhost:3000`. El propietario conecta la cuenta Express de prueba desde `/admin/payments`. La integración rechaza claves live intencionadamente. El webhook debe ser de Connect y escuchar `account.updated`, `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` y `checkout.session.expired`; apunta a `/api/stripe/webhook`. No compartas claves en el chat ni las subas al repositorio.

Arranca el proyecto:

```powershell
pnpm dev
```

Abre `http://localhost:3000`. El panel se encuentra en `/login`. No existe registro público de empresas: la creación y asociación de nuevos dominios requiere el procedimiento de plataforma.

## Roles

- `owner`: perfil de empresa, dominios de operación, equipo y toda la administración. Siempre debe quedar al menos un propietario activo.
- `admin`: perfil de empresa y gestión del equipo, excepto conceder/retirar propiedad.
- `catalog_manager`: excursiones, categorías, servicios y cargas de catálogo.
- `booking_manager`: reservas y solicitudes de contacto.
- `guide`: sin acceso al listado de reservas ni a datos personales hasta implementar asignación por salida y minimización de datos.

Los permisos se verifican en Supabase RLS y también en las operaciones del servidor. El rol enviado por la interfaz no concede acceso.

## Comprobaciones de código

```powershell
pnpm typecheck
pnpm lint
pnpm build
pnpm audit --prod
```

Con Docker activo, valida el esquema multiempresa en Supabase local:

```powershell
pnpm dlx supabase start
pnpm dlx supabase db reset --local
pnpm dlx supabase test db --local
pnpm dlx supabase db advisors --local --type all
```

La prueba de backfill usa exclusivamente la fixture sintética descrita en [decisiones de arquitectura](docs/decisiones-arquitectura-fase-1.md#verificación-local-repetible). No restaures datos reales en una instancia compartida ni ejecutes `db reset` en un proyecto remoto.

`legacy_migration_backfill_test.sql` solo aplica al ensayo de migración antigua y requiere restaurar la base local a la migración inicial junto con su fixture; no forma parte de la regresión diaria.

Para cargar las cuatro excursiones sintéticas (minibús, experiencia privada, 4x4 y kayak) en la empresa local:

```powershell
pnpm dlx supabase db query --local --file supabase/fixtures/inventory_demo_local.sql
```

El fixture solo es para desarrollo local; no lo ejecutes con `--linked` ni contra datos reales. La reserva pública nueva usa la RPC transaccional de inventario; los formularios genéricos antiguos redirigen al catálogo para no crear solicitudes que eviten el control de capacidad.

## Arquitectura y decisiones

- [Decisiones de arquitectura de fase 1](docs/decisiones-arquitectura-fase-1.md)
- [Diseño propuesto de disponibilidad y pagos del MVP](docs/disponibilidad-y-pagos-mvp.md)
- [Plan de crecimiento y migración de servicios](docs/decisiones-arquitectura-fase-1.md#plan-de-crecimiento-y-migración)
- [Guía de creación de excursiones](docs/excursion-creation-guide.md)
- [Operación del panel, soporte y dominios](docs/operacion-panel-y-dominios.md)
- [Alta, verificación y conexión de dominios en Vercel](docs/dominios-y-hosting.md)
- [Roadmap del producto](../../outputs/roadmap-saas-venta-directa-excursiones.md)

La migración de base de datos y la comprobación de aislamiento entre dos proyectos Supabase reales son operaciones distintas de compilar la aplicación. Antes de producción, aplica la migración en un entorno de prueba con backup, prueba el acceso permitido/denegado con dos empresas y configura dominios y correo transaccional.
