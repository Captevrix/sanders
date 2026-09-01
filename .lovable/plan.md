# Rebrand the site around the Sanders logo

## Goal

The logo (navy "Sanders" wordmark, steel-blue + rust roofline) is already in the header/favicon, but the site's color system is still the teal/sand/amber "Warm Gulf Coast" palette. Rebrand so the whole site — public pages and staff dashboard — is built from the logo's own colors.

## Palette (extracted from the logo)

```text
Navy        #2B4766   logo wordmark      -> primary (buttons, links, headers accents, footer bg)
Rust        #A6471F   right roofline      -> accent (payment highlights, key CTAs, badges)
Steel blue  #86B5C7   left roofline       -> secondary (chips, highlights, info surfaces, chart accents)
Paper       warm off-white (kept, cooled slightly toward neutral) -> background
Ink         deep navy-tinted              -> foreground/text
```

## Changes

**1. Design tokens (`src/styles.css`)**
- Recolor `:root` (and `.dark`) tokens to the logo palette: `--primary` navy, `--accent` rust, `--secondary`/info surfaces steel blue, borders/inputs/sand tones shifted to cool-neutral tints of the brand colors.
- Update `--ring`, `--chart-*`, `--sidebar-*`, success color harmony, and shadow tints to navy-based.
- Keep the semantic token names identical — every component (`bg-primary`, `text-accent`, `bg-sand`, etc.) picks up the new brand automatically, including the dashboard. Keep Archivo/Public Sans (the rounded bold wordmark pairs well with Archivo).

**2. Visual audit pass**
- Sweep components for the handful of places that will read differently with the new palette: hero overlay gradient, status/feature badge chips, "Get your payment" CTA, flyer print sheet, header phone button, dashboard accents. Adjust only where contrast or emphasis breaks — no layout changes.
- Keep the rust accent reserved for high-value actions (payment, qualify, submit) so it stays special, matching the logo's sparing use of orange.

## Out of scope
- Logo file itself, favicon (already the Sanders mark), fonts, layouts, data.

## Technical details
- Single-file token change in `src/styles.css` (oklch values), plus small targeted class tweaks in components if needed.
- Verify: typecheck clean, build OK, then Playwright screenshots of `/`, `/homes`, a detail page, `/flyer/{id}`, and `/dashboard` to confirm the new palette reads well everywhere.
