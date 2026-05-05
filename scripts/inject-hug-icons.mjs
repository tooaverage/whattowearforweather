// Injects scripts/hug-icons-inline.js into standalone.html, just before the
// existing `const OM_ICONS = {` line. Idempotent — replaces an existing
// HUG_ICONS block if present.

import fs from "node:fs";

const html = fs.readFileSync("standalone.html", "utf8");
const inline = fs.readFileSync("scripts/hug-icons-inline.js", "utf8").trim();

const startMarker = "// ::HUG_ICONS::start";
const endMarker = "// ::HUG_ICONS::end";

const block = `${startMarker}\n${inline}\n${endMarker}`;

let next;
const blockRe = /\/\/ ::HUG_ICONS::start[\s\S]*?\/\/ ::HUG_ICONS::end/;
if (blockRe.test(html)) {
  next = html.replace(blockRe, block);
} else {
  // Insert immediately before `const OM_ICONS = {`
  const idx = html.indexOf("const OM_ICONS = {");
  if (idx < 0) throw new Error("could not find OM_ICONS anchor");
  next = html.slice(0, idx) + block + "\n" + html.slice(idx);
}

fs.writeFileSync("standalone.html", next);
console.log("Injected HUG_ICONS block.");
