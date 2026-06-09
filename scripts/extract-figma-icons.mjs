// Extract Figma fashion-set SVGs into a JS map keyed by kebab-case names.
// Source: icons/figma/weatherclothingicons/. Reads the chosen file per
// garment, normalizes to a stroke-color-aware inline SVG (replaces
// fill="black" with fill="currentColor", drops width/height attrs from the
// root tag, adds aria-hidden), and writes scripts/figma-icons.json.
//
// To add a new garment: append to MANIFEST below, point to a relative path
// inside icons/figma/weatherclothingicons/.

import fs from "node:fs";
import path from "node:path";

const SRC = "icons/figma/weatherclothingicons";

// kebab-case key : path relative to SRC. One representative SVG per garment.
const MANIFEST = {
  // Tops
  "fig-t-shirt": "t-shirt.svg",
  "fig-shirt": "shirt.svg",
  "fig-blouse": "blouse-.svg",
  "fig-loose-blouse": "cardigansandlongsleeve/loose-fitting-blouse-.svg",
  "fig-long-sleeve": "cardigansandlongsleeve/longsleeve.svg",

  // Mid layers
  "fig-cardigan": "cardigansandlongsleeve/cardigan- (1).svg",
  "fig-sweater": "midlayer/sweater-.svg",
  "fig-pullover": "midlayer/pullover-.svg",
  "fig-gilet": "cardigansandlongsleeve/gilet.svg",

  // Outer layers
  "fig-hoodie": "jackets/hoodie.svg",
  "fig-jacket": "jackets/jacket (2).svg",
  "fig-coat": "jackets/coat.svg",
  "fig-parka": "jackets/parka.svg",
  "fig-trench-coat": "jackets/trench-coat- (1).svg",
  "fig-puffer-jacket": "jackets/down-jacket (1).svg",
  "fig-duffle-coat": "jackets/duffle-coat- (1).svg",
  "fig-faux-fur-coat": "jackets/faux-fur-coat- (1).svg",
  "fig-fur-coat": "jackets/fur-coat- (1).svg",
  "fig-sheepskin-coat": "jackets/sheepskin-coat-.svg",
  "fig-leather-jacket": "cardigansandlongsleeve/leather-jacket- (1).svg",
  "fig-anorak": "jackets/anorak- (1).svg",
  "fig-raincoat": "midlayer/a-raincoat-.svg",
  "fig-windbreaker": "midlayer/windbreaker- (1).svg",

  // Bottoms
  "fig-shorts": "shorts/shorts- (9).svg",
  "fig-trunks": "shorts/trunks- (1).svg",
  "fig-pants": "jeans/pants.svg",
  "fig-jeans": "jeans/jeans.svg",
  "fig-skinny-jeans": "jeans/skinny-jeans- (1).svg",
  "fig-leggings": "jeans/leggings- (1).svg",
  "fig-jeggings": "jeans/jeggings- (1).svg",
  "fig-joggers": "jeans/joggers- (1).svg",
  "fig-skirt": "skirts/skirt.svg",

  // Dresses
  "fig-dress": "dresses/dress.svg",
  "fig-sundress": "dresses/sundress.svg",
  "fig-cocktail-dress": "dresses/cocktail-dress.svg",
  "fig-wrap-dress": "dresses/wrap-dress- (1).svg",
  "fig-tracksuit": "dresses/a-tracksuit- (1).svg",
  "fig-fitness-suit": "cardigansandlongsleeve/fitness-suit-.svg",
  "fig-jogging-suit": "cardigansandlongsleeve/jogging-suit-.svg",

  // Hats
  "fig-hat": "midlayer/tops/toquesandhats/hat.svg",
  "fig-cap": "midlayer/tops/toquesandhats/cap.svg",
  "fig-beanie": "midlayer/tops/toquesandhats/beanie-1.svg",
  "fig-baseball-cap": "midlayer/tops/toquesandhats/baseball-cap.svg",

  // Accessories
  "fig-gloves": "gloves.svg",
  "fig-mittens": "mittens-.svg",
  "fig-scarf": "scarf.svg",
  "fig-socks": "socks.svg",
  // Gemini-generated additions in the same line style. The "umbrella"
  // key (no fig- prefix) intentionally matches the existing Hugeicons
  // key in standalone.html so every ic: "umbrella" reference picks up
  // the new art without code changes.
  "umbrella": "umbrella.svg",
  "brimmed-hat": "brimmed-hat.svg",
  "sunscreen": "sunscreen.svg",
};

function normalize(svgText) {
  let s = svgText
    // Drop XML declaration if any.
    .replace(/^\s*<\?xml[^>]*\?>\s*/i, "")
    // Strip leading/trailing whitespace.
    .trim();

  // Drop width/height on root <svg> so CSS controls size.
  s = s.replace(/<svg([^>]*?)\s+width="[^"]*"/, "<svg$1");
  s = s.replace(/<svg([^>]*?)\s+height="[^"]*"/, "<svg$1");

  // Make fills inherit current color so dark/light mode + band colors work.
  s = s.replace(/fill="black"/g, 'fill="currentColor"');
  s = s.replace(/fill="#000000"/gi, 'fill="currentColor"');
  s = s.replace(/fill="#000"/gi, 'fill="currentColor"');

  // Add aria-hidden + focusable on root svg (idempotent).
  if (!/aria-hidden=/.test(s)) {
    s = s.replace(/<svg/, '<svg aria-hidden="true" focusable="false"');
  }

  // Collapse runs of whitespace.
  s = s.replace(/\s+/g, " ").replace(/>\s+</g, "><");
  return s;
}

const out = {};
const missing = [];

for (const [key, rel] of Object.entries(MANIFEST)) {
  const p = path.join(SRC, rel);
  if (!fs.existsSync(p)) {
    missing.push(`${key} -> ${rel}`);
    continue;
  }
  const raw = fs.readFileSync(p, "utf8");
  out[key] = normalize(raw);
}

if (missing.length) {
  console.error("Missing files:");
  for (const m of missing) console.error("  " + m);
  process.exit(1);
}

fs.mkdirSync("scripts", { recursive: true });
fs.writeFileSync("scripts/figma-icons.json", JSON.stringify(out, null, 2));
console.log(`Wrote ${Object.keys(out).length} Figma icons to scripts/figma-icons.json`);
