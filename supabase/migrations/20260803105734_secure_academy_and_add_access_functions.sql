create or replace function private.has_active_academy_enrollment(target_lesson_id uuid, target_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if target_user_id is null or (target_user_id <> (select auth.uid()) and not private.is_admin()) then
    return false;
  end if;

  return exists (
    select 1
    from public.academy_enrollments enrollment
    join public.academy_lessons lesson on lesson.id = target_lesson_id
    join public.academy_modules module on module.id = lesson.module_id
    where enrollment.user_id = target_user_id
      and enrollment.course_id = module.course_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  );
end;
$$;

create or replace function private.can_read_academy_lesson(target_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.academy_lessons lesson
    join public.academy_modules module on module.id = lesson.module_id
    join public.academy_courses course on course.id = module.course_id
    where lesson.id = target_lesson_id
      and lesson.status = 'published'
      and module.status = 'published'
      and course.status = 'published'
      and (
        lesson.is_preview
        or private.is_admin()
        or private.has_active_academy_enrollment(lesson.id, (select auth.uid()))
      )
  );
$$;

revoke all on function private.has_active_academy_enrollment(uuid, uuid) from public;
revoke all on function private.can_read_academy_lesson(uuid) from public;
grant execute on function private.has_active_academy_enrollment(uuid, uuid) to authenticated, service_role;
grant execute on function private.can_read_academy_lesson(uuid) to anon, authenticated, service_role;

create policy academy_courses_public_read on public.academy_courses for select to anon, authenticated
using (status = 'published');
create policy academy_courses_admin_all on public.academy_courses for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy academy_course_translations_public_read on public.academy_course_translations for select to anon, authenticated
using (exists (select 1 from public.academy_courses course where course.id = course_id and course.status = 'published'));
create policy academy_course_translations_admin_all on public.academy_course_translations for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy academy_modules_public_read on public.academy_modules for select to anon, authenticated
using (status = 'published' and exists (select 1 from public.academy_courses course where course.id = course_id and course.status = 'published'));
create policy academy_modules_admin_all on public.academy_modules for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy academy_module_translations_public_read on public.academy_module_translations for select to anon, authenticated
using (exists (select 1 from public.academy_modules module where module.id = module_id and module.status = 'published'));
create policy academy_module_translations_admin_all on public.academy_module_translations for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy academy_lessons_public_read on public.academy_lessons for select to anon, authenticated
using (status = 'published' and exists (select 1 from public.academy_modules module where module.id = module_id and module.status = 'published'));
create policy academy_lessons_admin_all on public.academy_lessons for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy academy_lesson_translations_public_read on public.academy_lesson_translations for select to anon, authenticated
using (exists (select 1 from public.academy_lessons lesson where lesson.id = lesson_id and lesson.status = 'published'));
create policy academy_lesson_translations_admin_all on public.academy_lesson_translations for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy academy_lesson_blocks_access_read on public.academy_lesson_blocks for select to anon, authenticated
using (status = 'published' and private.can_read_academy_lesson(lesson_id));
create policy academy_lesson_blocks_admin_all on public.academy_lesson_blocks for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy academy_lesson_block_translations_access_read on public.academy_lesson_block_translations for select to anon, authenticated
using (exists (select 1 from public.academy_lesson_blocks block where block.id = block_id and block.status = 'published' and private.can_read_academy_lesson(block.lesson_id)));
create policy academy_lesson_block_translations_admin_all on public.academy_lesson_block_translations for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy academy_enrollments_own_read on public.academy_enrollments for select to authenticated
using ((select auth.uid()) = user_id);
create policy academy_enrollments_admin_all on public.academy_enrollments for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy academy_lesson_progress_own_read on public.academy_lesson_progress for select to authenticated
using ((select auth.uid()) = user_id);
create policy academy_lesson_progress_own_insert on public.academy_lesson_progress for insert to authenticated
with check ((select auth.uid()) = user_id and private.has_active_academy_enrollment(lesson_id, user_id));
create policy academy_lesson_progress_own_update on public.academy_lesson_progress for update to authenticated
using ((select auth.uid()) = user_id and private.has_active_academy_enrollment(lesson_id, user_id))
with check ((select auth.uid()) = user_id and private.has_active_academy_enrollment(lesson_id, user_id));
create policy academy_lesson_progress_admin_all on public.academy_lesson_progress for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

grant select on public.academy_courses, public.academy_course_translations, public.academy_modules,
  public.academy_module_translations, public.academy_lessons, public.academy_lesson_translations,
  public.academy_lesson_blocks, public.academy_lesson_block_translations to anon, authenticated;
grant insert, update, delete on public.academy_courses, public.academy_course_translations, public.academy_modules,
  public.academy_module_translations, public.academy_lessons, public.academy_lesson_translations,
  public.academy_lesson_blocks, public.academy_lesson_block_translations to authenticated;
grant select, insert, update, delete on public.academy_enrollments to authenticated;
grant select, insert, update, delete on public.academy_lesson_progress to authenticated;

create or replace function private.enroll_in_free_academy_course(target_course_slug text)
returns table (enrollment_id uuid, course_id uuid, status text, enrolled_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  target_course_id uuid;
begin
  if caller_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;

  select course.id into target_course_id
  from public.academy_courses course
  where course.slug = target_course_slug and course.status = 'published' and course.access_type = 'free'
  for update;

  if target_course_id is null then raise exception 'Published free course not found' using errcode = 'P0002'; end if;

  return query
  insert into public.academy_enrollments as enrollment (user_id, course_id, status, source)
  values (caller_id, target_course_id, 'active', 'free')
  on conflict on constraint academy_enrollments_user_id_course_id_key do update set
    status = 'active', source = 'free', expires_at = null, revoked_at = null, updated_at = now()
  returning enrollment.id, enrollment.course_id, enrollment.status, enrollment.enrolled_at;
end;
$$;

create or replace function public.academy_enroll_in_free_course(target_course_slug text)
returns table (enrollment_id uuid, course_id uuid, status text, enrolled_at timestamptz)
language sql
security invoker
set search_path = ''
as $$ select * from private.enroll_in_free_academy_course(target_course_slug); $$;

create or replace function public.academy_resolve_course_access(target_course_slug text)
returns text
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  target_course public.academy_courses%rowtype;
begin
  select * into target_course from public.academy_courses where slug = target_course_slug and status = 'published';
  if target_course.id is null then return 'locked'; end if;
  if caller_id is not null and private.is_admin() then return 'admin'; end if;
  if caller_id is not null and exists (
    select 1 from public.academy_enrollments enrollment
    where enrollment.user_id = caller_id and enrollment.course_id = target_course.id
      and enrollment.status = 'active' and (enrollment.expires_at is null or enrollment.expires_at > now())
  ) then return 'actively_enrolled'; end if;
  if caller_id is not null and target_course.access_type = 'free' then return 'free_not_enrolled'; end if;
  if exists (
    select 1 from public.academy_lessons lesson join public.academy_modules module on module.id = lesson.module_id
    where module.course_id = target_course.id and module.status = 'published' and lesson.status = 'published' and lesson.is_preview
  ) then return 'public_preview'; end if;
  return 'locked';
end;
$$;

revoke all on function private.enroll_in_free_academy_course(text) from public;
revoke all on function public.academy_enroll_in_free_course(text) from public;
revoke all on function public.academy_resolve_course_access(text) from public;
grant execute on function private.enroll_in_free_academy_course(text) to authenticated, service_role;
grant execute on function public.academy_enroll_in_free_course(text) to authenticated, service_role;
grant execute on function public.academy_resolve_course_access(text) to anon, authenticated, service_role;
