-- Extend QuickAgency's onboarding checklist with data-backed sales prerequisites.
-- This reports setup signals only; it does not certify hosting/DNS routing or payouts.
drop function if exists public.get_platform_company_readiness();

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
  plan_is_active boolean,
  has_terms_es boolean,
  has_terms_en boolean,
  has_privacy_es boolean,
  has_privacy_en boolean,
  has_published_excursion boolean,
  has_active_product_option boolean,
  has_upcoming_departure boolean
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
    coalesce(p.active, false),
    exists (
      select 1 from public.organization_site_pages page
      where page.organization_id = o.id and page.page_key = 'terms' and page.locale = 'es'
        and btrim(coalesce(page.content ->> 'title', '')) <> ''
        and btrim(coalesce(page.content ->> 'intro', '')) <> ''
        and case when jsonb_typeof(page.content -> 'sections') = 'array'
          then jsonb_array_length(page.content -> 'sections') > 0 else false end
    ),
    exists (
      select 1 from public.organization_site_pages page
      where page.organization_id = o.id and page.page_key = 'terms' and page.locale = 'en'
        and btrim(coalesce(page.content ->> 'title', '')) <> ''
        and btrim(coalesce(page.content ->> 'intro', '')) <> ''
        and case when jsonb_typeof(page.content -> 'sections') = 'array'
          then jsonb_array_length(page.content -> 'sections') > 0 else false end
    ),
    exists (
      select 1 from public.organization_site_pages page
      where page.organization_id = o.id and page.page_key = 'privacy' and page.locale = 'es'
        and btrim(coalesce(page.content ->> 'title', '')) <> ''
        and btrim(coalesce(page.content ->> 'intro', '')) <> ''
        and case when jsonb_typeof(page.content -> 'sections') = 'array'
          then jsonb_array_length(page.content -> 'sections') > 0 else false end
    ),
    exists (
      select 1 from public.organization_site_pages page
      where page.organization_id = o.id and page.page_key = 'privacy' and page.locale = 'en'
        and btrim(coalesce(page.content ->> 'title', '')) <> ''
        and btrim(coalesce(page.content ->> 'intro', '')) <> ''
        and case when jsonb_typeof(page.content -> 'sections') = 'array'
          then jsonb_array_length(page.content -> 'sections') > 0 else false end
    ),
    exists (
      select 1 from public.excursions e
      where e.organization_id = o.id and e.is_published
    ),
    exists (
      select 1 from public.product_options option_row
      join public.excursions e on e.id = option_row.excursion_id
        and e.organization_id = option_row.organization_id and e.is_published
      where option_row.organization_id = o.id and option_row.active
    ),
    exists (
      select 1 from public.excursion_departures d
      where d.organization_id = o.id and d.status = 'scheduled'
        and d.starts_at > now() and d.sales_cutoff_at > now()
    )
  from public.organizations o
  left join public.platform_plans p on p.id = o.platform_plan_id
  order by o.created_at desc
  limit 100;
end;
$$;

revoke all on function public.get_platform_company_readiness() from public, anon;
grant execute on function public.get_platform_company_readiness() to authenticated;
