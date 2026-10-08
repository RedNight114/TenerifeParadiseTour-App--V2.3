-- Company website content, QuickAgency control plane, and tenant support.
-- This migration is additive: legacy translations and payment data are retained.

alter table public.organizations
  add column if not exists platform_plan_id uuid,
  add column if not exists platform_plan_status text not null default 'trial'
    check (platform_plan_status in ('trial', 'active', 'past_due', 'suspended', 'cancelled'));
update public.organizations set default_locale = 'es' where default_locale not in ('es', 'en');
alter table public.organizations drop constraint if exists organizations_default_locale_check;
alter table public.organizations add constraint organizations_default_locale_check check (default_locale in ('es', 'en'));

alter table public.bookings
  add column if not exists accepted_terms_version integer,
  add column if not exists accepted_terms_locale text check (accepted_terms_locale in ('es', 'en')),
  add column if not exists accepted_terms_at timestamptz,
  add column if not exists accepted_privacy_version integer,
  add column if not exists accepted_privacy_locale text check (accepted_privacy_locale in ('es', 'en'));

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);
alter table public.platform_admins enable row level security;
create policy platform_admins_self_read on public.platform_admins
  for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.platform_admins from anon, authenticated;
grant select on public.platform_admins to authenticated;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.platform_admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

create or replace function public.current_public_organization_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select d.organization_id
  from public.organization_domains d
  join public.organizations o on o.id = d.organization_id
  where d.host = lower(coalesce(
    nullif((coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'x-tenant-host'), ''),
    split_part(coalesce(nullif((coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'host'), ''), ''), ':', 1)
  )) and d.verified_at is not null and o.status = 'active' and o.platform_plan_status <> 'suspended'
  limit 1;
$$;
revoke all on function public.current_public_organization_id() from public;
grant execute on function public.current_public_organization_id() to anon, authenticated;

create table if not exists public.platform_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code) and code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) between 2 and 100),
  max_excursions integer check (max_excursions is null or max_excursions >= 0),
  max_members integer check (max_members is null or max_members >= 1),
  features jsonb not null default '{}'::jsonb check (jsonb_typeof(features) = 'object'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.organizations drop constraint if exists organizations_platform_plan_fk;
alter table public.organizations add constraint organizations_platform_plan_fk
  foreign key (platform_plan_id) references public.platform_plans(id) on delete set null;
alter table public.platform_plans enable row level security;
create policy platform_plans_admin_all on public.platform_plans
  for all to authenticated using ((select public.is_platform_admin()))
  with check ((select public.is_platform_admin()));
grant select, insert, update, delete on public.platform_plans to authenticated;

alter table public.organization_domains add column if not exists verification_token text
  not null default ('quickagency-' || replace(gen_random_uuid()::text, '-', ''));

create or replace function public.enforce_platform_catalog_limits()
returns trigger language plpgsql security definer set search_path = '' as $$
declare plan_limit integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.organization_id::text || ':catalog-limit', 0));
  select p.max_excursions into plan_limit from public.organizations o
  left join public.platform_plans p on p.id = o.platform_plan_id
  where o.id = new.organization_id and o.platform_plan_status <> 'suspended';
  if not found then raise exception 'Organization is suspended or unavailable' using errcode = '42501'; end if;
  if plan_limit is not null and (select count(*) from public.excursions e where e.organization_id = new.organization_id) >= plan_limit then
    raise exception 'This company has reached its excursion limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists excursions_plan_limit on public.excursions;
create trigger excursions_plan_limit before insert on public.excursions
for each row execute function public.enforce_platform_catalog_limits();

