#!/usr/bin/env node
/**
 * Smoke-test the animation by rendering ~8 keyframes at scene boundaries.
 * Catches layout overlap, font fallback, off-screen elements before committing
 * to a 500+ frame render.
 *
 * Usage:
 *   node smoke.js              # static mode
 *   node smoke.js --zoom       # zoom mode
 */
const { chromium } = require('playwright');
const path = require('path');

const ZOOM = process.argv.includes('--zoom');
const HTML_PATH = 'file://' + path.join(__dirname, 'promo.html');

// keyframes covering: cold open, typing, full text, send pulse, tools mid, result, hero ticking, logo
const SAMPLES_STATIC = [1.0, 3.0, 4.0, 5.5, 7.5, 10.0, 13.0, 16.5];
const SAMPLES_ZOOM   = [1.0, 3.5, 4.5, 6.0, 7.5, 10.0, 14.0, 18.5];
const SAMPLES = ZOOM ? SAMPLES_ZOOM : SAMPLES_STATIC;

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript((zoom) => {
    window.__RENDER_MODE__ = true;
    if (zoom) window.__ZOOM_MODE__ = true;
  }, ZOOM);
  await page.goto(HTML_PATH, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);

  for (const t of SAMPLES) {
    await page.evaluate((tt) => window.__setTime(tt), t);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const f = path.join(__dirname, `smoke_${ZOOM?'z':'s'}_t${t.toFixed(1)}.png`);
    await page.screenshot({ path: f });
    console.log('wrote', f);
  }
  await browser.close();
})();
