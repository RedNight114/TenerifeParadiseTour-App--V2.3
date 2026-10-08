-- Avoid relying on escaped regex dots when validating company domains.
create or replace function public.create_platform_organization(p_name text, p_slug text, p_domain text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  new_organization_id uuid;
  pilot_plan_id uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if length(trim(p_name)) not between 2 and 120 or lower(p_slug) !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or lower(p_domain) !~ '^[a-z0-9.-]+$' or left(p_domain, 1) = '.' or right(p_domain, 1) = '.' or position('..' in p_domain) > 0 then
    raise exception 'Invalid company name, slug, or domain' using errcode = '22023';
  end if;
  select id into pilot_plan_id from public.platform_plans where code = 'pilot-unlimited' and active;
  if pilot_plan_id is null then raise exception 'Default pilot plan is unavailable' using errcode = '23503'; end if;
  insert into public.organizations (name, legal_name, slug, status, platform_plan_id)
  values (trim(p_name), trim(p_name), lower(p_slug), 'pending', pilot_plan_id)
  returning id into new_organization_id;
  insert into public.organization_domains (organization_id, host, is_primary, verified_at)
  values (new_organization_id, lower(p_domain), true, null);
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'organization_created', 'organization', new_organization_id::text,
    jsonb_build_object('slug', lower(p_slug), 'domain', lower(p_domain), 'plan_id', pilot_plan_id));
  return new_organization_id;
end;
$$;
revoke all on function public.create_platform_organization(text, text, text) from public;
grant execute on function public.create_platform_organization(text, text, text) to authenticated;
