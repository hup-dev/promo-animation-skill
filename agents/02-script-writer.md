# Phase 2 — Script Writer

Use this prompt when invoking the subagent via the Agent tool. Replace `{{BRAND_JSON}}` and `{{PRODUCT_DESCRIPTION}}` with the phase-1 output and a 1–2 sentence description.

---

You're writing a 17–20 second promo animation script for a SaaS product. The format is a *single typed query → AI thinks → AI returns a result with a big $ number*. Linear/Vercel/Stripe vibe — punchy, specific, named.

**Brand & product context (phase 1 output):**
```json
{{BRAND_JSON}}
```

**What the product does:** {{PRODUCT_DESCRIPTION}}

## Required output shape

Return a single fenced ```json block. Match this shape **exactly** — these fields plug directly into the promo.html template:

```json
{
  "coldOpen": {
    "headlineTop": "Stop overpaying.",
    "headlineAccent": "Start asking.",
    "subtitle": "U.S. importers leave billions in duty on the table every year.",
    "floaters": ["8703.23","+25%","§301 +7.5%","HTS 9503","MFN 16.5%","CIT 2003","USMCA","HQ H024707","8704.31","2.5%","$1.2T","8518.22","first sale","Ch.99","MPF 0.3464%","6109.10","origin VN","reclass","yarn-forward","9018.32"]
  },
  "case": {
    "query": "show me my biggest tariff engineering opportunity",
    "intro": "Scanning your 847 entries from 2024. Pulling HTS classifications, CBP rulings, court precedents, and known tariff-engineering patterns...",
    "tools": [
      { "name": "reading entries · 847 lines",            "runFor": 0.7 },
      { "name": "hts_lookup · 4-digit chapter scan",      "runFor": 0.7 },
      { "name": "hts_lookup · drill 10-digit",            "runFor": 0.7 },
      { "name": "cbp_rulings · NY + HQ cross-reference",  "runFor": 0.65 },
      { "name": "court_decisions · CIT precedents",       "runFor": 0.6 },
      { "name": "tariff_engineering_patterns · footwear", "runFor": 0.55 },
      { "name": "duty_calculator · stack rules",          "runFor": 0.5 },
      { "name": "ranking_by_savings",                     "runFor": 0.5 }
    ],
    "resultIntro": "Your single biggest unrealized opportunity — and it's a classic:",
    "hero": {
      "rank": "#1",
      "cat": "Tariff engineering · footwear reclassification",
      "title": "Canvas sneakers · felt-sole reclass",
      "sub": "HTS 6404.19.20 · the Converse Chuck Taylor strategy",
      "num": 3840000,
      "unit": "/ year saved at current volume",
      "cap": "Adding a felt layer over >50% of the rubber outer sole moves classification from athletic footwear (20%) into the textile-soled basket (7.5%). In commercial use by Converse on All-Stars since the 1990s.",
      "actions": [
        { "label": "Show the modification spec", "primary": true },
        { "label": "Apply to my 4 SKUs",         "primary": false }
      ],
      "others": [
        { "rank": "#2", "label": "Cotton tees · First Sale + USMCA stack", "amt": 1457000 },
        { "rank": "#3", "label": "Speakers · §301 origin shift to VN",      "amt": 612300 },
        { "rank": "#4", "label": "Cargo vans · reclass to 8704.31",        "amt": 214000 }
      ]
    }
  },
  "logoOut": {
    "tagline": "Trade strategy, at the speed of a prompt.",
    "cta": "atlas.trade →"
  }
}
```

The example above is the canonical reference (a fictional "Atlas Trade" tariff/customs copilot) — yours should match the structure with content specific to the actual product.

## Writing rules

### Cold open
- **Headline:** two lines, the second in the brand-accent gradient. 4–6 words total. Imperative voice: "Stop X. Start Y." / "Less X. More Y." / "Skip X. Find Y."
- **Subtitle:** one factual sentence, 8–14 words. A real statistic if you can name one; otherwise a true claim about the customer's reality.
- **Floaters:** 18–22 strings drawn from the product's actual vocabulary. Codes, percentages, court names, units. They should be *recognizable to a customer*, not gibberish.

### Hero query
- **Naive, short, conversational.** Not jargon-loaded. Real customers type "show me my biggest X" / "how do I avoid Y" / "what should I do about Z" — not "execute multi-step tariff analysis pipeline."
- 5–9 words. Lowercase. No punctuation except `?` if it's actually a question.

### Tools chain
- **8 tools.** Fewer reads under-engineered; more reads slow.
- Each tool name is `verb_noun · qualifier` format. Use the product's actual function names if you can find them in the codebase (search for service files, API routes, agent tool definitions).
- `runFor` durations 0.5–0.7s. Total ≈ 3s of "thinking."

### Hero result card
- **One hero number.** 6–7 digits. This is the money shot — has to feel real and big enough to matter.
- **Title:** specific entity (product name, case name, technique name). Never "your savings opportunity."
- **`cat`:** the category, all-caps in the template. Pulls from the domain (e.g. "TARIFF ENGINEERING · FOOTWEAR RECLASSIFICATION", "PRICING STRATEGY · INDUSTRY BENCHMARK").
- **`sub`:** a code or identifier (HTS, SKU, patent #, model name) + the named strategy.
- **`cap`:** the *why* in 1–2 sentences. Mention a real source (court case, ruling, patent, well-known company).
- **Two action buttons.** Primary = "Show me the [spec/playbook/checklist]". Secondary = "Apply to [my catalog/team/account]". Verbs that imply the user wants the next step.
- **3 "other opportunities"** — same shape, smaller $ amounts (10–50% of hero). All real-sounding.

### Logo out
- **Tagline:** 6–9 words, declarative. "X, at the speed of Y" / "Y for the modern Z."
- **CTA:** the real domain + `→`.

## Specificity test

Before returning, check each text field against this:

- Could this exact line appear in 3 different products? → too generic, rewrite.
- Does this mention a real named thing (company, court case, code, ruling)? If no → add one.
- Would a customer reading this know which product it is without the wordmark? → good.

Return only the JSON block + a brief note (≤100 words) explaining your case choice.
