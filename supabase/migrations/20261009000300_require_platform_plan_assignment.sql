-- Every tenant must have an explicit platform plan. The pilot plan is unlimited
-- and does not imply that SaaS billing is enabled.
insert into public.platform_plans (code, name, max_excursions, max_members, features, active)
values ('pilot-unlimited', 'Piloto sin límites', null, null, '{"billing":"manual"}'::jsonb, true)
on conflict (code) do update
set name = excluded.name,
    max_excursions = null,
    max_members = null,
    active = true,
    updated_at = now();

update public.organizations o
set platform_plan_id = p.id
from public.platform_plans p
where p.code = 'pilot-unlimited'
  and o.platform_plan_id is null;

alter table public.organizations alter column platform_plan_id set not null;
alter table public.organizations drop constraint if exists organizations_platform_plan_fk;
alter table public.organizations add constraint organizations_platform_plan_fk
  foreign key (platform_plan_id) references public.platform_plans(id) on delete restrict;

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

create or replace function public.update_platform_organization(p_organization_id uuid, p_status text, p_plan_id uuid, p_plan_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if p_status not in ('pending', 'active', 'suspended') or p_plan_status not in ('trial', 'active', 'past_due', 'suspended', 'cancelled') or p_plan_id is null then
    raise exception 'Invalid organization or plan status' using errcode = '22023';
  end if;
  if not exists (select 1 from public.platform_plans where id = p_plan_id) then
    raise exception 'Platform plan not found' using errcode = '23503';
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