create or replace function public.enforce_platform_member_limits()
returns trigger language plpgsql security definer set search_path = '' as $$
declare plan_limit integer;
begin
  if new.status = 'suspended' then return new; end if;
  perform pg_advisory_xact_lock(hashtextextended(new.organization_id::text || ':member-limit', 0));
  select p.max_members into plan_limit from public.organizations o
  left join public.platform_plans p on p.id = o.platform_plan_id
  where o.id = new.organization_id and o.platform_plan_status <> 'suspended';
  if not found then raise exception 'Organization is suspended or unavailable' using errcode = '42501'; end if;
  if plan_limit is not null and (select count(*) from public.organization_memberships m
        where m.organization_id = new.organization_id and m.status <> 'suspended' and m.user_id <> new.user_id) >= plan_limit then
    raise exception 'This company has reached its member limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists memberships_plan_limit on public.organization_memberships;
create trigger memberships_plan_limit before insert or update of status, role on public.organization_memberships
for each row execute function public.enforce_platform_member_limits();

create table if not exists public.organization_site_pages (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  page_key text not null check (page_key in ('home', 'about', 'faq', 'privacy', 'terms')),
  locale text not null check (locale in ('es', 'en')),
  content jsonb not null check (jsonb_typeof(content) = 'object' and pg_column_size(content) <= 100000),
  version integer not null check (version > 0),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (organization_id, page_key, locale)
);
create table if not exists public.organization_site_page_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  page_key text not null check (page_key in ('home', 'about', 'faq', 'privacy', 'terms')),
  locale text not null check (locale in ('es', 'en')),
  version integer not null check (version > 0),
  content jsonb not null check (jsonb_typeof(content) = 'object' and pg_column_size(content) <= 100000),
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now(),
  unique (organization_id, page_key, locale, version),
  unique (id, organization_id),
  foreign key (organization_id, page_key, locale)
    references public.organization_site_pages(organization_id, page_key, locale) deferrable initially deferred
);
create index if not exists organization_site_pages_public_idx
  on public.organization_site_pages (organization_id, page_key, locale);
create index if not exists organization_site_page_versions_history_idx
  on public.organization_site_page_versions (organization_id, page_key, locale, version desc);
alter table public.organization_site_pages enable row level security;
alter table public.organization_site_page_versions enable row level security;
create policy organization_site_pages_public_read on public.organization_site_pages
  for select to anon using (organization_id = (select public.current_public_organization_id()));
create policy organization_site_pages_member_read on public.organization_site_pages
  for select to authenticated using (organization_id = (select public.current_public_organization_id())
    and public.is_organization_member(organization_id));
create policy organization_site_pages_admin_write on public.organization_site_pages
  for all to authenticated using (organization_id = (select public.current_public_organization_id())
    and public.has_organization_role(organization_id, array['owner', 'admin']))
  with check (organization_id = (select public.current_public_organization_id())
    and public.has_organization_role(organization_id, array['owner', 'admin']));
create policy organization_site_page_versions_admin_read on public.organization_site_page_versions
  for select to authenticated using (organization_id = (select public.current_public_organization_id())
    and public.has_organization_role(organization_id, array['owner', 'admin']));
revoke all on public.organization_site_pages, public.organization_site_page_versions from anon, authenticated;
grant select on public.organization_site_pages to anon, authenticated;
grant select on public.organization_site_page_versions to authenticated;

create or replace function public.publish_organization_site_page(p_page_key text, p_locale text, p_content jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  tenant_id uuid := (select public.current_public_organization_id());
  next_version integer;
  previous_content jsonb;
begin
  if tenant_id is null or not public.has_organization_role(tenant_id, array['owner', 'admin']) then
    raise exception 'Company administrator access required' using errcode = '42501';
  end if;
  if p_page_key not in ('home', 'about', 'faq', 'privacy', 'terms') or p_locale not in ('es', 'en')
     or jsonb_typeof(p_content) <> 'object' or pg_column_size(p_content) > 100000 then
    raise exception 'Invalid page content' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(tenant_id::text || ':' || p_page_key || ':' || p_locale, 0));
  select version, content into next_version, previous_content
  from public.organization_site_pages
  where organization_id = tenant_id and page_key = p_page_key and locale = p_locale
  for update;
  next_version := coalesce(next_version, 0) + 1;
  insert into public.organization_site_pages (organization_id, page_key, locale, content, version, updated_by, updated_at)
  values (tenant_id, p_page_key, p_locale, p_content, next_version, auth.uid(), now())
  on conflict (organization_id, page_key, locale) do update set
    content = excluded.content, version = excluded.version, updated_by = excluded.updated_by, updated_at = excluded.updated_at;
  insert into public.organization_site_page_versions (organization_id, page_key, locale, version, content, published_by)
  values (tenant_id, p_page_key, p_locale, next_version, p_content, auth.uid());
  insert into public.organization_audit_events (organization_id, actor_user_id, action, entity, entity_id, before_data, after_data)
  values (tenant_id, auth.uid(), case when previous_content is null then 'INSERT' else 'UPDATE' end,
    'site_page', p_page_key || ':' || p_locale,
    case when previous_content is null then null else jsonb_build_object('version', next_version - 1) end,
    jsonb_build_object('version', next_version));
  return next_version;
