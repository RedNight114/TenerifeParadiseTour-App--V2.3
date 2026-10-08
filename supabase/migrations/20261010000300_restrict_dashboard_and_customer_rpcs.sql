-- Supabase's default function grants include anon. Explicitly remove it from
-- account and internal dashboard functions; keep only the two-factor guest
-- lookup available to public visitors.
revoke all on function public.claim_customer_bookings() from anon;
revoke all on function public.get_my_customer_bookings() from anon;
revoke all on function public.get_organization_dashboard_metrics() from anon;

revoke all on function public.get_public_booking_tracking(uuid, text) from anon, authenticated, service_role;
grant execute on function public.get_public_booking_tracking(uuid, text) to anon, authenticated;

revoke all on function public.claim_customer_bookings() from public;
revoke all on function public.get_my_customer_bookings() from public;
revoke all on function public.get_organization_dashboard_metrics() from public;
grant execute on function public.claim_customer_bookings() to authenticated;
grant execute on function public.get_my_customer_bookings() to authenticated;
grant execute on function public.get_organization_dashboard_metrics() to authenticated;
