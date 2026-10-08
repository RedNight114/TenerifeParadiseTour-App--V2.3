-- Public, read-only availability uses the same active-hold definition as the
-- booking allocator and accounts for pooled stock shared by overlapping trips.
create or replace function public.get_public_departure_availability(p_excursion_id bigint)
returns table (
  departure_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  sales_cutoff_at timestamptz,
  option_availability jsonb
)
language sql stable security definer set search_path = '' as $$
  with tenant as (
    select public.current_public_organization_id() as id
  ), departures as (
    select d.* from public.excursion_departures d
    join tenant t on t.id = d.organization_id
    join public.excursions e on e.id = d.excursion_id and e.organization_id = d.organization_id
    where d.excursion_id = p_excursion_id and d.status = 'scheduled'
      and d.starts_at > now() and d.sales_cutoff_at > now() and e.is_published
  ), requirement_costs as (
    select o.id as option_id, o.organization_id, o.pricing_mode, o.max_quantity,
      o.min_participants_per_unit,
      req.resource_type_id,
      sum(req.units_per_basis * case when req.demand_basis = 'participants'
        then o.min_participants_per_unit else 1 end)::integer as units_per_minimum_sale
    from public.product_options o
    join tenant t on t.id = o.organization_id
    join public.option_inventory_requirements req on req.option_id = o.id and req.organization_id = o.organization_id
    where o.active and o.excursion_id = p_excursion_id
    group by o.id, o.organization_id, o.pricing_mode, o.max_quantity,
      o.min_participants_per_unit, req.resource_type_id
  ), requirement_availability as (
    select d.id as departure_id, rc.option_id, rc.organization_id,
      rc.pricing_mode, rc.max_quantity, rc.resource_type_id,
      rc.units_per_minimum_sale,
      coalesce(sum(greatest(0, least(
        di.capacity_units - local_usage.units,
        r.capacity_units - global_usage.units
      ))), 0)::integer as available_resource_units
    from departures d
    join public.departure_inventory di on di.departure_id = d.id and di.organization_id = d.organization_id
    join public.inventory_resources r on r.id = di.resource_id and r.organization_id = di.organization_id and r.active
    join public.inventory_resource_types typ on typ.id = r.resource_type_id and typ.organization_id = r.organization_id
    join requirement_costs rc on rc.resource_type_id = r.resource_type_id and rc.organization_id = r.organization_id
    left join lateral (
      select coalesce(sum(a.units), 0)::integer as units
      from public.booking_inventory_allocations a
      join public.bookings b on b.id = a.booking_id and b.organization_id = a.organization_id
      where a.departure_inventory_id = di.id
        and (b.status = 'confirmed' or (b.status = 'pending' and b.hold_expires_at > now()))
    ) local_usage on true
    left join lateral (
      select coalesce(sum(a.units), 0)::integer as units
      from public.booking_inventory_allocations a
      join public.bookings b on b.id = a.booking_id and b.organization_id = a.organization_id
      join public.excursion_departures other_d on other_d.id = b.departure_id and other_d.organization_id = b.organization_id
      join public.departure_inventory other_di on other_di.id = a.departure_inventory_id
        and other_di.organization_id = a.organization_id
      where other_di.resource_id = r.id and other_di.organization_id = r.organization_id
        and other_d.starts_at < d.ends_at and other_d.ends_at > d.starts_at
        and (b.status = 'confirmed' or (b.status = 'pending' and b.hold_expires_at > now()))
    ) global_usage on true
    where (typ.allocation_mode <> 'asset' or r.max_party_size is null
      or r.max_party_size >= (select min_participants_per_unit from requirement_costs rc2 where rc2.option_id = rc.option_id and rc2.resource_type_id = rc.resource_type_id))
    group by d.id, rc.option_id, rc.organization_id, rc.pricing_mode,
      rc.max_quantity, rc.resource_type_id, rc.units_per_minimum_sale
  ), option_limits as (
    select departure_id, option_id, pricing_mode,
      least(max_quantity, 100,
        min(floor(available_resource_units::numeric / units_per_minimum_sale)::integer)
      )::integer as available_quantity
    from requirement_availability
    group by departure_id, option_id, pricing_mode, max_quantity
  )
  select d.id, d.starts_at, d.ends_at, d.sales_cutoff_at,
    coalesce(jsonb_object_agg(l.option_id::text, greatest(0, l.available_quantity))
      filter (where l.option_id is not null), '{}'::jsonb)
  from departures d
  left join option_limits l on l.departure_id = d.id
  group by d.id, d.starts_at, d.ends_at, d.sales_cutoff_at
  order by d.starts_at;
