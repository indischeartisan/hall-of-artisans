create index material_categories_created_by_idx
  on public.material_categories(created_by)
  where created_by is not null;

create index material_categories_updated_by_idx
  on public.material_categories(updated_by)
  where updated_by is not null;
