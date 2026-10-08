-- Flexible excursion inventory: per-person, per-group, per-resource and
-- multi-resource bookings share one allocation path.

create table if not exists public.excursion_departures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  excursion_id bigint not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  sales_cutoff_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'closed', 'cancelled')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  constraint excursion_departures_same_org_fk foreign key (excursion_id, organization_id)
    references public.excursions(id, organization_id) on delete restrict,
  constraint excursion_departures_time_check check (ends_at > starts_at),
  constraint excursion_departures_cutoff_check check (sales_cutoff_at <= starts_at)
);
create index if not exists excursion_departures_org_date_idx
  on public.excursion_departures (organization_id, starts_at desc);
create index if not exists excursion_departures_excursion_date_idx
  on public.excursion_departures (excursion_id, starts_at);

create table if not exists public.inventory_resource_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (length(btrim(name)) between 2 and 80),
  unit_label text not null check (length(btrim(unit_label)) between 1 and 32),
  allocation_mode text not null check (allocation_mode in ('pool', 'asset')),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (organization_id, name)
);

-- A pool row represents aggregate stock. An asset row represents an assignable
-- resource such as one minibus, kayak or telescope; capacity_units can be seats
-- on a shared asset or 1 for an exclusive asset.
create table if not exists public.inventory_resources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  resource_type_id uuid not null,
  name text not null check (length(btrim(name)) between 2 and 100),
  capacity_units integer not null check (capacity_units > 0),
  max_party_size integer check (max_party_size is null or max_party_size > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  constraint inventory_resources_type_same_org_fk foreign key (resource_type_id, organization_id)
    references public.inventory_resource_types(id, organization_id) on delete restrict,
  unique (organization_id, resource_type_id, name)
);
create index if not exists inventory_resources_type_active_idx
  on public.inventory_resources (organization_id, resource_type_id, active);

create table if not exists public.product_options (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  excursion_id bigint not null,
  name text not null check (length(btrim(name)) between 2 and 100),
  pricing_mode text not null check (pricing_mode in ('per_participant', 'per_group', 'per_resource')),
  unit_price_minor integer not null check (unit_price_minor >= 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  min_quantity integer not null default 1 check (min_quantity > 0),
  max_quantity integer not null default 20 check (max_quantity >= min_quantity and max_quantity <= 500),
  min_participants_per_unit integer not null default 1 check (min_participants_per_unit > 0),
  max_participants_per_unit integer not null default 1 check (max_participants_per_unit >= min_participants_per_unit and max_participants_per_unit <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  constraint product_options_same_org_fk foreign key (excursion_id, organization_id)
    references public.excursions(id, organization_id) on delete restrict
);
create index if not exists product_options_excursion_active_idx
  on public.product_options (organization_id, excursion_id, active);

create table if not exists public.option_inventory_requirements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  option_id uuid not null,
  resource_type_id uuid not null,
  demand_basis text not null check (demand_basis in ('sale_units', 'participants')),
  units_per_basis integer not null check (units_per_basis > 0),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  constraint option_inventory_requirements_option_same_org_fk foreign key (option_id, organization_id)
    references public.product_options(id, organization_id) on delete cascade,
  constraint option_inventory_requirements_type_same_org_fk foreign key (resource_type_id, organization_id)
    references public.inventory_resource_types(id, organization_id) on delete restrict,
  unique (option_id, resource_type_id, demand_basis)
);
create index if not exists option_inventory_requirements_option_idx
  on public.option_inventory_requirements (option_id, resource_type_id);

create table if not exists public.departure_inventory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  departure_id uuid not null,
  resource_id uuid not null,
  capacity_units integer not null check (capacity_units > 0),
  created_at timestamptz not null default now(),
  unique (id, organization_id, departure_id),
  constraint departure_inventory_departure_same_org_fk foreign key (departure_id, organization_id)
    references public.excursion_departures(id, organization_id) on delete cascade,
  constraint departure_inventory_resource_same_org_fk foreign key (resource_id, organization_id)
    references public.inventory_resources(id, organization_id) on delete restrict,
  unique (departure_id, resource_id)
);
create index if not exists departure_inventory_resource_idx
  on public.departure_inventory (resource_id, departure_id);

