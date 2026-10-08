-- Company administration is hosted by QuickAgency and must not depend on a
-- customer's DNS or custom-domain routing. Public tenant resolution remains
-- host-based; an authenticated workspace may select only its own membership.
create or replace function public.current_public_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  with request_headers as (
    select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb as value
  ), selected as (
    select case
      when (select value ->> 'x-admin-organization-id' from request_headers)
        ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then ((select value ->> 'x-admin-organization-id' from request_headers))::uuid
      else null::uuid
    end as id
  )
  select coalesce(
    (
      select o.id
      from selected s
      join public.organizations o on o.id = s.id and o.status in ('pending', 'active')
      join public.organization_memberships m on m.organization_id = o.id
        and m.user_id = (select auth.uid()) and m.status = 'active'
      limit 1
    ),
    (
      select d.organization_id
      from request_headers h
      join public.organization_domains d on d.host = lower(coalesce(
        nullif(h.value ->> 'x-tenant-host', ''),
        split_part(coalesce(nullif(h.value ->> 'host', ''), ''), ':', 1)
      ))
      join public.organizations o on o.id = d.organization_id
      where d.verified_at is not null and o.status = 'active'
      limit 1
    )
  );
$$;

create or replace function public.accept_organization_invitation(target_organization_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  accepted_count integer;
  current_email text := lower(coalesce((select auth.jwt() ->> 'email'), ''));
begin
  if (select auth.uid()) is null or current_email = '' then
    raise exception 'Authentication is required to accept an invitation' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.organizations o
    where o.id = target_organization_id and o.status in ('pending', 'active')
  ) then
    raise exception 'Organization is unavailable' using errcode = '42501';
  end if;

  update public.organization_memberships
  set status = 'active', accepted_at = coalesce(accepted_at, now())
  where organization_id = target_organization_id
    and user_id = (select auth.uid())
    and lower(email) = current_email
    and status = 'invited';
  get diagnostics accepted_count = row_count;

  if accepted_count = 0 and not exists (
    select 1 from public.organization_memberships m
    where m.organization_id = target_organization_id and m.user_id = (select auth.uid())
      and lower(m.email) = current_email and m.status = 'active'
  ) then
    raise exception 'No matching invitation exists' using errcode = '42501';
  end if;
  return accepted_count;
end;
$$;
revoke all on function public.accept_organization_invitation(uuid) from public, anon;
grant execute on function public.accept_organization_invitation(uuid) to authenticated;

create or replace function public.get_my_organization_workspaces()
returns table (
  organization_id uuid,
  organization_name text,
  organization_slug text,
  organization_logo_url text,
  organization_status text,
  member_role text,
  membership_status text
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.id, o.name, o.slug, o.logo_url, o.status, m.role, m.status
  from public.organization_memberships m
  join public.organizations o on o.id = m.organization_id
  where m.user_id = (select auth.uid())
  order by case m.status when 'active' then 0 when 'invited' then 1 else 2 end, lower(o.name);
$$;
revoke all on function public.get_my_organization_workspaces() from public, anon;
grant execute on function public.get_my_organization_workspaces() to authenticated;

-- New organizations can be provisioned before a customer owns/configures a
-- domain. When provided, the domain is registered unverified as before.
create or replace function public.create_platform_organization(p_name text, p_slug text, p_domain text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_organization_id uuid;
  pilot_plan_id uuid;
  normalized_domain text := lower(trim(coalesce(p_domain, '')));
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;
  if length(trim(p_name)) not between 2 and 120
     or lower(p_slug) !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or (normalized_domain <> '' and (
       normalized_domain !~ '^[a-z0-9.-]+$'
       or left(normalized_domain, 1) = '.' or right(normalized_domain, 1) = '.'
       or position('..' in normalized_domain) > 0
     )) then
    raise exception 'Invalid company name, slug, or domain' using errcode = '22023';
  end if;

  select id into pilot_plan_id from public.platform_plans
  where code = 'pilot-unlimited' and active;
  if pilot_plan_id is null then
    raise exception 'Default pilot plan is unavailable' using errcode = '23503';
  end if;

  insert into public.organizations (name, legal_name, slug, status, platform_plan_id)
  values (trim(p_name), trim(p_name), lower(p_slug), 'pending', pilot_plan_id)
  returning id into new_organization_id;

  if normalized_domain <> '' then
    insert into public.organization_domains (organization_id, host, is_primary, verified_at)
    values (new_organization_id, normalized_domain, true, null);
  end if;

  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'organization_created', 'organization', new_organization_id::text,
    jsonb_build_object('slug', lower(p_slug), 'domain', nullif(normalized_domain, ''), 'plan_id', pilot_plan_id));
  return new_organization_id;
end;
$$;
revoke all on function public.create_platform_organization(text, text, text) from public;
grant execute on function public.create_platform_organization(text, text, text) to authenticated;
