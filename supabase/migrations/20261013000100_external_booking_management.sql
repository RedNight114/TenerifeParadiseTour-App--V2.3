alter table public.bookings
  add column if not exists booking_source text not null default 'website',
  add column if not exists external_channel text,
  add column if not exists external_reference text;

alter table public.bookings drop constraint if exists bookings_booking_source_check;
alter table public.bookings add constraint bookings_booking_source_check
  check (booking_source in ('website', 'external'));
alter table public.bookings drop constraint if exists bookings_external_channel_check;
alter table public.bookings add constraint bookings_external_channel_check
  check (external_channel is null or external_channel in ('phone', 'whatsapp', 'in_person', 'email', 'partner', 'other'));
alter table public.bookings drop constraint if exists bookings_external_metadata_check;
alter table public.bookings add constraint bookings_external_metadata_check
  check (
    (booking_source = 'website' and external_channel is null and external_reference is null)
    or (booking_source = 'external' and external_channel is not null)
  );

create index if not exists bookings_org_preferred_date_idx
  on public.bookings (organization_id, preferred_date, status);

create or replace function public.create_external_inventory_booking(
  p_departure_id uuid,
  p_customer_name text,
  p_email text,
  p_phone text,
  p_language text,
  p_option_id uuid,
  p_quantity integer,
  p_participants integer,
  p_special_requests text,
  p_external_channel text,
  p_external_reference text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  tenant_id uuid;
  result jsonb;
  booking_reference uuid;
begin
  tenant_id := (select public.current_public_organization_id());
  if tenant_id is null or not public.has_organization_role(
    tenant_id, array['owner', 'admin', 'booking_manager']
  ) then
    raise exception 'No tienes permiso para registrar reservas externas.' using errcode = '42501';
  end if;
  if p_external_channel not in ('phone', 'whatsapp', 'in_person', 'email', 'partner', 'other')
    or length(coalesce(p_external_reference, '')) > 120 then
    raise exception 'El canal o la referencia externa no son válidos.' using errcode = '22023';
  end if;

  -- Reuse the same atomic availability allocator as online checkout, then
  -- confirm and label the booking before this transaction commits.
  result := public.create_inventory_booking(
    p_departure_id,
    p_customer_name,
    p_email,
    p_phone,
    p_language,
    jsonb_build_array(jsonb_build_object(
      'option_id', p_option_id,
      'quantity', p_quantity,
      'participants', p_participants
    )),
    p_special_requests
  );
  booking_reference := (result ->> 'reference')::uuid;

  update public.bookings
  set status = 'confirmed',
      hold_expires_at = null,
      booking_source = 'external',
      external_channel = p_external_channel,
      external_reference = nullif(btrim(coalesce(p_external_reference, '')), '')
  where organization_id = tenant_id and public_reference = booking_reference
    and status = 'pending' and departure_id = p_departure_id;
  if not found then
    raise exception 'No se pudo confirmar la reserva externa.' using errcode = 'P0001';
  end if;

  return result || jsonb_build_object('status', 'confirmed', 'source', 'external');
end;
$$;

revoke all on function public.create_external_inventory_booking(uuid,text,text,text,text,uuid,integer,integer,text,text,text) from public, anon;
grant execute on function public.create_external_inventory_booking(uuid,text,text,text,text,uuid,integer,integer,text,text,text) to authenticated;