alter table public.bookings
  add column if not exists departure_id uuid,
  add column if not exists hold_expires_at timestamptz,
  add column if not exists total_amount_minor bigint,
  add column if not exists currency_code text,
  add column if not exists public_reference uuid not null default gen_random_uuid();
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'expired', 'completed'));
alter table public.bookings add constraint bookings_id_organization_unique unique (id, organization_id);
alter table public.bookings add constraint bookings_departure_same_org_fk
  foreign key (departure_id, organization_id)
  references public.excursion_departures(id, organization_id) on delete restrict;
alter table public.bookings add constraint bookings_departure_unique_fk
  unique (id, organization_id, departure_id);
create unique index if not exists bookings_public_reference_idx on public.bookings (public_reference);
create index if not exists bookings_departure_status_idx
  on public.bookings (departure_id, status, hold_expires_at);

create table if not exists public.booking_items (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  booking_id bigint not null,
  option_id uuid not null,
  option_name text not null,
  quantity integer not null check (quantity > 0),
  participants integer not null check (participants > 0),
  unit_price_minor integer not null check (unit_price_minor >= 0),
  line_total_minor bigint not null check (line_total_minor >= 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  constraint booking_items_booking_same_org_fk foreign key (booking_id, organization_id)
    references public.bookings(id, organization_id) on delete cascade,
  constraint booking_items_option_same_org_fk foreign key (option_id, organization_id)
    references public.product_options(id, organization_id) on delete restrict
);
create index if not exists booking_items_booking_idx on public.booking_items (booking_id);

create table if not exists public.booking_inventory_allocations (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  booking_id bigint not null,
  departure_id uuid not null,
  departure_inventory_id uuid not null,
  requirement_id uuid not null,
  units integer not null check (units > 0),
  created_at timestamptz not null default now(),
  constraint booking_inventory_booking_same_departure_fk foreign key (booking_id, organization_id, departure_id)
    references public.bookings(id, organization_id, departure_id) on delete cascade,
  constraint booking_inventory_source_same_departure_fk foreign key (departure_inventory_id, organization_id, departure_id)
    references public.departure_inventory(id, organization_id, departure_id) on delete restrict,
  constraint booking_inventory_requirement_same_org_fk foreign key (requirement_id, organization_id)
    references public.option_inventory_requirements(id, organization_id) on delete restrict
);
create index if not exists booking_inventory_active_by_source_idx
  on public.booking_inventory_allocations (departure_inventory_id, booking_id);
create index if not exists booking_inventory_resource_time_idx
  on public.booking_inventory_allocations (departure_id, booking_id);

-- Assigning one physical asset to overlapping departures is never allowed,
-- even before customers reserve it. Pooled stock may be shared, but the atomic
-- allocator below enforces its global capacity across overlapping departures.
create or replace function public.validate_departure_inventory_assignment()
returns trigger language plpgsql set search_path = '' as $$
declare item_mode text; departure_start timestamptz; departure_end timestamptz;
begin
  select d.starts_at, d.ends_at into departure_start, departure_end
  from public.excursion_departures d
  where d.id = new.departure_id and d.organization_id = new.organization_id;
  if not found then raise exception 'Salida no encontrada.' using errcode = '23503'; end if;

  select t.allocation_mode into item_mode
  from public.inventory_resources r
  join public.inventory_resource_types t on t.id = r.resource_type_id and t.organization_id = r.organization_id
  where r.id = new.resource_id and r.organization_id = new.organization_id
  for update of r;
  if not found then raise exception 'Recurso no encontrado.' using errcode = '23503'; end if;

  if new.capacity_units > (select r.capacity_units from public.inventory_resources r where r.id = new.resource_id) then
    raise exception 'La capacidad asignada supera la capacidad del recurso.' using errcode = '23514';
  end if;

  if item_mode = 'asset' and exists (
    select 1
    from public.departure_inventory other_inventory
    join public.excursion_departures other_departure
      on other_departure.id = other_inventory.departure_id
     and other_departure.organization_id = other_inventory.organization_id
    where other_inventory.resource_id = new.resource_id
      and other_inventory.organization_id = new.organization_id
      and other_inventory.id <> new.id
      and other_departure.status = 'scheduled'
      and other_departure.starts_at < departure_end
      and other_departure.ends_at > departure_start
  ) then
    raise exception 'El recurso físico ya está asignado a una salida que se solapa.' using errcode = '23P01';
  end if;
  return new;
end;
$$;
drop trigger if exists validate_departure_inventory_assignment on public.departure_inventory;
create trigger validate_departure_inventory_assignment
before insert or update on public.departure_inventory
for each row execute function public.validate_departure_inventory_assignment();

create or replace function public.enforce_booking_status_transition()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.status is not distinct from new.status then return new; end if;
  if (old.status = 'pending' and new.status in ('confirmed', 'cancelled', 'expired'))
    or (old.status = 'confirmed' and new.status in ('cancelled', 'completed')) then
    return new;
  end if;
  raise exception 'Invalid booking status transition: % -> %', old.status, new.status using errcode = '23514';
end;
$$;

create or replace function public.create_inventory_booking(
  p_departure_id uuid,
  p_customer_name text,
  p_email text,
  p_phone text,
  p_language text,
  p_items jsonb,
  p_special_requests text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  tenant_id uuid;
  departure_row public.excursion_departures%rowtype;
  excursion_row public.excursions%rowtype;
  booking_id bigint;
  booking_reference uuid;
  organization_timezone text;
  total_people integer := 0;
  total_minor bigint := 0;
  booking_currency text;
  line jsonb;
  option_row public.product_options%rowtype;
  line_quantity integer;
  line_people integer;
  line_total bigint;
  validated_lines jsonb := '[]'::jsonb;
  item_record record;
  requirement_row record;
  source_row record;
  required_units integer;
  remaining_units integer;
  local_available integer;
  global_available integer;
  amount_to_allocate integer;
  people_per_unit integer;
  allocated_count integer;
  hold_until timestamptz := now() + interval '10 minutes';
begin
  tenant_id := (select public.current_public_organization_id());
  if tenant_id is null then raise exception 'No se pudo resolver la empresa para este dominio.' using errcode = '42501'; end if;
  if length(btrim(coalesce(p_customer_name, ''))) not between 2 and 120
    or length(btrim(coalesce(p_email, ''))) > 254
    or p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or length(coalesce(p_phone, '')) > 40
    or length(coalesce(p_special_requests, '')) > 2000
    or coalesce(p_language, '') not in ('es','en','de','fr','ru','zh')
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception 'Datos de reserva no válidos.' using errcode = '22023';
  end if;

  select * into departure_row
  from public.excursion_departures d
  where d.id = p_departure_id and d.organization_id = tenant_id
  for update;
  if not found or departure_row.status <> 'scheduled'
    or departure_row.starts_at <= now() or departure_row.sales_cutoff_at <= now() then
    raise exception 'La salida ya no está disponible para reservar.' using errcode = 'P0001';
  end if;

  select * into excursion_row from public.excursions e
  where e.id = departure_row.excursion_id and e.organization_id = tenant_id and e.is_published;
  if not found then raise exception 'La excursión no está publicada.' using errcode = '42501'; end if;

  select o.timezone into organization_timezone from public.organizations o where o.id = tenant_id;

  for line in select value from jsonb_array_elements(p_items)
  loop
    if (line->>'option_id') is null
      or coalesce(line->>'quantity','') !~ '^[0-9]{1,3}$'
      or coalesce(line->>'participants','') !~ '^[0-9]{1,3}$' then
      raise exception 'Opción o cantidad de participantes no válida.' using errcode = '22023';
    end if;
    line_quantity := (line->>'quantity')::integer;
    line_people := (line->>'participants')::integer;
    select * into option_row from public.product_options o
    where o.id = (line->>'option_id')::uuid and o.organization_id = tenant_id
      and o.excursion_id = departure_row.excursion_id and o.active;
    if not found then raise exception 'La opción seleccionada ya no está disponible.' using errcode = '22023'; end if;
    if line_quantity < option_row.min_quantity or line_quantity > option_row.max_quantity
      or line_people < line_quantity * option_row.min_participants_per_unit
      or line_people > line_quantity * option_row.max_participants_per_unit
      or (option_row.pricing_mode = 'per_participant' and line_quantity <> line_people) then
      raise exception 'La cantidad solicitada no cumple los límites de la opción %.', option_row.name using errcode = '22023';
    end if;
    if booking_currency is null then booking_currency := option_row.currency_code;
    elsif booking_currency <> option_row.currency_code then
      raise exception 'Una reserva no puede mezclar monedas.' using errcode = '22023';
    end if;
    line_total := option_row.unit_price_minor::bigint * case when option_row.pricing_mode = 'per_participant' then line_people else line_quantity end;
    total_minor := total_minor + line_total;
    total_people := total_people + line_people;
    validated_lines := validated_lines || jsonb_build_array(jsonb_build_object(
      'option_id', option_row.id, 'name', option_row.name, 'quantity', line_quantity,
      'participants', line_people, 'unit_price_minor', option_row.unit_price_minor,
      'line_total_minor', line_total, 'currency_code', option_row.currency_code
    ));
    if not exists (
      select 1 from public.option_inventory_requirements req
      where req.option_id = option_row.id and req.organization_id = tenant_id
    ) then
      raise exception 'La opción no tiene recursos configurados; contacta con la empresa.' using errcode = 'P0001';
    end if;
  end loop;
  if total_people < 1 or total_people > 100 then raise exception 'El tamaño total del grupo no es válido.' using errcode = '22023'; end if;

  -- Lock all stock rows used by this departure in a stable order. Overlapping
  -- departures sharing a pool/asset serialize on the same resource row.
  perform r.id from public.inventory_resources r
  join public.departure_inventory di on di.resource_id = r.id and di.organization_id = r.organization_id
  where di.departure_id = departure_row.id and di.organization_id = tenant_id
  order by r.id for update of r;

  insert into public.bookings (
    organization_id, excursion_id, departure_id, customer_name, email, phone,
    preferred_date, number_of_people, special_requests, language, status,
    hold_expires_at, total_amount_minor, currency_code
  ) values (
    tenant_id, excursion_row.id, departure_row.id, btrim(p_customer_name), lower(btrim(p_email)),
    btrim(coalesce(p_phone,'')), (departure_row.starts_at at time zone organization_timezone)::date,
    total_people, nullif(btrim(coalesce(p_special_requests,'')),''), p_language, 'pending',
    hold_until, total_minor, booking_currency
  ) returning id, public_reference into booking_id, booking_reference;

  for item_record in select value as item from jsonb_array_elements(validated_lines)
  loop
    insert into public.booking_items (
      organization_id, booking_id, option_id, option_name, quantity, participants,
      unit_price_minor, line_total_minor, currency_code
    ) values (
      tenant_id, booking_id, (item_record.item->>'option_id')::uuid,
      item_record.item->>'name', (item_record.item->>'quantity')::integer,
      (item_record.item->>'participants')::integer, (item_record.item->>'unit_price_minor')::integer,
      (item_record.item->>'line_total_minor')::bigint, item_record.item->>'currency_code'
    );
  end loop;

  for item_record in
    select (item->>'option_id')::uuid as option_id,
      (item->>'quantity')::integer as quantity,
      (item->>'participants')::integer as participants
    from jsonb_array_elements(validated_lines) item
  loop
    for requirement_row in
      select req.id, req.resource_type_id, req.demand_basis, req.units_per_basis, typ.allocation_mode
      from public.option_inventory_requirements req
      join public.inventory_resource_types typ on typ.id = req.resource_type_id and typ.organization_id = req.organization_id
      where req.option_id = item_record.option_id and req.organization_id = tenant_id
      order by req.resource_type_id
    loop
      required_units := case when requirement_row.demand_basis = 'participants'
        then item_record.participants * requirement_row.units_per_basis
        else item_record.quantity * requirement_row.units_per_basis end;
      remaining_units := required_units;
      people_per_unit := ceil(item_record.participants::numeric / item_record.quantity)::integer;
      allocated_count := 0;

      for source_row in
        select di.id as departure_inventory_id, di.capacity_units as departure_capacity,
          r.id as resource_id, r.capacity_units as resource_capacity, r.max_party_size
        from public.departure_inventory di
        join public.inventory_resources r on r.id = di.resource_id and r.organization_id = di.organization_id
        where di.departure_id = departure_row.id and di.organization_id = tenant_id
          and r.resource_type_id = requirement_row.resource_type_id and r.active
          and (requirement_row.allocation_mode <> 'asset' or r.max_party_size is null or r.max_party_size >= people_per_unit)
        order by r.id
      loop
        select greatest(0, source_row.departure_capacity - coalesce(sum(a.units),0))::integer
        into local_available
        from public.booking_inventory_allocations a
        join public.bookings b on b.id = a.booking_id and b.organization_id = a.organization_id
        where a.departure_inventory_id = source_row.departure_inventory_id
          and (b.status = 'confirmed' or (b.status = 'pending' and b.hold_expires_at > now()));

        select greatest(0, source_row.resource_capacity - coalesce(sum(a.units),0))::integer
        into global_available
        from public.booking_inventory_allocations a
        join public.bookings b on b.id = a.booking_id and b.organization_id = a.organization_id
        join public.excursion_departures other_departure
          on other_departure.id = b.departure_id and other_departure.organization_id = b.organization_id
        where a.departure_inventory_id in (
          select other_inventory.id from public.departure_inventory other_inventory
          where other_inventory.resource_id = source_row.resource_id and other_inventory.organization_id = tenant_id
        )
          and other_departure.starts_at < departure_row.ends_at
          and other_departure.ends_at > departure_row.starts_at
          and (b.status = 'confirmed' or (b.status = 'pending' and b.hold_expires_at > now()));

        amount_to_allocate := least(remaining_units, local_available, global_available);
        if amount_to_allocate > 0 then
          insert into public.booking_inventory_allocations (
            organization_id, booking_id, departure_id, departure_inventory_id, requirement_id, units
          ) values (
            tenant_id, booking_id, departure_row.id, source_row.departure_inventory_id,
            requirement_row.id, amount_to_allocate
          );
          remaining_units := remaining_units - amount_to_allocate;
          allocated_count := allocated_count + amount_to_allocate;
        end if;
        exit when remaining_units = 0;
      end loop;

      if remaining_units > 0 then
        raise exception 'No hay disponibilidad suficiente para todos los recursos requeridos.' using errcode = 'P0001';
      end if;
    end loop;
  end loop;

  return jsonb_build_object(
    'reference', booking_reference,
    'status', 'pending',
    'total_amount_minor', total_minor,
    'currency_code', booking_currency,
    'hold_expires_at', hold_until
  );
end;
$$;

create or replace function public.expire_inventory_holds()
returns integer language plpgsql security definer set search_path = '' as $$
declare expired_count integer;
begin
  update public.bookings set status = 'expired'
  where departure_id is not null and status = 'pending' and hold_expires_at <= now();
  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$;

create or replace function public.confirm_inventory_booking(p_booking_id bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; changed_id bigint;
begin
  tenant_id := (select public.current_public_organization_id());
  if not public.has_organization_role(tenant_id, array['owner','admin','booking_manager']) then
    raise exception 'No tienes permiso para confirmar reservas.' using errcode = '42501';
  end if;
  update public.bookings set status = 'confirmed'
  where id = p_booking_id and organization_id = tenant_id and departure_id is not null
    and status = 'pending' and hold_expires_at > now()
    and exists (
      select 1 from public.booking_inventory_allocations a
      where a.booking_id = bookings.id and a.organization_id = bookings.organization_id
    );
  get diagnostics changed_id = row_count;
  if changed_id = 0 then raise exception 'La reserva no tiene una retención activa o no pertenece a esta empresa.' using errcode = 'P0001'; end if;
  return true;
end;
$$;

-- Private operational tables; public booking creation goes through the guarded RPC.
alter table public.excursion_departures enable row level security;
alter table public.inventory_resource_types enable row level security;
alter table public.inventory_resources enable row level security;
alter table public.product_options enable row level security;
alter table public.option_inventory_requirements enable row level security;
alter table public.departure_inventory enable row level security;
alter table public.booking_items enable row level security;
alter table public.booking_inventory_allocations enable row level security;

create policy departures_public_read on public.excursion_departures for select to anon
  using (organization_id = (select public.current_public_organization_id()) and status = 'scheduled'
    and sales_cutoff_at > now() and exists (select 1 from public.excursions e
      where e.id = excursion_departures.excursion_id and e.organization_id = excursion_departures.organization_id and e.is_published));
create policy departures_member_read on public.excursion_departures for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.is_organization_member(organization_id));
create policy departures_manager_write on public.excursion_departures for all to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']));

create policy options_public_read on public.product_options for select to anon
  using (organization_id = (select public.current_public_organization_id()) and active and exists (select 1 from public.excursions e
    where e.id = product_options.excursion_id and e.organization_id = product_options.organization_id and e.is_published));
create policy options_member_read on public.product_options for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.is_organization_member(organization_id));
create policy options_manager_write on public.product_options for all to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']));

create policy inventory_types_member_read on public.inventory_resource_types for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.is_organization_member(organization_id));
create policy inventory_types_manager_write on public.inventory_resource_types for all to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']));

