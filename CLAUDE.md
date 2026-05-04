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
  `apparentC`, `feels`, `cloudAdj`, `breezeAdj`, `solarElevation`,
  `adaptiveShift`, `pickBand`, `summarizeArc`, `buildTimeline`,
  `buildDailySummaries`, `buildTodayCells`, `totalClo`, or
  `findMatchingSnapshot`.
- All thresholds live in `CFG`. Do not bury constants in code paths.
- Never call Open-Meteo with `forecast_days` above 16 (free-tier max).
- User strings are direct and short. No design jargon, no LLM flavour. If
  you can drop a word without losing meaning, drop it.
- No CSS gradients anywhere. Solid colors only.
- The `src/` React app is no longer the production artifact and is allowed
  to drift behind `standalone.html`. Engine tests under `src/engine/` still
  run in CI alongside `tests/standalone-engine.test.js` (vm-extracted from
  the deployed file).
- Bump the visible footer version (e.g. `v8-...`) and the cache-bust query
  (`?v=N`) on every push so the user can confirm which build they're on.

## State that lives in localStorage

| key | shape | what it does |
| --- | --- | --- |
| `wtwfw-baseline` | `runs_cold` \| `neutral` \| `runs_warm` | shifts `CFG.baselineOffset` |
| `wtwfw-activity` | `standing` \| `walking` \| `biking` \| `running` | sets `CFG.activityOffset` |
| `wtwfw-learned` | float in `[-3, 3]` | tap-to-teach offset, folded into baseline |
| `wtwfw-location` | `{lat, lon, tz, name}` | active location |
| `wtwfw-saved-locations` | `[{lat, lon, tz, name}]` | saved-cities library, capped at 12 (free 2, Pro 12) |
| `wtwfw-closet` | `{slot: [{name, minTemp, maxTemp, conditions}]}` | user's wardrobe per slot |
| `wtwfw-overrides` | `{"<band>|<conds>": {slot: itemName}}` | per-band recipe overrides |
| `wtwfw-snapshots` | `[{ts, forTime, airTemp, feels, conditions, worn, extra, comfort, ...}]` | logged outfit reports, capped at 50 |
| `wtwfw-onboarded` | `"1"` | once set, onboarding doesn't re-show |
| `wtwfw-pro` | `"trial"` \| `"active"` | Pro state on the web (iOS replaces with StoreKit) |
| `wtwfw-trial-expires` | epoch ms | when the 14-day trial ends |
| `wtwfw-theme` | `"light"` \| `"dark"` | omitted = follow system preference |

## Bands (warmest to coldest)

`scorching` (>=30) `hot` (>=24) `warm` (>=19) `mild` (>=14) `cool` (>=10)
`chilly` (>=6) `cold` (>=1) `very_cold` (>=-5) `freezing` (rest).

The label is the engine's view of effective temp (apparent + baseline +
activity + learned + adaptive). Hero color is fixed per band; no gradients.

## Engine math

- `apparentC` = NWS Wind Chill below 10C with wind > 4.8 km/h, NWS Heat
  Index above 26.7C, BOM AT in between.
- `cloudAdj` = solar-elevation-driven radiative model. Below -3deg = night,
  -3 to 5deg = dusk cooling, above 5deg = sin(elev) * cloud transmission
  scaled. Uses `solarElevation(lat, iso)` from latitude + day-of-year + local
  hour.
- `breezeAdj` = above 10C, every km/h beyond 10 subtracts 0.2deg, capped
  at -2.5deg (BOM AT under-weights wind in the warm range).
- `feels` = `apparentC + cloudAdj + breezeAdj`.
- `effective` = `feels + baselineOffset + activityOffset + adaptiveShift`.
- `adaptiveShift` = ASHRAE 55-2017 adaptive comfort, 0.31 * (15 - mean of
  forecast 7-day daily means), clamped to +/-3.
- `totalClo` = sum of `clo` per layer item, ASHRAE 55 / ISO 9920 values
  baked into `RECIPES`.

## Multi-source weather

`fetchFromOpenMeteo(loc?)` is primary. `fetchFromMetNo()` is secondary.
`blendWeather` averages tempC / rh / kph / cloud per matching hour and
takes max(precipMm). UV / weather_code / is_day come from Open-Meteo only.
If Met Norway fails, the app silently falls back to Open-Meteo.

## Tests

`tests/standalone-engine.test.js` (vitest) loads `standalone.html`,
extracts the inline `<script>`, strips the IIFE that fetches and renders,
runs the rest in a `node:vm` context, and tests the actual deployed
engine functions. No duplication. CI runs both this and the React engine
tests under `src/engine/`.

## Pro / subscription

Free vs Pro gates today:
- Trip planner: Pro only (free shows the upsell modal).
- Saved locations: free 2, Pro 12.
- Everything else (engine, calibration, closet, snapshots, KNN,
  overrides) is free.

The web "trial" is a 14-day localStorage flag started by tapping a
button. iOS will replace `getProStatus()` with a StoreKit subscription
check.

Planned Pro additions (not built yet):
- iOS widgets (lock-screen, home-screen).
- Push notifications.
- Cloud sync between devices.
- Faster background updates.

## Backlog (not building yet)

- Wardrobe layer that maps abstract recipe items to user-owned garments
  using `clo` as the matching key (a constraint solver instead of fixed
  recipes).
- Native iOS app + WidgetKit extension. Engine ports straight from JS
  to Swift (mechanical).
- Cloudflare Pages deployment with a real domain.
