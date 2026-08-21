const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 512, height: 908 } });
  await page.goto('http://127.0.0.1:4173/artisan-bench', { waitUntil: 'networkidle' });

  const cases = [
    ['Formula', '.mobile-view-formula .formula-builder.panel'],
    ['Insights', '.mobile-view-insights .analysis.panel'],
    ['Notes', '.mobile-view-notes .perfumer-notes.panel'],
    ['Review', '.mobile-view-review .story-card-section.panel'],
  ];
  const results = [];

  for (const [tab, selector] of cases) {
    await page.getByRole('button', { name: tab, exact: true }).click();
    await page.waitForTimeout(250);
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible' });
    const styles = await element.evaluate((node) => {
      const css = getComputedStyle(node);
      return {
        backgroundColor: css.backgroundColor,
        backgroundImage: css.backgroundImage,
        borderTopWidth: css.borderTopWidth,
        boxShadow: css.boxShadow,
        overflowY: css.overflowY,
      };
    });
    results.push({ tab, ...styles });
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
