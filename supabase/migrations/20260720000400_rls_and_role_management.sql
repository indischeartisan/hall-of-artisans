alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.artisan_ids enable row level security;

revoke all on public.profiles, public.user_roles, public.artisan_ids from anon, authenticated;
grant select on public.profiles, public.user_roles, public.artisan_ids to authenticated;
grant update(display_name,portrait_path) on public.profiles to authenticated;

create policy profiles_select_own_or_admin on public.profiles for select to authenticated
using (id=auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated
using (id=auth.uid() and suspended_at is null and deleted_at is null)
with check (id=auth.uid() and suspended_at is null and deleted_at is null);

create policy user_roles_select_own_or_admin on public.user_roles for select to authenticated
using (user_id=auth.uid() or public.is_admin());

create policy artisan_ids_select_own_or_admin on public.artisan_ids for select to authenticated
using (user_id=auth.uid() or public.is_admin());

create or replace function public.assign_app_role(target_user_id uuid, new_role public.app_role, assignment_reason text default null)
returns public.user_roles
language plpgsql security definer set search_path = ''
as $$
declare result public.user_roles;
begin
  if not public.is_super_admin() then raise exception 'Super administrator role required' using errcode='42501'; end if;
  if target_user_id is null then raise exception 'Target user is required' using errcode='22023'; end if;
  insert into public.user_roles(user_id,role,assigned_by,reason) values(target_user_id,new_role,auth.uid(),left(assignment_reason,500))
  on conflict(user_id,role) do update set revoked_at=null,assigned_by=auth.uid(),reason=left(excluded.reason,500)
  returning * into result;
  return result;
end;
$$;

create or replace function public.revoke_app_role(target_user_id uuid, role_to_revoke public.app_role)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_super_admin() then raise exception 'Super administrator role required' using errcode='42501'; end if;
  if role_to_revoke='customer' then raise exception 'The baseline customer role is not revocable through this function' using errcode='22023'; end if;
  update public.user_roles set revoked_at=now(),assigned_by=auth.uid() where user_id=target_user_id and role=role_to_revoke and revoked_at is null;
end;
$$;

revoke all on function public.assign_app_role(uuid,public.app_role,text), public.revoke_app_role(uuid,public.app_role) from public, anon;
grant execute on function public.assign_app_role(uuid,public.app_role,text), public.revoke_app_role(uuid,public.app_role) to authenticated;

revoke usage on sequence public.artisan_public_number_seq from anon, authenticated;
