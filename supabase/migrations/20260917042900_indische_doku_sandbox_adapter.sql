-- Indische Artisan DOKU sandbox adapter. This is deliberately isolated from
-- Hall orders and from any legacy Perfume Lab assumptions.

create table public.payment_webhook_events (
  id uuid primary key default extensions.gen_random_uuid(),
  provider text not null check (provider = 'DOKU'),
  provider_event_id text not null,
  order_id text not null references public.customer_orders(id) on delete cascade,
  payload jsonb not null,
  transaction_status text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);

alter table public.payment_webhook_events enable row level security;
revoke all on table public.payment_webhook_events from anon, authenticated;

-- Shop orders get an Indische-specific identifier. Hall keeps its existing
-- order-number behaviour; no old record is rewritten.
create or replace function public.create_shop_order(cart_items jsonb, shipping jsonb default '{}'::jsonb)
returns public.customer_orders
language plpgsql
security definer
set search_path to ''
as $$
declare
  item jsonb;
  product_row public.products;
  created_order public.customer_orders;
  item_quantity integer := 0;
  calculated_subtotal numeric := 0;
  customer_name text;
  customer_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(cart_items) <> 'array' or jsonb_array_length(cart_items) = 0 then
    raise exception 'Cart required' using errcode = '22023';
  end if;

  select display_name into customer_name from public.profiles where id = auth.uid();
  select email into customer_email from auth.users where id = auth.uid();

  for item in select * from jsonb_array_elements(cart_items) loop
    item_quantity := greatest(1, coalesce((item ->> 'quantity')::integer, 0));
    select * into product_row from public.products where id = (item ->> 'product_id')::uuid for update;
    if product_row.id is null or product_row.status <> 'ACTIVE' then
      raise exception 'Product unavailable' using errcode = 'P0002';
    end if;
    if product_row.sale_type = 'READY_STOCK' and product_row.stock_quantity < item_quantity then
      raise exception 'Insufficient stock' using errcode = '23514';
    end if;
    if product_row.sale_type = 'PREORDER' and product_row.preorder_closes_at is not null and product_row.preorder_closes_at <= now() then
      raise exception 'Preorder closed' using errcode = '23514';
    end if;
    calculated_subtotal := calculated_subtotal + product_row.price * item_quantity;
  end loop;

  insert into public.customer_orders (
    user_id, order_number, order_kind, amount, currency, payment_status,
    production_status, shipping_status, subtotal, shipping_amount, grand_total,
    fulfillment_status, customer_name_snapshot, customer_email_snapshot,
    customer_phone_snapshot, shipping_address_snapshot, shipping_courier,
    shipping_service, checkout_details
  ) values (
    auth.uid(),
    'IA-' || to_char(now(), 'YYYY') || '-' || upper(substr((extensions.gen_random_uuid())::text, 1, 8)),
    'SHOP', calculated_subtotal, 'IDR', 'PENDING', 'PENDING', 'PENDING',
    calculated_subtotal, coalesce((shipping ->> 'amount')::numeric, 0),
    calculated_subtotal + coalesce((shipping ->> 'amount')::numeric, 0),
    'UNFULFILLED', customer_name, customer_email, shipping ->> 'phone',
    shipping -> 'address', shipping ->> 'courier', shipping ->> 'service', shipping
  ) returning * into created_order;

  for item in select * from jsonb_array_elements(cart_items) loop
    item_quantity := greatest(1, coalesce((item ->> 'quantity')::integer, 0));
    select * into product_row from public.products where id = (item ->> 'product_id')::uuid for update;
    insert into public.order_items (
      order_id, user_id, item_type, product_id, creation_name, name_snapshot,
      amount, price_snapshot, quantity, currency, sale_type_snapshot,
      estimated_ready_at_snapshot, fulfillment_status
    ) values (
      created_order.id, auth.uid(), 'PRODUCT', product_row.id, product_row.name,
      product_row.name, product_row.price * item_quantity, product_row.price,
      item_quantity, product_row.currency, product_row.sale_type,
      product_row.estimated_ready_at, 'UNFULFILLED'
    );
    if product_row.sale_type = 'READY_STOCK' then
      update public.products
      set stock_quantity = stock_quantity - item_quantity,
          status = case when stock_quantity - item_quantity = 0 then 'SOLD_OUT'::public.product_status else status end
      where id = product_row.id;
    end if;
  end loop;
  return created_order;
end;
$$;

revoke all on function public.create_shop_order(jsonb, jsonb) from public;
grant execute on function public.create_shop_order(jsonb, jsonb) to authenticated;