end;
$$;

create or replace function public.restore_organization_site_page_version(p_version_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  source_row public.organization_site_page_versions%rowtype;
begin
  select * into source_row from public.organization_site_page_versions
  where id = p_version_id and organization_id = (select public.current_public_organization_id());
  if not found then raise exception 'Page version not found' using errcode = 'P0002'; end if;
  return public.publish_organization_site_page(source_row.page_key, source_row.locale, source_row.content);
end;
$$;
revoke all on function public.publish_organization_site_page(text, text, jsonb) from public;
revoke all on function public.restore_organization_site_page_version(uuid) from public;
grant execute on function public.publish_organization_site_page(text, text, jsonb) to authenticated;
grant execute on function public.restore_organization_site_page_version(uuid) to authenticated;

create table if not exists public.organization_featured_excursions (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  excursion_id bigint not null,
  position smallint not null check (position between 1 and 8),
  updated_at timestamptz not null default now(),
  primary key (organization_id, excursion_id),
  unique (organization_id, position),
  foreign key (organization_id, excursion_id) references public.excursions(organization_id, id) on delete cascade
);
alter table public.organization_featured_excursions enable row level security;
create policy organization_featured_public_read on public.organization_featured_excursions
  for select to anon using (organization_id = (select public.current_public_organization_id()) and exists (
    select 1 from public.excursions e where e.id = excursion_id and e.organization_id = organization_id and e.is_published));
create policy organization_featured_member_read on public.organization_featured_excursions
  for select to authenticated using (organization_id = (select public.current_public_organization_id())
    and public.is_organization_member(organization_id));
create policy organization_featured_admin_write on public.organization_featured_excursions
  for all to authenticated using (organization_id = (select public.current_public_organization_id())
    and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']))
  with check (organization_id = (select public.current_public_organization_id())
    and public.has_organization_role(organization_id, array['owner', 'admin', 'catalog_manager']));
revoke all on public.organization_featured_excursions from anon, authenticated;
grant select on public.organization_featured_excursions to anon, authenticated;

create or replace function public.replace_organization_featured_excursions(p_excursion_ids bigint[])
returns integer language plpgsql security definer set search_path = '' as $$
declare
  tenant_id uuid := (select public.current_public_organization_id());
  selected_count integer;
begin
  if tenant_id is null or not public.has_organization_role(tenant_id, array['owner', 'admin', 'catalog_manager']) then
    raise exception 'Catalog administrator access required' using errcode = '42501';
  end if;
  if coalesce(array_length(p_excursion_ids, 1), 0) > 8
     or (select count(distinct selected_id) from unnest(coalesce(p_excursion_ids, array[]::bigint[])) as selected(selected_id))
        <> coalesce(array_length(p_excursion_ids, 1), 0) then
    raise exception 'Choose up to eight different excursions' using errcode = '22023';
  end if;
  if exists (select 1 from unnest(coalesce(p_excursion_ids, array[]::bigint[])) wanted(id)
      left join public.excursions e on e.id = wanted.id and e.organization_id = tenant_id and e.is_published
      where e.id is null) then
    raise exception 'Only published excursions from this company can be featured' using errcode = '22023';
  end if;
  delete from public.organization_featured_excursions where organization_id = tenant_id;
  insert into public.organization_featured_excursions (organization_id, excursion_id, position)
  select tenant_id, selected.id, selected.position::smallint
  from unnest(coalesce(p_excursion_ids, array[]::bigint[])) with ordinality as selected(id, position);
  get diagnostics selected_count = row_count;
  return selected_count;
end;
$$;
revoke all on function public.replace_organization_featured_excursions(bigint[]) from public;
grant execute on function public.replace_organization_featured_excursions(bigint[]) to authenticated;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  subject text not null check (length(trim(subject)) between 4 and 160),
  status text not null default 'open' check (status in ('open', 'in_progress', 'waiting_company', 'resolved')),
  priority text not null default 'normal' check (priority in ('normal', 'high')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (id, organization_id)
);
create index if not exists support_tickets_org_updated_idx on public.support_tickets (organization_id, last_message_at desc);
create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null,
  organization_id uuid not null,
  author_id uuid not null references auth.users(id) on delete restrict,
  author_kind text not null check (author_kind in ('company', 'platform')),
  body text not null check (length(trim(body)) between 1 and 8000),
  created_at timestamptz not null default now(),
  foreign key (ticket_id, organization_id) references public.support_tickets(id, organization_id) on delete cascade
);
create index if not exists support_ticket_messages_thread_idx on public.support_ticket_messages (ticket_id, created_at);
create table if not exists public.support_notification_outbox (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  recipient_kind text not null check (recipient_kind in ('company', 'platform')),
  event_kind text not null check (event_kind in ('ticket_created', 'message_created')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
alter table public.support_notification_outbox enable row level security;
revoke all on public.support_notification_outbox from public, anon, authenticated;
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
create policy support_ticket_company_read on public.support_tickets for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager']));
create policy support_ticket_company_create on public.support_tickets for insert to authenticated
  with check (organization_id = (select public.current_public_organization_id()) and created_by = (select auth.uid())
    and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager']));
create policy support_ticket_company_update on public.support_tickets for update to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin']))
  with check (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin']));
create policy support_ticket_platform_read on public.support_tickets for select to authenticated
  using ((select public.is_platform_admin()));
create policy support_ticket_platform_update on public.support_tickets for update to authenticated
  using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy support_message_company_read on public.support_ticket_messages for select to authenticated
  using (organization_id = (select public.current_public_organization_id()) and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager']));
create policy support_message_platform_read on public.support_ticket_messages for select to authenticated
  using ((select public.is_platform_admin()));
create policy support_message_company_create on public.support_ticket_messages for insert to authenticated
  with check (organization_id = (select public.current_public_organization_id()) and author_id = (select auth.uid())
    and author_kind = 'company' and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager'])
    and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.organization_id = organization_id));
create policy support_message_platform_create on public.support_ticket_messages for insert to authenticated
  with check ((select public.is_platform_admin()) and author_id = (select auth.uid()) and author_kind = 'platform'
    and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.organization_id = organization_id));
revoke all on public.support_tickets, public.support_ticket_messages from anon, authenticated;
grant select, insert, update on public.support_tickets to authenticated;
grant select, insert on public.support_ticket_messages to authenticated;

create or replace function public.touch_support_ticket_after_message()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.support_tickets set last_message_at = new.created_at,
    status = case when new.author_kind = 'platform' then 'waiting_company' else 'in_progress' end
  where id = new.ticket_id and organization_id = new.organization_id;
  insert into public.support_notification_outbox (ticket_id, recipient_kind, event_kind)
  values (new.ticket_id, case when new.author_kind = 'platform' then 'company' else 'platform' end, 'message_created');
  return new;
end;
$$;
drop trigger if exists support_ticket_message_touch on public.support_ticket_messages;
create trigger support_ticket_message_touch after insert on public.support_ticket_messages
for each row execute function public.touch_support_ticket_after_message();

create or replace function public.create_support_ticket(p_subject text, p_body text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid := (select public.current_public_organization_id());
declare_ticket_id uuid;
begin
  if tenant_id is null or not public.has_organization_role(tenant_id, array['owner', 'admin', 'booking_manager']) then
    raise exception 'Company support access required' using errcode = '42501';
  end if;
  if length(trim(p_subject)) not between 4 and 160 or length(trim(p_body)) not between 1 and 8000 then
    raise exception 'Invalid support request' using errcode = '22023';
  end if;
  insert into public.support_tickets (organization_id, created_by, subject)
  values (tenant_id, auth.uid(), trim(p_subject)) returning id into declare_ticket_id;
  insert into public.support_ticket_messages (ticket_id, organization_id, author_id, author_kind, body)
  values (declare_ticket_id, tenant_id, auth.uid(), 'company', trim(p_body));
  insert into public.support_notification_outbox (ticket_id, recipient_kind, event_kind)
  values (declare_ticket_id, 'platform', 'ticket_created');
  return declare_ticket_id;
end;
$$;

create or replace function public.reply_support_ticket(p_ticket_id uuid, p_body text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  ticket_row public.support_tickets%rowtype;
  author_kind_value text;
begin
  if length(trim(p_body)) not between 1 and 8000 then raise exception 'Invalid support message' using errcode = '22023'; end if;
  select * into ticket_row from public.support_tickets where id = p_ticket_id for update;
  if not found then raise exception 'Support ticket not found' using errcode = 'P0002'; end if;
  if public.is_platform_admin() then
    author_kind_value := 'platform';
  elsif ticket_row.organization_id = (select public.current_public_organization_id())
        and public.has_organization_role(ticket_row.organization_id, array['owner', 'admin', 'booking_manager']) then
    author_kind_value := 'company';
  else
    raise exception 'Support ticket access required' using errcode = '42501';
  end if;
  insert into public.support_ticket_messages (ticket_id, organization_id, author_id, author_kind, body)
  values (p_ticket_id, ticket_row.organization_id, auth.uid(), author_kind_value, trim(p_body));
end;
$$;
revoke all on function public.create_support_ticket(text, text) from public;
revoke all on function public.reply_support_ticket(uuid, text) from public;
grant execute on function public.create_support_ticket(text, text) to authenticated;
grant execute on function public.reply_support_ticket(uuid, text) to authenticated;

create or replace function public.update_platform_support_ticket_status(p_ticket_id uuid, p_status text)
returns void language plpgsql security definer set search_path = '' as $$
declare ticket_org_id uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if p_status not in ('open', 'in_progress', 'waiting_company', 'resolved') then raise exception 'Invalid ticket status' using errcode = '22023'; end if;
  update public.support_tickets set status = p_status where id = p_ticket_id returning organization_id into ticket_org_id;
  if ticket_org_id is null then raise exception 'Support ticket not found' using errcode = 'P0002'; end if;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'support_ticket_status_changed', 'support_ticket', p_ticket_id::text,
    jsonb_build_object('organization_id', ticket_org_id, 'status', p_status));
end;
$$;
revoke all on function public.update_platform_support_ticket_status(uuid, text) from public;
grant execute on function public.update_platform_support_ticket_status(uuid, text) to authenticated;

create or replace function public.revoke_platform_support_access(p_grant_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare organization_id_value uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  update public.platform_support_access_grants set revoked_at = now()
  where id = p_grant_id and platform_admin_id = auth.uid() and revoked_at is null
  returning organization_id into organization_id_value;
  if organization_id_value is null then raise exception 'Active support grant not found' using errcode = 'P0002'; end if;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'support_access_revoked', 'organization', organization_id_value::text,
    jsonb_build_object('grant_id', p_grant_id));
end;
$$;
revoke all on function public.revoke_platform_support_access(uuid) from public;
grant execute on function public.revoke_platform_support_access(uuid) to authenticated;

create table if not exists public.platform_support_access_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  platform_admin_id uuid not null references public.platform_admins(user_id) on delete restrict,
  reason text not null check (length(trim(reason)) between 10 and 500),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at <= created_at + interval '1 hour' and expires_at > created_at)
);
create index if not exists platform_support_access_active_idx on public.platform_support_access_grants (organization_id, expires_at desc)
  where revoked_at is null;
alter table public.platform_support_access_grants enable row level security;
create policy platform_support_access_admin_read on public.platform_support_access_grants
  for select to authenticated using ((select public.is_platform_admin()) and platform_admin_id = (select auth.uid()));
create policy platform_support_access_admin_update on public.platform_support_access_grants
  for update to authenticated using ((select public.is_platform_admin()) and platform_admin_id = (select auth.uid()))
  with check ((select public.is_platform_admin()) and platform_admin_id = (select auth.uid()));
revoke all on public.platform_support_access_grants from public, anon, authenticated;
grant select, update on public.platform_support_access_grants to authenticated;

create table if not exists public.platform_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text not null,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);
alter table public.platform_audit_events enable row level security;
create policy platform_audit_admin_read on public.platform_audit_events
  for select to authenticated using ((select public.is_platform_admin()));
revoke all on public.platform_audit_events from public, anon, authenticated;
grant select on public.platform_audit_events to authenticated;

create or replace function public.create_platform_support_access_grant(p_organization_id uuid, p_reason text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare grant_id uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if length(trim(p_reason)) not between 10 and 500 then raise exception 'Provide a reason for support access' using errcode = '22023'; end if;
  insert into public.platform_support_access_grants (organization_id, platform_admin_id, reason, expires_at)
  values (p_organization_id, auth.uid(), trim(p_reason), now() + interval '30 minutes') returning id into grant_id;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'support_access_granted', 'organization', p_organization_id::text,
    jsonb_build_object('grant_id', grant_id, 'reason', trim(p_reason), 'expires_at', now() + interval '30 minutes'));
  return grant_id;
end;
$$;
revoke all on function public.create_platform_support_access_grant(uuid, text) from public;
grant execute on function public.create_platform_support_access_grant(uuid, text) to authenticated;

create or replace function public.is_active_platform_support_access(p_organization_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_platform_admin() and exists (
    select 1 from public.platform_support_access_grants g
    where g.organization_id = p_organization_id and g.platform_admin_id = auth.uid()
      and g.revoked_at is null and g.expires_at > now()
  );
$$;
revoke all on function public.is_active_platform_support_access(uuid) from public;
grant execute on function public.is_active_platform_support_access(uuid) to authenticated;

create policy organizations_platform_read on public.organizations for select to authenticated
  using ((select public.is_platform_admin()));
create policy organizations_platform_update on public.organizations for update to authenticated
  using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy organizations_platform_insert on public.organizations for insert to authenticated
  with check ((select public.is_platform_admin()));
grant select, insert, update on public.organizations to authenticated;
create policy domains_platform_read on public.organization_domains for select to authenticated
  using ((select public.is_platform_admin()));
create policy domains_platform_insert on public.organization_domains for insert to authenticated
  with check ((select public.is_platform_admin()) and verified_at is null);
create policy domains_platform_update on public.organization_domains for update to authenticated
  using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()) and verified_at is null);
grant select, insert, update on public.organization_domains to authenticated;
create policy audit_platform_read on public.organization_audit_events for select to authenticated
  using ((select public.is_platform_admin()));
grant select on public.organization_audit_events to authenticated;

create or replace function public.create_platform_organization(p_name text, p_slug text, p_domain text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_organization_id uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if length(trim(p_name)) not between 2 and 120 or lower(p_slug) !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or lower(p_domain) !~ '^[a-z0-9.-]+$' or p_domain ~ '(^\.|\.$|\.\.)' then
    raise exception 'Invalid company name, slug, or domain' using errcode = '22023';
  end if;
  insert into public.organizations (name, legal_name, slug, status)
  values (trim(p_name), trim(p_name), lower(p_slug), 'pending') returning id into new_organization_id;
  insert into public.organization_domains (organization_id, host, is_primary, verified_at)
  values (new_organization_id, lower(p_domain), true, null);
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'organization_created', 'organization', new_organization_id::text,
    jsonb_build_object('slug', lower(p_slug), 'domain', lower(p_domain)));
  return new_organization_id;
end;
$$;
revoke all on function public.create_platform_organization(text, text, text) from public;
grant execute on function public.create_platform_organization(text, text, text) to authenticated;

create or replace function public.create_platform_domain(p_organization_id uuid, p_domain text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_domain_id uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if lower(p_domain) !~ '^[a-z0-9.-]+$' or p_domain ~ '(^\.|\.$|\.\.)' then raise exception 'Invalid domain' using errcode = '22023'; end if;
  insert into public.organization_domains (organization_id, host, is_primary, verified_at)
  values (p_organization_id, lower(p_domain), false, null) returning id into new_domain_id;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'domain_created', 'organization_domain', new_domain_id::text,
    jsonb_build_object('organization_id', p_organization_id, 'host', lower(p_domain)));
  return new_domain_id;
end;
$$;

create or replace function public.verify_platform_domain(p_domain_id uuid, p_verification_token text)
returns void language plpgsql security definer set search_path = '' as $$
declare domain_org_id uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  update public.organization_domains set verified_at = now()
  where id = p_domain_id and verification_token = p_verification_token and verified_at is null
  returning organization_id into domain_org_id;
  if domain_org_id is null then raise exception 'Domain verification failed' using errcode = '42501'; end if;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'domain_verified', 'organization_domain', p_domain_id::text, jsonb_build_object('organization_id', domain_org_id));
