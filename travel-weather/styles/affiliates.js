/* ============================================================================
   When To Go: affiliate hydration. Set your IDs once here and every page picks
   them up. These power the "where to stay" map and the flight/hotel buttons.
   Replace the two placeholder values with your real account IDs, then commit.
     - Stay22 affiliate id: dashboard.stay22.com  (looks like "wtg-xxxxx")
     - Travelpayouts marker: travelpayouts.com    (a number like "123456")
   Nothing here is indexed content, so building it in JS is fine.
   ========================================================================= */
window.AFFIL = {
  stay22Aid: 'REPLACE_WITH_STAY22_AID',
  tpMarker: 'REPLACE_WITH_TRAVELPAYOUTS_MARKER',
  tpProgram: '4114', // Travelpayouts white-label program id (4114 = travel search)
};

(function () {
  const A = window.AFFIL;

  // Stay22 GenieMap: <div class="embed" data-stay22 data-lat=".." data-lng=".." data-zoom="13"></div>
  document.querySelectorAll('[data-stay22]').forEach(function (el) {
    const d = el.dataset;
    const src = 'https://www.stay22.com/embed/gm'
      + '?aid=' + encodeURIComponent(A.stay22Aid)
      + '&lat=' + d.lat + '&lng=' + d.lng
      + '&zoom=' + (d.zoom || '13')
      + '&maincolor=ff5b39&hidemarkers=false';
    const f = document.createElement('iframe');
    f.src = src; f.loading = 'lazy'; f.title = 'Where to stay';
    f.style.cssText = 'width:100%;height:100%;border:0;display:block';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    el.appendChild(f);
  });

  // Travelpayouts link: <a data-tp="https://www.aviasales.com/search/...">Find flights</a>
  document.querySelectorAll('[data-tp]').forEach(function (a) {
    const target = a.dataset.tp;
    a.href = 'https://tp.media/r'
      + '?marker=' + encodeURIComponent(A.tpMarker)
      + '&p=' + A.tpProgram
      + '&u=' + encodeURIComponent(target);
    a.rel = 'sponsored noopener';
    a.target = '_blank';
  });
})();
