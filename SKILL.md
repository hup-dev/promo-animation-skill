---
name: promo-animation
description: Build a polished MP4 product animation (Linear/Vercel/Stripe quality) from the current codebase. Use when the user asks for a promo video, demo animation, product trailer, brand intro, stat reveal, logo animation, marketing clip, hero video, sizzle reel, walkthrough, or anything like "make me a video for our product." Extracts brand tokens + logo + fonts from the repo, picks the right animation pattern, then renders deterministically via Playwright + ffmpeg.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash, Agent
---

# Product Animation

You're producing a finished MP4 animation for the current codebase's product. The skill is a **deterministic animation engine + methodology**, not a fixed format — you decide the pattern that fits what the user asked for (a chat-style demo, a brand intro, a stat reveal, a workflow walkthrough, before/after, etc.).

What stays constant across every pattern:
- **Real brand assets** pulled from the repo (logo SVG, design tokens, fonts).
- **Linear/Vercel/Stripe-grade visual polish** (soft shadows, real typography, single hero moment).
- **Deterministic `__setTime(t)` timeline** so Playwright captures perfect frames every render.
- **Specific, named content** wherever the animation makes a claim — no generic "AI saves money" copy.

The full reference for what makes this work is `methodology.md` — **read it before doing anything else**. Concrete details on visual style, timing, camera math, ffmpeg flags, and the 10 pitfalls that bite first-try attempts.

## Output target

Default: **1920×1080 @ 30fps, H.264** with optional music + 1s tail fade. Length depends on the pattern:
- Brand intro / logo reveal: **5–8s**
- Stat reveal: **6–10s**
- Product promo (chat-style or otherwise): **15–22s**
- Workflow walkthrough: **20–40s**

Confirm length and aspect ratio with the user if they didn't specify. Default to 16:9 1920×1080 unless they said social/vertical.

When two cuts make sense (e.g. static camera + cinematic camera), ship both.

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
mkdir -p product-animation/frames
cd product-animation
```

## The 4-phase pipeline

Run phases 1–3 **in parallel** as subagents (independent work) before starting phase 4.

### Phase 1 — Brand & asset discovery (subagent)

Spawn the brand-extractor with the prompt in `agents/01-brand-extractor.md`. Pass it:
- The repo root path
- A few hints about what the product does

It returns a JSON of: real logo SVG path, exact hex tokens, font stack, hero UI conventions (border-radius, padding, primary button style), product name + tagline.

**Copy the real wordmark SVG into the workspace** (e.g. `<product>-wordmark.svg`). Inline brand assets, no rasters.

### Phase 2 — Concept + script (subagent)

Spawn the script-writer with the prompt in `agents/02-script-writer.md`. Pass it the brand summary from phase 1, what the product does, and what kind of animation the user asked for (promo, brand intro, stat reveal, etc.).

It returns:
- **Animation pattern** picked for this product (e.g. "chat-demo", "stat-reveal", "brand-intro")
- **Storyboard** with scene timings: cold open → main content → outro
- **The exact text/numbers/visuals** to feature in each scene

If the pattern is `chat-demo`, the template in `templates/chat-demo.html` is a complete working starting point — fill in the `CASES.BIGGEST` data structure with the script's content. For other patterns, build the HTML from scratch using the animation engine described in `methodology.md` § 2 — same `__setTime(t)` driver, same easing toolkit, same Playwright capture.

### Phase 3 — Content research (subagent)

Spawn the case-researcher with the prompt in `agents/03-case-researcher.md`. Pass it the product domain and the animation pattern.

What it returns depends on the pattern:
- **Chat demo / promo:** ONE canonical, named, dramatic before/after with real numbers (the "Converse Chuck Taylor moment" for the domain) + 3-4 secondary cases.
- **Stat reveal:** ONE big public metric the product can credibly own, with a citation.
- **Brand intro / logo reveal:** the company's actual headline, real customer count, real launch story — anything verifiable to put on screen.
- **Workflow walkthrough:** the most common real user journey, named steps from the product itself.

Specific, named, verifiable wherever the animation makes a claim.

### Phase 4 — Build & render

Combine the outputs into the chosen HTML template (or one you wrote from scratch), render frames with Playwright, encode with ffmpeg.

## Build phase

The build differs slightly per pattern. The shared shape:

1. **Copy or write the animation HTML.**
   - If the script-writer picked **chat-demo**, copy `templates/chat-demo.html` into the workspace and edit the `CASES.BIGGEST` data object with the phase-2 script content + phase-3 research. Also swap the brand `:root { --tokens }`, header text ("Atlas Trade", "Intelligence", badge), URL bar, wordmark `<img src>`, and logo-outro tagline + CTA.
   - For **other patterns** (brand intro, stat reveal, walkthrough, before/after), write the HTML from scratch using the animation engine — `methodology.md` § 2 shows the deterministic timeline pattern. Reuse the design rules from `reference/design-rules.md`, the camera math from `reference/camera-modes.md`, and the same Playwright render contract.

2. **Copy a render script.** For chat-demo use `templates/render-chat-demo.js` (525 frames, ~17.5s) or `render-chat-demo-zoom.js` (585 frames, ~19.5s, cinematic camera). For custom patterns, copy one of the render scripts and update the `DURATION` constant — the rest works as-is.

3. **Verify in browser first.** Open the HTML directly — the animation auto-plays in a loop. Eyeball every scene. 5 min in a browser saves 3 min of rendering per iteration.

4. **Smoke render** — 6–8 keyframes at scene boundaries before committing to the full render. See `scripts/smoke.js` for the pattern. Catches layout overlap, font fallback, off-screen elements in 30s.

## Render phase

Install Playwright in the workspace:
```bash
npm install playwright@1.58.0 --no-save --no-audit --no-fund --silent
```

Render the frames:
```bash
node render-<pattern>.js          # writes frames/f_*.png  (~3-5 frames per second of duration × FPS)
```

Encode with ffmpeg. Adjust `-t` to your animation's duration and `afade=t=out:st=X` to land the fade 1s before the end:
```bash
ffmpeg -y -framerate 30 -i frames/f_%05d.png \
  -i /path/to/music.mp3 \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -movflags +faststart \
  -c:a aac -b:a 192k -af "afade=t=out:st=<DURATION-1>:d=1.0" \
  -t <DURATION> -shortest animation.mp4
