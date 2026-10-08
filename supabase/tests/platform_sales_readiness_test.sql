BEGIN;
SELECT no_plan();

SELECT ok(NOT has_function_privilege('anon', 'public.get_platform_company_readiness()', 'EXECUTE'), 'visitantes no pueden consultar el checklist interno de empresas');
SELECT ok(has_function_privilege('authenticated', 'public.get_platform_company_readiness()', 'EXECUTE'), 'el RPC queda limitado a sesiones autenticadas con rol comprobado');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES ('00000000-0000-4000-8000-0000000000fa', 'authenticated', 'authenticated', 'readiness-admin@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}');
INSERT INTO public.platform_admins (user_id) VALUES ('00000000-0000-4000-8000-0000000000fa');
INSERT INTO public.organizations (id, slug, name, platform_plan_id)
VALUES ('10000000-0000-4000-8000-0000000000fa', 'readiness-test', 'Readiness test', (SELECT id FROM public.platform_plans WHERE code = 'pilot-unlimited'));
INSERT INTO public.organization_domains (organization_id, host, is_primary, verified_at, hosting_status)
VALUES ('10000000-0000-4000-8000-0000000000fa', 'readiness.test', true, now(), 'verified');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000fa', true);
SELECT is((SELECT has_terms_es FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), false, 'sin contenido publicado, términos en español no se consideran listos');
SELECT is((SELECT has_terms_en FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), false, 'sin contenido publicado, términos en inglés no se consideran listos');
SELECT is((SELECT has_privacy_es FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), false, 'sin contenido publicado, privacidad ES no se considera lista');
SELECT is((SELECT has_privacy_en FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), false, 'sin contenido publicado, privacidad EN no se considera lista');
SELECT is((SELECT has_published_excursion FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), false, 'sin catálogo publicado, la empresa no aparece preparada');
SELECT is((SELECT has_active_product_option FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), false, 'sin opción activa, la excursión no se considera reservable');
SELECT is((SELECT has_upcoming_departure FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), false, 'sin salida futura no se considera que pueda recibir reservas');

RESET ROLE;
INSERT INTO public.organization_site_pages (organization_id, page_key, locale, content, version)
VALUES ('10000000-0000-4000-8000-0000000000fa', 'terms', 'es', '{"title":"Condiciones","intro":"Condiciones de reserva","sections":[{"title":"Reservas","body":"Texto"}]}'::jsonb, 1);
SELECT is((SELECT has_terms_es FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), true, 'términos ES solo figuran listos cuando tienen título, introducción y secciones');

INSERT INTO public.organization_site_pages (organization_id, page_key, locale, content, version)
VALUES ('10000000-0000-4000-8000-0000000000fa', 'terms', 'en', '{"title":"Terms","intro":"Booking terms","sections":[{"title":"Bookings","body":"Text"}]}'::jsonb, 1);
INSERT INTO public.excursions (id, name_es, name_en, name_de, price, category, organization_id, is_published)
VALUES (900001, 'Excursión test', 'Test tour', 'Test Tour', 20, '101', '10000000-0000-4000-8000-0000000000fa', true);
INSERT INTO public.excursion_departures (organization_id, excursion_id, starts_at, ends_at, sales_cutoff_at)
VALUES ('10000000-0000-4000-8000-0000000000fa', 900001, now() + interval '5 days', now() + interval '5 days 2 hours', now() + interval '4 days');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000fa', true);
SELECT is((SELECT has_terms_en FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), true, 'términos EN aparecen listos cuando están completos');
SELECT is((SELECT has_published_excursion FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), true, 'se detecta la excursión publicada de la empresa');
SELECT is((SELECT has_active_product_option FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), false, 'una excursión publicada todavía no basta sin opción comercial activa');
RESET ROLE;
INSERT INTO public.organization_site_pages (organization_id, page_key, locale, content, version)
VALUES
  ('10000000-0000-4000-8000-0000000000fa', 'privacy', 'es', '{"title":"Privacidad","intro":"Política de privacidad","sections":[{"title":"Datos","body":"Texto"}]}'::jsonb, 1),
  ('10000000-0000-4000-8000-0000000000fa', 'privacy', 'en', '{"title":"Privacy","intro":"Privacy policy","sections":[{"title":"Data","body":"Text"}]}'::jsonb, 1);
INSERT INTO public.product_options (organization_id, excursion_id, name, pricing_mode, unit_price_minor, currency_code)
VALUES ('10000000-0000-4000-8000-0000000000fa', 900001, 'Opción estándar', 'per_participant', 2000, 'EUR');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000fa', true);
SELECT is((SELECT has_privacy_es FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), true, 'política de privacidad ES completa detectada');
SELECT is((SELECT has_privacy_en FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), true, 'política de privacidad EN completa detectada');
SELECT is((SELECT has_active_product_option FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), true, 'opción comercial activa en excursión publicada detectada');
SELECT is((SELECT has_upcoming_departure FROM public.get_platform_company_readiness() WHERE organization_id = '10000000-0000-4000-8000-0000000000fa'), true, 'se detecta la próxima salida aún abierta a ventas');

SELECT * FROM finish();
ROLLBACK;
