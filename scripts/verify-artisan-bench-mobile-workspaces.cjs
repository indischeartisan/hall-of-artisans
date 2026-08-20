const { chromium } = require("C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.59.1/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
  const page = await browser.newPage({ viewport: { width: 473, height: 908 } });
  await page.goto("http://127.0.0.1:4173/artisan-bench", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const outputRoot = "C:/Users/user/.codex/visualizations/2026/08/10/019fe9a1-06e4-7122-985f-23f3158efa61";
  const results = {};

  for (const workspace of ["materials", "insights", "notes", "review"]) {
    await page.locator(`.mobile-workbench-nav button`).filter({ hasText: new RegExp(workspace, "i") }).click();
    await page.waitForTimeout(250);
    results[workspace] = await page.evaluate((name) => {
      const nav = document.querySelector(".mobile-workbench-nav");
      const workspaceElement = document.querySelector(`.mobile-view-${name}`);
      return {
        viewport: innerHeight,
        htmlHeight: document.documentElement.scrollHeight,
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
        navBottom: nav ? Math.round(nav.getBoundingClientRect().bottom) : null,
        workspaceScrollable: workspaceElement ? workspaceElement.scrollHeight >= workspaceElement.clientHeight : null,
        activeTab: document.querySelector(".mobile-workbench-nav .is-active small")?.textContent
      };
    }, workspace);
    await page.screenshot({ path: `${outputRoot}/artisan-bench-pwa-${workspace}.png`, fullPage: false });
  }

  await page.getByRole("button", { name: "Insights" }).click();
  await page.getByRole("button", { name: "Balance", exact: true }).click();
  results.insightsBalance = await page.evaluate(() => ({
    analysis: getComputedStyle(document.querySelector(".analysis")).display,
    drydown: getComputedStyle(document.querySelector(".drydown")).display
  }));
  await page.getByRole("button", { name: "Drydown", exact: true }).click();
  results.insightsDrydown = await page.evaluate(() => ({
    analysis: getComputedStyle(document.querySelector(".analysis")).display,
    drydown: getComputedStyle(document.querySelector(".drydown")).display
  }));

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
