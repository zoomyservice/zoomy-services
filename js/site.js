(function () {
  'use strict';
  var d = document, html = d.documentElement;
  html.classList.remove('no-js');

  function track(name, fb) {
    try { if (window.gtag) gtag('event', name, { event_category: 'engagement' }); } catch (e) {}
    try { if (window.clarity) clarity('event', name); } catch (e) {}
    try { if (fb && window.fbq) fbq('track', fb); } catch (e) {}
  }
  window.zmyTrack = track;

  /* Header border once scrolled */
  var hdr = d.querySelector('.hdr');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu */
  var mbtn = d.querySelector('.menu-btn'), mnav = d.getElementById('mnav');
  if (mbtn && mnav) {
    var setMenu = function (open) {
      mnav.classList.toggle('open', open);
      d.body.classList.toggle('menu-open', open);
      mbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    mbtn.addEventListener('click', function () { setMenu(!mnav.classList.contains('open')); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 980) setMenu(false); });
  }

  /* Reveal on scroll */
  var els = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  /* Tabs */
  d.querySelectorAll('[data-tabs]').forEach(function (box) {
    var btns = box.querySelectorAll('[role=tab]');
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length;
          select(n); btns[n].focus();
        }
      });
    });
    function select(i) {
      btns.forEach(function (b, j) {
        var on = i === j;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        var p = d.getElementById(b.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
    }
  });

  /* Admin tour: sidebar items open the matching tab */
  d.querySelectorAll('[data-go]').forEach(function (el) {
    el.addEventListener('click', function () { var t = d.getElementById(el.getAttribute('data-go')); if (t) t.click(); });
  });

  /* CTA tracking */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="contact"]');
    if (a) track('cta_click', 'Contact');
    var m = e.target.closest('a[href^="mailto:"]');
    if (m) track('email_click', 'Contact');
  });

  /* Contact form */
  var form = d.getElementById('contact-form');
  if (form) {
    var btn = form.querySelector('button[type=submit]');
    var err = form.querySelector('.form__err');
    var label = btn ? btn.querySelector('.lbl') : null;
    var sending = form.getAttribute('data-sending') || 'Sending…';
    var original = label ? label.textContent : '';
    function cookie(n) { var m = d.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)'); return m ? m.pop() : null; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (err) err.classList.remove('show');
      var data = new FormData(form);
      var services = data.getAll('service');
      if (btn) btn.disabled = true;
      if (label) label.textContent = sending;
      try {
        fetch('https://zoomy-capi.zoozoomfast.workers.dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          first_name: data.get('first_name') || '', last_name: data.get('last_name') || '', email: data.get('email') || '',
          company: data.get('company') || '', services: services, event_source_url: location.href,
          client_user_agent: navigator.userAgent, fbp: cookie('_fbp'), fbc: cookie('_fbc')
        }) }).catch(function () {});
      } catch (x) {}
      track('form_submit', 'Lead');
      data.append('_site', 'zoomy.services');
      data.append('_lang', html.lang || 'en');
      fetch('https://zoomy-forms.zoozoomfast.workers.dev', { method: 'POST', body: data })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (r && r.ok) { location.href = form.getAttribute('data-thanks') || 'thank-you.html'; }
          else { throw new Error('bad'); }
        })
        .catch(function () {
          if (btn) btn.disabled = false;
          if (label) label.textContent = original;
          if (err) err.classList.add('show');
        });
    });
  }
})();
