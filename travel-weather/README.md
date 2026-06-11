# When To Go

An interactive world map that shows, by color, when each country is good to visit.
Pick a month and the map paints every country from red (avoid) through amber
(shoulder) to green (ideal). Tap a country to see its full year arc and the best
months to go.

This is a standalone project. It shares nothing with the rest of this repo and
is meant to be lifted into its own repo later.

## Run it

Open `index.html` in any browser. No build, no server, no keys.

- `index.html` is the whole app: HTML, CSS, data and engine in one file.
- The world map geometry is fetched at runtime from a CDN (world-atlas). If that
  fetch is blocked, the app falls back to the Grid view, which shows every
  country and every month and works fully offline from the embedded data.

## How scores work

Each country uses climate normals (average high, average low, monthly rainfall)
for one representative hub city, shown in the detail panel. The engine blends
three things into a 0 to 100 comfort score per month:

- daytime high temperature, with an ideal band around 21 to 27 C
- overnight chill, penalized when nights get cold
- monthly rainfall, penalized as it climbs

All thresholds live in the `CFG` block. The scoring functions are pure: no DOM,
no globals, no network. `engine.js` and `data.js` are the same logic and data
broken out for the Node sanity check; `index.html` inlines its own copy so it
stays a true single file.

This is a planning guide based on long-run averages, not a forecast.

## Backlog

- Embed the map geometry so there is no runtime fetch at all
- More countries, and sub-country regions for large or varied countries
- Pull live climate normals from an API instead of hand-curated data
- Filters: beach vs city vs hiking, tolerance for heat or rain
- Shareable links that open on a chosen month and country
