import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const returns = await server.ssrLoadModule("/src/features/auth/returnTo.ts");
  assert.equal(returns.sanitizeReturnTo("/describe-your-creation?resume=review"), "/describe-your-creation?resume=review");
  assert.equal(returns.sanitizeReturnTo("/artisan-bench?resume=review"), "/artisan-bench?resume=review");
  assert.equal(returns.sanitizeReturnTo("https://evil.example/path"), "/my-artisan-id");
  assert.equal(returns.sanitizeReturnTo("//evil.example/path"), "/my-artisan-id");
  assert.equal(returns.sanitizeReturnTo("/\\evil.example/path"), "/my-artisan-id");
  assert.equal(returns.authPathWithReturnTo("/artisan-login", "/artisan-bench?resume=review"), "/artisan-login?returnTo=%2Fartisan-bench%3Fresume%3Dreview");

  const [login, register, described, bench] = await Promise.all([
    readFile(new URL("../src/pages/ArtisanLoginPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/ArtisanRegisterPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/describe-creation/DescribeCreationPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/ArtisanBenchPage.tsx", import.meta.url), "utf8")
  ]);
  assert.ok(login.includes("sanitizeReturnTo"));
  assert.ok(register.includes("navigate(returnTo)"));
  assert.ok(register.includes("loginReturnPath"));
  assert.ok(described.includes('/describe-your-creation?resume=review'));
  assert.ok(bench.includes('/artisan-bench?resume=review'));
  assert.ok(bench.includes("readPendingBenchPreview"));
  console.log("Auth return contract check passed: safe internal returnTo and creation draft restoration.");
} finally {
  await server.close();
}
