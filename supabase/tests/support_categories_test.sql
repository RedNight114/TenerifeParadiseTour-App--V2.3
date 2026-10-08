BEGIN;
SELECT no_plan();

SELECT ok(
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'support_tickets' AND column_name = 'category'),
  'cada ticket guarda un tema para clasificar la solicitud'
);
SELECT ok(NOT has_function_privilege('anon', 'public.create_support_ticket(text, text, text)', 'EXECUTE'), 'visitantes no pueden crear solicitudes de soporte');
SELECT ok(has_function_privilege('authenticated', 'public.create_support_ticket(text, text, text)', 'EXECUTE'), 'usuarios autenticados pueden enviar tickets categorizados; el RPC verifica su rol');
SELECT ok(NOT has_function_privilege('anon', 'public.set_platform_support_ticket_priority(uuid, text)', 'EXECUTE'), 'visitantes no pueden gestionar prioridad');
SELECT ok(has_function_privilege('authenticated', 'public.set_platform_support_ticket_priority(uuid, text)', 'EXECUTE'), 'el RPC de prioridad queda disponible para aplicar la comprobación interna de administrador');

SELECT * FROM finish();
ROLLBACK;
