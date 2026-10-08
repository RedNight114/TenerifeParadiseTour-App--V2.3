BEGIN;
SELECT plan(34);
SELECT ok(has_function_privilege('anon', 'public.get_public_departure_availability(bigint)', 'EXECUTE'), 'el público puede consultar solo la disponibilidad publicada');
SELECT ok(NOT has_function_privilege('anon', 'public.update_excursion_departure(uuid,timestamptz,timestamptz,timestamptz,text,jsonb)', 'EXECUTE'), 'el público no tiene permiso para editar salidas');
SELECT ok(has_function_privilege('anon', 'public.get_public_payment_readiness()', 'EXECUTE'), 'el público consulta si el cobro está habilitado sin leer identificadores privados');
SELECT ok(NOT has_function_privilege('anon', 'public.apply_stripe_checkout_event(text,text,text,text,text,bigint,text,boolean)', 'EXECUTE'), 'el público no puede procesar eventos de Stripe');
SELECT ok(NOT has_function_privilege('authenticated', 'public.apply_stripe_checkout_event(text,text,text,text,text,bigint,text,boolean)', 'EXECUTE'), 'ningún usuario autenticado puede falsificar una confirmación de pago');
SELECT ok(NOT has_function_privilege('anon', 'public.record_platform_domain_hosting_state(uuid,text,jsonb)', 'EXECUTE'), 'el público no puede falsificar el estado de conexión Vercel');

-- Transaction-scoped fixtures: the test runner rolls all of these back.
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-4000-8000-00000000000a', 'authenticated', 'authenticated', 'owner-a@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-4000-8000-00000000000b', 'authenticated', 'authenticated', 'owner-b@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-4000-8000-00000000000c', 'authenticated', 'authenticated', 'guide-a@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-4000-8000-00000000000d', 'authenticated', 'authenticated', 'booking-manager-a@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}');

INSERT INTO public.organizations (id, slug, name, platform_plan_id)
VALUES
  ('10000000-0000-4000-8000-00000000000a', 'tenant-a-test', 'Tenant A test', (select id from public.platform_plans where code = 'pilot-unlimited')),
  ('10000000-0000-4000-8000-00000000000b', 'tenant-b-test', 'Tenant B test', (select id from public.platform_plans where code = 'pilot-unlimited'));

INSERT INTO public.organization_domains (organization_id, host, is_primary, verified_at, hosting_status)
VALUES
  ('10000000-0000-4000-8000-00000000000a', 'tenant-a.test', true, now(), 'verified'),
  ('10000000-0000-4000-8000-00000000000b', 'tenant-b.test', true, now(), 'verified');
INSERT INTO public.organization_domains (organization_id, host, is_primary, verified_at, hosting_status)
VALUES ('10000000-0000-4000-8000-00000000000a', 'not-ready.test', false, now(), 'pending_dns');

INSERT INTO public.organization_memberships (organization_id, user_id, email, role, status, accepted_at)
VALUES
  ('10000000-0000-4000-8000-00000000000a', '00000000-0000-4000-8000-00000000000a', 'owner-a@test.invalid', 'owner', 'active', now()),
  ('10000000-0000-4000-8000-00000000000b', '00000000-0000-4000-8000-00000000000b', 'owner-b@test.invalid', 'owner', 'active', now()),
  ('10000000-0000-4000-8000-00000000000a', '00000000-0000-4000-8000-00000000000c', 'guide-a@test.invalid', 'guide', 'active', now()),
  ('10000000-0000-4000-8000-00000000000a', '00000000-0000-4000-8000-00000000000d', 'booking-manager-a@test.invalid', 'booking_manager', 'active', now());

INSERT INTO public.categories (id, name_es, name_en, name_de, organization_id, active)
VALUES
  (101, 'Categoría A activa', 'A active category', 'A aktiv', '10000000-0000-4000-8000-00000000000a', true),
  (102, 'Categoría A inactiva', 'A inactive category', 'A inaktiv', '10000000-0000-4000-8000-00000000000a', false),
  (201, 'Categoría B activa', 'B active category', 'B aktiv', '10000000-0000-4000-8000-00000000000b', true);

INSERT INTO public.excursions (id, name_es, name_en, name_de, price, category, organization_id, is_published)
VALUES
  (1001, 'Excursión A pública', 'A published tour', 'A öffentliche Tour', 30, '101', '10000000-0000-4000-8000-00000000000a', true),
  (1002, 'Excursión A borrador', 'A draft tour', 'A Entwurf', 40, '101', '10000000-0000-4000-8000-00000000000a', false),
  (2001, 'Excursión B pública', 'B published tour', 'B öffentliche Tour', 50, '201', '10000000-0000-4000-8000-00000000000b', true);

INSERT INTO public.bookings (id, excursion_id, organization_id, customer_name, email, preferred_date, number_of_people)
VALUES
  (10001, 1001, '10000000-0000-4000-8000-00000000000a', 'Cliente A', 'customer-a@test.invalid', current_date + 7, 2),
  (20001, 2001, '10000000-0000-4000-8000-00000000000b', 'Cliente B', 'customer-b@test.invalid', current_date + 7, 2);

SET LOCAL ROLE anon;
SELECT set_config('request.headers', '{"x-tenant-host":"tenant-a.test"}', true);
SELECT is(public.current_public_organization_id(), '10000000-0000-4000-8000-00000000000a'::uuid, 'el host verificado selecciona la empresa A');
SELECT is((SELECT count(*) FROM public.categories), 1::bigint, 'visitante solo ve categorías activas de la empresa A');
SELECT is((SELECT count(*) FROM public.excursions), 1::bigint, 'visitante solo ve excursiones publicadas de la empresa A');

