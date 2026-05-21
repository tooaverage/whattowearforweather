# Calibration log

Field observations of what people are actually wearing vs. what the app
computed. Goal: check the recipe accuracy against real-world consensus
over a week or two, in Vancouver, BC unless noted.

## How to read this

- **Observed**: the general consensus of what people outside are wearing.
- **Air**: air temperature shown in the app.
- **Feels (for you)**: the app's personalized effective temp.
- **App said**: the band + outfit the app recommended at that time.
- **Verdict**: `match` / `app too warm` (app under-dressed people) /
  `app too cold` (app over-dressed people).

For each entry, the air temp and feels-like come from the app's hero at
the moment of observation (screenshot or typed). The session here can't
fetch live weather, so those readings come from you.

## Entries

### 2025 (week 1)

| # | Date | Time | Loc | Observed consensus | Air | Feels (for you) | App said | Verdict | Notes |
|---|------|------|-----|--------------------|-----|-----------------|----------|---------|-------|
| 1 | (today) | 14:20 PT | Vancouver | Pants + T-shirt | 20° | 20° | WARM: T-shirt + pants + sneakers | **top: match; bottom: app too cold** | You went out in pants + tee, too hot, switched to shorts. App recommends pants; you + consensus lean shorts on a sunny 20°. |
| 2 | (today) | 14:50 PT | Vancouver | (self) T-shirt + shorts + light vest | 20° | 20° | WARM: T-shirt + pants + sneakers | **app too cold (activity + sun confounded)** | Walking fast w/ backpack, arrived sweating. UV 7 clear sky + brisk pace + pack + vest. Top rec (tee) is already minimum, so the rec isn't wrong; the heat is exertion + radiant sun. |

Conditions for both: ~20° air, 60% humidity, 11 km/h wind, UV 7, 1% rain, sunny/clear. Day high 20° at 3pm, low 15° at 10pm.

## Running takeaways

- **Shorts threshold may be too high.** At 20° WARM + sunny, the app
  recommends pants but the user and consensus lean shorts. Candidate
  fix later: let shorts appear in the warm band (currently they likely
  start at hot/24+). Need 2-3 more sunny-warm-day data points before
  touching the recipe.
- **Sun + activity are unmodeled in the displayed "feels."** On a clear
  UV-7 day with brisk movement, real perceived heat runs well above the
  ambient-based "feels for you." Engine has an activity offset (not
  surfaced as a loud control) and cloudAdj, but the default standing/
  walking baseline under-predicts heat for active users. Watch whether
  this recurs.
