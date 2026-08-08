import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [service, page, parser, sourceText] = await Promise.all([
  read("src/features/academy/services/academyCatalogService.ts"),
  read("src/features/academy/pages/AcademyLessonPage.tsx"),
  read("src/features/academy/types/academyBlockContent.ts"),
  read("content/academy/lesson-1-what-perfumery-really-is-bilingual.json")
]);
const source = JSON.parse(sourceText);

assert.match(service, /getLessonBySlug\(courseId: string, slug: string/);
assert.match(service, /\.in\("module_id", modules\.map/);
assert.match(service, /\.eq\("slug", slug\)/);
assert.match(service, /if \(!options\.includeDrafts\) lessonQuery = lessonQuery\.eq\("status", "published"\)/);
assert.doesNotMatch(page, /lessons\[0\]|\.first\(\)/);
assert.match(page, /setLesson\(null\)/);
assert.match(page, /includeDrafts=resolved==="admin"|includeDrafts = resolved === "admin"/);
assert.match(page, /item\.status === "draft"/);
assert.match(parser, /replace\(\/\^\\s\*\\d\+\\\.\\s\*\//);
assert.doesNotMatch(page, /block\.block_type\.replaceAll/);
assert.doesNotMatch(page, /\{index\+1\}\. \{block\.block_type/);
assert.match(page, /block\.block_type === "exercise"/);
assert.match(page, /Guided Observation/);
assert.match(page, /block\.block_type === "summary"/);
assert.match(page, /variant !== "transition"/);
assert.equal(source.lesson.blocks.length, 17);
assert.deepEqual(source.lesson.blocks.map((block) => block.position), Array.from({ length: 17 }, (_, index) => index + 1));
assert.ok(source.lesson.blocks.every((block) => block.translations.en && block.translations.id));
assert.equal(source.canonicalSources.en, "lesson-1-what-perfumery-really-is-complete.en.md");
assert.equal(source.canonicalSources.id, "lesson-1-what-perfumery-really-is-complete.id.md");
const completeText = JSON.stringify(source);
for (const phrase of ["An idea such as", "Natural materials can be obtained", "Your direct experience of smelling remains the primary source", "Sebuah ide seperti", "IFRA Standards dapat melarang material tertentu", "Pengalaman mencium tetap menjadi sumber utama pengamatanmu"]) assert.ok(completeText.includes(phrase));
const englishContents = source.lesson.blocks.flatMap((block) => {
  if (block.type === "rich_text" && block.settings.variant !== "transition") return [block.translations.en.heading.replace(/^\s*\d+\.\s*/, "")];
  if (block.type === "exercise") return ["Guided Observation"];
  if (block.type === "summary") return ["Summary"];
  return [];
});
assert.deepEqual(englishContents, [
  "A Formula Is Not Yet a Perfume",
  "Perfumery Begins with Intention",
  "The Perfumer’s Palette",
  "A Formula Is a System of Relationships",
  "Creation Happens Through Modification",
  "A Perfume Must Work in the Real World",
  "Who Creates a Perfume?",
  "Guided Observation",
  "Summary"
]);

console.log("Academy lesson reader contract passed: exact slug, admin drafts, public filtering, and translated contents are enforced.");
