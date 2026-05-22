# Hero banners

Generated weather banners shown at the top of the Today hero, one per
band. Produced by `scripts/gen-heroes.mjs` using Nano Banana Pro
(Gemini 3 Pro Image). The deployed `standalone.html` only references the
finished `.png` files; it never calls the image API at runtime.

## Generate

```
GEMINI_API_KEY=your_key node scripts/gen-heroes.mjs
```

Writes `heroes/<band>.png` for all nine bands (scorching, hot, warm,
mild, cool, chilly, cold, very_cold, freezing). Pass band names to
regenerate a subset:

```
GEMINI_API_KEY=your_key node scripts/gen-heroes.mjs warm cool
```

## Wiring

- `standalone.html` references `HERO_IMG_BASE/<band>.png` (raw GitHub).
  If a file is missing, the banner removes itself, so the app works
  before any images exist.
- `img-src` in the page CSP allows `raw.githubusercontent.com`.
- If the repo/branch moves, update `HERO_IMG_BASE` in `standalone.html`.
