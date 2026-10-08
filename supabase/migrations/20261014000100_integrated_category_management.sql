create or replace function public.update_category_catalog(
  p_category_id bigint,
  p_name_es text,
  p_name_en text,
  p_name_de text,
  p_description_es text,
  p_description_en text,
  p_description_de text,
  p_icon text,
  p_color text,
  p_active boolean,
  p_sort_order integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  tenant_id uuid;
  old_name_es text;
  reassigned_count integer := 0;
begin
  tenant_id := (select public.current_public_organization_id());
  if tenant_id is null or not public.has_organization_role(tenant_id, array['owner', 'admin', 'catalog_manager']) then
    raise exception 'No tienes permiso para gestionar el catálogo.' using errcode = '42501';
  end if;
  if p_category_id is null
    or length(btrim(coalesce(p_name_es, ''))) not between 2 and 100
    or length(btrim(coalesce(p_name_en, ''))) not between 2 and 100
    or length(coalesce(p_name_de, '')) > 100
    or length(coalesce(p_description_es, '')) > 1000
    or length(coalesce(p_description_en, '')) > 1000
    or length(coalesce(p_description_de, '')) > 1000
    or length(coalesce(p_icon, '')) > 32
    or coalesce(p_color, '') !~ '^#[0-9A-Fa-f]{6}$'
    or p_sort_order is null or p_sort_order < 0 then
    raise exception 'Revisa los nombres, descripciones y el color de la categoría.' using errcode = '22023';
  end if;

  select c.name_es into old_name_es
  from public.categories c
  where c.id = p_category_id and c.organization_id = tenant_id
  for update;
  if not found then raise exception 'No se encontró la categoría de esta empresa.' using errcode = 'P0002'; end if;

  if old_name_es is distinct from btrim(p_name_es) then
    if exists (
      select 1 from public.categories duplicate
      where duplicate.organization_id = tenant_id and duplicate.id <> p_category_id
        and duplicate.name_es = btrim(p_name_es)
    ) then
      raise exception 'Ya existe otra categoría con ese nombre en español.' using errcode = '23505';
    end if;

    if exists (
      select 1 from public.categories duplicate
      where duplicate.organization_id = tenant_id and duplicate.id <> p_category_id
        and duplicate.name_es = old_name_es
    ) and exists (
      select 1 from public.excursions e where e.organization_id = tenant_id and e.category = old_name_es
    ) then
      raise exception 'Hay categorías con el mismo nombre en español; no se puede saber qué excursiones corresponden a cada una. Resuelve los nombres duplicados antes de renombrar.' using errcode = '23505';
    end if;

    update public.excursions e set category = btrim(p_name_es)
    where e.organization_id = tenant_id and e.category in (old_name_es, p_category_id::text);
    get diagnostics reassigned_count = row_count;
  end if;

  update public.categories
  set name_es = btrim(p_name_es), name_en = btrim(p_name_en), name_de = btrim(coalesce(nullif(p_name_de, ''), p_name_en)),
      description_es = nullif(btrim(coalesce(p_description_es, '')), ''),
      description_en = nullif(btrim(coalesce(p_description_en, '')), ''),
      description_de = nullif(btrim(coalesce(p_description_de, '')), ''),
      icon = nullif(btrim(coalesce(p_icon, '')), ''), color = p_color,
      active = p_active, sort_order = p_sort_order, updated_at = now()
  where id = p_category_id and organization_id = tenant_id;

  return reassigned_count;
end;
$$;

create or replace function public.delete_unused_category(p_category_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tenant_id uuid;
  category_name text;
begin
  tenant_id := (select public.current_public_organization_id());
  if tenant_id is null or not public.has_organization_role(tenant_id, array['owner', 'admin', 'catalog_manager']) then
    raise exception 'No tienes permiso para gestionar el catálogo.' using errcode = '42501';
  end if;
  select c.name_es into category_name from public.categories c
  where c.id = p_category_id and c.organization_id = tenant_id for update;
  if not found then raise exception 'No se encontró la categoría de esta empresa.' using errcode = 'P0002'; end if;
  if exists (
    select 1 from public.excursions e
    where e.organization_id = tenant_id and e.category in (category_name, p_category_id::text)
  ) then
    raise exception 'La categoría todavía tiene excursiones asignadas. Desactívala o reasigna primero esas excursiones.' using errcode = '23503';
  end if;
  delete from public.categories where id = p_category_id and organization_id = tenant_id;
end;
$$;

revoke all on function public.update_category_catalog(bigint,text,text,text,text,text,text,text,text,boolean,integer) from public, anon;
revoke all on function public.delete_unused_category(bigint) from public, anon;
grant execute on function public.update_category_catalog(bigint,text,text,text,text,text,text,text,text,boolean,integer) to authenticated;
grant execute on function public.delete_unused_category(bigint) to authenticated;
