BEGIN;
SELECT plan(9);

SELECT ok(has_function_privilege('authenticated', 'public.update_category_catalog(bigint,text,text,text,text,text,text,text,text,boolean,integer)', 'EXECUTE'), 'los miembros autenticados pueden invocar el RPC protegido de actualización');
SELECT ok(NOT has_function_privilege('anon', 'public.update_category_catalog(bigint,text,text,text,text,text,text,text,text,boolean,integer)', 'EXECUTE'), 'los visitantes no pueden renombrar categorías');
SELECT ok(NOT has_function_privilege('anon', 'public.delete_unused_category(bigint)', 'EXECUTE'), 'los visitantes no pueden borrar categorías');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-4000-8000-0000000000e1', 'authenticated', 'authenticated', 'category-owner@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-4000-8000-0000000000e2', 'authenticated', 'authenticated', 'category-guide@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}');

INSERT INTO public.organizations (id, slug, name, platform_plan_id)
VALUES ('10000000-0000-4000-8000-0000000000e1', 'category-manager-test', 'Category manager test', (select id from public.platform_plans where code = 'pilot-unlimited'));
INSERT INTO public.organization_domains (organization_id, host, is_primary, verified_at, hosting_status)
VALUES ('10000000-0000-4000-8000-0000000000e1', 'category-manager.test', true, now(), 'verified');
INSERT INTO public.organization_memberships (organization_id, user_id, email, role, status, accepted_at)
VALUES
  ('10000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-0000000000e1', 'category-owner@test.invalid', 'owner', 'active', now()),
  ('10000000-0000-4000-8000-0000000000e1', '00000000-0000-4000-8000-0000000000e2', 'category-guide@test.invalid', 'guide', 'active', now());

INSERT INTO public.categories (id, organization_id, name_es, name_en, name_de, color)
VALUES (888001, '10000000-0000-4000-8000-0000000000e1', 'Aventura anterior', 'Old adventure', 'Altes Abenteuer', '#0F766E');
INSERT INTO public.excursions (id, organization_id, name_es, name_en, name_de, price, category)
VALUES
  (888001, '10000000-0000-4000-8000-0000000000e1', 'Ruta por el bosque', 'Forest route', 'Waldrundweg', 20, 'Aventura anterior'),
  (888002, '10000000-0000-4000-8000-0000000000e1', 'Ruta heredada', 'Legacy route', 'Alte Route', 20, '888001');

SET LOCAL ROLE authenticated;
SELECT set_config('request.headers', '{"x-tenant-host":"category-manager.test"}', true);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000e1', true);
SELECT is(
  public.update_category_catalog(888001, 'Aventura renovada', 'Updated adventure', 'Updated adventure', null, null, null, null, '#0F766E', true, 0),
  2,
  'renombrar una categoría actualiza excursiones vinculadas por nombre y por identificador legado'
);
SELECT is((SELECT count(*) FROM public.excursions WHERE organization_id = '10000000-0000-4000-8000-0000000000e1' AND category = 'Aventura renovada'), 2::bigint, 'las dos excursiones siguen vinculadas a la categoría renombrada');
SELECT throws_ok($$SELECT public.delete_unused_category(888001)$$, '23503', NULL, 'no se puede eliminar una categoría todavía asignada');

INSERT INTO public.categories (id, organization_id, name_es, name_en, name_de, color)
VALUES (888002, '10000000-0000-4000-8000-0000000000e1', 'Sin uso', 'Unused', 'Unused', '#0F766E');
SELECT lives_ok($$SELECT public.delete_unused_category(888002)$$, 'se puede eliminar una categoría sin excursiones');
SELECT ok(NOT EXISTS (SELECT 1 FROM public.categories WHERE id = 888002), 'el borrado seguro elimina la categoría sin uso');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000e2', true);
SELECT throws_ok(
  $$SELECT public.update_category_catalog(888001, 'Sin permiso', 'No permission', 'No permission', null, null, null, null, '#0F766E', true, 0)$$,
  '42501', NULL, 'una persona con rol de guía no puede administrar categorías'
);

SELECT * FROM finish();
ROLLBACK;
