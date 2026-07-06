/* ============================================================================
   When To Go: hero image generator (Nano Banana Pro / Gemini 3 Pro Image).

   Generates one vintage travel-brochure illustration per country and saves it
   to images/<slug>.jpg. gen.js drops the image into the top of each country
   page automatically when the file exists, so the flow is:

     GEMINI_API_KEY=xxx node gen-images.js      # make any missing images
     node gen.js                                # rebuild pages with them
     git add images country && git commit ...

   Every image uses the SAME locked style prompt, so the set stays cohesive.
   Only the subject (the country and a landmark or two) changes.

   Flags:
     --force            regenerate even if the image already exists
     --only=japan,italy limit to these slugs
     --dry-run          print the prompts, call nothing
     --limit=5          stop after N images (handy for a first test run)

   Env:
     GEMINI_API_KEY     required (unless --dry-run)
     NANO_MODEL         model id, default gemini-3-pro-image-preview
     NANO_ASPECT        aspect ratio, default 16:9
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const { CONTENT } = require('./content.js');

const args = process.argv.slice(2);
const has = f => args.includes(f);
const val = k => { const a = args.find(x => x.startsWith(k + '=')); return a ? a.split('=')[1] : null; };
const FORCE = has('--force');
const DRY = has('--dry-run');
const ONLY = (val('--only') || '').split(',').filter(Boolean);
const LIMIT = parseInt(val('--limit') || '0', 10);
const MODEL = process.env.NANO_MODEL || 'gemini-3-pro-image-preview';
const ASPECT = process.env.NANO_ASPECT || '16:9';
const KEY = process.env.GEMINI_API_KEY;
const OUTDIR = 'images';

// The one shared style. Change it here and every regenerated image follows.
const STYLE =
  'Vintage 1950s to 1960s travel brochure cover illustration. Flat mid-century ' +
  'screen-print poster art, hand-drawn, bold simple shapes, visible paper grain ' +
  'and slight off-register printing. Warm limited palette only: cream paper, ' +
  'deep teal, muted terracotta red, mustard yellow, ink brown. Confident, calm, ' +
  'elegant, editorial. No text, no words, no letters, no captions, no borders, ' +
  'no frame, no people posing for camera. Wide landscape composition.';

// Iconic, illustratable subjects for the marquee countries. Anything not listed
// falls back to a generic prompt built from the hub city and country name.
const SUBJECTS = {
  japan: 'Mount Fuji behind cherry blossoms and a red pagoda',
  italy: 'the Colosseum and Tuscan cypress hills under a warm sky',
  france: 'the Eiffel Tower over Paris rooftops and a cafe street',
  spain: 'a sun-baked plaza with Moorish arches and orange trees',
  greece: 'white Cycladic houses and blue domes above the Aegean sea',
  portugal: 'Lisbon trams climbing pastel tiled hills to the river',
  usa: 'a national-park canyon and a classic road under big sky',
  canada: 'Rocky Mountain peaks above a turquoise lake and pines',
  uk: 'Big Ben and London rooftops in soft rain light',
  germany: 'a Bavarian castle above forested Alpine foothills',
  mexico: 'a Mayan pyramid among palms above a turquoise coast',
  iceland: 'a waterfall and volcanic peaks under northern lights',
  thailand: 'longtail boats below limestone karst cliffs and temples',
  peru: 'Machu Picchu terraces among steep green Andean peaks',
  australia: 'the Sydney Opera House and harbour under bright sun',
  'new-zealand': 'a fjord with steep green cliffs and a lone peak',
  indonesia: 'Bali rice terraces and a temple gate above the sea',
  vietnam: 'junk boats among the karst islands of Ha Long Bay',
  india: 'the Taj Marble palace at dawn with reflecting pools',
  brazil: 'Rio, Sugarloaf Mountain and the Christ statue over the bay',
  morocco: 'a Marrakech medina, minaret and palms against desert hills',
  turkey: 'Istanbul domes and minarets above the Bosphorus at dusk',
  egypt: 'the pyramids and a felucca sail on the Nile',
  maldives: 'overwater cabins on a turquoise atoll ringed by reef',
  norway: 'a deep fjord between snow-streaked cliffs and a red cabin',
  switzerland: 'the Matterhorn above an Alpine meadow and chalet',
  croatia: 'the red-roofed walled city of Dubrovnik on the Adriatic',
  kenya: 'acacia trees and elephants on a savanna at golden hour',
  'south-africa': 'Cape Town under Table Mountain above the coast',
  china: 'the Great Wall winding over misty green mountains',
};

function subjectFor(c) {
  return SUBJECTS[c.slug] || ('the iconic landmarks and landscape of ' + c.hub.city + ', ' + c.name);
}
function promptFor(c) {
  return STYLE + ' Subject: ' + subjectFor(c) + '.';
}

async function generate(c) {
  const prompt = promptFor(c);
  if (DRY) { console.log('\n[' + c.slug + ']\n' + prompt); return 'dry'; }
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent';
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: ASPECT } },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (await res.text()).slice(0, 400));
  const json = await res.json();
  const parts = (((json.candidates || [])[0] || {}).content || {}).parts || [];
  const img = parts.find(p => p.inlineData || p.inline_data);
  if (!img) throw new Error('no image in response: ' + JSON.stringify(json).slice(0, 400));
  const data = (img.inlineData || img.inline_data).data;
  const buf = Buffer.from(data, 'base64');
  const out = path.join(OUTDIR, c.slug + '.jpg');
  fs.writeFileSync(out, buf);
  // Optional: shrink with sharp if it is installed, else leave the raw file.
  try {
    const sharp = require('sharp');
    const small = await sharp(buf).resize(1200, null, { withoutEnlargement: true }).jpeg({ quality: 72, mozjpeg: true }).toBuffer();
    fs.writeFileSync(out, small);
  } catch (e) { /* sharp not installed: keep the raw image */ }
  return Math.round(fs.statSync(out).size / 1024) + 'kb';
}

async function main() {
  if (!DRY && !KEY) { console.error('Set GEMINI_API_KEY (or pass --dry-run to preview prompts).'); process.exit(1); }
  fs.mkdirSync(OUTDIR, { recursive: true });
  let list = CONTENT.filter(c => !ONLY.length || ONLY.includes(c.slug));
  list = list.filter(c => FORCE || DRY || !['jpg', 'webp', 'png'].some(e => fs.existsSync(path.join(OUTDIR, c.slug + '.' + e))));
  if (LIMIT) list = list.slice(0, LIMIT);
  console.log((DRY ? 'Prompts for ' : 'Generating ') + list.length + ' image(s) with ' + MODEL + ' at ' + ASPECT + '.');
  let ok = 0, fail = 0;
  for (const c of list) {
    try { const r = await generate(c); if (!DRY) console.log('  ' + c.slug + ' -> ' + r); ok++; }
    catch (e) { console.error('  ' + c.slug + ' FAILED: ' + e.message); fail++; }
  }
  if (!DRY) console.log('Done. ' + ok + ' ok, ' + fail + ' failed. Now run: node gen.js');
}
main();
