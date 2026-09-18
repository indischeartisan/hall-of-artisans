-- Product shipping weight is authoritative catalog data. Existing products
-- remain valid until their weight is populated by catalog administration.
alter table public.products
  add column if not exists weight_grams integer;

alter table public.products
  add constraint products_weight_grams_positive
  check (weight_grams is null or weight_grams > 0);
