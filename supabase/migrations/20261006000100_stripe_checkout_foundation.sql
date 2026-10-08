-- Stripe Connect checkout foundation. This migration stores identifiers and
-- payment state only; card data remains with Stripe.
alter table public.organizations
  add column if not exists stripe_account_id text,
  add column if not exists stripe_charges_enabled boolean not null default false,
  add column if not exists stripe_details_submitted boolean not null default false;

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  booking_id bigint not null,
  provider text not null default 'stripe' check (provider = 'stripe'),
  provider_session_id text unique,
  provider_payment_intent_id text,
  provider_refund_id text,
  connected_account_id text not null,
  status text not null check (status in ('created','pending','succeeded','failed','refunded','requires_refund')),
  amount_minor bigint not null check (amount_minor > 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  checkout_url text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_attempts_booking_same_org_fk foreign key (booking_id, organization_id)
    references public.bookings(id, organization_id) on delete restrict
);
create index if not exists payment_attempts_booking_created_idx
  on public.payment_attempts (booking_id, created_at desc);
create unique index if not exists payment_attempts_one_open_per_booking_idx
  on public.payment_attempts (booking_id) where status in ('created','pending');
alter table public.payment_attempts enable row level security;
create policy payment_attempts_manager_read on public.payment_attempts for select to authenticated
  using (organization_id = (select public.current_public_organization_id())
    and public.has_organization_role(organization_id, array['owner','admin','booking_manager']));
revoke all on public.payment_attempts from anon, authenticated;
grant select on public.payment_attempts to authenticated;
grant all on public.payment_attempts to service_role;
grant update (stripe_account_id, stripe_charges_enabled, stripe_details_submitted)
  on public.organizations to service_role;

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);
alter table public.stripe_webhook_events enable row level security;
revoke all on public.stripe_webhook_events from anon, authenticated;
grant all on public.stripe_webhook_events to service_role;

create or replace function public.get_public_checkout_context(p_reference uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare tenant_id uuid; result jsonb;
begin
  tenant_id := (select public.current_public_organization_id());
  if tenant_id is null then raise exception 'No se pudo resolver la empresa.' using errcode = '42501'; end if;
  select jsonb_build_object(
    'booking_id', b.id,
    'reference', b.public_reference,
    'amount_minor', b.total_amount_minor,
    'currency_code', b.currency_code,
    'customer_email', b.email,
    'organization_id', o.id,
    'organization_name', o.name,
    'stripe_account_id', o.stripe_account_id,
    'expires_at', b.hold_expires_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', bi.option_name,
        'quantity', bi.quantity,
        'amount_minor', bi.line_total_minor
      ) order by bi.id)
      from public.booking_items bi
      where bi.booking_id = b.id and bi.organization_id = b.organization_id
    ), '[]'::jsonb)
  ) into result
  from public.bookings b
  join public.organizations o on o.id = b.organization_id
  where b.public_reference = p_reference and b.organization_id = tenant_id
    and b.status = 'pending' and b.departure_id is not null
    and b.hold_expires_at > now() and b.total_amount_minor > 0
    and o.stripe_account_id is not null and o.stripe_charges_enabled;
  if result is null then raise exception 'Reserva vencida o pagos no configurados para esta empresa.' using errcode = 'P0001'; end if;
  return result;
end;
$$;
revoke execute on function public.get_public_checkout_context(uuid) from public;
grant execute on function public.get_public_checkout_context(uuid) to anon, authenticated;

create or replace function public.get_public_payment_readiness()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organizations o
    where o.id = (select public.current_public_organization_id())
      and o.stripe_account_id is not null and o.stripe_charges_enabled
  );
$$;
revoke execute on function public.get_public_payment_readiness() from public;
grant execute on function public.get_public_payment_readiness() to anon, authenticated;

create or replace function public.get_public_payment_status(p_reference uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'booking_status', b.status,
    'payment_status', coalesce((
      select pa.status from public.payment_attempts pa
      where pa.booking_id = b.id and pa.organization_id = b.organization_id
      order by pa.created_at desc limit 1
    ), 'not_started')
  )
  from public.bookings b
  where b.public_reference = p_reference
    and b.organization_id = (select public.current_public_organization_id());
$$;
revoke execute on function public.get_public_payment_status(uuid) from public;
grant execute on function public.get_public_payment_status(uuid) to anon, authenticated;

-- Never trust the browser return URL to confirm a reservation. Only the
-- server's verified Stripe webhook may call this function with service_role.
create or replace function public.apply_stripe_checkout_event(
  p_event_id text,
  p_event_type text,
  p_session_id text,
  p_payment_intent_id text,
  p_connected_account_id text,
  p_amount_minor bigint,
  p_currency_code text,
  p_succeeded boolean
)
returns text language plpgsql security definer set search_path = '' as $$
declare attempt public.payment_attempts%rowtype; booking_row public.bookings%rowtype;
begin
  if coalesce(p_event_id,'') = '' or coalesce(p_session_id,'') = '' then
    raise exception 'Invalid Stripe event.' using errcode = '22023';
  end if;
  insert into public.stripe_webhook_events (event_id, event_type)
  values (p_event_id, p_event_type) on conflict (event_id) do nothing;
  if not found then return 'duplicate'; end if;

  select * into attempt from public.payment_attempts
  where provider_session_id = p_session_id for update;
  if not found then
    -- The event can race the final session-id write. Let Stripe retry it.
    delete from public.stripe_webhook_events where event_id = p_event_id;
    return 'unknown_session';
  end if;
  if attempt.connected_account_id <> p_connected_account_id
    or attempt.amount_minor <> p_amount_minor
    or lower(attempt.currency_code) <> lower(p_currency_code) then
    update public.stripe_webhook_events set processed_at = now() where event_id = p_event_id;
    raise exception 'Stripe event does not match stored payment.' using errcode = '23514';
  end if;

  select * into booking_row from public.bookings where id = attempt.booking_id
    and organization_id = attempt.organization_id for update;
  if not found then raise exception 'Payment booking not found.' using errcode = '23503'; end if;

  update public.payment_attempts set
    provider_payment_intent_id = coalesce(p_payment_intent_id, provider_payment_intent_id),
    status = case when p_succeeded then 'succeeded' else 'failed' end,
    updated_at = now()
  where id = attempt.id;

  if p_succeeded then
    if booking_row.status = 'pending' and booking_row.hold_expires_at > now() then
      update public.bookings set status = 'confirmed'
      where id = booking_row.id and organization_id = booking_row.organization_id;
      update public.stripe_webhook_events set processed_at = now() where event_id = p_event_id;
      return 'confirmed';
    end if;
    update public.payment_attempts set status = 'requires_refund', updated_at = now() where id = attempt.id;
    update public.stripe_webhook_events set processed_at = now() where event_id = p_event_id;
    return 'requires_refund';
  end if;

  if booking_row.status = 'pending' then
    update public.bookings set status = 'cancelled'
    where id = booking_row.id and organization_id = booking_row.organization_id;
  end if;
  update public.stripe_webhook_events set processed_at = now() where event_id = p_event_id;
  return 'failed';
end;
$$;
revoke execute on function public.apply_stripe_checkout_event(text,text,text,text,text,bigint,text,boolean) from public, anon, authenticated;
grant execute on function public.apply_stripe_checkout_event(text,text,text,text,text,bigint,text,boolean) to service_role;
