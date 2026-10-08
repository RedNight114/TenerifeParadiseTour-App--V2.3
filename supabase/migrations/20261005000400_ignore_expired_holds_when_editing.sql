create or replace function public.update_excursion_departure(
  p_departure_id uuid, p_starts_at timestamptz, p_ends_at timestamptz,
  p_sales_cutoff_at timestamptz, p_notes text, p_resource_assignments jsonb
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  tenant_id uuid;
  departure_row public.excursion_departures%rowtype;
  assignment jsonb;
  requested_resource_id uuid;
  requested_capacity_units integer;
  assignment_row_id uuid;
begin
  tenant_id := (select public.current_public_organization_id());
  if not public.has_organization_role(tenant_id, array['owner','admin','catalog_manager']) then
    raise exception 'No tienes permiso para modificar salidas.' using errcode = '42501';
  end if;
  select * into departure_row from public.excursion_departures d
  where d.id = p_departure_id and d.organization_id = tenant_id for update;
  if not found or departure_row.status <> 'scheduled' or departure_row.starts_at <= now() then
    raise exception 'Solo se pueden editar salidas programadas que aún no han comenzado.' using errcode = '22023';
  end if;
  if p_starts_at is null or p_ends_at <= p_starts_at or p_sales_cutoff_at is null
    or p_sales_cutoff_at <= now() or p_sales_cutoff_at > p_starts_at
    or length(coalesce(p_notes,'')) > 500
    or coalesce(jsonb_typeof(p_resource_assignments),'') <> 'array'
    or jsonb_array_length(p_resource_assignments) not between 1 and 50 then
    raise exception 'Fecha o asignación de recursos no válida.' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_array_elements(p_resource_assignments) x(value)
    group by x.value->>'resource_id' having count(*) > 1) then
    raise exception 'No repitas el mismo recurso en una salida.' using errcode = '22023';
  end if;
  if (p_starts_at is distinct from departure_row.starts_at or p_ends_at is distinct from departure_row.ends_at)
    and exists (select 1 from public.bookings b where b.departure_id = departure_row.id
      and b.organization_id = tenant_id
      and (b.status = 'confirmed' or (b.status = 'pending' and b.hold_expires_at > now()))) then
    raise exception 'No se puede cambiar el horario mientras haya reservas pendientes o confirmadas. Cancélalas o gestiona otra salida.' using errcode = '23514';
  end if;
  perform r.id from public.inventory_resources r
  where r.organization_id = tenant_id and r.id in (
    select di.resource_id from public.departure_inventory di where di.departure_id = departure_row.id and di.organization_id = tenant_id
    union
    select (x.value->>'resource_id')::uuid from jsonb_array_elements(p_resource_assignments) x(value)
      where coalesce(x.value->>'resource_id','') ~* '^[0-9a-f-]{36}$'
  ) order by r.id for update;
  update public.excursion_departures set starts_at = p_starts_at, ends_at = p_ends_at,
    sales_cutoff_at = p_sales_cutoff_at, notes = nullif(btrim(p_notes),''), updated_at = now()
  where id = departure_row.id and organization_id = tenant_id;
  if exists (
    select 1 from public.departure_inventory di
    where di.departure_id = departure_row.id and di.organization_id = tenant_id
      and not exists (select 1 from jsonb_array_elements(p_resource_assignments) x(value)
        where (x.value->>'resource_id') ~* '^[0-9a-f-]{36}$' and (x.value->>'resource_id')::uuid = di.resource_id)
      and exists (select 1 from public.booking_inventory_allocations a where a.departure_inventory_id = di.id and a.organization_id = tenant_id)
  ) then raise exception 'No se puede quitar un recurso con historial de reservas. Conserva el recurso en la salida.' using errcode = '23514'; end if;
  delete from public.departure_inventory di
  where di.departure_id = departure_row.id and di.organization_id = tenant_id
    and not exists (select 1 from jsonb_array_elements(p_resource_assignments) x(value)
      where (x.value->>'resource_id') ~* '^[0-9a-f-]{36}$' and (x.value->>'resource_id')::uuid = di.resource_id);
  for assignment in select value from jsonb_array_elements(p_resource_assignments)
  loop
    if coalesce(assignment->>'resource_id','') !~* '^[0-9a-f-]{36}$'
      or coalesce(assignment->>'capacity_units','') !~ '^[0-9]{1,5}$' then
      raise exception 'Asignación de inventario no válida.' using errcode = '22023';
    end if;
    requested_resource_id := (assignment->>'resource_id')::uuid;
    requested_capacity_units := (assignment->>'capacity_units')::integer;
    if requested_capacity_units < 1 or not exists (select 1 from public.inventory_resources r
      where r.id = requested_resource_id and r.organization_id = tenant_id and r.active and requested_capacity_units <= r.capacity_units) then
      raise exception 'El recurso no está activo o la capacidad supera su inventario.' using errcode = '22023';
    end if;
    if exists (select 1 from public.departure_inventory di
      where di.departure_id = departure_row.id and di.organization_id = tenant_id and di.resource_id = requested_resource_id
        and requested_capacity_units < coalesce((select sum(a.units)::integer
          from public.booking_inventory_allocations a join public.bookings b on b.id = a.booking_id and b.organization_id = a.organization_id
          where a.departure_inventory_id = di.id and (b.status = 'confirmed' or (b.status = 'pending' and b.hold_expires_at > now()))),0)) then
      raise exception 'La capacidad no puede quedar por debajo del inventario retenido o reservado.' using errcode = '23514';
    end if;
    update public.departure_inventory di set capacity_units = requested_capacity_units
    where di.departure_id = departure_row.id and di.organization_id = tenant_id and di.resource_id = requested_resource_id
    returning di.id into assignment_row_id;
    if not found then
      insert into public.departure_inventory (organization_id,departure_id,resource_id,capacity_units)
      values (tenant_id,departure_row.id,requested_resource_id,requested_capacity_units);
    end if;
  end loop;
  return true;
end;
$$;

revoke execute on function public.update_excursion_departure(uuid,timestamptz,timestamptz,timestamptz,text,jsonb) from public, anon;
grant execute on function public.update_excursion_departure(uuid,timestamptz,timestamptz,timestamptz,text,jsonb) to authenticated;
