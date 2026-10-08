-- Synthetic legacy-only fixture. Run only after resetting local DB to migration 001,
-- then apply migration 002 to verify preservation/backfill. Never use with real data.
begin;

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '30000000-0000-4000-8000-00000000000a',
  'authenticated',
  'authenticated',
  'legacy-owner@test.invalid',
  '',
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

insert into public.app_admins (user_id)
values ('30000000-0000-4000-8000-00000000000a');

insert into public.categories (id, name_es, name_en, name_de)
values (901, 'Categoría antigua', 'Legacy category', 'Alte Kategorie');

insert into public.excursions (id, name_es, name_en, name_de, price, category)
values (9001, 'Excursión antigua', 'Legacy tour', 'Alte Tour', 25, '901');

insert into public.predefined_services (id, name_es, name_en, name_de, category)
values (701, 'Traslado antiguo', 'Legacy transfer', 'Alter Transfer', 'included');

insert into public.bookings (id, excursion_id, customer_name, email, preferred_date, number_of_people)
values (90001, 9001, 'Cliente antiguo', 'legacy-customer@test.invalid', current_date + 14, 3);

insert into public.contacts (id, name, email, message)
values (90002, 'Contacto antiguo', 'legacy-contact@test.invalid', 'Synthetic migration fixture');

commit;
