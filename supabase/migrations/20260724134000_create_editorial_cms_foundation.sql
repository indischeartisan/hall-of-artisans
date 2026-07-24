create table public.cms_entries (
  id uuid primary key default extensions.gen_random_uuid(),
  content_type text not null check (content_type in ('page', 'academy_lesson', 'library_entry', 'archive_record')),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160),
  locale text not null default 'en' check (locale ~ '^[a-z]{2}(?:-[A-Z]{2})?$'),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  summary text check (summary is null or char_length(summary) <= 1000),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object' and octet_length(content::text) <= 1048576),
  seo jsonb not null default '{}'::jsonb check (jsonb_typeof(seo) = 'object' and octet_length(seo::text) <= 65536),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_type, locale, slug),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create table public.cms_media (
  id uuid primary key default extensions.gen_random_uuid(),
  storage_path text not null unique check (char_length(btrim(storage_path)) between 1 and 1000),
  public_url text check (public_url is null or char_length(public_url) <= 2000),
  media_type text not null check (media_type in ('image', 'video', 'audio', 'document')),
  mime_type text not null check (char_length(btrim(mime_type)) between 1 and 120),
  alt_text text check (alt_text is null or char_length(alt_text) <= 500),
  caption text check (caption is null or char_length(caption) <= 1000),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 65536),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cms_entries is 'Editorial content only; operational order data must not be stored here.';
comment on table public.cms_media is 'Reusable editorial media metadata. Binary files belong in Supabase Storage.';

create index cms_entries_published_lookup_idx
  on public.cms_entries(content_type, locale, published_at desc)
  where status = 'published';
create index cms_entries_admin_updated_idx on public.cms_entries(updated_at desc);
create index cms_media_admin_updated_idx on public.cms_media(updated_at desc);

create or replace function public.set_cms_audit_columns()
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
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

revoke all on function public.set_cms_audit_columns() from public, anon, authenticated;

create trigger cms_entries_set_audit_columns
before insert or update on public.cms_entries
for each row execute function public.set_cms_audit_columns();

create trigger cms_media_set_audit_columns
before insert or update on public.cms_media
for each row execute function public.set_cms_audit_columns();

alter table public.cms_entries enable row level security;
alter table public.cms_entries force row level security;
alter table public.cms_media enable row level security;
alter table public.cms_media force row level security;

create policy cms_entries_read_published
on public.cms_entries for select
to anon, authenticated
using (status = 'published' and published_at <= now());

create policy cms_entries_admin_read_all
on public.cms_entries for select
to authenticated
using ((select private.is_admin()));

create policy cms_entries_admin_insert
on public.cms_entries for insert
to authenticated
with check ((select private.is_admin()));

create policy cms_entries_admin_update
on public.cms_entries for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy cms_entries_admin_delete
on public.cms_entries for delete
to authenticated
using ((select private.is_admin()));

create policy cms_media_admin_all
on public.cms_media for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

grant select on public.cms_entries to anon, authenticated;
grant insert, update, delete on public.cms_entries to authenticated;
grant select, insert, update, delete on public.cms_media to authenticated;
