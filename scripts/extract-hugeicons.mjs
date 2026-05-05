// One-shot extraction script. Reads the @hugeicons/core-free-icons npm
// package (MIT) and produces a JSON object mapping kebab-case icon name to
// inline SVG markup. Output is meant to be copy-pasted into standalone.html
// as the HUG_ICONS const. Stays a dev-time tool, not part of any runtime.

import fs from "node:fs";
import path from "node:path";

// kebab-case name : Hugeicons module export name (PascalCase + "Icon")
const WANTED = {
  "t-shirt": "TShirtIcon",
  "tank-top": "TankTopIcon",
  "shirt-01": "Shirt01Icon",
  "long-sleeve-shirt": "LongSleeveShirtIcon",
  "hoodie": "HoodieIcon",
  "cardigan": "CardiganIcon",
  "vest": "VestIcon",
  "shorts-pants": "ShortsPantsIcon",
  "dress-01": "Dress01Icon",
  "dress-04": "Dress04Icon",
  "sandals": "SandalsIcon",
  "high-heels-01": "HighHeels01Icon",
  "running-shoes": "RunningShoesIcon",
  "armored-boot": "ArmoredBootIcon",
  "umbrella": "UmbrellaIcon",
  "sunglasses": "SunglassesIcon",
  "hat": "HatIcon",
  "cap": "CapIcon",
  "glove": "GloveIcon",
  "socks": "SocksIcon",
  "tie": "TieIcon",
  "bow-tie": "BowTieIcon",
  "suit-01": "Suit01Icon",
};

function attrsToString(props) {
  const parts = [];
  for (const [k, v] of Object.entries(props)) {
    if (k === "key") continue;
    // Hugeicons uses React-style camelCase prop names; convert to SVG kebab-case.
    const attr = k
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^stroke-linecap$/, "stroke-linecap")
      .replace(/^stroke-linejoin$/, "stroke-linejoin")
      .replace(/^stroke-width$/, "stroke-width");
    parts.push(`${attr}="${String(v).replace(/"/g, "&quot;")}"`);
  }
  return parts.join(" ");
}

function tupleToSvg(tuples) {
  const inner = tuples
    .map(([tag, props]) => `<${tag} ${attrsToString(props)} />`)
    .join("");
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${inner}</svg>`;
}

const out = {};
const esmDir = path.resolve("node_modules/@hugeicons/core-free-icons/dist/esm");
const missing = [];

for (const [kebab, mod] of Object.entries(WANTED)) {
  const file = path.join(esmDir, `${mod}.js`);
  if (!fs.existsSync(file)) {
    missing.push(`${kebab} -> ${mod}`);
    continue;
  }
  const src = fs.readFileSync(file, "utf8");
  // Module shape: const Foo = [["path", { d: "...", ... }], ["path", {...}]];
  const m = src.match(/const\s+\w+\s*=\s*\/\*#__PURE__\*\/\s*(\[[\s\S]*?\]);\s*\n\s*export/);
  if (!m) {
    missing.push(`${kebab}: regex did not match`);
    continue;
  }
  // The tuple array uses bare keys like d, stroke, key. JSON.parse can't
  // eat that, so eval in a tiny sandbox via Function.
  let tuples;
  try {
    tuples = Function(`"use strict"; return (${m[1]});`)();
  } catch (e) {
    missing.push(`${kebab}: parse error ${e.message}`);
    continue;
  }
  out[kebab] = tupleToSvg(tuples);
}

if (missing.length) {
  console.error("Missing or unparseable:", missing);
}

fs.writeFileSync("scripts/hug-icons.json", JSON.stringify(out, null, 2));
console.log(`Wrote ${Object.keys(out).length} icons to scripts/hug-icons.json`);
