# Clean up home descriptions

Today every listing description is stored as one blob of text with broken spacing, stray blank lines, leftover research artifacts ("Southern Energy+1", "Denham Springs Housing+1"), emoji headings, and inconsistent voice. The detail page then renders the whole thing inside a single paragraph, so it reads as a wall of text.

## What changes

### 1. Rewrite the copy for all 51 homes
Each description gets rewritten into a consistent Sanders voice with a fixed shape:

- **Lead** - two or three sentences: what the home is, who it suits, standout feature.
- **Quick overview** - size, layout, bed/bath, section type, wind zone, pulled from the real listing data so the numbers always match the spec table.
- **Highlights** - four to six short bullets with a bolded label (Open-concept living, Kitchen, Owner's suite, Laundry, Construction, Energy).
- **Why buyers pick it** - a short closing paragraph.

Rules applied to every one: no emoji, no citation fragments, no fake claims, plain hyphens, no invented specs, keep any genuinely home-specific detail from the current text.

Rewrites are generated with AI from the existing description plus that home's real specs and features, then written back to the database in one pass. Every rewrite is reviewed for stray artifacts before it goes in, and the originals are kept in a backup column so anything can be restored.

### 2. Structured, readable rendering
A new description block on the home detail page renders the stored text properly: lead paragraph, section headings, and real bullet lists with bold labels, at a comfortable reading measure.

### 3. Short by default, "Read more" to expand
The page shows the lead plus the highlights, softly faded at the cut, with a "Read more" button that expands the rest in place ("Show less" to collapse). Short descriptions show in full with no button. The printable flyer always renders the full text, unexpanded.

### 4. Dashboard editor
The listing editor keeps a plain textarea, with a short format hint above it showing the expected shape so future edits stay consistent.

## Technical notes

- Migration adds `description_original text` to `public.homes` and copies the current values in before any rewrite, so the change is reversible.
- Rewrites run as a one-off scripted pass through the Lovable AI gateway (`google/gemini-2.5-flash`) over all 51 rows, each prompt seeded with that home's name, builder, beds/baths/sqft, dimensions, section type, wind zone and features. Output stored as light markdown (`## heading`, `- **Label:** text`).
- New `src/components/site/HomeDescription.tsx` parses that markdown subset (no new dependency): headings, bullets with bold labels, paragraphs. Props for `collapsible` so the flyer can render it fully.
- `src/routes/homes.$homeId.tsx` swaps the current `<p>{home.description}</p>` for `<HomeDescription collapsible />`; `src/routes/flyer.$homeId.tsx` uses `<HomeDescription />` with print-safe spacing.
- No schema change to `Home` / `HomeRow` types; `description` stays a single text field.
