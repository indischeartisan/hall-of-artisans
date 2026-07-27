import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [environment, hosting, gitignore, supabaseConfig, migrations] = await Promise.all([
  read(".env.beta.example"),
  read("vercel.json"),
  read(".gitignore"),
  read("supabase/config.toml"),
  readdir(new URL("supabase/migrations/", root))
]);

for (const name of ["VITE_BETA_MODE", "VITE_SITE_URL", "VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"]) {
  assert.match(environment, new RegExp(`^${name}=`, "m"), `Beta environment template must include ${name}`);
}
assert.ok(!/service[_-]?role/i.test(environment), "Frontend beta environment must never include a service-role key");
assert.match(hosting, /"outputDirectory"\s*:\s*"dist"/, "Hosting must publish the Vite dist directory");
assert.match(hosting, /"destination"\s*:\s*"\/index.html"/, "Hosting must provide a React Router SPA fallback");
assert.match(gitignore, /^\.env\.\*\.local$/m, "Local environment variants must stay ignored");
assert.match(supabaseConfig, /enable_confirmations\s*=\s*true/, "Beta Auth must retain email confirmations");
assert.ok(migrations.length >= 40, "The complete migration history must be available for a clean beta database");
assert.equal(new Set(migrations).size, migrations.length, "Migration filenames must be unique");
assert.ok(migrations.every(name => /^\d{14}_[a-z0-9_]+\.sql$/.test(name)), "Every migration must use a sortable timestamp filename");

console.log(`Beta readiness foundation passed: ${migrations.length} migrations, SPA hosting, safe frontend environment, and Auth confirmation config.`);
