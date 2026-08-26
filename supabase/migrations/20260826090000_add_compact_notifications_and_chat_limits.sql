-- Compact, per-recipient notifications and server-side chat throttling.
create table public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  request_id text not null references public.review_requests(id) on delete cascade,
  kind text not null check (kind in ('chat', 'update')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  detail text not null check (char_length(btrim(detail)) between 1 and 500),
  source_id text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create unique index notifications_source_unique_idx
  on public.notifications(kind, source_id, recipient_id)
  where source_id is not null;
create index notifications_recipient_created_idx
  on public.notifications(recipient_id, created_at desc);
create index notifications_recipient_unread_idx
  on public.notifications(recipient_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;
alter table public.notifications force row level security;

create policy notifications_select_own on public.notifications
for select to authenticated
using ((select auth.uid()) = recipient_id);

create policy notifications_update_own on public.notifications
for update to authenticated
using ((select auth.uid()) = recipient_id)
with check ((select auth.uid()) = recipient_id);

revoke all on table public.notifications from public, anon, authenticated;
grant select, update on table public.notifications to authenticated;
grant select, insert, update, delete on table public.notifications to service_role;

create or replace function private.create_request_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
  project_title text;
  notification_kind text;
  notification_detail text;
begin
  select request.user_id, request.perfume_name
    into owner_id, project_title
  from public.review_requests request
  where request.id = new.request_id;

  if owner_id is null then return new; end if;

  if tg_table_name = 'request_messages' then
    if new.sender_role not in ('artisan', 'system') then return new; end if;
    notification_kind := 'chat';
    notification_detail := left(new.message, 500);
  else
    if coalesce(new.metadata ->> 'actor', '') = 'customer' then return new; end if;
    notification_kind := 'update';
    notification_detail := left(new.label, 500);
  end if;

  insert into public.notifications(recipient_id, request_id, kind, title, detail, source_id, created_at)
  values(owner_id, new.request_id, notification_kind, coalesce(nullif(btrim(project_title), ''), 'My Creation'), notification_detail, new.id, new.created_at)
  on conflict (kind, source_id, recipient_id) where source_id is not null do nothing;
  return new;
end;
$$;

revoke all on function private.create_request_notification() from public, anon, authenticated;

create trigger request_messages_create_notification
after insert on public.request_messages
for each row execute function private.create_request_notification();

create trigger request_activity_create_notification
after insert on public.request_activity
for each row execute function private.create_request_notification();

create or replace function public.mark_notifications_read(target_request_id text default null)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare affected integer;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  update public.notifications
  set read_at = now()
  where recipient_id = (select auth.uid())
    and read_at is null
    and (target_request_id is null or request_id = target_request_id);
  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.mark_notifications_read(text) from public, anon, authenticated;
grant execute on function public.mark_notifications_read(text) to authenticated;

create or replace function public.send_customer_request_message_with_attachment(target_request_id text,message_body text,attachment_path text default null)
returns public.request_messages language plpgsql security definer set search_path=''
as $$
declare owner_id uuid:=auth.uid(); request_status text; normalized_message text:=btrim(coalesce(message_body,'')); normalized_attachment text:=nullif(btrim(coalesce(attachment_path,'')),''); result public.request_messages;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if normalized_attachment is null and char_length(normalized_message)=0 then raise exception 'Add a message or an image' using errcode='22023'; end if;
  if char_length(normalized_message)>5000 then raise exception 'Message must contain at most 5000 characters' using errcode='22023'; end if;
  if normalized_attachment is not null and (char_length(normalized_attachment)>1000 or split_part(normalized_attachment,'/',1)<>target_request_id or split_part(normalized_attachment,'/',2)<>owner_id::text) then raise exception 'Invalid attachment path' using errcode='22023'; end if;
  if exists (select 1 from public.request_messages where request_id=target_request_id and sender_role='customer' and created_at > now() - interval '1 second') then raise exception 'Please wait one second before sending another message' using errcode='P0001'; end if;
  select status into request_status from public.review_requests where id=target_request_id and user_id=owner_id;
  if request_status is null then raise exception 'Request not found' using errcode='P0002'; end if;
  if request_status not in ('CONSULTATION','READY_FOR_APPROVAL','REVISION_REQUESTED','READY_FOR_PAYMENT','PAYMENT_PENDING','PAID','IN_PRODUCTION','SHIPPED') then raise exception 'Conversation opens when artisan consultation begins' using errcode='22023'; end if;
  insert into public.request_messages(request_id,user_id,sender_role,sender_name,message,attachment_url)
  values(target_request_id,owner_id,'customer','Customer',case when normalized_message='' then 'Shared an image.' else normalized_message end,normalized_attachment) returning * into result;
  return result;
end;
$$;

revoke all on function public.send_customer_request_message_with_attachment(text,text,text) from public,anon,authenticated;
grant execute on function public.send_customer_request_message_with_attachment(text,text,text) to authenticated;

create or replace function public.send_staff_request_message(target_request_id text, message_body text)
returns public.request_messages
language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid := auth.uid(); owner_id uuid; assigned_id uuid; request_status text; actor_name text; result public.request_messages;
begin
  if actor_id is null or not private.is_reviewer_or_admin() then raise exception 'Reviewer or administrator role required' using errcode='42501'; end if;
  if message_body is null or char_length(btrim(message_body)) not between 1 and 5000 then raise exception 'Message must contain 1 to 5000 characters' using errcode='22023'; end if;
  if exists (select 1 from public.request_messages where request_id=target_request_id and sender_role='artisan' and created_at > now() - interval '1 second') then raise exception 'Please wait one second before sending another message' using errcode='P0001'; end if;
  select user_id,status,assigned_reviewer_id into owner_id,request_status,assigned_id from public.review_requests where id=target_request_id;
  if owner_id is null then raise exception 'Review request not found' using errcode='P0002'; end if;
  if not private.is_admin() and assigned_id is distinct from actor_id then raise exception 'This project is not assigned to your reviewer account' using errcode='42501'; end if;
  if request_status not in ('CONSULTATION','READY_FOR_APPROVAL','REVISION_REQUESTED','READY_FOR_PAYMENT','PAYMENT_PENDING','PAID','IN_PRODUCTION','SHIPPED') then raise exception 'Conversation opens when consultation begins' using errcode='22023'; end if;
  select display_name into actor_name from public.profiles where id=actor_id;
  insert into public.request_messages(request_id,user_id,sender_role,sender_name,message)
  values(target_request_id,owner_id,'artisan',coalesce(nullif(btrim(actor_name),''),'Indische Artisan'),btrim(message_body)) returning * into result;
  return result;
end;
$$;

revoke all on function public.send_staff_request_message(text,text) from public, anon, authenticated;
grant execute on function public.send_staff_request_message(text,text) to authenticated;

update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id = 'chat-attachments';

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='notifications'
  ) then alter publication supabase_realtime add table public.notifications; end if;
end $$;
