-- Reconcile the live Hall tables with the current application contract without
-- dropping existing workflow or commerce records.

do $$ begin
  create type public.creation_mode as enum ('artisan_bench', 'described');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.creation_draft_status as enum ('draft', 'ready');
exception when duplicate_object then null; end $$;

create or replace function private.jsonb_to_text_array(value jsonb)
returns text[] language sql immutable set search_path = '' as $$
  select case
    when value is null then '{}'::text[]
    when jsonb_typeof(value) = 'array' then array(select jsonb_array_elements_text(value))
    else array[value #>> '{}']
  end;
$$;

alter table public.creation_drafts drop constraint if exists creation_drafts_mode_check;
alter table public.creation_drafts
  alter column mode drop default,
  alter column status drop default,
  alter column mode type public.creation_mode using mode::public.creation_mode,
  alter column status type public.creation_draft_status using status::public.creation_draft_status,
  alter column status set default 'draft'::public.creation_draft_status;
-- review_requests already contains active workflow rows. Its text creation_mode
-- values are validated by the application read model during the staged repair;
-- converting that populated column is deliberately deferred.

-- Academy: retain the earlier content/summary columns for compatibility, then
-- add the normalized reader contract consumed by the current Hall frontend.
alter table public.academy_courses
  add column if not exists access_type text not null default 'free' check (access_type in ('free', 'paid', 'private')),
  add column if not exists level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced', 'all_levels')),
  add column if not exists estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  add column if not exists cover_path text,
  add column if not exists hero_path text,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

alter table public.academy_course_translations
  add column if not exists short_description text,
  add column if not exists full_description text,
  add column if not exists learning_outcomes jsonb not null default '[]'::jsonb,
  add column if not exists audience jsonb not null default '[]'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.academy_modules
  add column if not exists estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  add column if not exists illustration_path text;

alter table public.academy_module_translations
  add column if not exists description text,
  add column if not exists learning_outcome text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.academy_lessons
  add column if not exists lesson_type text not null default 'reading' check (lesson_type in ('reading', 'practice', 'mixed')),
  add column if not exists reading_minutes integer not null default 0 check (reading_minutes >= 0),
  add column if not exists practice_minutes integer not null default 0 check (practice_minutes >= 0),
  add column if not exists is_preview boolean not null default false,
  add column if not exists requires_previous_lesson boolean not null default true,
  add column if not exists published_at timestamptz,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

alter table public.academy_lesson_translations
  add column if not exists opening_line text,
  add column if not exists introduction text,
  add column if not exists learning_objectives jsonb not null default '[]'::jsonb,
  add column if not exists materials_needed jsonb not null default '[]'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.academy_lesson_blocks
  add column if not exists settings jsonb not null default '{}'::jsonb;
alter table public.academy_lesson_block_translations
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();
alter table public.academy_enrollments
  add column if not exists source text not null default 'free' check (source in ('free', 'admin', 'purchase', 'promotion', 'migration')),
  add column if not exists expires_at timestamptz,
  add column if not exists revoked_at timestamptz;

-- The target project has no Archive rows. Convert these columns to the
-- application contract rather than preserving the obsolete integer/JSON shape.
alter table public.archive_records alter column moods drop default;
alter table public.archive_records
  alter column archive_number type text using archive_number::text,
  alter column moods type text[] using private.jsonb_to_text_array(moods),
  alter column moods set default '{}'::text[];

-- Material list fields are arrays in the Hall read model, not arbitrary JSON.
alter table public.materials
  alter column layers drop default,
  alter column moods drop default,
  alter column tags drop default,
  alter column best_used_for drop default,
  alter column pairs_well_with drop default,
  alter column avoid_if drop default;
alter table public.materials
  alter column layers type text[] using private.jsonb_to_text_array(layers),
  alter column moods type text[] using private.jsonb_to_text_array(moods),
  alter column tags type text[] using private.jsonb_to_text_array(tags),
  alter column best_used_for type text[] using private.jsonb_to_text_array(best_used_for),
  alter column pairs_well_with type text[] using private.jsonb_to_text_array(pairs_well_with),
  alter column avoid_if type text[] using private.jsonb_to_text_array(avoid_if);

-- RLS helpers are SECURITY DEFINER and safe for policy evaluation; grant only
-- their boolean lookup surface to the roles that evaluate public/auth policies.
grant usage on schema private to anon, authenticated;
grant execute on function private.has_role(public.app_role) to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.is_reviewer_or_admin() to anon, authenticated;

create or replace function private.has_active_academy_enrollment(target_lesson_id uuid, target_user_id uuid)
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  if target_user_id is null or (target_user_id <> (select auth.uid()) and not private.is_admin()) then return false; end if;
  return exists (
    select 1 from public.academy_enrollments enrollment
    join public.academy_lessons lesson on lesson.id = target_lesson_id
    join public.academy_modules module on module.id = lesson.module_id
    where enrollment.user_id = target_user_id and enrollment.course_id = module.course_id
      and enrollment.status = 'active' and (enrollment.expires_at is null or enrollment.expires_at > now())
  );
end; $$;

create or replace function private.can_read_academy_lesson(target_lesson_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.academy_lessons lesson
    join public.academy_modules module on module.id = lesson.module_id
    join public.academy_courses course on course.id = module.course_id
    where lesson.id = target_lesson_id and lesson.status = 'published' and module.status = 'published' and course.status = 'published'
      and (lesson.is_preview or private.is_admin() or private.has_active_academy_enrollment(lesson.id, (select auth.uid())))
  );
$$;
grant execute on function private.has_active_academy_enrollment(uuid, uuid) to authenticated;
grant execute on function private.can_read_academy_lesson(uuid) to anon, authenticated;

drop policy if exists academy_blocks_published on public.academy_lesson_blocks;
create policy academy_lesson_blocks_access_read on public.academy_lesson_blocks for select to anon, authenticated
using (status = 'published' and private.can_read_academy_lesson(lesson_id));
