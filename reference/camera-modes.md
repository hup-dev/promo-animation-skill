# Camera Modes — Static vs Zoom

Two cuts ship by default. Pick the right one per moment; sometimes ship both for the user.

## Static (17.5s) — the safe default

`appwin` stays at `scale(1)` for the whole animation. No camera moves.

**When to use:**
- You want all the chat UI (sidebar context, header, composer) visible from frame 1.
- The hero moment is the *answer card*, not the *typing*.
- For social-media auto-play where users won't have sound — they read the UI directly.

**Timing budget:**
- 0.0–2.0s — cold open
- 2.4–4.4s — typing (slow, deliberate, ~2s)
- 4.4–5.4s — full text held in bar (1s — let it land)
- 5.4–5.8s — send pulse, bar clears, user bubble pops
- 5.8–14.5s — thinking bubble + 8 tool chain + result reveal + hero $ tick + actions
- 14.5–18.5s — logo (4s hold for branding)

## Zoom (19.5s) — cinematic

Three-phase camera on the `appwin` transform:
1. **Typing phase** — hold `scale(2.5)` on text center (`TEXT_CENTER_X = 492, TARGET_Y = 700`). Camera DOES NOT pan during typing.
2. **Pan to Send** — `easeInOutCubic` lerp X to `SEND_BTN_X = 1320`, same zoom. ~1.0s pan.
3. **Hold + pulse** — camera holds on Send button (~0.4s) while button has pulsing ring.
4. **Pan + zoom out** — lerp X/Y back to `(APPW_CX=750, APPW_CY=440)` and scale to `1.0`. ~1.2s.

After zoom-out completes, animation continues at scale 1.0 — chat UI is fully visible for the answer reveal.

**Camera math:**
```js
const APPW_CX = 750, APPW_CY = 440;     // appwin center
const txCss = -(camX - APPW_CX) * camS;
const tyCss = -(camY - APPW_CY) * camS;
appwin.style.transform = `translate(${txCss}px, ${tyCss}px) scale(${camS})`;
```
Where `(camX, camY, camS)` interpolate between phases via `easeInOutCubic`.

**When to use:**
- Brand opener for a video where you DO have sound (tighter, more cinematic).
- When the *moment of sending* is the dramatic beat.

**Timing budget:**
- 0.0–2.0s — cold open
- 2.4–4.4s — typing (camera locked on text)
- 4.4–5.4s — full text held (camera locked)
- 5.4–6.4s — pan to Send (1.0s)
- 6.4–6.8s — hold + pulse Send (0.4s)
- 6.8–8.0s — pan + zoom out (1.2s)
- 8.0–16.0s — thinking + tools + result (at scale 1.0)
- 16.0–19.5s — logo

## Don'ts (learned the hard way)

- **Don't scale beyond 2.8.** Vertical viewport at 1920×1080 starts clipping below the appwin bottom edge.
- **Don't pan faster than 1.0s.** Anything quicker is nauseating; brand looks rushed.
- **Don't horizontally pan with the typing cursor.** Eyes can't track a moving cursor on a moving frame at 30fps without motion blur. Choose one: zoom *or* track, never both.
- **Don't make the zoom edge-to-edge** (scale = 1920/qWidth). The text is then so big it dominates the frame entirely and the surrounding UI vanishes — looks broken, not cinematic. Scale 2.5 gives ~70-80% text width which reads as "edge to edge" colloquially while keeping UI context visible.

## Picking between them

| Signal | Pick |
|---|---|
| Will play silent on social | Static |
| Will run with audio | Zoom |
| Multiple visual beats in the demo | Static |
| Single dramatic moment | Zoom |
| User asked for "two versions" | Both |
| Unsure | Ship both, 5 extra minutes |
