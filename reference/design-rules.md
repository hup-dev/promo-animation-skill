# Design Rules — Linear/Vercel/Stripe Quality

The visual rules that separate "AI-made promo" from "looks like a real product video." Apply *all* of these.

## Brand assets
- **Real logo SVG, inlined as `<img>`.** Never raster. Never Inter Tight 700 styled as a logo.
- **28px tall in header**, **520px wide in logo-out.** Smaller in header reads as "small product"; smaller in outro reads as cheap.
- **All colors from `tokens.ts`.** Don't invent hex. Pull `brand-primary`, `brand-accent`, `success`, `text-primary`, `text-body`, `text-secondary`, `text-muted`, `bg-page`, `bg-surface`, `border-default` minimum.

## Surface
- Page bg: `#F3F4F6` (or product equivalent) with **two faint radial gradients**: `rgba(brand-accent, 0.07)` top-left, `rgba(brand-primary, 0.06)` bottom-right.
- **64px grid overlay** masked by a centered radial vignette. Subtle — should read as texture, not pattern.
- App window: white surface, `1px solid rgba(229,231,235,0.8)` border, `16px` radius, `0 24px 80px rgba(17,24,39,0.10)` shadow.
- **Browser chrome.** Three traffic-light dots (red/yellow/green) + pill URL bar with lock + path. Sells "real product."

## Typography
- **Inter** UI (400/425/475/500/600 weights). Note: 425 and 475 are real Inter weights, don't substitute.
- **Inter Tight** for display headlines (-0.018em to -0.04em letter-spacing).
- **JetBrains Mono** for any code, HTS code, $ number, technical chip text.
- Hero $ number: **56px / weight 800 / `tabular-nums` / color `--success`**. Tick from 0 with `fmtMoney(num * tickP)`.

## Chat UI
- **User bubble:** top-right aligned, `#E6ECED` bg, color `#1F2D2D`, `border-radius: 14px 14px 4px 14px` (the 4px corner faces the assumed avatar position). 17px font, weight 475.
- **AI bubble:** left-aligned, white surface, `1px solid #ebebeb`, `12px` radius, soft `0 2px 8px rgba(0,0,0,0.04)` shadow.
- **Sparkle prefix:** 24-28px rounded square, `linear-gradient(135deg, brand-accent, brand-primary)`, white `✦` glyph.
- **Composer (input):** white surface, `1px solid #E6E7E7`, `10px` radius. Focus state: `0 0 0 4px rgba(brand-accent, 0.24)` ring.
- **Send button:** gradient overlay over brand-primary, white text, up-arrow `↑` + "Send" label. Pulse state for the moment of send.

## GenUI cards (the "answer")
- **Hero opportunity card:** `1px solid #E6E4E1` (warmer than default border), `linear-gradient(180deg, #FCFCFB, #fff)` bg, `10px` radius, soft shadow.
- **Rank pill:** `#1` in brand-primary fill, white text, 700 weight, 11px, letter-spacing 0.06em.
- **Category line:** 11px, 500 weight, 0.07em letter-spacing, uppercase, text-muted color.
- **Title:** 26px Inter Tight 700, -0.018em letter-spacing.
- **$ number:** 56px JetBrains Mono 800 success color tabular-nums.
- **Cap text:** 13px text-secondary, 1.4 line-height — the *why*, mentions a real source.

## Action buttons
- **Primary:** brand-primary fill, white text, ✦ icon + label, `0 1px 2px rgba(brand,0.18)` shadow, 8px radius, `9px 14px` padding, 14px Inter 500.
- **Secondary:** white surface, `border-default`, text-body color, ↗ icon + label, same dimensions.

## Tool chain (the "thinking")
- Vertical list, 8 rows, 8px gap.
- Each row: 8px circle dot · 13px JetBrains Mono tool name · trailing `✓` when done.
- **Running state:** dot has pulsing box-shadow `0 0 0 8px rgba(brand-accent, 0.6)` cycling.
- **Done state:** dot turns success color, gets `0 0 0 4px rgba(success, 0.10)` ring.
- 0.30s gap between tool appearances, 0.5–0.7s `runFor` per tool. Total ≈ 3s.

## Shadows
- Only soft: `0 1px 2px rgba(17,24,39,0.04)` for inline elements, `0 2px 8px rgba(17,24,39,0.04)` for cards, `0 24px 80px rgba(17,24,39,0.10)` for the app window.
- **Never** harsh black (`rgba(0,0,0,0.5)+`). Never directional drop-shadows.

## Don'ts
- ❌ Voiceover or speaker callouts
- ❌ Generic stock illustrations or emoji as primary UI
- ❌ Two bubbles visible at the same opacity (thinking must exit before result enters)
- ❌ Caret on placeholder text
- ❌ Numbers without `tabular-nums` (they jitter horizontally)
- ❌ Bold/Black for everything — vary weight as a hierarchy tool
