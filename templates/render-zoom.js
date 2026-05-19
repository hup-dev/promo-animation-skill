#!/usr/bin/env node
/**
 * Render promo.html in ZOOM mode (zoom on text → pan to Send → pan-and-zoom-out → reveal).
 * Output: frames-zoom/*.png  (then encode promo-zoom.mp4 separately).
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const DURATION = 19.5;
const TOTAL_FRAMES = Math.round(FPS * DURATION); // 585
const OUT_DIR = path.join(__dirname, 'frames-zoom');
const HTML_PATH = 'file://' + path.join(__dirname, 'promo.html');

(async () => {
  if (fs.existsSync(OUT_DIR)) {
    for (const f of fs.readdirSync(OUT_DIR)) {
      if (f.endsWith('.png')) fs.unlinkSync(path.join(OUT_DIR, f));
    }
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`Launching Chromium for ${TOTAL_FRAMES} frames @ ${FPS}fps (ZOOM MODE)...`);
  const browser = await chromium.launch({
    args: ['--font-render-hinting=none', '--disable-gpu-vsync'],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  /* enable render-mode AND zoom-mode BEFORE the page loads */
  await page.addInitScript(() => {
    window.__RENDER_MODE__ = true;
    window.__ZOOM_MODE__ = true;
  });

  await page.goto(HTML_PATH, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);

  const t0 = Date.now();
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = i / FPS;
    await page.evaluate((tt) => { window.__setTime(tt); }, t);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const file = path.join(OUT_DIR, `f_${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: file, type: 'png' });
    if (i % 30 === 0 || i === TOTAL_FRAMES - 1) {
      const elapsed = (Date.now() - t0) / 1000;
      const rate = (i + 1) / elapsed;
      const eta = (TOTAL_FRAMES - i - 1) / rate;
      process.stdout.write(`\rframe ${i+1}/${TOTAL_FRAMES} · ${rate.toFixed(1)} fps · eta ${eta.toFixed(0)}s   `);
    }
  }
  process.stdout.write('\n');

  await browser.close();
  console.log(`Done. Frames in ${OUT_DIR}`);
})();
