-- Generated from public/assets/js/fragrance-data.js and library-data.js.
with source as (
  select * from jsonb_to_recordset($materials$[{"slug":"bubble-lake-accord","legacy_library_id":"bubble-lake-accord","legacy_bench_id":null,"category_slug":"indische-materials","name":"Bubble Lake Accord","material_type":"Indische Material","family":"Indische Materials","layers":["heart"],"tags":[],"moods":["Rare","Aquatic","Transparent"],"description":"A fantasy accord imagined as clean bubbles rising through a quiet lake: watery, airy, soft, and slightly unreal.","best_used_for":["Watery fantasy concepts","Clean fresh hearts","Transparent atmospheric perfumes"],"pairs_well_with":["White Foam Accord","Forest Mist Accord","Violet Leaf","White Musk","River Stone"],"avoid_if":["You dislike watery, airy, or abstract fantasy accords"],"image_path":null,"image_alt":null,"freshness":0,"sweetness":0,"warmth":0,"green":0,"floral":0,"woody":0,"powdery":0,"clean":0,"darkness":0,"strangeness":0,"intensity":0,"longevity":0,"is_featured":false,"display_order":234,"status":"coming_soon"},{"slug":"white-foam-accord","legacy_library_id":"white-foam-accord","legacy_bench_id":null,"category_slug":"indische-materials","name":"White Foam Accord","material_type":"Indische Material","family":"Indische Materials","layers":["top","heart"],"tags":[],"moods":["Rare","Airy","Clean"],"description":"A soft clean accord inspired by shower foam, gentle bubbles, and a bright skin-fresh feeling.","best_used_for":["Clean scents","Airy openings","Soft shower-like compositions"],"pairs_well_with":["Bubble Lake Accord","White Musk","Violet Leaf","Mint","Forest Mist Accord"],"avoid_if":["You dislike soapy, clean, or freshly washed impressions"],"image_path":null,"image_alt":null,"freshness":0,"sweetness":0,"warmth":0,"green":0,"floral":0,"woody":0,"powdery":0,"clean":0,"darkness":0,"strangeness":0,"intensity":0,"longevity":0,"is_featured":false,"display_order":235,"status":"coming_soon"},{"slug":"forest-mist-accord","legacy_library_id":"forest-mist-accord","legacy_bench_id":null,"category_slug":"indische-materials","name":"Forest Mist Accord","material_type":"Indische Material","family":"Indische Materials","layers":["heart"],"tags":[],"moods":["Rare","Green","Humid"],"description":"A cool green accord suggesting mist caught between leaves, moss, wet bark, and quiet morning air.","best_used_for":["Forest concepts","Green atmospheric hearts","Rain-washed drydowns"],"pairs_well_with":["Mossy Leaves","Vetiver","Green Tea","White Foam Accord","Oakmoss"],"avoid_if":["You dislike damp, mossy, or forest-like green effects"],"image_path":null,"image_alt":null,"freshness":0,"sweetness":0,"warmth":0,"green":0,"floral":0,"woody":0,"powdery":0,"clean":0,"darkness":0,"strangeness":0,"intensity":0,"longevity":0,"is_featured":false,"display_order":236,"status":"coming_soon"},{"slug":"tonka-ice-cream-accord","legacy_library_id":"tonka-ice-cream-accord","legacy_bench_id":null,"category_slug":"indische-materials","name":"Tonka Ice Cream Accord","material_type":"Indische Material","family":"Indische Materials","layers":["base"],"tags":[],"moods":["Rare","Gourmand","Creamy"],"description":"A creamy fantasy gourmand built around tonka warmth, cold vanilla sweetness, and soft milky comfort.","best_used_for":["Creamy gourmand bases","Nostalgic dessert perfumes","Soft comforting drydowns"],"pairs_well_with":["Tonka Bean","Vanilla","Almond","White Musk","Cedarwood"],"avoid_if":["You dislike sweet, milky, or dessert-like perfumes"],"image_path":null,"image_alt":null,"freshness":0,"sweetness":0,"warmth":0,"green":0,"floral":0,"woody":0,"powdery":0,"clean":0,"darkness":0,"strangeness":0,"intensity":0,"longevity":0,"is_featured":false,"display_order":237,"status":"coming_soon"}]$materials$::jsonb)
    as x(
      slug text, legacy_library_id text, legacy_bench_id text, category_slug text,
      name text, material_type text, family text, layers text[], tags text[], moods text[],
      description text, best_used_for text[], pairs_well_with text[], avoid_if text[],
      image_path text, image_alt text,
      freshness smallint, sweetness smallint, warmth smallint, green smallint,
      floral smallint, woody smallint, powdery smallint, clean smallint,
      darkness smallint, strangeness smallint, intensity smallint, longevity smallint,
      is_featured boolean, display_order integer, status text
    )
)
insert into public.materials (
  slug, legacy_library_id, legacy_bench_id, category_id, name, material_type, family,
  layers, tags, moods, description, best_used_for, pairs_well_with, avoid_if,
  image_path, image_alt, freshness, sweetness, warmth, green, floral, woody,
  powdery, clean, darkness, strangeness, intensity, longevity,
  is_featured, display_order, status
)
select
  source.slug, source.legacy_library_id, source.legacy_bench_id, categories.id,
  source.name, source.material_type, source.family, source.layers, source.tags,
  source.moods, source.description, source.best_used_for, source.pairs_well_with,
  source.avoid_if, source.image_path, source.image_alt, source.freshness,
  source.sweetness, source.warmth, source.green, source.floral, source.woody,
  source.powdery, source.clean, source.darkness, source.strangeness,
  source.intensity, source.longevity, source.is_featured, source.display_order,
  source.status
from source
join public.material_categories categories on categories.slug = source.category_slug
on conflict (slug) do update set
  legacy_library_id = excluded.legacy_library_id,
  legacy_bench_id = excluded.legacy_bench_id,
  category_id = excluded.category_id,
  name = excluded.name,
  material_type = excluded.material_type,
  family = excluded.family,
  layers = excluded.layers,
  tags = excluded.tags,
  moods = excluded.moods,
  description = excluded.description,
  best_used_for = excluded.best_used_for,
  pairs_well_with = excluded.pairs_well_with,
  avoid_if = excluded.avoid_if,
  image_path = excluded.image_path,
  image_alt = excluded.image_alt,
  freshness = excluded.freshness,
  sweetness = excluded.sweetness,
  warmth = excluded.warmth,
  green = excluded.green,
  floral = excluded.floral,
  woody = excluded.woody,
  powdery = excluded.powdery,
  clean = excluded.clean,
  darkness = excluded.darkness,
  strangeness = excluded.strangeness,
  intensity = excluded.intensity,
  longevity = excluded.longevity,
  is_featured = excluded.is_featured,
  display_order = excluded.display_order,
  status = excluded.status;
