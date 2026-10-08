# Diseño propuesto: disponibilidad y pagos del MVP

Estado: base de inventario e integración de Stripe Checkout en modo de pruebas implementadas en local. No hay cobros reales activados. Las políticas comerciales de cancelación y reembolso siguen pendientes.

## 1. Objetivo del MVP

Permitir que una empresa publique salidas concretas de sus excursiones, venda plazas sin sobreventa y reciba el pago en su propia cuenta de cobro. Una solicitud web no será una venta confirmada: la confirmación dependerá de disponibilidad y del resultado verificado del pago (o de una acción manual autorizada, si el negocio lo permite).

## 2. Disponibilidad

### Modelo de inventario

- **La disponibilidad no se reduce a una columna `capacity`:** cada salida puede consumir uno o varios inventarios configurables. Un inventario es un conjunto finito de unidades disponibles (plazas-persona, vehículos, barcos, guías, equipos u otro recurso definido por la empresa). Una reserva puede consumir varias clases de inventario a la vez.
- **Salida:** registro con empresa, excursión, inicio/fin y zona horaria, hora límite, estado operativo (`scheduled`, `closed`, `cancelled`) e inventarios asignados. La excursión describe el producto; la salida representa una fecha y hora vendible. Puede tener pools abstractos (p. ej. 20 plazas) y/o recursos físicos identificables (p. ej. furgonetas con distinta capacidad).
- **Opción vendible / variante:** define cómo compra el cliente y qué inventario consume. Ejemplos: plaza individual; grupo privado de 1–8 personas que consume un turno de guía y hasta 8 plazas; alquiler de vehículo que consume un vehículo concreto y sus asientos; pack que consume vehículo + guía + equipo. La opción indica sus mínimos/máximos de unidades por reserva y coeficientes de consumo por tipo de inventario.
- **Reserva:** referencia a una salida y contiene líneas tipadas con cantidad, precio y moneda congelados. El sistema deriva del lado servidor las unidades que debe asignar; no confía en las cantidades de inventario ni el importe enviados por el navegador.
- **Precio:** cada línea guarda una instantánea del precio y moneda acordados al comprar. Los importes se expresan en unidades menores enteras (céntimos para EUR) para evitar errores de redondeo. Cambiar el catálogo no modifica compras ya realizadas.
- **Zona horaria:** cada empresa configura una zona IANA. Propuesta inicial para Tenerife: `Atlantic/Canary`; se almacena el instante inequívoco y se muestra en la zona de la empresa.

### Protección contra sobreventa

La disponibilidad mostrada en el calendario es orientativa; la última comprobación ocurre en el servidor. Al iniciar checkout, una única operación transaccional valida y retiene **todos** los inventarios requeridos por las líneas de la reserva. Por ejemplo, una venta que necesita un vehículo y seis asientos se acepta únicamente si quedan ambos. No puede quedar medio asignada si uno de los recursos falla.

Las retenciones concurrentes se serializan/bloquean en un orden estable de inventario para evitar sobreventa y reducir deadlocks. Los recursos físicos se asignan por ID (no solo como un contador); los pools abstractos pueden usar capacidad total menos unidades retenidas/confirmadas. Configurar una opción vendible con requisitos de inventario inexistentes o incoherentes debe impedir publicarla.

El checkout libera la retención cuando vence, se abandona o el proveedor confirma el fallo. La operación de vencimiento debe ser repetible sin liberar dos veces la misma plaza. Webhooks e intentos del navegador usan una clave de idempotencia; repetir una notificación no duplica reservas, cobros ni liberaciones.

**Ventana de pago:** 30 minutos, alineada con la duración mínima configurable de Stripe Checkout. La base mantiene la retención 31 minutos como margen técnico; un webhook firmado de sesión vencida libera inventario al cerrarse el checkout y el vencimiento de base de datos es el respaldo. No reservar unidades indefinidamente en estado `pending`.

