create or replace function public.staff_transition_review_request(
  target_request_id text,
  next_status text,
  proposal jsonb default null,
  activity_label text default null
)
returns public.review_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  result public.review_requests;
  actor_is_admin boolean := private.is_admin();
  allowed boolean := false;
  stamp timestamptz := now();
  review_payload jsonb;
  price_value bigint;
  production_value text;
  revisions_value integer;
begin
  if actor_id is null or not private.is_reviewer_or_admin() then
    raise exception 'Reviewer or administrator role required' using errcode = '42501';
  end if;

  select * into result from public.review_requests where id = target_request_id for update;
  if result.id is null then raise exception 'Review request not found' using errcode = 'P0002'; end if;

  allowed :=
    (result.status = 'SUBMITTED' and next_status = 'UNDER_REVIEW')
    or (result.status = 'UNDER_REVIEW' and next_status in ('WAITING_FOR_REPLY', 'READY_FOR_APPROVAL'))
    or (result.status = 'WAITING_FOR_REPLY' and next_status = 'UNDER_REVIEW')
    or (result.status = 'REVISION_REQUESTED' and next_status = 'UNDER_REVIEW')
    or (actor_is_admin and result.status = 'PAYMENT_PENDING' and next_status = 'PAID')
    or (actor_is_admin and result.status = 'PAID' and next_status = 'IN_PRODUCTION')
    or (actor_is_admin and result.status = 'IN_PRODUCTION' and next_status = 'SHIPPED')
    or (actor_is_admin and result.status = 'SHIPPED' and next_status = 'COMPLETED');

  if not allowed then
    raise exception 'Staff transition from % to % is not allowed', result.status, next_status using errcode = '22023';
  end if;

  if next_status = 'READY_FOR_APPROVAL' then
    if proposal is null or jsonb_typeof(proposal) <> 'object' then
      raise exception 'A structured artisan proposal is required' using errcode = '22023';
    end if;
    review_payload := proposal -> 'artisanReview';
    price_value := nullif(proposal ->> 'finalPrice', '')::bigint;
    production_value := nullif(btrim(proposal ->> 'estimatedProduction'), '');
    revisions_value := coalesce((proposal ->> 'revisionsIncluded')::integer, 1);
    if review_payload is null
      or jsonb_typeof(review_payload) <> 'object'
      or nullif(btrim(review_payload ->> 'summary'), '') is null
      or nullif(btrim(review_payload ->> 'olfactiveDirection'), '') is null
      or price_value is null or price_value <= 0
      or production_value is null
      or revisions_value < 0 then
      raise exception 'Complete the artisan proposal, final price, production estimate, and revisions' using errcode = '22023';
    end if;
  end if;

  update public.review_requests
  set status = next_status,
      artisan_review = case when next_status = 'READY_FOR_APPROVAL' then review_payload else artisan_review end,
      recommended_adjustments = case when next_status = 'READY_FOR_APPROVAL'
        then array(select jsonb_array_elements_text(coalesce(proposal -> 'recommendedAdjustments', '[]'::jsonb)))
        else recommended_adjustments end,
      included_items = case when next_status = 'READY_FOR_APPROVAL'
        then array(select jsonb_array_elements_text(coalesce(proposal -> 'includedItems', '[]'::jsonb)))
        else included_items end,
      estimated_production = case when next_status = 'READY_FOR_APPROVAL' then production_value else estimated_production end,
      revisions_included = case when next_status = 'READY_FOR_APPROVAL' then revisions_value else revisions_included end,
      final_price = case when next_status = 'READY_FOR_APPROVAL' then price_value else final_price end,
      reviewed_at = case when next_status = 'READY_FOR_APPROVAL' then stamp else reviewed_at end,
      paid_at = case when next_status = 'PAID' then stamp else paid_at end,
      shipped_at = case when next_status = 'SHIPPED' then stamp else shipped_at end,
      completed_at = case when next_status = 'COMPLETED' then stamp else completed_at end
  where id = target_request_id
  returning * into result;

  insert into public.request_activity(request_id, user_id, event_type, label, metadata)
  values (
    result.id, result.user_id, lower(next_status),
    coalesce(nullif(btrim(activity_label), ''), initcap(lower(replace(next_status, '_', ' ')))),
    jsonb_build_object('actor', 'staff', 'actorId', actor_id)
  );
  return result;
end;
$$;

create or replace function public.send_staff_request_message(target_request_id text, message_body text)
returns public.request_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  owner_id uuid;
  request_status text;
  actor_name text;
  result public.request_messages;
begin
  if actor_id is null or not private.is_reviewer_or_admin() then
    raise exception 'Reviewer or administrator role required' using errcode = '42501';
  end if;
  if message_body is null or char_length(btrim(message_body)) not between 1 and 5000 then
    raise exception 'Message must contain 1 to 5000 characters' using errcode = '22023';
  end if;
  select user_id, status into owner_id, request_status from public.review_requests where id = target_request_id;
  if owner_id is null then raise exception 'Review request not found' using errcode = 'P0002'; end if;
  if request_status not in (
    'SUBMITTED','UNDER_REVIEW','WAITING_FOR_REPLY','READY_FOR_APPROVAL',
    'REVISION_REQUESTED','READY_FOR_CHECKOUT','PAYMENT_PENDING','PAID','IN_PRODUCTION','SHIPPED'
  ) then raise exception 'Conversation is unavailable for this request' using errcode = '22023'; end if;
  select display_name into actor_name from public.profiles where id = actor_id;
  actor_name := coalesce(nullif(btrim(actor_name), ''), 'Indische Artisan');
  insert into public.request_messages(request_id, user_id, sender_role, sender_name, message)
  values (target_request_id, owner_id, 'artisan', actor_name, btrim(message_body)) returning * into result;
  return result;
end;
$$;

revoke all on function public.staff_transition_review_request(text, text, jsonb, text) from public, anon, authenticated;
revoke all on function public.send_staff_request_message(text, text) from public, anon, authenticated;
grant execute on function public.staff_transition_review_request(text, text, jsonb, text) to authenticated;
grant execute on function public.send_staff_request_message(text, text) to authenticated;
