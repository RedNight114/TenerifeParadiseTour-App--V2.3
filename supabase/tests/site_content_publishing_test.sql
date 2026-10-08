BEGIN;
SELECT plan(10);

-- All fixtures live inside this transaction and are rolled back at the end.
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES ('00000000-0000-4000-8000-00000000002a', 'authenticated', 'authenticated', 'site-owner@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}');

INSERT INTO public.organizations (id, slug, name, platform_plan_id)
VALUES ('10000000-0000-4000-8000-00000000002a', 'site-content-test', 'Site content test', (SELECT id FROM public.platform_plans WHERE code = 'pilot-unlimited'));

INSERT INTO public.organization_domains (organization_id, host, is_primary, verified_at, hosting_status)
VALUES ('10000000-0000-4000-8000-00000000002a', 'site-content.test', true, now(), 'verified');

INSERT INTO public.organization_memberships (organization_id, user_id, email, role, status, accepted_at)
VALUES ('10000000-0000-4000-8000-00000000002a', '00000000-0000-4000-8000-00000000002a', 'site-owner@test.invalid', 'owner', 'active', now());

SET LOCAL ROLE authenticated;
SELECT set_config('request.headers', '{"x-tenant-host":"site-content.test"}', true);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000002a', true);

SELECT is(public.publish_organization_site_page('global', 'es', '{"brandTagline":"Reservas directas"}'::jsonb), 1, 'el propietario publica contenido global en español');
SELECT is((SELECT content->>'brandTagline' FROM public.organization_site_pages WHERE organization_id = '10000000-0000-4000-8000-00000000002a' AND page_key = 'global' AND locale = 'es'), 'Reservas directas', 'el contenido global queda guardado para esa empresa');
SELECT is((SELECT count(*) FROM public.organization_site_page_versions WHERE organization_id = '10000000-0000-4000-8000-00000000002a' AND page_key = 'global' AND locale = 'es'), 1::bigint, 'publicar crea una versión de historial');
SELECT is(public.publish_organization_site_page('global', 'en', '{"brandTagline":"Book direct"}'::jsonb), 1, 'el español y el inglés mantienen versiones independientes');
SELECT is(public.publish_organization_site_page('contact', 'es', '{"title":"Contacta con el equipo"}'::jsonb), 1, 'se puede publicar contenido de contacto');
SELECT is(public.publish_organization_site_page('excursions', 'en', '{"title":"Explore Tenerife"}'::jsonb), 1, 'se puede publicar contenido del catálogo');
SELECT is((SELECT count(*) FROM public.organization_site_pages WHERE organization_id = '10000000-0000-4000-8000-00000000002a'), 4::bigint, 'cada página e idioma se guarda como registro independiente');
SELECT set_config('request.headers', '{"x-tenant-host":"unknown.test"}', true);
SELECT throws_ok(
  $$SELECT public.publish_organization_site_page('global', 'es', '{"brandTagline":"Wrong tenant"}'::jsonb)$$,
  '42501', NULL, 'un host que no corresponde a una empresa no puede publicar'
);

RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.headers', '{"x-tenant-host":"site-content.test"}', true);
SELECT is((SELECT content->>'brandTagline' FROM public.organization_site_pages WHERE page_key = 'global' AND locale = 'es'), 'Reservas directas', 'el visitante puede leer el contenido publicado del tenant resuelto');
SELECT ok(NOT has_function_privilege('anon', 'public.publish_organization_site_page(text,text,jsonb)', 'EXECUTE'), 'un visitante no puede publicar contenido');

SELECT * FROM finish();
ROLLBACK;
