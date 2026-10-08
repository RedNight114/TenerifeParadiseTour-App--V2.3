drop policy if exists support_message_company_create on public.support_ticket_messages;
create policy support_message_company_create on public.support_ticket_messages for insert to authenticated
  with check (organization_id = (select public.current_public_organization_id())
    and author_id = (select auth.uid()) and author_kind = 'company'
    and public.has_organization_role(organization_id, array['owner', 'admin', 'booking_manager'])
    and exists (
      select 1 from public.support_tickets t
      where t.id = public.support_ticket_messages.ticket_id
        and t.organization_id = public.support_ticket_messages.organization_id
    ));

drop policy if exists support_message_platform_create on public.support_ticket_messages;
create policy support_message_platform_create on public.support_ticket_messages for insert to authenticated
  with check ((select public.is_platform_admin()) and author_id = (select auth.uid()) and author_kind = 'platform'
    and exists (
      select 1 from public.support_tickets t
      where t.id = public.support_ticket_messages.ticket_id
        and t.organization_id = public.support_ticket_messages.organization_id
    ));
