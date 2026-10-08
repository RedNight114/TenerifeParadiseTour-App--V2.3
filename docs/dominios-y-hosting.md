# Dominios por empresa y hosting compartido

## Arquitectura

QuickAgency usa **un proyecto Next.js compartido en Vercel** para todas las landings. No se crea un proyecto por cliente. Cada host llega al mismo despliegue y `organization_domains.host` determina qué empresa se sirve. Las políticas RLS siguen aplicando el aislamiento por empresa.

El estado de un dominio se compone de dos verificaciones independientes:

1. **Propiedad QuickAgency:** registro TXT `_quickagency-verification.<dominio>`.
2. **Hosting Vercel:** el dominio está añadido al proyecto central, Vercel lo verifica y confirma DNS/TLS sin configuración incorrecta.

Un dominio externo solo se resuelve a una empresa si ambas verificaciones están completas y la empresa está activa. `localhost` y `127.0.0.1` siguen permitidos en desarrollo. Hacer un dominio principal requiere que ya esté listo; cambiar el principal no elimina dominios anteriores ni modifica DNS.

## Configuración privada del proyecto

Añade estas variables **sin prefijo `NEXT_PUBLIC_`** en el proyecto de Vercel que ejecuta QuickAgency:

- `VERCEL_API_TOKEN`: token del servidor con permisos mínimos para leer el proyecto y administrar sus dominios.
- `VERCEL_PROJECT_ID`: ID o nombre exacto del proyecto central.
- `VERCEL_TEAM_ID`: ID del equipo Vercel propietario del proyecto.

En desarrollo local, guarda los valores únicamente en `.env.local`, que no debe subirse a Git. El panel comprueba que las tres variables existan antes de habilitar la conexión; no muestra el token.

`NEXT_PUBLIC_APP_URL` debe ser el origen estable del panel QuickAgency, no el dominio de una empresa cliente. Las rutas de login/invitación pertenecen a ese origen central.

## Alta y validación

1. En QuickAgency, registra el dominio con solo el hostname (por ejemplo, `www.ejemplo.com`, sin protocolo, ruta ni puerto).
2. Pulsa **Conectar a Vercel**. La aplicación lo añadirá al proyecto central sin forzar transferencias ni reasignar dominios que ya pertenezcan a otro proyecto.
3. Copia los registros TXT y A/CNAME que entregue Vercel en la configuración DNS del registrador. El panel también muestra el TXT propio de QuickAgency; son comprobaciones distintas. Conserva registros MX y TXT de correo existentes.
4. Verifica el TXT de QuickAgency y vuelve a comprobar DNS/HTTPS cuando los cambios hayan propagado. Vercel tiene que indicar que el dominio está verificado y correctamente configurado.
5. Solo entonces habilita **Hacer principal**. Comprueba el host por HTTPS y que muestra el logotipo/nombre correctos antes de compartirlo.

Los valores A/CNAME nunca se fijan en el código: se muestran los que devuelve el proyecto de Vercel configurado. La app no escribe DNS en el registrador del cliente; el propietario conserva el control de su zona DNS.

## Límites deliberados

- La aplicación no compra, transfiere ni cambia registradores/nameservers.
- No se usa `--force` ni se desplaza un dominio de otro proyecto.
- Vercel verifica la configuración y TLS; el cliente debe comprobar la web visible por HTTPS.
- Cada dominio alternativo se registra como una fila adicional de la misma empresa. Vercel y el registrador pueden aplicar límites o condiciones de cuenta; revísalos antes de una operación a gran escala.
- El principal influye en el host canónico de la app, pero el cambio no crea por sí solo una redirección entre apex y `www`.

## Prueba segura y estado externo

Probar primero con un subdominio de prueba de una zona DNS que controle la empresa, no con el apex de producción. Confirmar que una URL desconocida no publica ninguna empresa y que dos hosts de empresas distintas muestran sus marcas/contenidos respectivos.

En la comprobación de la cuenta Vercel del 8 de octubre de 2026, `tenerifeparadisetoursexcursions.com` y `www.tenerifeparadisetoursexcursions.com` siguen asociados a `v0-vercel-full-stack-project`, que usa otro repositorio, con los despliegues recientes consultados en error. El proyecto `quickagency-go` anotado anteriormente no aparece en el equipo conectado. Por eso este cambio no reasigna esos dominios ni afirma que el dominio público existente sirva este checkout. Antes de activarlo, hay que recuperar/crear el proyecto central correcto, desplegar la versión de QuickAgency y probar un subdominio nuevo.
