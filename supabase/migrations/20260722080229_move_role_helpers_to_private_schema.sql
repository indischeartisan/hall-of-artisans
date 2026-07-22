create schema if not exists private;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = required_role
        and ur.revoked_at is null
    );
$$;

create or replace function private.is_reviewer_or_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('reviewer')
      or private.has_role('admin')
      or private.has_role('super_admin');
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('admin')
      or private.has_role('super_admin');
$$;

create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('super_admin');
$$;

revoke all on function private.has_role(public.app_role) from public, anon;
revoke all on function private.is_reviewer_or_admin() from public, anon;
revoke all on function private.is_admin() from public, anon;
revoke all on function private.is_super_admin() from public, anon;

grant execute on function private.has_role(public.app_role) to authenticated, service_role;
grant execute on function private.is_reviewer_or_admin() to authenticated, service_role;
grant execute on function private.is_admin() to authenticated, service_role;
grant execute on function private.is_super_admin() to authenticated, service_role;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
);

drop policy if exists artisan_ids_select_own_or_admin on public.artisan_ids;
create policy artisan_ids_select_own_or_admin
on public.artisan_ids
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

drop policy if exists user_roles_select_own_or_admin on public.user_roles;
create policy user_roles_select_own_or_admin
on public.user_roles
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

create or replace function public.assign_app_role(
  target_user_id uuid,
  new_role public.app_role,
  assignment_reason text default null
)
returns public.user_roles
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.user_roles;
begin
  if not private.is_super_admin() then
    raise exception 'Super administrator role required' using errcode = '42501';
  end if;

  if target_user_id is null then
    raise exception 'Target user is required' using errcode = '22023';
  end if;

  insert into public.user_roles(user_id, role, assigned_by, reason)
  values (
    target_user_id,
    new_role,
    auth.uid(),
    left(assignment_reason, 500)
  )
  on conflict (user_id, role)
  do update set
    revoked_at = null,
    assigned_by = auth.uid(),
    reason = left(excluded.reason, 500)
  returning * into result;

  return result;
end;
$$;

create or replace function public.revoke_app_role(
  target_user_id uuid,
  role_to_revoke public.app_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_super_admin() then
    raise exception 'Super administrator role required' using errcode = '42501';
  end if;

  if role_to_revoke = 'customer' then
    raise exception 'The baseline customer role is not revocable through this function'
      using errcode = '22023';
  end if;

  update public.user_roles
  set revoked_at = now(),
      assigned_by = auth.uid()
  where user_id = target_user_id
    and role = role_to_revoke
    and revoked_at is null;
end;
$$;

create or replace function public.manage_artisan_id(
  target_user_id uuid,
  new_status public.artisan_id_status
)
returns public.artisan_ids
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.artisan_ids;
begin
  if not private.is_admin() then
    raise exception 'Administrator role required' using errcode = '42501';
  end if;

  update public.artisan_ids
  set status = new_status,
      suspended_at = case
        when new_status = 'suspended' then coalesce(suspended_at, now())
        else null
      end,
      revoked_at = case
        when new_status = 'revoked' then coalesce(revoked_at, now())
        else null
      end
  where user_id = target_user_id
  returning * into result;

  if result.id is null then
    raise exception 'Artisan ID not found' using errcode = 'P0002';
  end if;

  return result;
end;
$$;

revoke all on function public.assign_app_role(uuid, public.app_role, text)
  from public, anon, authenticated;
revoke all on function public.revoke_app_role(uuid, public.app_role)
  from public, anon, authenticated;
revoke all on function public.manage_artisan_id(uuid, public.artisan_id_status)
  from public, anon, authenticated;

grant execute on function public.assign_app_role(uuid, public.app_role, text)
  to service_role;
grant execute on function public.revoke_app_role(uuid, public.app_role)
  to service_role;
grant execute on function public.manage_artisan_id(uuid, public.artisan_id_status)
  to service_role;

drop function public.is_reviewer_or_admin();
drop function public.is_admin();
drop function public.is_super_admin();
drop function public.has_role(public.app_role);
