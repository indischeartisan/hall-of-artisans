drop policy academy_courses_public_read on public.academy_courses;
drop policy academy_courses_admin_all on public.academy_courses;
create policy academy_courses_anon_read on public.academy_courses for select to anon using (status = 'published');
create policy academy_courses_authenticated_read on public.academy_courses for select to authenticated using (status = 'published' or (select private.is_admin()));
create policy academy_courses_admin_insert on public.academy_courses for insert to authenticated with check ((select private.is_admin()));
create policy academy_courses_admin_update on public.academy_courses for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy academy_courses_admin_delete on public.academy_courses for delete to authenticated using ((select private.is_admin()));

drop policy academy_course_translations_public_read on public.academy_course_translations;
drop policy academy_course_translations_admin_all on public.academy_course_translations;
create policy academy_course_translations_anon_read on public.academy_course_translations for select to anon
using (exists (select 1 from public.academy_courses course where course.id = course_id and course.status = 'published'));
create policy academy_course_translations_authenticated_read on public.academy_course_translations for select to authenticated
using ((select private.is_admin()) or exists (select 1 from public.academy_courses course where course.id = course_id and course.status = 'published'));
create policy academy_course_translations_admin_insert on public.academy_course_translations for insert to authenticated with check ((select private.is_admin()));
create policy academy_course_translations_admin_update on public.academy_course_translations for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy academy_course_translations_admin_delete on public.academy_course_translations for delete to authenticated using ((select private.is_admin()));

drop policy academy_modules_public_read on public.academy_modules;
drop policy academy_modules_admin_all on public.academy_modules;
create policy academy_modules_anon_read on public.academy_modules for select to anon
using (status = 'published' and exists (select 1 from public.academy_courses course where course.id = course_id and course.status = 'published'));
create policy academy_modules_authenticated_read on public.academy_modules for select to authenticated
using ((select private.is_admin()) or (status = 'published' and exists (select 1 from public.academy_courses course where course.id = course_id and course.status = 'published')));
create policy academy_modules_admin_insert on public.academy_modules for insert to authenticated with check ((select private.is_admin()));
create policy academy_modules_admin_update on public.academy_modules for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy academy_modules_admin_delete on public.academy_modules for delete to authenticated using ((select private.is_admin()));

drop policy academy_module_translations_public_read on public.academy_module_translations;
drop policy academy_module_translations_admin_all on public.academy_module_translations;
create policy academy_module_translations_anon_read on public.academy_module_translations for select to anon
using (exists (select 1 from public.academy_modules module where module.id = module_id and module.status = 'published'));
create policy academy_module_translations_authenticated_read on public.academy_module_translations for select to authenticated
using ((select private.is_admin()) or exists (select 1 from public.academy_modules module where module.id = module_id and module.status = 'published'));
create policy academy_module_translations_admin_insert on public.academy_module_translations for insert to authenticated with check ((select private.is_admin()));
create policy academy_module_translations_admin_update on public.academy_module_translations for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy academy_module_translations_admin_delete on public.academy_module_translations for delete to authenticated using ((select private.is_admin()));

drop policy academy_lessons_public_read on public.academy_lessons;
drop policy academy_lessons_admin_all on public.academy_lessons;
create policy academy_lessons_anon_read on public.academy_lessons for select to anon
using (status = 'published' and exists (select 1 from public.academy_modules module where module.id = module_id and module.status = 'published'));
create policy academy_lessons_authenticated_read on public.academy_lessons for select to authenticated
using ((select private.is_admin()) or (status = 'published' and exists (select 1 from public.academy_modules module where module.id = module_id and module.status = 'published')));
create policy academy_lessons_admin_insert on public.academy_lessons for insert to authenticated with check ((select private.is_admin()));
create policy academy_lessons_admin_update on public.academy_lessons for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy academy_lessons_admin_delete on public.academy_lessons for delete to authenticated using ((select private.is_admin()));

