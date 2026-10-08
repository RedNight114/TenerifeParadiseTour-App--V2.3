BEGIN;
SELECT plan(8);

-- Requires supabase/fixtures/legacy_migration_seed.sql before migration 002.
SELECT is((SELECT count(*) FROM public.organizations WHERE slug = 'tenerife-paradise-tours'), 1::bigint, 'se crea la empresa inicial');
SELECT is((SELECT count(*) FROM public.categories c JOIN public.organizations o ON o.id = c.organization_id WHERE c.id = 901 AND o.slug = 'tenerife-paradise-tours'), 1::bigint, 'se conserva la categoría antigua bajo la empresa inicial');
SELECT is((SELECT count(*) FROM public.excursions e JOIN public.organizations o ON o.id = e.organization_id WHERE e.id = 9001 AND o.slug = 'tenerife-paradise-tours'), 1::bigint, 'se conserva la excursión antigua bajo la empresa inicial');
SELECT is((SELECT count(*) FROM public.predefined_services s JOIN public.organizations o ON o.id = s.organization_id WHERE s.id = 701 AND o.slug = 'tenerife-paradise-tours'), 1::bigint, 'se conserva el servicio antiguo bajo la empresa inicial');
SELECT is((SELECT count(*) FROM public.bookings b JOIN public.organizations o ON o.id = b.organization_id JOIN public.excursions e ON e.id = b.excursion_id AND e.organization_id = b.organization_id WHERE b.id = 90001 AND o.slug = 'tenerife-paradise-tours'), 1::bigint, 'se conserva la reserva y sigue ligada a una excursión de su empresa');
SELECT is((SELECT count(*) FROM public.contacts c JOIN public.organizations o ON o.id = c.organization_id WHERE c.id = 90002 AND o.slug = 'tenerife-paradise-tours'), 1::bigint, 'se conserva el contacto antiguo bajo la empresa inicial');
SELECT is((SELECT count(*) FROM public.organization_memberships m JOIN public.organizations o ON o.id = m.organization_id WHERE m.user_id = '30000000-0000-4000-8000-00000000000a' AND m.role = 'owner' AND m.status = 'active' AND o.slug = 'tenerife-paradise-tours'), 1::bigint, 'el administrador antiguo se convierte en propietario activo');
SELECT ok(to_regclass('public.app_admins') IS NULL, 'se elimina la tabla de administradores antigua después de migrar');

SELECT * FROM finish();
ROLLBACK;
