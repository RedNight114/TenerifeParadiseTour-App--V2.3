-- Public clients may create only fully validated, inventory-backed bookings.
-- Legacy generic contact forms now link to excursion selection instead.
drop policy if exists bookings_public_insert on public.bookings;
revoke insert on public.bookings from anon, authenticated;
