-- Track the hosting-side domain lifecycle separately from QuickAgency TXT
-- ownership verification. A verified domain must also be routed by Vercel
-- before it can be selected as the public canonical host.
alter table public.organization_domains
  add column if not exists hosting_status text not null default 'not_connected'
    check (hosting_status in ('not_connected', 'pending_verification', 'pending_dns', 'verified', 'error')),
  add column if not exists hosting_checked_at timestamptz,
  add column if not exists hosting_details jsonb not null default '{}'::jsonb
    check (jsonb_typeof(hosting_details) = 'object' and pg_column_size(hosting_details) <= 16384);

-- Only publish a tenant on an external host after Vercel reports that the
-- domain is verified and correctly configured. Local development hosts remain
-- usable without a Vercel project.
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
        and (d.host in ('localhost', '127.0.0.1') or d.hosting_status = 'verified')
      limit 1
    )
  );
$$;

create or replace function public.current_public_organization_domain()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select d.host from public.organization_domains d
  where d.organization_id = (select public.current_public_organization_id())
    and d.verified_at is not null and d.is_primary
    and (d.host in ('localhost', '127.0.0.1') or d.hosting_status = 'verified')
  limit 1;
$$;

create or replace function public.record_platform_domain_hosting_state(
  p_domain_id uuid,
  p_hosting_status text,
  p_hosting_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;
  if p_hosting_status is null or p_hosting_status not in ('not_connected', 'pending_verification', 'pending_dns', 'verified', 'error')
     or jsonb_typeof(coalesce(p_hosting_details, '{}'::jsonb)) <> 'object'
     or pg_column_size(coalesce(p_hosting_details, '{}'::jsonb)) > 16384 then
    raise exception 'Invalid hosting domain status' using errcode = '22023';
  end if;

  update public.organization_domains
  set hosting_status = p_hosting_status,
      hosting_checked_at = now(),
      hosting_details = coalesce(p_hosting_details, '{}'::jsonb)
  where id = p_domain_id;
  if not found then
    raise exception 'Domain not found' using errcode = 'P0002';
  end if;

  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'domain_hosting_checked', 'organization_domain', p_domain_id::text,
    jsonb_build_object('status', p_hosting_status));
end;
$$;
revoke all on function public.record_platform_domain_hosting_state(uuid, text, jsonb) from public, anon;
grant execute on function public.record_platform_domain_hosting_state(uuid, text, jsonb) to authenticated;

create or replace function public.set_platform_primary_domain(p_domain_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  domain_org_id uuid;
  selected_host text;
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;
  select organization_id, host into domain_org_id, selected_host
  from public.organization_domains
  where id = p_domain_id and verified_at is not null;
  if domain_org_id is null then
    raise exception 'Domain ownership must be verified before it can be primary' using errcode = '22023';
  end if;
  if selected_host not in ('localhost', '127.0.0.1') and not exists (
    select 1 from public.organization_domains d
    where d.id = p_domain_id and d.hosting_status = 'verified'
  ) then
    raise exception 'Vercel routing, DNS, and HTTPS must be verified before the domain can be primary' using errcode = '22023';
  end if;

  update public.organization_domains set is_primary = false where organization_id = domain_org_id;
  update public.organization_domains set is_primary = true where id = p_domain_id;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'primary_domain_changed', 'organization_domain', p_domain_id::text,
    jsonb_build_object('organization_id', domain_org_id));
end;
$$;
revoke all on function public.set_platform_primary_domain(uuid) from public, anon;
grant execute on function public.set_platform_primary_domain(uuid) to authenticated;
