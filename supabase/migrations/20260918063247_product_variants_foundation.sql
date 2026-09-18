create table public.product_variants (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null check (char_length(btrim(label)) > 0),
  size_ml integer check (size_ml is null or size_ml > 0),
  sku text not null unique check (char_length(btrim(sku)) > 0),
  price numeric not null check (price > 0),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  weight_grams integer not null check (weight_grams > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, label)
);
create index product_variants_product_id_idx on public.product_variants(product_id);
alter table public.product_variants enable row level security;
create policy "Active product variants are readable" on public.product_variants for select to anon, authenticated using (is_active and exists (select 1 from public.products p where p.id = product_id and p.status = 'ACTIVE'));
alter table public.order_items add column variant_id uuid references public.product_variants(id), add column variant_label_snapshot text, add column sku_snapshot text, add column unit_price_snapshot numeric;
alter table public.products add column notes jsonb;