end;
$$;

create or replace function public.set_platform_primary_domain(p_domain_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare domain_org_id uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  select organization_id into domain_org_id from public.organization_domains where id = p_domain_id and verified_at is not null;
  if domain_org_id is null then raise exception 'Only a verified domain can be primary' using errcode = '22023'; end if;
  update public.organization_domains set is_primary = false where organization_id = domain_org_id;
  update public.organization_domains set is_primary = true where id = p_domain_id;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'primary_domain_changed', 'organization_domain', p_domain_id::text, jsonb_build_object('organization_id', domain_org_id));
end;
$$;

create or replace function public.platform_assign_organization_owner(p_organization_id uuid, p_email text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare owner_id uuid;
declare normalized_email text := lower(trim(p_email));
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if normalized_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Invalid email' using errcode = '22023'; end if;
  select id into owner_id from auth.users where lower(email) = normalized_email limit 1;
  if owner_id is null then return false; end if;
  insert into public.organization_memberships (organization_id, user_id, email, role, status, invited_by)
  values (p_organization_id, owner_id, normalized_email, 'owner', 'invited', auth.uid())
  on conflict (organization_id, user_id) do update set email = excluded.email, role = 'owner', status = 'invited', invited_by = auth.uid(), accepted_at = null;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'organization_owner_invited', 'organization', p_organization_id::text,
    jsonb_build_object('email', normalized_email));
  return true;
