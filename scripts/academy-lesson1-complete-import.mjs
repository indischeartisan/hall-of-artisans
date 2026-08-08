import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [idPath, enPath, migrationPath] = process.argv.slice(2);
if (!idPath || !enPath || !migrationPath) throw new Error("Usage: node scripts/academy-lesson1-complete-import.mjs <id.md> <en.md> <migration.sql>");

const normalize = (value) => value.replaceAll("\r\n", "\n").replaceAll("\r", "\n").trim();
const [idMarkdown, enMarkdown, baseText] = await Promise.all([
  readFile(idPath, "utf8").then(normalize),
  readFile(enPath, "utf8").then(normalize),
  readFile("content/academy/lesson-1-what-perfumery-really-is-bilingual.json", "utf8")
]);
const source = JSON.parse(baseText);

const cleanInline = (value) => value.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/^“|”$/g, "").trim();
const runs = (value) => {
  const parts = value.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
  return parts.map((part) => ({ text: cleanInline(part), ...(/^\*.*\*$/.test(part) ? { emphasis: true } : {}) })).filter((run) => run.text);
};
function sections(markdown) {
  const lines = normalize(markdown).split("\n");
  const result = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line || line === "---") { index += 1; continue; }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      result.push({ type: "heading", level: Math.min(4, heading[1].length + 1), text: cleanInline(heading[2]) });
      index += 1;
      continue;
    }
    const quote = /^>\s*(.+)$/.exec(line);
    if (quote) {
      result.push({ type: "quote", runs: runs(quote[1]) });
      index += 1;
      continue;
    }
    const bullet = /^\*\s+(.+)$/.exec(line);
    const numbered = /^\d+\.\s+(.+)$/.exec(line);
    if (bullet || numbered) {
      const type = numbered ? "numbered_list" : "bullet_list";
      const items = [];
      const pattern = numbered ? /^\d+\.\s+(.+)$/ : /^\*\s+(.+)$/;
      while (index < lines.length) {
        const match = pattern.exec(lines[index].trim());
        if (!match) break;
        items.push(cleanInline(match[1].replace(/;$/, "")));
        index += 1;
      }
      result.push({ type, items });
      continue;
    }
    const paragraph = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (!current || current === "---" || /^(#{1,4})\s+/.test(current) || /^>\s*/.test(current) || /^\*\s+/.test(current) || /^\d+\.\s+/.test(current)) break;
      paragraph.push(current);
      index += 1;
    }
    if (paragraph.length) result.push({ type: "paragraph", runs: runs(paragraph.join(" ")) });
    else index += 1;
  }
  return result;
}
const between = (markdown, start, end) => {
  const from = markdown.indexOf(start);
  assert.notEqual(from, -1, `Missing heading: ${start}`);
  const to = end ? markdown.indexOf(end, from + start.length) : markdown.length;
  assert.notEqual(to, -1, `Missing ending heading: ${end}`);
  return markdown.slice(from, to);
};
const withoutFirstHeading = (items) => items[0]?.type === "heading" ? items.slice(1) : items;
const titleFrom = (items) => items.find((item) => item.type === "heading")?.text;

