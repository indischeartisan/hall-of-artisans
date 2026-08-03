import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const [sourcePath, outputPath] = process.argv.slice(2);

if (!sourcePath || !outputPath) {
  throw new Error("Usage: node scripts/export-legacy-academy.mjs <source> <output>");
}

const source = await readFile(sourcePath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: sourcePath });

const academy = sandbox.window.ACADEMY_DATA;
if (!academy || !Array.isArray(academy.lessons)) {
  throw new Error("Legacy Academy data does not contain a lessons array.");
}
if (academy.lessons.length !== 6) {
  throw new Error(`Expected six legacy lessons, found ${academy.lessons.length}.`);
}

const exportDocument = {
  schemaVersion: 1,
  purpose: "Preserved migration source for Academy V1; not loaded at runtime.",
  source: sourcePath.replaceAll("\\\\", "/"),
  exportedAt: new Date().toISOString(),
  page: academy.page,
  lessons: academy.lessons
};

await writeFile(outputPath, `${JSON.stringify(exportDocument, null, 2)}\n`, "utf8");
console.log(`Exported ${academy.lessons.length} lessons to ${outputPath}.`);
