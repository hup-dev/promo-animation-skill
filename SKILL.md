---
name: promo-animation
description: Build a polished 17–20s MP4 product promo (Linear/Vercel/Stripe quality) from the current codebase. Use when the user asks for a promo video, demo animation, product trailer, marketing clip, hero video, sizzle reel, or anything like "make me a video for our product." Extracts brand tokens + logo + chat UI from the repo, writes a 3-act script, researches a named domain case, then renders via Playwright + ffmpeg.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash, Agent
---

# Promo Animation

You're producing a finished MP4 promo video for the current codebase's product. Treat it like a real ad: every detail visible on screen should be pulled from the actual product (real brand colors, real logo SVG, real chat-UI patterns, real domain vocabulary). Generic "AI helps you save money" copy is a failure mode — be **specific and named** (real court cases, HTS codes, dollar amounts, product names).

The full reference for what makes this work is `methodology.md` — **read it before you do anything else**. Concrete details on visual style, timing, camera math, ffmpeg flags, and the 10 pitfalls that bite first-try attempts.

## Output target

By default produce **two** MP4 files:
- `promo-static.mp4` — static camera, ~17.5s, the safe default
- `promo-zoom.mp4` — zoom on text → pan to Send → zoom out, ~19.5s

Both at 1920×1080 @ 30fps, H.264, with optional audio overlay + 1s tail fade ending on the logo.

## Preflight check

Before doing anything, confirm the environment can do this:

```bash
which ffmpeg && ffmpeg -version | head -1
which node && node --version
ls ~/Library/Caches/ms-playwright/ 2>/dev/null | head -3   # macOS playwright cache
```

If Playwright chromium isn't cached, run `npx playwright install chromium`. ffmpeg is required.

Create the workspace:
```bash
mkdir -p promo-animation/{frames,frames-zoom}
cd promo-animation
```

## The 4-phase pipeline

Run phases 1–3 **in parallel** as subagents (independent work) before starting phase 4.

### Phase 1 — Brand & asset discovery (subagent)

Spawn the brand-extractor with the prompt in `agents/01-brand-extractor.md`. Pass it:
- The repo root path
- A few hints about what the product does

It returns a JSON-ish summary of: real logo SVG path, exact hex tokens, font stack, hero chat-UI conventions (border-radius, padding, placeholder copy, primary button style), and the product's tagline / product name.

**Copy the real wordmark SVG into the workspace** (`promo-animation/<product>-wordmark.svg`). Inline brand assets, no rasters.

### Phase 2 — Script writing (subagent)

Spawn the script-writer with the prompt in `agents/02-script-writer.md`. Pass it the brand summary from phase 1 plus what the product does. It returns a structured script:
- Cold open headline (top line + accent-color bottom line) + subtitle + 18-20 jargon "floaters"
- Hero query (what the user types — short, naive, specific)
- Thinking-bubble intro line + 8 tool names with `runFor` durations
- Hero result card: HTS code or equivalent, title, before/after, $/year, complexity caveat, 2 action button labels
- 3 "other opportunities" chips with names + $ amounts
- Logo tagline + CTA pill text

The data shape exactly matches `CASES.BIGGEST` in `templates/promo.html` — that template already contains a complete working example (a fictional "Atlas Trade" / Converse Chuck Taylor reclassification scenario) you can read for reference, then swap out for the real product.

### Phase 3 — Domain case research (subagent)

Spawn the case-researcher with the prompt in `agents/03-case-researcher.md`. Pass it the product domain. It returns ONE canonical, named, dramatic before/after with real numbers:
- Real entity (company / case / ruling / patent)
- Concrete before/after with units
- A headline number big enough to be the hero (5-7 figures)
- 3-4 "also found" lower-impact cases for the secondary chips

For trade/customs: famous tariff-engineering wins (Converse Chuck Taylor felt-sole, Marvel X-Men non-human toys, Ford Transit cargo van, Snuggie blanket). For other domains, find the equivalent — pricing case studies, well-known design patents, etc.

### Phase 4 — Build & render

Combine the outputs into the promo.html template, render, encode.

## Build phase

1. **Copy templates** into the workspace:
   ```bash
   cp ~/.claude/skills/promo-animation/templates/promo.html .
   cp ~/.claude/skills/promo-animation/templates/render.js .
   cp ~/.claude/skills/promo-animation/templates/render-zoom.js .
   ```