### Patrones que el mismo motor debe soportar

| Patrón | Unidad que compra el cliente | Inventario consumido |
| --- | --- | --- |
| Excursión por persona | Adultos/niños u otros tramos con cantidad y mínimo/máximo | Una unidad del pool de personas por participante (si el negocio decide que cada tramo ocupa plaza) |
| Grupo privado limitado | Un grupo con mínimo y máximo de participantes | Un turno/grupo y, cuando aplique, tantas plazas-persona como asistentes |
| Vehículo/alquiler | Uno o más vehículos o una tarifa por vehículo | Una unidad/recurso físico de vehículo y sus plazas; puede añadir conductor/guía/equipo |
| Combinación | Una opción/pack | Varias clases de inventario de forma atómica, según coeficientes de esa opción |
| Recurso escaso compartido | El producto que se defina comercialmente | Pool o instancia identificable (barco, guía, equipo) reutilizable entre excursiones de la misma empresa sin venderse dos veces |

No se desarrollarán pantallas separadas con reglas distintas para persona, grupo y vehículo. Se configurarán opciones y requisitos de inventario sobre un motor común; así la reserva de un vehículo también puede ocupar asientos, y un pack puede ocupar vehículo, guía y equipo en la misma transacción.

### Catálogo sintético para diseñar y probar

Los nombres, precios, horarios y capacidades siguientes son **inventados para diseño y QA**; no describen la oferta ni condiciones reales de Tenerife Paradise Tours. Se usan para exigir que un único modelo cubra patrones distintos.

| Excursión ficticia / salida de ejemplo | Cómo se vende | Reglas e inventario de ejemplo | Qué debe calcular el motor |
| --- | --- | --- | --- |
| **Teide en minibús compartido** — 18 oct, 09:00 | Precio por participante: adulto 62 €, niño 44 € | Minibús concreto con 20 asientos; adulto y niño ocupan 1 asiento cada uno. Máximo 20 personas en la salida. | Si hay 12 personas asignadas, quedan 8 asientos. Una cesta con 5 adultos y 4 niños no cabe; debe rechazarse como conjunto, no aceptar 8 de 9. |
| **Cielo de Tenerife — sesión privada** — 18 oct, 20:30 | Precio por grupo: 280 €; 2–8 participantes por grupo | Una plaza de sesión/grupo, un guía astronómico y un telescopio. El número de participantes respeta el máximo de seguridad, aunque el precio sea por grupo. | Dos clientes no pueden reservar el mismo turno privado; un grupo de 9 se rechaza. La cantidad de personas no se interpreta como cantidad de grupos. |
| **Anaga en 4x4 privado** — 19 oct, 10:00–15:00 | Precio por vehículo: 350 €; una reserva compra 1 vehículo con 1–4 ocupantes | Dos 4x4 identificables; cada uno tiene 4 asientos y bloquea el activo durante toda la ruta. Un guía puede operar una salida en ese intervalo. | Con un vehículo ocupado queda uno, aunque el pool global indique más asientos en otros horarios; 5 ocupantes no caben en una unidad. El mismo 4x4 no puede asignarse a otra salida solapada. |
| **Kayak tándem en Los Cristianos** — 19 oct, 12:00 | Precio por kayak doble: 45 €; cada unidad admite 1–2 participantes | 6 kayaks, 12 chalecos y 4 plazas de supervisión de guía; cada kayak reservado consume 1 kayak, 1–2 chalecos según participantes y 1 plaza de guía. | Si ya se asignaron 3 kayaks, 6 chalecos y 3 plazas de guía, solo queda 1 kayak vendible aunque sobren kayaks y chalecos: el guía es el recurso limitante. Una cesta de 2 unidades debe rechazarse completa. |

Estos casos fijan reglas que el esquema debe poder expresar, no datos a insertar como catálogo real. Incluyen unidades comerciales diferentes, mínimos/máximos por reserva, recurso físico con horario, límites de seguridad y una combinación cuyo cuello de botella cambia según el inventario restante.

