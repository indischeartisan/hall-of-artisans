const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const cases = [
    { name: "desktop", width: 1366, height: 900, pwa: false },
    { name: "mobile", width: 390, height: 844, pwa: true },
    { name: "tablet-portrait", width: 820, height: 1180, pwa: true },
    { name: "tablet-landscape", width: 1180, height: 820, pwa: true }
  ];
  const results = [];

  for (const testCase of cases) {
    const page = await browser.newPage({ viewport: testCase });
    const errors = [];
    page.on("console", message => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("http://127.0.0.1:4173/artisan-bench", { waitUntil: "networkidle" });
    if (testCase.pwa) {
      await page.evaluate(() => { document.documentElement.dataset.pwaMode = "standalone"; });
    }
    const metrics = await page.evaluate(() => {
      const style = selector => {
        const element = document.querySelector(selector);
        return element ? getComputedStyle(element) : null;
      };
      return {
        mode: document.documentElement.dataset.pwaMode,
        bodyHasContent: document.body.innerText.trim().length > 0,
        errorOverlay: Boolean(document.querySelector(".vite-error-overlay")),
        mobileStatus: style(".mobile-workbench-status")?.display,
        workshopColumns: style(".expert-workshop")?.gridTemplateColumns,
        topColumns: style(".top-controls")?.gridTemplateColumns,
        layerColumns: style(".layer-grid")?.gridTemplateColumns,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    results.push({ name: testCase.name, ...metrics, errors });
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));

  const failed = results.some(result => !result.bodyHasContent || result.errorOverlay || result.horizontalOverflow || result.errors.length);
  process.exitCode = failed ? 1 : 0;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
