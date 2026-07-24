import fs from 'node:fs'
import vm from 'node:vm'

function loadLegacyScript(path) {
  const context = { window: {} }
  vm.createContext(context)
  vm.runInContext(fs.readFileSync(path, 'utf8'), context, { filename: path })
  return context.window
}

const bench = loadLegacyScript('public/assets/js/fragrance-data.js').fragranceData
const library = loadLegacyScript('public/assets/js/library-data.js')

const slugify = (value) => value
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const categoryNames = [
  ...new Set(bench.materials.map((item) => item.category)),
  'Indische Materials',
]

const categories = categoryNames.map((name, index) => ({
  slug: slugify(name),
  name,
  display_order: index,
  status: 'active',
}))

const featuredIds = new Set(library.LIBRARY_FEATURED_IDS)
const libraryByName = new Map()
for (const item of library.LIBRARY_MATERIALS) {
  const choices = libraryByName.get(item.name) || []
  choices.push(item)
  libraryByName.set(item.name, choices)
}

const pickLibraryItem = (benchItem) => {
  const choices = libraryByName.get(benchItem.name) || []
  return choices.find((item) => item.category === benchItem.category) || choices[0] || null
}

const materials = bench.materials.map((benchItem, index) => {
  const libraryItem = pickLibraryItem(benchItem)
  const libraryId = libraryItem?.id || benchItem.id.replaceAll('_', '-')
  return {
    slug: libraryId,
    legacy_library_id: libraryId,
    legacy_bench_id: benchItem.id,
    category_slug: slugify(benchItem.category),
    name: benchItem.name,
    material_type: libraryItem?.type || 'Note',
    family: benchItem.family || libraryItem?.families?.[0] || benchItem.category,
    layers: benchItem.layer || [],
    tags: benchItem.tags || [],
    moods: libraryItem?.mood || [],
    description: libraryItem?.description || benchItem.description || null,
    best_used_for: libraryItem?.bestUsedFor || [],
    pairs_well_with: libraryItem?.pairsWellWith || benchItem.pairsWith || [],
    avoid_if: libraryItem?.avoidIf || [],
    image_path: libraryItem?.iconImage || null,
    image_alt: libraryItem?.iconImage ? `${benchItem.name} material illustration` : null,
    freshness: benchItem.freshness || 0,
    sweetness: benchItem.sweetness || 0,
    warmth: benchItem.warmth || 0,
    green: benchItem.green || 0,
    floral: benchItem.floral || 0,
    woody: benchItem.woody || 0,
    powdery: benchItem.powdery || 0,
    clean: benchItem.clean || 0,
    darkness: benchItem.darkness || 0,
    strangeness: benchItem.strangeness || 0,
    intensity: benchItem.intensity || 0,
    longevity: benchItem.longevity || 0,
    is_featured: featuredIds.has(libraryId),
    display_order: index,
    status: libraryItem?.status === 'coming-soon' ? 'coming_soon' : 'active',
  }
})

for (const libraryItem of library.LIBRARY_MATERIALS) {
  if (bench.materials.some((benchItem) => benchItem.name === libraryItem.name)) continue
  materials.push({
    slug: libraryItem.id,
    legacy_library_id: libraryItem.id,
    legacy_bench_id: null,
    category_slug: 'indische-materials',
    name: libraryItem.name,
    material_type: libraryItem.type || 'Indische Material',
    family: libraryItem.families?.[0] || 'Indische World',
    layers: (libraryItem.suggestedRole || []).map((role) => role.toLowerCase()),
    tags: [],
    moods: libraryItem.mood || [],
    description: libraryItem.description || null,
    best_used_for: libraryItem.bestUsedFor || [],
    pairs_well_with: libraryItem.pairsWellWith || [],
    avoid_if: libraryItem.avoidIf || [],
    image_path: libraryItem.iconImage || null,
    image_alt: libraryItem.iconImage ? `${libraryItem.name} material illustration` : null,
    freshness: 0,
    sweetness: 0,
    warmth: 0,
    green: 0,
    floral: 0,
    woody: 0,
    powdery: 0,
    clean: 0,
    darkness: 0,
    strangeness: 0,
    intensity: 0,
    longevity: 0,
    is_featured: featuredIds.has(libraryItem.id),
    display_order: materials.length,
    status: libraryItem.status === 'coming-soon' ? 'coming_soon' : 'active',
  })
}

const categoryJson = JSON.stringify(categories)

const categorySql = `-- Generated from public/assets/js/fragrance-data.js and library-data.js.
-- Re-run scripts/generate-material-catalog-seed.mjs --write after changing legacy sources.
with source as (
  select * from jsonb_to_recordset($categories$${categoryJson}$categories$::jsonb)
    as x(slug text, name text, display_order integer, status text)
)
insert into public.material_categories (slug, name, display_order, status)
select slug, name, display_order, status from source
on conflict (slug) do update set
  name = excluded.name,
  display_order = excluded.display_order,
  status = excluded.status;
`

function materialSql(rows) {
  const materialJson = JSON.stringify(rows)
  return `-- Generated from public/assets/js/fragrance-data.js and library-data.js.
with source as (
  select * from jsonb_to_recordset($materials$${materialJson}$materials$::jsonb)
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
`
}

if (process.argv.includes('--write')) {
  const targets = []
  const categoryTarget = 'supabase/migrations/20260724153000_seed_material_categories.sql'
  fs.writeFileSync(categoryTarget, categorySql)
  targets.push({ target: categoryTarget, count: categories.length, bytes: categorySql.length })

  categoryNames.forEach((categoryName, index) => {
    const rows = materials.filter((item) => item.category_slug === slugify(categoryName))
    const migrationMinute = String(31 + index).padStart(2, '0')
    const target = `supabase/migrations/2026072415${migrationMinute}00_seed_materials_${slugify(categoryName).replaceAll('-', '_')}.sql`
    const content = materialSql(rows)
    fs.writeFileSync(target, content)
    targets.push({ target, count: rows.length, bytes: content.length })
  })

  console.log(JSON.stringify({ categories: categories.length, materials: materials.length, targets }, null, 2))
} else {
  console.log(JSON.stringify({ categories: categories.length, materials: materials.length }, null, 2))
}
