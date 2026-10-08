create unique index if not exists bookings_external_reference_unique_idx
  on public.bookings (organization_id, external_reference)
  where booking_source = 'external' and external_reference is not null;
