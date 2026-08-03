import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read=(path)=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const migration=await read("supabase/migrations/20260803130849_publish_academy_limited_beta_lesson.sql");
const renderer=await read("src/features/academy/components/LessonBlockRenderer.tsx");
const parser=await read("src/features/academy/types/academyBlockContent.ts");
const reader=await read("src/features/academy/pages/AcademyLessonPage.tsx");
const app=await read("src/App.tsx");

assert.match(migration,/how-to-smell-a-perfume|a3000000-0000-4000-8000-000000000005/);
assert.equal((migration.match(/a4000000-0000-4000-8000-00000000000[1-7]','en'/g)??[]).length,7);
assert.equal((migration.match(/a4000000-0000-4000-8000-00000000000[1-7]','id'/g)??[]).length,7);
assert.match(migration,/is_preview=false/);
assert.doesNotMatch(migration,/insert into public\.academy_courses/);
assert.doesNotMatch(migration,/paid|price|checkout/i);
for(const block of ["rich_text","image","diagram","quote","perfumer_note","exercise","summary","divider"]){assert.match(parser,new RegExp(`case "${block}"`));}
assert.doesNotMatch(renderer,/dangerouslySetInnerHTML|innerHTML/);
assert.match(parser,/"html" in value \|\| "raw_html" in value/);
assert.match(reader,/last_opened_at:new Date\(\)\.toISOString\(\)/);
assert.match(reader,/status:"completed"/);
assert.match(app,/path="courses\/:courseSlug" element=\{<EnrolledCourseOverviewPage/);

console.log("Academy Phase 2 contract passed: limited-beta content, safe renderer, route, and progress behavior are aligned.");