end;
$$;
revoke all on function public.create_platform_domain(uuid, text) from public;
revoke all on function public.verify_platform_domain(uuid, text) from public;
revoke all on function public.set_platform_primary_domain(uuid) from public;
revoke all on function public.platform_assign_organization_owner(uuid, text) from public;
grant execute on function public.create_platform_domain(uuid, text) to authenticated;
grant execute on function public.verify_platform_domain(uuid, text) to authenticated;
grant execute on function public.set_platform_primary_domain(uuid) to authenticated;
grant execute on function public.platform_assign_organization_owner(uuid, text) to authenticated;

create or replace function public.update_platform_organization(p_organization_id uuid, p_status text, p_plan_id uuid, p_plan_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if p_status not in ('pending', 'active', 'suspended') or p_plan_status not in ('trial', 'active', 'past_due', 'suspended', 'cancelled') then
    raise exception 'Invalid organization or plan status' using errcode = '22023';
  end if;
  update public.organizations set status = p_status, platform_plan_id = p_plan_id, platform_plan_status = p_plan_status
  where id = p_organization_id;
  if not found then raise exception 'Organization not found' using errcode = 'P0002'; end if;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'organization_updated', 'organization', p_organization_id::text,
    jsonb_build_object('status', p_status, 'plan_id', p_plan_id, 'plan_status', p_plan_status));
