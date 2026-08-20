import fs from "node:fs";

const page = fs.readFileSync("src/pages/ArtisanBenchPage.tsx", "utf8");
const shell = fs.readFileSync("src/styles/artisan-bench-shell.css", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("public/manifest.webmanifest", "utf8"));
const worker = fs.readFileSync("public/sw.js", "utf8");

const checks = [
  [page.includes('type MobileWorkspace = "materials" | "formula" | "insights" | "notes" | "review"'), "five mobile workspaces exist"],
  [page.includes('aria-label="Artisan Bench workspace"'), "workspace navigation is labelled"],
  [shell.includes(".mobile-workbench-nav"), "mobile bottom navigation is styled"],
  [shell.includes("mobile-view-insights"), "insights view is isolated"],
  [shell.includes('grid-column: 1 !important'), "insights panels stack in one mobile column"],
  [page.includes('aria-label="Formula note layers"'), "formula layer switcher is accessible"],
  [shell.includes("height: 100dvh"), "mobile PWA uses a fixed app viewport"],
  [shell.includes("mobile-layer-top"), "formula shows one note layer at a time"],
  [html.includes('rel="manifest"'), "manifest is linked"],
  [manifest.display === "standalone", "PWA opens standalone"],
  [manifest.start_url === "/artisan-bench", "PWA starts at Artisan Bench"],
  [worker.includes('request.mode === "navigate"'), "service worker provides navigation fallback"],
  [worker.includes('url.origin !== self.location.origin'), "service worker does not cache external APIs"],
];

const failures = checks.filter(([passed]) => !passed);
if (failures.length) {
  failures.forEach(([, message]) => console.error(`FAIL: ${message}`));
  process.exit(1);
}
checks.forEach(([, message]) => console.log(`PASS: ${message}`));
