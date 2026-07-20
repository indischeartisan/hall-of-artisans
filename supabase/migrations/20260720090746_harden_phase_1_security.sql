-- Avoid per-row auth function evaluation in RLS policies.
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
using (id = (select auth.uid()) and suspended_at is null and deleted_at is null)
with check (id = (select auth.uid()) and suspended_at is null and deleted_at is null);

drop policy if exists user_roles_select_own_or_admin on public.user_roles;
create policy user_roles_select_own_or_admin on public.user_roles for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists artisan_ids_select_own_or_admin on public.artisan_ids;
create policy artisan_ids_select_own_or_admin on public.artisan_ids for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create index if not exists user_roles_assigned_by_idx
  on public.user_roles(assigned_by)
  where assigned_by is not null;

-- These RPCs intentionally remain SECURITY DEFINER and executable by authenticated
-- users. Each function performs its own auth.uid()/role authorization before any
-- privileged mutation. PUBLIC and anon execute privileges remain revoked.
