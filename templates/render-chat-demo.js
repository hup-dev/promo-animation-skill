#!/usr/bin/env node
/**
 * Render chat-demo.html to a sequence of PNG frames using Playwright.
 * Frames are deterministic: we set window.__TIME__ per frame and screenshot.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const DURATION = 17.5;
const TOTAL_FRAMES = Math.round(FPS * DURATION); // 525
const OUT_DIR = path.join(__dirname, 'frames');
const HTML_PATH = 'file://' + path.join(__dirname, 'chat-demo.html');

(async () => {
  // clean frame dir
  if (fs.existsSync(OUT_DIR)) {
    for (const f of fs.readdirSync(OUT_DIR)) {
      if (f.endsWith('.png') || f.endsWith('.jpg')) fs.unlinkSync(path.join(OUT_DIR, f));
    }
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`Launching Chromium for ${TOTAL_FRAMES} frames @ ${FPS}fps...`);
  const browser = await chromium.launch({
    args: ['--font-render-hinting=none', '--disable-gpu-vsync', '--enable-font-antialiasing'],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // enable render mode BEFORE the page loads so the rAF loop won't tick
  await page.addInitScript(() => { window.__RENDER_MODE__ = true; });

  await page.goto(HTML_PATH, { waitUntil: 'networkidle' });

  // wait for fonts
  await page.evaluate(() => document.fonts.ready);
  // small extra wait so the radial gradients/backdrop are fully composited
  await page.waitForTimeout(250);

  const t0 = Date.now();
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = i / FPS;
    await page.evaluate((tt) => { window.__setTime(tt); }, t);
    // a single rAF tick to let layout/paint settle on the new state
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const file = path.join(OUT_DIR, `f_${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: file, omitBackground: false, type: 'png' });
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
