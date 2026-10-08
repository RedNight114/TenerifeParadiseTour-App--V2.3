-- Extend the tenant-owned content editor without changing domain provisioning.
-- The same public app/code is still served for every tenant; rows remain scoped
-- by organization_id and the existing RLS policies.

alter table public.organization_site_pages
  drop constraint if exists organization_site_pages_page_key_check;
alter table public.organization_site_pages
  add constraint organization_site_pages_page_key_check
  check (page_key in ('home', 'about', 'faq', 'privacy', 'terms', 'global', 'contact', 'excursions'));

alter table public.organization_site_page_versions
  drop constraint if exists organization_site_page_versions_page_key_check;
alter table public.organization_site_page_versions
  add constraint organization_site_page_versions_page_key_check
  check (page_key in ('home', 'about', 'faq', 'privacy', 'terms', 'global', 'contact', 'excursions'));

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
  if p_page_key is null or p_page_key not in ('home', 'about', 'faq', 'privacy', 'terms', 'global', 'contact', 'excursions')
     or p_locale not in ('es', 'en') or jsonb_typeof(p_content) <> 'object' or pg_column_size(p_content) > 100000 then
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

revoke all on function public.publish_organization_site_page(text, text, jsonb) from public;
grant execute on function public.publish_organization_site_page(text, text, jsonb) to authenticated;
