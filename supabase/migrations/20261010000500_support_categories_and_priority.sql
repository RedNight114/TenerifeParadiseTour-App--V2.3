alter table public.support_tickets
  add column if not exists category text not null default 'general'
  check (category in ('general', 'bookings', 'inventory', 'website', 'payments', 'account', 'other'));

create or replace function public.create_support_ticket(p_subject text, p_body text, p_category text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  tenant_id uuid := (select public.current_public_organization_id());
  new_ticket_id uuid;
begin
  if tenant_id is null or not public.has_organization_role(tenant_id, array['owner', 'admin', 'booking_manager']) then
    raise exception 'Company support access required' using errcode = '42501';
  end if;
  if length(trim(p_subject)) not between 4 and 160 or length(trim(p_body)) not between 1 and 8000
     or p_category not in ('bookings', 'inventory', 'website', 'payments', 'account', 'other') then
    raise exception 'Invalid support request' using errcode = '22023';
  end if;
  insert into public.support_tickets (organization_id, created_by, subject, category)
  values (tenant_id, auth.uid(), trim(p_subject), p_category) returning id into new_ticket_id;
  insert into public.support_ticket_messages (ticket_id, organization_id, author_id, author_kind, body)
  values (new_ticket_id, tenant_id, auth.uid(), 'company', trim(p_body));
  insert into public.support_notification_outbox (ticket_id, recipient_kind, event_kind)
  values (new_ticket_id, 'platform', 'ticket_created');
  return new_ticket_id;
end;
$$;
revoke all on function public.create_support_ticket(text, text, text) from public, anon;
grant execute on function public.create_support_ticket(text, text, text) to authenticated;

create or replace function public.set_platform_support_ticket_priority(p_ticket_id uuid, p_priority text)
returns void language plpgsql security definer set search_path = '' as $$
declare ticket_org_id uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator access required' using errcode = '42501'; end if;
  if p_priority not in ('normal', 'high') then raise exception 'Invalid ticket priority' using errcode = '22023'; end if;
  update public.support_tickets set priority = p_priority where id = p_ticket_id returning organization_id into ticket_org_id;
  if ticket_org_id is null then raise exception 'Support ticket not found' using errcode = 'P0002'; end if;
  insert into public.platform_audit_events (actor_user_id, action, entity, entity_id, details)
  values (auth.uid(), 'support_ticket_priority_changed', 'support_ticket', p_ticket_id::text,
    jsonb_build_object('organization_id', ticket_org_id, 'priority', p_priority));
end;
$$;
revoke all on function public.set_platform_support_ticket_priority(uuid, text) from public, anon;
grant execute on function public.set_platform_support_ticket_priority(uuid, text) to authenticated;
