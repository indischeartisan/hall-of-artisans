create table public.aftercare_cases (
  id uuid primary key default gen_random_uuid(),
  review_request_id text not null references public.review_requests(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  assigned_reviewer_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('GRATITUDE','REVIEW','ISSUE','ADJUSTMENT','REORDER')),
  status text not null default 'OPEN' check (status in ('OPEN','DISCUSSING','RESOLVED')),
  subject text not null check (char_length(btrim(subject)) between 1 and 160),
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  rating smallint check (rating between 1 and 5),
  linked_review_request_id text references public.review_requests(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.aftercare_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.aftercare_cases(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  sender_role text not null check (sender_role in ('customer','artisan','admin')),
  sender_name text not null,
  message text not null check (char_length(btrim(message)) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index aftercare_cases_request_idx on public.aftercare_cases(review_request_id, updated_at desc);
create index aftercare_cases_reviewer_idx on public.aftercare_cases(assigned_reviewer_id, status, updated_at desc);
create index aftercare_messages_case_idx on public.aftercare_messages(case_id, created_at);
create unique index aftercare_one_open_kind_per_project_idx
  on public.aftercare_cases(review_request_id, kind)
  where status in ('OPEN','DISCUSSING');

alter table public.aftercare_cases enable row level security;
alter table public.aftercare_messages enable row level security;

create policy aftercare_cases_select_participants on public.aftercare_cases
for select to authenticated
using (
  (select auth.uid()) = user_id
  or (select private.is_admin())
  or assigned_reviewer_id = (select auth.uid())
);

create policy aftercare_messages_select_participants on public.aftercare_messages
for select to authenticated
using (exists (
  select 1 from public.aftercare_cases c
  where c.id = aftercare_messages.case_id
    and (
      c.user_id = (select auth.uid())
      or (select private.is_admin())
      or c.assigned_reviewer_id = (select auth.uid())
    )
));

create function public.create_aftercare_case(
  target_request_id text,
  case_kind text,
  case_subject text,
  case_body text,
  case_rating smallint default null
)
returns public.aftercare_cases
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  request_row public.review_requests;
  result public.aftercare_cases;
  actor_name text;
begin
  if actor_id is null then raise exception 'Sign in is required' using errcode = '42501'; end if;
  select * into request_row from public.review_requests where id = target_request_id;
  if request_row.id is null or request_row.user_id <> actor_id then
    raise exception 'Completed project not found' using errcode = 'P0002';
  end if;
  if request_row.status <> 'COMPLETED' then
    raise exception 'Aftercare opens after delivery is complete' using errcode = '22023';
  end if;
  case_kind := upper(btrim(case_kind));
  if case_kind not in ('GRATITUDE','REVIEW','ISSUE','ADJUSTMENT','REORDER') then
    raise exception 'Choose a valid aftercare request' using errcode = '22023';
  end if;
  if case_subject is null or char_length(btrim(case_subject)) not between 1 and 160
    or case_body is null or char_length(btrim(case_body)) not between 1 and 5000 then
    raise exception 'Complete the subject and message' using errcode = '22023';
  end if;
  if case_kind = 'REVIEW' and case_rating is null then
    raise exception 'Choose a rating for your review' using errcode = '22023';
  end if;

  insert into public.aftercare_cases(review_request_id, user_id, assigned_reviewer_id, kind, subject, body, rating)
  values (request_row.id, actor_id, request_row.assigned_reviewer_id, case_kind, btrim(case_subject), btrim(case_body), case_rating)
  returning * into result;

  select display_name into actor_name from public.profiles where id = actor_id;
  insert into public.aftercare_messages(case_id, sender_id, sender_role, sender_name, message)
  values (result.id, actor_id, 'customer', coalesce(nullif(btrim(actor_name), ''), 'Customer'), btrim(case_body));
  return result;
end;
$$;

create function public.send_aftercare_message(target_case_id uuid, message_body text)
returns public.aftercare_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  case_row public.aftercare_cases;
  actor_name text;
  role_name text;
  result public.aftercare_messages;
begin
  if actor_id is null then raise exception 'Sign in is required' using errcode = '42501'; end if;
  if message_body is null or char_length(btrim(message_body)) not between 1 and 5000 then
    raise exception 'Message must contain 1 to 5000 characters' using errcode = '22023';
  end if;
  select * into case_row from public.aftercare_cases where id = target_case_id for update;
  if case_row.id is null or not (
    case_row.user_id = actor_id or private.is_admin() or case_row.assigned_reviewer_id = actor_id
  ) then raise exception 'Aftercare case not found' using errcode = 'P0002'; end if;
  if case_row.status = 'RESOLVED' then raise exception 'This aftercare case is resolved' using errcode = '22023'; end if;
  role_name := case when case_row.user_id = actor_id then 'customer' when private.is_admin() then 'admin' else 'artisan' end;
  select display_name into actor_name from public.profiles where id = actor_id;
  insert into public.aftercare_messages(case_id, sender_id, sender_role, sender_name, message)
  values (case_row.id, actor_id, role_name, coalesce(nullif(btrim(actor_name), ''), initcap(role_name)), btrim(message_body))
  returning * into result;
  update public.aftercare_cases set status = 'DISCUSSING', updated_at = now() where id = case_row.id;
  return result;
end;
$$;

create function public.resolve_aftercare_case(target_case_id uuid)
returns public.aftercare_cases
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  result public.aftercare_cases;
begin
  if actor_id is null or not private.is_reviewer_or_admin() then
    raise exception 'Artisan or administrator role required' using errcode = '42501';
  end if;
  select * into result from public.aftercare_cases where id = target_case_id for update;
  if result.id is null or not (private.is_admin() or result.assigned_reviewer_id = actor_id) then
    raise exception 'Aftercare case not found' using errcode = 'P0002';
  end if;
  update public.aftercare_cases set status = 'RESOLVED', resolved_at = now(), updated_at = now()
  where id = target_case_id returning * into result;
  return result;
end;
$$;

revoke all on table public.aftercare_cases from anon, authenticated;
revoke all on table public.aftercare_messages from anon, authenticated;
grant select on table public.aftercare_cases to authenticated;
grant select on table public.aftercare_messages to authenticated;

revoke all on function public.create_aftercare_case(text, text, text, text, smallint) from public, anon, authenticated;
revoke all on function public.send_aftercare_message(uuid, text) from public, anon, authenticated;
revoke all on function public.resolve_aftercare_case(uuid) from public, anon, authenticated;
grant execute on function public.create_aftercare_case(text, text, text, text, smallint) to authenticated;
grant execute on function public.send_aftercare_message(uuid, text) to authenticated;
grant execute on function public.resolve_aftercare_case(uuid) to authenticated;

comment on table public.aftercare_cases is 'Post-delivery gratitude, reviews, issues, adjustments, and reorder requests linked to an immutable completed project.';
