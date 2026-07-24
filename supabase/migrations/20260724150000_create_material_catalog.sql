create table public.material_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  description text check (description is null or char_length(description) <= 1000),
  display_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.materials (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  legacy_library_id text unique,
  legacy_bench_id text unique,
  category_id uuid not null references public.material_categories(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 140),
  material_type text,
  family text,
  layers text[] not null default '{}',
  tags text[] not null default '{}',
  moods text[] not null default '{}',
  description text check (description is null or char_length(description) <= 5000),
  best_used_for text[] not null default '{}',
  pairs_well_with text[] not null default '{}',
  avoid_if text[] not null default '{}',
  media_id uuid references public.cms_media(id) on delete set null,
  image_path text,
  image_alt text check (image_alt is null or char_length(image_alt) <= 500),
  freshness smallint not null default 0 check (freshness between 0 and 10),
  sweetness smallint not null default 0 check (sweetness between 0 and 10),
  warmth smallint not null default 0 check (warmth between 0 and 10),
  green smallint not null default 0 check (green between 0 and 10),
  floral smallint not null default 0 check (floral between 0 and 10),
  woody smallint not null default 0 check (woody between 0 and 10),
  powdery smallint not null default 0 check (powdery between 0 and 10),
  clean smallint not null default 0 check (clean between 0 and 10),
  darkness smallint not null default 0 check (darkness between 0 and 10),
  strangeness smallint not null default 0 check (strangeness between 0 and 10),
  intensity smallint not null default 0 check (intensity between 0 and 10),
  longevity smallint not null default 0 check (longevity between 0 and 10),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'coming_soon', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (legacy_library_id is null or char_length(btrim(legacy_library_id)) between 1 and 160),
  check (legacy_bench_id is null or char_length(btrim(legacy_bench_id)) between 1 and 160),
  check (image_path is null or char_length(btrim(image_path)) between 1 and 1000)
);

comment on table public.material_categories is 'Shared material categories used by The Library and Artisan Bench.';
comment on table public.materials is 'Canonical fragrance material catalog. Legacy aliases preserve existing drafts during migration.';

create index material_categories_public_order_idx
  on public.material_categories(display_order, name)
  where status = 'active';
create index materials_category_public_order_idx
  on public.materials(category_id, display_order, name)
  where status in ('active', 'coming_soon');
create index materials_featured_order_idx
  on public.materials(display_order, name)
  where is_featured and status = 'active';
create index materials_media_id_idx on public.materials(media_id) where media_id is not null;
create index materials_created_by_idx on public.materials(created_by) where created_by is not null;
create index materials_updated_by_idx on public.materials(updated_by) where updated_by is not null;

create or replace function public.set_material_catalog_audit_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

revoke all on function public.set_material_catalog_audit_columns() from public, anon, authenticated;

create trigger material_categories_set_audit_columns
before insert or update on public.material_categories
for each row execute function public.set_material_catalog_audit_columns();

create trigger materials_set_audit_columns
before insert or update on public.materials
for each row execute function public.set_material_catalog_audit_columns();

alter table public.material_categories enable row level security;
alter table public.material_categories force row level security;
alter table public.materials enable row level security;
alter table public.materials force row level security;

create policy material_categories_anon_read_active
on public.material_categories for select to anon
using (status = 'active');

create policy material_categories_authenticated_read
on public.material_categories for select to authenticated
using (status = 'active' or (select private.is_admin()));

create policy material_categories_admin_insert
on public.material_categories for insert to authenticated
with check ((select private.is_admin()));

create policy material_categories_admin_update
on public.material_categories for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy material_categories_admin_delete
on public.material_categories for delete to authenticated
using ((select private.is_admin()));

create policy materials_anon_read_public
on public.materials for select to anon
using (status in ('active', 'coming_soon'));

create policy materials_authenticated_read
on public.materials for select to authenticated
using (status in ('active', 'coming_soon') or (select private.is_admin()));

create policy materials_admin_insert
on public.materials for insert to authenticated
with check ((select private.is_admin()));

create policy materials_admin_update
on public.materials for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy materials_admin_delete
on public.materials for delete to authenticated
using ((select private.is_admin()));

grant select on public.material_categories, public.materials to anon, authenticated;
grant insert, update, delete on public.material_categories, public.materials to authenticated;