drop policy academy_lesson_translations_public_read on public.academy_lesson_translations;
drop policy academy_lesson_translations_admin_all on public.academy_lesson_translations;
create policy academy_lesson_translations_anon_read on public.academy_lesson_translations for select to anon
using (exists (select 1 from public.academy_lessons lesson where lesson.id = lesson_id and lesson.status = 'published'));
create policy academy_lesson_translations_authenticated_read on public.academy_lesson_translations for select to authenticated
using ((select private.is_admin()) or exists (select 1 from public.academy_lessons lesson where lesson.id = lesson_id and lesson.status = 'published'));
create policy academy_lesson_translations_admin_insert on public.academy_lesson_translations for insert to authenticated with check ((select private.is_admin()));
create policy academy_lesson_translations_admin_update on public.academy_lesson_translations for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy academy_lesson_translations_admin_delete on public.academy_lesson_translations for delete to authenticated using ((select private.is_admin()));

drop policy academy_lesson_blocks_access_read on public.academy_lesson_blocks;
drop policy academy_lesson_blocks_admin_all on public.academy_lesson_blocks;
create policy academy_lesson_blocks_anon_read on public.academy_lesson_blocks for select to anon
using (status = 'published' and private.can_read_academy_lesson(lesson_id));
create policy academy_lesson_blocks_authenticated_read on public.academy_lesson_blocks for select to authenticated
using ((select private.is_admin()) or (status = 'published' and private.can_read_academy_lesson(lesson_id)));
create policy academy_lesson_blocks_admin_insert on public.academy_lesson_blocks for insert to authenticated with check ((select private.is_admin()));
create policy academy_lesson_blocks_admin_update on public.academy_lesson_blocks for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy academy_lesson_blocks_admin_delete on public.academy_lesson_blocks for delete to authenticated using ((select private.is_admin()));

drop policy academy_lesson_block_translations_access_read on public.academy_lesson_block_translations;
drop policy academy_lesson_block_translations_admin_all on public.academy_lesson_block_translations;
create policy academy_lesson_block_translations_anon_read on public.academy_lesson_block_translations for select to anon
using (exists (select 1 from public.academy_lesson_blocks block where block.id = block_id and block.status = 'published' and private.can_read_academy_lesson(block.lesson_id)));
create policy academy_lesson_block_translations_authenticated_read on public.academy_lesson_block_translations for select to authenticated
using ((select private.is_admin()) or exists (select 1 from public.academy_lesson_blocks block where block.id = block_id and block.status = 'published' and private.can_read_academy_lesson(block.lesson_id)));
create policy academy_lesson_block_translations_admin_insert on public.academy_lesson_block_translations for insert to authenticated with check ((select private.is_admin()));
create policy academy_lesson_block_translations_admin_update on public.academy_lesson_block_translations for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy academy_lesson_block_translations_admin_delete on public.academy_lesson_block_translations for delete to authenticated using ((select private.is_admin()));

drop policy academy_enrollments_own_read on public.academy_enrollments;
drop policy academy_enrollments_admin_all on public.academy_enrollments;
create policy academy_enrollments_read on public.academy_enrollments for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));
create policy academy_enrollments_admin_insert on public.academy_enrollments for insert to authenticated with check ((select private.is_admin()));
create policy academy_enrollments_admin_update on public.academy_enrollments for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy academy_enrollments_admin_delete on public.academy_enrollments for delete to authenticated using ((select private.is_admin()));

drop policy academy_lesson_progress_own_read on public.academy_lesson_progress;
drop policy academy_lesson_progress_own_insert on public.academy_lesson_progress;
drop policy academy_lesson_progress_own_update on public.academy_lesson_progress;
drop policy academy_lesson_progress_admin_all on public.academy_lesson_progress;
create policy academy_lesson_progress_read on public.academy_lesson_progress for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));
create policy academy_lesson_progress_insert on public.academy_lesson_progress for insert to authenticated
with check ((select private.is_admin()) or ((select auth.uid()) = user_id and private.has_active_academy_enrollment(lesson_id, user_id)));
create policy academy_lesson_progress_update on public.academy_lesson_progress for update to authenticated
using ((select private.is_admin()) or ((select auth.uid()) = user_id and private.has_active_academy_enrollment(lesson_id, user_id)))
with check ((select private.is_admin()) or ((select auth.uid()) = user_id and private.has_active_academy_enrollment(lesson_id, user_id)));
create policy academy_lesson_progress_admin_delete on public.academy_lesson_progress for delete to authenticated
using ((select private.is_admin()));
