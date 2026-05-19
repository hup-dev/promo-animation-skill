# Phase 3 — Content Researcher

Use this prompt when invoking the subagent via the Agent tool. Replace `{{DOMAIN}}`, `{{PATTERN}}`, and `{{PRODUCT_DESCRIPTION}}` with the product's domain area, the animation pattern chosen by phase 2, and a 1-line product summary.

---

Find the **real, named, verifiable content** to put on screen in the animation. Wherever the animation makes a claim (a number, a case, a customer, an outcome), it should be backed by a public source you can cite.

**Domain:** {{DOMAIN}}
**Pattern:** {{PATTERN}}
**Product:** {{PRODUCT_DESCRIPTION}}

## What to return depends on the pattern

- **chat-demo / product promo:** ONE canonical "Chuck Taylor moment" case study — see rules below.
- **stat-reveal:** ONE big number the product can credibly own + the source it traces to.
- **brand-intro / logo reveal:** the company's actual headline / tagline / customer count / launch milestone — whatever's true and on their site.
- **workflow-walkthrough:** the most common real user journey, with actual step names from the product.
- **before-after:** the named "before" state and "after" state with quantitative deltas.
- **feature-showcase:** 3–5 hero moments with named features and the metric each delivers.

The rest of this document focuses on the **chat-demo / product promo** case — it's the densest content research the skill does. For other patterns, the same principles apply (real, named, verifiable, dramatic delta) but the output shape is simpler — return whatever is needed for the storyboard from phase 2.

## What makes a great case

You're looking for ONE case that hits all of these:

1. **Real, named entity.** A real company, court case, patent number, ruling, or industry benchmark. Not "a manufacturer we know" — actual names that someone in the domain would recognize.
2. **Concrete before/after with units.** Was 25%, became 2.5%. Was $5.10, became $3.20. Was 14 days, became 3 hours. The transition has to be quantitative.
3. **Hero number big enough to be the headline.** 6–7 figures of savings/impact per year for a typical user. If it's smaller than $100K it doesn't carry an ad.
4. **Specific mechanism.** Not "they optimized" — there's a *physical* or *legal* or *structural* trick you can describe in one sentence. ("Adding felt to the sole over 50% of the rubber surface moves the classification…")
5. **Verifiable.** You can cite a court case (`Toy Biz v. United States, CIT 2003`), a CBP ruling number (`HQ H024707`), a patent (`US 7,234,567`), or a public news article.

## Examples of great cases by domain

| Domain | Canonical case | Why it works |
|---|---|---|
| Trade/customs | **Converse Chuck Taylor felt-sole reclass** — HTS 6404.11 (20%) → 6404.19 (7.5%) | Real brand, physical product modification, ~$0.85/pair × millions of pairs |
| Trade/customs alt | **Marvel Toy Biz v. U.S. (CIT 2003)** — dolls (12%) → non-human toys (Free) | Court case is public, X-Men anatomy argument is famous |
| Trade/customs alt | **Snuggie blanket case (2017)** — garment (14.9%) → blanket (8.5%) | Federal Circuit ruling, consumer-recognizable product |
| Pricing | **Stripe Atlas $500 setup vs Delaware incorporation $1,500+** | Named alternative, real fee differential |
| Customer support | **Klarna's AI handles 2.3M chats in 1 month, work of 700 agents** | Named company, public metric |
| Search/dev tools | **Stripe docs onboarding time: 14 days → 3 hours w/ inline examples** | Real change in real product |
| Insurance/finance | **Tesla insurance using telemetry — 30% discount for safe drivers** | Named mechanism + quantified delta |

## Process

1. Use `WebSearch` for "[domain] famous case study before after dramatic savings" + "[domain] court case landmark precedent" + "[domain] patent litigation [random year]" — find sources.
2. `WebFetch` 2–3 sources for the most promising case to verify the numbers. Court documents, press releases, well-cited industry articles preferred over blog posts.
3. Cross-check the headline number against a second source if possible. If you can't verify within ~10% accuracy, lower the number to a defensible range.

## Output format

Return a single fenced ```json block:

```json
{
  "case": {
    "name": "Toy Biz, Inc. v. United States",
    "year": 2003,
    "court_or_source": "U.S. Court of International Trade",
    "entity": "Marvel Entertainment",
    "mechanism": "Action figures with non-human anatomy (claws, fur, wings, tails) classify as 'toys' (HTS 9503.00.0073) not 'dolls representing humans' (9503.00.0071).",
    "before": { "code": "9503.00.0071", "value": "12%", "label": "Dolls representing humans" },
    "after":  { "code": "9503.00.0073", "value": "Free", "label": "Non-human toys" },
    "hero_number_usd_per_year": 847000,
    "hero_number_basis": "typical 50K-unit annual import × $1.70 saved per unit",
    "verifiable_at": [
      "https://...court-record-url",
      "https://...news-article"
    ]
  },
  "secondary_cases": [
    {
      "rank": "#2",
      "label": "Cotton tees · First Sale + USMCA stack",
      "amt_usd_per_year": 1457000,
      "one_liner": "Declare factory price ($3.20) instead of middleman price ($5.10) under First Sale rule; combine with USMCA yarn-forward 0% duty."
    },
    {
      "rank": "#3",
      "label": "Speakers · §301 origin shift to VN",
      "amt_usd_per_year": 612300,
      "one_liner": "PCB assembly + final integration in Vietnam = substantial transformation; §301 +7.5% exposure eliminated on 50K units."
    },
    {
      "rank": "#4",
      "label": "Cargo vans · reclass to 8704.31",
      "amt_usd_per_year": 214000,
      "one_liner": "Vans imported as 'goods vehicle' (8704.31, 25%) instead of passenger (8703.23, 2.5%) when rear seats removed at port — see HQ H024707."
    }
  ],
  "notes_for_scriptwriter": "Lead with X-Men if customer-facing; lead with felt-sole if industry-facing. Felt-sole has higher hero number but is slightly more obscure."
}
```

Return only the JSON + a brief note (≤80 words) on why you picked this case. If the domain doesn't have a clear "Chuck Taylor moment," return your three best candidates with hero numbers and let the orchestrator pick.
