-- Generated from public/assets/js/fragrance-data.js and library-data.js.
-- Re-run scripts/generate-material-catalog-seed.mjs --write after changing legacy sources.
with source as (
  select * from jsonb_to_recordset($categories$[{"slug":"citrus","name":"Citrus","display_order":0,"status":"active"},{"slug":"fruity","name":"Fruity","display_order":1,"status":"active"},{"slug":"floral","name":"Floral","display_order":2,"status":"active"},{"slug":"green","name":"Green","display_order":3,"status":"active"},{"slug":"powdery","name":"Powdery","display_order":4,"status":"active"},{"slug":"tea-and-aromatic","name":"Tea & Aromatic","display_order":5,"status":"active"},{"slug":"spicy","name":"Spicy","display_order":6,"status":"active"},{"slug":"gourmand","name":"Gourmand","display_order":7,"status":"active"},{"slug":"woods","name":"Woods","display_order":8,"status":"active"},{"slug":"earthy","name":"Earthy","display_order":9,"status":"active"},{"slug":"amber-and-resin","name":"Amber & Resin","display_order":10,"status":"active"},{"slug":"musk","name":"Musk","display_order":11,"status":"active"},{"slug":"marine-and-air","name":"Marine & Air","display_order":12,"status":"active"},{"slug":"leather-and-tobacco","name":"Leather & Tobacco","display_order":13,"status":"active"},{"slug":"atmospheric","name":"Atmospheric","display_order":14,"status":"active"},{"slug":"indische-materials","name":"Indische Materials","display_order":15,"status":"active"}]$categories$::jsonb)
    as x(slug text, name text, display_order integer, status text)
)
insert into public.material_categories (slug, name, display_order, status)
select slug, name, display_order, status from source
on conflict (slug) do update set
  name = excluded.name,
  display_order = excluded.display_order,
  status = excluded.status;
