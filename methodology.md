# Promo-Animation Methodology

Pipeline for a 17-20s polished SaaS promo MP4 from an existing codebase. Reference implementation: `templates/promo.html` in this skill (the canonical example uses a fictional "Atlas Trade" tariff/customs copilot to demonstrate the structure).

---

## 1. The 4-Phase Pipeline

### Phase 1 — Brand & asset discovery

Harvest before writing animation code:

1. **Tokens.** Read `apps/web/src/tokens.ts`. Lift literal hex into `:root { --token: #hex }`. Grab brand-primary/accent, text-primary/body/secondary/muted, bg-page/surface/hover, border-default/light, success/warning. Never invent colors.
2. **Logo SVG.** Copy the real one (`apps/web/src/assets/svgs/Logo.svg`) next to `promo.html` as `<product>-wordmark.svg`, referenced via `<img>`. Inline SVG stays crisp at zoom — never use a raster.
3. **UI shell.** Pick the single hero surface users recognize (search for `ChatInput`, `Composer`, `Hero`, `SearchBar`). Mirror border-radius, padding, font sizes, focus ring, primary button exactly.
4. **Design doc.** If `docs/DESIGN_TOKEN_GUIDE.md` or similar exists, read for spacing and font weights — unusual weights (e.g. Inter 425/475) matter.

### Phase 2 — Script (3-act, 17-20s)

- **Cold open (0-2s)** — bold problem statement, gradient-accent headline, drifting domain-jargon floaters (`HTS 9503`, `§301 +7.5%`).
- **Demo (2-13.5s static / 2-15.5s zoom)** — typed prompt → send → tool-chain pulses → result card with hero $ number.
- **Logo out (13.5-17.5s)** — wordmark, tagline, CTA pill.

Rules: one query, one answer, one hero number. No voiceover. Vocabulary must be **specific and named** (HTS codes, court names, $ amounts), never "AI helps you save money."

### Phase 3 — Domain case research

Find one canonical, named, dramatic before/after. The archetype is **Converse Chuck Taylor felt-sole reclass** — adding felt over rubber moves footwear from 20% duty (HTS 6404.19) to 7.5% (textile-soled basket). Requirements: real entity (company / case / ruling), concrete before/after with units, headline number big enough to be the hero (6-7 figures USD/year), 3-4 "other opportunities" chips to imply depth without diluting focus.

### Phase 4 — Build & render

Self-contained `promo.html` (Google Fonts `<link>`, inline style/script, sibling SVG). `render.js` (Playwright) screenshots deterministic frames. `ffmpeg` encodes PNGs + optional audio + tail fade.

---

## 2. HTML/JS Animation Pattern — Deterministic Timeline

The entire animation is a pure function of `t` (seconds). The renderer drives it via `window.__setTime(t)`.

```js
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const clamp = (v,a=0,b=1) => Math.max(a, Math.min(b, v));
const range = (t,a,b) => clamp((t-a)/(b-a));    // 0..1 ramp in window
const lerp  = (a,b,t) => a + (b-a)*t;
const fade  = (t, fadeIn, hold, fadeOut) => { /* in/hold/out 0..1 */ };
```

**Per-element pattern** — opacity/transform derived from `t`, no CSS transitions:

```js
const userP = easeOutCubic(range(localT, POST_SEND_T, POST_SEND_T + 0.3));
userbubble.style.opacity = userP;
userbubble.style.transform = `translateY(${(1-userP)*6}px)`;
```

**Staggered list** — per-index delay:

```js
chips.forEach((c, i) => {
  const start = caseData.cardStart + 2.2 + i * 0.14;
  const p = easeOutCubic(range(localT, start, start + 0.35));
  c.style.opacity = p;
  c.style.transform = `translateY(${(1-p)*4}px)`;
});
```

**Dual-loop driver** — rAF for browser preview, short-circuited under render mode so frames stay deterministic:

```js
window.__setTime = function(t) { window.__TIME__ = t; timeline(t); };
function loop(now) {
  if (window.__RENDER_MODE__) { requestAnimationFrame(loop); return; }
  /* else compute elapsed and call timeline(t) */
}
```

Scene management uses `fade(t, [in0,in1], [holdStart,holdEnd], [out0,out1])` on `.scene { opacity:0 }` containers.

---

## 3. Visual Design Rules (Linear/Vercel/Stripe, not amateurish)

- **Real brand SVG inline.** `<img src="<product>-wordmark.svg">` at 28px in header, 520px on logo-out.
- **Light surfaces** on `#F3F4F6` page bg with two faint radial gradients (`rgba(28,180,186,0.07)` and `rgba(11,73,75,0.06)`) plus a 64px grid masked by a radial vignette.
- **Browser chrome.** Three traffic-light dots + pill URL (`app.<product>.com / <product-area>`) sells "this is the real product."
- **One hero $ number.** JetBrains Mono 56px / weight 800 / color `--success` (`#059669`) / `font-variant-numeric: tabular-nums`. Tick from 0 with `fmtMoney(num * tickP)`.
- **GenUI buttons.** Primary: brand-primary fill, white text, `0 1px 2px rgba(brand,0.18)`. Secondary: white + `border-default`. 8px radius, 9×14 padding, 14px Inter 500.
- **Soft shadows only.** App window: `0 24px 80px rgba(17,24,39,0.10)`. Cards: `0 2px 8px rgba(17,24,39,0.04)`. Never harsh black.
- **Fonts.** JetBrains Mono for HTS codes/numbers, Inter Tight for headings (letter-spacing -0.018em to -0.04em), Inter 425/475 for body.
- **Chat flow.** User bubble top-right with `border-radius: 14px 14px 4px 14px`. Thinking bubble *slides up and out* (`translateY: -360px`) as result bubble fades in — never both visible.

