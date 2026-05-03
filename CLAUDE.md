# CLAUDE.md

**NEVER use em dashes (—). Anywhere. Not in user-facing strings, not in
comments, not in commit messages, not in PR descriptions, not in docs. If
you are tempted to write an em dash, use a period, comma, colon,
parentheses, or rewrite the sentence. This rule has no exceptions.**

## House rules

- Single-file deploy. `standalone.html` is the production artifact; it is
  served via htmlpreview.github.io. No build step. Vanilla JS, hand-rolled
  CSS, dark theme, mobile-first.
- The engine stays pure. No globals, no DOM access inside `recommend`,
  `apparentC`, `feels`, `cloudAdj`, `pickBand`, `summarizeArc`,
  `buildTimeline`, `buildDailySummaries`, or `buildTodayCells`.
- All thresholds live in `CFG`. Do not bury constants in code paths.
- Never call Open-Meteo with `forecast_days` above 16 (free-tier max).
- User strings are direct and short. No design jargon, no LLM flavour. If
  you can drop a word without losing meaning, drop it.
- No CSS gradients anywhere. Solid colors only.
- The `src/` React app is no longer the production artifact and is allowed
  to drift behind `standalone.html`. Engine tests under `src/engine/` still
  run in CI.
- Bump the visible footer version (e.g. `v8-...`) and the cache-bust query
  (`?v=N`) on every push so the user can confirm which build they're on.

## State that lives in localStorage

| key | shape | what it does |
| --- | --- | --- |
| `wtwfw-baseline` | `runs_cold` \| `neutral` \| `runs_warm` | shifts `CFG.baselineOffset` |
| `wtwfw-activity` | `standing` \| `walking` \| `biking` \| `running` | sets `CFG.activityOffset` |
| `wtwfw-learned` | float in `[-3, 3]` | tap-to-teach offset, folded into baseline |
| `wtwfw-location` | `{lat, lon, tz, name}` | overrides the default Vancouver |

## Bands (warmest to coldest)

`scorching` (>=30) `hot` (>=24) `warm` (>=19) `mild` (>=14) `cool` (>=10)
`chilly` (>=6) `cold` (>=1) `very_cold` (>=-5) `freezing` (rest).

The label is the engine's view of effective temp (apparent + baseline +
activity + learned). Hero color is fixed per band; do not gradient.

## Shipped V2 (don't re-discuss)

- Cloud-cover-as-temperature-modifier (clear+UV adds, overcast trims)
- Runs-cold / runs-warm baseline picker
- Activity picker (standing / walking / biking / running)
- Multi-location with browser geolocation + Open-Meteo geocoding search
- Inline calibration via the "Too cold / Just right / Too warm" buttons
- Snow handling: boots + waterproof insulated outer + hat/gloves above
  `CFG.snowBootsCm`

## Backlog (not building yet)

- Wardrobe layer that maps abstract recipe items to user-owned garments
- Onboarding flow that asks current outfit + comfort to seed the learned
  offset (rather than relying on tap-to-teach over time)
- Custom clothing additions (user can add their own items + warmth ratings)
- Switching from unicode emoji to a consistent inline SVG icon set
