create or replace function public.enforce_inventory_booking_immutable_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  external_confirmation boolean;
begin
  if old.departure_id is null then return new; end if;

  external_confirmation := current_setting('app.external_booking_confirmation', true) = 'on'
    and old.status = 'pending'
    and new.status = 'confirmed'
    and old.booking_source = 'website'
    and new.booking_source = 'external'
    and old.external_channel is null
    and new.external_channel is not null
    and old.external_reference is null;

  if (to_jsonb(new) - 'status' - 'updated_at' - 'hold_expires_at' - 'booking_source' - 'external_channel' - 'external_reference')
    is distinct from
     (to_jsonb(old) - 'status' - 'updated_at' - 'hold_expires_at' - 'booking_source' - 'external_channel' - 'external_reference') then
    raise exception 'Los datos y el importe de una reserva con inventario no se pueden editar después de crearla.' using errcode = '23514';
  end if;

  if (new.hold_expires_at is distinct from old.hold_expires_at
      or new.booking_source is distinct from old.booking_source
      or new.external_channel is distinct from old.external_channel
      or new.external_reference is distinct from old.external_reference)
    and not external_confirmation then
    raise exception 'Los datos y el importe de una reserva con inventario no se pueden editar después de crearla.' using errcode = '23514';
  end if;
  return new;
end;
$$;

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
  changed_count integer;
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

  result := public.create_inventory_booking(
    p_departure_id, p_customer_name, p_email, p_phone, p_language,
    jsonb_build_array(jsonb_build_object(
      'option_id', p_option_id, 'quantity', p_quantity, 'participants', p_participants
    )), p_special_requests
  );
  booking_reference := (result ->> 'reference')::uuid;

  perform set_config('app.external_booking_confirmation', 'on', true);
  update public.bookings
  set status = 'confirmed',
      hold_expires_at = null,
      booking_source = 'external',
      external_channel = p_external_channel,
      external_reference = nullif(btrim(coalesce(p_external_reference, '')), '')
  where organization_id = tenant_id and public_reference = booking_reference
    and status = 'pending' and departure_id = p_departure_id;
  get diagnostics changed_count = row_count;
  perform set_config('app.external_booking_confirmation', 'off', true);

  if changed_count = 0 then
    raise exception 'No se pudo confirmar la reserva externa.' using errcode = 'P0001';
  end if;
  return result || jsonb_build_object('status', 'confirmed', 'source', 'external');
end;
$$;

revoke all on function public.create_external_inventory_booking(uuid,text,text,text,text,uuid,integer,integer,text,text,text) from public, anon;
grant execute on function public.create_external_inventory_booking(uuid,text,text,text,text,uuid,integer,integer,text,text,text) to authenticated;
