/* Zoomy — 3D model viewer for 3d-modelling.html. Loads <model-viewer> only when someone opens a model. */
(function () {
  'use strict';
  var d = document, mv = d.getElementById('mv');
  if (!mv) return;
  var stage = mv.querySelector('.mv__stage'), title = mv.querySelector('#mv-title'), closeBtn = mv.querySelector('.mv__x');
  var loadTxt = stage.textContent.trim(), last = null, state = 0, queue = [];
  var ROOT = mv.getAttribute('data-root') || '';
  var SRC = [ROOT + 'js/vendor/model-viewer.min.js?v=4.3.1',
             'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js'];
  function ready() {
    var MV = window.customElements && customElements.get('model-viewer');
    if (MV) { try { MV.dracoDecoderLocation = new URL(ROOT + 'js/vendor/draco/', location.href).href; } catch (e) {} }
  }
  function load(cb, i) {
    if (state === 2 || window.customElements && customElements.get('model-viewer')) { state = 2; ready(); return cb(); }
    queue.push(cb);
    if (state === 1) return;
    state = 1; i = i || 0;
    try { window.ModelViewerElement = window.ModelViewerElement || {}; window.ModelViewerElement.dracoDecoderLocation = new URL(ROOT + 'js/vendor/draco/', location.href).href; } catch (e) {}
    var s = d.createElement('script'); s.type = 'module'; s.src = SRC[i];
    s.onload = function () { customElements.whenDefined('model-viewer').then(function () { state = 2; ready(); var q = queue; queue = []; q.forEach(function (f) { f(); }); }); };
    s.onerror = function () { if (i + 1 < SRC.length) { state = 0; var q = queue; queue = []; q.forEach(function (f) { load(f, i + 1); }); } };
    d.head.appendChild(s);
  }
  function open(btn) {
    last = btn;
    title.textContent = btn.getAttribute('data-title');
    stage.innerHTML = '<span class="mv__load">' + loadTxt + '</span>';
    mv.hidden = false; d.documentElement.style.overflow = 'hidden';
    closeBtn.focus();
    load(function () {
      if (mv.hidden) return;
      var el = d.createElement('model-viewer');
      el.setAttribute('src', btn.getAttribute('data-model'));
      el.setAttribute('alt', btn.getAttribute('data-title'));
      el.setAttribute('camera-controls', '');
      el.setAttribute('camera-orbit', btn.getAttribute('data-orbit') || '200deg 62deg auto');
      if (btn.getAttribute('data-fov')) el.setAttribute('field-of-view', btn.getAttribute('data-fov'));
      el.setAttribute('auto-rotate', '');
      el.setAttribute('auto-rotate-delay', '1200');
      el.setAttribute('rotation-per-second', '16deg');
      el.setAttribute('interaction-prompt', 'none');
      el.setAttribute('shadow-intensity', '0.8');
      el.setAttribute('exposure', '1.05');
      el.setAttribute('environment-image', 'neutral');
      el.setAttribute('touch-action', 'pan-y');
      el.addEventListener('load', function () { var l = stage.querySelector('.mv__load'); if (l) l.remove(); });
      stage.appendChild(el);
    });
    if (window.gtag) try { gtag('event', 'view_3d_model', { model: btn.getAttribute('data-title') }); } catch (e) {}
  }
  function close() {
    mv.hidden = true; stage.innerHTML = ''; d.documentElement.style.overflow = '';
    if (last) last.focus();
  }
  d.querySelectorAll('[data-model]').forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
  closeBtn.addEventListener('click', close);
  mv.addEventListener('click', function (e) { if (e.target === mv) close(); });
  d.addEventListener('keydown', function (e) {
    if (mv.hidden) return;
    if (e.key === 'Escape') close();
  });
})();
