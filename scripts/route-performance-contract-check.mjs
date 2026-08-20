import { existsSync, readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const styles = [
  "admin-dashboard.css",
  "aftercare.css",
  "perfumer-workspace.css",
  "admin-library.css",
].map((name) => readFileSync(new URL(`../src/styles/${name}`, import.meta.url), "utf8")).join("\n");

const lazyRoutes = [
  "ArtisanBenchPage",
  "OrderDetailPage",
  "AdminDashboardLayout",
  "PerfumerWorkspaceLayout",
];

for (const route of lazyRoutes) {
  if (!new RegExp(`const\\s+${route}\\s*=\\s*lazy\\(`).test(app)) {
    throw new Error(`${route} must remain route-lazy to protect initial load performance.`);
  }
  if (new RegExp(`import\\s+${route}\\s+from`).test(app)) {
    throw new Error(`${route} must not be restored as an eager import.`);
  }
}

const staleAssets = [
  "/assets/images/bg-lobby-light.webp",
  "/assets/images/library/library-bg.webp",
  "/assets/images/artisan-bench-bg.webp",
];
for (const asset of staleAssets) {
  if (styles.includes(asset)) throw new Error(`Stale background reference found: ${asset}`);
}

const requiredAssets = [
  "public/assets/backgrounds/lobby-desktop-bright-final.webp",
  "public/assets/library/library-background.webp",
  "public/assets/images/artisan-bench-bright.webp",
];
for (const asset of requiredAssets) {
  if (!existsSync(new URL(`../${asset}`, import.meta.url))) {
    throw new Error(`Required background asset is missing: ${asset}`);
  }
}

console.log("Route performance contract passed.");