create policy inventory_resources_member_read on public.inventory_resources for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.is_organization_member(organization_id));
create policy inventory_resources_manager_write on public.inventory_resources for all to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']));

create policy requirements_member_read on public.option_inventory_requirements for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.is_organization_member(organization_id));
create policy requirements_manager_write on public.option_inventory_requirements for all to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']));

create policy departure_inventory_member_read on public.departure_inventory for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.is_organization_member(organization_id));
create policy departure_inventory_manager_write on public.departure_inventory for all to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','catalog_manager']));

create policy booking_items_manager_read on public.booking_items for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','booking_manager']));
create policy booking_inventory_manager_read on public.booking_inventory_allocations for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner','admin','booking_manager']));

revoke all on public.excursion_departures, public.inventory_resource_types, public.inventory_resources,
  public.product_options, public.option_inventory_requirements, public.departure_inventory,
  public.booking_items, public.booking_inventory_allocations from anon, authenticated;
grant select on public.excursion_departures, public.product_options to anon;
grant select, insert, update, delete on public.excursion_departures, public.inventory_resource_types,
  public.inventory_resources, public.product_options, public.option_inventory_requirements,
  public.departure_inventory to authenticated;
grant select on public.excursion_departures, public.inventory_resource_types, public.inventory_resources,
  public.product_options, public.option_inventory_requirements, public.departure_inventory to authenticated;
