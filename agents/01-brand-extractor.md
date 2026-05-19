# Phase 1 — Brand & Asset Extractor

Use this prompt when invoking the subagent via the Agent tool. Replace `{{REPO_ROOT}}` and `{{PRODUCT_HINT}}` with concrete values before sending.

---

You're extracting the visual brand & product identity of a SaaS app from its codebase so a high-fidelity promo animation can mimic it pixel-for-pixel. Do NOT invent colors, fonts, copy, or product names — find the real ones in code.

**Repo root:** `{{REPO_ROOT}}`
**What I know about the product:** {{PRODUCT_HINT}}

## What to find (in this order)

1. **Product name + tagline.** Look in:
   - `package.json` top-level `name`
   - Landing page hero copy (search `apps/web` or equivalent for the main `index.html` or hero component)
   - Any "About" / "Marketing" component
   - The browser tab `<title>`
   - README.md headers

2. **Design tokens.** Look for one of:
   - `tokens.ts`, `tokens.js`, `theme.ts` (single source of truth)
   - `tailwind.config.js` `theme.extend.colors`
   - CSS custom properties in a `:root {}` block
   - `docs/DESIGN_TOKEN_GUIDE.md` or similar
   
   Extract literal hex values for: brand primary + brand accent (or "primary hover"), text primary/body/secondary/muted, bg page/surface/hover, border default/light, success/warning/danger.

3. **Real logo SVG.** Search `apps/web/public/`, `apps/web/src/assets/`, `static/`, or `public/` for `.svg` files. Identify:
   - The "mark only" SVG (icon, no wordmark) — short aspect ratio
   - The "full logo" SVG (mark + wordmark) — wide aspect ratio
   - Return absolute paths. Confirm by reading the SVG headers / viewBox dimensions.

4. **Chat / hero input component.** Find the surface users recognize as THE product:
   - Search for `ChatInput`, `ChatBubble`, `Composer`, `Conversation`, `Hero`, `SearchBar` patterns
   - Note: container border (`1px solid #...`), border-radius, padding, primary button background, placeholder text, send-icon style, focus ring color
   - Quote the actual code for the primary action button

5. **Font stack.** Look in:
   - `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` in the HTML head
   - `font-family` in the theme/tokens
   - Note any unusual weights (e.g. Inter 425, 475)

6. **Product subtitle / badge / domain.** Find:
   - The subtitle the product uses next to the wordmark (e.g. "Intelligence", "Cloud", "Studio")
   - Any pill/badge near the logo in the UI (e.g. "Trade copilot", "Beta")
   - The real domain (e.g. `linear.app`, `vercel.com`, `stripe.com`) — check `package.json`, `README`, footer components

## Output format

Return a single fenced ```json block with this shape. Use empty strings for fields you can't confirm; never guess.

```json
{
  "productName": "Atlas Trade",
  "productSubtitle": "Intelligence",
  "productBadge": "Trade copilot",
  "productDomain": "app.atlas.trade",
  "productTagline": "Trade strategy, at the speed of a prompt.",
  "tokens": {
    "brandPrimary": "#0B494B",
    "brandAccent": "#1CB4BA",
    "brandPrimaryHover": "#093B3D",
    "textPrimary": "#111827",
    "textBody": "#374151",
    "textSecondary": "#6B7280",
    "textMuted": "#9CA3AF",
    "bgPage": "#F3F4F6",
    "bgSurface": "#FFFFFF",
    "bgHover": "#F9FAFB",
    "borderDefault": "#E5E7EB",
    "borderLight": "#F3F4F6",
    "success": "#059669",
    "successBg": "#ECFDF5",
    "warning": "#D97706",
    "warningBg": "#FEF3C7"
  },
  "fontStack": {
    "ui": "Inter, -apple-system, system-ui, sans-serif",
    "display": "Inter Tight, Inter, sans-serif",
    "mono": "JetBrains Mono, monospace",
    "weights": [400, 425, 475, 500, 600, 700, 800]
  },
  "logo": {
    "fullPath": "/abs/path/to/Logo.svg",
    "markPath": "/abs/path/to/LogoIcon.svg",
    "viewBox": "0 0 277 79"
  },
  "chatUi": {
    "componentPath": "/abs/path/to/ChatInputArea.tsx",
    "containerBorder": "1px solid #E6E7E7",
    "containerRadius": "8px",
    "containerPadding": "14px 18px 12px",
    "placeholder": "Ask anything...",
    "sparkleIcon": "AutoAwesome",
    "sendIcon": "FiArrowUp",
    "sendBackground": "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%), #0B494B",
    "focusRing": "0 0 0 4px rgba(28,180,186,0.24)",
    "disclaim": "Atlas AI may display inaccurate info, so please double check the response."
  },
  "navigation": {
    "intelligenceLabel": "Intelligence",
    "otherSections": ["Entries", "Reconciliation", "Refunds", "Rulings", "HTS Lookup"]
  },
  "notes": "Inter weights 425/475 are explicit — don't substitute 400/500. Logo is hand-lettered italic, treat as image not text."
}
```

## Rules

- **Quote real code paths.** Every path you return should pass `ls` / `Read`.
- **No invented hex.** If you can't find brand primary, set it to `""`. Skill will warn the user.
- **Read the SVG headers.** Don't claim a wordmark exists if the SVG is mark-only.
- **Report unusual font weights.** Inter at 425 vs 500 is a noticeable difference.
- **One product name only.** If there's marketing copy ("AcmeCorp AI", "AcmeCorp Intelligence Platform"), prefer the shortest hero version.
- **Under 600 words** in your response outside the JSON block.
