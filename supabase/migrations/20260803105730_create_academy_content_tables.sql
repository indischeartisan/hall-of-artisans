create table public.academy_courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 120),
  access_type text not null check (access_type in ('free', 'paid', 'private')),
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced', 'all_levels')),
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  cover_path text check (cover_path is null or char_length(cover_path) <= 500),
  hero_path text check (hero_path is null or char_length(hero_path) <= 500),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null)
);

create table public.academy_course_translations (
  course_id uuid not null references public.academy_courses(id) on delete cascade,
  locale text not null check (locale in ('en', 'id')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  short_description text check (short_description is null or char_length(short_description) <= 500),
  full_description text check (full_description is null or char_length(full_description) <= 5000),
  learning_outcomes jsonb not null default '[]'::jsonb check (jsonb_typeof(learning_outcomes) = 'array' and jsonb_array_length(learning_outcomes) <= 30),
  audience jsonb not null default '[]'::jsonb check (jsonb_typeof(audience) = 'array' and jsonb_array_length(audience) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (course_id, locale)
);

create table public.academy_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.academy_courses(id) on delete cascade,
  position integer not null check (position > 0),
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  illustration_path text check (illustration_path is null or char_length(illustration_path) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);

create table public.academy_module_translations (
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  locale text not null check (locale in ('en', 'id')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  description text check (description is null or char_length(description) <= 3000),
  learning_outcome text check (learning_outcome is null or char_length(learning_outcome) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (module_id, locale)
);

create table public.academy_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 120),
  position integer not null check (position > 0),
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  lesson_type text not null default 'reading' check (lesson_type in ('reading', 'practice', 'mixed')),
  reading_minutes integer not null default 0 check (reading_minutes >= 0),
  practice_minutes integer not null default 0 check (practice_minutes >= 0),
  is_preview boolean not null default false,
  requires_previous_lesson boolean not null default true,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, position),
  check (status <> 'published' or published_at is not null)
);

create table public.academy_lesson_translations (
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  locale text not null check (locale in ('en', 'id')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  opening_line text check (opening_line is null or char_length(opening_line) <= 500),
  introduction text check (introduction is null or char_length(introduction) <= 5000),
  learning_objectives jsonb not null default '[]'::jsonb check (jsonb_typeof(learning_objectives) = 'array' and jsonb_array_length(learning_objectives) <= 30),
  materials_needed jsonb not null default '[]'::jsonb check (jsonb_typeof(materials_needed) = 'array' and jsonb_array_length(materials_needed) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (lesson_id, locale)
);

create table public.academy_lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  block_type text not null check (block_type in ('rich_text', 'image', 'diagram', 'quote', 'perfumer_note', 'exercise', 'journal_prompt', 'knowledge_check', 'summary', 'download', 'divider')),
  position integer not null check (position > 0),
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object' and octet_length(settings::text) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, position)
);

create table public.academy_lesson_block_translations (
  block_id uuid not null references public.academy_lesson_blocks(id) on delete cascade,
  locale text not null check (locale in ('en', 'id')),
  content jsonb not null default '{}'::jsonb check (
    jsonb_typeof(content) = 'object'
    and octet_length(content::text) <= 100000
    and not (content ?| array['html', 'raw_html'])
    and content::text !~ '<[^>]+>'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (block_id, locale)
);

alter table public.academy_courses enable row level security;
alter table public.academy_courses force row level security;
alter table public.academy_course_translations enable row level security;
alter table public.academy_course_translations force row level security;
alter table public.academy_modules enable row level security;
alter table public.academy_modules force row level security;
alter table public.academy_module_translations enable row level security;
alter table public.academy_module_translations force row level security;
alter table public.academy_lessons enable row level security;
alter table public.academy_lessons force row level security;
alter table public.academy_lesson_translations enable row level security;
alter table public.academy_lesson_translations force row level security;
alter table public.academy_lesson_blocks enable row level security;
alter table public.academy_lesson_blocks force row level security;
alter table public.academy_lesson_block_translations enable row level security;
alter table public.academy_lesson_block_translations force row level security;
