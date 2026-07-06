/* ============================================================================
   When To Go: static page generator.
   Builds country/<slug>/index.html for each entry in content.js, using the
   shared design system. The data-driven parts (month strip, table, season
   ranges, hazards, quick stats, deep-link months) are computed from the
   climate data and engine; the prose, regions, highlights and FAQ come from
   content.js so every page is unique, not a thin template.
   Run: node gen.js
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const { DATA } = require('./data.js');
const { score, band, monthTags, seasonOf, rangeText, CFG } = require('./engine.js');
const { CONTENT } = require('./content.js');

const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONF = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const byIso = new Map(DATA.map(d => [d.iso, d]));
const f = n => (n * 9 / 5 + 32).toFixed(0); // C to F

function describe(rec, m, tags) {
  const hi = rec.hi[m], pr = rec.pr[m];
  const t = hi >= 34 ? 'Very hot' : hi >= 29 ? 'Hot' : hi >= 23 ? 'Warm' : hi >= 17 ? 'Mild' : hi >= 10 ? 'Cool' : hi >= 3 ? 'Cold' : 'Freezing';
  const r = pr >= 220 ? 'and very wet' : pr >= 120 ? 'and wet' : pr >= 55 ? 'with a little rain' : 'and dry';
  let s = '.';
  if (tags.some(x => x.key === 'storm')) s = ', storm season.';
  else if (tags.some(x => x.key === 'monsoon')) s = ', monsoon rains.';
  return t + ' ' + r + s;
}

function compute(rec) {
  const months = rec.hi.map((_, m) => {
    const s = score(rec, m);
    const b = band(s);
    const tags = monthTags(rec, m);
    return { m, s, key: b.key, label: b.label, tags, note: describe(rec, m, tags) };
  });
  const high = [], shoulder = [], low = [];
  for (let m = 0; m < 12; m++) {
    const k = seasonOf(rec, m).key;
    (k === 'high' ? high : k === 'low' ? low : shoulder).push(m);
  }
  // Top scoring great/ideal months for hotel deep links, in calendar order.
  const deep = months.filter(x => x.key === 'ideal' || x.key === 'great')
    .sort((a, b2) => b2.s - a.s).slice(0, 3).map(x => x.m).sort((a, b2) => a - b2);
  // Quick stats
  const best = months.slice().sort((a, b2) => b2.s - a.s)[0].m;
  const warm = rec.hi.indexOf(Math.max(...rec.hi));
  const wet = rec.pr.indexOf(Math.max(...rec.pr));
  const cold = rec.lo.indexOf(Math.min(...rec.lo));
  // Hazard ranges
  const ms = (test) => { const a = []; for (let m = 0; m < 12; m++) if (test(m)) a.push(m); return a; };
  const haz = [];
  if (rec.storm) haz.push(['storm', rec.storm.type + ' season', rangeText(rec.storm.mo)]);
  const rainy = ms(m => rec.pr[m] >= CFG.wetMm);
  if (rainy.length) haz.push(['rain', 'Rainy season', rangeText(rainy)]);
  const heat = ms(m => rec.hi[m] >= CFG.heatHi);
  if (heat.length) haz.push(['heat', 'Extreme heat', rangeText(heat)]);
  const coldm = ms(m => rec.hi[m] <= CFG.coldHiMax || rec.lo[m] <= CFG.coldLoMax);
  if (coldm.length) haz.push(['cold', 'Hard cold', rangeText(coldm)]);
  return { months, high, shoulder, low, deep, best, warm, wet, cold, haz };
}

const cssVar = { ideal: 'var(--s-ideal)', great: 'var(--s-great)', good: 'var(--s-good)', fair: 'var(--s-fair)', avoid: 'var(--s-avoid)' };
const darkText = k => (k === 'ideal' || k === 'avoid');
const MK_ICON = { bloom: 'flower-2', leaf: 'leaf', snow: 'snowflake', sun: 'sun', fest: 'party-popper', grape: 'grape', fish: 'fish', sparkles: 'sparkles' };

function strip(D, markers) {
  const mk = {};
  (markers || []).forEach(x => { mk[MON.indexOf(x.mon)] = x.kind; });
  return '<div class="strip" aria-label="weather rating by month">' + D.months.map(x => {
    const peak = D.high.indexOf(x.m) !== -1;
    const marker = mk[x.m] ? '<span class="mk ' + mk[x.m] + '"><i data-lucide="' + MK_ICON[mk[x.m]] + '" class="ic"></i></span>' : '';
    const col = darkText(x.key) ? ' style="color:#fff"' : '';
    return '<div class="mo"><div class="tile' + (peak ? ' peak' : '') + '" style="background:' + cssVar[x.key] + '">'
      + marker + '<span class="sc"' + col + '>' + x.s + '</span></div><div class="lab">' + MON[x.m] + '</div></div>';
  }).join('') + '</div>';
}

function legend() {
  return '<div class="row" style="gap:10px; font-size:13px; color:var(--ink-2); font-weight:700">'
    + ['avoid', 'fair', 'good', 'great', 'ideal'].map(k =>
      '<span class="row" style="gap:6px"><span class="sw s-' + k + '"></span>' + k[0].toUpperCase() + k.slice(1) + '</span>').join('')
    + '</div>';
}

function tableRows(rec, D, c) {
  return D.months.map(x => {
    const m = x.m;
    const deepLink = D.deep.indexOf(m) !== -1
      ? ' <a class="aff" data-hotel data-city="' + c.hub.city + '" data-month="' + MONF[m] + '" href="#stay">' + c.hub.city + ' hotels in ' + MONF[m] + ' <i data-lucide="arrow-right" class="ic"></i></a>'
      : '';
    return '<tr><td class="m">' + MONF[m] + '</td><td>' + rec.hi[m] + '&deg;C / ' + f(rec.hi[m]) + '&deg;F</td>'
      + '<td>' + rec.lo[m] + '&deg;C / ' + f(rec.lo[m]) + '&deg;F</td><td>' + rec.pr[m] + ' mm</td>'
      + '<td><span class="badge badge--' + x.key + '">' + x.label + ' ' + x.s + '</span></td>'
      + '<td>' + x.note + deepLink + '</td></tr>';
  }).join('');
}

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function faqJsonLd(faq) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(q => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
  });
}
function breadcrumbJsonLd(c) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'When To Go', item: 'https://gowhereandwhen.com/' },
      { '@type': 'ListItem', position: 2, name: 'Countries', item: 'https://gowhereandwhen.com/country/' },
      { '@type': 'ListItem', position: 3, name: c.name, item: 'https://gowhereandwhen.com/country/' + c.slug },
    ],
  });
}

function exploreChips(slug) {
  const others = CONTENT.filter(x => x.slug !== slug).slice(0, 8);
  return '<a class="chip" href="../../index.html"><i data-lucide="globe" class="ic"></i> World map</a>'
    + others.map(x => '<a class="chip" href="../' + x.slug + '/">' + x.name + '</a>').join('');
}

function page(c) {
  const rec = byIso.get(c.iso);
  const D = compute(rec);
  const url = 'https://gowhereandwhen.com/country/' + c.slug;
  const card = (b) => '<div class="card"><div class="row" style="gap:10px">' + (b.icon ? '<i data-lucide="' + b.icon + '" class="ic" style="color:var(--brand)"></i>' : '')
    + '<h3 class="mb-0">' + b.h + '</h3></div><p style="margin:12px 0 0; color:var(--ink-2)">' + b.p + '</p></div>';
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const lowReason = D.haz.length ? cap(D.haz[0][1].toLowerCase()) + '.' : 'The weakest weather of the year.';
  const sa = (label, key, months, sub) => '<div class="card"><span class="badge badge--' + key + '">' + label + '</span>'
    + '<h3 style="margin:12px 0 6px">' + (rangeText(months) || 'no clear window') + '</h3>'
    + '<p class="mb-0" style="color:var(--ink-2)">' + sub + '</p></div>';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="When To Go">
<meta property="og:title" content="${esc(c.title)}">
<meta property="og:description" content="${esc(c.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://gowhereandwhen.com/og.svg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#f4e9cf">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Kaushan+Script&family=Work+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../styles/wtg.css">
<script type="application/ld+json">${breadcrumbJsonLd(c)}</script>
<script type="application/ld+json">${faqJsonLd(c.faq)}</script>
</head>
<body>
<header class="nav"><div class="wrap">
  <a class="brand" href="../../index.html"><span class="dot"><i data-lucide="compass" class="ic"></i></span>When To Go</a>
  <span class="spacer"></span>
  <a class="link" href="../../index.html">World map</a>
  <a class="link" href="#months">Month by month</a>
  <a class="link" href="#stay">Where to stay</a>
</div></header>
<main>
  <section class="section section--tight"><div class="wrap">
    <p class="eyebrow"><i data-lucide="map-pin" class="ic"></i> ${c.name}, weather and seasons</p>
    <h1>When to go to ${c.name}</h1>
    <p class="lead" style="margin-top:14px">${c.heroLead}</p>
    <div class="card card--ink" style="margin-top:26px; padding:clamp(18px,4vw,30px)">
      <div class="row" style="justify-content:space-between; margin-bottom:14px">
        <h3 class="mb-0">Every month, rated for weather</h3>
        ${legend()}
      </div>
      ${strip(D, c.markers)}
      <p class="disc" style="margin:16px 0 0">Score is a 0 to 100 comfort rating from daytime heat, overnight chill, rainfall and storm risk, for ${rec.city}. Higher is better.</p>
    </div>
    <div class="row" style="margin-top:24px">
      <a class="btn btn--lg" href="../../index.html"><i data-lucide="map" class="ic"></i> See ${c.name} on the map</a>
      <a class="btn btn--ghost btn--lg" href="#months"><i data-lucide="calendar-days" class="ic"></i> Jump to month by month</a>
    </div>
    <p class="disc" style="margin-top:16px">Some links on this page are affiliate links. If you book through them we may earn a commission, at no cost to you.</p>
  </div></section>

  <section class="section--tight"><div class="wrap"><div class="grid grid--3">
    ${sa('Best months', 'ideal', D.high, 'The most reliable, comfortable weather of the year.')}
    ${sa('Shoulder', 'good', D.shoulder, 'Decent weather with fewer crowds and lower prices.')}
    ${sa('Low season', 'fair', D.low, lowReason)}
  </div></div></section>

  <section class="section band"><div class="wrap prose">
    <h2>${c.name}'s weather in a nutshell</h2>
    ${c.intro.map(p => '<p>' + p + '</p>').join('\n    ')}
    <div class="grid grid--4" style="margin-top:24px">
      <div class="card stat"><div class="n">${MON[D.best]}</div><div class="k">Best rated month</div></div>
      <div class="card stat"><div class="n">${rec.hi[D.warm]}&deg;C</div><div class="k">Warmest, ${MON[D.warm]}</div></div>
      <div class="card stat"><div class="n">${rec.pr[D.wet]}mm</div><div class="k">Wettest, ${MON[D.wet]}</div></div>
      <div class="card stat"><div class="n">${rec.lo[D.cold]}&deg;C</div><div class="k">Coldest nights, ${MON[D.cold]}</div></div>
    </div>
  </div></section>

  <section class="section" id="months"><div class="wrap">
    <h2>${c.name} month by month</h2>
    <p class="lead" style="margin:10px 0 26px">Average highs and lows, monthly rainfall and the weather rating for ${rec.city}. Conditions vary by region, so read the notes below too.</p>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>Month</th><th>High</th><th>Low</th><th>Rain</th><th>Rating</th><th>What it is like</th></tr></thead>
      <tbody>${tableRows(rec, D, c)}</tbody>
    </table></div>
  </div></section>

  <section class="section--tight"><div class="wrap">
    <h2>Where you go changes when you go</h2>
    <div class="grid grid--3" style="margin-top:20px">${c.regions.map(card).join('')}</div>
  </div></section>

  <section class="section band"><div class="wrap prose">
    <h2>Best time to visit ${c.name} for...</h2>
    ${c.bestFor.map(b => '<h3>' + b.h + '</h3>\n    <p>' + b.p + '</p>').join('\n    ')}
  </div></section>

  <section class="section--tight"><div class="wrap">
    <h2>What is on, and when</h2>
    <div class="grid grid--2" style="margin-top:20px">${c.whatsOn.map(card).join('')}</div>
    <p style="margin:18px 0 0; color:var(--ink-2)">Guided trips and day tours book out fast in peak season. Compare options for the best price and pickup:</p>
    <div class="toursrow">
      <a class="chip" data-tours data-q="${esc(c.hub.city)} tours" href="#"><i data-lucide="ticket" class="ic"></i> Top tours in ${c.hub.city}</a>
      <a class="chip" data-tours data-q="${esc(c.name)} day trips" href="#"><i data-lucide="ticket" class="ic"></i> Day trips in ${c.name}</a>
    </div>
  </div></section>

  ${D.haz.length ? `<section class="section--tight"><div class="wrap"><div class="card">
    <span class="eyebrow" style="color:var(--s-avoid)"><i data-lucide="triangle-alert" class="ic"></i> Watch out</span>
    <div class="grid grid--3" style="margin-top:14px">
      ${D.haz.slice(0, 3).map(h => '<div><h3 style="margin:0 0 6px">' + h[1] + '</h3><p class="mb-0" style="color:var(--ink-2)">' + h[2] + '.</p></div>').join('')}
    </div>
  </div></div></section>` : ''}

  <section class="section" id="stay"><div class="wrap">
    <h2>Where to stay in ${c.name}</h2>
    <p class="lead" style="margin:10px 0 22px">Compare hotels and rentals around ${c.hub.city} on the live map, then lock in your trip for the right month.</p>
    <div class="staygrid">
      <div class="embed embed--stay" data-stay22 data-lat="${c.hub.lat}" data-lng="${c.hub.lng}" data-zoom="${c.hub.zoom || 11}"></div>
      <div class="card" style="display:flex; flex-direction:column; justify-content:center; gap:16px">
        <h3 class="mb-0">Ready to book?</h3>
        <p class="mb-0" style="color:var(--ink-2)">Prices climb in peak season, so booking the best-weather months early pays off. The shoulder and low months are the value windows.</p>
        <div class="row">
          <a class="btn" data-hotel data-city="${esc(c.hub.city)}" href="#"><i data-lucide="bed-double" class="ic"></i> Find ${c.hub.city} hotels</a>
          <a class="btn btn--sun" data-tours data-q="${esc(c.hub.city)}" href="#"><i data-lucide="ticket" class="ic"></i> Things to do</a>
        </div>
        <p class="disc mb-0">Prefer to sort flights first? <a class="aff" data-flights data-iata="${esc(c.hub.iata)}" href="#">Compare flights <i data-lucide="arrow-right" class="ic"></i></a></p>
        <p class="disc mb-0" style="margin-top:-6px">Some links are affiliate links. If you book through them we may earn a commission, at no cost to you. It keeps When To Go free.</p>
      </div>
    </div>
  </div></section>

  <section class="section--tight"><div class="wrap">
    <h2>${c.name} travel FAQ</h2>
    <div class="faq" style="margin-top:20px">
      ${c.faq.map((q, i) => '<details' + (i === 0 ? ' open' : '') + '><summary>' + q.q + ' <i data-lucide="plus" class="ic"></i></summary><div class="a">' + q.a + '</div></details>').join('\n      ')}
    </div>
  </div></section>

  <section class="section"><div class="wrap center">
    <h2>Where else, and when</h2>
    <p class="lead" style="margin:10px auto 24px">Compare more than 190 countries on the interactive map, or jump to another favourite.</p>
    <div class="row" style="justify-content:center">${exploreChips(c.slug)}</div>
  </div></section>
</main>
<footer class="foot"><div class="wrap"><div class="cols">
  <div>
    <a class="brand" href="../../index.html" style="color:#fff"><span class="dot"><i data-lucide="compass" class="ic"></i></span>When To Go</a>
    <p class="muted" style="margin-top:12px; max-width:42ch">Pick a month, see where the weather is good. A planning guide built from climate normals, not a forecast.</p>
  </div>
  <div><h3 style="font-size:18px; margin-bottom:10px">Explore</h3>
    <p class="mb-0"><a href="../../index.html">World map</a></p>
    <p class="mb-0"><a href="#months">${c.name} by month</a></p>
  </div>
  <div><h3 style="font-size:18px; margin-bottom:10px">Good to know</h3>
    <p class="muted mb-0">Figures are long run averages for a hub city, here ${rec.city}. Real conditions vary by region and year. Some links are affiliate links.</p>
  </div>
</div></div></footer>
<script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.js"></script>
<script>window.lucide && lucide.createIcons();</script>
<script src="../../styles/affiliates.js" defer></script>
</body>
</html>
`;
}

// Build
let slugs = [];
for (const c of CONTENT) {
  if (!byIso.has(c.iso)) { console.log('SKIP, no data for', c.slug); continue; }
  const dir = path.join('country', c.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(c));
  slugs.push(c.slug);
}

// Country directory hub page (good for SEO internal linking)
function indexPage() {
  const chips = CONTENT.map(c => '<a class="chip" href="' + c.slug + '/">' + c.name.replace(/^the /, '') + '</a>').join('\n        ');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Best Time to Visit Every Country: a Month by Month Guide</title>
<meta name="description" content="Browse the best time to visit countries around the world, month by month. Pick a destination for its weather rating, seasons, hazards and the months to go.">
<link rel="canonical" href="https://gowhereandwhen.com/country/">
<meta name="robots" content="index,follow">
<meta property="og:title" content="Best time to visit every country">
<meta property="og:description" content="Pick a destination for its weather rating, seasons and the best months to go.">
<meta property="og:url" content="https://gowhereandwhen.com/country/">
<meta property="og:image" content="https://gowhereandwhen.com/og.svg">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#f4e9cf">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Kaushan+Script&family=Work+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles/wtg.css">
</head>
<body>
<header class="nav"><div class="wrap">
  <a class="brand" href="../index.html"><span class="dot"><i data-lucide="compass" class="ic"></i></span>When To Go</a>
  <span class="spacer"></span>
  <a class="link" href="../index.html">World map</a>
</div></header>
<main>
  <section class="section section--tight"><div class="wrap">
    <p class="eyebrow"><i data-lucide="globe" class="ic"></i> Destinations</p>
    <h1>Best time to visit, by country</h1>
    <p class="lead" style="margin:14px 0 26px">Pick a destination for a month by month weather rating, its high and low seasons, any hazards, and the best months to go. Or explore them all on the <a href="../index.html">interactive world map</a>.</p>
    <div class="row">
        ${chips}
    </div>
  </div></section>
</main>
<footer class="foot"><div class="wrap"><div class="cols">
  <div><a class="brand" href="../index.html" style="color:#fff"><span class="dot"><i data-lucide="compass" class="ic"></i></span>When To Go</a>
  <p class="muted" style="margin-top:12px; max-width:42ch">Pick a month, see where the weather is good. A planning guide built from climate normals, not a forecast.</p></div>
  <div><h3 style="font-size:18px; margin-bottom:10px">Explore</h3><p class="mb-0"><a href="../index.html">World map</a></p></div>
  <div><h3 style="font-size:18px; margin-bottom:10px">Good to know</h3><p class="muted mb-0">Figures are long run averages for a hub city per country. A planning guide, not a forecast.</p></div>
</div></div></footer>
<script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.js"></script>
<script>window.lucide && lucide.createIcons();</script>
</body>
</html>
`;
}
fs.writeFileSync(path.join('country', 'index.html'), indexPage());

// Sitemap
const urls = ['https://gowhereandwhen.com/', 'https://gowhereandwhen.com/country/'].concat(CONTENT.map(c => 'https://gowhereandwhen.com/country/' + c.slug));
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls.map((u, i) => '  <url>\n    <loc>' + u + '</loc>\n    <changefreq>' + (i ? 'monthly' : 'weekly') + '</changefreq>\n    <priority>' + (i ? '0.8' : '1.0') + '</priority>\n  </url>').join('\n')
  + '\n</urlset>\n';
fs.writeFileSync('sitemap.xml', sitemap);

// GUIDES map for the app
const guides = '{ ' + CONTENT.map(c => c.iso + ": '" + c.slug + "'").join(', ') + ' }';
console.log('Generated', slugs.length, 'pages:', slugs.join(', '));
console.log('GUIDES =', guides);
