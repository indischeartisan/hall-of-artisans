create index academy_courses_created_by_idx on public.academy_courses(created_by) where created_by is not null;
create index academy_courses_updated_by_idx on public.academy_courses(updated_by) where updated_by is not null;
create index academy_courses_catalog_idx on public.academy_courses(status, access_type, slug);
create index academy_course_translations_locale_idx on public.academy_course_translations(locale, course_id);
create index academy_modules_status_idx on public.academy_modules(course_id, status, position);
create index academy_module_translations_locale_idx on public.academy_module_translations(locale, module_id);
create index academy_lessons_created_by_idx on public.academy_lessons(created_by) where created_by is not null;
create index academy_lessons_updated_by_idx on public.academy_lessons(updated_by) where updated_by is not null;
create index academy_lessons_status_idx on public.academy_lessons(module_id, status, position);
create index academy_lesson_translations_locale_idx on public.academy_lesson_translations(locale, lesson_id);
create index academy_lesson_blocks_status_idx on public.academy_lesson_blocks(lesson_id, status, position);
create index academy_lesson_block_translations_locale_idx on public.academy_lesson_block_translations(locale, block_id);
create index academy_enrollments_user_status_idx on public.academy_enrollments(user_id, status);
create index academy_enrollments_course_status_idx on public.academy_enrollments(course_id, status);
create index academy_lesson_progress_lesson_status_idx on public.academy_lesson_progress(lesson_id, status);

create trigger academy_courses_set_updated_at before update on public.academy_courses
for each row execute function public.set_updated_at();
create trigger academy_course_translations_set_updated_at before update on public.academy_course_translations
for each row execute function public.set_updated_at();
create trigger academy_modules_set_updated_at before update on public.academy_modules
for each row execute function public.set_updated_at();
create trigger academy_module_translations_set_updated_at before update on public.academy_module_translations
for each row execute function public.set_updated_at();
create trigger academy_lessons_set_updated_at before update on public.academy_lessons
for each row execute function public.set_updated_at();
create trigger academy_lesson_translations_set_updated_at before update on public.academy_lesson_translations
for each row execute function public.set_updated_at();
create trigger academy_lesson_blocks_set_updated_at before update on public.academy_lesson_blocks
for each row execute function public.set_updated_at();
create trigger academy_lesson_block_translations_set_updated_at before update on public.academy_lesson_block_translations
for each row execute function public.set_updated_at();
create trigger academy_enrollments_set_updated_at before update on public.academy_enrollments
for each row execute function public.set_updated_at();
create trigger academy_lesson_progress_set_updated_at before update on public.academy_lesson_progress
for each row execute function public.set_updated_at();
