-- Return only non-sensitive onboarding signals to QuickAgency platform admins.
create or replace function public.get_platform_company_readiness()
returns table (
  organization_id uuid,
  organization_name text,
  organization_slug text,
  organization_status text,
  plan_status text,
  created_at timestamptz,
  has_verified_primary_domain boolean,
  has_active_owner boolean,
  plan_name text,
  plan_is_active boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Platform administrator access required' using errcode = '42501';
  end if;

  return query
  select
    o.id,
    o.name,
    o.slug,
    o.status,
    o.platform_plan_status,
    o.created_at,
    exists (
      select 1 from public.organization_domains d
      where d.organization_id = o.id and d.is_primary and d.verified_at is not null
    ),
    exists (
      select 1 from public.organization_memberships m
      where m.organization_id = o.id and m.role = 'owner' and m.status = 'active'
    ),
    p.name,
    coalesce(p.active, false)
  from public.organizations o
  left join public.platform_plans p on p.id = o.platform_plan_id
  order by o.created_at desc
  limit 100;
end;
$$;

revoke all on function public.get_platform_company_readiness() from public, anon;
grant execute on function public.get_platform_company_readiness() to authenticated;
