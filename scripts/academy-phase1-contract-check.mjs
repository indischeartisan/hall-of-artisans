import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const content = await read("supabase/migrations/20260803105730_create_academy_content_tables.sql");
const operational = await read("supabase/migrations/20260803105732_create_academy_enrollment_and_progress.sql");
const indexes = await read("supabase/migrations/20260803105733_add_academy_indexes_and_triggers.sql");
const security = await read("supabase/migrations/20260803105734_secure_academy_and_add_access_functions.sql");
const seed = await read("supabase/migrations/20260803105736_seed_free_academy_structure.sql");
const generated = await read("src/types/database.generated.types.ts");

for (const table of [
  "academy_courses", "academy_course_translations", "academy_modules", "academy_module_translations",
  "academy_lessons", "academy_lesson_translations", "academy_lesson_blocks", "academy_lesson_block_translations"
]) {
  assert.match(content, new RegExp(`create table public\\.${table} \\(`));
  assert.match(content, new RegExp(`alter table public\\.${table} force row level security`));
  assert.match(generated, new RegExp(`${table}: \\{`));
}
for (const table of ["academy_enrollments", "academy_lesson_progress"]) {
  assert.match(operational, new RegExp(`create table public\\.${table} \\(`));
  assert.match(operational, new RegExp(`alter table public\\.${table} force row level security`));
  assert.match(generated, new RegExp(`${table}: \\{`));
}

assert.match(content, /rich_text.*image.*diagram.*quote.*perfumer_note.*exercise.*journal_prompt.*knowledge_check.*summary.*download.*divider/s);
assert.doesNotMatch(content, /block_type.*raw_html/);
assert.match(content, /content::text !~ '<\[\^>\]\+>'/);
assert.equal((indexes.match(/execute function public\.set_updated_at\(\)/g) ?? []).length, 10);
assert.match(security, /on conflict on constraint academy_enrollments_user_id_course_id_key do update/);
assert.match(security, /revoke all on function private\.enroll_in_free_academy_course\(text\) from public/);
assert.match(security, /\(select auth\.uid\(\)\) = user_id/g);
assert.match(seed, /introduction-to-the-world-of-perfumery/);
assert.equal((seed.match(/a3000000-0000-4000-8000-00000000000[1-6]/g) ?? []).length >= 18, true);
assert.doesNotMatch(seed, /'published'/);

console.log("Academy Phase 1 contract passed: schema, RLS, seed, triggers, and generated types are aligned.");
