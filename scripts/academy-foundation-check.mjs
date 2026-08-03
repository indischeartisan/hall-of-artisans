import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolvePricingRegion } from "../src/features/academy/utils/resolvePricingRegion.ts";
import { resolveCertificateName } from "../src/features/academy/utils/resolveCertificateName.ts";
import { isKnownLessonBlock, isUnknownLessonBlock } from "../src/features/academy/types/academyContent.ts";

assert.equal(resolvePricingRegion("ID"), "ID");
assert.equal(resolvePricingRegion("id"), "ID");
assert.equal(resolvePricingRegion("US"), "INTL");
assert.equal(resolvePricingRegion(null), "INTL");
assert.equal(resolvePricingRegion("unknown"), "INTL");
assert.equal(resolveCertificateName("Ayu Laras", "Ayu"), "Ayu Laras");
assert.equal(resolveCertificateName(null, "Ayu"), "Ayu");

assert.equal(isKnownLessonBlock({ id: "intro", type: "rich_text", paragraphs: [{ en: "Welcome", id: "Selamat datang" }] }), true);
assert.equal(isKnownLessonBlock({ id: "broken", type: "rich_text", paragraphs: [{ id: "Tanpa fallback" }] }), false);
assert.equal(isKnownLessonBlock({ id: "future", type: "video", src: "video.mp4" }), false);
assert.equal(isUnknownLessonBlock({ id: "future", type: "video", src: "video.mp4" }), true);
assert.equal(isUnknownLessonBlock(null), false);

const migration = await readFile(new URL("../supabase/migrations/20260803105729_add_academy_profile_foundation.sql", import.meta.url), "utf8");
for (const column of ["preferred_locale", "country_code", "pricing_region", "certificate_name"]) {
  assert.match(migration, new RegExp(`add column ${column} text`));
}
assert.match(migration, /grant update\(preferred_locale, country_code, pricing_region, certificate_name\)/);

console.log("Academy foundation check passed: pricing region and lesson block validation.");
