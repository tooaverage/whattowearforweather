// Inlines two icon dictionaries into standalone.html as a single HUG_ICONS
// JavaScript object: Hugeicons free (from scripts/hug-icons.json) and the
// Figma fashion-set selection (from scripts/figma-icons.json). Both maps are
// keyed by kebab-case strings (Figma keys are prefixed `fig-`). Idempotent —
// rewrites the block between the markers.

import fs from "node:fs";

const html = fs.readFileSync("standalone.html", "utf8");

const hugMap = JSON.parse(fs.readFileSync("scripts/hug-icons.json", "utf8"));
const figmaMap = fs.existsSync("scripts/figma-icons.json")
  ? JSON.parse(fs.readFileSync("scripts/figma-icons.json", "utf8"))
  : {};

const merged = { ...hugMap, ...figmaMap };

const lines = ["const HUG_ICONS = {"];
for (const [k, v] of Object.entries(merged)) {
  lines.push("  " + JSON.stringify(k) + ": " + JSON.stringify(v) + ",");
}
lines.push("};");

const startMarker = "// ::HUG_ICONS::start";
const endMarker = "// ::HUG_ICONS::end";
const block = `${startMarker}\n${lines.join("\n")}\n${endMarker}`;

const blockRe = /\/\/ ::HUG_ICONS::start[\s\S]*?\/\/ ::HUG_ICONS::end/;
let next;
if (blockRe.test(html)) {
  next = html.replace(blockRe, block);
} else {
  const idx = html.indexOf("const OM_ICONS = {");
  if (idx < 0) throw new Error("could not find OM_ICONS anchor");
  next = html.slice(0, idx) + block + "\n" + html.slice(idx);
}

fs.writeFileSync("standalone.html", next);
console.log(`Injected HUG_ICONS block with ${Object.keys(merged).length} entries (${Object.keys(hugMap).length} Hugeicons + ${Object.keys(figmaMap).length} Figma).`);
