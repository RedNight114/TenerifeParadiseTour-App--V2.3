alter table public.bookings
  add constraint bookings_accepted_terms_pair_check
  check ((accepted_terms_version is null) = (accepted_terms_locale is null));

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
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  tenant_id uuid;
  current_terms_version integer;
  booking_result jsonb;
  booking_reference uuid;
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
  update public.bookings
  set accepted_terms_version = p_terms_version,
      accepted_terms_locale = p_terms_locale,
      accepted_terms_at = now()
  where organization_id = tenant_id and public_reference = booking_reference;
  if not found then raise exception 'No se pudo asociar la aceptación a la reserva.' using errcode = 'P0001'; end if;

  return booking_result || jsonb_build_object('accepted_terms_version', p_terms_version, 'accepted_terms_locale', p_terms_locale);
end;
$$;

revoke all on function public.create_inventory_booking_with_terms(uuid,text,text,text,text,jsonb,text,integer,text,boolean) from public;
grant execute on function public.create_inventory_booking_with_terms(uuid,text,text,text,text,jsonb,text,integer,text,boolean) to anon, authenticated;
