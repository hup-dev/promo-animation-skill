# promo-animation — a Claude Code skill for polished product animations

Build a polished, **Linear/Vercel/Stripe-quality** animation MP4 for any product in your codebase. Pulls the real logo SVG, design tokens, and fonts out of the repo so the result actually looks like *your* product — not a generic AI mockup.

## What you can build

Anything you can describe as a **5–30 second animated sequence**:

- **Product promo** — typed query → AI response with a hero $ number (the canonical chat-demo example)
- **Brand intro** — animated logo reveal + headline + CTA
- **Feature showcase** — a few hero moments stitched with smooth transitions
- **Stat reveal** — a single dramatic number ticking up against your brand
- **Workflow walkthrough** — step-by-step UI states moving forward
- **Before/after** — comparison animation with a transition
- **Title card / hero loop** — animated header for a landing page
- **Anything else** — the skill is a deterministic animation engine, not a fixed format

By default it produces **1920×1080 @ 30fps H.264 MP4**, with optional music + tail fade. Aspect ratio, resolution, framerate, and duration are all parameters.

## Install

```bash
git clone https://github.com/<you>/promo-animation-skill ~/.claude/skills/promo-animation
```

That's it — the skill auto-registers in any project once it lives under `~/.claude/skills/`.

## Use

In Claude Code, from inside any product repo:

```
/promo-animation
```

…or just describe what you want — Claude will invoke the skill automatically. The description matches phrases like "promo video", "demo animation", "product trailer", "brand intro", "stat animation", "logo reveal", "marketing clip", "hero video".

## Requirements

| Tool | Why |
|---|---|
| **Node 18+** | runs the Playwright renderer |
| **Playwright + Chromium** | `npx playwright install chromium` once |
| **ffmpeg** | encodes PNG frames → MP4, mixes audio |

## How it works

The skill is a **toolkit + methodology**, not a fixed template:

1. **Brand extractor** subagent reads `tokens.ts` / `theme.ts` / `tailwind.config.js`, finds the real logo SVG, fonts, and any hero UI components. Returns a JSON of every literal hex / weight / radius your product actually uses.

2. **Concept + script** subagent picks the right animation pattern for the product and writes the storyboard — what to show, when, what numbers to feature, what to say at the end.

3. **Content research** subagent finds the actual content to feature: a real case study, a published metric, a customer story, a famous before/after — whatever demonstrates the product's value with named, verifiable specifics. Not "AI helps you save money" — actual entities, court cases, dollar amounts.

4. **Build & render** — fills the chosen template with the three JSON outputs, copies the real wordmark SVG out of the repo, smoke-tests 8 keyframes (catches layout bugs fast), then renders ~500 frames via Playwright and encodes with ffmpeg.

## What separates this from "AI made a video"

- **Real brand assets inline.** The skill pulls the actual logo SVG out of the repo and uses it as an `<img>` — no Inter Tight 700 styled to look like a wordmark.
- **Real colors and fonts.** Every hex, every font weight, every radius — measured from the real design tokens. Never invented.
- **Deterministic frame-by-frame capture.** Playwright `__setTime(t)` driver means perfect timing, no jitter, no skipped frames, identical output every render.
- **Single hero moment per animation.** One stat, one reveal, one CTA — not 12 things competing for attention.
- **Specific, named content.** When the animation references something (a case study, a metric, a customer), it cites a real source with real numbers.

## File layout

```
promo-animation-skill/
├── SKILL.md                       ← entry point: orchestrator + quality gate
├── methodology.md                 ← deep reference, read first
├── agents/
│   ├── 01-brand-extractor.md
│   ├── 02-script-writer.md
│   └── 03-case-researcher.md
├── templates/
│   ├── chat-demo.html             ← canonical "AI typed query → result" pattern
│   ├── render-chat-demo.js        ← Playwright renderer (static camera)
│   ├── render-chat-demo-zoom.js   ← Playwright renderer (zoom camera)
│   └── atlas-wordmark.svg         ← placeholder SVG — swap for your product's
├── scripts/
│   ├── smoke.js                   ← 8-keyframe smoke test
│   └── encode.sh                  ← ffmpeg wrapper
└── reference/
    ├── design-rules.md            ← visual rules (Linear/Vercel/Stripe checklist)
    ├── camera-modes.md            ← static vs zoom decision + math
    └── timing-blueprint.md        ← scene-by-scene timings
```

## The animation engine (universal pattern)

Every animation this skill produces uses the same deterministic timeline:

```js
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const range = (t,a,b) => Math.max(0, Math.min(1, (t-a)/(b-a)));
const lerp  = (a,b,t) => a + (b-a)*t;

window.__setTime = function(t) { window.__TIME__ = t; timeline(t); };

function timeline(t) {
  // Every visual element's opacity/transform is a pure function of t.
  // No CSS transitions, no setInterval — Playwright drives __setTime
  // frame-by-frame so the output is identical every render.
}
```

Playwright takes screenshots; ffmpeg stitches them into MP4. Same pipeline for a 5-second logo reveal as for a 30-second product demo.

Read [`methodology.md`](methodology.md) for the full pattern, including the easing toolkit, scene fade windows, camera math, and the 10 pitfalls that bite first-try attempts.

## Quick try (render the canonical example)

```bash
cd templates
npm install playwright@1.58.0 --no-save
node render-chat-demo.js                       # ~95s, writes frames/
ffmpeg -y -framerate 30 -i frames/f_%05d.png \
  -c:v libx264 -pix_fmt yuv420p -crf 18 \
  -movflags +faststart -t 17.5 demo.mp4
open demo.mp4
```

This produces the "Atlas Trade" chat demo — a complete working animation using the placeholder brand. Use it as the visual reference for what "done" looks like.

## License

MIT — see [`LICENSE`](LICENSE).

## Credits

Built on top of:
- [Playwright](https://playwright.dev/) for deterministic browser screenshotting
- [ffmpeg](https://ffmpeg.org/) for video encoding
- [Inter](https://rsms.me/inter/), [Inter Tight](https://fonts.google.com/specimen/Inter+Tight), [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — all SIL Open Font License

The methodology was distilled from a real end-to-end production session — every visual rule, timing, and pitfall in this skill corresponds to an iteration that taught the lesson.
