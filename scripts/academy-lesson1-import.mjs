import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourcePath = process.argv[2];
const migrationPath = process.argv[3];
if (!sourcePath) throw new Error("Usage: node scripts/academy-lesson1-import.mjs <source.json> [migration.sql]");

const source = JSON.parse(await readFile(sourcePath, "utf8"));
if (source.canonicalSources) throw new Error("This lesson now uses complete Markdown sources. Run academy-lesson1-complete-import.mjs instead.");
const allowedTypes = new Set(["rich_text", "image", "diagram", "quote", "perfumer_note", "exercise", "journal_prompt", "knowledge_check", "summary", "download", "divider"]);
const requiredLessonTypes = new Set(["rich_text", "diagram", "perfumer_note", "exercise", "journal_prompt", "summary"]);
const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const stringArray = (value) => Array.isArray(value) && value.every(nonEmpty);
const titledBodies = (value) => Array.isArray(value) && value.every((item) => isRecord(item) && nonEmpty(item.title) && nonEmpty(item.body));
const containsRawHtml = (value) => {
  if (typeof value === "string") return /<[^>]+>/.test(value);
  if (Array.isArray(value)) return value.some(containsRawHtml);
  if (!isRecord(value)) return false;
  return Object.keys(value).some((key) => key === "html" || key === "raw_html") || Object.values(value).some(containsRawHtml);
};

function validateTranslation(type, value, settings) {
  assert.ok(isRecord(value), `${type} translation must be an object`);
  if (type === "rich_text") {
    assert.ok(nonEmpty(value.heading));
    if (value.paragraphs !== undefined) assert.ok(stringArray(value.paragraphs));
    if (value.exampleParagraphs !== undefined) assert.ok(stringArray(value.exampleParagraphs));
    if (value.items !== undefined) assert.ok(titledBodies(value.items));
    if (value.misconception !== undefined) assert.ok(isRecord(value.misconception) && nonEmpty(value.misconception.claim) && nonEmpty(value.misconception.correction));
    if (value.nextLesson !== undefined) assert.ok(isRecord(value.nextLesson) && nonEmpty(value.nextLesson.title) && nonEmpty(value.nextLesson.question));
  } else if (type === "diagram") {
    assert.ok(nonEmpty(value.title));
    assert.ok(["process", "radial", "cycle"].includes(settings.layout));
    if (settings.layout === "radial") assert.ok(nonEmpty(value.center) && stringArray(value.nodes));
    else assert.ok(stringArray(value.steps));
  } else if (type === "perfumer_note") assert.ok(nonEmpty(value.title) && nonEmpty(value.body));
  else if (type === "exercise") assert.ok(nonEmpty(value.title) && nonEmpty(value.purpose) && stringArray(value.materials) && titledBodies(value.steps) && nonEmpty(value.closing));
  else if (type === "journal_prompt") assert.ok(nonEmpty(value.title) && stringArray(value.prompts) && nonEmpty(value.note));
  else if (type === "summary") assert.ok(nonEmpty(value.title) && titledBodies(value.items));
}

assert.equal(source.schemaVersion, "1.0.0");
assert.equal(source.course?.slug, "introduction-to-the-world-of-perfumery");
assert.equal(source.module?.position, 1);
assert.equal(source.lesson?.slug, "what-perfumery-really-is");
assert.equal(source.lesson?.position, 1);
assert.equal(source.lesson?.readingMinutes, 25);
assert.equal(source.lesson?.practiceMinutes, 15);
assert.equal(source.lesson?.isPreview, false);
assert.equal(source.lesson?.requiresPreviousLesson, false);
assert.deepEqual(Object.keys(source.lesson.translations).sort(), ["en", "id"]);
assert.equal(source.lesson.blocks.length, 17);
assert.deepEqual(source.lesson.blocks.map((block) => block.position), Array.from({ length: 17 }, (_, index) => index + 1));
assert.equal(new Set(source.lesson.blocks.map((block) => block.id)).size, 17);
assert.ok(source.lesson.blocks.every((block) => allowedTypes.has(block.type)));
assert.ok([...requiredLessonTypes].every((type) => source.lesson.blocks.some((block) => block.type === type)));
assert.equal(source.implementationNotes?.rawHtmlAllowed, false);
assert.equal(containsRawHtml(source), false);
for (const block of source.lesson.blocks) {
  assert.ok(isRecord(block.settings), `settings missing for ${block.id}`);
  assert.deepEqual(Object.keys(block.translations).sort(), ["en", "id"]);
  validateTranslation(block.type, block.translations.en, block.settings);
  validateTranslation(block.type, block.translations.id, block.settings);
}

