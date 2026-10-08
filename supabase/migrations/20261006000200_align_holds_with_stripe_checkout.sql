-- Stripe Checkout's shortest supported session is 30 minutes. Keep a one-minute
-- server/network buffer on the hold; the signed expired event releases stock
-- at the 30-minute session expiry, and the DB timeout is a fallback.
do $migration$
declare
  booking_function text;
  old_expression constant text := 'interval ''10 minutes''';
begin
  booking_function := pg_get_functiondef(
    'public.create_inventory_booking(uuid,text,text,text,text,jsonb,text)'::regprocedure
  );
  if position(old_expression in booking_function) = 0 then
    raise exception 'Expected 10-minute hold expression was not found; review the booking function before applying this migration.';
  end if;
  execute replace(booking_function, old_expression, 'interval ''31 minutes''');
end;
$migration$;