$$;

revoke execute on function public.get_public_departure_availability(bigint) from public;
grant execute on function public.get_public_departure_availability(bigint) to anon, authenticated;

-- Update a scheduled departure atomically. Allocation history is retained, so
-- a resource row referenced by any booking allocation cannot be removed.
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
  if exists (
    select 1 from jsonb_array_elements(p_resource_assignments) x(value)
    group by x.value->>'resource_id' having count(*) > 1
  ) then raise exception 'No repitas el mismo recurso en una salida.' using errcode = '22023'; end if;

  if (p_starts_at is distinct from departure_row.starts_at or p_ends_at is distinct from departure_row.ends_at)
    and exists (select 1 from public.bookings b where b.departure_id = departure_row.id
      and b.organization_id = tenant_id and b.status in ('pending','confirmed')) then
    raise exception 'No se puede cambiar el horario mientras haya reservas pendientes o confirmadas. Cancélalas o gestiona otra salida.' using errcode = '23514';
  end if;

  -- Lock both current and requested resources in a deterministic order. This
  -- serializes competing assignments before the exclusion trigger evaluates.
  perform r.id from public.inventory_resources r
  where r.organization_id = tenant_id and r.id in (
    select di.resource_id from public.departure_inventory di
      where di.departure_id = departure_row.id and di.organization_id = tenant_id
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
      and not exists (
        select 1 from jsonb_array_elements(p_resource_assignments) x(value)
        where (x.value->>'resource_id') ~* '^[0-9a-f-]{36}$'
          and (x.value->>'resource_id')::uuid = di.resource_id
      )
      and exists (select 1 from public.booking_inventory_allocations a
        where a.departure_inventory_id = di.id and a.organization_id = tenant_id)
  ) then
    raise exception 'No se puede quitar un recurso con historial de reservas. Conserva el recurso en la salida.' using errcode = '23514';
  end if;

  delete from public.departure_inventory di
  where di.departure_id = departure_row.id and di.organization_id = tenant_id
    and not exists (
      select 1 from jsonb_array_elements(p_resource_assignments) x(value)
      where (x.value->>'resource_id') ~* '^[0-9a-f-]{36}$'
        and (x.value->>'resource_id')::uuid = di.resource_id
    );

  for assignment in select value from jsonb_array_elements(p_resource_assignments)
  loop
    if coalesce(assignment->>'resource_id','') !~* '^[0-9a-f-]{36}$'
      or coalesce(assignment->>'capacity_units','') !~ '^[0-9]{1,5}$' then
      raise exception 'Asignación de inventario no válida.' using errcode = '22023';
    end if;
    requested_resource_id := (assignment->>'resource_id')::uuid;
    requested_capacity_units := (assignment->>'capacity_units')::integer;
    if requested_capacity_units < 1 or not exists (
      select 1 from public.inventory_resources r where r.id = requested_resource_id
        and r.organization_id = tenant_id and r.active
        and requested_capacity_units <= r.capacity_units
    ) then raise exception 'El recurso no está activo o la capacidad supera su inventario.' using errcode = '22023'; end if;

    if exists (
      select 1 from public.departure_inventory di
      where di.departure_id = departure_row.id and di.organization_id = tenant_id and di.resource_id = requested_resource_id
        and requested_capacity_units < coalesce((
          select sum(a.units)::integer from public.booking_inventory_allocations a
          join public.bookings b on b.id = a.booking_id and b.organization_id = a.organization_id
          where a.departure_inventory_id = di.id
            and (b.status = 'confirmed' or (b.status = 'pending' and b.hold_expires_at > now()))
        ),0)
    ) then raise exception 'La capacidad no puede quedar por debajo del inventario retenido o reservado.' using errcode = '23514'; end if;

    update public.departure_inventory di set capacity_units = requested_capacity_units
    where di.departure_id = departure_row.id and di.organization_id = tenant_id
      and di.resource_id = requested_resource_id
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
