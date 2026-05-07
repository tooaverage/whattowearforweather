// One-shot. Strips the multi-style scaffolding (switcher + directions B
// and C) and promotes Direction A to the canonical design by removing
// the [data-style="a"] selector prefix from its rules. Output is the
// updated standalone.html. Idempotent only the first time.

import fs from "node:fs";

const PATH = "standalone.html";
let html = fs.readFileSync(PATH, "utf8");

// 1. Pull out the multi-style CSS block that we control. It runs from
//    the "Design preview switcher" comment to before the closing </style>.
const startMarker = "  /* ===== Design preview switcher ===== */";
const endMarker = "</style>";
const startIdx = html.indexOf(startMarker);
if (startIdx < 0) throw new Error("could not find start marker");
const endIdx = html.indexOf(endMarker, startIdx);
if (endIdx < 0) throw new Error("could not find </style>");

const before = html.slice(0, startIdx);
const block = html.slice(startIdx, endIdx);
const after = html.slice(endIdx);

// 2. Inside the block, keep only the Direction A rules. Drop the
//    switcher CSS and the [data-style="b"] and [data-style="c"] blocks.
const aStart = block.indexOf("/* ===== Direction A");
const bStart = block.indexOf("/* ===== Direction B");
if (aStart < 0 || bStart < 0) throw new Error("could not find direction markers");
const heroBlocks = block.slice(0, aStart).match(/\/\* New hero blocks[^*]*\*\/[\s\S]*?(?=\/\* ===== Direction A)/);
const aBlock = block.slice(aStart, bStart);

// 3. Strip the [data-style="a"] selector prefix from every rule. Also
//    convert [data-style="a"][data-theme="dark"] to [data-theme="dark"]
//    so dark mode handling carries over.
let promoted = aBlock
  .replace(/\[data-style="a"\]\[data-theme="dark"\], \[data-style="a"\]\[data-theme="dark"\] body/g,
           '[data-theme="dark"], [data-theme="dark"] body')
  .replace(/\[data-style="a"\]\[data-theme="dark"\]/g, '[data-theme="dark"]')
  .replace(/\[data-style="a"\] body, \[data-style="a"\] /g, 'body, html ')
  .replace(/\[data-style="a"\] body/g, 'body')
  .replace(/\[data-style="a"\] /g, '')
  .replace(/\[data-style="a"\] /g, '')
  .replace(/\[data-style="a"\]/g, '');

// 4. Reset the comment header to reflect the new identity.
promoted = promoted.replace(/\/\* ===== Direction A: Editorial weather magazine ===== \*\//,
  '/* ===== Editorial design (paper, ink, rust accent, condensed display type) ===== */');

// 5. The hero-outfit-name and hero-stats default-hidden rules are no
//    longer needed because there are no other directions; A wants them
//    visible. Skip the heroBlocks fragment by not including it.

const newBlock = promoted + "\n";
const next = before + newBlock + after;
fs.writeFileSync(PATH, next);
console.log("promoted Direction A. Removed switcher + directions B and C.");
console.log("Old block size:", block.length, "New:", newBlock.length);
