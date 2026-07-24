create index cms_entries_created_by_idx on public.cms_entries(created_by) where created_by is not null;
create index cms_entries_updated_by_idx on public.cms_entries(updated_by) where updated_by is not null;
create index cms_media_created_by_idx on public.cms_media(created_by) where created_by is not null;
create index cms_media_updated_by_idx on public.cms_media(updated_by) where updated_by is not null;

drop policy cms_entries_read_published on public.cms_entries;
drop policy cms_entries_admin_read_all on public.cms_entries;

create policy cms_entries_anon_read_published
on public.cms_entries for select
to anon
using (status = 'published' and published_at <= now());

create policy cms_entries_authenticated_read
on public.cms_entries for select
to authenticated
using (
  (status = 'published' and published_at <= now())
  or (select private.is_admin())
);