SELECT set_config('request.headers', '{"x-tenant-host":"tenant-b.test"}', true);
SELECT is((SELECT count(*) FROM public.excursions), 1::bigint, 'el host B solo publica el catálogo B');
SELECT set_config('request.headers', '{"x-tenant-host":"not-ready.test"}', true);
SELECT ok(public.current_public_organization_id() IS NULL, 'un dominio con TXT pero sin Vercel y DNS listos no publica la empresa');
SELECT set_config('request.headers', '{"x-tenant-host":"unknown.test"}', true);
SELECT ok(public.current_public_organization_id() IS NULL, 'un host desconocido no resuelve a ninguna empresa');

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.headers', '{"x-tenant-host":"tenant-a.test"}', true);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
SELECT is((SELECT count(*) FROM public.categories), 2::bigint, 'miembro A ve sus categorías activas e inactivas');
SELECT is((SELECT count(*) FROM public.excursions), 2::bigint, 'miembro A ve sus excursiones publicadas y borradores');
SELECT is((SELECT count(*) FROM public.bookings), 1::bigint, 'propietario A solo ve las reservas de A');
SELECT lives_ok(
  $$UPDATE public.bookings SET status = 'confirmed' WHERE id = 10001$$,
  'propietario puede confirmar una reserva de su empresa'
);
SELECT throws_ok(
  $$UPDATE public.bookings SET status = 'pending' WHERE id = 10001$$,
  '23514', NULL, 'la base de datos impide reabrir una reserva confirmada'
);
SELECT is((SELECT status FROM public.bookings WHERE id = 10001), 'confirmed', 'un cambio inválido no altera el estado');
SELECT is(
  (SELECT before_data FROM public.organization_audit_events WHERE entity = 'bookings' AND entity_id = '10001' ORDER BY id DESC LIMIT 1),
  '{"status":"pending"}'::jsonb,
  'auditoría guarda solo el estado anterior de la reserva'
);
SELECT is(
  (SELECT after_data FROM public.organization_audit_events WHERE entity = 'bookings' AND entity_id = '10001' ORDER BY id DESC LIMIT 1),
  '{"status":"confirmed"}'::jsonb,
  'auditoría guarda solo el estado nuevo, sin datos del cliente'
);

SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000c', true);
SELECT is((SELECT count(*) FROM public.bookings), 0::bigint, 'guía no puede consultar datos personales de las reservas');
SELECT throws_ok(
  $$INSERT INTO public.categories (name_es, name_en, name_de, organization_id) VALUES ('No autorizado', 'Unauthorized', 'Nicht erlaubt', '10000000-0000-4000-8000-00000000000a')$$,
  '42501', NULL, 'guía no puede modificar el catálogo'
);
SELECT lives_ok(
  $$UPDATE public.bookings SET status = 'cancelled' WHERE id = 10001$$,
  'el intento de actualización del guía no produce errores ni elude RLS'
);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
SELECT is((SELECT status FROM public.bookings WHERE id = 10001), 'confirmed', 'el intento del guía deja intacta la reserva');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000d', true);
SELECT lives_ok(
  $$UPDATE public.bookings SET status = 'cancelled' WHERE id = 10001$$,
  'gestor de reservas puede cancelar una reserva de su empresa'
);
SELECT is((SELECT status FROM public.bookings WHERE id = 10001), 'cancelled', 'el cambio permitido del gestor queda aplicado');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
SELECT is(
  (SELECT actor_user_id FROM public.organization_audit_events WHERE entity = 'bookings' AND entity_id = '10001' ORDER BY id DESC LIMIT 1),
  '00000000-0000-4000-8000-00000000000d'::uuid,
  'el registro identifica al gestor que realizó el cambio'
);

SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000b', true);
SELECT is((SELECT count(*) FROM public.excursions), 0::bigint, 'propietario B no ve excursiones de A aunque use el host A');
SELECT is((SELECT count(*) FROM public.bookings), 0::bigint, 'propietario B no ve reservas de A aunque use el host A');

RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.headers', '{"x-tenant-host":"tenant-a.test"}', true);
SELECT throws_ok('SELECT * FROM public.bookings', '42501', NULL, 'visitante no puede leer datos de reservas');
SELECT throws_ok(
  $$INSERT INTO public.bookings (excursion_id, organization_id, customer_name, email, preferred_date, number_of_people) VALUES (1001, '10000000-0000-4000-8000-00000000000a', 'Reserva pública', 'public@test.invalid', current_date + 10, 1)$$,
  '42501', NULL, 'visitante debe reservar a través de la operación que valida y retiene inventario'
);
SELECT throws_ok(
  $$INSERT INTO public.bookings (excursion_id, organization_id, customer_name, email, preferred_date, number_of_people) VALUES (2001, '10000000-0000-4000-8000-00000000000b', 'Cruce de tenant', 'cross@test.invalid', current_date + 10, 1)$$,
  '42501', NULL, 'visitante no puede enviar la reserva al tenant B desde el host A'
);
SELECT throws_ok(
  $$INSERT INTO public.bookings (excursion_id, organization_id, customer_name, email, preferred_date, number_of_people) VALUES (2001, '10000000-0000-4000-8000-00000000000a', 'Excursión ajena', 'cross-tour@test.invalid', current_date + 10, 1)$$,
  '42501', NULL, 'reserva de A no puede referenciar una excursión de B'
);
SELECT throws_ok(
  $$INSERT INTO public.bookings (excursion_id, organization_id, customer_name, email, preferred_date, number_of_people) VALUES (1002, '10000000-0000-4000-8000-00000000000a', 'Excursión borrador', 'draft@test.invalid', current_date + 10, 1)$$,
  '42501', NULL, 'visitante no puede reservar una excursión no publicada'
);

SELECT * FROM finish();
ROLLBACK;