2. **Substitute placeholders** in `promo.html`. The template uses these markers (search-and-replace via Edit tool):

   | Marker | Source | Example |
   |---|---|---|
   | `{{PRODUCT_NAME}}` | phase 1 | `Atlas Trade` |
   | `{{PRODUCT_SUBTITLE}}` | phase 1 | `Intelligence` |
   | `{{PRODUCT_BADGE}}` | phase 1 | `Trade copilot` |
   | `{{PRODUCT_DOMAIN}}` | phase 1 | `app.atlas.trade` |
   | `{{WORDMARK_SRC}}` | phase 1 | `atlas-wordmark.svg` |
   | `{{BRAND_PRIMARY}}` | phase 1 tokens | `#0B494B` |
   | `{{BRAND_ACCENT}}` | phase 1 tokens | `#1CB4BA` |
   | `{{COLD_HEADLINE_TOP}}` | phase 2 | `Stop overpaying.` |
   | `{{COLD_HEADLINE_ACCENT}}` | phase 2 | `Start asking.` |
   | `{{COLD_SUBTITLE}}` | phase 2 | `U.S. importers leave billions...` |
   | `{{FLOATERS_JSON}}` | phase 2 | `['HTS 9503','§301 +7.5%',...]` |
   | `{{CASE_OBJECT}}` | phases 2+3 | full `BIGGEST: {...}` block |
   | `{{LOGO_TAGLINE}}` | phase 2 | `Trade strategy, at the speed of a prompt.` |
   | `{{LOGO_CTA}}` | phase 2 | `atlas.trade →` |

3. **Verify locally first** — open `promo.html` in a browser. The animation auto-plays in a loop. Eyeball the cold open, the typed query, the hero card, the logo out. If anything looks wrong, fix it before rendering frames (5 min in browser saves 3 min of rendering per iteration).

4. **Smoke render** — 6–8 keyframes at scene boundaries before doing the full 525-frame render. See `scripts/smoke.js` for the pattern. Spend 30s here; catches layout overlap, font fallback, off-screen elements before you commit.

## Render phase

Install Playwright in the workspace:
```bash
npm install playwright@1.58.0 --no-save --no-audit --no-fund --silent
```

Render both versions:
```bash
node render.js          # writes frames/f_*.png  (525 frames, ~95s)
node render-zoom.js     # writes frames-zoom/f_*.png  (585 frames, ~110s)
```

Encode with ffmpeg:
```bash
# Static — adjust audio path and fade timing to your duration
ffmpeg -y -framerate 30 -i frames/f_%05d.png \
  -i /path/to/music.mp3 \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -movflags +faststart \
  -c:a aac -b:a 192k -af "afade=t=out:st=16.5:d=1.0" \
  -t 17.5 -shortest promo-static.mp4

# Zoom — same shape, longer duration
ffmpeg -y -framerate 30 -i frames-zoom/f_%05d.png \
  -i /path/to/music.mp3 \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -movflags +faststart \
  -c:a aac -b:a 192k -af "afade=t=out:st=18.5:d=1.0" \
  -t 19.5 -shortest promo-zoom.mp4
```

`yuv420p` is required for Slack/LinkedIn/Twitter playback. `+faststart` enables streaming. `crf 18` is near-visually-lossless.

If no audio is provided, drop `-i music.mp3`, `-c:a aac -b:a 192k`, and `-af` flags.

## Quality gate — read before declaring done

Verify before showing the user:

- [ ] Real brand wordmark is in the header and logo-out (not Inter Tight bold text styled as a logo).
- [ ] All colors are from `tokens.ts` (or the design doc) — never invented hex.
- [ ] Hero `$` number is JetBrains Mono, weight 800, `tabular-nums`, color `--success` token, **6 digits or more**.
- [ ] Tool chain has 8 chips, pacing ~3s total — fake-feeling if shorter.
- [ ] User bubble appears AFTER the bar clears, never simultaneously.
- [ ] Thinking bubble slides *up and out of frame* before the result bubble fades in — never both opaque.
- [ ] Caret only appears during typing (and full-text hold), never on the placeholder `Ask anything…`.
- [ ] Logo holds for 4s at the end.
- [ ] MP4 plays in QuickTime, file size 1–4 MB, exactly 1920×1080 @ 30fps.
- [ ] Open both MP4s with `open promo-static.mp4` and `open promo-zoom.mp4` for the user.

Clean up before declaring done:
```bash
rm -rf frames frames-zoom node_modules package.json package-lock.json
```

Final workspace should contain: `promo.html`, `render.js`, `render-zoom.js`, `<product>-wordmark.svg`, `promo-static.mp4`, `promo-zoom.mp4`.

## File map

```
~/.claude/skills/promo-animation/
├── SKILL.md                  ← you are here
├── methodology.md            ← deep reference, READ FIRST
├── agents/
│   ├── 01-brand-extractor.md   ← phase 1 subagent prompt
│   ├── 02-script-writer.md     ← phase 2 subagent prompt
│   └── 03-case-researcher.md   ← phase 3 subagent prompt
├── templates/
│   ├── promo.html              ← master HTML with {{markers}}
│   ├── render.js               ← static render (Playwright)
│   └── render-zoom.js          ← zoom render
├── scripts/
│   ├── smoke.js                ← keyframe smoke test
│   └── encode.sh               ← ffmpeg wrapper
└── reference/
    ├── design-rules.md         ← visual rules condensed
    ├── camera-modes.md         ← static vs zoom decision
    └── timing-blueprint.md     ← scene timings
```

When in doubt, read `templates/promo.html` — it's a complete working example you can render right now (a fictional "Atlas Trade" / Converse Chuck Taylor reclassification scenario). Every visual rule, timing, and pitfall in `methodology.md` is encoded in that file.
