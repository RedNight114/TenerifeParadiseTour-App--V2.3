alter table public.excursions
  add column if not exists recommended_sale_mode text not null default 'person'
    check (recommended_sale_mode in ('person', 'group', 'vehicle', 'combination'));
