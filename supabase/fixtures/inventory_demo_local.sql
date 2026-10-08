-- Synthetic demo data for local development only. Never run against remote Supabase.
do $$
declare
  org uuid;
  nature_category bigint;
  adventure_category bigint;
  sea_category bigint;
  teide bigint := 9001;
  stars bigint := 9002;
  anaga bigint := 9003;
  kayak bigint := 9004;
  bus_type uuid := '45000000-0000-4000-8000-000000000001';
  session_type uuid := '45000000-0000-4000-8000-000000000002';
  telescope_type uuid := '45000000-0000-4000-8000-000000000003';
  vehicle_type uuid := '45000000-0000-4000-8000-000000000004';
  kayak_type uuid := '45000000-0000-4000-8000-000000000005';
  jacket_type uuid := '45000000-0000-4000-8000-000000000006';
  guide_type uuid := '45000000-0000-4000-8000-000000000007';
  teide_departure uuid := '46000000-0000-4000-8000-000000000001';
  stars_departure uuid := '46000000-0000-4000-8000-000000000002';
  anaga_departure uuid := '46000000-0000-4000-8000-000000000003';
  kayak_departure uuid := '46000000-0000-4000-8000-000000000004';
  option_adult uuid := '47000000-0000-4000-8000-000000000001';
  option_child uuid := '47000000-0000-4000-8000-000000000002';
  option_stars uuid := '47000000-0000-4000-8000-000000000003';
  option_anaga uuid := '47000000-0000-4000-8000-000000000004';
  option_kayak uuid := '47000000-0000-4000-8000-000000000005';
  resource_id uuid;
  bus uuid;
  session_pool uuid;
  telescope uuid;
  vehicle_a uuid;
  vehicle_b uuid;
  jackets uuid;
  guide_slots uuid;
  kayak_resources uuid[] := '{}';
  loop_resource_id uuid;
  resource_index integer;
  resource_name text;
  dep uuid;
  option_id uuid;
  excursion_id bigint;
