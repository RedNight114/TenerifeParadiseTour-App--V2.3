-- Expose only the owner-presence boolean required by the platform company UI.
create or replace function public.get_platform_active_owner_status(p_organization_ids uuid[])
returns table (organization_id uuid, has_active_owner boolean)
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
  select o.id,
    exists (
      select 1 from public.organization_memberships m
      where m.organization_id = o.id and m.role = 'owner' and m.status = 'active'
    )
  from public.organizations o
  where o.id = any(coalesce(p_organization_ids, array[]::uuid[]));
end;
$$;

revoke all on function public.get_platform_active_owner_status(uuid[]) from public, anon;
grant execute on function public.get_platform_active_owner_status(uuid[]) to authenticated;

-- Serialize owner assignment and reject accidental demotion of an active owner.
create or replace function public.platform_assign_organization_owner(p_organization_id uuid, p_email text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare owner_id uuid;
declare normalized_email text := lower(trim(p_email));
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if length(trim(p_email)) > 254 or normalized_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Invalid email' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_organization_id::text || ':initial-owner', 0));
  if exists (
    select 1 from public.organization_memberships m
    where m.organization_id = p_organization_id and m.role = 'owner' and m.status = 'active'
  ) then
    raise exception 'An active owner is already assigned' using errcode = '23505';
  end if;

  select id into owner_id from auth.users where lower(email) = normalized_email limit 1;
  if owner_id is null then return false; end if;
  insert into public.organization_memberships (organization_id, user_id, email, role, status, invited_by)
  values (p_organization_id, owner_id, normalized_email, 'owner', 'invited', auth.uid())
  on conflict (organization_id, user_id) do update
  set email = excluded.email, role = 'owner', status = 'invited', invited_by = auth.uid(), accepted_at = null;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'organization_owner_invited', 'organization', p_organization_id::text,
    jsonb_build_object('email', normalized_email));
  return true;
end;
$$;