end;
$$;
revoke all on function public.update_platform_organization(uuid, text, uuid, text) from public;
grant execute on function public.update_platform_organization(uuid, text, uuid, text) to authenticated;

create or replace function public.create_platform_plan(p_code text, p_name text, p_max_excursions integer, p_max_members integer, p_features jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_plan_id uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if length(trim(p_name)) not between 2 and 100 or lower(p_code) !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or (p_max_excursions is not null and p_max_excursions < 0)
     or (p_max_members is not null and p_max_members < 1) or jsonb_typeof(p_features) <> 'object' then
    raise exception 'Invalid plan details' using errcode = '22023';
  end if;
  insert into public.platform_plans (code, name, max_excursions, max_members, features)
  values (lower(p_code), trim(p_name), p_max_excursions, p_max_members, p_features) returning id into new_plan_id;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'plan_created', 'plan', new_plan_id::text, jsonb_build_object('code', lower(p_code), 'name', trim(p_name)));
  return new_plan_id;
end;
$$;

create or replace function public.update_platform_plan(p_plan_id uuid, p_name text, p_max_excursions integer, p_max_members integer, p_features jsonb, p_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if length(trim(p_name)) not between 2 and 100 or (p_max_excursions is not null and p_max_excursions < 0)
     or (p_max_members is not null and p_max_members < 1) or jsonb_typeof(p_features) <> 'object' then
    raise exception 'Invalid plan details' using errcode = '22023';
  end if;
  update public.platform_plans set name = trim(p_name), max_excursions = p_max_excursions,
    max_members = p_max_members, features = p_features, active = p_active, updated_at = now()
  where id = p_plan_id;
  if not found then raise exception 'Plan not found' using errcode = 'P0002'; end if;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'plan_updated', 'plan', p_plan_id::text,
    jsonb_build_object('name', trim(p_name), 'max_excursions', p_max_excursions, 'max_members', p_max_members, 'active', p_active));
