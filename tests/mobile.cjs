const { webkit } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { resolve } = require('node:path');
(async () => {
  const browser = await webkit.launch();
  try {
    for (const width of [320, 390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: true, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(pathToFileURL(resolve(__dirname, '../index.html')).href);
      for (const language of ['pt-BR', 'en', 'es']) {
        for (const theme of ['dark', 'light']) {
          await page.evaluate(settings => window.PortfolioSettings.set(settings), {language, theme});
          assert.equal(await page.locator('svg.icon').count(), 9);
          assert.doesNotMatch(await page.locator('body').innerText(), /[\u2190-\u21ff\u2700-\u27bf]/);
          assert.equal(await page.locator('.brand-word').evaluate(el => getComputedStyle(el).backgroundImage), 'none');
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width} ${language} ${theme} overflow`);
        }
      }
      if (width <= 700) {
        await page.locator('.menu-toggle').tap();
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
      }
      if (process.env.PORTFOLIO_SCREENSHOTS) await page.screenshot({path: resolve(process.env.PORTFOLIO_SCREENSHOTS, `webkit-${width}.png`)});
      await context.close();
      console.log(`PASS WebKit ${width}: SVG, 3 languages, 2 themes, reduced motion, touch, overflow`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
