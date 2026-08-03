insert into public.academy_courses (id, slug, access_type, status, level, estimated_minutes)
values ('a1000000-0000-4000-8000-000000000001', 'introduction-to-the-world-of-perfumery', 'free', 'draft', 'beginner', 120)
on conflict (id) do update set slug = excluded.slug, access_type = excluded.access_type, level = excluded.level, estimated_minutes = excluded.estimated_minutes;

insert into public.academy_course_translations (course_id, locale, title, short_description)
values
  ('a1000000-0000-4000-8000-000000000001', 'en', 'Introduction to the World of Perfumery', 'A structural introduction to the world of perfumery.'),
  ('a1000000-0000-4000-8000-000000000001', 'id', 'Pengantar Dunia Parfum', 'Pengantar terstruktur menuju dunia parfum.')
on conflict (course_id, locale) do update set title = excluded.title, short_description = excluded.short_description;

insert into public.academy_modules (id, course_id, position, status, estimated_minutes)
values ('a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 1, 'draft', 120)
on conflict (id) do update set course_id = excluded.course_id, position = excluded.position, estimated_minutes = excluded.estimated_minutes;

insert into public.academy_module_translations (module_id, locale, title)
values
  ('a2000000-0000-4000-8000-000000000001', 'en', 'Core Foundations'),
  ('a2000000-0000-4000-8000-000000000001', 'id', 'Fondasi Utama')
on conflict (module_id, locale) do update set title = excluded.title;

insert into public.academy_lessons (id, module_id, slug, position, status, lesson_type, reading_minutes, practice_minutes, is_preview, requires_previous_lesson)
values
  ('a3000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'what-perfumery-really-is', 1, 'draft', 'reading', 15, 0, true, false),
  ('a3000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000001', 'how-we-experience-smell', 2, 'draft', 'mixed', 15, 10, false, true),
  ('a3000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000001', 'notes-materials-and-accords', 3, 'draft', 'reading', 20, 0, false, true),
  ('a3000000-0000-4000-8000-000000000004', 'a2000000-0000-4000-8000-000000000001', 'opening-heart-and-drydown', 4, 'draft', 'mixed', 20, 10, false, true),
  ('a3000000-0000-4000-8000-000000000005', 'a2000000-0000-4000-8000-000000000001', 'how-to-smell-a-perfume', 5, 'draft', 'mixed', 15, 10, false, true),
  ('a3000000-0000-4000-8000-000000000006', 'a2000000-0000-4000-8000-000000000001', 'starting-an-olfactory-journal', 6, 'draft', 'practice', 5, 15, false, true)
on conflict (id) do update set module_id = excluded.module_id, slug = excluded.slug, position = excluded.position,
  lesson_type = excluded.lesson_type, reading_minutes = excluded.reading_minutes, practice_minutes = excluded.practice_minutes,
  is_preview = excluded.is_preview, requires_previous_lesson = excluded.requires_previous_lesson;

insert into public.academy_lesson_translations (lesson_id, locale, title)
values
  ('a3000000-0000-4000-8000-000000000001', 'en', 'What Perfumery Really Is'),
  ('a3000000-0000-4000-8000-000000000001', 'id', 'Apa Sebenarnya Parfum Itu'),
  ('a3000000-0000-4000-8000-000000000002', 'en', 'How We Experience Smell'),
  ('a3000000-0000-4000-8000-000000000002', 'id', 'Bagaimana Kita Mengalami Aroma'),
  ('a3000000-0000-4000-8000-000000000003', 'en', 'Notes, Materials, and Accords'),
  ('a3000000-0000-4000-8000-000000000003', 'id', 'Not, Bahan, dan Accord'),
  ('a3000000-0000-4000-8000-000000000004', 'en', 'Opening, Heart, and Drydown'),
  ('a3000000-0000-4000-8000-000000000004', 'id', 'Opening, Heart, dan Drydown'),
  ('a3000000-0000-4000-8000-000000000005', 'en', 'How to Smell a Perfume'),
  ('a3000000-0000-4000-8000-000000000005', 'id', 'Cara Mencium Parfum'),
  ('a3000000-0000-4000-8000-000000000006', 'en', 'Starting an Olfactory Journal'),
  ('a3000000-0000-4000-8000-000000000006', 'id', 'Memulai Jurnal Olfaktif')
on conflict (lesson_id, locale) do update set title = excluded.title;
