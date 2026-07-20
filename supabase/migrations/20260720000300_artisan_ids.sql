create table public.artisan_ids (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete restrict,
  public_id text not null unique default public.next_artisan_public_id() check (public_id ~ '^HA-[0-9]{4}-[0-9]{6}$'),
  status public.artisan_id_status not null default 'active',
  display_name_snapshot text not null check (char_length(btrim(display_name_snapshot)) between 1 and 120),
  issued_at timestamptz not null default now(),
  suspended_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index artisan_ids_status_idx on public.artisan_ids(status);
create trigger artisan_ids_set_updated_at before update on public.artisan_ids
for each row execute function public.set_updated_at();

create or replace function public.issue_artisan_id()
returns public.artisan_ids
language plpgsql
security definer
set search_path = ''
as $$
declare existing public.artisan_ids; profile_row public.profiles; email_verified timestamptz;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into existing from public.artisan_ids where user_id=auth.uid();
  if existing.id is not null then return existing; end if;
  select email_confirmed_at into email_verified from auth.users where id=auth.uid();
  if email_verified is null then raise exception 'Verified email required' using errcode='42501'; end if;
  select * into profile_row from public.profiles where id=auth.uid() and is_profile_complete and suspended_at is null and deleted_at is null;
  if profile_row.id is null then raise exception 'Complete profile required' using errcode='P0002'; end if;
  insert into public.artisan_ids(user_id,display_name_snapshot) values(auth.uid(),profile_row.display_name) returning * into existing;
  return existing;
exception when unique_violation then
  select * into existing from public.artisan_ids where user_id=auth.uid();
  return existing;
end;
$$;

create or replace function public.manage_artisan_id(target_user_id uuid, new_status public.artisan_id_status)
returns public.artisan_ids
language plpgsql security definer set search_path = ''
as $$
declare result public.artisan_ids;
begin
  if not public.is_admin() then raise exception 'Administrator role required' using errcode='42501'; end if;
  update public.artisan_ids set status=new_status,suspended_at=case when new_status='suspended' then coalesce(suspended_at,now()) else null end,revoked_at=case when new_status='revoked' then coalesce(revoked_at,now()) else null end where user_id=target_user_id returning * into result;
  if result.id is null then raise exception 'Artisan ID not found' using errcode='P0002'; end if;
  return result;
end;
$$;

revoke all on function public.issue_artisan_id() from public, anon;
revoke all on function public.manage_artisan_id(uuid,public.artisan_id_status) from public, anon;
grant execute on function public.issue_artisan_id(), public.manage_artisan_id(uuid,public.artisan_id_status) to authenticated;
