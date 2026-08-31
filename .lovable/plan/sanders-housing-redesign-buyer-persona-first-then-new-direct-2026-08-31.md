# Sanders Housing Redesign — Buyer Persona First, Then New Directions

The three prototypes missed because they were styled like generic real-estate/SaaS marketing rather than around how manufactured-home buyers on the Gulf Coast actually shop. Before designing again, we define the buyer, then derive design decisions from that.

## Step 1 — Buyer persona work (research, no code)

Research and document 3 primary personas for a Pensacola-area manufactured home dealer, drawing on the live site's inventory, pricing signals, and public industry sources:

1. **First-time / payment-driven buyer** — shops by monthly payment, not price. Credit anxiety is the #1 blocker. Needs: "can I qualify?", down payment, land question, delivery/setup cost clarity.
2. **Retiree / downsizer relocating to the Gulf Coast** — cash or near-cash, shops by floor plan and single-level living, values wind rating/storm safety, low-maintenance, community/park placement.
3. **Land-owner replacement buyer** — already owns land (often after storm damage or replacing an older unit), shops by dimensions that fit their lot, and by setup/permitting/tie-down services.

For each, capture: what they type into search, what they fear, what stops them from calling, what evidence converts them, and the device they browse on (mobile-dominant for this category).

Deliverable: a `PERSONAS.md` in the project summarizing this, so the design rationale is documented for the Next.js build.

## Step 2 — Translate persona into design requirements

Concrete decisions the persona work should drive, e.g.:

- **Payment-first pricing display**: show "$X/mo est." as prominently as sticker price on every home card.
- **Qualify/financing path elevated** to a primary nav and hero action, not a footer link.
- **"Do you own land?" fork** early in the journey — the single biggest qualifying question in this category.
- **Search by what buyers actually say**: beds, sections (single/double), square footage, price band — not a 30-checkbox feature list.
- **Trust and storm-safety evidence**: wind zone rating, warranty, setup included, years in business, real staff photos.
- **Mobile-first layout**: tap-to-call persistent, big touch targets, fast image loading.
- **Photography over illustration**: real home exteriors/interiors carry this category; avoid abstract or dark editorial treatments.

## Step 3 — Generate 3 new design directions

New directions built against those requirements, each with a genuinely different point of view (not three skins of the same layout). Likely axes to vary: payment-calculator-led hero vs. inventory-grid-led vs. guided-path ("own land? / need financing?") hero.

## Step 4 — Build the chosen direction

Build the selected direction as a working preview (home page plus listing grid, home detail, financing, and request-info), styled entirely through the design token system so it ports cleanly to your Next.js build.

## Technical notes

- Preview is built in this project's stack (TanStack Start + Tailwind v4 tokens in `src/styles.css`); all colors/typography/radii live as semantic tokens so the values transfer directly into a Next.js Tailwind config.
- Listing data will be static/mock in the preview — no backend — unless you want real inventory wired in.
- Home imagery will be generated to match the direction rather than scraped from the current site.

## Open question

Before Step 1 I'd like to confirm which buyer Sanders makes the most money from today, since that should get the strongest weighting in the design.
