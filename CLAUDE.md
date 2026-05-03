# CLAUDE.md

**NEVER use em dashes (—). Anywhere. Not in user-facing strings, not in
comments, not in commit messages, not in PR descriptions, not in docs. If
you are tempted to write an em dash, use a period, comma, colon,
parentheses, or rewrite the sentence. This rule has no exceptions.**

## House rules

- Single-file deploy. `standalone.html` is the production artifact; it is
  served via htmlpreview.github.io. No build step. Vanilla JS, hand-rolled
  CSS, dark theme, mobile-first.
- Vancouver-only for now. Hard-code `VANCOUVER` lat/lon/tz. Multi-location
  is a backlog item.
- The engine stays pure. No globals, no DOM access inside `recommend`,
  `apparentC`, `pickBand`, `summarizeArc`, `buildTimeline`,
  `buildDailySummaries`, or `buildTodayCells`.
- All thresholds live in `CFG`. Do not bury constants in code paths.
- Never call Open-Meteo with `forecast_days` above 16 (free-tier max).
- User strings are direct and short. No design jargon, no LLM flavour. If
  you can drop a word without losing meaning, drop it.
- The `src/` React app is no longer the production artifact and is allowed
  to drift behind `standalone.html`. Engine tests under `src/engine/` still
  run in CI.

## Backlog (not building yet)

- Cloud-cover-as-temperature-modifier
- Runs-cold / runs-warm baseline toggle (engine accepts `baseline`, no UI)
- Activity picker (engine accepts `activity`, no UI)
- Multi-location with geolocation prompt and search
- Personal calibration learned from feedback
