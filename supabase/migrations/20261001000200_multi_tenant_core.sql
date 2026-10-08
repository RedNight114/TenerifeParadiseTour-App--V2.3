-- Add an organization boundary without discarding the existing Tenerife data.
-- The phase-0 migration must be applied first.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  legal_name text,
  support_email text,
  phone text,
  address jsonb not null default '{}'::jsonb check (jsonb_typeof(address) = 'object'),
  logo_url text,
  primary_color text not null default '#0F766E' check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color text not null default '#F59E0B' check (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  default_locale text not null default 'es' check (default_locale in ('es', 'en', 'de', 'fr', 'ru', 'zh')),
  currency_code text not null default 'EUR' check (currency_code ~ '^[A-Z]{3}$'),
  timezone text not null default 'Atlantic/Canary',
  status text not null default 'active' check (status in ('pending', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_domains (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  host text not null unique check (host = lower(host) and host ~ '^[a-z0-9.-]+$' and host !~ '(^\.|\.$|\.\.)'),
  is_primary boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists organization_domains_one_primary_idx
  on public.organization_domains (organization_id) where is_primary;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'admin', 'catalog_manager', 'booking_manager', 'guide')),
  status text not null default 'active' check (status in ('invited', 'active', 'suspended')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (organization_id, user_id),
  unique (organization_id, id)
);
create index if not exists organization_memberships_user_status_idx
  on public.organization_memberships (user_id, status);

insert into public.organizations (slug, name, legal_name)
values ('tenerife-paradise-tours', 'Tenerife Paradise Tours', 'Tenerife Paradise Tours')
on conflict (slug) do nothing;

insert into public.organization_domains (organization_id, host, is_primary, verified_at)
select o.id, local_host.host, local_host.host = 'localhost', now()
from public.organizations o
cross join (values ('localhost'), ('127.0.0.1')) as local_host(host)
where o.slug = 'tenerife-paradise-tours'
on conflict (host) do nothing;

insert into public.organization_memberships (organization_id, user_id, email, role, status, accepted_at)
select o.id, a.user_id, u.email, 'owner', 'active', now()
from public.app_admins a
join auth.users u on u.id = a.user_id
cross join public.organizations o
where o.slug = 'tenerife-paradise-tours'
on conflict (organization_id, user_id) do nothing;

alter table public.categories add column if not exists organization_id uuid;
alter table public.excursions add column if not exists organization_id uuid;
alter table public.predefined_services add column if not exists organization_id uuid;
alter table public.bookings add column if not exists organization_id uuid;
alter table public.contacts add column if not exists organization_id uuid;

update public.categories set organization_id = (select id from public.organizations where slug = 'tenerife-paradise-tours') where organization_id is null;
update public.excursions set organization_id = (select id from public.organizations where slug = 'tenerife-paradise-tours') where organization_id is null;
update public.predefined_services set organization_id = (select id from public.organizations where slug = 'tenerife-paradise-tours') where organization_id is null;
update public.bookings set organization_id = (select id from public.organizations where slug = 'tenerife-paradise-tours') where organization_id is null;
update public.contacts set organization_id = (select id from public.organizations where slug = 'tenerife-paradise-tours') where organization_id is null;

create table if not exists public.organization_audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  entity text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists organization_audit_events_org_created_idx
  on public.organization_audit_events (organization_id, created_at desc);

create or replace function public.current_public_organization_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select d.organization_id
  from public.organization_domains d
  join public.organizations o on o.id = d.organization_id
  where d.host = lower(coalesce(
    nullif((coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'x-tenant-host'), ''),
    split_part(coalesce(nullif((coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'host'), ''), ''), ':', 1)
  )) and d.verified_at is not null and o.status = 'active'
  limit 1;
$$;

create or replace function public.current_public_organization_domain()
returns text language sql stable security definer set search_path = '' as $$
  select d.host from public.organization_domains d
  where d.organization_id = (select public.current_public_organization_id())
    and d.verified_at is not null and d.is_primary
  limit 1;
$$;

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.organization_memberships m
    where m.organization_id = target_organization_id and m.user_id = (select auth.uid()) and m.status = 'active');
$$;

create or replace function public.has_organization_role(target_organization_id uuid, allowed_roles text[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.organization_memberships m
    where m.organization_id = target_organization_id and m.user_id = (select auth.uid())
      and m.status = 'active' and m.role = any(allowed_roles));
$$;

create or replace function public.accept_organization_invitation(target_organization_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare accepted_count integer;
begin
  if target_organization_id is distinct from (select public.current_public_organization_id()) then
    raise exception 'Invitation does not belong to this domain' using errcode = '42501';
  end if;
  update public.organization_memberships
  set status = 'active', accepted_at = now()
  where organization_id = target_organization_id
    and user_id = (select auth.uid())
    and status = 'invited'
    and lower(email) = lower((select auth.jwt() ->> 'email'));
  get diagnostics accepted_count = row_count;
  return accepted_count;
end;
$$;

create or replace function public.invite_existing_organization_member(
  target_organization_id uuid, invited_email text, requested_role text
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare invited_user_id uuid; normalized_email text := lower(trim(invited_email));
begin
  if target_organization_id is distinct from (select public.current_public_organization_id())
     or not public.has_organization_role(target_organization_id, array['owner', 'admin']) then
    raise exception 'Organization owner or admin access required' using errcode = '42501';
  end if;
  if requested_role not in ('admin', 'catalog_manager', 'booking_manager', 'guide')
     and not (requested_role = 'owner' and public.has_organization_role(target_organization_id, array['owner'])) then
    raise exception 'Role assignment is not allowed' using errcode = '42501';
  end if;

  select u.id into invited_user_id from auth.users u where lower(u.email) = normalized_email limit 1;
  if invited_user_id is null then return false; end if;

  if exists (select 1 from public.organization_memberships m
      where m.organization_id = target_organization_id and m.user_id = invited_user_id and m.status <> 'suspended') then
    raise exception 'This user already has a membership' using errcode = '23505';
  end if;

  insert into public.organization_memberships (organization_id, user_id, email, role, status, invited_by)
  values (target_organization_id, invited_user_id, normalized_email, requested_role, 'invited', (select auth.uid()))
  on conflict (organization_id, user_id) do update
    set email = excluded.email, role = excluded.role, status = 'invited', invited_by = excluded.invited_by, accepted_at = null;
  return true;
end;
$$;

alter table public.categories alter column organization_id set not null;
alter table public.excursions alter column organization_id set not null;
alter table public.predefined_services alter column organization_id set not null;
alter table public.bookings alter column organization_id set not null;
alter table public.contacts alter column organization_id set not null;
alter table public.categories alter column organization_id set default public.current_public_organization_id();
alter table public.excursions alter column organization_id set default public.current_public_organization_id();
alter table public.predefined_services alter column organization_id set default public.current_public_organization_id();
alter table public.bookings alter column organization_id set default public.current_public_organization_id();
alter table public.contacts alter column organization_id set default public.current_public_organization_id();

alter table public.excursions add column if not exists is_published boolean not null default true;
alter table public.excursions add constraint excursions_org_id_id_unique unique (organization_id, id);
alter table public.bookings add constraint bookings_excursion_same_org_fk
  foreign key (organization_id, excursion_id) references public.excursions (organization_id, id) on delete restrict;

create index if not exists categories_organization_sort_idx on public.categories (organization_id, sort_order);
create index if not exists excursions_organization_featured_idx on public.excursions (organization_id, featured desc, created_at desc);
create index if not exists services_organization_category_idx on public.predefined_services (organization_id, category);
create index if not exists bookings_organization_created_idx on public.bookings (organization_id, created_at desc);
create index if not exists contacts_organization_created_idx on public.contacts (organization_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists organizations_touch_updated_at on public.organizations;
create trigger organizations_touch_updated_at before update on public.organizations
for each row execute function public.touch_updated_at();
drop trigger if exists profiles_touch_updated_at on public.user_profiles;
create trigger profiles_touch_updated_at before update on public.user_profiles
for each row execute function public.touch_updated_at();

create or replace function public.audit_organization_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare old_row jsonb; new_row jsonb; source_row jsonb; tenant_id uuid; target_id text;
begin
  if tg_op <> 'INSERT' then
    source_row = to_jsonb(old);
    if tg_table_name = 'excursions' then
      old_row = jsonb_build_object('id', source_row -> 'id', 'organization_id', source_row -> 'organization_id',
        'name_es', source_row -> 'name_es', 'featured', source_row -> 'featured', 'price', source_row -> 'price',
        'is_published', source_row -> 'is_published');
    elsif tg_table_name = 'categories' then
      old_row = jsonb_build_object('id', source_row -> 'id', 'organization_id', source_row -> 'organization_id',
        'name_es', source_row -> 'name_es', 'active', source_row -> 'active', 'sort_order', source_row -> 'sort_order');
    else old_row = source_row;
    end if;
  end if;
  if tg_op <> 'DELETE' then
    source_row = to_jsonb(new);
    if tg_table_name = 'excursions' then
      new_row = jsonb_build_object('id', source_row -> 'id', 'organization_id', source_row -> 'organization_id',
        'name_es', source_row -> 'name_es', 'featured', source_row -> 'featured', 'price', source_row -> 'price',
        'is_published', source_row -> 'is_published');
    elsif tg_table_name = 'categories' then
      new_row = jsonb_build_object('id', source_row -> 'id', 'organization_id', source_row -> 'organization_id',
        'name_es', source_row -> 'name_es', 'active', source_row -> 'active', 'sort_order', source_row -> 'sort_order');
    else new_row = source_row;
    end if;
  end if;
  tenant_id = coalesce((new_row ->> 'organization_id')::uuid, (old_row ->> 'organization_id')::uuid,
    (new_row ->> 'id')::uuid, (old_row ->> 'id')::uuid);
  target_id = coalesce(new_row ->> 'id', old_row ->> 'id', new_row ->> 'user_id', old_row ->> 'user_id', 'unknown');
  insert into public.organization_audit_events (organization_id, actor_user_id, action, entity, entity_id, before_data, after_data)
  values (tenant_id, (select auth.uid()), tg_op, tg_table_name, target_id, old_row, new_row);
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
drop trigger if exists audit_organizations on public.organizations;
create trigger audit_organizations after update on public.organizations
for each row execute function public.audit_organization_change();
drop trigger if exists audit_memberships on public.organization_memberships;
create trigger audit_memberships after insert or update or delete on public.organization_memberships
for each row execute function public.audit_organization_change();
drop trigger if exists audit_domains on public.organization_domains;
create trigger audit_domains after insert or update or delete on public.organization_domains
for each row execute function public.audit_organization_change();
drop trigger if exists audit_categories on public.categories;
create trigger audit_categories after insert or update or delete on public.categories
for each row execute function public.audit_organization_change();
drop trigger if exists audit_excursions on public.excursions;
create trigger audit_excursions after insert or update or delete on public.excursions
for each row execute function public.audit_organization_change();

create or replace function public.prevent_last_owner_removal()
returns trigger language plpgsql set search_path = '' as $$
declare tenant_id uuid;
begin
  if old.role = 'owner' and old.status = 'active'
     and tg_op = 'DELETE' then
    tenant_id = old.organization_id;
    perform pg_advisory_xact_lock(hashtextextended(tenant_id::text, 0));
    if not exists (
      select 1 from public.organization_memberships m
      where m.organization_id = tenant_id and m.role = 'owner' and m.status = 'active' and m.id <> old.id
    ) then
      raise exception 'An organization must retain at least one active owner' using errcode = '23514';
    end if;
  end if;
  if tg_op = 'UPDATE' and old.role = 'owner' and old.status = 'active'
     and (new.role <> 'owner' or new.status <> 'active') then
    tenant_id = old.organization_id;
    perform pg_advisory_xact_lock(hashtextextended(tenant_id::text, 0));
    if not exists (
      select 1 from public.organization_memberships m
      where m.organization_id = tenant_id and m.role = 'owner' and m.status = 'active' and m.id <> old.id
    ) then
      raise exception 'An organization must retain at least one active owner' using errcode = '23514';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
create or replace function public.prevent_membership_identity_change()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.organization_id <> old.organization_id or new.user_id <> old.user_id or new.id <> old.id then
    raise exception 'Membership identity and organization are immutable' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists memberships_keep_active_owner on public.organization_memberships;
create trigger memberships_keep_active_owner before update or delete on public.organization_memberships
for each row execute function public.prevent_last_owner_removal();
drop trigger if exists memberships_keep_identity on public.organization_memberships;
create trigger memberships_keep_identity before update on public.organization_memberships
for each row execute function public.prevent_membership_identity_change();

alter table public.organizations enable row level security;
alter table public.organization_domains enable row level security;
alter table public.user_profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_audit_events enable row level security;
alter table public.categories enable row level security;
alter table public.excursions enable row level security;
alter table public.predefined_services enable row level security;
alter table public.bookings enable row level security;
alter table public.contacts enable row level security;

-- Remove phase-0 policies so the permissive legacy rules cannot broaden tenant access.
do $$
declare p record;
begin
  for p in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename = any(array[
      'app_admins', 'organizations', 'organization_domains', 'user_profiles', 'organization_memberships',
      'organization_audit_events', 'categories', 'excursions', 'predefined_services', 'bookings', 'contacts'
    ])
  loop execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename); end loop;
end $$;

create policy organizations_public_read on public.organizations for select to anon
  using (status = 'active' and id = (select public.current_public_organization_id()));
create policy organizations_member_read on public.organizations for select to authenticated
  using (public.is_organization_member(id));
create policy organizations_admin_update on public.organizations for update to authenticated
  using (id = (select public.current_public_organization_id()) and public.has_organization_role(id, array['owner', 'admin']))
  with check (id = (select public.current_public_organization_id()) and public.has_organization_role(id, array['owner', 'admin']));

create policy domains_admin_read on public.organization_domains for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin']));

create policy profiles_self_read on public.user_profiles for select to authenticated using (user_id = (select auth.uid()));
create policy profiles_self_insert on public.user_profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy profiles_self_update on public.user_profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy memberships_read on public.organization_memberships for select to authenticated
  using (user_id = (select auth.uid()) or (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin'])));
create policy memberships_manager_insert on public.organization_memberships for insert to authenticated
  with check (
    organization_id = (select public.current_public_organization_id())
    and (
      public.has_organization_role(organization_id, array['owner'])
      or (role <> 'owner' and public.has_organization_role(organization_id, array['admin']))
    )
  );
create policy memberships_manager_update on public.organization_memberships for update to authenticated
  using (
    organization_id = (select public.current_public_organization_id())
    and (public.has_organization_role(organization_id, array['owner']) or (role <> 'owner' and public.has_organization_role(organization_id, array['admin'])))
  )
  with check (
    organization_id = (select public.current_public_organization_id())
    and (public.has_organization_role(organization_id, array['owner']) or (role <> 'owner' and public.has_organization_role(organization_id, array['admin'])))
  );
create policy memberships_manager_delete on public.organization_memberships for delete to authenticated
  using (
    organization_id = (select public.current_public_organization_id())
    and (public.has_organization_role(organization_id, array['owner']) or (role <> 'owner' and public.has_organization_role(organization_id, array['admin'])))
  );

create policy audit_owner_admin_read on public.organization_audit_events for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin']));

create policy categories_public_read on public.categories for select to anon
  using (active and organization_id = (select public.current_public_organization_id()));
create policy categories_member_read on public.categories for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.is_organization_member(organization_id));
create policy categories_catalog_insert on public.categories for insert to authenticated
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']));
create policy categories_catalog_update on public.categories for update to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']));
create policy categories_catalog_delete on public.categories for delete to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']));

create policy excursions_public_read on public.excursions for select to anon
  using (is_published and organization_id = (select public.current_public_organization_id()));
create policy excursions_member_read on public.excursions for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.is_organization_member(organization_id));
create policy excursions_catalog_insert on public.excursions for insert to authenticated
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']));
create policy excursions_catalog_update on public.excursions for update to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']));
create policy excursions_catalog_delete on public.excursions for delete to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']));

create policy services_public_read on public.predefined_services for select to anon
  using (organization_id = (select public.current_public_organization_id()));
create policy services_member_read on public.predefined_services for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.is_organization_member(organization_id));
create policy services_catalog_insert on public.predefined_services for insert to authenticated
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']));
create policy services_catalog_update on public.predefined_services for update to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']));
create policy services_catalog_delete on public.predefined_services for delete to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']));

create policy bookings_public_insert on public.bookings for insert to anon, authenticated
  with check (
      organization_id = (select public.current_public_organization_id())
      and exists (select 1 from public.excursions e
        where e.id = bookings.excursion_id
          and e.organization_id = bookings.organization_id
          and e.is_published)
  );
create policy bookings_staff_read on public.bookings for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager', 'guide']));
create policy bookings_manager_update on public.bookings for update to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager']));
create policy bookings_manager_delete on public.bookings for delete to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager']));

create policy contacts_public_insert on public.contacts for insert to anon, authenticated
  with check (organization_id = (select public.current_public_organization_id()));
create policy contacts_manager_read on public.contacts for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager']));
create policy contacts_manager_delete on public.contacts for delete to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager']));

revoke all on public.organizations, public.organization_domains, public.user_profiles,
  public.organization_memberships, public.organization_audit_events, public.categories, public.excursions,
  public.predefined_services, public.bookings, public.contacts from anon, authenticated;
grant select (id, slug, name, logo_url, primary_color, secondary_color, default_locale, currency_code, status, support_email, phone, address)
  on public.organizations to anon;
grant select on public.organizations to authenticated;
grant update (name, legal_name, support_email, phone, address, logo_url, primary_color, secondary_color,
  default_locale, currency_code, timezone) on public.organizations to authenticated;
grant select on public.organization_domains to authenticated;
grant select, insert, update on public.user_profiles to authenticated;
grant select, insert, update, delete on public.organization_memberships to authenticated;
grant select on public.organization_audit_events to authenticated;
grant select, insert, update, delete on public.categories, public.excursions, public.predefined_services to authenticated;
grant select on public.categories, public.excursions, public.predefined_services to anon;
grant select, insert, update, delete on public.bookings, public.contacts to authenticated;
grant insert on public.bookings, public.contacts to anon;
grant usage, select on all sequences in schema public to anon, authenticated;

revoke execute on function public.current_public_organization_id() from public;
revoke execute on function public.current_public_organization_domain() from public;
revoke execute on function public.is_organization_member(uuid) from public;
revoke execute on function public.has_organization_role(uuid, text[]) from public;
revoke execute on function public.accept_organization_invitation(uuid) from public;
revoke execute on function public.invite_existing_organization_member(uuid, text, text) from public;
revoke execute on function public.audit_organization_change() from public, anon, authenticated;
revoke execute on function public.prevent_last_owner_removal() from public, anon, authenticated;
revoke execute on function public.prevent_membership_identity_change() from public, anon, authenticated;
grant execute on function public.current_public_organization_id() to anon, authenticated;
grant execute on function public.current_public_organization_domain() to anon, authenticated;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.has_organization_role(uuid, text[]) to authenticated;
grant execute on function public.accept_organization_invitation(uuid) to authenticated;
grant execute on function public.invite_existing_organization_member(uuid, text, text) to authenticated;

drop table if exists public.app_admins;
