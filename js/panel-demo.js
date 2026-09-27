/* Zoomy — interactive admin panel demo (admin-panel.html). Everything lives in memory; nothing is saved. */
(function () {
  'use strict';
  var d = document;
  var root = d.getElementById('pdemo');
  if (!root) return;
  var S = window.ZOOMY_DEMO_T || {};
  var LANG = (d.documentElement.lang || 'en').slice(0, 2);
  var BASE = root.getAttribute('data-root') || '';
  var IMG = BASE + 'img/demo/';

  /* ------------------------------------------------------------------
     DATA — the example shop. Set ready:true once the photo file exists
     in img/demo/. Names are [English, French, Spanish].
     ------------------------------------------------------------------ */
  var PRODUCTS = [
    { id: 'watch', ready: true, name: ['Chronograph watch', 'Montre chronographe', 'Reloj cronógrafo'], desc: ['Steel case, leather strap, two small dials.', 'Boîtier acier, bracelet cuir, deux petits cadrans.', 'Caja de acero, correa de cuero, dos esferas pequeñas.'], photos: ['watch.jpg', 'watch-dial.jpg', 'watch-crown.jpg', 'watch-wide.jpg'], avail: 'on', home: true },
    { id: 'perfume', ready: true, name: ['Eau de parfum', 'Eau de parfum', 'Eau de parfum'], desc: ['Amber scent in a heavy glass bottle.', 'Parfum ambré dans un flacon en verre épais.', 'Aroma ámbar en un frasco de vidrio grueso.'], photos: ['perfume.jpg'], avail: 'on', home: true },
    { id: 'keyboard', ready: true, name: ['Mechanical keyboard', 'Clavier mécanique', 'Teclado mecánico'], desc: ['Compact layout, aluminium case.', 'Format compact, boîtier en aluminium.', 'Formato compacto, caja de aluminio.'], photos: ['keyboard.jpg'], avail: 'on', home: false },
    { id: 'camera', ready: true, name: ['Film camera', 'Appareil photo argentique', 'Cámara de película'], desc: ['Manual focus, metal body.', 'Mise au point manuelle, boîtier métal.', 'Enfoque manual, cuerpo de metal.'], photos: ['camera.jpg'], avail: 'on', home: false },
    { id: 'headphones', ready: false, name: ['Wireless headphones', 'Casque sans fil', 'Auriculares inalámbricos'], desc: ['Over-ear, soft leather cushions.', 'Circum-auriculaire, coussinets en cuir.', 'Sobre la oreja, almohadillas de cuero.'], photos: ['headphones.jpg'], avail: 'on', home: false },
    { id: 'microphone', ready: false, name: ['Studio microphone', 'Micro de studio', 'Micrófono de estudio'], desc: ['Clear voice, metal mesh grille.', 'Voix claire, grille en métal.', 'Voz clara, rejilla de metal.'], photos: ['microphone.jpg'], avail: 'on', home: false },
    { id: 'turntable', ready: false, name: ['Record player', 'Platine vinyle', 'Tocadiscos'], desc: ['Two speeds, wooden base.', 'Deux vitesses, socle en bois.', 'Dos velocidades, base de madera.'], photos: ['turntable.jpg'], avail: 'on', home: false },
    { id: 'lamp', ready: false, name: ['Desk lamp', 'Lampe de bureau', 'Lámpara de escritorio'], desc: ['Adjustable arm, warm light.', 'Bras réglable, lumière chaude.', 'Brazo ajustable, luz cálida.'], photos: ['lamp.jpg'], avail: 'on', home: false }
  ];
  var SERVICES = [
    { id: 'wrap', name: ['Gift wrapping', 'Emballage cadeau', 'Envoltorio de regalo'], desc: ['Any order, any size.', 'Toute commande, toute taille.', 'Cualquier pedido, cualquier tamaño.'], avail: 'on' },
    { id: 'engrave', name: ['Engraving', 'Gravure', 'Grabado'], desc: ['Up to 20 letters.', 'Jusqu’à 20 lettres.', 'Hasta 20 letras.'], avail: 'hidden' }
  ];
  /* ------------------------------------------------------------------ */

  var LI = { en: 0, fr: 1, es: 2 }[LANG] || 0;
  function L3(a) { return a[LI] || a[0]; }
  function t(k, v) {
    var s = S[k] || k;
    if (v) for (var n in v) s = s.split('{' + n + '}').join(v[n]);
    return s;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid() { return 'x' + Math.random().toString(36).slice(2, 9); }

  /* ------------------------------------------------------------------ state */
  var items = PRODUCTS.filter(function (p) { return p.ready; }).map(function (p) {
    return { id: p.id, kind: 'product', name: L3(p.name), desc: L3(p.desc), photos: p.photos.map(function (f) { return IMG + f; }), main: 0, avail: p.avail, home: p.home };
  }).concat(SERVICES.map(function (s) {
    return { id: s.id, kind: 'service', name: L3(s.name), desc: L3(s.desc), photos: [], main: 0, avail: s.avail, home: false };
  }));
  var photos = [];
  PRODUCTS.forEach(function (p) {
    if (!p.ready) return;
    p.photos.forEach(function (f, i) { photos.push({ id: uid(), src: IMG + f, tag: i === 0 ? 'product' : 'detail', alt: L3(p.name) }); });
  });
  var st = {
    page: 'home', changes: 0, filter: 'all', q: '', phFilter: 'all', ordFilter: 'new',
    home: { headline: t('headline_v'), button: t('button_v'), photo: photos.length > 3 ? photos[3].src : (photos[0] && photos[0].src), featured: items.filter(function (i) { return i.home; }).map(function (i) { return i.id; }) },
    days: [0, 1, 2, 3, 4, 5, 6].map(function (i) { return { i: i, open: i !== 6, from: i === 5 ? 600 : 540, to: i === 5 ? 960 : (i === 4 ? 1080 : 1080) }; }),
    hol: [{ id: uid(), name: t('hol1'), date: t('hol1d'), until: null }, { id: uid(), name: t('hol2'), date: t('hol2d'), until: 840 }, { id: uid(), name: t('hol3'), date: t('hol3d'), until: null }],
    upcoming: [{ id: uid(), name: t('up1'), date: t('up1d') }, { id: uid(), name: t('up2'), date: t('up2d') }],
    orders: [
      { id: uid(), who: 'Dana', what: t('o1'), meta: t('o1m'), num: '(555) 014-2290', done: false },
      { id: uid(), who: 'Marco', what: t('o2'), meta: t('o2m'), num: '(555) 017-8841', done: false },
      { id: uid(), who: 'Priya', what: t('o3'), meta: t('o3m'), num: '(555) 012-7730', done: false },
      { id: uid(), who: 'Leo', what: t('o4'), meta: t('o4m'), num: '(555) 019-3306', done: true }
    ],
    ann: { text: t('ann_v'), start: '2026-11-20', end: '2026-11-27', show: true, agent: true },
    staff: [
      { id: 'me', name: t('you'), role: 'owner', init: 'Y', bg: 'var(--butter)' },
      { id: uid(), name: 'Maria', role: 'manager', init: 'M', bg: 'var(--mint)' },
      { id: uid(), name: 'Sam', role: 'staff', init: 'S', bg: 'var(--sky)' }
    ],
    signin: true,
    history: [],
    seeded: [
      { id: uid(), text: t('seed1'), who: 'Maria', when: t('seed1w'), day: 'today', av: 'M', bg: 'var(--mint)' },
      { id: uid(), text: t('seed2'), who: t('you'), when: t('seed2w'), day: 'yesterday', av: 'Y', bg: 'var(--butter)' },
      { id: uid(), text: t('seed3'), who: 'Sam', when: t('seed3w'), day: 'yesterday', av: 'S', bg: 'var(--sky)' }
    ],
    overlay: null, editing: null, addHol: false, addStaff: false
  };
  function item(id) { for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i]; return null; }
  function mainPhoto(it) { return it.photos.length ? it.photos[Math.min(it.main, it.photos.length - 1)] : ''; }

  /* change tracking + history */
  function change(text, undo) {
    st.changes++;
    st.history.unshift({ id: uid(), text: text, who: t('you'), when: t('justnow'), day: 'today', av: 'Y', bg: 'var(--butter)', undo: undo });
  }

  /* ------------------------------------------------------------------ time helpers */
  function fmt(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    if (LANG === 'en') { var ap = h < 12 ? 'AM' : 'PM', h12 = h % 12 || 12; return h12 + (mm ? ':' + ('0' + mm).slice(-2) : '') + ' ' + ap; }
    if (LANG === 'fr') return h + ' h' + (mm ? ' ' + ('0' + mm).slice(-2) : '');
    return h + ':' + ('0' + mm).slice(-2);
  }
  function timeSel(val, act, idx, label) {
    var o = '';
    for (var m = 360; m <= 1320; m += 30) o += '<option value="' + m + '"' + (m === val ? ' selected' : '') + '>' + fmt(m) + '</option>';
    return '<select class="pd-sel pd-time" data-act="' + act + '" data-i="' + idx + '" aria-label="' + esc(label) + '">' + o + '</select>';
  }
  function fmtDate(iso) {
    try { var dt = new Date(iso + 'T12:00:00'); return dt.toLocaleDateString(LANG === 'en' ? 'en-US' : LANG, { weekday: 'short', month: 'short', day: 'numeric' }); } catch (e) { return iso; }
  }

  /* ------------------------------------------------------------------ icons (same set as the static mock) */
  var ICO = {
    home: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2.5 7.2L8 2.8l5.5 4.4V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5z"/></svg>',
    products: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2.5 4h11M2.5 8h11M2.5 12h7"/></svg>',
    photos: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2" y="3" width="12" height="10" rx="2"/><path d="M2.5 11l3.2-3 2.6 2.4 1.8-1.6 3.4 3"/></svg>',
    hours: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="5.8"/><path d="M8 4.8V8l2.2 1.4"/></svg>',
    orders: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3.2 2.5h2.3l1.1 2.8-1.4 1a7.5 7.5 0 0 0 4.5 4.5l1-1.4 2.8 1.1v2.3a.9.9 0 0 1-1 .9A11 11 0 0 1 2.3 3.5a.9.9 0 0 1 .9-1z"/></svg>',
    ann: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2.5 6.5v3h2l5 3v-9l-5 3zM12 5.5a3.5 3.5 0 0 1 0 5"/></svg>',
    history: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2.8 8a5.2 5.2 0 1 0 1.5-3.7M2.5 2.8v2.4h2.4M8 5.2V8l1.8 1.2"/></svg>',
    staff: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="3" y="7" width="10" height="6.5" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',
    search: '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>',
    up: '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l4-4 4 4"/></svg>',
    down: '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>',
    x: '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    gift: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v7h14v-7M12 8.5v11M12 8.5c-1.5-3-5-3.5-5-1.2 0 1.2 2 1.2 5 1.2zm0 0c1.5-3 5-3.5 5-1.2 0 1.2-2 1.2-5 1.2z"/></svg>'
  };
  var PAGES = ['home', 'products', 'photos', 'hours', 'orders', 'ann', 'history', 'staff'];

  /* ------------------------------------------------------------------ render */
  function thumb(it, cls) {
    var src = mainPhoto(it);
    if (src) return '<span class="thumb pd-thumb ' + (cls || '') + '"><img src="' + esc(src) + '" alt="" loading="lazy" onerror="this.remove()"></span>';
    return '<span class="thumb pd-thumb pd-thumb--svc ' + (cls || '') + '">' + ICO.gift + '</span>';
  }
  function availSel(it) {
    var cls = it.avail === 'out' ? ' out' : it.avail === 'hidden' ? ' hid' : '';
    return '<select class="pd-sel pd-avail' + cls + '" data-act="avail" data-id="' + it.id + '" aria-label="' + esc(t('f_avail') + ': ' + it.name) + '">' +
      ['on', 'out', 'hidden'].map(function (v) { return '<option value="' + v + '"' + (it.avail === v ? ' selected' : '') + '>' + esc(t('a_' + v)) + '</option>'; }).join('') + '</select>';
  }
  function tog(on, act, label, extra) {
    return '<button type="button" class="tog' + (on ? '' : ' off') + '" role="switch" aria-checked="' + (on ? 'true' : 'false') + '" aria-label="' + esc(label) + '" data-act="' + act + '"' + (extra || '') + '></button>';
  }
  function head(title, sub) { return '<h5>' + esc(title) + '</h5><p class="sub">' + esc(sub) + '</p>'; }
  function chip(on, act, val, label) { return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-act="' + act + '" data-v="' + val + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(label) + '</button>'; }

  function pageHome() {
    var h = st.home, out = head(t('p_home'), t('home_sub'));
    out += '<div class="grp"><div class="grp__hd">' + esc(t('top')) + '</div>';
    out += editRow('headline', t('headline'), h.headline);
    out += '<div class="item"><span class="thumb pd-thumb">' + (h.photo ? '<img src="' + esc(h.photo) + '" alt="" loading="lazy">' : '') + '</span><span class="item__name">' + esc(t('bigphoto')) + '<small>' + esc(t('bigphoto_sub')) + '</small></span><button type="button" class="grp__btn" data-act="pickphoto">' + esc(t('change')) + '</button></div>';
    out += editRow('button', t('button'), h.button);
    out += '</div>';
    out += '<div class="grp"><div class="grp__hd">' + esc(t('featured')) + ' <small>· ' + h.featured.length + '</small><button type="button" class="grp__btn" data-act="pickitem">' + esc(t('add')) + '</button></div>';
    if (!h.featured.length) out += '<div class="item"><span class="item__name pd-muted">' + esc(t('nofeat')) + '</span></div>';
    h.featured.forEach(function (id, n) {
      var it = item(id); if (!it) return;
      out += '<div class="item">' + thumb(it) + '<span class="item__name">' + esc(it.name) + (it.avail !== 'on' ? '<small>' + esc(t('a_' + it.avail)) + '</small>' : '') + '</span>' +
        '<span class="pd-icons"><button type="button" class="pd-ib" data-act="fup" data-i="' + n + '" aria-label="' + esc(t('up')) + '"' + (n === 0 ? ' disabled' : '') + '>' + ICO.up + '</button>' +
        '<button type="button" class="pd-ib" data-act="fdown" data-i="' + n + '" aria-label="' + esc(t('down')) + '"' + (n === h.featured.length - 1 ? ' disabled' : '') + '>' + ICO.down + '</button>' +
        '<button type="button" class="pd-ib" data-act="frm" data-i="' + n + '" aria-label="' + esc(t('remove')) + '">' + ICO.x + '</button></span></div>';
    });
    return out + '</div>';
  }
  function editRow(key, label, val) {
    if (st.editing === key) {
      return '<div class="item pd-editrow"><label class="item__name">' + esc(label) + '<input class="pd-in" id="pd-edit" value="' + esc(val) + '" maxlength="60"></label><button type="button" class="grp__btn pd-primary" data-act="saveedit" data-k="' + key + '">' + esc(t('save')) + '</button><button type="button" class="grp__btn" data-act="canceledit">' + esc(t('cancel')) + '</button></div>';
    }
    return '<div class="item"><span class="item__name">' + esc(label) + '<small>' + esc(val) + '</small></span><button type="button" class="grp__btn" data-act="edit" data-k="' + key + '">' + esc(t('edit')) + '</button></div>';
  }

  function pageProducts() {
    var out = head(t('p_products'), t('prod_sub'));
    out += '<div class="admin__tools"><label class="admin__search">' + ICO.search + '<input class="pd-search" id="pd-q" type="search" placeholder="' + esc(t('find')) + '" value="' + esc(st.q) + '" aria-label="' + esc(t('find')) + '"></label>' +
      chip(st.filter === 'all', 'filter', 'all', t('f_all')) + chip(st.filter === 'out', 'filter', 'out', t('f_out')) + chip(st.filter === 'hidden', 'filter', 'hidden', t('f_hidden')) + '</div>';
    var q = st.q.trim().toLowerCase();
    ['product', 'service'].forEach(function (kind) {
      var list = items.filter(function (it) {
        return it.kind === kind && (st.filter === 'all' || it.avail === st.filter) && (!q || it.name.toLowerCase().indexOf(q) >= 0);
      });
      var total = items.filter(function (it) { return it.kind === kind; }).length;
      out += '<div class="grp"><div class="grp__hd">' + esc(t(kind === 'product' ? 'g_products' : 'g_services')) + ' <small>· ' + total + '</small><button type="button" class="grp__btn" data-act="additem" data-kind="' + kind + '">' + esc(t('add_item')) + '</button></div>';
      if (!list.length) out += '<div class="item"><span class="item__name pd-muted">' + esc(t('noresults')) + '</span></div>';
      list.forEach(function (it) {
        var small = it.home ? t('on_home') : (it.photos.length ? (it.photos.length === 1 ? t('photo1') : t('photos_n', { n: it.photos.length })) : it.desc);
        out += '<div class="item">' + thumb(it) + '<button type="button" class="item__name pd-link" data-act="open" data-id="' + it.id + '">' + esc(it.name) + '<small>' + esc(small) + '</small></button>' + availSel(it) + '</div>';
      });
      out += '</div>';
    });
    return out;
  }

  function pagePhotos() {
    var out = head(t('p_photos'), t('ph_sub'));
    var used = {}; items.forEach(function (it) { it.photos.forEach(function (p) { used[p] = 1; }); }); if (st.home.photo) used[st.home.photo] = 1;
    out += '<div class="admin__tools">' + chip(st.phFilter === 'all', 'phf', 'all', t('ph_all') + ' · ' + photos.length) + chip(st.phFilter === 'product', 'phf', 'product', t('ph_products')) + chip(st.phFilter === 'detail', 'phf', 'detail', t('ph_details')) + chip(st.phFilter === 'unused', 'phf', 'unused', t('ph_unused')) + '</div>';
    out += '<div class="pgrid"><label class="up pd-up"><input type="file" accept="image/*" multiple data-act="upload" hidden>' + esc(t('upload')) + '</label>';
    photos.forEach(function (p) {
      var show = st.phFilter === 'all' || (st.phFilter === 'unused' ? !used[p.src] : p.tag === st.phFilter);
      if (!show) return;
      out += '<button type="button" class="ph" data-act="photo" data-id="' + p.id + '" aria-label="' + esc(p.alt) + '"><img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" loading="lazy" onerror="this.parentNode.remove()">' + (p.tag === 'new' ? '<span class="pd-tag">' + esc(t('ph_new')) + '</span>' : '') + '</button>';
    });
    return out + '</div>';
  }

  function pageHours() {
    var out = head(t('p_hours'), t('hours_sub')) + '<div class="hrs"><div class="grp"><div class="grp__hd">' + esc(t('weekly')) + '</div>';
    st.days.forEach(function (dy, i) {
      var dn = t('day' + i);
      out += '<div class="item hr"><span class="item__name">' + esc(dn) + '</span>' + tog(dy.open, 'day', dn, ' data-i="' + i + '"') +
        (dy.open ? timeSel(dy.from, 'from', i, dn + ' ' + t('opens')) + timeSel(dy.to, 'to', i, dn + ' ' + t('closes')) : '<span class="closed">' + esc(t('closed')) + '</span>') + '</div>';
    });
    out += '</div><div><div class="grp"><div class="grp__hd">' + esc(t('holidays_hd')) + '<button type="button" class="grp__btn" data-act="addhol">' + esc(t('add')) + '</button></div>';
    if (st.addHol) {
      out += '<div class="item pd-form"><input class="pd-in" id="pd-hname" placeholder="' + esc(t('hol_name')) + '" aria-label="' + esc(t('hol_name')) + '"><input class="pd-in" id="pd-hdate" type="date" value="2026-12-31" aria-label="' + esc(t('hol_date')) + '">' +
        '<select class="pd-sel" id="pd-huntil" aria-label="' + esc(t('hol_hours')) + '"><option value="">' + esc(t('closed')) + '</option><option value="720">' + esc(t('until', { t: fmt(720) })) + '</option><option value="840">' + esc(t('until', { t: fmt(840) })) + '</option><option value="960">' + esc(t('until', { t: fmt(960) })) + '</option></select>' +
        '<button type="button" class="grp__btn pd-primary" data-act="savehol">' + esc(t('add_btn')) + '</button><button type="button" class="grp__btn" data-act="cancelhol">' + esc(t('cancel')) + '</button></div>';
    }
    if (!st.hol.length) out += '<div class="item"><span class="item__name pd-muted">' + esc(t('nohol')) + '</span></div>';
    st.hol.forEach(function (h) {
      out += '<div class="item"><span class="item__name">' + esc(h.name) + '<small>' + esc(h.date) + '</small></span>' + (h.until ? '<span class="pill-s">' + esc(t('until', { t: fmt(h.until) })) + '</span>' : '<span class="pill-c">' + esc(t('closed')) + '</span>') +
        '<button type="button" class="pd-ib" data-act="rmhol" data-id="' + h.id + '" aria-label="' + esc(t('remove') + ': ' + h.name) + '">' + ICO.x + '</button></div>';
    });
    out += '</div>';
    if (st.upcoming.length) {
      out += '<div class="grp"><div class="grp__hd">' + esc(t('coming')) + '</div>';
      st.upcoming.forEach(function (u) {
        out += '<div class="item"><span class="item__name">' + esc(u.name) + '<small>' + esc(u.date) + '</small></span><button type="button" class="grp__btn" data-act="upclosed" data-id="' + u.id + '">' + esc(t('add_closed')) + '</button><button type="button" class="grp__btn" data-act="uphours" data-id="' + u.id + '">' + esc(t('add_hours')) + '</button></div>';
      });
      out += '</div>';
    }
    return out + '</div></div>';
  }

  function pageOrders() {
    var nNew = st.orders.filter(function (o) { return !o.done; }).length;
    var out = head(t('p_orders'), t('ord_sub'));
    out += '<div class="admin__tools">' + chip(st.ordFilter === 'new', 'ordf', 'new', t('o_new') + ' · ' + nNew) + chip(st.ordFilter === 'done', 'ordf', 'done', t('o_done')) + chip(st.ordFilter === 'all', 'ordf', 'all', t('o_all')) + '</div><div class="grp">';
    var list = st.orders.filter(function (o) { return st.ordFilter === 'all' || (st.ordFilter === 'new' ? !o.done : o.done); });
    if (!list.length) out += '<div class="item"><span class="item__name pd-muted">' + esc(t('no_orders')) + '</span></div>';
    list.forEach(function (o) {
      out += '<div class="item' + (o.done ? ' pd-done' : '') + '"><span class="item__name">' + esc(o.what) + '<small>' + esc(o.who + ' · ' + o.meta) + '</small></span>' +
        '<button type="button" class="call pd-call" data-act="call" data-id="' + o.id + '">' + esc(o.num) + '</button>' +
        '<button type="button" class="grp__btn" data-act="' + (o.done ? 'reopen' : 'done') + '" data-id="' + o.id + '">' + esc(t(o.done ? 'reopen' : 'mark_done')) + '</button></div>';
    });
    return out + '</div><p class="sub">' + esc(t('ord_note')) + '</p>';
  }

  function pageAnn() {
    var a = st.ann, out = head(t('p_ann'), t('ann_sub'));
    out += '<div class="ann' + (a.show ? '' : ' pd-off') + '">' + esc(a.text || '…') + '</div><div class="grp">';
    out += '<div class="item pd-editrow"><label class="item__name">' + esc(t('message')) + '<input class="pd-in" id="pd-ann" value="' + esc(a.text) + '" maxlength="90"></label></div>';
    out += '<div class="item"><label class="item__name" for="pd-as">' + esc(t('starts')) + '</label><input class="pd-in pd-date" id="pd-as" type="date" value="' + a.start + '" data-act="annstart"></div>';
    out += '<div class="item"><label class="item__name" for="pd-ae">' + esc(t('ends')) + '</label><input class="pd-in pd-date" id="pd-ae" type="date" value="' + a.end + '" data-act="annend"></div>';
    out += '<div class="item"><span class="item__name">' + esc(t('show_site')) + '</span>' + tog(a.show, 'annshow', t('show_site')) + '</div>';
    out += '<div class="item"><span class="item__name">' + esc(t('tell_agent')) + '</span>' + tog(a.agent, 'annagent', t('tell_agent')) + '</div>';
    return out + '</div>';
  }

  function pageHistory() {
    var out = head(t('p_history'), t('hist_sub'));
    var all = st.history.concat(st.seeded);
    ['today', 'yesterday'].forEach(function (day) {
      var list = all.filter(function (h) { return h.day === day; });
      if (!list.length) return;
      out += '<div class="grp"><div class="grp__hd">' + esc(t(day)) + '</div>';
      list.forEach(function (h) {
        out += '<div class="item"><span class="av" style="background:' + h.bg + '">' + esc(h.av) + '</span><span class="item__name">' + esc(h.text) + '<small>' + esc(h.who + ' · ' + h.when) + '</small></span><button type="button" class="grp__btn" data-act="undo" data-id="' + h.id + '">' + esc(t('undo')) + '</button></div>';
      });
      out += '</div>';
    });
    return out;
  }

  function roleSel(p) {
    if (p.role === 'owner') return '<span class="pill-s">' + esc(t('r_owner')) + '</span>';
    return '<select class="pd-sel" data-act="role" data-id="' + p.id + '" aria-label="' + esc(t('role') + ': ' + p.name) + '">' + ['manager', 'staff'].map(function (r) { return '<option value="' + r + '"' + (p.role === r ? ' selected' : '') + '>' + esc(t('r_' + r)) + '</option>'; }).join('') + '</select>';
  }
  function pageStaff() {
    var out = head(t('p_staff'), t('staff_sub'));
    out += '<div class="grp"><div class="grp__hd">' + esc(t('people')) + ' <small>· ' + st.staff.length + '</small><button type="button" class="grp__btn" data-act="addstaff">' + esc(t('add_person')) + '</button></div>';
    if (st.addStaff) {
      out += '<div class="item pd-form"><input class="pd-in" id="pd-sname" placeholder="' + esc(t('name')) + '" aria-label="' + esc(t('name')) + '"><select class="pd-sel" id="pd-srole" aria-label="' + esc(t('role')) + '"><option value="staff">' + esc(t('r_staff')) + '</option><option value="manager">' + esc(t('r_manager')) + '</option></select>' +
        '<button type="button" class="grp__btn pd-primary" data-act="savestaff">' + esc(t('add_btn')) + '</button><button type="button" class="grp__btn" data-act="cancelstaff">' + esc(t('cancel')) + '</button></div>';
    }
    st.staff.forEach(function (p) {
      out += '<div class="item"><span class="av" style="background:' + p.bg + '">' + esc(p.init) + '</span><span class="item__name">' + esc(p.name) + '<small>' + esc(t('acc_' + p.role)) + '</small></span>' + roleSel(p) +
        (p.role === 'owner' ? '' : '<button type="button" class="pd-ib" data-act="rmstaff" data-id="' + p.id + '" aria-label="' + esc(t('remove') + ': ' + p.name) + '">' + ICO.x + '</button>') + '</div>';
    });
    out += '</div><div class="grp"><div class="item"><span class="item__name">' + esc(t('signin')) + '<small>' + esc(t('signin_sub')) + '</small></span>' + tog(st.signin, 'signin', t('signin')) + '</div></div>';
    return out;
  }

  /* overlays */
  function ovEditor() {
    var it = item(st.overlay.id); if (!it) return '';
    var ph = it.photos.map(function (p, i) { return '<button type="button" class="pd-strip' + (i === st.overlay.main ? ' on' : '') + '" data-act="edmain" data-i="' + i + '" aria-label="' + esc(t('mainphoto') + ' ' + (i + 1)) + '"><img src="' + esc(p) + '" alt="" loading="lazy"></button>'; }).join('');
    return '<div class="pd-card" role="dialog" aria-modal="true" aria-labelledby="pd-edt"><div class="pd-cardhd"><h6 id="pd-edt">' + esc(t('ed_title')) + '</h6><button type="button" class="pd-ib" data-act="closeov" aria-label="' + esc(t('close')) + '">' + ICO.x + '</button></div>' +
      '<label class="pd-lab">' + esc(t('f_name')) + '<input class="pd-in" id="pd-ename" value="' + esc(it.name) + '" maxlength="40"></label>' +
      '<label class="pd-lab">' + esc(t('f_desc')) + '<textarea class="pd-in pd-ta" id="pd-edesc" maxlength="120">' + esc(it.desc) + '</textarea></label>' +
      (it.photos.length ? '<div class="pd-lab">' + esc(t('f_photos')) + '<div class="pd-strips">' + ph + '</div></div>' : '') +
      '<label class="pd-lab">' + esc(t('f_avail')) + '<select class="pd-sel" id="pd-eavail">' + ['on', 'out', 'hidden'].map(function (v) { return '<option value="' + v + '"' + (it.avail === v ? ' selected' : '') + '>' + esc(t('a_' + v)) + '</option>'; }).join('') + '</select></label>' +
      '<div class="pd-lab pd-row"><span>' + esc(t('f_home')) + '</span>' + tog(st.overlay.home, 'edhome', t('f_home')) + '</div>' +
      '<div class="pd-actions"><button type="button" class="grp__btn" data-act="closeov">' + esc(t('cancel')) + '</button><button type="button" class="grp__btn pd-primary" data-act="saveitem">' + esc(t('save')) + '</button></div></div>';
  }
  function ovPhoto() {
    var p = null; photos.forEach(function (x) { if (x.id === st.overlay.id) p = x; });
    if (!p) return '';
    return '<div class="pd-card pd-card--photo" role="dialog" aria-modal="true" aria-label="' + esc(p.alt) + '"><div class="pd-cardhd"><h6>' + esc(p.alt) + '</h6><button type="button" class="pd-ib" data-act="closeov" aria-label="' + esc(t('close')) + '">' + ICO.x + '</button></div>' +
      '<img class="pd-big" src="' + esc(p.src) + '" alt="' + esc(p.alt) + '"><div class="pd-actions"><button type="button" class="grp__btn" data-act="delphoto" data-id="' + p.id + '">' + esc(t('delete')) + '</button><button type="button" class="grp__btn pd-primary" data-act="usehome" data-id="' + p.id + '">' + esc(t('use_home')) + '</button></div></div>';
  }
  function ovPick() {
    var out = '<div class="pd-card" role="dialog" aria-modal="true"><div class="pd-cardhd"><h6>' + esc(t(st.overlay.kind === 'photo' ? 'choose_photo' : 'choose_item')) + '</h6><button type="button" class="pd-ib" data-act="closeov" aria-label="' + esc(t('close')) + '">' + ICO.x + '</button></div>';
    if (st.overlay.kind === 'photo') {
      out += '<div class="pgrid pgrid--pick">' + photos.map(function (p) { return '<button type="button" class="ph' + (p.src === st.home.photo ? ' on' : '') + '" data-act="setphoto" data-id="' + p.id + '" aria-label="' + esc(p.alt) + '"><img src="' + esc(p.src) + '" alt="" loading="lazy"></button>'; }).join('') + '</div>';
    } else {
      var left = items.filter(function (it) { return st.home.featured.indexOf(it.id) < 0; });
      if (!left.length) out += '<p class="sub">' + esc(t('all_featured')) + '</p>';
      out += '<div class="grp">' + left.map(function (it) { return '<div class="item">' + thumb(it) + '<span class="item__name">' + esc(it.name) + '</span><button type="button" class="grp__btn" data-act="feat" data-id="' + it.id + '">' + esc(t('add_btn')) + '</button></div>'; }).join('') + '</div>';
    }
    return out + '</div>';
  }
  function ovPreview() {
    var a = st.ann, h = st.home;
    var feat = h.featured.map(item).filter(function (it) { return it && it.avail !== 'hidden'; });
    var out = '<div class="pd-card pd-card--site" role="dialog" aria-modal="true" aria-labelledby="pd-pvt"><div class="pd-cardhd"><h6 id="pd-pvt">' + esc(t('prev_title')) + '</h6><button type="button" class="pd-ib" data-act="closeov" aria-label="' + esc(t('close')) + '">' + ICO.x + '</button></div><div class="pd-site">';
    if (a.show && a.text) out += '<div class="pd-site__ann">' + esc(a.text) + '</div>';
    out += '<div class="pd-site__bar"><b>' + esc(t('brand')) + '</b><span>' + esc(t('p_products')) + '</span><span>' + esc(t('prev_contact')) + '</span></div>';
    out += '<div class="pd-site__hero">' + (h.photo ? '<img src="' + esc(h.photo) + '" alt="">' : '') + '<div><strong>' + esc(h.headline) + '</strong><span class="pd-site__btn">' + esc(h.button) + '</span></div></div>';
    if (feat.length) {
      out += '<div class="pd-site__grid">' + feat.map(function (it) {
        return '<div class="pd-site__card">' + (mainPhoto(it) ? '<img src="' + esc(mainPhoto(it)) + '" alt="">' : '<span class="pd-site__svc">' + ICO.gift + '</span>') + '<b>' + esc(it.name) + '</b>' + (it.avail === 'out' ? '<em>' + esc(t('a_out')) + '</em>' : '<small>' + esc(it.desc) + '</small>') + '</div>';
      }).join('') + '</div>';
    }
    var today = st.days[(new Date().getDay() + 6) % 7];
    out += '<div class="pd-site__hours"><b>' + esc(t('prev_hours')) + '</b> ' + esc(today.open ? t('prev_open', { a: fmt(today.from), b: fmt(today.to) }) : t('prev_closed')) + '</div>';
    return out + '</div><p class="sub">' + esc(t('prev_note')) + '</p></div>';
  }

  var mainEl, statusEl, sideEl, ovEl, toastEl, switchEl;
  function build() {
    root.innerHTML =
      '<div class="admin pd-admin">' +
      '<div class="admin__top"><span class="admin__brand"><i>Y</i>' + esc(t('brand')) + ' <small>Admin</small></span><span class="admin__status" aria-live="polite"></span>' +
      '<span class="admin__btns"><button type="button" data-act="preview">' + esc(t('preview')) + '</button><button type="button" class="pub" data-act="publish">' + esc(t('publish')) + '</button></span></div>' +
      '<div class="admin__body"><nav class="admin__side" aria-label="' + esc(t('pages')) + '"></nav><div class="admin__main pd-main" tabindex="-1"></div>' +
      '<div class="pd-ov" hidden></div><div class="toast pd-toast" role="status" aria-live="polite"><span class="tick"></span><span class="pd-toast__t"></span></div></div></div>';
    mainEl = root.querySelector('.pd-main'); statusEl = root.querySelector('.admin__status'); sideEl = root.querySelector('.admin__side');
    ovEl = root.querySelector('.pd-ov'); toastEl = root.querySelector('.pd-toast');
  }
  function render(keepScroll) {
    var y = mainEl.scrollTop;
    var nNew = st.orders.filter(function (o) { return !o.done; }).length;
    sideEl.innerHTML = PAGES.map(function (p) {
      return '<button type="button" class="sb' + (st.page === p ? ' on' : '') + '" data-act="go" data-p="' + p + '"' + (st.page === p ? ' aria-current="page"' : '') + '>' + ICO[p] + esc(t('p_' + p)) + (p === 'orders' && nNew ? '<b>' + nNew + '</b>' : '') + '</button>';
    }).join('');
    statusEl.textContent = st.changes === 0 ? t('nochanges') : st.changes === 1 ? t('change1') : t('changesN', { n: st.changes });
    statusEl.classList.toggle('clean', st.changes === 0);
    var sw = '<label class="pd-switch"><span class="pd-vh">' + esc(t('pages')) + '</span><select class="pd-sel" data-act="goSel">' + PAGES.map(function (p) { return '<option value="' + p + '"' + (st.page === p ? ' selected' : '') + '>' + esc(t('p_' + p)) + (p === 'orders' && nNew ? ' · ' + nNew : '') + '</option>'; }).join('') + '</select></label>';
    var body = { home: pageHome, products: pageProducts, photos: pagePhotos, hours: pageHours, orders: pageOrders, ann: pageAnn, history: pageHistory, staff: pageStaff }[st.page]();
    mainEl.innerHTML = sw + body;
    if (keepScroll) mainEl.scrollTop = y;
    if (st.overlay) {
      ovEl.hidden = false;
      ovEl.innerHTML = { edit: ovEditor, photo: ovPhoto, pick: ovPick, preview: ovPreview }[st.overlay.type]();
      var f = ovEl.querySelector('input, textarea, select, button'); if (f && !ovEl.contains(d.activeElement)) f.focus();
    } else { ovEl.hidden = true; ovEl.innerHTML = ''; }
  }
  var tt;
  function toast(msg) {
    toastEl.querySelector('.pd-toast__t').textContent = msg;
    toastEl.classList.add('show'); clearTimeout(tt);
    tt = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }
  function go(p) { st.page = p; st.editing = null; st.addHol = false; st.addStaff = false; st.overlay = null; render(); mainEl.scrollTop = 0; }

  /* ------------------------------------------------------------------ actions */
  var A = {
    go: function (el) { go(el.getAttribute('data-p')); },
    publish: function () {
      if (!st.changes) { toast(t('nothing')); return; }
      st.changes = 0; render(true); toast(t('published'));
    },
    preview: function () { st.overlay = { type: 'preview' }; render(true); },
    closeov: function () { st.overlay = null; render(true); },
    /* home */
    edit: function (el) { st.editing = el.getAttribute('data-k'); render(true); var i = d.getElementById('pd-edit'); if (i) { i.focus(); i.select(); } },
    canceledit: function () { st.editing = null; render(true); },
    saveedit: function (el) {
      var k = el.getAttribute('data-k'), v = (d.getElementById('pd-edit').value || '').trim();
      var old = st.home[k]; st.editing = null;
      if (v && v !== old) { st.home[k] = v; change(t(k === 'headline' ? 'h_headline' : 'h_button'), function () { st.home[k] = old; }); toast(t('saved')); }
      render(true);
    },
    pickphoto: function () { st.overlay = { type: 'pick', kind: 'photo' }; render(true); },
    setphoto: function (el) {
      var p = photoById(el.getAttribute('data-id')); var old = st.home.photo;
      st.overlay = null;
      if (p && p.src !== old) { st.home.photo = p.src; change(t('h_photo'), function () { st.home.photo = old; }); toast(t('saved')); }
      render(true);
    },
    pickitem: function () { st.overlay = { type: 'pick', kind: 'item' }; render(true); },
    feat: function (el) {
      var id = el.getAttribute('data-id'), it = item(id); st.overlay = null;
      st.home.featured.push(id); it.home = true;
      change(t('h_feat_add', { item: it.name }), function () { st.home.featured = st.home.featured.filter(function (x) { return x !== id; }); it.home = false; });
      render(true); toast(t('saved'));
    },
    fup: function (el) { moveFeat(+el.getAttribute('data-i'), -1); },
    fdown: function (el) { moveFeat(+el.getAttribute('data-i'), 1); },
    frm: function (el) {
      var n = +el.getAttribute('data-i'), id = st.home.featured[n], it = item(id);
      st.home.featured.splice(n, 1); if (it) it.home = false;
      change(t('h_feat_rm', { item: it ? it.name : '' }), function () { st.home.featured.splice(n, 0, id); if (it) it.home = true; });
      render(true);
    },
    /* products */
    filter: function (el) { st.filter = el.getAttribute('data-v'); render(true); },
    open: function (el) { var it = item(el.getAttribute('data-id')); st.overlay = { type: 'edit', id: it.id, main: it.main, home: st.home.featured.indexOf(it.id) >= 0 }; render(true); },
    edmain: function (el) { st.overlay.main = +el.getAttribute('data-i'); render(true); },
    edhome: function () { st.overlay.home = !st.overlay.home; render(true); },
    saveitem: function () {
      var it = item(st.overlay.id);
      var before = { name: it.name, desc: it.desc, avail: it.avail, main: it.main, feat: st.home.featured.slice(), home: it.home };
      var nm = (d.getElementById('pd-ename').value || '').trim() || it.name;
      it.name = nm; it.desc = (d.getElementById('pd-edesc').value || '').trim(); it.avail = d.getElementById('pd-eavail').value; it.main = st.overlay.main;
      var inHome = st.home.featured.indexOf(it.id) >= 0;
      if (st.overlay.home && !inHome) st.home.featured.push(it.id);
      if (!st.overlay.home && inHome) st.home.featured = st.home.featured.filter(function (x) { return x !== it.id; });
      it.home = st.overlay.home;
      st.overlay = null;
      change(t(before.isNew ? 'h_item_new' : 'h_item_saved', { item: it.name }), function () { it.name = before.name; it.desc = before.desc; it.avail = before.avail; it.main = before.main; st.home.featured = before.feat; it.home = before.home; });
      render(true); toast(t('saved'));
    },
    additem: function (el) {
      var kind = el.getAttribute('data-kind');
      var it = { id: uid(), kind: kind, name: t('new_item'), desc: '', photos: [], main: 0, avail: 'hidden', home: false };
      items.splice(kind === 'product' ? items.filter(function (i) { return i.kind === 'product'; }).length : items.length, 0, it);
      st.filter = 'all'; st.q = '';
      change(t('h_item_new', { item: it.name }), function () { items = items.filter(function (x) { return x !== it; }); st.home.featured = st.home.featured.filter(function (x) { return x !== it.id; }); });
      st.overlay = { type: 'edit', id: it.id, main: 0, home: false }; render(true);
    },
    /* photos */
    phf: function (el) { st.phFilter = el.getAttribute('data-v'); render(true); },
    photo: function (el) { st.overlay = { type: 'photo', id: el.getAttribute('data-id') }; render(true); },
    usehome: function (el) { A.setphoto(el); },
    delphoto: function (el) {
      var id = el.getAttribute('data-id'), idx = -1;
      photos.forEach(function (p, i) { if (p.id === id) idx = i; });
      if (idx < 0) return;
      var p = photos.splice(idx, 1)[0]; st.overlay = null;
      change(t('h_photo_del'), function () { photos.splice(idx, 0, p); });
      render(true); toast(t('deleted'));
    },
    /* hours */
    day: function (el) {
      var i = +el.getAttribute('data-i'), dy = st.days[i]; dy.open = !dy.open;
      change(t('h_day', { day: t('day' + i), state: t(dy.open ? 'open' : 'closed') }), function () { dy.open = !dy.open; });
      render(true);
    },
    addhol: function () { st.addHol = true; render(true); var i = d.getElementById('pd-hname'); if (i) i.focus(); },
    cancelhol: function () { st.addHol = false; render(true); },
    savehol: function () {
      var nm = (d.getElementById('pd-hname').value || '').trim(); if (!nm) { d.getElementById('pd-hname').focus(); return; }
      var dt = d.getElementById('pd-hdate').value, u = d.getElementById('pd-huntil').value;
      var h = { id: uid(), name: nm, date: dt ? fmtDate(dt) : '', until: u ? +u : null };
      st.hol.push(h); st.addHol = false;
      change(t('h_hol', { name: nm }), function () { st.hol = st.hol.filter(function (x) { return x !== h; }); });
      render(true); toast(t('saved'));
    },
    rmhol: function (el) {
      var id = el.getAttribute('data-id'), idx = -1; st.hol.forEach(function (h, i) { if (h.id === id) idx = i; });
      var h = st.hol.splice(idx, 1)[0];
      change(t('h_hol_rm', { name: h.name }), function () { st.hol.splice(idx, 0, h); });
      render(true);
    },
    upclosed: function (el) { upMove(el.getAttribute('data-id'), null); },
    uphours: function (el) { upMove(el.getAttribute('data-id'), 900); },
    /* orders */
    ordf: function (el) { st.ordFilter = el.getAttribute('data-v'); render(true); },
    call: function (el) { var o = orderById(el.getAttribute('data-id')); toast(t('calling', { name: o.who })); },
    done: function (el) {
      var o = orderById(el.getAttribute('data-id')); o.done = true;
      change(t('h_done', { name: o.who }), function () { o.done = false; });
      render(true); toast(t('marked'));
    },
    reopen: function (el) { var o = orderById(el.getAttribute('data-id')); o.done = false; render(true); },
    /* announcement */
    annshow: function () { var a = st.ann; a.show = !a.show; change(t('h_toggle', { what: t('show_site'), state: t(a.show ? 'on' : 'off') }), function () { a.show = !a.show; }); render(true); },
    annagent: function () { var a = st.ann; a.agent = !a.agent; change(t('h_toggle', { what: t('tell_agent'), state: t(a.agent ? 'on' : 'off') }), function () { a.agent = !a.agent; }); render(true); },
    /* history */
    undo: function (el) {
      var id = el.getAttribute('data-id');
      var h = null; st.history.forEach(function (x) { if (x.id === id) h = x; });
      if (h) { if (h.undo) h.undo(); st.history = st.history.filter(function (x) { return x !== h; }); st.changes = Math.max(0, st.changes - 1); }
      else st.seeded = st.seeded.filter(function (x) { return x.id !== id; });
      render(true); toast(t('undone'));
    },
    /* staff */
    addstaff: function () { st.addStaff = true; render(true); var i = d.getElementById('pd-sname'); if (i) i.focus(); },
    cancelstaff: function () { st.addStaff = false; render(true); },
    savestaff: function () {
      var nm = (d.getElementById('pd-sname').value || '').trim(); if (!nm) { d.getElementById('pd-sname').focus(); return; }
      var p = { id: uid(), name: nm, role: d.getElementById('pd-srole').value, init: nm.charAt(0).toUpperCase(), bg: 'var(--blush)' };
      st.staff.push(p); st.addStaff = false;
      change(t('h_staff_add', { name: nm }), function () { st.staff = st.staff.filter(function (x) { return x !== p; }); });
      render(true); toast(t('invite'));
    },
    rmstaff: function (el) {
      var id = el.getAttribute('data-id'), idx = -1; st.staff.forEach(function (p, i) { if (p.id === id) idx = i; });
      var p = st.staff.splice(idx, 1)[0];
      change(t('h_staff_rm', { name: p.name }), function () { st.staff.splice(idx, 0, p); });
      render(true);
    },
    signin: function () { st.signin = !st.signin; change(t('h_toggle', { what: t('signin'), state: t(st.signin ? 'on' : 'off') }), function () { st.signin = !st.signin; }); render(true); }
  };
  function photoById(id) { var r = null; photos.forEach(function (p) { if (p.id === id) r = p; }); return r; }
  function orderById(id) { var r = null; st.orders.forEach(function (o) { if (o.id === id) r = o; }); return r; }
  function moveFeat(n, dir) {
    var f = st.home.featured, m = n + dir; if (m < 0 || m >= f.length) return;
    var a = f[n]; f[n] = f[m]; f[m] = a;
    change(t('h_feat_move'), function () { var b = f[n]; f[n] = f[m]; f[m] = b; });
    render(true);
  }
  function upMove(id, until) {
    var idx = -1; st.upcoming.forEach(function (u, i) { if (u.id === id) idx = i; });
    var u = st.upcoming.splice(idx, 1)[0];
    var h = { id: uid(), name: u.name, date: u.date, until: until };
    st.hol.push(h);
    change(t('h_hol', { name: u.name }), function () { st.hol = st.hol.filter(function (x) { return x !== h; }); st.upcoming.splice(idx, 0, u); });
    render(true); toast(t('saved'));
  }

  /* ------------------------------------------------------------------ events */
  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || !root.contains(el)) {
      if (e.target === ovEl) { st.overlay = null; render(true); }
      return;
    }
    var act = el.getAttribute('data-act');
    if (el.tagName === 'SELECT' || el.tagName === 'INPUT') return;
    if (A[act]) { e.preventDefault(); A[act](el); }
  });
  root.addEventListener('change', function (e) {
    var el = e.target, act = el.getAttribute('data-act');
    if (act === 'goSel') { go(el.value); return; }
    if (act === 'avail') {
      var it = item(el.getAttribute('data-id')), old = it.avail; it.avail = el.value;
      change(t('h_avail', { item: it.name, state: t('a_' + it.avail) }), function () { it.avail = old; });
      render(true); return;
    }
    if (act === 'from' || act === 'to') {
      var i = +el.getAttribute('data-i'), dy = st.days[i], k = act, prev = dy[k]; dy[k] = +el.value;
      change(t('h_hours', { day: t('day' + i) }), function () { dy[k] = prev; });
      render(true); return;
    }
    if (act === 'role') {
      var p = null; st.staff.forEach(function (x) { if (x.id === el.getAttribute('data-id')) p = x; });
      var r0 = p.role; p.role = el.value;
      change(t('h_role', { name: p.name, role: t('r_' + p.role) }), function () { p.role = r0; });
      render(true); return;
    }
    if (act === 'annstart' || act === 'annend') {
      var key = act === 'annstart' ? 'start' : 'end', pv = st.ann[key]; st.ann[key] = el.value;
      change(t('h_ann'), function () { st.ann[key] = pv; }); render(true); return;
    }
    if (el.id === 'pd-ann') {
      var a = st.ann, prevText = a.lastCommitted == null ? t('ann_v') : a.lastCommitted;
      if (a.text !== prevText) { var nt = a.text; a.lastCommitted = nt; change(t('h_ann'), function () { a.text = prevText; a.lastCommitted = prevText; }); render(true); }
      return;
    }
    if (act === 'upload') {
      var files = Array.prototype.slice.call(el.files || []).filter(function (f) { return /^image\//.test(f.type); });
      if (!files.length) return;
      var added = files.map(function (f) { return { id: uid(), src: URL.createObjectURL(f), tag: 'new', alt: f.name }; });
      Array.prototype.unshift.apply(photos, added);
      change(files.length === 1 ? t('uploaded1') : t('uploaded_n', { n: files.length }), function () { photos = photos.filter(function (p) { return added.indexOf(p) < 0; }); });
      st.phFilter = 'all'; render(true); toast(files.length === 1 ? t('uploaded1') : t('uploaded_n', { n: files.length }));
    }
  });
  root.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'pd-q') { st.q = el.value; var pos = el.selectionStart; render(true); var n = d.getElementById('pd-q'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} return; }
    if (el.id === 'pd-ann') { st.ann.text = el.value; var b = root.querySelector('.pd-main .ann'); if (b) b.textContent = el.value || '…'; }
  });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && st.overlay) { st.overlay = null; render(true); return; }
    if (e.key === 'Enter' && e.target.id === 'pd-edit') { e.preventDefault(); var b = root.querySelector('[data-act="saveedit"]'); if (b) A.saveedit(b); }
    if (e.key === 'Enter' && (e.target.id === 'pd-hname')) { e.preventDefault(); A.savehol(); }
    if (e.key === 'Enter' && (e.target.id === 'pd-sname')) { e.preventDefault(); A.savestaff(); }
  });

  build();
  render();
})();