const preservationDir = path.join(process.cwd(), "content", "academy");
const preservationPath = path.join(preservationDir, "lesson-1-what-perfumery-really-is-bilingual.json");
await mkdir(preservationDir, { recursive: true });
await writeFile(preservationPath, `${JSON.stringify(source, null, 2)}\n`, "utf8");

const json = (value) => `$academy_json$${JSON.stringify(value)}$academy_json$::jsonb`;
const literal = (value) => `'${String(value).replaceAll("'", "''")}'`;
const blockSql = source.lesson.blocks.map((block) => {
  const stableId = `a4100000-0000-4000-8000-${String(block.position).padStart(12, "0")}`;
  return `
    select id into target_block_id from public.academy_lesson_blocks where lesson_id = target_lesson_id and position = ${block.position};
    if target_block_id is null then
      target_block_id := '${stableId}'::uuid;
      insert into public.academy_lesson_blocks (id, lesson_id, block_type, position, status, settings)
      values (target_block_id, target_lesson_id, ${literal(block.type)}, ${block.position}, 'draft', ${json(block.settings)});
    else
      update public.academy_lesson_blocks set block_type = ${literal(block.type)}, status = 'draft', settings = ${json(block.settings)}, updated_at = now() where id = target_block_id;
    end if;
    insert into public.academy_lesson_block_translations (block_id, locale, content) values
      (target_block_id, 'en', ${json(block.translations.en)}),
      (target_block_id, 'id', ${json(block.translations.id)})
    on conflict (block_id, locale) do update set content = excluded.content, updated_at = now();`;
}).join("\n");

const lesson = source.lesson;
const sql = `begin;

do $academy_import$
declare
  target_course_id uuid;
  target_module_id uuid;
  target_lesson_id uuid;
  target_block_id uuid;
begin
  select id into target_course_id from public.academy_courses where slug = ${literal(source.course.slug)};
  if target_course_id is null then raise exception 'Academy course not found: %', ${literal(source.course.slug)}; end if;

  select id into target_module_id from public.academy_modules where course_id = target_course_id and position = ${source.module.position};
  if target_module_id is null then raise exception 'Academy module position % not found', ${source.module.position}; end if;

  select id into target_lesson_id from public.academy_lessons where slug = ${literal(lesson.slug)};
  if target_lesson_id is null then
    target_lesson_id := 'a3000000-0000-4000-8000-000000000001'::uuid;
    insert into public.academy_lessons (id, module_id, slug, position, status, lesson_type, reading_minutes, practice_minutes, is_preview, requires_previous_lesson)
    values (target_lesson_id, target_module_id, ${literal(lesson.slug)}, ${lesson.position}, 'draft', ${literal(lesson.lessonType)}, ${lesson.readingMinutes}, ${lesson.practiceMinutes}, false, false);
  else
    update public.academy_lessons set module_id = target_module_id, position = ${lesson.position}, status = 'draft', lesson_type = ${literal(lesson.lessonType)}, reading_minutes = ${lesson.readingMinutes}, practice_minutes = ${lesson.practiceMinutes}, is_preview = false, requires_previous_lesson = false, published_at = null, updated_at = now() where id = target_lesson_id;
  end if;

  insert into public.academy_lesson_translations (lesson_id, locale, title, opening_line, introduction, learning_objectives, materials_needed) values
    (target_lesson_id, 'en', ${literal(lesson.translations.en.title)}, ${literal(lesson.translations.en.openingLine)}, ${literal(lesson.translations.en.introduction)}, ${json(lesson.translations.en.learningObjectives)}, ${json(lesson.translations.en.materialsNeeded)}),
    (target_lesson_id, 'id', ${literal(lesson.translations.id.title)}, ${literal(lesson.translations.id.openingLine)}, ${literal(lesson.translations.id.introduction)}, ${json(lesson.translations.id.learningObjectives)}, ${json(lesson.translations.id.materialsNeeded)})
  on conflict (lesson_id, locale) do update set title = excluded.title, opening_line = excluded.opening_line, introduction = excluded.introduction, learning_objectives = excluded.learning_objectives, materials_needed = excluded.materials_needed, updated_at = now();
${blockSql}
end;
$academy_import$;

commit;
`;

if (migrationPath) await writeFile(migrationPath, sql, "utf8");
console.log(JSON.stringify({ valid: true, source: sourcePath, preservationPath, migrationPath: migrationPath ?? null, courseSlug: source.course.slug, modulePosition: source.module.position, lessonSlug: lesson.slug, lessonPosition: lesson.position, blocks: lesson.blocks.length, translations: 2 + lesson.blocks.length * 2, status: "draft", rawHtml: false }, null, 2));
