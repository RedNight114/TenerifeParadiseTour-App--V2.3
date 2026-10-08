BEGIN;
SELECT no_plan();

SELECT ok(to_regclass('public.organization_site_pages') IS NOT NULL, 'existe contenido publicado por empresa');
SELECT ok(to_regclass('public.organization_site_page_versions') IS NOT NULL, 'existe historial de versiones del sitio');
SELECT ok((SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.organization_site_pages'::regclass AND conname = 'organization_site_pages_page_key_check') LIKE '%global%' AND (SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.organization_site_pages'::regclass AND conname = 'organization_site_pages_page_key_check') LIKE '%contact%' AND (SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.organization_site_pages'::regclass AND conname = 'organization_site_pages_page_key_check') LIKE '%excursions%', 'contenido admite navegación global, contacto y catálogo por tenant');
SELECT ok((SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.organization_site_page_versions'::regclass AND conname = 'organization_site_page_versions_page_key_check') LIKE '%global%' AND (SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.organization_site_page_versions'::regclass AND conname = 'organization_site_page_versions_page_key_check') LIKE '%contact%' AND (SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.organization_site_page_versions'::regclass AND conname = 'organization_site_page_versions_page_key_check') LIKE '%excursions%', 'el historial acepta las mismas secciones editables');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.organization_site_pages'::regclass), 'RLS protege el contenido publicado');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.support_tickets'::regclass), 'RLS protege los tickets de soporte');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.platform_audit_events'::regclass), 'RLS protege la auditoría de QuickAgency');
SELECT ok(has_function_privilege('authenticated', 'public.publish_organization_site_page(text,text,jsonb)', 'EXECUTE'), 'administradores pueden publicar páginas por RPC');
SELECT ok(NOT has_function_privilege('anon', 'public.publish_organization_site_page(text,text,jsonb)', 'EXECUTE'), 'visitantes no pueden publicar contenido');
SELECT ok(NOT has_function_privilege('anon', 'public.restore_organization_site_page_version(uuid)', 'EXECUTE'), 'visitantes no pueden restaurar versiones');
SELECT ok(NOT has_function_privilege('anon', 'public.replace_organization_featured_excursions(bigint[])', 'EXECUTE'), 'visitantes no pueden modificar destacadas');
SELECT ok(NOT has_function_privilege('anon', 'public.reply_support_ticket(uuid,text)', 'EXECUTE'), 'visitantes no pueden responder tickets');
SELECT ok(has_function_privilege('anon', 'public.create_inventory_booking_with_terms(uuid,text,text,text,text,jsonb,text,integer,text,boolean)', 'EXECUTE'), 'compradores pueden usar el flujo de reserva con términos');
SELECT ok(has_function_privilege('authenticated', 'public.create_platform_support_access_grant(uuid,text)', 'EXECUTE'), 'la RPC de acceso temporal está disponible bajo validación de rol');
SELECT ok(NOT has_function_privilege('anon', 'public.create_platform_support_access_grant(uuid,text)', 'EXECUTE'), 'visitantes no pueden conceder acceso interno');
SELECT ok(NOT has_function_privilege('anon', 'public.get_platform_dashboard_metrics()', 'EXECUTE'), 'visitantes no pueden consultar métricas internas');
SELECT ok(has_function_privilege('authenticated', 'public.get_platform_company_readiness()', 'EXECUTE'), 'administradores autenticados pueden consultar señales de puesta en marcha');
SELECT ok(NOT has_function_privilege('anon', 'public.get_platform_company_readiness()', 'EXECUTE'), 'visitantes no pueden consultar señales internas de empresas');
SELECT ok(has_function_privilege('authenticated', 'public.get_platform_active_owner_status(uuid[])', 'EXECUTE'), 'administradores pueden comprobar si una empresa ya tiene propietario');
SELECT ok(NOT has_function_privilege('anon', 'public.get_platform_active_owner_status(uuid[])', 'EXECUTE'), 'visitantes no pueden consultar propietarios de la plataforma');
SELECT throws_ok(
  $$SELECT public.create_inventory_booking_with_terms(NULL, '', '', '', 'es', '[]'::jsonb, NULL, NULL, 'es', false)$$,
  '22023', NULL, 'la reserva rechaza la ausencia de aceptación de términos'
);

SELECT * FROM finish();
ROLLBACK;