const markers = {
  en: {
    opening: "## A Formula Is Not Yet a Perfume", learn: "## What You Will Learn", one: "# 1. Perfumery Begins with Intention", diagramOne: "## From idea to fragrance", misconceptionOne: "### Common misconception", two: "# 2. The Perfumer’s Palette", noteTwo: "## Perfumer’s Note", misconceptionTwo: "### Common misconception", three: "# 3. A Formula Is a System of Relationships", four: "# 4. Creation Happens Through Modification", noteFour: "## Perfumer’s Note", misconceptionFour: "### Common misconception", five: "# 5. A Perfume Must Work in the Real World", six: "# 6. Who Creates a Perfume?", note: "# Perfumer’s Note", observation: "# Reading a Perfume Without Reading Its Notes", reflection: "# Reflection", summary: "# Summary", continue: "# Continue Observing"
  },
  id: {
    opening: "## Sebuah Formula Belum Tentu Menjadi Parfum", learn: "## Yang Akan Kamu Pelajari", one: "# 1. Perfumery Dimulai dari Sebuah Maksud", diagramOne: "### Dari gagasan menuju parfum", misconceptionOne: "### Kesalahpahaman umum", two: "# 2. Palet Seorang Perfumer", noteTwo: "### Perfumer’s Note", misconceptionTwo: "### Kesalahpahaman umum", three: "# 3. Formula Adalah Hubungan Antarbagian", four: "# 4. Penciptaan Terjadi Melalui Modifikasi", noteFour: "### Perfumer’s Note", misconceptionFour: "### Kesalahpahaman umum", five: "# 5. Sebuah Parfum Harus Bekerja di Dunia Nyata", six: "# 6. Siapa yang Menciptakan Sebuah Parfum?", note: "# Perfumer’s Note", observation: "# Membaca Parfum Tanpa Membaca Notes-nya", reflection: "# Reflection", summary: "# Ringkasan", continue: "# Continue Observing"
  }
};

