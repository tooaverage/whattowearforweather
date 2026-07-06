/* ============================================================================
   When To Go: affiliate hydration. Set your IDs once here and every page
   picks them up. Built around the evidence that intent-matched, pre-filled,
   sparse placement converts: hotels first, tours second, flights last.
   Replace the placeholder values with your real account IDs, then commit.
     - Travelpayouts marker: travelpayouts.com (a number like "123456")
     - Stay22 affiliate id:  dashboard.stay22.com (looks like "wtg-xxxxx")
   The "p" values are Travelpayouts program ids. Set them to the hotel and
   tours (GetYourGuide) programs you joined in your dashboard.
   Nothing here is indexed content, so building it in JS is fine.
   ========================================================================= */
window.AFFIL = {
  tpMarker: 'REPLACE_WITH_TRAVELPAYOUTS_MARKER',
  stay22Aid: 'REPLACE_WITH_STAY22_AID',
  p: {
    hotels: '5976',   // hotellook / hotels program id
    tours: '4783',    // getyourguide program id
    flights: '4114',  // flights search program id
  },
};

(function () {
  const A = window.AFFIL;
  const enc = encodeURIComponent;
  // Until a real marker is set, links go straight to the destination, so the
  // page is fully functional and crawlable now. Set the marker later and the
  // same links become affiliate links with no other change.
  const live = A.tpMarker && A.tpMarker.indexOf('REPLACE') === -1;
  const tp = (url, program) => live ? ('https://tp.media/r?marker=' + enc(A.tpMarker) + '&p=' + program + '&u=' + enc(url)) : url;
  const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];

  // A representative future date range for a named month, so deep links arrive
  // pre-filled. Booking and hotel cookies are short, so removing date friction
  // matters: the click should reach ready-to-book results in one sitting.
  function stayDates(monthName) {
    const mi = MONTHS.indexOf((monthName || '').toLowerCase());
    if (mi < 0) return null;
    const now = new Date();
    let ci = new Date(now.getFullYear(), mi, 14);
    if (ci - now < 14 * 864e5) ci = new Date(now.getFullYear() + 1, mi, 14);
    const co = new Date(ci.getTime() + 3 * 864e5);
    const f = d => d.toISOString().slice(0, 10);
    return { checkIn: f(ci), checkOut: f(co) };
  }

  // Stay22 map: <div class="embed" data-stay22 data-lat data-lng data-zoom></div>
  document.querySelectorAll('[data-stay22]').forEach(function (el) {
    const d = el.dataset;
    const f = document.createElement('iframe');
    f.src = 'https://www.stay22.com/embed/gm?aid=' + enc(A.stay22Aid)
      + '&lat=' + d.lat + '&lng=' + d.lng + '&zoom=' + (d.zoom || '13') + '&maincolor=16786f';
    f.loading = 'lazy'; f.title = 'Where to stay';
    f.style.cssText = 'width:100%;height:100%;border:0;display:block';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    el.appendChild(f);
  });

  // Hotels: <a data-hotel data-city="Tokyo" data-month="November">...</a>
  document.querySelectorAll('[data-hotel]').forEach(function (a) {
    const city = a.dataset.city || '';
    let url = 'https://search.hotellook.com/hotels?destination=' + enc(city);
    const dates = stayDates(a.dataset.month);
    if (dates) url += '&checkIn=' + dates.checkIn + '&checkOut=' + dates.checkOut;
    a.href = tp(url, A.p.hotels); a.rel = 'sponsored noopener'; a.target = '_blank';
  });

  // Tours / experiences: <a data-tours data-q="Kyoto cherry blossom">...</a>
  document.querySelectorAll('[data-tours]').forEach(function (a) {
    const q = a.dataset.q || a.dataset.city || '';
    a.href = tp('https://www.getyourguide.com/s/?q=' + enc(q), A.p.tours);
    a.rel = 'sponsored noopener'; a.target = '_blank';
  });

  // Flights (demoted): <a data-flights data-iata="TYO">...</a>
  document.querySelectorAll('[data-flights]').forEach(function (a) {
    a.href = tp('https://www.aviasales.com/?destination=' + enc(a.dataset.iata || ''), A.p.flights);
    a.rel = 'sponsored noopener'; a.target = '_blank';
  });
})();
