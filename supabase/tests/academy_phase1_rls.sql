begin;

create or replace function pg_temp.assert_true(ok boolean, label text) returns text language plpgsql as $$
begin
  if not coalesce(ok, false) then raise exception 'ASSERTION FAILED: %', label; end if;
  return label;
end $$;

create temporary table academy_test_principals as
select
  (select p.id from public.profiles p where not exists (select 1 from public.user_roles r where r.user_id = p.id and r.role = 'admin') order by p.created_at limit 1) as user_a,
  (select p.id from public.profiles p where not exists (select 1 from public.user_roles r where r.user_id = p.id and r.role = 'admin') order by p.created_at offset 1 limit 1) as user_b,
  (select r.user_id from public.user_roles r where r.role = 'admin' limit 1) as admin_id;
select pg_temp.assert_true(user_a is not null and user_b is not null and admin_id is not null, 'two non-admin users and one admin fixture exist')
from academy_test_principals;
grant select on academy_test_principals to authenticated;

insert into public.academy_courses(id, slug, access_type, status, level, published_at) values
('b1000000-0000-4000-8000-000000000001', 'rls-free-course', 'free', 'published', 'beginner', now()),
('b1000000-0000-4000-8000-000000000002', 'rls-paid-course', 'paid', 'published', 'beginner', now());
insert into public.academy_course_translations(course_id, locale, title) values
('b1000000-0000-4000-8000-000000000001', 'en', 'RLS Free Course'),
('b1000000-0000-4000-8000-000000000002', 'en', 'RLS Paid Course');
insert into public.academy_modules(id, course_id, position, status) values
('b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 1, 'published');
insert into public.academy_lessons(id, module_id, slug, position, status, is_preview, published_at) values
('b3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'rls-preview', 1, 'published', true, now()),
('b3000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000001', 'rls-locked', 2, 'published', false, now());
insert into public.academy_lesson_blocks(id, lesson_id, block_type, position, status) values
('b4000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'rich_text', 1, 'published'),
('b4000000-0000-4000-8000-000000000002', 'b3000000-0000-4000-8000-000000000002', 'rich_text', 1, 'published');

set local role anon;
select pg_temp.assert_true((select count(*) = 2 from public.academy_courses where slug in ('rls-free-course', 'rls-paid-course')), 'anon reads published test courses');
select pg_temp.assert_true(not exists(select 1 from public.academy_courses where status = 'draft'), 'anon cannot read draft');
select pg_temp.assert_true((select count(*) = 1 from public.academy_lesson_blocks), 'anon reads preview only');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', (select user_a::text from academy_test_principals), true);
select pg_temp.assert_true((select count(*) = 1 from public.academy_lesson_blocks), 'unenrolled reads preview only');
do $$ begin
  begin
    insert into public.academy_lesson_progress(user_id, lesson_id, status) values
    ((select user_a from academy_test_principals), 'b3000000-0000-4000-8000-000000000002', 'in_progress');
    raise exception 'expected progress insert rejection';
  exception when insufficient_privilege then null; end;
end $$;
select * from public.academy_enroll_in_free_course('rls-free-course');
select pg_temp.assert_true(public.academy_resolve_course_access('rls-free-course') = 'actively_enrolled', 'free enrollment resolves active');
select pg_temp.assert_true((select count(*) = 2 from public.academy_lesson_blocks), 'enrolled reads full free course');
insert into public.academy_lesson_progress(user_id, lesson_id, status, started_at, last_opened_at)
values ((select user_a from academy_test_principals), 'b3000000-0000-4000-8000-000000000002', 'in_progress', now(), now());
update public.academy_lesson_progress set last_block_position = 1 where user_id = (select auth.uid());
do $$ begin
  begin perform public.academy_enroll_in_free_course('rls-paid-course'); raise exception 'expected paid rejection';
  exception when no_data_found then null; end;
  begin
    insert into public.academy_enrollments(user_id, course_id, status, source) values
    ((select user_a from academy_test_principals), 'b1000000-0000-4000-8000-000000000002', 'active', 'purchase');
    raise exception 'expected direct paid enrollment rejection';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', (select user_b::text from academy_test_principals), true);
select pg_temp.assert_true(not exists(select 1 from public.academy_lesson_progress), 'user B cannot read A progress');
select pg_temp.assert_true(not exists(select 1 from public.academy_enrollments), 'user B cannot read A enrollment');
do $$ declare affected integer; begin
  update public.academy_lesson_progress set last_block_position = 2
  where user_id = (select user_a from academy_test_principals);
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'user B updated A progress'; end if;
end $$;

select set_config('request.jwt.claim.sub', (select admin_id::text from academy_test_principals), true);
insert into public.academy_courses(slug, access_type, status, level) values ('rls-admin-draft', 'private', 'draft', 'beginner');
select pg_temp.assert_true(exists(select 1 from public.academy_enrollments where user_id = (select user_a from academy_test_principals)), 'admin reads enrollment');

reset role;
select 'academy phase 1 RLS matrix passed' as result;
rollback;
