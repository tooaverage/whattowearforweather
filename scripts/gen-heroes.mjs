// One-shot hero-image generator using Google's Nano Banana Pro
// (Gemini 3 Pro Image). Generates one editorial weather banner per
// band and writes them to heroes/<band>.webp (PNG bytes saved with a
// .webp-friendly pipeline is overkill here; we save .png and the app
// references .png).
//
// Usage:
//   GEMINI_API_KEY=xxxx node scripts/gen-heroes.mjs
//   GEMINI_API_KEY=xxxx node scripts/gen-heroes.mjs warm cool   (subset)
//
// The model id can be overridden if Google renames it:
//   GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
//
// Output: heroes/<band>.png . Re-run any time to refresh. This is a
// dev-time tool; the deployed standalone.html only references the
// finished image files, it never calls the API at runtime.

import fs from "node:fs";
import path from "node:path";

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview";
if (!KEY) {
  console.error("Set GEMINI_API_KEY in the environment first.");
  process.exit(1);
}

// Shared style so all nine banners feel like one set. Vancouver coastal
// setting, editorial muted palette to sit under dark text, wide banner
// crop with calm negative space up top for legibility.
const STYLE =
  "Editorial travel-magazine illustration of a Vancouver coastal scene " +
  "(ocean, conifers, North Shore mountains). Muted earthy palette: warm " +
  "paper tones, soft ink, a single rust-orange accent. Painterly, calm, " +
  "minimal. Wide cinematic banner, lots of quiet sky at the top, no text, " +
  "no people in the foreground, no logos.";

// One evocative weather line per band. Warmest to coldest.
const BANDS = {
  scorching: "A blazing, cloudless heatwave afternoon, heat shimmer over the water, hard bright sun.",
  hot: "A hot clear summer day, deep blue sky, brilliant sunshine on the bay.",
  warm: "A pleasant warm day, soft golden sun, a few drifting clouds, gentle sea breeze.",
  mild: "A mild changeable spring day, scattered clouds, fresh green light.",
  cool: "A cool overcast day, flat grey sky, crisp clear air over the inlet.",
  chilly: "A chilly damp grey day, low cloud on the mountains, bare branches.",
  cold: "A cold bright winter day, frost on the ground, long low sun, breath-in-the-air clarity.",
  very_cold: "A freezing day with light snow falling, muted blue dusk, snow dusting the firs.",
  freezing: "A deep-freeze scene, heavy snow and ice, white-out mountains, still and silent.",
};

async function genOne(band, promptLine) {
  const prompt = `${STYLE}\n\nScene: ${promptLine}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["Image"],
      imageConfig: { aspectRatio: "16:9" },
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${band}: HTTP ${res.status} ${txt.slice(0, 300)}`);
  }
  const json = await res.json();
  const parts = json.candidates?.[0]?.content?.parts || [];
  const img = parts.find(p => p.inlineData && p.inlineData.data);
  if (!img) {
    throw new Error(`${band}: no image in response ${JSON.stringify(json).slice(0, 300)}`);
  }
  const buf = Buffer.from(img.inlineData.data, "base64");
  const out = path.join("heroes", `${band}.png`);
  fs.writeFileSync(out, buf);
  console.log(`wrote ${out} (${(buf.length / 1024).toFixed(0)} KB)`);
}

const wanted = process.argv.slice(2);
const targets = wanted.length ? wanted : Object.keys(BANDS);
fs.mkdirSync("heroes", { recursive: true });

for (const band of targets) {
  if (!BANDS[band]) { console.error(`unknown band: ${band}`); continue; }
  try {
    await genOne(band, BANDS[band]);
  } catch (e) {
    console.error("FAILED", e.message);
  }
}
console.log("done");