### Contrato de configuración del producto

Antes de publicar una variante, el panel deberá exigir:

1. Unidad de venta y precio (por persona/tramo, grupo, vehículo/recurso o pack), moneda y límites por reserva.
2. Cantidades/participantes solicitados y qué reglas se les aplican (edad solo afecta al precio si así se configura; ocupación/capacidad se define por separado).
3. Tipos de inventario consumidos y coeficiente por unidad: fijo (1 vehículo por reserva), por participante (1 asiento por persona) o escalonado/configurado (p. ej. número de guías según tamaño de grupo).
4. Recurso por salida o pool elegible, capacidad física, disponibilidad temporal, buffers/preparación y cierres manuales.
5. Política ante inventario incompleto: no ofrecer la variante/salida si faltan recursos obligatorios; no permitir una asignación parcial.

La UI puede ofrecer plantillas (“por participante”, “grupo privado”, “por vehículo”, “pack de recursos”) para que una empresa no tenga que pensar en coeficientes desde cero, pero esas plantillas configuran reglas explícitas del mismo motor; no pueden tener caminos de checkout separados.

## 3. Estados: reserva y pago son conceptos distintos

No reutilizar `bookings.status` como estado de pago.

| Área | Estados candidatos | Regla principal |
| --- | --- | --- |
| Reserva durante compra | `pending_payment`, `confirmed`, `cancelled`, `expired`, `completed` | Se confirma después de verificar pago exitoso o de una confirmación manual explícitamente permitida. Una cancelación no se reabre; se crea otra reserva. |
| Reserva con aprobación manual (si se decide ofrecerla) | `pending_review` | No cobra ni consume una plaza permanente. La empresa debe aprobar antes del vencimiento; entonces se retiene plaza e inicia el cobro. Si vence, se cancela/expira. |
| Intento de pago | `created`, `pending`, `succeeded`, `failed`, `partially_refunded`, `refunded` | Cada reintento crea un intento identificable; un fallo de pago no se presenta como una reserva confirmada. Los reembolsos son datos de pago, no estados de la reserva. |
| Salida | `scheduled`, `closed`, `cancelled` | Cerrar una salida impide nuevas ventas; cancelar una salida inicia revisión/cancelación de reservas afectadas según la política aprobada. |

El estado actual de la app (`pending`, `confirmed`, `cancelled`) corresponde a solicitudes gestionadas manualmente y no se debe reinterpretar automáticamente como los estados del checkout futuro. La migración de estado requerirá transición/versionado de datos.

## 4. Flujo de pago propuesto

1. El viajero elige una salida, opción(es) y cantidades; el servidor vuelve a leer reglas, capacidad, inventarios y precios vigentes.
2. El servidor calcula el precio y las demandas de inventario, crea una retención atómica para todos los recursos y una reserva `pending_payment` con resumen/precio/demandas inmutables.
3. El servidor crea una sesión de Checkout alojada por Stripe como cargo directo en la cuenta conectada de la empresa propietaria. QuickAgency no añade comisión a la reserva; el importe de la excursión corresponde a la empresa, que soporta las tarifas de procesamiento que Stripe aplique a su cuenta. La clave privada solo existe en servidor; no se acepta del cliente un importe autorizado.
4. El proveedor procesa tarjeta y autenticación requerida. La app no recibe ni almacena PAN completo ni CVV.
5. La redirección de vuelta informa al viajero, pero **no confirma el pago**. Un webhook con firma verificada y clave de idempotencia cambia el intento a `succeeded` y confirma reserva/inventario en una transacción.
6. El sistema envía recibo/confirmación solo después de la confirmación del servidor. Si el webhook se retrasa, la pantalla indica que el pago está verificándose; no crea una segunda compra.
7. Si el pago tuvo éxito pero la retención venció o el inventario ya no se puede asegurar, no se confirma a ciegas: se crea una incidencia para compensación/reembolso y atención al cliente.
8. La cancelación validada consulta la política aplicable, registra quién/cuándo/por qué y, cuando corresponda, crea un reembolso identificable. Reembolso y cancelación no son la misma operación; sus resultados pueden quedar temporalmente pendientes.

