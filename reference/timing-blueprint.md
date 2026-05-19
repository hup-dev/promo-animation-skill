# Timing Blueprint

Every promo follows this 3-act structure. Numbers are seconds, all relative to scene start.

## Scene budget (per camera mode)

| Scene | Static | Zoom |
|---|---|---|
| Cold open | 0.0 – 2.0 | 0.0 – 2.0 |
| Demo (BIGGEST) | 2.0 – 13.5 (11.5s) | 2.0 – 15.5 (13.5s) |
| Logo | 13.5 – 17.5 (4s) | 15.5 – 19.5 (4s) |
| **Total** | **17.5s** | **19.5s** |

## Cold open beat-sheet (both modes)

- 0.0–0.5: floaters fade in, headline starts to appear
- 0.5–1.0: headline scales up + translates up (`scale 0.95→1.0`, `translateY 12→0`)
- 1.0–1.6: subtitle fades in (`opacity 0→1`)
- 1.6–2.0: hold, floaters drift, blur ramps up at end as exit cue
- 2.0: scene fades out (last 0.5s window of cold scene)

## Demo beat-sheet — Static mode (localT, scene start = t=2.0)

- 0.0–0.4: bar focus state appears (cyan ring)
- 0.4–2.4: **typing** — linear `typeProgress = (localT - 0.4) / 2.0`, slice query
- 2.4–2.8: caret blinks on full text, **Send pulse** starts at localT 2.4
- 2.8: **bar clears**, user bubble pops, thinking bubble appears
- 3.1–5.8: **tool chain** — 8 tools, 0.30s gap, each pulses then `✓`s
- 5.9: thinking bubble starts sliding up out of frame (`translateY: -360px`)
- 5.9–6.3: result bubble fades in at the same top position
- 6.3: hero card appears
- 6.7–8.3: **hero $ number ticks** from 0 to target (1.6s ramp)
- 8.0–8.3: action buttons stagger in (0.12s delay each)
- 8.5–8.9: "other opportunities" chips stagger in (0.14s delay each)
- 8.9–13.5: **hold** (~4.6s for the viewer to read the answer)

## Demo beat-sheet — Zoom mode (localT, scene start = t=2.0)

Adds 2.2s of camera-only time before the chat reveals:

- 0.0–0.4: bar focus (camera already zoomed at scale 2.5 on text center)
- 0.4–2.4: typing (camera held — NO horizontal tracking)
- 2.4–3.4: **pan to Send** (1.0s `easeInOutCubic`)
- 3.4–3.8: hold + pulse Send
- 3.8–5.0: **pan + zoom out** to scale 1.0
- 5.0–5.3: user bubble pops, thinking appears
- 5.3–8.0: tool chain (same 8 tools)
- 8.1–8.5: thinking exits, result enters
- 8.5+: hero card, $ ticks, actions, others — same pacing as static, just shifted by +2.2s
- 15.5: scene ends

## Logo beat-sheet (both modes)

- 0.0–0.9: logo + wordmark scales from `0.9` to `1.0` and fades in
- 0.85–1.4: tagline fades in
- 1.4–1.9: CTA pill fades in
- 1.9–3.5: **hold** (audience absorbs brand)
- 3.5–4.0: audio fade-out window starts (0.5s before scene end)
- 4.0: end

## Audio fade

If `audio.mp3` is provided, fade out the last **1.0 second** of the video. ffmpeg arg:
```
-af "afade=t=out:st=$((DURATION - 1.0)):d=1.0"
```

This lands the music tail exactly on the logo CTA — never an abrupt cut.

## Why these numbers

- **Typing 2.0s** — fast enough to read effortlessly, slow enough to feel deliberate. Faster (under 1.5s) reads as "auto-filled," slower (over 3s) reads as "buffering."
- **Hold full text 1.0s** — gives the viewer time to register the question before motion resumes.
- **Tool chain 3s** — 0.30 × 8 + 0.5–0.7 runFor compounds to ~3s of "real work" feeling. Faster looks fake.
- **Hero $ tick 1.6s** — long enough that the number "lands" emotionally, short enough not to bore.
- **Logo 4s** — branding fundamentals say at least 3s; 4s with a tail audio fade is best practice for shareable content.
