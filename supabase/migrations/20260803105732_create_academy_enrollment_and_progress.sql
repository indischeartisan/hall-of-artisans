create table public.academy_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.academy_courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'pending', 'revoked', 'refunded', 'expired')),
  source text not null check (source in ('free', 'admin', 'purchase', 'promotion', 'migration')),
  enrolled_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id),
  check (expires_at is null or expires_at > enrolled_at),
  check ((status = 'revoked' and revoked_at is not null) or (status <> 'revoked' and revoked_at is null))
);

create table public.academy_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.academy_lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  last_block_position integer not null default 0 check (last_block_position >= 0),
  started_at timestamptz,
  last_opened_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id),
  check ((status = 'completed' and completed_at is not null) or (status <> 'completed' and completed_at is null)),
  check (completed_at is null or started_at is null or completed_at >= started_at)
);

alter table public.academy_enrollments enable row level security;
alter table public.academy_enrollments force row level security;
alter table public.academy_lesson_progress enable row level security;
alter table public.academy_lesson_progress force row level security;