begin
  select id into org from public.organizations where slug = 'tenerife-paradise-tours';
  if org is null then raise exception 'No existe la empresa local Tenerife Paradise Tours'; end if;
  select id into nature_category from public.categories where organization_id = org and name_es ilike '%naturaleza%' order by id limit 1;
  select id into adventure_category from public.categories where organization_id = org and name_es ilike '%aventura%' order by id limit 1;
  select id into sea_category from public.categories where organization_id = org and name_es ilike '%mar%' order by id limit 1;

  insert into public.excursions (id, name_es, name_en, name_de, short_description_es, short_description_en, short_description_de, description_es, description_en, description_de, price, duration, category, image_url, featured, organization_id, is_published)
  values
    (teide, 'Teide en minibús', 'Teide by minibus', 'Teide im Minibus', 'Paisajes volcánicos y paradas panorámicas en grupo reducido.', 'Volcanic landscapes and scenic stops in a small group.', 'Vulkanlandschaften und Aussichtspunkte in kleiner Gruppe.', 'Salida de día completo desde el sur de Tenerife con guía local.', 'Full-day departure from south Tenerife with a local guide.', 'Ganztägiger Ausflug ab Südteneriffa mit lokalem Guide.', 62, '8 horas', coalesce(adventure_category, nature_category)::text, '', true, org, true),
    (stars, 'Cielo de Tenerife privado', 'Private Tenerife stargazing', 'Private Sternbeobachtung auf Teneriffa', 'Sesión privada de observación astronómica para 2–8 personas.', 'A private astronomy session for 2–8 people.', 'Private Astronomie-Session für 2–8 Personen.', 'Experiencia nocturna con guía y telescopio. Se vende por grupo, no por persona.', 'Night experience with a guide and telescope. Sold per group, not per person.', 'Nächtliches Erlebnis mit Guide und Teleskop. Preis pro Gruppe.', 280, '4 horas', coalesce(nature_category, adventure_category)::text, '', false, org, true),
    (anaga, 'Anaga 4x4 privado', 'Private Anaga 4x4', 'Private Anaga-4x4-Tour', 'Ruta privada por Anaga; cada vehículo admite hasta cuatro personas.', 'Private Anaga route; each vehicle seats up to four.', 'Private Anaga-Route; jedes Fahrzeug bietet Platz für bis zu vier Personen.', 'Se vende por vehículo y se asigna una unidad física de la flota.', 'Sold per vehicle and assigned to a specific fleet asset.', 'Preis pro Fahrzeug mit fest zugeordnetem Flottenfahrzeug.', 350, '7 horas', coalesce(adventure_category, nature_category)::text, '', false, org, true),
    (kayak, 'Kayak tándem en la costa', 'Coastal tandem kayak', 'Tandem-Kajak an der Küste', 'Reserva una embarcación para dos personas; incluye chalecos y guía.', 'Book one two-person kayak; life jackets and guide supervision included.', 'Ein Tandem-Kajak für zwei Personen; Schwimmwesten und Guide inklusive.', 'Cada reserva consume kayak, chalecos y una plaza de supervisión.', 'Each booking consumes a kayak, life jackets and one supervision slot.', 'Jede Buchung belegt Kajak, Schwimmwesten und einen Guide-Aufsichtsplatz.', 45, '3 horas', coalesce(sea_category, adventure_category)::text, '', false, org, true)
  on conflict (id) do update set
    name_es = excluded.name_es, name_en = excluded.name_en, name_de = excluded.name_de,
    short_description_es = excluded.short_description_es, short_description_en = excluded.short_description_en,
    short_description_de = excluded.short_description_de, description_es = excluded.description_es,
    description_en = excluded.description_en, description_de = excluded.description_de,
    price = excluded.price, duration = excluded.duration, category = excluded.category,
    organization_id = excluded.organization_id, is_published = excluded.is_published;
  perform setval(pg_get_serial_sequence('public.excursions','id'), greatest((select max(id) from public.excursions), 1), true);

  insert into public.inventory_resource_types (id, organization_id, name, unit_label, allocation_mode) values
    (bus_type, org, 'Minibús', 'plaza', 'asset'), (session_type, org, 'Sesiones privadas', 'sesión', 'pool'),
    (telescope_type, org, 'Telescopios', 'equipo', 'asset'), (vehicle_type, org, 'Vehículos 4x4', 'vehículo', 'asset'),
    (kayak_type, org, 'Kayaks tándem', 'embarcación', 'asset'), (jacket_type, org, 'Chalecos', 'chaleco', 'pool'),
    (guide_type, org, 'Supervisión de guía', 'plaza supervisada', 'pool')
  on conflict (id) do update set name = excluded.name, unit_label = excluded.unit_label, allocation_mode = excluded.allocation_mode;

  insert into public.inventory_resources (organization_id, resource_type_id, name, capacity_units, max_party_size)
  values (org, bus_type, 'Minibús Teide 01', 20, 20) on conflict (organization_id, resource_type_id, name) do update set capacity_units = excluded.capacity_units returning id into bus;
  insert into public.inventory_resources (organization_id, resource_type_id, name, capacity_units)
  values (org, session_type, 'Turno nocturno', 2) on conflict (organization_id, resource_type_id, name) do update set capacity_units = excluded.capacity_units returning id into session_pool;
  insert into public.inventory_resources (organization_id, resource_type_id, name, capacity_units, max_party_size)
  values (org, telescope_type, 'Telescopio 01', 1, 8) on conflict (organization_id, resource_type_id, name) do update set capacity_units = excluded.capacity_units returning id into telescope;
  insert into public.inventory_resources (organization_id, resource_type_id, name, capacity_units, max_party_size)
  values (org, vehicle_type, '4x4 Anaga 01', 1, 4) on conflict (organization_id, resource_type_id, name) do update set capacity_units = excluded.capacity_units returning id into vehicle_a;
  insert into public.inventory_resources (organization_id, resource_type_id, name, capacity_units, max_party_size)
  values (org, vehicle_type, '4x4 Anaga 02', 1, 4) on conflict (organization_id, resource_type_id, name) do update set capacity_units = excluded.capacity_units returning id into vehicle_b;
  insert into public.inventory_resources (organization_id, resource_type_id, name, capacity_units)
  values (org, jacket_type, 'Almacén de chalecos', 12) on conflict (organization_id, resource_type_id, name) do update set capacity_units = excluded.capacity_units returning id into jackets;
  insert into public.inventory_resources (organization_id, resource_type_id, name, capacity_units)
  values (org, guide_type, 'Guías turno de mañana', 4) on conflict (organization_id, resource_type_id, name) do update set capacity_units = excluded.capacity_units returning id into guide_slots;
  for resource_index in 1..6 loop
    resource_name := format('Kayak tándem %s', lpad(resource_index::text, 2, '0'));
    insert into public.inventory_resources (organization_id, resource_type_id, name, capacity_units, max_party_size)
    values (org, kayak_type, resource_name, 1, 2)
    on conflict (organization_id, resource_type_id, name) do update set capacity_units = excluded.capacity_units
    returning id into resource_id;
    kayak_resources := array_append(kayak_resources, resource_id);
  end loop;

  insert into public.product_options (id, organization_id, excursion_id, name, pricing_mode, unit_price_minor, currency_code, min_quantity, max_quantity, min_participants_per_unit, max_participants_per_unit) values
    (option_adult, org, teide, 'Adulto', 'per_participant', 6200, 'EUR', 1, 20, 1, 1),
    (option_child, org, teide, 'Menor (4–11)', 'per_participant', 4400, 'EUR', 1, 20, 1, 1),
    (option_stars, org, stars, 'Grupo privado (2–8)', 'per_group', 28000, 'EUR', 1, 1, 2, 8),
    (option_anaga, org, anaga, 'Vehículo (hasta 4)', 'per_resource', 35000, 'EUR', 1, 2, 1, 4),
    (option_kayak, org, kayak, 'Kayak tándem (2 plazas)', 'per_resource', 4500, 'EUR', 1, 6, 2, 2)
  on conflict (id) do update set name = excluded.name, pricing_mode = excluded.pricing_mode,
    unit_price_minor = excluded.unit_price_minor, min_quantity = excluded.min_quantity,
    max_quantity = excluded.max_quantity, min_participants_per_unit = excluded.min_participants_per_unit,
    max_participants_per_unit = excluded.max_participants_per_unit, active = true;
  insert into public.option_inventory_requirements (organization_id, option_id, resource_type_id, demand_basis, units_per_basis) values
    (org, option_adult, bus_type, 'participants', 1), (org, option_child, bus_type, 'participants', 1),
    (org, option_stars, session_type, 'sale_units', 1), (org, option_stars, telescope_type, 'sale_units', 1),
    (org, option_stars, guide_type, 'participants', 1), (org, option_anaga, vehicle_type, 'sale_units', 1),
    (org, option_kayak, kayak_type, 'sale_units', 1), (org, option_kayak, jacket_type, 'participants', 1),
    (org, option_kayak, guide_type, 'sale_units', 1)
  on conflict do nothing;

  insert into public.excursion_departures (id, organization_id, excursion_id, starts_at, ends_at, sales_cutoff_at, notes)
  values
    (teide_departure, org, teide, now() + interval '10 days', now() + interval '10 days 8 hours', now() + interval '9 days', 'DEMO-INVENTORY:teide'),
    (stars_departure, org, stars, now() + interval '11 days', now() + interval '11 days 4 hours', now() + interval '10 days', 'DEMO-INVENTORY:stars'),
    (anaga_departure, org, anaga, now() + interval '12 days', now() + interval '12 days 7 hours', now() + interval '11 days', 'DEMO-INVENTORY:anaga'),
    (kayak_departure, org, kayak, now() + interval '13 days', now() + interval '13 days 3 hours', now() + interval '12 days', 'DEMO-INVENTORY:kayak')
  on conflict (id) do update set starts_at = excluded.starts_at, ends_at = excluded.ends_at, sales_cutoff_at = excluded.sales_cutoff_at, status = 'scheduled';
  insert into public.departure_inventory (organization_id, departure_id, resource_id, capacity_units)
  select org, fixed.departure_key, fixed.resource_key, fixed.capacity_value from (values
    (teide_departure, bus, 20), (stars_departure, session_pool, 2), (stars_departure, telescope, 1), (stars_departure, guide_slots, 4),
    (anaga_departure, vehicle_a, 1), (anaga_departure, vehicle_b, 1), (kayak_departure, jackets, 12), (kayak_departure, guide_slots, 4)
  ) as fixed(departure_key,resource_key,capacity_value)
  where not exists (select 1 from public.departure_inventory existing where existing.departure_id = fixed.departure_key and existing.resource_id = fixed.resource_key)
  on conflict do nothing;
  foreach loop_resource_id in array kayak_resources loop
    if not exists (select 1 from public.departure_inventory existing where existing.departure_id = kayak_departure and existing.resource_id = loop_resource_id) then
      insert into public.departure_inventory (organization_id, departure_id, resource_id, capacity_units)
      values (org, kayak_departure, loop_resource_id, 1);
    end if;
  end loop;
end $$;
