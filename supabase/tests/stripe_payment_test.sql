BEGIN;
SELECT no_plan();

INSERT INTO public.organizations (id, slug, name, platform_plan_id, stripe_account_id, stripe_charges_enabled)
VALUES ('90000000-0000-4000-8000-000000000001', 'stripe-payment-test', 'Stripe payment test', (select id from public.platform_plans where code = 'pilot-unlimited'), 'acct_test_example', true);
INSERT INTO public.organization_domains (organization_id, host, is_primary, verified_at, hosting_status)
VALUES ('90000000-0000-4000-8000-000000000001', 'stripe.test', true, now(), 'verified');
INSERT INTO public.excursions (id, name_es, name_en, name_de, price, category, organization_id, is_published)
VALUES (900001, 'Pago test', 'Payment test', 'Zahlungstest', 12, 'test', '90000000-0000-4000-8000-000000000001', true);
INSERT INTO public.bookings (
  id, excursion_id, organization_id, customer_name, email, preferred_date, number_of_people,
  status, hold_expires_at, total_amount_minor, currency_code, public_reference
) VALUES
  (900001, 900001, '90000000-0000-4000-8000-000000000001', 'Cliente pagado', 'paid@test.invalid', current_date + 20, 1,
    'pending', now() + interval '31 minutes', 1200, 'EUR', '90000000-0000-4000-8000-000000000001'),
  (900002, 900001, '90000000-0000-4000-8000-000000000001', 'Cliente fallido', 'failed@test.invalid', current_date + 20, 1,
    'pending', now() + interval '31 minutes', 1200, 'EUR', '90000000-0000-4000-8000-000000000002'),
  (900003, 900001, '90000000-0000-4000-8000-000000000001', 'Cliente tardío', 'late@test.invalid', current_date + 20, 1,
    'expired', now() - interval '1 minute', 1200, 'EUR', '90000000-0000-4000-8000-000000000003');
INSERT INTO public.payment_attempts (
  id, organization_id, booking_id, provider_session_id, connected_account_id, status,
  amount_minor, currency_code, checkout_url, expires_at
) VALUES
  ('91000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001', 900001, 'cs_test_paid', 'acct_test_example', 'pending', 1200, 'EUR', 'https://checkout.stripe.test/paid', now()+interval '30 minutes'),
  ('91000000-0000-4000-8000-000000000002', '90000000-0000-4000-8000-000000000001', 900002, 'cs_test_failed', 'acct_test_example', 'pending', 1200, 'EUR', 'https://checkout.stripe.test/failed', now()+interval '30 minutes'),
  ('91000000-0000-4000-8000-000000000003', '90000000-0000-4000-8000-000000000001', 900003, 'cs_test_late', 'acct_test_example', 'pending', 1200, 'EUR', 'https://checkout.stripe.test/late', now()-interval '1 minute');

SET LOCAL ROLE anon;
SELECT set_config('request.headers', '{"x-tenant-host":"stripe.test"}', true);
SELECT ok(public.get_public_payment_readiness(), 'la empresa muestra pagos habilitados solo si la cuenta conectada está activa');
SELECT ok(has_function_privilege('anon', 'public.get_public_payment_status(uuid)', 'EXECUTE'), 'el comprador puede consultar estado con su referencia secreta');
RESET ROLE;

SET LOCAL ROLE service_role;
SELECT is(public.apply_stripe_checkout_event('evt_test_paid', 'checkout.session.completed', 'cs_test_paid', 'pi_test_paid', 'acct_test_example', 1200, 'EUR', true), 'confirmed', 'el pago verificado confirma la reserva retenida');
SELECT is(public.apply_stripe_checkout_event('evt_test_paid', 'checkout.session.completed', 'cs_test_paid', 'pi_test_paid', 'acct_test_example', 1200, 'EUR', true), 'duplicate', 'un webhook repetido es idempotente');
SELECT is((SELECT status FROM public.bookings WHERE id=900001), 'confirmed', 'la repetición no altera la reserva ya confirmada');
SELECT is(public.apply_stripe_checkout_event('evt_test_fail', 'checkout.session.expired', 'cs_test_failed', null, 'acct_test_example', 1200, 'EUR', false), 'failed', 'una sesión vencida libera la reserva pendiente');
SELECT is((SELECT status FROM public.bookings WHERE id=900002), 'cancelled', 'el pago fallido no queda como reserva confirmada');
SELECT is(public.apply_stripe_checkout_event('evt_test_late', 'checkout.session.async_payment_succeeded', 'cs_test_late', 'pi_test_late', 'acct_test_example', 1200, 'EUR', true), 'requires_refund', 'un pago tardío se marca para compensación y no confirma una plaza vencida');
SELECT is((SELECT status FROM public.payment_attempts WHERE id='91000000-0000-4000-8000-000000000003'), 'requires_refund', 'la compensación tardía queda visible como estado financiero');
SELECT is(public.apply_stripe_checkout_event('evt_test_unknown', 'checkout.session.completed', 'cs_test_unknown', 'pi_test_unknown', 'acct_test_example', 1200, 'EUR', true), 'unknown_session', 'un webhook que llega antes del registro se puede reintentar');
SELECT is((SELECT count(*) FROM public.stripe_webhook_events WHERE event_id='evt_test_unknown'), 0::bigint, 'el evento prematuro no se marca como procesado');
SELECT throws_ok(
  $$SELECT public.apply_stripe_checkout_event('evt_test_mismatch', 'checkout.session.completed', 'cs_test_paid', 'pi_test_paid', 'acct_test_example', 1201, 'EUR', true)$$,
  '23514', NULL, 'un importe diferente al intento almacenado se rechaza'
);
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
