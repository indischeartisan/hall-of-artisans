const { chromium } = require("C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.59.1/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const context = await browser.newContext({ viewport: { width: 512, height: 908 }, serviceWorkers: "block" });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  await page.goto("http://127.0.0.1:4173/artisan-bench", { waitUntil: "networkidle" });
  for (let index = 0; index < 3; index += 1) {
    await page.evaluate(() => {
      const button = [...document.querySelectorAll("button")].find((item) =>
        item.textContent?.trim() === "+ Top" && !item.classList.contains("is-active")
      );
      button?.click();
    });
    await page.waitForTimeout(150);
  }
  await page.locator(".mobile-workbench-nav button").filter({ hasText: "Formula" }).click();
  await page.waitForTimeout(700);
  const data = await page.evaluate(() => {
    const query = (selector) => document.querySelector(selector);
    const rect = (selector) => {
      const bounds = query(selector)?.getBoundingClientRect();
      return bounds ? { x: Math.round(bounds.x), y: Math.round(bounds.y), w: Math.round(bounds.width), h: Math.round(bounds.height) } : null;
    };
    const row = query(".mobile-view-formula > .build-review-row");
    return {
      overview: rect(".mobile-formula-overview"),
      material: rect(".mobile-formula-material"),
      materials: document.querySelectorAll(".mobile-formula-material").length,
      materialStyle: (() => {
        const element = query(".mobile-formula-material");
        if (!element) return null;
        const style = getComputedStyle(element);
        return { display: style.display, minHeight: style.minHeight, height: style.height, padding: style.padding, grid: style.gridTemplateColumns };
      })(),
      add: rect(".mobile-layer-top .layer-card[data-layer=top] .add-btn"),
      validation: rect(".mobile-formula-validation"),
      formula: rect(".mobile-view-formula .formula-builder"),
      scroll: { client: row?.clientHeight, scroll: row?.scrollHeight, overflow: getComputedStyle(row).overflowY },
      sheets: [...document.styleSheets].map((sheet) => sheet.href).filter((href) => href?.includes("formula-mobile")),
    };
  });
  await page.screenshot({ path: "artifacts/formula-mobile-reference-pass.png", fullPage: false });
  console.log(JSON.stringify(data));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
