-- Make the booking lifecycle enforceable even when a client bypasses the admin UI.
create or replace function public.enforce_booking_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  if (old.status = 'pending' and new.status in ('confirmed', 'cancelled'))
    or (old.status = 'confirmed' and new.status = 'cancelled') then
    return new;
  end if;

  raise exception 'Invalid booking status transition: % -> %', old.status, new.status
    using errcode = '23514';
end;
$$;

drop trigger if exists enforce_booking_status_transition on public.bookings;
create trigger enforce_booking_status_transition
before update of status on public.bookings
for each row execute function public.enforce_booking_status_transition();

-- Record only the lifecycle change. Never copy customer contact or request data
-- into the organization activity log.
create or replace function public.audit_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status then
    insert into public.organization_audit_events (
      organization_id, actor_user_id, action, entity, entity_id, before_data, after_data
    ) values (
      new.organization_id,
      (select auth.uid()),
      'UPDATE',
      'bookings',
      new.id::text,
      jsonb_build_object('status', old.status),
      jsonb_build_object('status', new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists audit_booking_status_change on public.bookings;
create trigger audit_booking_status_change
after update of status on public.bookings
for each row execute function public.audit_booking_status_change();

revoke execute on function public.enforce_booking_status_transition() from public, anon, authenticated;
revoke execute on function public.audit_booking_status_change() from public, anon, authenticated;
