import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [mapper, admin, portal, perfumer] = await Promise.all([
  read("src/lib/actionError.ts"),
  read("src/features/admin/AdminDashboardPages.tsx"),
  read("src/features/admin/AdminPortalPage.tsx"),
  read("src/features/perfumer/PerfumerWorkspacePages.tsx")
]);

for (const recovery of ["Sign in again", "verify your role", "Refresh the data", "Check your connection", "database migration"]) {
  assert.match(mapper, new RegExp(recovery, "i"), `error recovery guidance must include: ${recovery}`);
}
assert.match(admin, /actionableError\(cause, `\$\{stage\.replaceAll/, "order transitions need stage-specific actionable errors");
assert.match(admin, /actionableError\(cause, "Perfumer assignment/, "assignment failures need actionable errors");
assert.match(portal, /actionableError\(cause, "The staff action/, "legacy admin portal must use the shared mapper");
assert.match(perfumer, /actionableError\(cause, "The project action/, "perfumer proposal and chat actions must use the shared mapper");
assert.doesNotMatch(perfumer, /return "The action could not be completed\."/, "perfumer actions must not fall back to a context-free error");

console.log("Action error contract passed: staff failures provide recovery guidance and preserve context.");
