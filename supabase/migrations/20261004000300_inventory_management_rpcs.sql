-- Atomic, role-checked configuration operations used by the inventory editor.
create or replace function public.create_inventory_resource(
  p_type_name text, p_unit_label text, p_allocation_mode text,
  p_resource_name text, p_capacity_units integer, p_max_party_size integer default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; type_id uuid; resource_id uuid;
begin
  tenant_id := (select public.current_public_organization_id());
  if not public.has_organization_role(tenant_id, array['owner','admin','catalog_manager']) then
    raise exception 'No tienes permiso para modificar el inventario.' using errcode = '42501';
  end if;
  if length(btrim(coalesce(p_type_name,''))) not between 2 and 80
    or length(btrim(coalesce(p_unit_label,''))) not between 1 and 32
    or length(btrim(coalesce(p_resource_name,''))) not between 2 and 100
    or p_allocation_mode not in ('pool','asset')
    or p_capacity_units not between 1 and 10000
    or (p_max_party_size is not null and p_max_party_size not between 1 and 100) then
    raise exception 'Configuración de recurso no válida.' using errcode = '22023';
  end if;
  select id into type_id from public.inventory_resource_types
  where organization_id = tenant_id and name = btrim(p_type_name);
  if type_id is null then
    insert into public.inventory_resource_types (organization_id,name,unit_label,allocation_mode)
    values (tenant_id,btrim(p_type_name),btrim(p_unit_label),p_allocation_mode) returning id into type_id;
  elsif not exists (
    select 1 from public.inventory_resource_types t where t.id = type_id
      and t.unit_label = btrim(p_unit_label) and t.allocation_mode = p_allocation_mode
  ) then
    raise exception 'Ese tipo ya existe con otra unidad o modo de asignación.' using errcode = '23514';
  end if;
  insert into public.inventory_resources (organization_id,resource_type_id,name,capacity_units,max_party_size)
  values (tenant_id,type_id,btrim(p_resource_name),p_capacity_units,p_max_party_size)
  returning id into resource_id;
  return jsonb_build_object('resource_type_id',type_id,'resource_id',resource_id);
end;
$$;

create or replace function public.create_product_option_with_requirements(
  p_excursion_id bigint, p_name text, p_pricing_mode text, p_unit_price_minor integer,
  p_currency_code text, p_min_quantity integer, p_max_quantity integer,
  p_min_participants_per_unit integer, p_max_participants_per_unit integer, p_requirements jsonb
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; option_id uuid; requirement jsonb; resource_type_id uuid; demand_basis text; units_per_basis integer;
begin
  tenant_id := (select public.current_public_organization_id());
  if not public.has_organization_role(tenant_id, array['owner','admin','catalog_manager']) then
    raise exception 'No tienes permiso para modificar opciones de venta.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.excursions e where e.id = p_excursion_id and e.organization_id = tenant_id)
    or length(btrim(coalesce(p_name,''))) not between 2 and 100
    or p_pricing_mode not in ('per_participant','per_group','per_resource')
    or p_unit_price_minor not between 0 and 2000000000
    or p_currency_code !~ '^[A-Z]{3}$'
    or p_min_quantity not between 1 and 500 or p_max_quantity not between p_min_quantity and 500
    or p_min_participants_per_unit not between 1 and 100
    or p_max_participants_per_unit not between p_min_participants_per_unit and 100
    or coalesce(jsonb_typeof(p_requirements),'') <> 'array' or jsonb_array_length(p_requirements) not between 1 and 10
    or (p_pricing_mode = 'per_participant' and (p_min_participants_per_unit <> 1 or p_max_participants_per_unit <> 1 or p_min_quantity <> 1))
    or (p_pricing_mode = 'per_group' and (p_min_quantity <> 1 or p_max_quantity <> 1)) then
    raise exception 'La opción o sus reglas de venta no son válidas.' using errcode = '22023';
  end if;
  insert into public.product_options (
    organization_id,excursion_id,name,pricing_mode,unit_price_minor,currency_code,
    min_quantity,max_quantity,min_participants_per_unit,max_participants_per_unit
  ) values (
    tenant_id,p_excursion_id,btrim(p_name),p_pricing_mode,p_unit_price_minor,p_currency_code,
    p_min_quantity,p_max_quantity,p_min_participants_per_unit,p_max_participants_per_unit
  ) returning id into option_id;
  for requirement in select value from jsonb_array_elements(p_requirements)
  loop
    if coalesce(requirement->>'resource_type_id','') !~* '^[0-9a-f-]{36}$'
      or coalesce(requirement->>'demand_basis','') not in ('sale_units','participants')
      or coalesce(requirement->>'units_per_basis','') !~ '^[0-9]{1,3}$' then
      raise exception 'Regla de consumo de recurso no válida.' using errcode = '22023';
    end if;
    resource_type_id := (requirement->>'resource_type_id')::uuid;
    demand_basis := requirement->>'demand_basis';
    units_per_basis := (requirement->>'units_per_basis')::integer;
    if units_per_basis not between 1 and 100 or not exists (
      select 1 from public.inventory_resource_types t where t.id = resource_type_id and t.organization_id = tenant_id
    ) then
      raise exception 'El recurso requerido no existe en esta empresa.' using errcode = '22023';
    end if;
    insert into public.option_inventory_requirements (organization_id,option_id,resource_type_id,demand_basis,units_per_basis)
    values (tenant_id,option_id,resource_type_id,demand_basis,units_per_basis);
  end loop;
  return option_id;
end;
$$;

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

revoke execute on function public.create_inventory_resource(text,text,text,text,integer,integer) from public, anon;
revoke execute on function public.create_product_option_with_requirements(bigint,text,text,integer,text,integer,integer,integer,integer,jsonb) from public, anon;
revoke execute on function public.create_excursion_departure(bigint,timestamptz,timestamptz,timestamptz,text,jsonb) from public, anon;
grant execute on function public.create_inventory_resource(text,text,text,text,integer,integer) to authenticated;
grant execute on function public.create_product_option_with_requirements(bigint,text,text,integer,text,integer,integer,integer,integer,jsonb) to authenticated;
grant execute on function public.create_excursion_departure(bigint,timestamptz,timestamptz,timestamptz,text,jsonb) to authenticated;
