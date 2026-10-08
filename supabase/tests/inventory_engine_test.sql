BEGIN;
SELECT no_plan();
SELECT ok(NOT has_function_privilege('anon', 'public.create_external_inventory_booking(uuid,text,text,text,text,uuid,integer,integer,text,text,text)', 'EXECUTE'), 'el público anónimo no puede invocar el alta de reservas externas');

-- Fabricated operating examples. Everything is rolled back at the end.
INSERT INTO public.organizations (id, slug, name, platform_plan_id) VALUES
  ('40000000-0000-4000-8000-00000000000a', 'inventory-test', 'Inventario test', (select id from public.platform_plans where code = 'pilot-unlimited'));
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES ('48000000-0000-4000-8000-00000000000a', 'authenticated', 'authenticated', 'inventory-owner@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}');
INSERT INTO public.organization_memberships (organization_id, user_id, email, role, status, accepted_at)
VALUES ('40000000-0000-4000-8000-00000000000a', '48000000-0000-4000-8000-00000000000a', 'inventory-owner@test.invalid', 'owner', 'active', now());
INSERT INTO public.organization_domains (organization_id, host, is_primary, verified_at, hosting_status)
VALUES ('40000000-0000-4000-8000-00000000000a', 'inventory.test', true, now(), 'verified');
INSERT INTO public.categories (id, name_es, name_en, name_de, organization_id)
VALUES (401, 'Aventura test', 'Adventure test', 'Abenteuer test', '40000000-0000-4000-8000-00000000000a');
INSERT INTO public.excursions (id, name_es, name_en, name_de, price, category, organization_id, is_published)
VALUES
  (4001, 'Teide en minibús', 'Teide minibus', 'Teide im Minibus', 62, '401', '40000000-0000-4000-8000-00000000000a', true),
  (4002, 'Cielo de Tenerife privado', 'Private Tenerife stargazing', 'Private Sternbeobachtung', 280, '401', '40000000-0000-4000-8000-00000000000a', true),
  (4003, 'Anaga 4x4 privado', 'Private Anaga 4x4', 'Privater Anaga-4x4', 350, '401', '40000000-0000-4000-8000-00000000000a', true),
  (4004, 'Kayak tándem', 'Tandem kayak', 'Tandem-Kajak', 45, '401', '40000000-0000-4000-8000-00000000000a', true);

INSERT INTO public.inventory_resource_types (id, organization_id, name, unit_label, allocation_mode) VALUES
  ('41000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-00000000000a', 'Minibús Teide', 'plaza', 'asset'),
  ('41000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-00000000000a', 'Sesiones astronómicas', 'sesión', 'pool'),
  ('41000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-00000000000a', 'Telescopios', 'telescopio', 'asset'),
  ('41000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-00000000000a', 'Vehículos 4x4', 'vehículo', 'asset'),
  ('41000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-00000000000a', 'Kayaks tándem', 'kayak', 'asset'),
  ('41000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-00000000000a', 'Chalecos', 'chaleco', 'pool'),
  ('41000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-00000000000a', 'Supervisión de guía', 'plaza supervisada', 'pool');