---

## 4. Two Camera Modes

**Static (17.5s).** `appwin` is `scale(1)`, no moves. Use when whole UI matters.

**Zoom (19.5s).** Three-phase camera on `appwin` transform:
1. **Typing** — hold `scale(2.5)` on text center (`TEXT_CENTER_X = 492, TARGET_Y = 700`).
2. **Pan to Send** — `easeInOutCubic` lerp X to `SEND_BTN_X = 1320`, same zoom.
3. **Zoom-out** — lerp X/Y back to app center (`750, 440`) and scale to 1.0.

```js
const txCss = -(camX - APPW_CX) * camS;
const tyCss = -(camY - APPW_CY) * camS;
appwin.style.transform = `translate(${txCss}px, ${tyCss}px) scale(${camS})`;
```

Pick **zoom** when one moment (typing+send) benefits from intimacy. Pick **static** when the demo has multiple visual beats.

**Don't:** scale > 2.8 (clips vertically at 1920×1080); pans faster than 1.0s (nauseating); horizontal cursor tracking (eyes can't follow at 30fps without motion blur).

---

## 5. Playwright + ffmpeg Render Contract

The contract:
1. `addInitScript` sets `window.__RENDER_MODE__ = true` (and `__ZOOM_MODE__` if used) **before** `goto`, so rAF short-circuits on first paint.
2. After `goto`, await `document.fonts.ready` + 250ms (radial gradients need an extra composite).
3. Per frame: `__setTime(t)` → **2× nested rAF** → screenshot.

```js
await page.addInitScript(() => { window.__RENDER_MODE__ = true; });
await page.goto(HTML_PATH, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(250);
for (let i = 0; i < TOTAL_FRAMES; i++) {
  await page.evaluate((tt) => { window.__setTime(tt); }, i / FPS);
  await page.evaluate(() => new Promise(r =>
    requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: `frames/f_${String(i).padStart(5,'0')}.png` });
}
```

Browser args: `--font-render-hinting=none --disable-gpu-vsync --enable-font-antialiasing`. Viewport `1920×1080`, `deviceScaleFactor: 1`.

**ffmpeg encode** (shareable MP4 + tail fade + audio):

```bash
ffmpeg -y -framerate 30 -i frames/f_%05d.png \
  -i audio.mp3 -shortest \
  -vf "fade=t=out:st=16.5:d=1.0" \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow \
  -movflags +faststart -c:a aac -b:a 192k promo.mp4
```

`yuv420p` is required for Slack/LinkedIn/Twitter. `+faststart` enables streaming. `crf 18` is near-visually-lossless.

---

## 6. Pitfalls

- **Overlapping chat bubbles.** Animate thinking exit (`translateY(-360px)` + opacity 0) **before** result fades in. Two `aibubble`s share `top: 96px` — only one opaque at a time.
- **Caret on placeholder.** Show only when focused AND typing. Guard `localT > 0.25 && localT < T_TYPE_END + 0.1`.
- **Vertical clipping at zoom.** At `scale: 2.5`, anchor `TARGET_Y = 700` (below center) so composer stays in frame.
- **Character widths.** Don't lerp pixel widths — slice the string by `Math.floor(progress * full.length)`.
- **Cursor tracking.** Either pan camera or pulse button — never both moving.
- **Tool-chain too fast.** 8 tools × 0.30s gap × 0.5-0.7s `runFor` ≈ 3s of believable thinking. Faster reads fake.
- **Logo too small.** 520px on a 1920px stage.
- **Numbers without `tabular-nums`.** Ticking counter jitters horizontally.
- **`__RENDER_MODE__` set late.** Must be in `addInitScript`, not after `goto`.
- **Skipping `document.fonts.ready`.** First frames render Times New Roman fallback.

---

**Reference files (relative to this skill):**
- `templates/promo.html` — the canonical animation source
- `templates/render.js` — static-mode Playwright renderer
- `templates/render-zoom.js` — zoom-mode renderer
- `agents/01-brand-extractor.md` — Phase 1 subagent prompt
- `agents/02-script-writer.md` — Phase 2 subagent prompt
- `agents/03-case-researcher.md` — Phase 3 subagent prompt
- `reference/design-rules.md` — visual rules condensed
- `reference/camera-modes.md` — static vs zoom decision + math
- `reference/timing-blueprint.md` — scene-by-scene timings

**In the target codebase, look for:**
- Design tokens: `apps/web/src/tokens.ts`, `theme.ts`, `tailwind.config.js`, or `:root {}` CSS variables
- Brand SVGs: `apps/web/public/`, `apps/web/src/assets/svgs/`, `static/`, or `public/`
- Hero chat/input component: search for `ChatInput`, `Composer`, `Hero`, `SearchBar`
- Design doc: `docs/DESIGN_TOKEN_GUIDE.md`, `docs/STYLE.md`, or similar
