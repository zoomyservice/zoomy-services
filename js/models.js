/* Zoomy — picture pop-up for the 3D gallery on 3d-modelling.html: tap a picture to see it large. */
(function () {
  'use strict';
  var d = document, mv = d.getElementById('mv');
  if (!mv) return;
  var pic = mv.querySelector('.mv__pic'), title = mv.querySelector('#mv-title'), closeBtn = mv.querySelector('.mv__x');
  var last = null;
  function open(btn) {
    last = btn;
    title.textContent = btn.getAttribute('data-title');
    var thumb = btn.querySelector('img');
    pic.alt = btn.getAttribute('data-title');
    pic.src = thumb ? thumb.currentSrc || thumb.src : '';          // show the loaded thumbnail at once
    var full = new Image();
    full.onload = function () { if (last === btn && !mv.hidden) pic.src = full.src; };
    full.src = btn.getAttribute('data-full');
    mv.hidden = false; d.documentElement.style.overflow = 'hidden';
    closeBtn.focus();
    if (window.gtag) try { gtag('event', 'view_3d_picture', { model: btn.getAttribute('data-title') }); } catch (e) {}
  }
  function close() {
    mv.hidden = true; pic.removeAttribute('src'); d.documentElement.style.overflow = '';
    if (last) last.focus();
  }
  d.querySelectorAll('[data-full]').forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
  closeBtn.addEventListener('click', close);
  mv.addEventListener('click', function (e) { if (e.target === mv || e.target === pic || e.target.classList.contains('mv__stage')) close(); });
  d.addEventListener('keydown', function (e) { if (!mv.hidden && e.key === 'Escape') close(); });
})();