function buildLocale(markdown, locale) {
  const m = markers[locale];
  const firstMisconception = markdown.indexOf(m.misconceptionOne, markdown.indexOf(m.diagramOne));
  const secondMisconception = markdown.indexOf(m.misconceptionTwo, markdown.indexOf(m.noteTwo));
  const fourthMisconception = markdown.indexOf(m.misconceptionFour, markdown.indexOf(m.noteFour));
  const chapterOne = [...sections(between(markdown, m.one, m.diagramOne)), ...sections(markdown.slice(firstMisconception, markdown.indexOf(m.two)))];
  const chapterTwo = [...sections(between(markdown, m.two, m.noteTwo)), ...sections(markdown.slice(secondMisconception, markdown.indexOf(m.three)))];
  const chapterFour = [...sections(between(markdown, m.four, m.noteFour)), ...sections(markdown.slice(fourthMisconception, markdown.indexOf(m.five)))];
  const noteTwoSections = sections(markdown.slice(markdown.indexOf(m.noteTwo), secondMisconception));
  const noteFourSections = sections(markdown.slice(markdown.indexOf(m.noteFour), fourthMisconception));
  const finalNoteSections = sections(between(markdown, m.note, "# Guided Observation"));
  const observationSections = sections(between(markdown, m.observation, m.reflection));
  const reflectionSections = sections(between(markdown, m.reflection, m.summary));
  const summarySections = sections(between(markdown, m.summary, m.continue));
  const continueSections = sections(between(markdown, m.continue));
  return {
    1: { heading: cleanInline(m.opening.replace(/^##\s+/, "")), sections: sections(between(markdown, m.opening, m.learn)) },
    2: { heading: cleanInline(m.one.replace(/^#\s+/, "")), sections: chapterOne },
    4: { heading: cleanInline(m.two.replace(/^#\s+/, "")), sections: chapterTwo },
    5: { title: locale === "id" ? "Material Memiliki Tugas" : "Materials Have Roles", sections: noteTwoSections.filter((item) => item.type !== "heading") },
    6: { heading: cleanInline(m.three.replace(/^#\s+/, "")), sections: sections(between(markdown, m.three, m.four)) },
    8: { heading: cleanInline(m.four.replace(/^#\s+/, "")), sections: chapterFour },
    10: { title: locale === "id" ? "Jangan Menilai Terlalu Cepat" : "Do Not Judge Too Quickly", sections: noteFourSections.filter((item) => item.type !== "heading") },
    11: { heading: cleanInline(m.five.replace(/^#\s+/, "")), sections: sections(between(markdown, m.five, m.six)) },
    12: { heading: cleanInline(m.six.replace(/^#\s+/, "")), sections: sections(between(markdown, m.six, m.note)) },
    13: { title: locale === "id" ? "Cium Keputusannya, Bukan Hanya Bahannya" : "Smell the Decision, Not Only the Ingredient", sections: finalNoteSections.filter((item) => item.type !== "heading") },
    14: { title: cleanInline(m.observation.replace(/^#\s+/, "")), sections: withoutFirstHeading(observationSections) },
    15: { title: locale === "id" ? "Refleksi" : "Reflection", sections: withoutFirstHeading(reflectionSections) },
    16: { title: locale === "id" ? "Ringkasan" : "Summary", sections: withoutFirstHeading(summarySections) },
    17: { heading: locale === "id" ? "Lanjutkan Pengamatan" : "Continue Observing", sections: withoutFirstHeading(continueSections) }
  };
}

const complete = { en: buildLocale(enMarkdown, "en"), id: buildLocale(idMarkdown, "id") };
for (const block of source.lesson.blocks) {
  for (const locale of ["en", "id"]) if (complete[locale][block.position]) block.translations[locale] = complete[locale][block.position];
}
source.lesson.readingMinutes = 25;
source.lesson.practiceMinutes = 15;
source.lesson.isPreview = false;
source.lesson.status = "draft";
source.canonicalSources = { en: "lesson-1-what-perfumery-really-is-complete.en.md", id: "lesson-1-what-perfumery-really-is-complete.id.md" };

const serialized = JSON.stringify(source);
for (const phrase of ["An idea such as", "Natural materials can be obtained", "The same numerical limit does not apply equally", "Your direct experience of smelling remains the primary source"]) assert.ok(serialized.includes(phrase), `Missing complete English phrase: ${phrase}`);
for (const phrase of ["Sebuah ide seperti", "Material natural dapat diperoleh", "IFRA Standards dapat melarang material tertentu", "Pengalaman mencium tetap menjadi sumber utama pengamatanmu"]) assert.ok(serialized.includes(phrase), `Missing complete Indonesian phrase: ${phrase}`);
assert.equal(source.lesson.blocks.length, 17);

const contentDir = path.join(process.cwd(), "content", "academy");
await mkdir(contentDir, { recursive: true });
await Promise.all([
  writeFile(path.join(contentDir, "lesson-1-what-perfumery-really-is-complete.en.md"), `${enMarkdown}\n`, "utf8"),
  writeFile(path.join(contentDir, "lesson-1-what-perfumery-really-is-complete.id.md"), `${idMarkdown}\n`, "utf8"),
  writeFile(path.join(contentDir, "lesson-1-what-perfumery-really-is-bilingual.json"), `${JSON.stringify(source, null, 2)}\n`, "utf8")
]);

const json = (value) => `$academy_complete$${JSON.stringify(value)}$academy_complete$::jsonb`;
const values = source.lesson.blocks.flatMap((block) => ["en", "id"].map((locale) => `(${block.position}, '${locale}', ${json(block.translations[locale])})`)).join(",\n      ");
const sql = `begin;\n\ndo $academy_lesson_complete$\ndeclare\n  target_lesson_id uuid;\nbegin\n  select l.id into target_lesson_id\n  from public.academy_lessons l\n  join public.academy_modules m on m.id=l.module_id\n  join public.academy_courses c on c.id=m.course_id\n  where c.slug='introduction-to-the-world-of-perfumery' and l.slug='what-perfumery-really-is';\n  if target_lesson_id is null then raise exception 'Target Academy lesson not found'; end if;\n\n  update public.academy_lessons set status='draft', published_at=null, is_preview=false, reading_minutes=25, practice_minutes=15, updated_at=now() where id=target_lesson_id;\n\n  update public.academy_lesson_block_translations bt\n  set content=source.content, updated_at=now()\n  from (values\n      ${values}\n  ) as source(position,locale,content)\n  join public.academy_lesson_blocks b on b.lesson_id=target_lesson_id and b.position=source.position\n  where bt.block_id=b.id and bt.locale=source.locale;\n\n  if (select count(*) from public.academy_lesson_blocks where lesson_id=target_lesson_id) <> 17 then raise exception 'Expected 17 lesson blocks'; end if;\nend;\n$academy_lesson_complete$;\n\ncommit;\n`;
await writeFile(migrationPath, sql, "utf8");
console.log(JSON.stringify({ valid: true, blocks: 17, locales: ["en", "id"], status: "draft", rawHtml: false, migrationPath }, null, 2));
