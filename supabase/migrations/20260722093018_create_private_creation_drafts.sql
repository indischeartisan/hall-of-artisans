create type public.creation_mode as enum ('artisan_bench', 'described');
create type public.creation_draft_status as enum ('draft', 'ready');

create table public.creation_drafts (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode public.creation_mode not null,
  schema_version integer not null default 1
    check (schema_version between 1 and 1000),
  draft_name text not null
    check (char_length(btrim(draft_name)) between 1 and 160),
  perfume_name text
    check (perfume_name is null or char_length(btrim(perfume_name)) between 1 and 160),
  status public.creation_draft_status not null default 'draft',
  payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(payload) = 'object')
    check (octet_length(payload::text) <= 524288),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.creation_drafts is
  'Private editable creation drafts owned by one authenticated artisan.';
comment on column public.creation_drafts.payload is
  'Versioned mode-specific draft state. Limited to 512 KiB.';

create index creation_drafts_user_updated_idx
  on public.creation_drafts(user_id, updated_at desc);

create trigger creation_drafts_set_updated_at
before update on public.creation_drafts
for each row execute function public.set_updated_at();

alter table public.creation_drafts enable row level security;
alter table public.creation_drafts force row level security;

create policy creation_drafts_select_own
on public.creation_drafts
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
);

create policy creation_drafts_insert_own
on public.creation_drafts
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
);

create policy creation_drafts_update_own
on public.creation_drafts
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
);

create policy creation_drafts_delete_own
on public.creation_drafts
for delete
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
);

revoke all on table public.creation_drafts from public, anon;
grant select, insert, update, delete on table public.creation_drafts to authenticated;
grant select, insert, update, delete on table public.creation_drafts to service_role;
