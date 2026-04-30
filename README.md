# whattowearforweather

One screen. Vancouver, BC. Glance, dress, leave.

The web equivalent of looking out the window — but it actually tells you what
to wear instead of just shouting a number at you.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # static bundle in ./dist
npm test         # 25 engine tests
```

Deploy the `dist/` folder to Cloudflare Pages (`npx wrangler pages deploy dist`,
or point a Pages project at this repo with build command `npm run build` and
output `dist`).

## How it decides what to wear

The engine is a pure function: `recommend(weatherInput, options) →
outfitRecommendation`. It lives in [`src/engine/`](src/engine/) with no React
imports and is unit-tested in isolation.

The decision flow:

1. **Compute apparent temperature** from the published formula appropriate to
   the conditions — see [`src/engine/apparent.ts`](src/engine/apparent.ts):
   - **NWS Heat Index** (Rothfusz regression of Steadman 1979) when air temp
     ≥ 26.7 °C / 80 °F. Includes the documented low- and high-humidity
     adjustments. Source:
     [NOAA WPC](https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml).
   - **NWS Wind Chill** (Osczevski/Bluestein 2001) when air temp ≤ 10 °C and
     wind > 4.8 km/h. Source:
     [NWS](https://www.weather.gov/safety/cold-wind-chill-chart).
   - **BOM Apparent Temperature** (Steadman 1994, no-radiation form) for the
     in-between range. Source:
     [BOM](http://www.bom.gov.au/info/thermal_stress/).

2. **Apply offsets** for body baseline (default `neutral` = 0 °C) and activity
   (default `walking_commute` = +1.5 °C, since a moderate walk generates ~3
   METs vs. ~1 MET for standing). The result is the *engine-effective
   temperature*.

3. **Pick a band** (hot / warm / mild / cool / cold / very_cold / freezing)
   from a config-driven threshold table. Each band has a base outfit recipe
   loosely modelled on REI's layering system
   ([REI](https://www.rei.com/learn/expert-advice/layering-basics.html)) and
   the clo-value tables in ISO 7730 / ASHRAE 55.

4. **Override the outer + accessories** based on:
   - sustained wind ≥ 16 km/h → wind shell
   - rain ≥ 40 % probability or ≥ 1 mm expected → waterproof shell
   - rain 10–40 % → carry an umbrella
   - UV ≥ 3 (WHO threshold) → sunglasses + brimmed hat; ≥ 6 → sunscreen
   - snowfall ≥ 0.5 cm → boots

5. **Compute a "bring with you" callout** when the apparent-temperature spread
   over the next 12 h either crosses a band boundary or exceeds 5 °C.

Every threshold is a number in
[`src/engine/config.ts`](src/engine/config.ts) with a comment citing the
source or the reasoning. None of them are hidden inside the logic.

## Architecture

```
src/
  engine/                 ← pure, no React, unit-tested
    apparent.ts           ← NWS HI, NWS WC, BOM AT
    config.ts             ← every threshold lives here
    recommend.ts          ← the public function
    types.ts              ← WeatherInput / OutfitRecommendation
  weather/                ← provider adapters
    types.ts              ← WeatherProvider interface, location
    openMeteo.ts          ← Open-Meteo implementation
  ui/                     ← React components — consume the engine
```

Why this shape:

- The **engine** is a pure module. Swap UIs, stay metric, never depend on
  React. It returns *rationale strings* alongside the recommendation so the UI
  can explain itself without re-deriving anything.
- The **provider** sits behind a `WeatherProvider` interface. Replace
  Open-Meteo with anything else by writing a new adapter; the engine never
  knows.
- All thresholds live in `config.ts`. Personal calibration (when it lands) is
  just a `Config` override or a `baseline` / `activity` option — no engine
  changes needed.

## Adding personalisation later

The plumbing is already in place:

- `recommend(input, { baseline, activity, config })` accepts overrides today.
  Persist a chosen `baseline` (`neutral` / `runs_cold` / `runs_warm`) in
  localStorage for v1.5; pull it from a user record once auth lands.
- The output `rationale` string array is what a "rate this outfit" feedback
  loop should rate against — you'd log `(weatherInput, rec, rating)` triples
  and learn an offset per user, then plug it into `config.baselineOffsets`.
- A wardrobe layer goes between the engine and the UI: take the engine's
  abstract "insulated jacket" and resolve it to a specific item the user
  owns. The engine output deliberately uses garment archetypes, not branded
  items, so this layer is straightforward to add.
- Multi-location: change `VANCOUVER` in
  [`src/weather/types.ts`](src/weather/types.ts) — locations are already
  typed as `Location` objects.

## Assumptions and known weak spots

These are the places where the research was thin or where the engine is
making a judgement call. Each one is a knob you may want to turn.

- **Activity is hard-coded to "walking commute".** The engine accepts an
  `activity` option but the UI doesn't expose it. Running, biking, and
  standing-around all generate very different metabolic heat; the +1.5 °C
  offset is a compromise that errs slightly toward "walk" over "stand".
- **Cloud cover and direct-sun exposure are not used as a temperature
  modifier.** The PRD asks for this, but no published formula maps cloud %
  → effective °C without measuring mean radiant temperature, which we don't
  have. Cloud cover is reflected indirectly via UV index, which already
  drops in overcast conditions. Listed as a v2 candidate.
- **Body baseline is `neutral`** in the UI. The hooks are wired so flipping a
  setting becomes trivial, but until we have data the safest default is the
  one closest to clo-value tables.
- **Layer recipes are archetypes**, not specific garments. "Insulated
  jacket" is intentionally vague.
- **Bring-a-layer threshold is 5 °C**, picked as a clo-step rule of thumb.
  Sensitivity to this is low for users who already see the band-crossing
  callout (which fires more often).
- **Snow handling is minimal.** Vancouver rarely sees enough to matter; the
  engine adds boots above 0.5 cm but doesn't change the outer beyond the
  wind/rain rules.
- **Open-Meteo apparent_temperature is ignored** — we compute our own to
  keep the formula explainable. Open-Meteo's value is internally a Steadman
  universal-AT calculation; the values usually agree within ~1 °C.

## What's not here (intentional, per PRD)

No accounts, no profiles. No wardrobe upload. No outfit ratings. No multi-city
support. No LLM-flavoured copy. No push notifications. No analytics. The
engine is rules-based and explainable on purpose.

## Testing

```sh
npm test
```

25 tests cover the three apparent-temperature formulas (with reference values
from the published NWS charts and BOM hand-calculations), band selection,
overrides for wind / rain / UV / snow, the bring-a-layer logic, and the body
baseline offsets.

## Sources

- NOAA WPC, "The Heat Index Equation": <https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml>
- NWS, "Cold and Wind Chill": <https://www.weather.gov/safety/cold-wind-chill-chart>
- BOM (Australia), "Thermal comfort observations": <http://www.bom.gov.au/info/thermal_stress/>
- Steadman, R. G. (1994). "Norms of apparent temperature in Australia": <http://www.bom.gov.au/jshess/docs/1994/steadman.pdf>
- REI, "Layering basics": <https://www.rei.com/learn/expert-advice/layering-basics.html>
- WHO, "UV Index and sun protection": <https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index>
- Open-Meteo Forecast API: <https://open-meteo.com/en/docs>
