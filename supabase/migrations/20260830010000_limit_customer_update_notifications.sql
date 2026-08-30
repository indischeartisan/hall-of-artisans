-- Customer update notifications are intentionally limited to major milestones.
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
    if new.event_type not in ('consultation', 'paid', 'payment_confirmed', 'shipped') then return new; end if;
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

-- Remove older update rows that do not represent one of the supported milestones.
delete from public.notifications notification
where notification.kind = 'update'
  and not exists (
    select 1
    from public.request_activity activity
    where activity.id = notification.source_id
      and activity.event_type in ('consultation', 'paid', 'payment_confirmed', 'shipped')
  );
