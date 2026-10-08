BEGIN;
SELECT no_plan();

SELECT ok(has_function_privilege('authenticated', 'public.claim_customer_bookings()', 'EXECUTE'), 'un cliente autenticado puede reclamar reservas con su correo verificado');
SELECT ok(has_function_privilege('authenticated', 'public.get_my_customer_bookings()', 'EXECUTE'), 'un cliente autenticado puede consultar el resumen de sus propias reservas');
SELECT ok(NOT has_function_privilege('anon', 'public.get_my_customer_bookings()', 'EXECUTE'), 'los visitantes no pueden consultar el historial de cuentas');
SELECT ok(has_function_privilege('anon', 'public.get_public_booking_tracking(uuid,text)', 'EXECUTE'), 'los visitantes pueden consultar una reserva con código y correo');
SELECT ok(NOT has_function_privilege('anon', 'public.claim_customer_bookings()', 'EXECUTE'), 'los visitantes no pueden vincular reservas a cuentas');
SELECT ok((SELECT position('lower(b.email)' in pg_get_functiondef('public.get_public_booking_tracking(uuid,text)'::regprocedure)) > 0), 'la consulta pública comprueba el correo de la reserva');
SELECT ok((SELECT position('customer_user_id = auth.uid()' in pg_get_functiondef('public.get_my_customer_bookings()'::regprocedure)) > 0), 'el historial de cuenta filtra por el usuario autenticado');
SELECT ok((SELECT position('email_confirmed_at' in pg_get_functiondef('public.claim_customer_bookings()'::regprocedure)) > 0), 'solo el correo verificado del cliente puede reclamar reservas previas');
SELECT ok(has_function_privilege('authenticated', 'public.get_organization_dashboard_metrics()', 'EXECUTE'), 'la app de empresa puede cargar indicadores operativos');
SELECT ok(NOT has_function_privilege('anon', 'public.get_organization_dashboard_metrics()', 'EXECUTE'), 'los indicadores de empresa no son públicos');

SELECT * FROM finish();
ROLLBACK;