```

`yuv420p` is required for Slack/LinkedIn/Twitter playback. `+faststart` enables streaming. `crf 18` is near-visually-lossless.

If no audio is provided, drop `-i music.mp3`, `-c:a aac -b:a 192k`, and `-af` flags. `scripts/encode.sh` wraps this with sane defaults.

## Quality gate — read before declaring done

Universal (every pattern):
- [ ] Real brand wordmark inline (SVG `<img>`, not Inter Tight bold styled as a logo).
- [ ] All colors are from the product's tokens — never invented hex.
- [ ] Animation is referenced from the codebase — its UI, fonts, copy idioms recognizable.
- [ ] Single hero moment. One number, one reveal, one CTA — not 12 competing focal points.
- [ ] Any number that ticks uses `tabular-nums` (don't jitter horizontally).
- [ ] Animations land — no element appears at the exact same instant as another fades out; respect entry/exit windows.
- [ ] Logo holds long enough at the end (≥ 3s for branded outros).
- [ ] MP4 plays in QuickTime, exactly the target resolution × fps, file size reasonable (1–6 MB typical).
- [ ] Open the MP4 with `open <name>.mp4` for the user.

For **chat-demo** specifically, additional checks (see `reference/design-rules.md`):
- [ ] Hero $ number is JetBrains Mono / weight 800 / 6 digits or more.
- [ ] Tool chain has ~8 chips, pacing ~3s — anything shorter reads fake.
- [ ] User bubble appears AFTER the bar clears, never simultaneously.
- [ ] Thinking bubble slides up-and-out before the result fades in — never both opaque.
- [ ] Caret only appears during typing, never on the placeholder.

Clean up before declaring done:
```bash
rm -rf frames frames-zoom node_modules package.json package-lock.json smoke_*.png
```

Final workspace should contain: the HTML, render script(s), wordmark SVG, and the finished MP4(s).

## File map

```
~/.claude/skills/promo-animation/
├── SKILL.md                  ← you are here
├── methodology.md            ← deep reference, READ FIRST — the universal animation engine
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

When in doubt, read `templates/chat-demo.html` — it's a complete working example you can render right now (a fictional "Atlas Trade" / Converse Chuck Taylor reclassification scenario). It's the canonical reference for the chat-demo pattern AND the deterministic animation engine — every visual rule, timing decision, and pitfall in `methodology.md` is encoded in that file.

For other animation patterns, you write the HTML from scratch — but the animation engine (§ 2 of `methodology.md`), render contract (§ 5), and design rules (`reference/design-rules.md`) all carry over unchanged.
