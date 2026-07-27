create or replace function private.admin_transition_order_legacy(target_order_id text, next_stage text, target_tracking_number text default null)
returns public.customer_orders
language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid := auth.uid(); current_order public.customer_orders; result public.customer_orders; event_name text; event_label text;
begin
  if actor_id is null or not private.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
  select * into current_order from public.customer_orders where id=target_order_id for update;
  if current_order.id is null then raise exception 'Order not found' using errcode='P0002'; end if;

  if next_stage='START_PRODUCTION' then
    if current_order.payment_status<>'paid' or current_order.production_status<>'not_started' then raise exception 'A paid, not-started order is required' using errcode='22023'; end if;
    update public.customer_orders set production_status='in_production' where id=target_order_id returning * into result;
    update public.order_items set production_status='in_production' where order_id=target_order_id;
    update public.review_requests r set status='IN_PRODUCTION' from public.order_items i where i.order_id=target_order_id and r.id=i.review_request_id and r.status='PAID';
    event_name:='production_started'; event_label:='Production started by administrator';
  elsif next_stage='MARK_SHIPPED' then
    if current_order.payment_status<>'paid' or current_order.production_status<>'in_production' then raise exception 'An in-production order is required' using errcode='22023'; end if;
    if nullif(btrim(target_tracking_number),'') is null then raise exception 'Tracking number is required' using errcode='22023'; end if;
    update public.customer_orders set production_status='completed',shipping_status='shipped',tracking_number=btrim(target_tracking_number) where id=target_order_id returning * into result;
    update public.order_items set production_status='completed',shipping_status='shipped',tracking_number=btrim(target_tracking_number) where order_id=target_order_id;
    update public.review_requests r set status='SHIPPED',shipped_at=coalesce(shipped_at,now()) from public.order_items i where i.order_id=target_order_id and r.id=i.review_request_id and r.status in ('IN_PRODUCTION','PAID');
    event_name:='shipped'; event_label:='Order shipped; tracking number recorded';
  elsif next_stage='MARK_DELIVERED' then
    if current_order.shipping_status<>'shipped' then raise exception 'A shipped order is required' using errcode='22023'; end if;
    update public.customer_orders set production_status='completed',shipping_status='delivered' where id=target_order_id returning * into result;
    update public.order_items set production_status='completed',shipping_status='delivered' where order_id=target_order_id;
    update public.review_requests r set status='COMPLETED',completed_at=coalesce(completed_at,now()) from public.order_items i where i.order_id=target_order_id and r.id=i.review_request_id and r.status='SHIPPED';
    event_name:='delivered'; event_label:='Delivery confirmed by administrator';
  else raise exception 'Unsupported fulfillment action' using errcode='22023';
  end if;

  insert into public.request_activity(request_id,user_id,event_type,label,metadata)
  select i.review_request_id,i.user_id,event_name,event_label,jsonb_build_object('actor','admin','orderId',target_order_id,'trackingNumber',result.tracking_number)
  from public.order_items i where i.order_id=target_order_id;
  return result;
end;
$$;

revoke all on function private.admin_transition_order_legacy(text,text,text) from public,anon;
grant execute on function private.admin_transition_order_legacy(text,text,text) to authenticated,service_role;

create or replace function public.admin_transition_order(target_order_id text,next_stage text,target_tracking_number text default null)
returns public.customer_orders language sql security invoker set search_path=''
as $$ select private.admin_transition_order_legacy(target_order_id,next_stage,target_tracking_number); $$;

revoke all on function public.admin_transition_order(text,text,text) from public,anon;
grant execute on function public.admin_transition_order(text,text,text) to authenticated;
