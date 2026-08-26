const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const cases = [
    { name: "desktop", width: 1366, height: 900, pwa: false },
    { name: "mobile", width: 390, height: 844, pwa: true },
    { name: "tablet-portrait", width: 820, height: 1180, pwa: true },
    { name: "tablet-landscape", width: 1180, height: 820, pwa: true },
    { name: "large-tablet-landscape", width: 1366, height: 1024, pwa: true }
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
      await page.evaluate(() => {
        document.documentElement.dataset.pwaMode = "standalone";
        document.documentElement.dataset.tabletPwa = window.innerWidth > 760 ? "true" : "false";
      });
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

  const tabletContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    screen: { width: 1280, height: 800 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    userAgent: "Mozilla/5.0 (Linux; Android 14; Tablet) AppleWebKit/537.36 Chrome/140 Safari/537.36"
  });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto("http://127.0.0.1:4173/chamber-of-creation", { waitUntil: "networkidle" });
  const chamberTablet = await tabletPage.evaluate(() => ({
    name: "tablet-browser-chamber",
    tabletDevice: document.documentElement.dataset.tabletDevice,
    viewportWidth: window.innerWidth,
    menuToggle: getComputedStyle(document.querySelector(".menu-toggle")).display,
    carouselControls: getComputedStyle(document.querySelector(".creation-carousel-controls")).display,
    bodyHasContent: document.body.innerText.trim().length > 0,
    errorOverlay: Boolean(document.querySelector(".vite-error-overlay")),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    errors: []
  }));
  results.push(chamberTablet);

  await tabletPage.goto("http://127.0.0.1:4173/artisan-bench", { waitUntil: "networkidle" });
  const benchTablet = await tabletPage.evaluate(() => ({
    name: "tablet-browser-bench",
    tabletDevice: document.documentElement.dataset.tabletDevice,
    viewportWidth: window.innerWidth,
    menuToggle: getComputedStyle(document.querySelector(".menu-toggle")).display,
    mobileStatus: getComputedStyle(document.querySelector(".mobile-workbench-status")).display,
    bodyHasContent: document.body.innerText.trim().length > 0,
    errorOverlay: Boolean(document.querySelector(".vite-error-overlay")),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    errors: []
  }));
  results.push(benchTablet);
  await tabletContext.close();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));

  const tabletLayoutFailed = chamberTablet.tabletDevice !== "true"
    || chamberTablet.viewportWidth > 700
    || chamberTablet.menuToggle === "none"
    || chamberTablet.carouselControls === "none"
    || benchTablet.mobileStatus === "none";
  const failed = tabletLayoutFailed
    || results.some(result => !result.bodyHasContent || result.errorOverlay || result.horizontalOverflow || result.errors.length);
  process.exitCode = failed ? 1 : 0;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
