create table public.commission_packages (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price bigint not null check (price > 0),
  currency text not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  concentration text not null,
  bottle_size text not null,
  included_items text[] not null default '{}',
  consultations_included integer not null default 1 check (consultations_included >= 0),
  estimated_production text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.commission_packages enable row level security;
alter table public.commission_packages force row level security;

create policy commission_packages_read_active on public.commission_packages
for select to anon, authenticated
using (is_active);

revoke all on table public.commission_packages from public, anon, authenticated;
grant select on table public.commission_packages to anon, authenticated;
grant all on table public.commission_packages to service_role;

insert into public.commission_packages
  (slug, name, description, price, concentration, bottle_size, included_items, consultations_included, estimated_production, display_order)
values
  ('essential-commission', 'Essential Commission', 'A focused bespoke fragrance journey for a personal signature scent.', 699000, 'Eau de Parfum', '30 ml', array['Personal creation review','Artisan consultation','Final fragrance brief'], 1, '4â€“6 weeks after payment', 10),
  ('signature-commission', 'Signature Commission', 'A fuller consultation journey with additional refinement for your formula.', 999000, 'Eau de Parfum', '50 ml', array['Personal creation review','Extended artisan consultation','One refinement round','Final fragrance brief'], 2, '6â€“8 weeks after payment', 20),
  ('collector-commission', 'Collector Commission', 'The most complete bespoke journey with deeper refinement and presentation.', 1499000, 'Extrait de Parfum', '50 ml', array['Personal creation review','Extended artisan consultation','Two refinement rounds','Collector presentation','Final fragrance brief'], 3, '8â€“10 weeks after payment', 30)
on conflict (slug) do nothing;

alter table public.review_requests
  add column selected_package_id uuid references public.commission_packages(id) on delete restrict,
  add column package_snapshot jsonb,
  add column consultation_started_at timestamptz,
  add column consultation_completed_at timestamptz,
  add column ready_for_payment_at timestamptz;

update public.review_requests set status = 'CONSULTATION'
where status in ('WAITING_FOR_REPLY','READY_FOR_APPROVAL','REVISION_REQUESTED');

update public.review_requests set status = 'READY_FOR_PAYMENT', ready_for_payment_at = coalesce(approved_at, updated_at)
where status = 'READY_FOR_CHECKOUT';

alter table public.review_requests drop constraint if exists review_requests_status_check;
alter table public.review_requests add constraint review_requests_status_check check (status in (
  'DRAFT_PREVIEW','SUBMITTED','UNDER_REVIEW','CONSULTATION','READY_FOR_PAYMENT',
  'PAYMENT_PENDING','PAID','IN_PRODUCTION','SHIPPED','COMPLETED','CANCELLED'
));

create index review_requests_selected_package_idx on public.review_requests(selected_package_id);

create or replace function public.select_review_package(target_request_id text, target_package_id uuid)
returns public.review_requests
language plpgsql
security definer
set search_path = ''
as $$
declare owner_id uuid := auth.uid(); result public.review_requests;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if not exists (select 1 from public.commission_packages where id=target_package_id and is_active) then
    raise exception 'Choose an available commission package' using errcode='22023';
  end if;
  update public.review_requests set selected_package_id=target_package_id
  where id=target_request_id and user_id=owner_id and status='DRAFT_PREVIEW'
  returning * into result;
  if result.id is null then raise exception 'Only a private preview can change package' using errcode='22023'; end if;
  return result;
end;
$$;

create or replace function public.submit_review_request(target_request_id text)
returns public.review_requests
language plpgsql security definer set search_path = ''
as $$
declare owner_id uuid := auth.uid(); result public.review_requests; package public.commission_packages; stamp timestamptz := now();
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into result from public.review_requests where id=target_request_id and user_id=owner_id for update;
  if result.id is null then raise exception 'Preview not found' using errcode='P0002'; end if;
  if result.status <> 'DRAFT_PREVIEW' then raise exception 'Only a preview can be submitted' using errcode='22023'; end if;
  select * into package from public.commission_packages where id=result.selected_package_id and is_active;
  if package.id is null then raise exception 'Select a commission package before sending for review' using errcode='22023'; end if;
  update public.review_requests set status='SUBMITTED',
    request_number='HOA-RV-'||to_char(stamp,'YYYY')||'-'||lpad(nextval('public.review_request_number_seq')::text,5,'0'),
    submission_id=extensions.gen_random_uuid()::text, submission_snapshot=preview_snapshot,
    package_snapshot=jsonb_build_object('id',package.id,'slug',package.slug,'name',package.name,'description',package.description,
      'price',package.price,'currency',package.currency,'concentration',package.concentration,'bottleSize',package.bottle_size,
      'includedItems',package.included_items,'consultationsIncluded',package.consultations_included,'estimatedProduction',package.estimated_production),
    final_price=package.price, currency=package.currency, concentration=package.concentration, bottle_size=package.bottle_size,
    included_items=package.included_items, revisions_included=package.consultations_included,
    estimated_production=package.estimated_production, submitted_at=stamp
  where id=target_request_id returning * into result;
  insert into public.request_messages(request_id,user_id,sender_role,sender_name,message,read_at)
    values(result.id,owner_id,'system','The Hall of Artisans','Your creation and selected commission package have been received for artisan review.',stamp);
  insert into public.request_activity(request_id,user_id,event_type,label,metadata)
    values(result.id,owner_id,'submitted','Creation and commission package submitted for artisan review',jsonb_build_object('actor','customer','packageId',package.id));
  return result;
end;
$$;

create or replace function public.customer_transition_review_request(target_request_id text, next_status text, activity_label text default null)
returns public.review_requests
language plpgsql security definer set search_path = ''
as $$
declare owner_id uuid := auth.uid(); result public.review_requests;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into result from public.review_requests where id=target_request_id and user_id=owner_id for update;
  if result.id is null then raise exception 'Request not found' using errcode='P0002'; end if;
  if next_status <> 'CANCELLED' or result.status not in ('DRAFT_PREVIEW','SUBMITTED','UNDER_REVIEW','CONSULTATION','READY_FOR_PAYMENT') then
    raise exception 'Customer transition is not allowed' using errcode='22023';
  end if;
  update public.review_requests set status='CANCELLED' where id=target_request_id returning * into result;
  insert into public.request_activity(request_id,user_id,event_type,label,metadata)
    values(result.id,owner_id,'cancelled',coalesce(nullif(btrim(activity_label),''),'Request cancelled'),jsonb_build_object('actor','customer'));
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
  if request_status not in ('CONSULTATION','READY_FOR_PAYMENT','PAYMENT_PENDING','PAID','IN_PRODUCTION','SHIPPED') then
    raise exception 'Conversation opens when artisan consultation begins' using errcode='22023';
  end if;
  insert into public.request_messages(request_id,user_id,sender_role,sender_name,message,read_at)
    values(target_request_id,owner_id,'customer','You',btrim(message_body),now()) returning * into result;
  return result;
end;
$$;

create or replace function public.staff_transition_review_request(target_request_id text, next_status text, proposal jsonb default null, activity_label text default null)
returns public.review_requests
language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid := auth.uid(); result public.review_requests; actor_is_admin boolean := private.is_admin(); allowed boolean := false; stamp timestamptz := now();
begin
  if actor_id is null or not private.is_reviewer_or_admin() then raise exception 'Reviewer or administrator role required' using errcode='42501'; end if;
  select * into result from public.review_requests where id=target_request_id for update;
  if result.id is null then raise exception 'Review request not found' using errcode='P0002'; end if;
  if not actor_is_admin and result.assigned_reviewer_id is distinct from actor_id then raise exception 'This project is not assigned to your reviewer account' using errcode='42501'; end if;
  allowed := (result.status='SUBMITTED' and next_status='UNDER_REVIEW')
    or (result.status='UNDER_REVIEW' and next_status='CONSULTATION')
    or (result.status='CONSULTATION' and next_status='READY_FOR_PAYMENT')
    or (actor_is_admin and result.status='PAYMENT_PENDING' and next_status='PAID')
    or (actor_is_admin and result.status='PAID' and next_status='IN_PRODUCTION')
    or (actor_is_admin and result.status='IN_PRODUCTION' and next_status='SHIPPED')
    or (actor_is_admin and result.status='SHIPPED' and next_status='COMPLETED');
  if not allowed then raise exception 'Staff transition from % to % is not allowed',result.status,next_status using errcode='22023'; end if;
  update public.review_requests set status=next_status,
    reviewed_at=case when next_status='CONSULTATION' then stamp else reviewed_at end,
    consultation_started_at=case when next_status='CONSULTATION' then stamp else consultation_started_at end,
    consultation_completed_at=case when next_status='READY_FOR_PAYMENT' then stamp else consultation_completed_at end,
    ready_for_payment_at=case when next_status='READY_FOR_PAYMENT' then stamp else ready_for_payment_at end,
    paid_at=case when next_status='PAID' then stamp else paid_at end,
    shipped_at=case when next_status='SHIPPED' then stamp else shipped_at end,
    completed_at=case when next_status='COMPLETED' then stamp else completed_at end
  where id=target_request_id returning * into result;
  insert into public.request_activity(request_id,user_id,event_type,label,metadata)
    values(result.id,result.user_id,lower(next_status),coalesce(nullif(btrim(activity_label),''),initcap(lower(replace(next_status,'_',' ')))),jsonb_build_object('actor','staff','actorId',actor_id));
  return result;
end;
$$;

create or replace function public.send_staff_request_message(target_request_id text, message_body text)
returns public.request_messages
language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid := auth.uid(); owner_id uuid; assigned_id uuid; request_status text; actor_name text; result public.request_messages;
begin
  if actor_id is null or not private.is_reviewer_or_admin() then raise exception 'Reviewer or administrator role required' using errcode='42501'; end if;
  if message_body is null or char_length(btrim(message_body)) not between 1 and 5000 then raise exception 'Message must contain 1 to 5000 characters' using errcode='22023'; end if;
  select user_id,status,assigned_reviewer_id into owner_id,request_status,assigned_id from public.review_requests where id=target_request_id;
  if owner_id is null then raise exception 'Review request not found' using errcode='P0002'; end if;
  if not private.is_admin() and assigned_id is distinct from actor_id then raise exception 'This project is not assigned to your reviewer account' using errcode='42501'; end if;
  if request_status not in ('CONSULTATION','READY_FOR_PAYMENT','PAYMENT_PENDING','PAID','IN_PRODUCTION','SHIPPED') then raise exception 'Conversation opens when consultation begins' using errcode='22023'; end if;
  select display_name into actor_name from public.profiles where id=actor_id;
  insert into public.request_messages(request_id,user_id,sender_role,sender_name,message)
    values(target_request_id,owner_id,'artisan',coalesce(nullif(btrim(actor_name),''),'Indische Artisan'),btrim(message_body)) returning * into result;
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
  if checkout_payload is null or jsonb_typeof(checkout_payload)<>'object' or nullif(btrim(checkout_payload->>'recipient'),'') is null or nullif(btrim(checkout_payload->>'address'),'') is null or nullif(btrim(checkout_payload->>'phone'),'') is null then raise exception 'Complete recipient, address, and phone details' using errcode='22023'; end if;
  select count(*),min(currency),sum(final_price) into request_count,request_currency,request_total from public.review_requests
  where id=any(request_ids) and user_id=owner_id and status='READY_FOR_PAYMENT' and final_price>0 and selected_package_id is not null and submission_id is not null and submission_snapshot is not null;
  if request_count<>cardinality(request_ids) then raise exception 'One or more creations are not ready for payment' using errcode='22023'; end if;
  if (select count(distinct currency) from public.review_requests where id=any(request_ids) and user_id=owner_id)<>1 then raise exception 'All creations must use the same currency' using errcode='22023'; end if;
  if exists(select 1 from public.order_items where review_request_id=any(request_ids)) then raise exception 'A selected creation already belongs to an order' using errcode='23505'; end if;
  insert into public.customer_orders(user_id,order_number,amount,currency,shipping_preference,checkout_details)
  values(owner_id,'HO-'||to_char(stamp,'YYYY')||'-'||lpad(nextval('public.customer_order_number_seq')::text,5,'0'),request_total,request_currency,
    case when checkout_payload->>'shippingPreference'='separately' then 'separately' else 'together' end,checkout_payload) returning * into result;
  insert into public.order_items(order_id,user_id,review_request_id,submission_id,submission_snapshot,creation_name,amount,currency)
    select result.id,owner_id,id,submission_id,submission_snapshot,perfume_name,final_price,currency from public.review_requests where id=any(request_ids) and user_id=owner_id;
  update public.review_requests set status='PAYMENT_PENDING' where id=any(request_ids) and user_id=owner_id;
  insert into public.request_activity(request_id,user_id,event_type,label,metadata)
    select id,owner_id,'payment_pending','Payment checkout created',jsonb_build_object('actor','customer','orderId',result.id) from public.review_requests where id=any(request_ids) and user_id=owner_id;
  return result;
end;
$$;

revoke all on function public.select_review_package(text,uuid) from public, anon, authenticated;
grant execute on function public.select_review_package(text,uuid) to authenticated;

comment on table public.commission_packages is 'Active, exact-price packages available before artisan review submission.';
comment on column public.review_requests.package_snapshot is 'Immutable package terms and exact price captured at submission.';

