const { chromium } = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.59.1/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 517, height: 908 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('http://127.0.0.1:4173/artisan-bench', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Materials' }).click();
  await page.locator('.mobile-workbench-name-display').click();
  const nameInput = page.locator('.mobile-workbench-name-input');
  await nameInput.fill('Bulgarian Mobile Dawn');
  await nameInput.press('Enter');
  const nameDisplayVisible = await page.locator('.mobile-workbench-name-display').isVisible();
  const categoryNav = page.locator('.mobile-material-categories');
  const categoryScroll = await categoryNav.evaluate((node) => {
    node.scrollLeft = 120;
    return {
      clientWidth: node.clientWidth,
      scrollWidth: node.scrollWidth,
      scrollLeft: node.scrollLeft
    };
  });
  await page.getByRole('button', { name: 'Citrus', exact: true }).click();
  const cards = page.locator('.mobile-material-card');
  await cards.first().waitFor();
  const firstCardName = await cards.first().locator('.mobile-material-card__copy strong').textContent();
  await cards.first().locator('.mobile-material-card__info').click();
  await page.waitForTimeout(150);
  const expandedLayout = await page.locator('.mobile-material-results').evaluate((list) => {
    const cards = [...list.querySelectorAll('.mobile-material-card')];
    const first = cards[0]?.getBoundingClientRect();
    const second = cards[1]?.getBoundingClientRect();
    return {
      firstHeight: first?.height || 0,
      spacingToSecond: first && second ? second.top - first.bottom : 0,
      descriptionHeight: cards[0]?.querySelector('.mobile-material-card__description')?.getBoundingClientRect().height || 0
    };
  });
  const addTop = cards.first().getByRole('button', { name: '+ Top' });
  await addTop.click();
  await page.waitForTimeout(200);
  const legacyName = await page.locator('#perfumeNameInput').inputValue();
  const usedVisible = await cards.first().locator('.mobile-material-card__used').isVisible();
  const results = page.locator('.mobile-material-results');
  await results.evaluate((node) => { node.scrollTop = 280; });
  const scrollBeforeToggle = await results.evaluate((node) => node.scrollTop);
  await cards.nth(4).locator('.mobile-material-card__info').click();
  await page.waitForTimeout(100);
  const scrollAfterToggle = await results.evaluate((node) => node.scrollTop);
  const overflow = await page.evaluate(() => ({
    viewport: window.innerHeight,
    body: document.documentElement.scrollHeight,
    materialPanelBottom: Math.round(document.querySelector('.mobile-view-materials > .material-library')?.getBoundingClientRect().bottom || 0),
    bottomNavTop: Math.round(document.querySelector('.mobile-workbench-nav')?.getBoundingClientRect().top || 0),
    materialListScrollable: (() => {
      const node = document.querySelector('.mobile-material-results');
      return node ? node.scrollHeight >= node.clientHeight : false;
    })(),
    overlay: Boolean(document.querySelector('.vite-error-overlay, #webpack-dev-server-client-overlay'))
  }));
  await page.screenshot({
    path: 'C:/Users/user/.codex/visualizations/2026/08/10/019fe9a1-06e4-7122-985f-23f3158efa61/artisan-bench-mobile-materials.png',
    fullPage: false
  });
  console.log(JSON.stringify({ legacyName, nameDisplayVisible, categoryScroll, firstCardName, cardCount: await cards.count(), expandedLayout, usedVisible, scrollBeforeToggle, scrollAfterToggle, errors, overflow }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
