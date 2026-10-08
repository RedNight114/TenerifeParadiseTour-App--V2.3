BEGIN;
SELECT no_plan();

SELECT ok(NOT has_function_privilege('anon', 'public.get_my_organization_workspaces()', 'EXECUTE'), 'visitantes no pueden enumerar espacios de empresa');
SELECT ok(has_function_privilege('authenticated', 'public.get_my_organization_workspaces()', 'EXECUTE'), 'usuarios autenticados pueden enumerar solo sus espacios');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-4000-8000-0000000000e1', 'authenticated', 'authenticated', 'owner-workspace@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-4000-8000-0000000000e2', 'authenticated', 'authenticated', 'other-workspace@test.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}');

INSERT INTO public.platform_admins (user_id) VALUES ('00000000-0000-4000-8000-0000000000e1');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000e1', true);
SELECT set_config('request.jwt.claim.email', 'owner-workspace@test.invalid', true);
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000e1","email":"owner-workspace@test.invalid","role":"authenticated"}', true);

CREATE TEMP TABLE created_org AS
SELECT public.create_platform_organization('Workspace sin dominio', 'workspace-pending-test', '') AS id;

SELECT is((SELECT status FROM public.organizations WHERE id = (SELECT id FROM created_org)), 'pending', 'el alta crea la empresa pendiente sin dominio');
SELECT is((SELECT count(*)::integer FROM public.organization_domains WHERE organization_id = (SELECT id FROM created_org)), 0, 'no se inventa un dominio cuando todavía no existe');

SELECT is(public.platform_assign_organization_owner((SELECT id FROM created_org), 'owner-workspace@test.invalid'), true, 'la consola QuickAgency puede preparar al propietario antes de verificar el dominio');

SELECT set_config('request.headers', jsonb_build_object('x-admin-organization-id', (SELECT id::text FROM created_org), 'x-tenant-host', 'central.quickagency.invalid')::text, true);
SELECT is(public.current_public_organization_id(), NULL::uuid, 'una invitación pendiente no habilita el contexto tenant');
SELECT is((SELECT count(*)::integer FROM public.get_my_organization_workspaces() WHERE organization_id = (SELECT id FROM created_org) AND membership_status = 'invited'), 1, 'el propietario puede ver su invitación pendiente desde QuickAgency');
SELECT is(public.accept_organization_invitation((SELECT id FROM created_org)), 1, 'el propietario acepta la invitación desde el dominio central aunque la empresa esté pendiente');
SELECT is(public.current_public_organization_id(), (SELECT id FROM created_org), 'la membresía activa permite administrar la empresa pendiente en contexto central');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000e2', true);
SELECT set_config('request.jwt.claim.email', 'other-workspace@test.invalid', true);
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000e2","email":"other-workspace@test.invalid","role":"authenticated"}', true);
SELECT is(public.current_public_organization_id(), NULL::uuid, 'un usuario ajeno no puede seleccionar un tenant manipulando el contexto');
SELECT is((SELECT count(*)::integer FROM public.get_my_organization_workspaces() WHERE organization_id = (SELECT id FROM created_org)), 0, 'la lista de espacios no filtra membresías de otras personas');
SELECT throws_ok(
  format('SELECT public.accept_organization_invitation(%L::uuid)', (SELECT id FROM created_org)),
  '42501', NULL, 'un usuario ajeno no puede aceptar la invitación'
);

RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.headers', '{"x-admin-organization-id":"10000000-0000-4000-8000-0000000000e1","x-tenant-host":"central.quickagency.invalid"}', true);
SELECT is(public.current_public_organization_id(), NULL::uuid, 'un header manipulado no concede contexto privado a visitantes');

SELECT * FROM finish();
ROLLBACK;