INSERT INTO public.inventory_resources (id, organization_id, resource_type_id, name, capacity_units, max_party_size) VALUES
  ('42000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000001', 'Minibús Teide 01', 20, 20),
  ('42000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000002', 'Equipo nocturno', 2, null),
  ('42000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000003', 'Telescopio 01', 1, 8),
  ('42000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000004', '4x4 01', 1, 4),
  ('42000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000004', '4x4 02', 1, 4),
  ('42000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000005', 'Kayak 01', 1, 2),
  ('42000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000005', 'Kayak 02', 1, 2),
  ('42000000-0000-4000-8000-000000000008', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000005', 'Kayak 03', 1, 2),
  ('42000000-0000-4000-8000-000000000009', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000005', 'Kayak 04', 1, 2),
  ('42000000-0000-4000-8000-000000000010', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000005', 'Kayak 05', 1, 2),
  ('42000000-0000-4000-8000-000000000011', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000005', 'Kayak 06', 1, 2),
  ('42000000-0000-4000-8000-000000000012', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000006', 'Almacén chalecos', 12, null),
  ('42000000-0000-4000-8000-000000000013', '40000000-0000-4000-8000-00000000000a', '41000000-0000-4000-8000-000000000007', 'Turno de mañana', 4, null);

INSERT INTO public.excursion_departures (id, organization_id, excursion_id, starts_at, ends_at, sales_cutoff_at) VALUES
  ('43000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-00000000000a', 4001, now() + interval '10 days', now() + interval '10 days 8 hours', now() + interval '9 days'),
  ('43000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-00000000000a', 4002, now() + interval '11 days', now() + interval '11 days 4 hours', now() + interval '10 days'),
  ('43000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-00000000000a', 4003, now() + interval '12 days', now() + interval '12 days 7 hours', now() + interval '11 days'),
  ('43000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-00000000000a', 4004, now() + interval '13 days', now() + interval '13 days 3 hours', now() + interval '12 days');
INSERT INTO public.departure_inventory (organization_id, departure_id, resource_id, capacity_units)
SELECT '40000000-0000-4000-8000-00000000000a', d.departure_id, r.id, r.capacity_units FROM (VALUES
  ('43000000-0000-4000-8000-000000000001'::uuid, '42000000-0000-4000-8000-000000000001'::uuid),
  ('43000000-0000-4000-8000-000000000002'::uuid, '42000000-0000-4000-8000-000000000002'::uuid),
  ('43000000-0000-4000-8000-000000000002'::uuid, '42000000-0000-4000-8000-000000000003'::uuid),
  ('43000000-0000-4000-8000-000000000002'::uuid, '42000000-0000-4000-8000-000000000013'::uuid),
  ('43000000-0000-4000-8000-000000000003'::uuid, '42000000-0000-4000-8000-000000000004'::uuid),
  ('43000000-0000-4000-8000-000000000003'::uuid, '42000000-0000-4000-8000-000000000005'::uuid),
  ('43000000-0000-4000-8000-000000000004'::uuid, '42000000-0000-4000-8000-000000000006'::uuid),
  ('43000000-0000-4000-8000-000000000004'::uuid, '42000000-0000-4000-8000-000000000007'::uuid),
  ('43000000-0000-4000-8000-000000000004'::uuid, '42000000-0000-4000-8000-000000000008'::uuid),
  ('43000000-0000-4000-8000-000000000004'::uuid, '42000000-0000-4000-8000-000000000009'::uuid),
  ('43000000-0000-4000-8000-000000000004'::uuid, '42000000-0000-4000-8000-000000000010'::uuid),
  ('43000000-0000-4000-8000-000000000004'::uuid, '42000000-0000-4000-8000-000000000011'::uuid),
  ('43000000-0000-4000-8000-000000000004'::uuid, '42000000-0000-4000-8000-000000000012'::uuid),
  ('43000000-0000-4000-8000-000000000004'::uuid, '42000000-0000-4000-8000-000000000013'::uuid)
) AS d(departure_id, resource_id)
JOIN public.inventory_resources r ON r.id = d.resource_id;

INSERT INTO public.product_options (id, organization_id, excursion_id, name, pricing_mode, unit_price_minor, currency_code, min_quantity, max_quantity, min_participants_per_unit, max_participants_per_unit) VALUES
  ('44000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-00000000000a', 4001, 'Adulto Teide', 'per_participant', 6200, 'EUR', 1, 20, 1, 1),
  ('44000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-00000000000a', 4001, 'Menor Teide', 'per_participant', 4400, 'EUR', 1, 20, 1, 1),
  ('44000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-00000000000a', 4002, 'Grupo privado (2–8)', 'per_group', 28000, 'EUR', 1, 1, 2, 8),
  ('44000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-00000000000a', 4003, 'Vehículo 4x4 (hasta 4)', 'per_resource', 35000, 'EUR', 1, 2, 1, 4),
  ('44000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-00000000000a', 4004, 'Kayak tándem', 'per_resource', 4500, 'EUR', 1, 6, 2, 2),
  ('44000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-00000000000a', 4004, 'Opción sin inventario', 'per_group', 1000, 'EUR', 1, 1, 1, 1);
INSERT INTO public.option_inventory_requirements (organization_id, option_id, resource_type_id, demand_basis, units_per_basis)
SELECT '40000000-0000-4000-8000-00000000000a', o.option_id, o.resource_type_id, o.demand_basis, o.units_per_basis FROM (VALUES
  ('44000000-0000-4000-8000-000000000001'::uuid, '41000000-0000-4000-8000-000000000001'::uuid, 'participants', 1),
  ('44000000-0000-4000-8000-000000000002'::uuid, '41000000-0000-4000-8000-000000000001'::uuid, 'participants', 1),
  ('44000000-0000-4000-8000-000000000003'::uuid, '41000000-0000-4000-8000-000000000002'::uuid, 'sale_units', 1),
  ('44000000-0000-4000-8000-000000000003'::uuid, '41000000-0000-4000-8000-000000000003'::uuid, 'sale_units', 1),
  ('44000000-0000-4000-8000-000000000003'::uuid, '41000000-0000-4000-8000-000000000007'::uuid, 'participants', 1),
  ('44000000-0000-4000-8000-000000000004'::uuid, '41000000-0000-4000-8000-000000000004'::uuid, 'sale_units', 1),
  ('44000000-0000-4000-8000-000000000005'::uuid, '41000000-0000-4000-8000-000000000005'::uuid, 'sale_units', 1),
  ('44000000-0000-4000-8000-000000000005'::uuid, '41000000-0000-4000-8000-000000000006'::uuid, 'participants', 1),
  ('44000000-0000-4000-8000-000000000005'::uuid, '41000000-0000-4000-8000-000000000007'::uuid, 'sale_units', 1)
) AS o(option_id, resource_type_id, demand_basis, units_per_basis);

-- A vehicle may be assigned to a future non-overlapping shift, but moving that
-- shift onto an existing assignment must be rejected.
INSERT INTO public.excursion_departures (id, organization_id, excursion_id, starts_at, ends_at, sales_cutoff_at)
VALUES ('43000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-00000000000a', 4001, now() + interval '20 days', now() + interval '20 days 3 hours', now() + interval '19 days');
INSERT INTO public.departure_inventory (organization_id, departure_id, resource_id, capacity_units)
VALUES ('40000000-0000-4000-8000-00000000000a', '43000000-0000-4000-8000-000000000005', '42000000-0000-4000-8000-000000000001', 20);
INSERT INTO public.excursion_departures (id, organization_id, excursion_id, starts_at, ends_at, sales_cutoff_at)
VALUES ('43000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-00000000000a', 4004, now() + interval '25 days', now() + interval '25 days 3 hours', now() + interval '24 days');
INSERT INTO public.departure_inventory (organization_id, departure_id, resource_id, capacity_units)
VALUES ('40000000-0000-4000-8000-00000000000a', '43000000-0000-4000-8000-000000000006', '42000000-0000-4000-8000-000000000006', 1);
SELECT throws_ok(
  $$UPDATE public.excursion_departures SET starts_at = (SELECT starts_at FROM public.excursion_departures WHERE id = '43000000-0000-4000-8000-000000000001'), ends_at = (SELECT ends_at FROM public.excursion_departures WHERE id = '43000000-0000-4000-8000-000000000001'), sales_cutoff_at = (SELECT sales_cutoff_at FROM public.excursion_departures WHERE id = '43000000-0000-4000-8000-000000000001') WHERE id = '43000000-0000-4000-8000-000000000005'$$,
  '23P01', NULL, 'impide reprogramar una salida sobre el mismo minibús ya asignado'
);

INSERT INTO public.bookings (organization_id, excursion_id, departure_id, customer_name, email, preferred_date, number_of_people, status, hold_expires_at, total_amount_minor, currency_code)
VALUES ('40000000-0000-4000-8000-00000000000a', 4001, '43000000-0000-4000-8000-000000000001', 'Retención antigua', 'expired-hold@test.invalid', current_date + 10, 1, 'pending', now() - interval '1 second', 6200, 'EUR');
INSERT INTO public.bookings (organization_id, excursion_id, departure_id, customer_name, email, preferred_date, number_of_people, status, hold_expires_at, total_amount_minor, currency_code)
VALUES ('40000000-0000-4000-8000-00000000000a', 4001, '43000000-0000-4000-8000-000000000005', 'Retención vencida para edición', 'expired-edit@test.invalid', current_date + 20, 1, 'pending', now() - interval '1 second', 6200, 'EUR');
SELECT throws_ok(
  $$UPDATE public.bookings SET status = 'confirmed' WHERE email = 'expired-hold@test.invalid'$$,
  '23514', NULL, 'impide confirmar por escritura directa una retención vencida'
);
SELECT throws_ok(
  $$UPDATE public.bookings SET total_amount_minor = 1 WHERE email = 'expired-hold@test.invalid'$$,
  '23514', NULL, 'mantiene inmutable el importe capturado de la reserva'
);

SELECT set_config('request.headers', '{"x-tenant-host":"inventory.test"}', true);
SELECT set_config('request.jwt.claim.role', 'anon', true);
SET LOCAL ROLE anon;
SELECT is(public.current_public_organization_id(), '40000000-0000-4000-8000-00000000000a'::uuid, 'resuelve la empresa desde el dominio público');
SELECT is((SELECT (option_availability->>'44000000-0000-4000-8000-000000000001')::integer FROM public.get_public_departure_availability(4001) WHERE departure_id = '43000000-0000-4000-8000-000000000001'), 20, 'el público ve las veinte plazas disponibles antes de vender');
SELECT is((SELECT (option_availability->>'44000000-0000-4000-8000-000000000005')::integer FROM public.get_public_departure_availability(4004) WHERE departure_id = '43000000-0000-4000-8000-000000000004'), 4, 'la disponibilidad pública combina kayaks, chalecos y guías');
SELECT is((public.create_inventory_booking('43000000-0000-4000-8000-000000000001', 'Ana Teide', 'ana@test.invalid', '+34600000001', 'es', '[{"option_id":"44000000-0000-4000-8000-000000000001","quantity":1,"participants":1},{"option_id":"44000000-0000-4000-8000-000000000002","quantity":1,"participants":1}]')->>'total_amount_minor')::bigint, 10600::bigint, 'minibús calcula precio combinado adulto y menor');
SELECT is((SELECT (option_availability->>'44000000-0000-4000-8000-000000000001')::integer FROM public.get_public_departure_availability(4001) WHERE departure_id = '43000000-0000-4000-8000-000000000001'), 18, 'la vista pública descuenta las plazas retenidas durante el checkout');
RESET ROLE;
SELECT ok((SELECT hold_expires_at between now()+interval '30 minutes' and now()+interval '32 minutes' FROM public.bookings WHERE email = 'ana@test.invalid'), 'la retención queda alineada con los 30 minutos de Stripe Checkout y su margen técnico');
SELECT is((SELECT sum(units) FROM public.booking_inventory_allocations WHERE departure_id = '43000000-0000-4000-8000-000000000001'), 2::bigint, 'el minibús retiene dos plazas');
SELECT set_config('request.headers', '{"x-tenant-host":"inventory.test"}', true);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '48000000-0000-4000-8000-00000000000a', true);
SELECT lives_ok(
  $$SELECT public.create_external_inventory_booking(
    '43000000-0000-4000-8000-000000000001', 'Venta telefónica test', 'external-sale@test.invalid', '+34600000099', 'es',
    '44000000-0000-4000-8000-000000000001', 3, 3, 'Prueba de reserva externa', 'phone', 'EXT-TEST-01'
  )$$,
  'el gestor registra una reserva externa usando el asignador de inventario'
);
SELECT is((SELECT status FROM public.bookings WHERE email = 'external-sale@test.invalid'), 'confirmed', 'la reserva externa queda confirmada inmediatamente');
SELECT is((SELECT booking_source FROM public.bookings WHERE email = 'external-sale@test.invalid'), 'external', 'la reserva queda identificada como externa');
SELECT is((SELECT external_channel FROM public.bookings WHERE email = 'external-sale@test.invalid'), 'phone', 'se conserva el canal original de venta');
SELECT is((SELECT external_reference FROM public.bookings WHERE email = 'external-sale@test.invalid'), 'EXT-TEST-01', 'se conserva el localizador externo');
SELECT is((SELECT hold_expires_at FROM public.bookings WHERE email = 'external-sale@test.invalid'), NULL::timestamptz, 'la venta externa no conserva una retención temporal');
SELECT is((SELECT sum(units) FROM public.booking_inventory_allocations WHERE booking_id = (SELECT id FROM public.bookings WHERE email = 'external-sale@test.invalid')), 3::bigint, 'la reserva externa consume exactamente las plazas indicadas');
UPDATE public.bookings SET status = 'cancelled' WHERE email = 'external-sale@test.invalid';
SELECT throws_ok(
  $$SELECT public.create_external_inventory_booking(
    '43000000-0000-4000-8000-000000000001', 'Venta duplicada', 'duplicate-sale@test.invalid', '', 'es',
    '44000000-0000-4000-8000-000000000001', 1, 1, NULL, 'phone', 'EXT-TEST-01'
  )$$,
  '23505', NULL, 'rechaza reutilizar el localizador externo para evitar duplicados'
);
SELECT is((SELECT count(*) FROM public.bookings WHERE external_reference = 'EXT-TEST-01'), 1::bigint, 'un localizador repetido no deja una reserva parcial');
SELECT set_config('request.jwt.claim.sub', '48000000-0000-4000-8000-00000000000c', true);
SELECT throws_ok(
  $$SELECT public.create_external_inventory_booking(
    '43000000-0000-4000-8000-000000000001', 'Venta no autorizada', 'unauthorized-sale@test.invalid', '', 'es',
    '44000000-0000-4000-8000-000000000001', 1, 1, NULL, 'phone', NULL
  )$$,
  '42501', NULL, 'un guía no puede registrar ventas externas'
);
SELECT is((SELECT count(*) FROM public.bookings WHERE email = 'unauthorized-sale@test.invalid'), 0::bigint, 'el intento no autorizado no crea una reserva parcial');
SELECT set_config('request.jwt.claim.sub', '48000000-0000-4000-8000-00000000000a', true);
SELECT lives_ok($$SELECT public.create_inventory_resource('Recurso editor pgTAP','unidad','pool','Unidad editor pgTAP',3,NULL)$$, 'el editor crea un recurso con permisos de propietario');
SELECT lives_ok($$SELECT public.create_product_option_with_requirements(4004,'Opción editor pgTAP','per_resource',5000,'EUR',1,3,1,2,jsonb_build_array(jsonb_build_object('resource_type_id',(SELECT id FROM public.inventory_resource_types WHERE organization_id='40000000-0000-4000-8000-00000000000a' AND name='Recurso editor pgTAP'),'demand_basis','sale_units','units_per_basis',1)))$$, 'el editor crea opción y requisitos de inventario atómicamente');
SELECT lives_ok($$SELECT public.create_excursion_departure(4004,now()+interval '30 days',now()+interval '30 days 2 hours',now()+interval '29 days','Salida de prueba pgTAP',jsonb_build_array(jsonb_build_object('resource_id',(SELECT id FROM public.inventory_resources WHERE organization_id='40000000-0000-4000-8000-00000000000a' AND name='Unidad editor pgTAP'),'capacity_units',3)))$$, 'el editor programa salida y asigna capacidad atómicamente');
SELECT lives_ok($$SELECT public.update_excursion_departure('43000000-0000-4000-8000-000000000005',now()+interval '21 days',now()+interval '21 days 3 hours',now()+interval '20 days','Horario editado',jsonb_build_array(jsonb_build_object('resource_id','42000000-0000-4000-8000-000000000001','capacity_units',20)))$$, 'el propietario puede editar horario y notas de una salida futura sin reservas');
SELECT throws_ok($$SELECT public.update_excursion_departure('43000000-0000-4000-8000-000000000005',now()+interval '12 days',now()+interval '12 days 3 hours',now()+interval '11 days','Nuevo activo en horario solapado',jsonb_build_array(jsonb_build_object('resource_id','42000000-0000-4000-8000-000000000004','capacity_units',1)))$$, '23P01', NULL, 'el editor impide añadir un activo que solapa al nuevo horario');
SELECT throws_ok($$SELECT public.update_excursion_departure('43000000-0000-4000-8000-000000000006',now()+interval '13 days',now()+interval '13 days 3 hours',now()+interval '12 days','Solape',jsonb_build_array(jsonb_build_object('resource_id','42000000-0000-4000-8000-000000000006','capacity_units',1)))$$, '23P01', NULL, 'el editor rechaza solapar el mismo kayak con otra salida');
SELECT lives_ok($$SELECT public.confirm_inventory_booking((SELECT id FROM public.bookings WHERE email = 'ana@test.invalid'))$$, 'propietario confirma usando la retención activa y la función protegida');
SELECT lives_ok($$UPDATE public.bookings SET status = 'cancelled' WHERE email = 'ana@test.invalid'$$, 'cancelar una reserva confirmada libera sus plazas');
RESET ROLE;
SET LOCAL ROLE anon;
SELECT is((public.create_inventory_booking('43000000-0000-4000-8000-000000000001', 'Grupo completo', 'grupo@test.invalid', '', 'es', '[{"option_id":"44000000-0000-4000-8000-000000000001","quantity":20,"participants":20}]')->>'total_amount_minor')::bigint, 124000::bigint, 'la cancelación devuelve toda la capacidad y permite vender las veinte plazas restantes');
RESET ROLE;
SELECT is((SELECT sum(units) FROM public.booking_inventory_allocations WHERE departure_id = '43000000-0000-4000-8000-000000000001' AND booking_id = (SELECT id FROM public.bookings WHERE email = 'grupo@test.invalid')), 20::bigint, 'la reserva completa consume exactamente toda la capacidad');
SET LOCAL ROLE anon;
SELECT is((SELECT (option_availability->>'44000000-0000-4000-8000-000000000001')::integer FROM public.get_public_departure_availability(4001) WHERE departure_id = '43000000-0000-4000-8000-000000000001'), 0, 'la disponibilidad pública marca completa la salida sin plazas');
RESET ROLE;
SELECT throws_ok($$SELECT public.update_excursion_departure('43000000-0000-4000-8000-000000000001',(SELECT starts_at FROM public.excursion_departures WHERE id='43000000-0000-4000-8000-000000000001')+interval '1 hour',(SELECT ends_at FROM public.excursion_departures WHERE id='43000000-0000-4000-8000-000000000001')+interval '1 hour',(SELECT sales_cutoff_at FROM public.excursion_departures WHERE id='43000000-0000-4000-8000-000000000001'),'Cambio con reserva',jsonb_build_array(jsonb_build_object('resource_id','42000000-0000-4000-8000-000000000001','capacity_units',20)))$$, '23514', NULL, 'impide cambiar el horario de una salida con reservas pendientes o confirmadas');
SELECT throws_ok($$SELECT public.update_excursion_departure('43000000-0000-4000-8000-000000000001',(SELECT starts_at FROM public.excursion_departures WHERE id='43000000-0000-4000-8000-000000000001'),(SELECT ends_at FROM public.excursion_departures WHERE id='43000000-0000-4000-8000-000000000001'),(SELECT sales_cutoff_at FROM public.excursion_departures WHERE id='43000000-0000-4000-8000-000000000001'),'Aforo reducido',jsonb_build_array(jsonb_build_object('resource_id','42000000-0000-4000-8000-000000000001','capacity_units',19)))$$, '23514', NULL, 'impide reducir capacidad por debajo de plazas retenidas');
SET LOCAL ROLE anon;
SELECT throws_ok($$SELECT public.create_inventory_booking('43000000-0000-4000-8000-000000000001', 'Grupo grande', 'grupo2@test.invalid', '', 'es', '[{"option_id":"44000000-0000-4000-8000-000000000001","quantity":1,"participants":1}]')$$, 'P0001', NULL, 'rechaza la plaza adicional después de completar aforo');
RESET ROLE;
SELECT is((SELECT count(*) FROM public.bookings WHERE email = 'grupo2@test.invalid'), 0::bigint, 'fallo de disponibilidad no deja reserva parcial');
SET LOCAL ROLE anon;
SELECT is((public.create_inventory_booking('43000000-0000-4000-8000-000000000002', 'Familia estrellas', 'cielo@test.invalid', '', 'es', '[{"option_id":"44000000-0000-4000-8000-000000000003","quantity":1,"participants":4}]')->>'total_amount_minor')::bigint, 28000::bigint, 'excursión privada cobra por grupo');
RESET ROLE;
SELECT is((SELECT sum(units) FROM public.booking_inventory_allocations WHERE booking_id = (SELECT id FROM public.bookings WHERE email = 'cielo@test.invalid') AND requirement_id IN (SELECT id FROM public.option_inventory_requirements WHERE option_id = '44000000-0000-4000-8000-000000000003' AND resource_type_id = '41000000-0000-4000-8000-000000000007')), 4::bigint, 'sesión privada consume supervisión proporcional a personas');
SET LOCAL ROLE anon;
SELECT throws_ok($$SELECT public.create_inventory_booking('43000000-0000-4000-8000-000000000002', 'Otro grupo', 'cielo2@test.invalid', '', 'es', '[{"option_id":"44000000-0000-4000-8000-000000000003","quantity":1,"participants":2}]')$$, 'P0001', NULL, 'no asigna el único telescopio dos veces');
SELECT is((public.create_inventory_booking('43000000-0000-4000-8000-000000000003', 'Familia Anaga', 'anaga@test.invalid', '', 'es', '[{"option_id":"44000000-0000-4000-8000-000000000004","quantity":1,"participants":4}]')->>'total_amount_minor')::bigint, 35000::bigint, '4x4 cobra por vehículo hasta cuatro ocupantes');
SELECT throws_ok($$SELECT public.create_inventory_booking('43000000-0000-4000-8000-000000000003', 'Grupo Anaga', 'anaga2@test.invalid', '', 'es', '[{"option_id":"44000000-0000-4000-8000-000000000004","quantity":2,"participants":6}]')$$, 'P0001', NULL, 'respeta la flota disponible después de una venta');
SELECT is((public.create_inventory_booking('43000000-0000-4000-8000-000000000004', 'Kayak familia', 'kayak@test.invalid', '', 'es', '[{"option_id":"44000000-0000-4000-8000-000000000005","quantity":2,"participants":4}]')->>'total_amount_minor')::bigint, 9000::bigint, 'kayak cobra por embarcación y grupo');
RESET ROLE;
SELECT is((SELECT sum(a.units) FROM public.booking_inventory_allocations a JOIN public.option_inventory_requirements r ON r.id = a.requirement_id WHERE a.booking_id = (SELECT id FROM public.bookings WHERE email = 'kayak@test.invalid') AND r.resource_type_id = '41000000-0000-4000-8000-000000000006'), 4::bigint, 'kayak también retiene cuatro chalecos');
SET LOCAL ROLE anon;
SELECT throws_ok($$SELECT public.create_inventory_booking('43000000-0000-4000-8000-000000000004', 'Demasiados kayaks', 'kayak2@test.invalid', '', 'es', '[{"option_id":"44000000-0000-4000-8000-000000000005","quantity":5,"participants":10}]')$$, 'P0001', NULL, 'rechaza kayaks, chalecos y guía cuando no hay stock suficiente');
SELECT throws_ok($$SELECT public.create_inventory_booking('43000000-0000-4000-8000-000000000004', 'Sin inventario', 'sin-stock@test.invalid', '', 'es', '[{"option_id":"44000000-0000-4000-8000-000000000006","quantity":1,"participants":1}]')$$, 'P0001', NULL, 'no permite vender opciones no vinculadas a inventario');
SELECT throws_ok($$SELECT public.create_inventory_booking('43000000-0000-4000-8000-000000000001', 'Idioma inválido', 'lang@test.invalid', '', 'xx', '[{"option_id":"44000000-0000-4000-8000-000000000001","quantity":1,"participants":1}]')$$, '22023', NULL, 'valida idioma antes de retener stock');

SELECT * FROM finish();
ROLLBACK;
