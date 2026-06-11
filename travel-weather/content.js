/* ============================================================================
   When To Go: per-country editorial content. The generator (gen.js) computes
   the strip, table, season ranges, hazards and stats from the climate data;
   everything here is the unique writing that keeps each page distinct.
   Facts checked against current best-time-to-visit guides before publishing.
   ========================================================================= */
const CONTENT = [

  { slug: 'japan', iso: 392, name: 'Japan',
    hub: { city: 'Tokyo', lat: 35.6812, lng: 139.7671, zoom: 11, iata: 'TYO' },
    title: 'Best Time to Visit Japan: Month by Month Weather (2026)',
    desc: 'The best time to visit Japan is spring, late March to May for cherry blossom, and November for autumn colour. Skip the hot, wet, typhoon-prone August to October. A month by month weather guide with notes for Hokkaido, Tokyo, Kyoto and Okinawa.',
    heroLead: 'Go in <strong>spring, late March to May</strong>, for cherry blossom and mild days, or in <strong>November</strong> for crisp air and red maple leaves. Avoid <strong>August to October</strong>, which is hot, wet and typhoon-prone.',
    intro: [
      'Japan is a long, thin country whose islands run nearly three thousand kilometres from the snowy north of Hokkaido to the subtropical beaches of Okinawa, so a single date can mean snowshoes in one place and swimsuits in another. What ties it together is a strong four-season rhythm: a celebrated spring, a hot and humid summer, a clear and colourful autumn, and a crisp, dry winter.',
      'Two summer quirks shape any trip. The tsuyu plum rains sweep north through June and into July, and typhoon season builds from August, peaks in September and fades through October, mostly along the Pacific coast and the southern islands. Plan around those two and the rest of the year is remarkably kind.',
    ],
    regions: [
      { icon: 'snowflake', h: 'Hokkaido, the north', p: 'Months behind the rest of the country. It largely escapes the June rains, blooms in early May rather than April, and becomes a powder-snow paradise from December to March.' },
      { icon: 'building-2', h: 'Tokyo and Kansai, the heart', p: 'The classic route through Tokyo, Kyoto and Osaka follows the ratings on this page closely. Spring and November are glorious and crowded, winter is clear and quiet.' },
      { icon: 'palmtree', h: 'Okinawa, the south', p: 'Subtropical and warm year round, with beach season from April to October. It sits in the typhoon path from August, so aim for late spring or early summer.' },
    ],
    bestFor: [
      { h: 'Cherry blossom', p: 'Late March to mid April in Tokyo and Kyoto, reaching Hokkaido in early May. It lasts only a week or two in any one place, so book months ahead.' },
      { h: 'Autumn leaves', p: 'November across most of Honshu. Kyoto temples and the mountains around Nikko are spectacular, and a touch quieter than spring.' },
      { h: 'Skiing and snow', p: 'January and February for the lightest powder in Hokkaido and the Japan Alps. The deep cold keeps the snow famously dry.' },
      { h: 'Smaller crowds', p: 'January, early February and the rainy stretch of June bring the lowest prices and thinnest crowds, in exchange for cold or damp weather.' },
    ],
    whatsOn: [
      { icon: 'flower-2', h: 'Cherry blossom, late Mar to May', p: 'The country pauses for hanami, blossom-viewing picnics under the trees in parks and along riversides.' },
      { icon: 'leaf', h: 'Autumn colour, November', p: 'Koyo lights up temple gardens and mountain valleys in red and gold.' },
    ],
    faq: [
      { q: 'What is the best time to visit Japan?', a: 'Spring, from late March to May, for cherry blossom and mild weather, and November for clear skies and autumn colour. Both rate great to ideal, though they are the busiest and priciest times.' },
      { q: 'What is the cheapest time to visit Japan?', a: 'January, early February and the rainy stretch of June bring the lowest prices and thinnest crowds. The weather is cold or damp rather than extreme.' },
      { q: 'Should I avoid Japan during typhoon season?', a: 'You do not have to, but plan for disruption. Typhoons run August to October and peak in September, mainly hitting Okinawa and the Pacific coast.' },
    ],
    markers: [{ mon: 'Mar', kind: 'bloom' }, { mon: 'Apr', kind: 'bloom' }, { mon: 'Nov', kind: 'leaf' }],
  },

  { slug: 'usa', iso: 840, name: 'the USA',
    hub: { city: 'New York', lat: 40.7128, lng: -74.006, zoom: 11, iata: 'NYC' },
    title: 'Best Time to Visit the USA: Weather and Seasons by Region',
    desc: 'May and September are the best all-round months to visit the USA, with mild weather across most regions. A month by month guide covering the Northeast, California, the national parks, the South and the hurricane and wildfire seasons.',
    heroLead: 'For most of the country, <strong>May, June, September and October</strong> are the sweet spot. Summer is peak in the north and the parks, winter suits Florida and the desert, and <strong>late summer</strong> brings heat and storms.',
    intro: [
      'The USA is too big for a single season. The ratings here use New York as a stand-in for the temperate Northeast, where spring and autumn are the gentlest times and the leaves in October are famous, but the right month depends entirely on where you are headed.',
      'As a rule, May and September travel well almost everywhere: warm enough for the north, past the worst desert heat, and clear of the summer crowds. The two dates to plan around are the Atlantic hurricane season, which runs June to November and peaks from August to October, and the western wildfire season in late summer.',
    ],
    regions: [
      { icon: 'building-2', h: 'Northeast and Midwest', p: 'May to October is the window, with warm summers and spectacular foliage in October. Winters are cold and snowy, especially around the Great Lakes.' },
      { icon: 'sun', h: 'The South and Florida', p: 'November to April is prime, with warm, dry, comfortable days. Summer is hot, humid and stormy, and the coast watches the hurricane season closely.' },
      { icon: 'mountain', h: 'The West and the parks', p: 'June to September for Yellowstone, the Rockies and the Pacific Northwest. The desert Southwest is best in spring and autumn, avoiding the summer heat.' },
    ],
    bestFor: [
      { h: 'Fall foliage', p: 'Late September into October across New England and the northern states, when the maples turn and the air is crisp.' },
      { h: 'National parks', p: 'June to September, when high-country roads and trails are open and the weather is reliably warm. Book far ahead for the marquee parks.' },
      { h: 'Beaches and the South', p: 'Winter and spring for Florida and the Gulf, before the summer heat and hurricane risk arrive.' },
      { h: 'City breaks', p: 'May, June, September and October for New York, Chicago and Boston, with mild days and long evenings.' },
    ],
    whatsOn: [
      { icon: 'leaf', h: 'Fall foliage, October', p: 'New England and the Appalachians blaze red and gold, drawing leaf-peepers up the back roads.' },
      { icon: 'sparkles', h: 'Festive season, December', p: 'Cities light up for the holidays, with skating rinks and markets despite the cold.' },
    ],
    faq: [
      { q: 'What is the best time to visit the USA?', a: 'May and September are the best all-round months, comfortable across most of the country. Beyond that it depends on the region: summer for the north and the parks, winter for Florida and the desert.' },
      { q: 'When is hurricane season in the USA?', a: 'The Atlantic hurricane season runs June to November and peaks from August to October, affecting the Southeast, the Gulf coast and the Caribbean side.' },
      { q: 'When is the best time to see fall foliage?', a: 'Late September into October in New England and the northern states, a little later as you move south.' },
    ],
    markers: [{ mon: 'Oct', kind: 'leaf' }, { mon: 'Dec', kind: 'snow' }],
  },

  { slug: 'canada', iso: 124, name: 'Canada',
    hub: { city: 'Toronto', lat: 43.6532, lng: -79.3832, zoom: 11, iata: 'YTO' },
    title: 'Best Time to Visit Canada: Month by Month Weather Guide',
    desc: 'The best time to visit Canada is summer, June to August, for warm days and long light, with September and October a quieter, golden alternative. A month by month weather guide covering the cities, the Rockies and the long, cold winters.',
    heroLead: 'Go in <strong>summer, June to August</strong>, for the warmest weather and longest days, or in <strong>September and October</strong> for autumn colour and fewer crowds. <strong>November to March</strong> is long and cold, but it is ski and northern-lights season.',
    intro: [
      'Canada is a summer country for most visitors. The ratings here use Toronto, where June to August brings warm, lively days and September stays pleasant before the cold sets in. The far north and the prairies are harsher, the Pacific coast around Vancouver is milder and wetter.',
      'Winter is long and serious across most of the country, from November well into March, which is exactly the draw if you have come for skiing, snow and the aurora. Spring and autumn are the value seasons, with mild weather and lighter crowds.',
    ],
    regions: [
      { icon: 'building-2', h: 'Toronto, Montreal and the east', p: 'Warm, festival-filled summers and a brilliant autumn in late September and October. Winters are cold and snowy.' },
      { icon: 'mountain-snow', h: 'The Rockies and the west', p: 'July and August for hiking around Banff and Lake Louise, December to March for world-class skiing at Whistler.' },
      { icon: 'cloud-rain', h: 'Vancouver and the coast', p: 'Mild but wet most of the year. Summer is the dry, glorious exception, which is why it is so popular.' },
    ],
    bestFor: [
      { h: 'Cities and road trips', p: 'June to early September, when the weather is warm, the patios are open and the days are long.' },
      { h: 'Autumn colour', p: 'Late September and October, especially in Quebec and Ontario, with crisp air and golden maples.' },
      { h: 'Skiing and the aurora', p: 'December to March for the Rockies and the best chance of northern lights in the north.' },
      { h: 'Value and quiet', p: 'May and September offer mild weather and better prices than the July to August peak.' },
    ],
    whatsOn: [
      { icon: 'leaf', h: 'Autumn colour, October', p: 'Maple country turns red and orange, at its best in Quebec and Ontario.' },
      { icon: 'snowflake', h: 'Ski season, Dec to Mar', p: 'Whistler and the Rockies fill with snow and skiers through the long winter.' },
    ],
    faq: [
      { q: 'What is the best time to visit Canada?', a: 'Summer, June to August, for the warmest, liveliest weather, or September and October for autumn colour and fewer crowds. Insiders often pick the fall for its mild weather and quiet.' },
      { q: 'When is the cheapest time to visit Canada?', a: 'Late autumn and the non-holiday parts of winter, plus the spring shoulder, when crowds thin and prices drop.' },
      { q: 'Is Canada worth visiting in winter?', a: 'Yes, if you have come for it. Winters are cold but bring superb skiing in the Rockies, snowy city festivals, and a strong chance of the northern lights up north.' },
    ],
    markers: [{ mon: 'Feb', kind: 'snow' }, { mon: 'Oct', kind: 'leaf' }],
  },

  { slug: 'uk', iso: 826, name: 'the UK',
    hub: { city: 'London', lat: 51.5072, lng: -0.1276, zoom: 11, iata: 'LON' },
    title: 'Best Time to Visit the UK: London Weather Month by Month',
    desc: 'The best time to visit the UK is late spring to early autumn, roughly April to June and September, with mild days and long light. A month by month London weather guide, including the rainy reality and the warmest summer months.',
    heroLead: 'Aim for <strong>April to June and September</strong>, when days are mild, long and at their driest. <strong>July and August</strong> are warmest but busiest, and <strong>winter</strong> is grey and short on daylight, though rarely freezing.',
    intro: [
      'Britain has no dry season, only wetter and drier stretches, so the trick is to chase the light and the warmth rather than to dodge the rain. The ratings here use London, where late spring and early autumn bring the most reliable conditions and the gardens are at their best.',
      'Summer is the peak, with the warmest weather and the fullest events calendar, but also the biggest crowds and prices. Winter is mild for the latitude but dark, with the sun setting by mid afternoon in December. An umbrella is sensible in any month.',
    ],
    regions: [
      { icon: 'building-2', h: 'London and the southeast', p: 'The warmest and driest corner of the country, and the focus of this guide. Spring and early autumn are the sweet spot.' },
      { icon: 'castle', h: 'Scotland and the north', p: 'Cooler and wetter, gorgeous in summer when the days stretch past 10pm. Midges arrive in the Highlands from June.' },
      { icon: 'waves', h: 'Cornwall and the coast', p: 'July and August for the beaches, when the southwest is at its warmest, though that is also when it is most crowded.' },
    ],
    bestFor: [
      { h: 'Gardens and countryside', p: 'May and June, when the gardens bloom, the hedgerows are green and the days are long.' },
      { h: 'City sightseeing', p: 'April to June and September, with comfortable temperatures and lighter crowds than high summer.' },
      { h: 'Festivals and warmth', p: 'July and August for the warmest weather and the busy festival calendar, from Edinburgh to the seaside.' },
      { h: 'Lower prices', p: 'January to March, outside the holidays, when the weather is cool and damp but hotels are cheap.' },
    ],
    whatsOn: [
      { icon: 'flower-2', h: 'Spring gardens, May', p: 'The countryside turns green and the great gardens, from Kew to the Cotswolds, hit their stride.' },
      { icon: 'sparkles', h: 'Festive lights, December', p: 'Cities glow with Christmas lights and markets despite the short, grey days.' },
    ],
    faq: [
      { q: 'What is the best time to visit the UK?', a: 'Late spring to early autumn, roughly April to June and September, when the weather is mildest and driest and the days are long.' },
      { q: 'Does it rain all the time in the UK?', a: 'It is changeable rather than constantly wet. There is no dry season, but rain tends to come in showers, and spring and early autumn are the driest, brightest stretches.' },
      { q: 'When is the warmest month in the UK?', a: 'July is statistically the warmest in London, with highs around 24C, closely followed by August.' },
    ],
    markers: [{ mon: 'May', kind: 'bloom' }, { mon: 'Dec', kind: 'snow' }],
  },

  { slug: 'germany', iso: 276, name: 'Germany',
    hub: { city: 'Berlin', lat: 52.52, lng: 13.405, zoom: 11, iata: 'BER' },
    title: 'Best Time to Visit Germany: Weather, Oktoberfest and Markets',
    desc: 'The best time to visit Germany is May to September for mild weather and full event calendars, with Oktoberfest in late September and Christmas markets from late November. A month by month Berlin weather guide.',
    heroLead: 'Go from <strong>May to September</strong> for the mildest weather and long days. <strong>Late September</strong> is Oktoberfest, and <strong>late November to December</strong> is Christmas-market season. <strong>Winter</strong> is cold and grey beyond the markets.',
    intro: [
      'Germany is a classic four-season destination, and the ratings here use Berlin. From May to September the weather is mild and the festival calendar is full, with daylight stretching toward 10pm at midsummer. The shoulder months of May, June and September are the most comfortable.',
      'Two seasonal events drive a lot of trips: Oktoberfest, which despite the name runs from mid September into early October in Munich, and the Christmas markets, which open across the country in late November and run through December. Winter is otherwise cold and short on light.',
    ],
    regions: [
      { icon: 'building-2', h: 'Berlin and the north', p: 'Cool and flat, best from late spring to early autumn. The north coast is breezy and made for summer.' },
      { icon: 'beer', h: 'Bavaria and Munich', p: 'Home of Oktoberfest in late September and a gateway to the Alps. Summer for hiking, winter for the markets and snow.' },
      { icon: 'mountain-snow', h: 'The Alps and the south', p: 'Warm valleys and cool peaks in summer, ski resorts from December to March in the Bavarian Alps.' },
    ],
    bestFor: [
      { h: 'Cityscapes and culture', p: 'May, June and September, with mild weather, long days and lighter crowds than high summer.' },
      { h: 'Oktoberfest', p: 'Mid September to early October in Munich. Book accommodation across Bavaria two to three months ahead.' },
      { h: 'Christmas markets', p: 'Late November through December, when squares from Nuremberg to Cologne fill with stalls and mulled wine.' },
      { h: 'Hiking and the Alps', p: 'July and August for the warmest mountain weather and open high trails in the south.' },
    ],
    whatsOn: [
      { icon: 'party-popper', h: 'Oktoberfest, late September', p: 'Munich fills its beer tents for the world\'s biggest folk festival, running into early October.' },
      { icon: 'sparkles', h: 'Christmas markets, December', p: 'City squares across the country become glowing markets from late November.' },
    ],
    faq: [
      { q: 'What is the best time to visit Germany?', a: 'May to September for the mildest weather and the fullest calendar, with May, June and September the most comfortable and least crowded.' },
      { q: 'When is Oktoberfest?', a: 'Despite the name it runs from mid September into the first weekend of October, in Munich. Accommodation books out across Bavaria, so plan early.' },
      { q: 'When do the Christmas markets open?', a: 'Most open in the last week of November and run through December, closing around Christmas.' },
    ],
    markers: [{ mon: 'Sep', kind: 'fest' }, { mon: 'Dec', kind: 'snow' }],
  },

  { slug: 'france', iso: 250, name: 'France',
    hub: { city: 'Paris', lat: 48.8566, lng: 2.3522, zoom: 11, iata: 'PAR' },
    title: 'Best Time to Visit France: Paris Weather Month by Month',
    desc: 'The best time to visit France is spring, April to June, and early autumn, September to October, with mild weather and lighter crowds. A month by month Paris weather guide, with notes for the Riviera, the Alps and the wine country.',
    heroLead: 'Go in <strong>spring, April to June</strong>, or <strong>September to early October</strong>, for mild days, blooming parks and thinner crowds. <strong>Summer</strong> is warm and busy, and <strong>winter</strong> is cool and quiet beyond the festive season.',
    intro: [
      'France rewards the shoulder seasons. The ratings here use Paris, where spring and early autumn bring the gentlest weather, sunny days and far shorter queues than the July to August peak. The capital famously empties of locals in August, when many businesses close.',
      'The country covers several climates, from the cool, changeable north to the hot, dry Mediterranean south. The Riviera and Provence run warmer and later into autumn, the Alps swing to a winter ski season, and the wine regions peak around the September harvest.',
    ],
    regions: [
      { icon: 'building-2', h: 'Paris and the north', p: 'Mild and temperate, at its best in spring and early autumn. Summers are warm and crowded, winters cool and grey.' },
      { icon: 'sun', h: 'Provence and the Riviera', p: 'Hot, dry summers and a long, warm shoulder into October. Spring brings lavender fields and gentler heat.' },
      { icon: 'mountain-snow', h: 'The French Alps', p: 'Hiking and lakes in summer, world-class skiing from December to April around Chamonix and the Trois Vallees.' },
    ],
    bestFor: [
      { h: 'Paris and the cities', p: 'April to June and September, with comfortable temperatures, blooming gardens and manageable lines.' },
      { h: 'The Riviera and beaches', p: 'June and September for warm seas without the peak August crush along the Cote d\'Azur.' },
      { h: 'Wine country', p: 'September and October, around the grape harvest, when the vineyards turn gold and the cellars are busy.' },
      { h: 'Skiing', p: 'December to April in the Alps, with the most reliable snow in January and February.' },
    ],
    whatsOn: [
      { icon: 'flower-2', h: 'Spring blooms, April', p: 'Paris parks and the chestnut trees come into leaf, and the city is at its most photogenic.' },
      { icon: 'grape', h: 'Wine harvest, September', p: 'The vendange fills the wine regions, from Bordeaux to Burgundy, with activity and colour.' },
    ],
    faq: [
      { q: 'What is the best time to visit France?', a: 'Spring, April to June, and early autumn, September to October, for mild weather, blooming or golden scenery and lighter crowds than summer.' },
      { q: 'Is August a good time to visit Paris?', a: 'The weather is warm but it is peak tourist season, and many local shops and restaurants close as Parisians take their holidays. Late spring or September is more rewarding.' },
      { q: 'When is the best time for the French Riviera?', a: 'June and September give you warm sea and sunshine without the packed beaches and high prices of August.' },
    ],
    markers: [{ mon: 'Apr', kind: 'bloom' }, { mon: 'Sep', kind: 'fest' }],
  },

  { slug: 'italy', iso: 380, name: 'Italy',
    hub: { city: 'Rome', lat: 41.9028, lng: 12.4964, zoom: 11, iata: 'ROM' },
    title: 'Best Time to Visit Italy: Rome Weather Month by Month',
    desc: 'The best time to visit Italy is spring, April to June, and September to October, with warm, dry days and lighter crowds. A month by month Rome weather guide, with notes for the Alps, Tuscany and the south.',
    heroLead: 'Go in <strong>spring, April to June</strong>, or <strong>September to October</strong>, for warm, dry days and thinner crowds. <strong>July and August</strong> are hot and packed, and <strong>winter</strong> is cool and quiet, ideal for art cities without the queues.',
    intro: [
      'Italy is at its best in the shoulder seasons. The ratings here use Rome, where spring and early autumn bring warm, dry, comfortable weather and the great sights without the August crush. Locals take their own holidays in August, so cities can feel both crowded with tourists and shut for the season.',
      'The country stretches from Alpine peaks to the hot Mediterranean south, so conditions vary. The north is cooler and greener, Tuscany glows in late spring and at harvest, and Sicily and the south stay warm well into autumn.',
    ],
    regions: [
      { icon: 'mountain-snow', h: 'The Alps and the north', p: 'Lakes and hiking in summer, skiing from December to March in the Dolomites. Milan and Venice are mild in spring and autumn.' },
      { icon: 'grape', h: 'Tuscany and the centre', p: 'Spring wildflowers and a golden September harvest. Summer is hot in Florence and Rome, but the hill country stays pleasant.' },
      { icon: 'sun', h: 'The south and the islands', p: 'Long, hot summers and a warm shoulder into October across Naples, Sicily and the Amalfi Coast.' },
    ],
    bestFor: [
      { h: 'Art cities', p: 'April to June and September to October for Rome, Florence and Venice, with warm days and shorter queues.' },
      { h: 'The coast and islands', p: 'June and September for the Amalfi Coast, Sardinia and Sicily, with warm seas and fewer crowds than August.' },
      { h: 'Food and wine', p: 'September and October bring the grape and olive harvests, truffle season and a calendar of food festivals.' },
      { h: 'Skiing', p: 'December to March in the Dolomites and the northern Alps.' },
    ],
    whatsOn: [
      { icon: 'flower-2', h: 'Spring, April and May', p: 'Wildflowers across Tuscany and Umbria, and warm, clear days in the art cities.' },
      { icon: 'grape', h: 'Harvest, September', p: 'The vendemmia and olive harvest fill the countryside with festivals and new wine.' },
    ],
    faq: [
      { q: 'What is the best time to visit Italy?', a: 'Spring, April to June, and September to October, when the weather is warm and dry and the crowds are lighter than in high summer.' },
      { q: 'Is Italy too hot in summer?', a: 'July and August are hot, especially inland in Rome and Florence, and very crowded. The coast and the mountains are more comfortable, but spring and autumn are easier overall.' },
      { q: 'When is the best time for the Amalfi Coast?', a: 'June and September, with warm sea and sunshine but without the peak August prices and crowds.' },
    ],
    markers: [{ mon: 'May', kind: 'bloom' }, { mon: 'Oct', kind: 'leaf' }],
  },

  { slug: 'spain', iso: 724, name: 'Spain',
    hub: { city: 'Madrid', lat: 40.4168, lng: -3.7038, zoom: 11, iata: 'MAD' },
    title: 'Best Time to Visit Spain: Weather Month by Month',
    desc: 'The best time to visit Spain is spring, April to June, and autumn, September to October, with warm days and moderate crowds. A month by month Madrid weather guide, with notes for Barcelona, the south and the islands.',
    heroLead: 'Go in <strong>April to June</strong> or <strong>September to October</strong> for warm, comfortable weather and lighter crowds. <strong>July and August</strong> are hot, especially inland, and <strong>winter</strong> is mild on the coast but cool in the centre.',
    intro: [
      'Spain saves its best for spring and autumn. The ratings here use Madrid, high on the central plateau, where July and August can be fierce and dry while April to June and September to October are warm and easygoing. The festival calendar, from Holy Week to the spring fairs, peaks in spring.',
      'Climates vary widely: the Mediterranean coast and Barcelona are milder, the south around Seville is the hottest, and the green north stays cooler and wetter. Winter is gentle along the coast and in the south, which is why the Costa del Sol and the Canary Islands draw sun-seekers year round.',
    ],
    regions: [
      { icon: 'building-2', h: 'Madrid and the centre', p: 'Hot, dry summers and cold, clear winters on the high plateau. Spring and autumn are the sweet spot.' },
      { icon: 'waves', h: 'Barcelona and the coast', p: 'Milder and made for the shoulder seasons of April to June and September to October, mixing city and beach.' },
      { icon: 'sun', h: 'Seville and the south', p: 'The hottest corner of the country, glorious in spring and autumn and best avoided at the height of summer.' },
    ],
    bestFor: [
      { h: 'Cities and culture', p: 'April to June and September to October for Madrid, Barcelona and Seville, with warm days and manageable crowds.' },
      { h: 'Beaches', p: 'June and September along the Mediterranean, with warm seas before and after the August peak.' },
      { h: 'Festivals', p: 'Spring for Holy Week processions and Seville\'s April Fair, two of the country\'s great spectacles.' },
      { h: 'Winter sun', p: 'The Canary Islands and the southern coast stay mild through winter, a warm escape from northern Europe.' },
    ],
    whatsOn: [
      { icon: 'party-popper', h: 'Holy Week and fairs, April', p: 'Semana Santa processions and Seville\'s Feria fill the spring calendar across the south.' },
      { icon: 'sun', h: 'Beach season, June and Sep', p: 'Warm seas and long days on the Mediterranean, on either side of the August crowds.' },
    ],
    faq: [
      { q: 'What is the best time to visit Spain?', a: 'April to June and September to October, when the weather is warm and comfortable and the crowds are lighter than the July to August peak.' },
      { q: 'Is Spain too hot in summer?', a: 'July and August are very hot inland, especially in Madrid and Seville. The coast is more bearable, but spring and autumn are easier across the country.' },
      { q: 'When is the cheapest time to visit Spain?', a: 'November, January and February, outside the holidays, when crowds thin and prices fall, with mild weather on the coast.' },
    ],
    markers: [{ mon: 'Apr', kind: 'fest' }, { mon: 'Sep', kind: 'sun' }],
  },

  { slug: 'greece', iso: 300, name: 'Greece',
    hub: { city: 'Athens', lat: 37.9838, lng: 23.7275, zoom: 11, iata: 'ATH' },
    title: 'Best Time to Visit Greece: Weather and the Islands by Month',
    desc: 'The best time to visit Greece is May to June and September to October, with warm, dry weather, swimmable seas and fewer crowds than the July to August peak. A month by month Athens weather guide with island notes.',
    heroLead: 'Go in <strong>May and June</strong> or <strong>September and October</strong> for warm, dry days, swimmable seas and lighter crowds. <strong>July and August</strong> are hot and packed, and <strong>winter</strong> is mild but many islands wind down.',
    intro: [
      'Greece runs on a long, dry Mediterranean summer. The ratings here use Athens, where late spring and early autumn bring warm, rainless days, blooming or golden landscapes, and a sea that stays swimmable from late May into October. The peak of July and August is hot and very busy.',
      'The islands largely follow the same rhythm but with a catch: outside the May to October season, ferries thin out and many hotels and tavernas close, especially on the smaller islands. The mainland and Athens stay open and pleasant for sightseeing year round.',
    ],
    regions: [
      { icon: 'landmark', h: 'Athens and the mainland', p: 'Hot summers and mild winters. Spring and autumn are ideal for the Acropolis and ancient sites, without the summer heat.' },
      { icon: 'waves', h: 'The Cyclades and islands', p: 'Santorini, Mykonos and the rest are at their best from May to mid June and late August into September, warm but a touch calmer.' },
      { icon: 'sun', h: 'Crete and the south', p: 'The warmest, longest season of all, with swimming well into October and mild winters.' },
    ],
    bestFor: [
      { h: 'Islands and beaches', p: 'Late May to mid June and September, with warm seas, sunshine and fewer crowds than the August rush.' },
      { h: 'Ancient sites', p: 'April, May, June, September and October, when Athens and Delphi are pleasant rather than scorching.' },
      { h: 'Nightlife', p: 'July and August, when Mykonos and the party islands are at full tilt.' },
      { h: 'Quiet and value', p: 'May and October bring the best mix of good weather, open tavernas and lower prices.' },
    ],
    whatsOn: [
      { icon: 'sun', h: 'Island season, May to Oct', p: 'Ferries run, tavernas open and the Aegean warms up for swimming.' },
      { icon: 'waves', h: 'Warm seas, September', p: 'The sea is at its warmest after a summer of sun, ideal for late swimming.' },
    ],
    faq: [
      { q: 'What is the best time to visit Greece?', a: 'May to June and September to October, with warm, dry weather, swimmable seas and far smaller crowds than July and August.' },
      { q: 'Can you visit the Greek islands in winter?', a: 'You can, but many hotels and tavernas close and ferries run less often, especially on the smaller islands. Crete and the larger islands stay more active.' },
      { q: 'When is the sea warmest in Greece?', a: 'September, after a full summer of sun, which is why early autumn is so popular for swimming.' },
    ],
    markers: [{ mon: 'Jun', kind: 'sun' }, { mon: 'Sep', kind: 'sun' }],
  },

  { slug: 'portugal', iso: 620, name: 'Portugal',
    hub: { city: 'Lisbon', lat: 38.7223, lng: -9.1393, zoom: 12, iata: 'LIS' },
    title: 'Best Time to Visit Portugal: Lisbon Weather by Month',
    desc: 'The best time to visit Portugal is spring, March to May, and autumn, September to October, with warm, sunny days and lighter crowds. A month by month Lisbon weather guide, with notes for the Algarve, Porto and the islands.',
    heroLead: 'Go in <strong>March to May</strong> or <strong>September to October</strong> for warm, sunny days and fewer crowds. <strong>July and August</strong> are hot and busy on the coast, and <strong>winter</strong> is mild but changeable.',
    intro: [
      'Portugal has one of the gentlest climates in Europe, and the ratings here use Lisbon. Spring and autumn bring warm, sunny days, golden light and far smaller crowds than the summer peak, when the Algarve beaches fill up. Rain mostly falls in winter, and even then the south stays mild.',
      'The country is compact but varied: the Algarve in the south is the warmest and driest, Lisbon and the centre are temperate, and Porto and the green north are cooler and wetter. The Atlantic islands of Madeira and the Azores are mild year round.',
    ],
    regions: [
      { icon: 'building-2', h: 'Lisbon and the centre', p: 'Warm, sunny and temperate, at its best in spring and autumn. Summer is hot but tempered by the Atlantic breeze.' },
      { icon: 'sun', h: 'The Algarve, the south', p: 'The warmest, driest region and Portugal\'s beach capital. Glorious in late spring and September, packed in August.' },
      { icon: 'grape', h: 'Porto and the Douro', p: 'Cooler and greener, with a beautiful September harvest in the port-wine valleys upriver.' },
    ],
    bestFor: [
      { h: 'Cities and culture', p: 'March to May and September to October for Lisbon and Porto, with warm days and lighter crowds.' },
      { h: 'Beaches', p: 'June and September in the Algarve, with warm seas on either side of the August peak.' },
      { h: 'Surfing', p: 'Autumn brings the biggest Atlantic swells to spots like Nazare and the western coast.' },
      { h: 'Wine country', p: 'September in the Douro Valley, around the grape harvest, with golden terraces above the river.' },
    ],
    whatsOn: [
      { icon: 'party-popper', h: 'Lisbon festivals, June', p: 'The city s saint s-day festivals peak around St Anthony on 13 June, with street parties across the old quarters.' },
      { icon: 'grape', h: 'Douro harvest, September', p: 'The port-wine vineyards come alive for the vintage along the river valleys.' },
    ],
    faq: [
      { q: 'What is the best time to visit Portugal?', a: 'Spring, March to May, and autumn, September to October, with warm, sunny weather, cheaper rates and fewer crowds than summer.' },
      { q: 'When is the best time for the Algarve?', a: 'June and September give you warm sea and sunshine without the packed beaches and high prices of July and August.' },
      { q: 'Is Portugal warm in winter?', a: 'It is mild for Europe, especially in the south and on Madeira, but winters are changeable, with sunny spells broken by spells of grey and rain.' },
    ],
    markers: [{ mon: 'Jun', kind: 'fest' }, { mon: 'Sep', kind: 'sun' }],
  },

  { slug: 'mexico', iso: 484, name: 'Mexico',
    hub: { city: 'Mexico City', lat: 19.4326, lng: -99.1332, zoom: 11, iata: 'MEX' },
    title: 'Best Time to Visit Mexico: Dry Season and Weather by Month',
    desc: 'The best time to visit Mexico is the dry season, November to April, with sunny, comfortable weather. A month by month Mexico City weather guide, with the rainy season and the Caribbean hurricane season explained.',
    heroLead: 'Go in the <strong>dry season, November to April</strong>, for sunny, comfortable days. The <strong>rainy season runs May to October</strong>, with afternoon storms, and the Caribbean coast watches the <strong>hurricane season, June to November</strong>.',
    intro: [
      'Mexico splits cleanly into a dry season and a rainy one. The ratings here use Mexico City, high in the central highlands, where the dry months from November to April bring sunny, spring-like days and the rains arrive as afternoon downpours from May. Coastal resorts run hotter and more humid.',
      'The dry season is peak for good reason, but it brings higher prices and busy beaches over the December and Easter holidays. The one date to plan around on the Caribbean side is the Atlantic hurricane season, which runs June to November and is most active from August to October.',
    ],
    regions: [
      { icon: 'building-2', h: 'Mexico City and the highlands', p: 'Mild and spring-like year round thanks to the altitude, sunniest and driest from November to April.' },
      { icon: 'waves', h: 'Cancun and the Caribbean', p: 'Hot and humid, best from December to April. It sits in the hurricane belt, with the highest risk from August to October.' },
      { icon: 'sun', h: 'The Pacific coast', p: 'Puerto Vallarta and Oaxaca are warm and dry in winter, hot and wet in summer, with their own storm risk in late summer.' },
    ],
    bestFor: [
      { h: 'Beaches and resorts', p: 'December to April on both coasts, with warm, dry, sunny weather, though prices peak over the winter holidays.' },
      { h: 'Ruins and culture', p: 'November to April for Mexico City, Oaxaca and the Yucatan, with comfortable temperatures for exploring.' },
      { h: 'Day of the Dead', p: 'Late October into early November, one of the country\'s most striking and atmospheric celebrations.' },
      { h: 'Value and quiet', p: 'June offers a window of lower prices before the worst of the storm season, with greener landscapes.' },
    ],
    whatsOn: [
      { icon: 'party-popper', h: 'Day of the Dead, early November', p: 'Marigolds, altars and processions fill towns from Oaxaca to Mexico City around 1 and 2 November.' },
      { icon: 'sun', h: 'Dry-season beaches, winter', p: 'The coasts are at their sunniest and driest from December through spring.' },
    ],
    faq: [
      { q: 'What is the best time to visit Mexico?', a: 'The dry season, November to April, with sunny, comfortable weather. December to February are the coolest and most pleasant, though prices peak over the holidays.' },
      { q: 'When is hurricane season in Mexico?', a: 'The Atlantic hurricane season runs June to November and is most active from August to October, mainly affecting the Caribbean coast around Cancun.' },
      { q: 'Is the rainy season a bad time to visit?', a: 'Not necessarily. From May to October the rain usually comes as short afternoon storms, prices are lower and the landscapes are green, though the coast carries storm risk.' },
    ],
    markers: [{ mon: 'Nov', kind: 'fest' }, { mon: 'Mar', kind: 'sun' }],
  },

  { slug: 'iceland', iso: 352, name: 'Iceland',
    hub: { city: 'Reykjavik', lat: 64.1466, lng: -21.9426, zoom: 12, iata: 'REK' },
    title: 'Best Time to Visit Iceland: Weather and Northern Lights by Month',
    desc: 'The best time to visit Iceland is summer, June to August, for mild weather, open roads and the midnight sun, while September to March is northern-lights season. A month by month Reykjavik weather guide.',
    heroLead: 'Go in <strong>summer, June to August</strong>, for the mildest weather, open highland roads and the midnight sun. For the <strong>northern lights, come September to March</strong>, when the nights are long and dark but the weather is harsh.',
    intro: [
      'Iceland is a land of two very different seasons. The ratings here use Reykjavik, where summer brings mild, long days, accessible roads and near round-the-clock daylight, which is why June to August is the peak. The weather is never hot and can change in an instant in any month.',
      'Winter is the trade-off you make for the aurora. From September to March the long, dark nights give the best chance of northern lights, but storms, ice and short daylight close much of the interior. Spring and autumn are quieter shoulders with a mix of both.',
    ],
    regions: [
      { icon: 'building-2', h: 'Reykjavik and the south', p: 'The mildest, most accessible part of the island, and the base for the Golden Circle and south-coast waterfalls.' },
      { icon: 'mountain', h: 'The Highlands', p: 'The interior roads only open in summer, roughly late June to early September, for the most dramatic, remote scenery.' },
      { icon: 'sparkles', h: 'Aurora country, in winter', p: 'From September to March the dark skies anywhere away from city lights offer the best chance of the northern lights.' },
    ],
    bestFor: [
      { h: 'The Ring Road and highlands', p: 'June to August, when all roads are open, the weather is mildest and the days are endless.' },
      { h: 'Northern lights', p: 'September to March, on clear, dark nights away from town. October, February and March balance aurora odds with manageable conditions.' },
      { h: 'Midnight sun', p: 'June and July, when the sun barely sets and you can hike or drive late into the night.' },
      { h: 'Fewer crowds', p: 'May and September are quieter shoulders with a chance of both decent weather and early or late auroras.' },
    ],
    whatsOn: [
      { icon: 'sun', h: 'Midnight sun, June and July', p: 'Near round-the-clock daylight opens up long evenings of hiking and driving.' },
      { icon: 'sparkles', h: 'Northern lights, Sep to Mar', p: 'Dark, clear nights give the best chance of the aurora dancing overhead.' },
    ],
    faq: [
      { q: 'What is the best time to visit Iceland?', a: 'Summer, June to August, for the mildest weather, open highland roads and the midnight sun. It is also the busiest and priciest season.' },
      { q: 'When can you see the northern lights in Iceland?', a: 'From roughly September to March, when the nights are long and dark. You need clear skies and a spot away from city lights, and some patience.' },
      { q: 'Is Iceland worth visiting in winter?', a: 'Yes, for the aurora, ice caves and snowy landscapes, but expect harsh weather, short daylight and closed highland roads. Stick to the south and west.' },
    ],
    markers: [{ mon: 'Jul', kind: 'sun' }],
  },

  { slug: 'thailand', iso: 764, name: 'Thailand',
    hub: { city: 'Bangkok', lat: 13.7563, lng: 100.5018, zoom: 11, iata: 'BKK' },
    title: 'Best Time to Visit Thailand: Cool Season and Weather by Month',
    desc: 'The best time to visit Thailand is the cool, dry season from November to February, with warm, sunny days. A month by month Bangkok weather guide, with the hot season and the monsoon explained, plus island timing.',
    heroLead: 'Go in the <strong>cool, dry season, November to February</strong>, for the most comfortable weather. <strong>March to May</strong> is fiercely hot, and the <strong>monsoon runs roughly June to October</strong>, though the islands differ coast to coast.',
    intro: [
      'Thailand has three seasons, and the ratings here use Bangkok. The cool, dry months from November to February are the clear best time, with warm, sunny days and lower humidity, which is also why they are the busiest and priciest. March to May is the hot season, when temperatures and humidity climb hard.',
      'The southwest monsoon brings the rains from around June to October to most of the country. The islands are the exception worth knowing: the Andaman coast, including Phuket and Krabi, is wettest from May to October, while the Gulf coast, including Koh Samui, gets its heaviest rain later, around October to December.',
    ],
    regions: [
      { icon: 'building-2', h: 'Bangkok and the centre', p: 'Hot and humid year round, most comfortable in the cool, dry season from November to February.' },
      { icon: 'waves', h: 'Phuket and the Andaman coast', p: 'Driest and best from November to April. The rains here run May to October, with the heaviest in the middle of that stretch.' },
      { icon: 'sun', h: 'Koh Samui and the Gulf coast', p: 'Follows a different pattern, staying drier in summer and taking its heaviest rain around October to December.' },
    ],
    bestFor: [
      { h: 'Islands and beaches', p: 'November to April on the Andaman coast for Phuket and Krabi, with calm, clear seas and sunshine.' },
      { h: 'Cities and temples', p: 'November to February for Bangkok and Chiang Mai, with the year\'s most comfortable weather.' },
      { h: 'Festivals', p: 'Songkran, the water-fight new year, in April, and Loy Krathong, the festival of lights, in November.' },
      { h: 'Value and green season', p: 'June to October brings lower prices and lush landscapes, with rain that often falls in short bursts.' },
    ],
    whatsOn: [
      { icon: 'party-popper', h: 'Songkran, April', p: 'The Thai new year turns the whole country into a giant, joyful water fight.' },
      { icon: 'sparkles', h: 'Loy Krathong, November', p: 'Floating lanterns and candle-lit baskets drift on rivers and lakes across the country.' },
    ],
    faq: [
      { q: 'What is the best time to visit Thailand?', a: 'The cool, dry season from November to February, with warm, sunny days and lower humidity. It is the most comfortable and the most popular time.' },
      { q: 'When is the monsoon in Thailand?', a: 'Roughly June to October for most of the country and the Andaman coast. The Gulf coast around Koh Samui differs, with its heaviest rain around October to December.' },
      { q: 'Is April a good time to visit Thailand?', a: 'It is the hottest month and can be uncomfortable, but it is also when Songkran, the famous water festival, takes place, which many travellers plan around.' },
    ],
    markers: [{ mon: 'Apr', kind: 'fest' }, { mon: 'Dec', kind: 'sun' }],
  },

  { slug: 'peru', iso: 604, name: 'Peru',
    hub: { city: 'Cusco', lat: -13.5319, lng: -71.9675, zoom: 13, iata: 'CUZ' },
    title: 'Best Time to Visit Peru: Dry Season and Machu Picchu by Month',
    desc: 'The best time to visit Peru and Machu Picchu is the dry season, May to September, with clear skies in the Andes. A month by month Cusco weather guide, with the wet season and the different coast and jungle timing explained.',
    heroLead: 'For the Andes and Machu Picchu, go in the <strong>dry season, May to September</strong>, when skies are clear and trails are open. The <strong>wet season, November to March</strong>, brings rain and cloud, and the Inca Trail closes each February.',
    intro: [
      'Peru is really three countries in one, and the ratings here use Cusco, the gateway to Machu Picchu in the Andes. The highland dry season, from May to September, brings clear blue skies and crisp days, ideal for trekking, though nights are cold and the sun is intense at altitude.',
      'The wet season runs November to March, with afternoon rain, cloud over the peaks and a greener landscape, and the classic Inca Trail closes every February for maintenance. The coast around Lima and the Amazon jungle follow their own patterns, so the best month depends on where you go.',
    ],
    regions: [
      { icon: 'mountain-snow', h: 'Cusco and the Andes', p: 'Dry, clear and cold-nighted from May to September, the prime window for Machu Picchu and high-altitude trekking.' },
      { icon: 'cloud-sun', h: 'Lima and the coast', p: 'A grey, misty overcast hangs over Lima for much of the year, lifting into warm, sunny summer from December to March.' },
      { icon: 'trees', h: 'The Amazon', p: 'Hot and humid year round. The drier months from May to September make for easier hiking and wildlife spotting.' },
    ],
    bestFor: [
      { h: 'Machu Picchu and trekking', p: 'May to September, the dry season, with the clearest skies and most reliable trails. June to August is the busy peak.' },
      { h: 'The Inca Trail', p: 'May to September for the firmest, driest conditions. Note that the trail closes every February, so plan around it.' },
      { h: 'The coast and Lima', p: 'December to March, the coastal summer, when the grey lifts and the beaches warm up.' },
      { h: 'Fewer crowds', p: 'The shoulder months of April, May, September and October offer good weather with thinner trails than midsummer.' },
    ],
    whatsOn: [
      { icon: 'party-popper', h: 'Inti Raymi, June', p: 'Cusco stages the great Inca festival of the sun on 24 June, the highlight of the highland calendar.' },
      { icon: 'sun', h: 'Dry-season skies, May to Sep', p: 'Clear blue Andean skies make this the prime window for Machu Picchu and trekking.' },
    ],
    faq: [
      { q: 'What is the best time to visit Peru and Machu Picchu?', a: 'The dry season, May to September, when the Andes have clear skies and the trails are open. June to August is the busiest and should be booked well ahead.' },
      { q: 'When does the Inca Trail close?', a: 'Every February, for maintenance during the height of the wet season. Other treks to Machu Picchu remain open year round.' },
      { q: 'Why is Lima always grey?', a: 'A coastal mist called the garua hangs over Lima for much of the year, clearing into warm, sunny weather only in the summer months of December to March.' },
    ],
    markers: [{ mon: 'Jun', kind: 'fest' }, { mon: 'Aug', kind: 'sun' }],
  },

];

if (typeof module !== 'undefined' && module.exports) module.exports = { CONTENT };