end;
$$;
revoke all on function public.create_platform_plan(text, text, integer, integer, jsonb) from public;
revoke all on function public.update_platform_plan(uuid, text, integer, integer, jsonb, boolean) from public;
grant execute on function public.create_platform_plan(text, text, integer, integer, jsonb) to authenticated;
grant execute on function public.update_platform_plan(uuid, text, integer, integer, jsonb, boolean) to authenticated;

create or replace function public.get_platform_dashboard_metrics()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  return jsonb_build_object(
    'organizations', (select count(*) from public.organizations),
    'active_organizations', (select count(*) from public.organizations where status = 'active'),
    'pending_organizations', (select count(*) from public.organizations where status = 'pending'),
    'suspended_organizations', (select count(*) from public.organizations where status = 'suspended'),
    'bookings', (select count(*) from public.bookings),
    'excursions', (select count(*) from public.excursions),
    'open_tickets', (select count(*) from public.support_tickets where status <> 'resolved')
  );
end;
$$;
revoke all on function public.get_platform_dashboard_metrics() from public;
grant execute on function public.get_platform_dashboard_metrics() to authenticated;

create policy bookings_platform_support_read on public.bookings for select to authenticated
  using (public.is_active_platform_support_access(organization_id));
create policy contacts_platform_support_read on public.contacts for select to authenticated
  using (public.is_active_platform_support_access(organization_id));
create policy excursions_platform_support_read on public.excursions for select to authenticated
  using (public.is_active_platform_support_access(organization_id));
create policy categories_platform_support_read on public.categories for select to authenticated
  using (public.is_active_platform_support_access(organization_id));
grant select on public.bookings, public.contacts, public.excursions, public.categories to authenticated;

-- Existing legacy locale columns are deliberately retained. Application forms
-- will expose only Spanish and English until a separately tested data cleanup.
