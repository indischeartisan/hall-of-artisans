create table if not exists public.archive_records (
  id uuid primary key default gen_random_uuid(),
  archive_number text not null unique,
  slug text not null unique,
  title text not null,
  creator text not null,
  moods text[] not null default '{}',
  story text not null default '',
  image_path text,
  image_alt text,
  status text not null default 'active' check (status in ('active','archived')),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.archive_records enable row level security;
alter table public.archive_records force row level security;
create index if not exists archive_records_public_order_idx on public.archive_records (status, display_order, archive_number);
create index if not exists archive_records_owner_idx on public.archive_records (owner_id) where owner_id is not null;

create policy "archive_records_public_read_active" on public.archive_records for select to anon, authenticated using (status = 'active');
create policy "archive_records_admin_read_all" on public.archive_records for select to authenticated using ((select private.is_admin()));
create policy "archive_records_admin_insert" on public.archive_records for insert to authenticated with check ((select private.is_admin()));
create policy "archive_records_admin_update" on public.archive_records for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "archive_records_admin_delete" on public.archive_records for delete to authenticated using ((select private.is_admin()));

grant select on public.archive_records to anon;
grant select, insert, update, delete on public.archive_records to authenticated;
grant all on public.archive_records to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('archive-images','archive-images',true,5242880,array['image/jpeg','image/png','image/webp','image/gif','image/avif','image/svg+xml'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "archive_images_admin_select" on storage.objects for select to authenticated using (bucket_id='archive-images' and (select private.is_admin()));
create policy "archive_images_admin_insert" on storage.objects for insert to authenticated with check (bucket_id='archive-images' and (select private.is_admin()));
create policy "archive_images_admin_update" on storage.objects for update to authenticated using (bucket_id='archive-images' and (select private.is_admin())) with check (bucket_id='archive-images' and (select private.is_admin()));
create policy "archive_images_admin_delete" on storage.objects for delete to authenticated using (bucket_id='archive-images' and (select private.is_admin()));

insert into public.archive_records (archive_number,slug,title,creator,moods,story,image_path,image_alt,display_order) values
('HOA-0127','forest-shower','Forest Shower','Farras Agung',array['Green','Rainwashed'],'A quiet forest after rainfall, where wet leaves, cool air, and softened earth hold the morning still.','/assets/archive/forest-shower.png','Forest Shower perfume bottle',1),
('HOA-0128','violet-library','Violet Library','Anya',array['Violet','Literary'],'Pressed violets resting between old pages, warmed by polished wood and the hush of a private library.','/assets/archive/violet-library.png','Violet Library perfume bottle',2),
('HOA-0129','tonka-rain','Tonka Rain','Raka',array['Amber','Misty'],'Soft rain over tonka and dark timber, lingering like a familiar coat carried home at dusk.','/assets/archive/tonka-rain.png','Tonka Rain perfume bottle',3),
('HOA-0130','sunlit-remember','Sunlit Remember','Livia Natassa',array['Radiant','Nostalgic'],'A golden recollection of sunlit rooms, pale flowers, and a summer afternoon preserved in glass.','/assets/archive/sunlit-remember.png','Sunlit Remember perfume bottle',4),
('HOA-0131','amber-letter','Amber Letter','Noah Letterwell',array['Amber','Intimate'],'An unopened letter beside amber resin and warm paper, carrying words that time could not erase.','/assets/archive/amber-letter.png','Amber Letter perfume bottle',5),
('HOA-0132','white-fig','White Fig','Celine Blanc',array['Clean','Botanical'],'Milky fig, pale woods, and sun-warmed leaves composed with the clarity of an ivory morning.','/assets/archive/white-fig.png','White Fig perfume bottle',6),
('HOA-0133','plum-jam-room','Plum Jam Room','Milo Berry',array['Gourmand','Velvet'],'Dark plum preserves, old velvet, and the glow of a room prepared for an indulgent winter gathering.','/assets/archive/plum-jam-room.png','Plum Jam Room perfume bottle',7),
('HOA-0134','misty-foam','Misty Foam','Elara Frost',array['Aquatic','Ethereal'],'Sea mist dissolving into airy foam, cool minerals, and the distant shimmer of a quiet shore.','/assets/archive/misty-foam.png','Misty Foam perfume bottle',8),
('HOA-0135','sandal-script','Sandal Script','Devan Singh',array['Woody','Contemplative'],'Sandalwood and ink traced across handmade paper, calm as a thought written before sunrise.','/assets/archive/sandal-script.png','Sandal Script perfume bottle',9),
('HOA-0136','night-scholar','Night Scholar','Alistair Moore',array['Nocturnal','Mysterious'],'Midnight study rooms, blue-black ink, and resinous woods beneath a sky crowded with stars.','/assets/archive/night-scholar.png','Night Scholar perfume bottle',10),
('HOA-0137','rose-discourse','Rose Discourse','Isabelle Rose',array['Floral','Poetic'],'A conversation in rose petals—measured, luminous, and softened by powdery woods and afternoon light.','/assets/archive/rose-discourse.png','Rose Discourse perfume bottle',11),
('HOA-0138','golden-silence','Golden Silence','Marcus Levy',array['Golden','Serene'],'A still composition of pale amber, quiet woods, and warm light suspended at the end of day.','/assets/archive/golden-silence.png','Golden Silence perfume bottle',12)
on conflict (archive_number) do nothing;
