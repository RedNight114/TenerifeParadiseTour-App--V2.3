create or replace function public.create_excursion_departure(
  p_excursion_id bigint, p_starts_at timestamptz, p_ends_at timestamptz,
  p_sales_cutoff_at timestamptz, p_notes text, p_resource_assignments jsonb
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; departure_id uuid; assignment jsonb; resource_id uuid; requested_capacity_units integer;
begin
  tenant_id := (select public.current_public_organization_id());
  if not public.has_organization_role(tenant_id, array['owner','admin','catalog_manager']) then
    raise exception 'No tienes permiso para programar salidas.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.excursions e where e.id = p_excursion_id and e.organization_id = tenant_id)
    or p_starts_at is null or p_ends_at <= p_starts_at or p_sales_cutoff_at > p_starts_at
    or p_sales_cutoff_at is null or p_sales_cutoff_at <= now() or length(coalesce(p_notes,'')) > 500
    or coalesce(jsonb_typeof(p_resource_assignments),'') <> 'array'
    or jsonb_array_length(p_resource_assignments) not between 1 and 50 then
    raise exception 'Fecha o asignación de recursos no válida.' using errcode = '22023';
  end if;
  perform r.id from public.inventory_resources r
  where r.organization_id = tenant_id and r.id in (
    select (value->>'resource_id')::uuid from jsonb_array_elements(p_resource_assignments)
    where coalesce(value->>'resource_id','') ~* '^[0-9a-f-]{36}$'
  ) order by r.id for update;
  insert into public.excursion_departures (organization_id,excursion_id,starts_at,ends_at,sales_cutoff_at,notes,created_by)
  values (tenant_id,p_excursion_id,p_starts_at,p_ends_at,p_sales_cutoff_at,nullif(btrim(p_notes),''),(select auth.uid()))
  returning id into departure_id;
  for assignment in select value from jsonb_array_elements(p_resource_assignments)
  loop
    if coalesce(assignment->>'resource_id','') !~* '^[0-9a-f-]{36}$'
      or coalesce(assignment->>'capacity_units','') !~ '^[0-9]{1,5}$' then
      raise exception 'Asignación de inventario no válida.' using errcode = '22023';
    end if;
    resource_id := (assignment->>'resource_id')::uuid;
    requested_capacity_units := (assignment->>'capacity_units')::integer;
    if requested_capacity_units < 1 or not exists (
      select 1 from public.inventory_resources r where r.id = resource_id and r.organization_id = tenant_id and r.active and requested_capacity_units <= r.capacity_units
    ) then
      raise exception 'El recurso no está activo o la capacidad supera su inventario.' using errcode = '22023';
    end if;
    insert into public.departure_inventory (organization_id,departure_id,resource_id,capacity_units)
    values (tenant_id,departure_id,resource_id,requested_capacity_units);
  end loop;
  return departure_id;
end;
$$;
