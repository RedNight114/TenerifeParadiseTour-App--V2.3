-- Supabase grants EXECUTE to anon by default for existing projects, so explicitly
-- remove it from every authenticated administrative workflow.
revoke execute on function public.is_platform_admin() from anon;
revoke execute on function public.publish_organization_site_page(text, text, jsonb) from anon;
revoke execute on function public.restore_organization_site_page_version(uuid) from anon;
revoke execute on function public.replace_organization_featured_excursions(bigint[]) from anon;
revoke execute on function public.create_support_ticket(text, text) from anon;
revoke execute on function public.reply_support_ticket(uuid, text) from anon;
revoke execute on function public.update_platform_support_ticket_status(uuid, text) from anon;
revoke execute on function public.revoke_platform_support_access(uuid) from anon;
revoke execute on function public.create_platform_support_access_grant(uuid, text) from anon;
revoke execute on function public.is_active_platform_support_access(uuid) from anon;
revoke execute on function public.create_platform_organization(text, text, text) from anon;
revoke execute on function public.create_platform_domain(uuid, text) from anon;
revoke execute on function public.verify_platform_domain(uuid, text) from anon;
revoke execute on function public.set_platform_primary_domain(uuid) from anon;
revoke execute on function public.platform_assign_organization_owner(uuid, text) from anon;
revoke execute on function public.update_platform_organization(uuid, text, uuid, text) from anon;
revoke execute on function public.create_platform_plan(text, text, integer, integer, jsonb) from anon;
revoke execute on function public.update_platform_plan(uuid, text, integer, integer, jsonb, boolean) from anon;
revoke execute on function public.get_platform_dashboard_metrics() from anon;

revoke execute on function public.create_inventory_booking_with_terms(uuid,text,text,text,text,jsonb,text,integer,text,boolean) from anon;
grant execute on function public.create_inventory_booking_with_terms(uuid,text,text,text,text,jsonb,text,integer,text,boolean) to anon, authenticated;
