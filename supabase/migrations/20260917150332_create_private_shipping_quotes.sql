create schema if not exists private;

create table private.shipping_quotes (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_id text not null check (char_length(btrim(destination_id)) > 0),
  courier_code text not null check (char_length(btrim(courier_code)) > 0),
  service_code text not null check (char_length(btrim(service_code)) > 0),
  shipping_amount bigint not null check (shipping_amount > 0),
  total_weight_grams integer not null check (total_weight_grams > 0),
  cart_fingerprint text not null check (char_length(btrim(cart_fingerprint)) > 0),
  address_snapshot jsonb,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create index shipping_quotes_user_id_idx on private.shipping_quotes(user_id);
create index shipping_quotes_expires_at_idx on private.shipping_quotes(expires_at) where used_at is null;

revoke all on schema private from public, anon, authenticated;
revoke all on table private.shipping_quotes from public, anon, authenticated;
