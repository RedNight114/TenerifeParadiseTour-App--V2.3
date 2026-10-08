-- Guard inventory-backed booking snapshots and asset schedules against direct
-- table writes that bypass the public reservation RPC.

create or replace function public.validate_departure_reschedule()
returns trigger language plpgsql set search_path = '' as $$
declare resource_row record;
begin
  if new.status = 'scheduled' then
    for resource_row in
      select r.id as resource_id
      from public.departure_inventory di
      join public.inventory_resources r on r.id = di.resource_id and r.organization_id = di.organization_id
      join public.inventory_resource_types t on t.id = r.resource_type_id and t.organization_id = r.organization_id
      where di.departure_id = new.id and di.organization_id = new.organization_id and t.allocation_mode = 'asset'
      order by r.id
      for update of r
    loop
      if exists (
        select 1
        from public.departure_inventory other_inventory
        join public.excursion_departures other_departure
          on other_departure.id = other_inventory.departure_id
         and other_departure.organization_id = other_inventory.organization_id
        where other_inventory.resource_id = resource_row.resource_id
          and other_inventory.organization_id = new.organization_id
          and other_departure.id <> new.id
          and other_departure.status = 'scheduled'
          and other_departure.starts_at < new.ends_at
          and other_departure.ends_at > new.starts_at
      ) then
        raise exception 'No se puede cambiar la fecha: un recurso físico ya está asignado a una salida que se solapa.' using errcode = '23P01';
      end if;
    end loop;
  end if;
  return new;
end;
$$;
drop trigger if exists validate_departure_reschedule on public.excursion_departures;
create trigger validate_departure_reschedule
before update of starts_at, ends_at, status on public.excursion_departures
for each row execute function public.validate_departure_reschedule();
revoke execute on function public.validate_departure_reschedule() from public, anon, authenticated;

create or replace function public.enforce_booking_status_transition()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.status is not distinct from new.status then return new; end if;
  if old.status = 'pending' and new.status = 'confirmed' and old.departure_id is not null then
    if old.hold_expires_at is null or old.hold_expires_at <= now() or not exists (
      select 1 from public.booking_inventory_allocations a
      where a.booking_id = old.id and a.organization_id = old.organization_id and a.departure_id = old.departure_id
    ) then
      raise exception 'La retención de inventario ha vencido o no está completa.' using errcode = '23514';
    end if;
  end if;
  if (old.status = 'pending' and new.status in ('confirmed', 'cancelled', 'expired'))
    or (old.status = 'confirmed' and new.status in ('cancelled', 'completed')) then
    return new;
  end if;
  raise exception 'Invalid booking status transition: % -> %', old.status, new.status using errcode = '23514';
end;
$$;

create or replace function public.enforce_inventory_booking_immutable_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.departure_id is not null
    and (to_jsonb(new) - 'status' - 'updated_at') is distinct from (to_jsonb(old) - 'status' - 'updated_at') then
    raise exception 'Los datos y el importe de una reserva con inventario no se pueden editar después de crearla.' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists enforce_inventory_booking_immutable_fields on public.bookings;
create trigger enforce_inventory_booking_immutable_fields
before update on public.bookings
for each row execute function public.enforce_inventory_booking_immutable_fields();
revoke execute on function public.enforce_inventory_booking_immutable_fields() from public, anon, authenticated;
