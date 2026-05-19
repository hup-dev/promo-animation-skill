# promo-animation — a Claude Code skill for 17–20s SaaS product promos

Build a polished MP4 product promo — **Linear/Vercel/Stripe quality** — for any SaaS in your codebase. Drops 3 subagents on the repo to extract the real brand tokens, write a 3-act script, and research a named domain case; then renders deterministic Playwright frames + ffmpeg to MP4.

```
[ chat-bar typing ]  →  [ AI thinking with tool chain ]  →  [ hero $ number ]  →  [ logo ]
```

## What you get

Two cuts by default, both 1920×1080 @ 30fps, H.264:

- **`promo-static.mp4`** — static camera, ~17.5s
- **`promo-zoom.mp4`** — zoom on text → pan to Send → zoom out, ~19.5s

Optional music overlay with a 1s tail fade landing on the logo.

## Install

```bash
git clone https://github.com/<you>/promo-animation-skill ~/.claude/skills/promo-animation
```

That's it. The skill auto-registers in any project once it's under `~/.claude/skills/`.

## Use

In Claude Code, from inside any product repo:

```
/promo-animation
```

…or just describe what you want (`make a promo video for this product`) and Claude will invoke the skill automatically — the description matches phrases like "promo video", "demo animation", "product trailer", "marketing clip", "hero video", "sizzle reel".

## Requirements

| Tool | Why |
|---|---|
| **Node 18+** | runs the Playwright renderer |
| **Playwright + Chromium** | `npx playwright install chromium` once |
| **ffmpeg** | encodes PNG frames → MP4, mixes audio |
| **A browser** | optional, but useful for live-previewing the HTML before rendering |

## How it works (4-phase pipeline)

1. **Brand extractor** (`agents/01-brand-extractor.md`) — reads `tokens.ts` / `theme.ts` / `tailwind.config.js`, finds the real logo SVG, identifies the hero chat-UI component. Returns a JSON blob of every literal hex / font / radius / padding the target product actually uses.

2. **Script writer** (`agents/02-script-writer.md`) — drafts the 3-act storyboard: bold cold-open headline, naive customer query, AI thinking with 8 tool chips, GenUI result card with a single hero $ number, logo + CTA.

3. **Case researcher** (`agents/03-case-researcher.md`) — finds the domain's "Converse Chuck Taylor moment." One real, named, dramatic before/after with a 6-7 figure savings number.

4. **Build & render** — fills `templates/promo.html` with the three JSON outputs, copies the real wordmark SVG out of the repo, smoke-tests 8 keyframes (catches layout bugs fast), then renders ~500 frames via Playwright and encodes with ffmpeg.

The full reference for every visual rule, timing, camera math, and pitfall is in [`methodology.md`](methodology.md).

## What separates this from "AI made a video"

- **Real brand assets, inline.** Pulls the actual logo SVG out of the repo and uses it as an `<img>` — no Inter Tight 700 styled to look like a wordmark.
- **Real colors.** All hex pulled from the design tokens. No invented palette.
- **Single hero number.** 6-7 figures, JetBrains Mono weight 800, `tabular-nums` so it doesn't jitter as it ticks.
- **Specific, named case study.** Not "save money with AI" — actual court cases, ruling numbers, product modifications, real companies.
- **Chat UI mirrors the real product.** Border-radius, padding, focus ring, primary button — all measured from the target's actual `ChatInput`/`Composer` component.
- **Deterministic timeline.** Frame-by-frame Playwright capture, not video screen recording. No jitter, no skipped frames, perfect at any duration.

## File layout

```
promo-animation-skill/
├── SKILL.md                    ← entry point: orchestrator + quality gate
├── methodology.md              ← deep reference, read first
├── agents/
│   ├── 01-brand-extractor.md
│   ├── 02-script-writer.md
│   └── 03-case-researcher.md
├── templates/
│   ├── promo.html              ← complete working example (Atlas Trade demo)
│   ├── render.js               ← Playwright frame capture (static)
│   ├── render-zoom.js          ← Playwright frame capture (zoom)
│   └── atlas-wordmark.svg      ← placeholder SVG — swap for your product's
├── scripts/
│   ├── smoke.js                ← 8-keyframe smoke test
│   └── encode.sh               ← ffmpeg wrapper
└── reference/
    ├── design-rules.md         ← visual rules (Linear/Vercel/Stripe checklist)
    ├── camera-modes.md         ← static vs zoom decision + camera math
    └── timing-blueprint.md     ← scene-by-scene timings
```

## Quick try (without invoking the skill)

To see what the template produces:

```bash
cd templates
npm install playwright@1.58.0 --no-save
node render.js                                  # ~95s, writes frames/
ffmpeg -y -framerate 30 -i frames/f_%05d.png \
  -c:v libx264 -pix_fmt yuv420p -crf 18 \
  -movflags +faststart -t 17.5 demo.mp4
open demo.mp4
```

This renders the canonical Atlas Trade example. Use this as the visual reference for what "done" looks like.

## Customizing the look

Most of the look is data-driven from the case object in `templates/promo.html` (search for `const CASES = {`). Swap the brand tokens in `:root { --... }`, replace the wordmark SVG, fill in the case data with what the script-writer subagent returned, and you're done.

For deeper customization — different scene structure, additional camera moves, multi-scene demos — read [`methodology.md`](methodology.md) § 2 (the deterministic timeline pattern) and § 4 (camera math).

## License

MIT — see [`LICENSE`](LICENSE).

## Credits

Built on top of:
- [Playwright](https://playwright.dev/) for deterministic browser screenshotting
- [ffmpeg](https://ffmpeg.org/) for video encoding
- [Inter](https://rsms.me/inter/), [Inter Tight](https://fonts.google.com/specimen/Inter+Tight), [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — all SIL Open Font License
- Music in finished promos sourced from [Pixabay](https://pixabay.com/music/) (royalty-free, CC0)

The methodology was distilled from an end-to-end production session — every visual rule, timing, and pitfall in this skill corresponds to a real iteration that taught the lesson.
