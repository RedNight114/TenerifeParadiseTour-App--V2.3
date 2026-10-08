# QuickAgency MVP: operación y límites

## Alcance implementado

- Sitio público por empresa con contenido fijo editable: portada, Nosotros, FAQ, privacidad y términos, en español e inglés. Guardar publica al momento; el historial conserva versiones y permite restaurar creando una versión nueva.
- Hero con buscador u oferta desde una excursión publicada. Selección ordenable de hasta ocho destacadas; si no hay ninguna, la portada usa las excursiones publicadas más recientes.
- Tarjetas adaptables a cuatro columnas en pantallas muy anchas, tres en escritorio, dos en tableta y una en móvil.
- Alta guiada de excursiones con clasificación orientativa por persona, grupo, vehículo o combinación. Las nuevas excursiones quedan como borrador. Para publicar, primero deben tener una opción activa, recursos asignados y una salida futura desde Inventario.
- Términos de reserva versionados. La reserva no se crea si la empresa no ha publicado los términos o el cliente no confirma su aceptación. La reserva conserva versión, idioma y fecha, visibles en administración.
- Consola QuickAgency separada, allowlist de administradores, creación de empresas y dominios, comprobación TXT, asignación inicial de propietario, suspensión reversible y cuotas manuales de catálogo/miembros.
- Checklist de preparación en la consola QuickAgency basado en señales de la base de datos: dominio verificado, propietario activo, plan asignado, términos y privacidad publicados ES/EN, excursión publicada, opción comercial activa y próxima salida aún abierta a ventas. “Preparación base completa” no certifica por sí sola que ya se puedan recibir ventas.
- Soporte de empresa y consola de respuesta QuickAgency, registro de notificaciones salientes y acceso de soporte temporal (30 min, motivo obligatorio y auditoría).

## Preparar el entorno local

1. Aplicar migraciones locales de manera incremental: `pnpm dlx supabase@latest migration up --local`.
2. Crear el usuario administrador normal desde el login de la app.
3. En Supabase Studio local, asignar ese usuario a la allowlist usando su UUID de `auth.users`:

   ```sql
   insert into public.platform_admins (user_id)
   select id from auth.users where lower(email) = lower('tu-correo@ejemplo.com')
   on conflict (user_id) do nothing;
   ```

4. Configurar `NEXT_PUBLIC_APP_URL` con el origen estable del panel QuickAgency y añadir ese origen a las URL de retorno permitidas en Supabase Auth. En desarrollo se usa `http://localhost:3000` por defecto.
5. Iniciar Next.js con `pnpm dev`. La consola QuickAgency vive en `/platform`; el panel central de empresas usa `/workspace` y `/admin`.
6. Crear la empresa sin dominio si todavía no se conoce; asignar/invitar al propietario desde QuickAgency. El propietario acepta en el dominio central y elige su espacio de empresa; DNS no es requisito para configurar el catálogo.
7. Añadir y verificar el dominio cuando esté disponible. TXT demuestra propiedad, pero la configuración DNS/routing/TLS del hosting sigue siendo un paso independiente.
8. Configurar SMTP de Supabase Auth para enviar invitaciones. Publicar primero las páginas legales de la empresa; las reservas online exigen términos publicados.

## Límites y decisiones pendientes

- Stripe Checkout/Connect y la facturación del SaaS no se alteraron. La facturación de suscripciones sigue fuera del MVP.
- El outbox de soporte guarda eventos, pero no envía correos todavía. Para activarlos hay que elegir/configurar proveedor SMTP o email transaccional, secrets por entorno, plantilla y política de reintentos.
- Acceso QuickAgency a datos de una empresa es temporal y auditado. No debe concederse para consultas ordinarias; hace falta un ticket y motivo concreto.
- La selección de plan y sus límites son manuales: todavía no hay renovación, cobro ni suspensión automática por impago.
- Los dominios verificados deben apuntarse también al hosting elegido (DNS del TXT solo prueba propiedad; no publica ni enruta la web).
- El selector `/workspace` solo muestra memberships asociadas al usuario autenticado; selección e invitaciones se vuelven a validar en la base de datos/RLS. El cookie `qa_active_organization` no concede permisos por sí mismo.
- El checklist de preparación no valida DNS/SSL desde el exterior, capacidad restante real de las salidas, una reserva de prueba ni la conexión de cobros de cada empresa. Esas verificaciones siguen pendientes antes de activar ventas reales.
- El editor permite cargar imágenes usando el endpoint y almacenamiento configurados por el proyecto. Comprobar cuotas/retención del proveedor antes de producción.

## Verificación aplicada

Tras las migraciones locales, `pnpm typecheck` debe compilar, `pnpm lint` debe terminar sin errores y `pnpm dlx supabase@latest test db` ejecuta pruebas de aislamiento, inventario, pagos existentes, contenido, permisos y aceptación legal. No ejecutar `supabase db reset` en el entorno con datos de desarrollo; para staging/producción revisar y aplicar migraciones de forma controlada.
