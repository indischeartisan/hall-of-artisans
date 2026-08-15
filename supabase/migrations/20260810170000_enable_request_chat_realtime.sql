-- Keep Bespoke project rooms synchronized across customer and staff sessions.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'request_messages'
  ) then
    alter publication supabase_realtime add table public.request_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'request_activity'
  ) then
    alter publication supabase_realtime add table public.request_activity;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'review_requests'
  ) then
    alter publication supabase_realtime add table public.review_requests;
  end if;
end $$;

-- Store a neutral name. Each interface decides who “You” means from sender_role.
create or replace function public.send_customer_request_message(target_request_id text, message_body text)
returns public.request_messages
language plpgsql security definer set search_path = ''
as $$
declare owner_id uuid := auth.uid(); request_status text; result public.request_messages;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if message_body is null or char_length(btrim(message_body)) not between 1 and 5000 then raise exception 'Message must contain 1 to 5000 characters' using errcode='22023'; end if;
  select status into request_status from public.review_requests where id=target_request_id and user_id=owner_id;
  if request_status is null then raise exception 'Request not found' using errcode='P0002'; end if;
  if request_status not in ('CONSULTATION','READY_FOR_APPROVAL','REVISION_REQUESTED','READY_FOR_PAYMENT','PAYMENT_PENDING','PAID','IN_PRODUCTION','SHIPPED') then raise exception 'Conversation opens when artisan consultation begins' using errcode='22023'; end if;
  insert into public.request_messages(request_id,user_id,sender_role,sender_name,message)
    values(target_request_id,owner_id,'customer','Customer',btrim(message_body)) returning * into result;
  return result;
end;
$$;

revoke all on function public.send_customer_request_message(text,text) from public, anon, authenticated;
grant execute on function public.send_customer_request_message(text,text) to authenticated;

create or replace function public.mark_staff_request_messages_read(target_request_id text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid := auth.uid(); assigned_id uuid;
begin
  if actor_id is null or not private.is_reviewer_or_admin() then raise exception 'Reviewer or administrator role required' using errcode='42501'; end if;
  select assigned_reviewer_id into assigned_id from public.review_requests where id=target_request_id;
  if assigned_id is null then raise exception 'Review request not found' using errcode='P0002'; end if;
  if not private.is_admin() and assigned_id is distinct from actor_id then raise exception 'This project is not assigned to your reviewer account' using errcode='42501'; end if;
  update public.request_messages set read_at=now()
  where request_id=target_request_id and sender_role='customer' and read_at is null;
end;
$$;

revoke all on function public.mark_staff_request_messages_read(text) from public, anon, authenticated;
grant execute on function public.mark_staff_request_messages_read(text) to authenticated;
