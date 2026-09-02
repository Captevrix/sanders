# Make the payment estimator results truly useful

Current state (verified): the "X of our N priced homes fit" sentence in `PaymentEstimator`
(src/routes/index.tsx) is already dynamic, computed from live published homes via
`homesQuery`. Live data: 40 published homes, 3 priced, 1 fits the default $1,100/mo budget.
The problem: the sentence ignores unpriced homes (making the lot look small) and the
matches are not clickable.

## What changes

1. Include unpriced homes in the copy
   - Reword the result box to: "That's roughly a $X home. N of our P priced homes fit
     today, and U more are priced with your options, so call and we'll check them against
     this number." All numbers computed from live data.

2. Clickable matches
   - Add a "See the homes that fit" link under the result, navigating to
     /homes?maxPayment=<budget> using the existing maxPayment listing filter.

3. Pluralization
   - Handle 0/1 matches cleanly so copy reads correctly as inventory changes.

## Technical details

- Single file: src/routes/index.tsx (PaymentEstimator). Pass total published home count
  as an additional prop; matches/priced already derive from live query data. Link uses
  the existing homesSearch({ maxPayment: budget }) search object.
- No new queries, no schema changes, no new dependencies. No em dashes in new copy.

## Verify

- Typecheck clean; Playwright: default budget shows new sentence; "See the homes that
  fit" navigates to /homes?maxPayment=1100 with filtered results; moving the slider
  updates counts live.
