const { chromium } = require("C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.59.1/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  });
  const page = await browser.newPage({ viewport: { width: 473, height: 908 } });
  await page.goto("http://127.0.0.1:4173/artisan-bench", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const readMobile = () => page.evaluate(() => {
    const visible = (element) => Boolean(
      element
      && getComputedStyle(element).display !== "none"
      && element.getBoundingClientRect().height > 0
    );
    const navigation = document.querySelector(".mobile-workbench-nav");
    const noteList = document.querySelector('.layer-card[data-layer="top"] .selected-list');
    return {
      viewport: innerHeight,
      htmlHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.scrollHeight,
      heroVisible: visible(document.querySelector(".hero-lab")),
      overviewVisible: visible(document.querySelector(".mobile-formula-overview")),
      visibleLayers: [...document.querySelectorAll(".layer-card")]
        .filter(visible)
        .map(element => element.getAttribute("data-layer")),
      navigationBottom: navigation ? Math.round(navigation.getBoundingClientRect().bottom) : null,
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      noteListClientHeight: noteList?.clientHeight ?? null,
      noteListScrollHeight: noteList?.scrollHeight ?? null
    };
  });

  const before = await readMobile();
  await page.locator(".mobile-layer-tabs button").nth(1).click();
  await page.waitForTimeout(200);
  const after = await readMobile();
  await page.screenshot({
    path: "C:/Users/user/.codex/visualizations/2026/08/10/019fe9a1-06e4-7122-985f-23f3158efa61/artisan-bench-pwa-formula.png",
    fullPage: false
  });

  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto("http://127.0.0.1:4173/artisan-bench", { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(700);
  const desktop = await desktopPage.evaluate(() => {
    const visible = (element) => Boolean(
      element
      && getComputedStyle(element).display !== "none"
      && element.getBoundingClientRect().height > 0
    );
    return {
      heroVisible: visible(document.querySelector(".hero-lab")),
      visibleLayers: [...document.querySelectorAll(".layer-card")].filter(visible).length,
      mobileOverviewVisible: visible(document.querySelector(".mobile-formula-overview")),
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth
    };
  });

  console.log(JSON.stringify({ before, after, desktop }, null, 2));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
