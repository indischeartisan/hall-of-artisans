create sequence public.review_request_number_seq as bigint start with 473 increment by 1 no cycle;
create sequence public.customer_order_number_seq as bigint start with 1 increment by 1 no cycle;

create table public.review_requests (
  id text primary key default extensions.gen_random_uuid()::text,
  user_id uuid not null references public.profiles(id) on delete cascade,
  creation_id text not null default extensions.gen_random_uuid()::text,
  request_number text not null default 'Preview only',
  status text not null default 'DRAFT_PREVIEW' check (status in (
    'DRAFT_PREVIEW','SUBMITTED','UNDER_REVIEW','WAITING_FOR_REPLY',
    'READY_FOR_APPROVAL','REVISION_REQUESTED','READY_FOR_CHECKOUT',
    'PAYMENT_PENDING','PAID','IN_PRODUCTION','SHIPPED','COMPLETED','CANCELLED'
  )),
  creation_mode public.creation_mode not null,
  preview_snapshot jsonb not null check (jsonb_typeof(preview_snapshot) = 'object' and octet_length(preview_snapshot::text) <= 1048576),
  submission_id text,
  submission_snapshot jsonb check (submission_snapshot is null or (jsonb_typeof(submission_snapshot) = 'object' and octet_length(submission_snapshot::text) <= 1048576)),
  perfume_name text not null check (char_length(btrim(perfume_name)) between 1 and 160),
  concentration text not null check (char_length(btrim(concentration)) between 1 and 80),
  bottle_size text not null check (char_length(btrim(bottle_size)) between 1 and 80),
  fragrance_direction text[] not null default '{}',
  top_notes text[] not null default '{}',
  heart_notes text[] not null default '{}',
  base_notes text[] not null default '{}',
  fragrance_brief text not null default '' check (char_length(fragrance_brief) <= 20000),
  story_card_data jsonb not null default '{}'::jsonb check (jsonb_typeof(story_card_data) = 'object'),
  customer_notes text not null default '' check (char_length(customer_notes) <= 10000),
  country_code text not null default 'ID' check (country_code ~ '^[A-Z]{2}$'),
  pricing_region text not null default 'Indonesia' check (char_length(pricing_region) between 1 and 120),
  currency text not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  estimated_price_min bigint not null default 699000 check (estimated_price_min >= 0),
  estimated_price_max bigint not null default 1499000 check (estimated_price_max >= estimated_price_min),
  final_price bigint check (final_price is null or final_price > 0),
  artisan_review jsonb check (artisan_review is null or jsonb_typeof(artisan_review) = 'object'),
  recommended_adjustments text[] not null default '{}',
  included_items text[] not null default '{}',
  estimated_production text,
  revisions_included integer check (revisions_included is null or revisions_included >= 0),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  paid_at timestamptz,
  shipped_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index review_requests_request_number_unique_idx
  on public.review_requests(request_number) where request_number <> 'Preview only';
create index review_requests_user_updated_idx on public.review_requests(user_id, updated_at desc);
create index review_requests_status_idx on public.review_requests(status, updated_at desc);
create trigger review_requests_set_updated_at before update on public.review_requests
for each row execute function public.set_updated_at();

create table public.request_messages (
  id text primary key default extensions.gen_random_uuid()::text,
  request_id text not null references public.review_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null check (sender_role in ('customer','artisan','system')),
  sender_name text not null check (char_length(btrim(sender_name)) between 1 and 120),
  message text not null check (char_length(btrim(message)) between 1 and 5000),
  attachment_url text check (attachment_url is null or char_length(attachment_url) <= 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index request_messages_request_created_idx on public.request_messages(request_id, created_at);
create index request_messages_user_created_idx on public.request_messages(user_id, created_at desc);

create table public.request_activity (
  id text primary key default extensions.gen_random_uuid()::text,
  request_id text not null references public.review_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (char_length(btrim(event_type)) between 1 and 80),
  label text not null check (char_length(btrim(label)) between 1 and 500),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);
create index request_activity_request_created_idx on public.request_activity(request_id, created_at);
create index request_activity_user_created_idx on public.request_activity(user_id, created_at desc);

create table public.customer_orders (
  id text primary key default extensions.gen_random_uuid()::text,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_number text not null unique,
  amount bigint not null check (amount > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','refunded')),
  production_status text not null default 'not_started' check (production_status in ('not_started','in_production','completed')),
  shipping_status text not null default 'not_shipped' check (shipping_status in ('not_shipped','shipped','delivered')),
  tracking_number text,
  shipping_preference text not null default 'together' check (shipping_preference in ('together','separately')),
  checkout_details jsonb not null check (jsonb_typeof(checkout_details) = 'object' and octet_length(checkout_details::text) <= 32768),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customer_orders_user_created_idx on public.customer_orders(user_id, created_at desc);
create trigger customer_orders_set_updated_at before update on public.customer_orders
for each row execute function public.set_updated_at();

create table public.order_items (
  id text primary key default extensions.gen_random_uuid()::text,
  order_id text not null references public.customer_orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  review_request_id text not null unique references public.review_requests(id) on delete restrict,
  submission_id text not null,
  submission_snapshot jsonb not null check (jsonb_typeof(submission_snapshot) = 'object' and octet_length(submission_snapshot::text) <= 1048576),
  creation_name text not null check (char_length(btrim(creation_name)) between 1 and 160),
  amount bigint not null check (amount > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  production_status text not null default 'not_started' check (production_status in ('not_started','in_production','completed')),
  shipping_status text not null default 'not_shipped' check (shipping_status in ('not_shipped','shipped','delivered')),
  tracking_number text,
  created_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_user_idx on public.order_items(user_id, created_at desc);

alter table public.review_requests enable row level security;
alter table public.review_requests force row level security;
alter table public.request_messages enable row level security;
alter table public.request_messages force row level security;
alter table public.request_activity enable row level security;
alter table public.request_activity force row level security;
alter table public.customer_orders enable row level security;
alter table public.customer_orders force row level security;
alter table public.order_items enable row level security;
alter table public.order_items force row level security;

create policy review_requests_select_own_or_staff on public.review_requests
for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_reviewer_or_admin()));
create policy request_messages_select_own_or_staff on public.request_messages
for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_reviewer_or_admin()));
create policy request_activity_select_own_or_staff on public.request_activity
for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_reviewer_or_admin()));
create policy customer_orders_select_own_or_staff on public.customer_orders
for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_reviewer_or_admin()));
create policy order_items_select_own_or_staff on public.order_items
for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_reviewer_or_admin()));

