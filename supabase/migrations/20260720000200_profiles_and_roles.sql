create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Artisan' check (char_length(btrim(display_name)) between 1 and 120),
  portrait_path text check (portrait_path is null or char_length(portrait_path) <= 500),
  is_profile_complete boolean not null default false,
  profile_completed_at timestamptz,
  suspended_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((is_profile_complete and profile_completed_at is not null) or (not is_profile_complete))
);

create table public.user_roles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  assigned_by uuid references auth.users(id) on delete set null,
  reason text check (reason is null or char_length(reason) <= 500),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, role)
);

create index user_roles_active_user_idx on public.user_roles(user_id) where revoked_at is null;
create index user_roles_active_role_idx on public.user_roles(role) where revoked_at is null;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_display_name text;
begin
  safe_display_name := left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(coalesce(new.email,''), '@', 1), ''), 'Artisan'), 120);
  insert into public.profiles(id, display_name) values(new.id, safe_display_name)
  on conflict (id) do nothing;
  insert into public.user_roles(user_id, role, reason) values(new.id, 'customer', 'Default signup role')
  on conflict (user_id, role) do update set revoked_at = null, assigned_by = null, reason = 'Default signup role';
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = required_role and ur.revoked_at is null);
$$;

create or replace function public.is_reviewer_or_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select public.has_role('reviewer') or public.has_role('admin') or public.has_role('super_admin'); $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select public.has_role('admin') or public.has_role('super_admin'); $$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select public.has_role('super_admin'); $$;

create or replace function public.complete_profile(new_display_name text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare result public.profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if new_display_name is null or char_length(btrim(new_display_name)) not between 1 and 120 then raise exception 'Display name must contain 1 to 120 characters' using errcode='22023'; end if;
  update public.profiles set display_name=btrim(new_display_name),is_profile_complete=true,profile_completed_at=coalesce(profile_completed_at,now()) where id=auth.uid() and suspended_at is null and deleted_at is null returning * into result;
  if result.id is null then raise exception 'Eligible profile not found' using errcode='P0002'; end if;
  return result;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.has_role(public.app_role) from public, anon;
revoke all on function public.is_reviewer_or_admin() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_super_admin() from public, anon;
revoke all on function public.complete_profile(text) from public, anon;
grant execute on function public.has_role(public.app_role), public.is_reviewer_or_admin(), public.is_admin(), public.is_super_admin(), public.complete_profile(text) to authenticated;