### Datos que puede conservar la aplicación

Identificadores del proveedor/cuenta, importe, moneda, estado, timestamps, clave de idempotencia, método en forma no sensible (p. ej. marca y últimos cuatro solo si el proveedor lo devuelve y existe necesidad), y referencias a reembolso. Nunca credenciales secretas en cliente, PAN completo, CVV ni datos de autenticación bancaria.

La cuenta de cobro debe pertenecer a la empresa operadora. La plataforma no debe custodiar fondos de viajeros en el MVP. El producto del proveedor que admita cuentas conectadas es candidato, no una elección realizada: se decidirá después de confirmar países, KYC, responsabilidad de reembolsos, comisión, factura y soporte.

### Decisión de Connect confirmada

QuickAgency usa Stripe Connect con Accounts v2, Full Dashboard y cargos directos: cada empresa recibe el pago de sus excursiones en su propia cuenta y Stripe le cobra a esa empresa las tarifas de procesamiento. QuickAgency no retiene comisión por reserva; la futura suscripción SaaS se cobrará por separado y queda fuera del checkout de excursiones. La empresa es el comercio responsable de sus ventas y gestiona sus reembolsos y disputas desde Stripe. Full Dashboard, cobro de tarifas por Stripe y responsabilidad de Stripe sobre saldos negativos se establecen al crear cada nueva cuenta y no se deben aplicar de forma automática a cuentas preexistentes.

## 5. Roles y acciones previstas

| Acción | Owner / admin | Booking manager | Guide |
| --- | --- | --- | --- |
| Consultar reservas de su empresa | Sí | Sí | No, hasta asignar salidas y reducir los datos visibles |
| Confirmar/cancelar reserva manual | Sí | Sí | No |
| Reembolso o cambio de pago | Permiso explícito pendiente | No por defecto | No |
| Crear/cerrar salidas | Sí | No por defecto; revisar necesidad operativa | No |
| Ver reservas de otra empresa | No | No | No |

La base valida empresa y rol en cada operación; esconder un botón no es control de seguridad. El acceso de guías a datos de clientes está deshabilitado hasta que exista asignación por salida y minimización de datos.

## 6. Decisiones que debe confirmar el negocio antes de construir

1. ¿Se cobra el total al reservar o un depósito? ¿Hay pago en destino?
2. ¿Cada salida se confirma automáticamente al pagar o requiere aprobación del operador?
3. ¿Qué recursos necesita cada producto piloto y cuáles pueden compartirse entre excursiones? ¿Basta un pool de unidades o hace falta asignar un vehículo/activo concreto?
4. En cada producto, ¿el cliente compra plazas, un grupo/turno, un vehículo, un pack o varias opciones? ¿Qué límites mínimo/máximo aplican?
5. ¿Qué tipos de participante/precio existen y qué consumen? (p. ej. un niño puede tener otro precio pero ocupar plaza completa).
6. ¿Cuándo deja de venderse cada salida y cuánto dura la retención de todos sus recursos durante checkout?
7. Política de cambio, cancelación, no-show, meteorología, cancelación por el operador y plazos/importes de reembolso.
8. Países y monedas de la empresa piloto; entidad que factura, procesa disputas y soporte al comprador.
9. Stripe es el proveedor de cobro elegido; las cuentas conectadas y sus requisitos de KYC, responsabilidades, costes y políticas deberán validarse antes de producción.
10. ¿Se permiten reservas telefónicas/manuales y cómo consumen/liberan inventario?

La base propuesta soporta consumo combinado de múltiples inventarios desde el primer diseño; no se recortará a plazas por persona. Los recursos y reglas concretos de la empresa piloto, EUR, duración de retención y aprobación manual siguen pendientes de validación. Son supuestos a configurar, no políticas publicadas.