revoke all on table public.review_requests, public.request_messages, public.request_activity,
  public.customer_orders, public.order_items from public, anon, authenticated;
grant select on table public.review_requests, public.request_messages, public.request_activity,
  public.customer_orders, public.order_items to authenticated;
grant select, insert, update, delete on table public.review_requests, public.request_messages,
  public.request_activity, public.customer_orders, public.order_items to service_role;

create or replace function public.create_review_preview(request_payload jsonb)
returns public.review_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  result public.review_requests;
  requested_id text := nullif(btrim(request_payload ->> 'id'), '');
  snapshot jsonb := request_payload -> 'previewSnapshot';
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if request_payload is null or jsonb_typeof(request_payload) <> 'object' then raise exception 'Invalid request payload' using errcode = '22023'; end if;
  if snapshot is null or jsonb_typeof(snapshot) <> 'object' then raise exception 'A creation snapshot is required' using errcode = '22023'; end if;

  if requested_id is not null then
    select * into result from public.review_requests
      where id = requested_id and user_id = owner_id and status = 'DRAFT_PREVIEW' for update;
  end if;

  if result.id is null then
    insert into public.review_requests(
      id,user_id,creation_id,creation_mode,preview_snapshot,perfume_name,concentration,bottle_size,
      fragrance_direction,top_notes,heart_notes,base_notes,fragrance_brief,story_card_data,
      customer_notes,country_code,pricing_region,currency,estimated_price_min,estimated_price_max
    ) values (
      coalesce(requested_id, extensions.gen_random_uuid()::text), owner_id,
      coalesce(nullif(request_payload ->> 'creationId',''), extensions.gen_random_uuid()::text),
      (request_payload ->> 'creationMode')::public.creation_mode, snapshot,
      btrim(request_payload ->> 'perfumeName'), btrim(request_payload ->> 'concentration'),
      coalesce(nullif(btrim(request_payload ->> 'bottleSize'),''),'To be confirmed'),
      array(select jsonb_array_elements_text(coalesce(request_payload -> 'fragranceDirection','[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(request_payload -> 'topNotes','[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(request_payload -> 'heartNotes','[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(request_payload -> 'baseNotes','[]'::jsonb))),
      coalesce(request_payload ->> 'fragranceBrief',''), coalesce(request_payload -> 'storyCardData','{}'::jsonb),
      coalesce(request_payload ->> 'customerNotes',''), coalesce(nullif(request_payload ->> 'countryCode',''),'ID'),
      coalesce(nullif(request_payload ->> 'pricingRegion',''),'Indonesia'), coalesce(nullif(request_payload ->> 'currency',''),'IDR'),
      coalesce((request_payload ->> 'estimatedPriceMin')::bigint,699000),
      coalesce((request_payload ->> 'estimatedPriceMax')::bigint,1499000)
    ) returning * into result;
  else
    update public.review_requests set
      preview_snapshot = snapshot,
      perfume_name = btrim(request_payload ->> 'perfumeName'),
      concentration = btrim(request_payload ->> 'concentration'),
      bottle_size = coalesce(nullif(btrim(request_payload ->> 'bottleSize'),''),'To be confirmed'),
      fragrance_direction = array(select jsonb_array_elements_text(coalesce(request_payload -> 'fragranceDirection','[]'::jsonb))),
      top_notes = array(select jsonb_array_elements_text(coalesce(request_payload -> 'topNotes','[]'::jsonb))),
      heart_notes = array(select jsonb_array_elements_text(coalesce(request_payload -> 'heartNotes','[]'::jsonb))),
      base_notes = array(select jsonb_array_elements_text(coalesce(request_payload -> 'baseNotes','[]'::jsonb))),
      fragrance_brief = coalesce(request_payload ->> 'fragranceBrief',''),
      story_card_data = coalesce(request_payload -> 'storyCardData','{}'::jsonb),
      customer_notes = coalesce(request_payload ->> 'customerNotes','')
    where id = result.id returning * into result;
  end if;
  return result;
end;
$$;

create or replace function public.submit_review_request(target_request_id text)
returns public.review_requests
language plpgsql security definer set search_path = ''
as $$
declare owner_id uuid := auth.uid(); result public.review_requests; stamp timestamptz := now();
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into result from public.review_requests where id=target_request_id and user_id=owner_id for update;
  if result.id is null then raise exception 'Preview not found' using errcode='P0002'; end if;
  if result.status <> 'DRAFT_PREVIEW' then raise exception 'Only a preview can be submitted' using errcode='22023'; end if;
  update public.review_requests set status='SUBMITTED',
    request_number='HOA-RV-'||to_char(stamp,'YYYY')||'-'||lpad(nextval('public.review_request_number_seq')::text,5,'0'),
    submission_id=extensions.gen_random_uuid()::text, submission_snapshot=preview_snapshot,
    submitted_at=stamp
  where id=target_request_id returning * into result;
  insert into public.request_messages(request_id,user_id,sender_role,sender_name,message,read_at)
    values(result.id,owner_id,'system','The Hall of Artisans','Your creation snapshot has been received for artisan review.',stamp);
  insert into public.request_activity(request_id,user_id,event_type,label,metadata)
    values(result.id,owner_id,'submitted','Immutable creation snapshot submitted for artisan review',jsonb_build_object('actor','customer'));
  return result;
end;
$$;

create or replace function public.customer_transition_review_request(target_request_id text, next_status text, activity_label text default null)
returns public.review_requests
language plpgsql security definer set search_path = ''
as $$
declare owner_id uuid := auth.uid(); result public.review_requests; allowed boolean := false; stamp timestamptz := now();
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into result from public.review_requests where id=target_request_id and user_id=owner_id for update;
  if result.id is null then raise exception 'Request not found' using errcode='P0002'; end if;
  allowed := (next_status='CANCELLED' and result.status in ('DRAFT_PREVIEW','SUBMITTED','UNDER_REVIEW','WAITING_FOR_REPLY','READY_FOR_APPROVAL','REVISION_REQUESTED','READY_FOR_CHECKOUT'))
    or (result.status='WAITING_FOR_REPLY' and next_status='UNDER_REVIEW')
    or (result.status='READY_FOR_APPROVAL' and next_status in ('REVISION_REQUESTED','READY_FOR_CHECKOUT'));
  if not allowed then raise exception 'Customer transition is not allowed' using errcode='22023'; end if;
  if next_status='READY_FOR_CHECKOUT' and (result.final_price is null or result.final_price <= 0) then
    raise exception 'A final price is required before checkout approval' using errcode='22023';
  end if;
  update public.review_requests set status=next_status,
    approved_at=case when next_status='READY_FOR_CHECKOUT' then stamp else approved_at end
  where id=target_request_id returning * into result;
  insert into public.request_activity(request_id,user_id,event_type,label,metadata)
    values(result.id,owner_id,lower(next_status),coalesce(nullif(btrim(activity_label),''),lower(replace(next_status,'_',' '))),jsonb_build_object('actor','customer'));
  return result;
end;
$$;

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
  if request_status not in ('SUBMITTED','UNDER_REVIEW','WAITING_FOR_REPLY','READY_FOR_APPROVAL','REVISION_REQUESTED','READY_FOR_CHECKOUT','PAYMENT_PENDING','PAID','IN_PRODUCTION','SHIPPED') then
    raise exception 'Chat is unavailable for this request' using errcode='22023';
  end if;
  insert into public.request_messages(request_id,user_id,sender_role,sender_name,message,read_at)
    values(target_request_id,owner_id,'customer','You',btrim(message_body),now()) returning * into result;
  if request_status='WAITING_FOR_REPLY' then
    update public.review_requests set status='UNDER_REVIEW' where id=target_request_id;
    insert into public.request_activity(request_id,user_id,event_type,label,metadata)
      values(target_request_id,owner_id,'under_review','Customer replied; artisan review resumed',jsonb_build_object('actor','customer'));
  end if;
  return result;
end;
$$;

create or replace function public.create_order_checkout(request_ids text[], checkout_payload jsonb)
returns public.customer_orders
language plpgsql security definer set search_path = ''
as $$
declare owner_id uuid := auth.uid(); result public.customer_orders; request_count integer; request_currency text; request_total bigint; stamp timestamptz := now();
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if request_ids is null or cardinality(request_ids)=0 then raise exception 'Select at least one creation' using errcode='22023'; end if;
  if checkout_payload is null or jsonb_typeof(checkout_payload)<>'object'
    or nullif(btrim(checkout_payload->>'recipient'),'') is null
    or nullif(btrim(checkout_payload->>'address'),'') is null
    or nullif(btrim(checkout_payload->>'phone'),'') is null then
    raise exception 'Complete recipient, address, and phone details' using errcode='22023';
  end if;
  select count(*),min(currency),sum(final_price) into request_count,request_currency,request_total
  from public.review_requests where id=any(request_ids) and user_id=owner_id and status='READY_FOR_CHECKOUT'
    and final_price>0 and submission_id is not null and submission_snapshot is not null;
  if request_count<>cardinality(request_ids) then raise exception 'One or more creations are not eligible for checkout' using errcode='22023'; end if;
  if (select count(distinct currency) from public.review_requests where id=any(request_ids) and user_id=owner_id)<>1 then raise exception 'All creations must use the same currency' using errcode='22023'; end if;
  if exists(select 1 from public.order_items where review_request_id=any(request_ids)) then raise exception 'A selected creation already belongs to an order' using errcode='23505'; end if;
  insert into public.customer_orders(user_id,order_number,amount,currency,shipping_preference,checkout_details)
    values(owner_id,'HO-'||to_char(stamp,'YYYY')||'-'||lpad(nextval('public.customer_order_number_seq')::text,5,'0'),request_total,request_currency,
      case when checkout_payload->>'shippingPreference'='separately' then 'separately' else 'together' end,checkout_payload)
    returning * into result;
  insert into public.order_items(order_id,user_id,review_request_id,submission_id,submission_snapshot,creation_name,amount,currency)
    select result.id,owner_id,id,submission_id,submission_snapshot,perfume_name,final_price,currency
    from public.review_requests where id=any(request_ids) and user_id=owner_id;
  update public.review_requests set status='PAYMENT_PENDING' where id=any(request_ids) and user_id=owner_id;
  insert into public.request_activity(request_id,user_id,event_type,label,metadata)
    select id,owner_id,'payment_pending','Checkout created; awaiting payment confirmation',jsonb_build_object('actor','customer','orderId',result.id)
    from public.review_requests where id=any(request_ids) and user_id=owner_id;
  return result;
end;
$$;

revoke all on function public.create_review_preview(jsonb) from public, anon, authenticated;
revoke all on function public.submit_review_request(text) from public, anon, authenticated;
revoke all on function public.customer_transition_review_request(text,text,text) from public, anon, authenticated;
revoke all on function public.send_customer_request_message(text,text) from public, anon, authenticated;
revoke all on function public.create_order_checkout(text[],jsonb) from public, anon, authenticated;
grant execute on function public.create_review_preview(jsonb), public.submit_review_request(text),
  public.customer_transition_review_request(text,text,text), public.send_customer_request_message(text,text),
  public.create_order_checkout(text[],jsonb) to authenticated;
grant usage, select on sequence public.review_request_number_seq, public.customer_order_number_seq to service_role;

comment on table public.review_requests is 'Customer-owned bespoke creation previews and immutable review submissions.';
comment on table public.request_messages is 'Conversation records scoped to one customer review request.';
comment on table public.request_activity is 'Append-only customer-visible review workflow history.';
comment on table public.customer_orders is 'Order headers created atomically from approved review requests.';
comment on table public.order_items is 'Immutable submitted creation snapshots purchased within an order.';
