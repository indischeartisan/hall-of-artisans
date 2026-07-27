create or replace function public.get_assigned_customer_summaries()
returns table(user_id uuid, display_name text, artisan_id text)
language plpgsql
security definer
set search_path = ''
stable
as $$
declare actor_id uuid := auth.uid();
begin
  if actor_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if not exists (
    select 1 from public.user_roles r
    where r.user_id = actor_id and r.role = 'reviewer' and r.revoked_at is null
  ) then raise exception 'Reviewer access required' using errcode = '42501'; end if;

  return query
  select distinct request.user_id, profile.display_name, identity.public_id
  from public.review_requests request
  join public.profiles profile on profile.id = request.user_id
  left join public.artisan_ids identity on identity.user_id = request.user_id
  where request.assigned_reviewer_id = actor_id
    and request.status <> 'DRAFT_PREVIEW'
    and profile.deleted_at is null and profile.suspended_at is null;
end;
$$;

revoke all on function public.get_assigned_customer_summaries() from public, anon;
grant execute on function public.get_assigned_customer_summaries() to authenticated;
