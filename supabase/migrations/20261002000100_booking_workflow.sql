-- Give each direct-booking request a small, explicit operational lifecycle.
alter table public.bookings
  add column if not exists status text not null default 'pending'
  check (status in ('pending', 'confirmed', 'cancelled'));

create index if not exists bookings_org_status_date_idx
  on public.bookings (organization_id, status, preferred_date);
