-- Actionable operational KPIs. These are counts and paid Stripe volume; they
-- do not infer traffic/conversion or treat unpaid reservations as revenue.
create or replace function public.get_organization_dashboard_metrics()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  tenant_id uuid;
  can_see_payments boolean;
begin
  tenant_id := (select public.current_public_organization_id());
  if tenant_id is null or not public.has_organization_role(tenant_id, array['owner','admin','catalog_manager','booking_manager','guide']) then
    raise exception 'Company dashboard access required' using errcode = '42501';
  end if;
  can_see_payments := public.has_organization_role(tenant_id, array['owner','admin','booking_manager']);

  return jsonb_build_object(
    'bookings_total', (select count(*) from public.bookings b where b.organization_id = tenant_id),
    'bookings_last_30_days', (select count(*) from public.bookings b where b.organization_id = tenant_id and b.created_at >= now() - interval '30 days'),
    'bookings_pending', (select count(*) from public.bookings b where b.organization_id = tenant_id and b.status = 'pending'),
    'bookings_confirmed_this_month', (select count(*) from public.bookings b where b.organization_id = tenant_id and b.status = 'confirmed' and b.created_at >= date_trunc('month', now())),
    'bookings_cancelled_last_30_days', (select count(*) from public.bookings b where b.organization_id = tenant_id and b.status in ('cancelled','expired') and b.created_at >= now() - interval '30 days'),
    'published_excursions', (select count(*) from public.excursions e where e.organization_id = tenant_id and e.is_published),
    'upcoming_departures', (select count(*) from public.excursion_departures d where d.organization_id = tenant_id and d.status = 'scheduled' and d.starts_at > now() and d.sales_cutoff_at > now()),
    'payments_received_30_days_minor', case when can_see_payments then (
      select coalesce(sum(pa.amount_minor), 0) from public.payment_attempts pa
      where pa.organization_id = tenant_id and pa.status = 'succeeded' and pa.created_at >= now() - interval '30 days'
    ) else null end,
    'currency_code', (select o.currency_code from public.organizations o where o.id = tenant_id)
  );
end;
$$;
revoke all on function public.get_organization_dashboard_metrics() from public;
grant execute on function public.get_organization_dashboard_metrics() to authenticated;

create or replace function public.get_platform_dashboard_metrics()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  return jsonb_build_object(
    'organizations', (select count(*) from public.organizations),
    'active_organizations', (select count(*) from public.organizations where status = 'active'),
    'pending_organizations', (select count(*) from public.organizations where status = 'pending'),
    'suspended_organizations', (select count(*) from public.organizations where status = 'suspended'),
    'organizations_created_30_days', (select count(*) from public.organizations where created_at >= now() - interval '30 days'),
    'companies_without_active_owner', (select count(*) from public.organizations o where not exists (
      select 1 from public.organization_memberships m where m.organization_id = o.id and m.role = 'owner' and m.status = 'active'
    )),
    'unverified_domains', (select count(*) from public.organization_domains where verified_at is null),
    'bookings', (select count(*) from public.bookings),
    'bookings_30_days', (select count(*) from public.bookings where created_at >= now() - interval '30 days'),
    'confirmed_bookings_30_days', (select count(*) from public.bookings where status = 'confirmed' and created_at >= now() - interval '30 days'),
    'successful_stripe_payments_30_days', (select count(*) from public.payment_attempts where status = 'succeeded' and created_at >= now() - interval '30 days'),
    'excursions', (select count(*) from public.excursions),
    'published_excursions', (select count(*) from public.excursions where is_published),
    'open_tickets', (select count(*) from public.support_tickets where status <> 'resolved'),
    'high_priority_tickets', (select count(*) from public.support_tickets where status <> 'resolved' and priority = 'high')
  );
end;
$$;
revoke all on function public.get_platform_dashboard_metrics() from public;
grant execute on function public.get_platform_dashboard_metrics() to authenticated;