grant select on public.booking_items, public.booking_inventory_allocations to authenticated;
grant usage, select on sequence public.booking_items_id_seq, public.booking_inventory_allocations_id_seq to authenticated;

revoke execute on function public.create_inventory_booking(uuid,text,text,text,text,jsonb,text) from public;
grant execute on function public.create_inventory_booking(uuid,text,text,text,text,jsonb,text) to anon, authenticated;
revoke execute on function public.expire_inventory_holds() from public, anon, authenticated;
revoke execute on function public.confirm_inventory_booking(bigint) from public, anon;
grant execute on function public.confirm_inventory_booking(bigint) to authenticated;

-- Remove the earlier broad guide read. Until departures can be assigned to a
-- guide, personal booking data must remain limited to booking staff.
drop policy if exists bookings_staff_read on public.bookings;
create policy bookings_staff_read on public.bookings for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager']));

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'excursion_departures', 'inventory_resource_types', 'inventory_resources', 'product_options',
    'option_inventory_requirements', 'departure_inventory'
  ] loop
    execute format('drop trigger if exists audit_%I on public.%I', table_name, table_name);
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.audit_organization_change()', table_name, table_name);
  end loop;
end $$;

drop trigger if exists audit_booking_status_change on public.bookings;
create trigger audit_booking_status_change after update of status on public.bookings
for each row execute function public.audit_booking_status_change();

revoke execute on function public.validate_departure_inventory_assignment() from public, anon, authenticated;
