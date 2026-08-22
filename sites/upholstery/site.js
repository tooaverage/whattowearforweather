(function () {
  function track(name, props) {
    try {
      if (window.plausible) window.plausible(name, props ? { props: props } : undefined);
    } catch (e) {}
  }

  var form = document.getElementById('estimate-form');
  if (!form) return;

  var started = false;
  var photoTracked = false;
  var photos = form.querySelector('input[type="file"]');
  var waitlist = form.querySelector('input[name="waitlist"]');
  var status = document.getElementById('form-status');
  var btn = form.querySelector('button[type="submit"]');
  var fallbackEmail = form.getAttribute('data-fallback-email') || '';

  form.addEventListener('focusin', function () {
    if (!started) {
      started = true;
      track('form_start');
    }
  });

  if (photos) {
    photos.addEventListener('change', function () {
      if (photos.files.length > 0 && !photoTracked) {
        photoTracked = true;
        track('photo_attached', { count: photos.files.length });
      }
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    btn.disabled = true;
    if (status) status.textContent = 'Sending...';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('send failed');
        track('form_submit', {
          photos: photos ? photos.files.length : 0,
          waitlist: waitlist && waitlist.checked ? 'yes' : 'no'
        });
        if (waitlist && waitlist.checked) track('waitlist_opt_in');
        // Give the analytics requests a moment before navigating away.
        setTimeout(function () {
          window.location.href = '/thanks/';
        }, 400);
      })
      .catch(function () {
        btn.disabled = false;
        if (status) {
          status.textContent = fallbackEmail
            ? 'That did not go through. Email us instead: ' + fallbackEmail
            : 'That did not go through. Please try again.';
        }
      });
  });
})();
