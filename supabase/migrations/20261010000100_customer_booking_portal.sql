-- Customer accounts are separate from company memberships. A customer can only
-- see their own reservation summary; guest lookup additionally requires email.
alter table public.bookings
  add column if not exists customer_user_id uuid references auth.users(id) on delete set null;

create index if not exists bookings_customer_account_idx
  on public.bookings (organization_id, customer_user_id, created_at desc)
  where customer_user_id is not null;

create or replace function public.claim_customer_bookings()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  tenant_id uuid;
  customer_email text;
  claimed_count integer;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para consultar tus reservas.' using errcode = '42501'; end if;
  tenant_id := (select public.current_public_organization_id());
  select lower(email) into customer_email from auth.users
  where id = auth.uid() and email_confirmed_at is not null;
  if tenant_id is null or customer_email is null then return 0; end if;

  update public.bookings
  set customer_user_id = auth.uid()
  where organization_id = tenant_id
    and customer_user_id is null
    and lower(email) = customer_email;
  get diagnostics claimed_count = row_count;
  return claimed_count;
end;
$$;

create or replace function public.get_my_customer_bookings()
returns table (
  reference uuid,
  status text,
  preferred_date date,
  number_of_people integer,
  created_at timestamptz,
  excursion_name_es text,
  excursion_name_en text,
  amount_minor bigint,
  currency_code text,
  payment_status text
)
language sql stable security definer set search_path = '' as $$
  select b.public_reference, b.status, b.preferred_date, b.number_of_people, b.created_at,
    e.name_es, e.name_en, b.total_amount_minor, b.currency_code,
    coalesce((
      select pa.status from public.payment_attempts pa
      where pa.booking_id = b.id and pa.organization_id = b.organization_id
      order by pa.created_at desc limit 1
    ), 'not_started')
  from public.bookings b
  left join public.excursions e on e.id = b.excursion_id and e.organization_id = b.organization_id
  where auth.uid() is not null
    and b.organization_id = (select public.current_public_organization_id())
    and b.customer_user_id = auth.uid()
  order by b.created_at desc;
$$;

create or replace function public.get_public_booking_tracking(p_reference uuid, p_email text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  tenant_id uuid;
  result jsonb;
begin
  tenant_id := (select public.current_public_organization_id());
  if tenant_id is null or p_reference is null
    or length(trim(coalesce(p_email, ''))) > 254
    or p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    return null;
  end if;

  select jsonb_build_object(
    'reference', b.public_reference,
    'status', b.status,
    'preferred_date', b.preferred_date,
    'number_of_people', b.number_of_people,
    'created_at', b.created_at,
    'excursion_name_es', e.name_es,
    'excursion_name_en', e.name_en,
    'amount_minor', b.total_amount_minor,
    'currency_code', b.currency_code,
    'payment_status', coalesce((
      select pa.status from public.payment_attempts pa
      where pa.booking_id = b.id and pa.organization_id = b.organization_id
      order by pa.created_at desc limit 1
    ), 'not_started')
  ) into result
  from public.bookings b
  left join public.excursions e on e.id = b.excursion_id and e.organization_id = b.organization_id
  where b.organization_id = tenant_id
    and b.public_reference = p_reference
    and lower(b.email) = lower(trim(p_email));
  return result;
end;
$$;

create or replace function public.create_inventory_booking_with_terms(
  p_departure_id uuid,
  p_customer_name text,
  p_email text,
  p_phone text,
  p_language text,
  p_items jsonb,
  p_special_requests text,
  p_terms_version integer,
  p_terms_locale text,
  p_accept_terms boolean
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  tenant_id uuid;
  current_terms_version integer;
  booking_result jsonb;
  booking_reference uuid;
  verified_customer_id uuid;
begin
  if p_accept_terms is distinct from true or p_terms_locale is null or p_terms_locale not in ('es', 'en')
     or p_terms_version is null or p_terms_version < 1 then
    raise exception 'Debes aceptar los términos publicados para completar la reserva.' using errcode = '22023';
  end if;

  tenant_id := (select public.current_public_organization_id());
  if tenant_id is null then raise exception 'No se pudo resolver la empresa para este dominio.' using errcode = '42501'; end if;

  select page.version into current_terms_version
  from public.organization_site_pages page
  where page.organization_id = tenant_id and page.page_key = 'terms' and page.locale = p_terms_locale;
  if current_terms_version is null or current_terms_version <> p_terms_version then
    raise exception 'Los términos cambiaron. Actualiza la página y vuelve a aceptar la versión actual.' using errcode = '22023';
  end if;

  booking_result := public.create_inventory_booking(
    p_departure_id, p_customer_name, p_email, p_phone, p_language, p_items, p_special_requests
  );
  booking_reference := (booking_result->>'reference')::uuid;

  select id into verified_customer_id from auth.users
  where id = auth.uid() and email_confirmed_at is not null and lower(email) = lower(trim(p_email));

  update public.bookings
  set accepted_terms_version = p_terms_version,
      accepted_terms_locale = p_terms_locale,
      accepted_terms_at = now(),
      customer_user_id = verified_customer_id
  where organization_id = tenant_id and public_reference = booking_reference;
  if not found then raise exception 'No se pudo asociar la aceptación a la reserva.' using errcode = 'P0001'; end if;

  return booking_result || jsonb_build_object('accepted_terms_version', p_terms_version, 'accepted_terms_locale', p_terms_locale);
end;
$$;

revoke all on function public.claim_customer_bookings() from public;
revoke all on function public.get_my_customer_bookings() from public;
revoke all on function public.get_public_booking_tracking(uuid, text) from public;
revoke all on function public.create_inventory_booking_with_terms(uuid,text,text,text,text,jsonb,text,integer,text,boolean) from public;
revoke all on function public.claim_customer_bookings() from anon;
revoke all on function public.get_my_customer_bookings() from anon;
revoke all on function public.get_public_booking_tracking(uuid, text) from anon, authenticated, service_role;
revoke all on function public.create_inventory_booking_with_terms(uuid,text,text,text,text,jsonb,text,integer,text,boolean) from anon, authenticated, service_role;
grant execute on function public.claim_customer_bookings() to authenticated;
grant execute on function public.get_my_customer_bookings() to authenticated;
grant execute on function public.get_public_booking_tracking(uuid, text) to anon, authenticated;
grant execute on function public.create_inventory_booking_with_terms(uuid,text,text,text,text,jsonb,text,integer,text,boolean) to anon, authenticated;
