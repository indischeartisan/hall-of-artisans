create or replace function public.process_doku_payment_event(
  target_order_id text,
  target_event_id text,
  provider_status text,
  event_payload jsonb
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  current_order public.customer_orders;
  item_row public.order_items;
  applied_status text;
begin
  if target_event_id is null or btrim(target_event_id) = '' then
    raise exception 'DOKU event id is required' using errcode = '22023';
  end if;
  select * into current_order from public.customer_orders where id = target_order_id and order_kind = 'SHOP' and payment_provider = 'DOKU' for update;
  if current_order.id is null then return jsonb_build_object('ignored', true, 'reason', 'unknown_order'); end if;
  insert into public.payment_webhook_events(provider, provider_event_id, order_id, payload, transaction_status)
  values ('DOKU', target_event_id, current_order.id, event_payload, provider_status)
  on conflict (provider, provider_event_id) do nothing;
  if not found then return jsonb_build_object('duplicate', true, 'status', current_order.payment_status); end if;
  if current_order.payment_status = 'PAID' then
    update public.payment_webhook_events set processed_at = now() where provider = 'DOKU' and provider_event_id = target_event_id;
    return jsonb_build_object('ignored', true, 'reason', 'already_paid');
  end if;
  if provider_status = 'SUCCESS' then
    update public.customer_orders set payment_status = 'PAID', paid_at = coalesce(paid_at, now()) where id = current_order.id;
    applied_status := 'PAID';
  elsif provider_status in ('ORDER_EXPIRED', 'EXPIRED') then
    update public.customer_orders set payment_status = 'EXPIRED' where id = current_order.id and payment_status = 'PENDING';
    if found then
      for item_row in select * from public.order_items where order_id = current_order.id and sale_type_snapshot = 'READY_STOCK' loop
        update public.products set stock_quantity = stock_quantity + item_row.quantity,
          status = case when status = 'SOLD_OUT' then 'ACTIVE'::public.product_status else status end
        where id = item_row.product_id;
      end loop;
    end if;
    applied_status := 'EXPIRED';
  elsif provider_status = 'FAILED' then
    update public.customer_orders set payment_status = 'FAILED' where id = current_order.id and payment_status = 'PENDING';
    if found then
      for item_row in select * from public.order_items where order_id = current_order.id and sale_type_snapshot = 'READY_STOCK' loop
        update public.products set stock_quantity = stock_quantity + item_row.quantity,
          status = case when status = 'SOLD_OUT' then 'ACTIVE'::public.product_status else status end
        where id = item_row.product_id;
      end loop;
    end if;
    applied_status := 'FAILED';
  else
    applied_status := current_order.payment_status;
  end if;
  update public.payment_webhook_events set processed_at = now() where provider = 'DOKU' and provider_event_id = target_event_id;
  return jsonb_build_object('status', applied_status);
end;
$$;

revoke all on function public.process_doku_payment_event(text, text, text, jsonb) from public;
