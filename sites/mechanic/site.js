(function () {
  window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
  function track(name, props) {
    try { window.plausible(name, props ? { props: props } : undefined); } catch (e) {}
  }

  var form = document.getElementById('estimate-form');
  if (!form) return;

  // FormSubmit needs an absolute return URL; point it at this host's thanks page.
  var next = form.querySelector('input[name="_next"]');
  if (next) next.value = window.location.origin + '/thanks/';

  var started = false;
  var photoTracked = false;
  var waitlistTracked = false;

  form.addEventListener('focusin', function () {
    if (!started) { started = true; track('form_start'); }
  });

  var photos = form.querySelector('input[type="file"]');
  if (photos) {
    photos.addEventListener('change', function () {
      if (photos.files.length > 0 && !photoTracked) {
        photoTracked = true;
        track('photo_attached', { count: photos.files.length });
      }
    });
  }

  var waitlist = form.querySelector('input[name="waitlist"]');
  if (waitlist) {
    waitlist.addEventListener('change', function () {
      if (waitlist.checked && !waitlistTracked) {
        waitlistTracked = true;
        track('waitlist_opt_in');
      }
    });
  }
})();