## 7. Criterios de aceptación técnica

- Dos compradores concurrentes por la última unidad de cualquier recurso no pueden confirmar ambos.
- Una opción que necesita dos o más pools/recursos se asigna completa o no se asigna; jamás deja consumo parcial.
- Cambiar una reserva revalida y reajusta todas sus asignaciones atómicamente; fallo deja intacta la asignación anterior.
- Recursos concretos (p. ej. vehículo A) no pueden solaparse entre salidas; la capacidad por asientos también se respeta.
- Las cuatro excursiones sintéticas anteriores producen los resultados de capacidad esperados y no mezclan precio por unidad de venta con ocupación física.
- Repetir un webhook no duplica confirmación, ingreso, auditoría ni correo.
- Un fallo de pago/abandono/vencimiento devuelve inventario exactamente una vez.
- La cantidad y el precio se recalculan en servidor y quedan congelados en la compra.
- Nunca se confirma basándose solo en el retorno del navegador.
- Un tenant no consulta ni altera salidas, reservas, pagos o webhooks de otro tenant.
- `guide` no puede cambiar estados ni ver reservas de salidas no asignadas una vez exista asignación.
- Cada transición sensible registra actor, entidad, estado anterior/nuevo e identificador de proveedor mínimo, sin copiar datos de tarjeta ni mensajes privados.
- Cancelación, reembolso parcial/total y fallo de webhook se prueban en local/sandbox con reconciliación verificable antes de piloto.
- Las pruebas concurrentes y de recuperación corren contra PostgreSQL local, sin cargos reales.

## 8. Orden de implementación cuando haya aprobación

1. Completar roles/políticas para salidas y pagos y definir asignación de guías.
2. **Implementado en local:** migración aditiva de opciones vendibles, tipos/pools/activos de inventario, salidas, requisitos y asignaciones, líneas de reserva, importes, retención temporal y estados. Pruebas sintéticas cubren persona, grupo, vehículo y pack multi-recurso, precios, sobreventa y rollback atómico.
3. **Implementado en local:** disponibilidad pública y pantalla de administración con creación/edición segura de salidas, recursos y opciones. La disponibilidad se calcula en servidor, descuenta retenciones activas y considera inventarios compartidos por salidas solapadas. En grupos variables el indicador se basa en participantes mínimos; el tamaño pedido se vuelve a validar transaccionalmente. Los cambios de horario se bloquean mientras existan reservas activas; no se puede quitar inventario con historial ni reducir capacidad ocupada.
4. **Implementado en local (solo test):** cuentas conectadas con Accounts v2, Full Dashboard, cargos directos sin comisión de QuickAgency, Checkout dinámico, webhooks firmados/idempotentes, estados separados de pago y reserva, y pantalla de retorno que espera confirmación del servidor. La capacidad `card_payments` se comprueba en v2 antes de habilitar cada cobro. No se aceptan claves live.
5. **Validación sandbox en curso:** la clave de prueba nueva ya autentica correctamente y el webhook acepta payloads firmados clásicos y notificaciones ligeras v2; ambos formatos se validaron localmente. Falta levantar el reenvío de Stripe CLI o registrar un endpoint público, completar el alta de una cuenta conectada de prueba y verificar compra, fallo, cancelación, expiración y repetición de eventos de extremo a extremo. Hasta entonces el checkout público permanece deshabilitado.
6. **Pendiente antes de piloto:** definir políticas operativas con la empresa para cambios, cancelaciones, vencimientos y avisos al cliente. Los precios, recursos y excursiones de demostración son ficticios; deben sustituirse y revisarse antes de vender.
7. Cancelación/reembolso, recibos, notificaciones y conciliación.
8. Piloto controlado después de revisar condiciones fiscales/legales, privacidad, soporte y restauración.
