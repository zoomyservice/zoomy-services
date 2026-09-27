/* Zoomy assistant — the chat on zoomy.services */
(function () {
  'use strict';
  var d = document;
  var LANG = (d.documentElement.lang || 'en').slice(0, 2);
  if (['en', 'fr', 'es'].indexOf(LANG) < 0) LANG = 'en';
  var ENDPOINT = 'https://zoomy-ai.zoozoomfast.workers.dev/demo-chat';
  var KEY = 'zoomy-chat-v2';

  var TXT = {
    en: {
      open: 'Questions? Ask me', title: 'Zoomy', status: 'Usually replies in seconds', today: 'Today',
      hello: 'Hi, I’m Zoomy’s assistant. Ask me about websites, admin panels, chat, phone agents or how a project works.',
      intro: 'Answers come from an AI assistant. A person replies to anything sent through the contact form.',
      sugg: ['Can I update my own site?', 'How does the phone agent work?', 'Can you host my website?'],
      ph: 'Write a message', send: 'Send', close: 'Close chat',
      err: 'Sorry, I couldn’t reply just now. You can email contact@zoomy.services and a person will answer within a day.',
      privacy: 'Privacy', privacyUrl: '/privacy.html', ai: 'AI assistant, a person reads every form'
    },
    fr: {
      open: 'Une question ?', title: 'Zoomy', status: 'Répond en quelques secondes', today: 'Aujourd’hui',
      hello: 'Bonjour, je suis l’assistant de Zoomy. Posez-moi vos questions sur les sites, les panneaux d’administration, le chat, les agents téléphoniques ou le déroulement d’un projet.',
      intro: 'Les réponses viennent d’un assistant IA. Une personne répond à tout message envoyé via le formulaire de contact.',
      sugg: ['Puis-je modifier mon site moi-même ?', 'Comment marche l’agent téléphonique ?', 'Pouvez-vous héberger mon site ?'],
      ph: 'Écrivez un message', send: 'Envoyer', close: 'Fermer le chat',
      err: 'Désolé, je n’ai pas pu répondre. Écrivez à contact@zoomy.services, une personne vous répondra sous 24 heures.',
      privacy: 'Confidentialité', privacyUrl: '/fr/privacy.html', ai: 'Assistant IA, une personne lit chaque formulaire'
    },
    es: {
      open: '¿Preguntas?', title: 'Zoomy', status: 'Responde en segundos', today: 'Hoy',
      hello: 'Hola, soy el asistente de Zoomy. Pregúnteme sobre sitios web, paneles de administración, chat, agentes telefónicos o cómo funciona un proyecto.',
      intro: 'Las respuestas vienen de un asistente de IA. Una persona responde a todo lo que se envía por el formulario de contacto.',
      sugg: ['¿Puedo cambiar mi sitio yo mismo?', '¿Cómo funciona el agente telefónico?', '¿Pueden alojar mi sitio?'],
      ph: 'Escriba un mensaje', send: 'Enviar', close: 'Cerrar chat',
      err: 'Lo siento, no pude responder. Escriba a contact@zoomy.services y una persona le contestará en un día.',
      privacy: 'Privacidad', privacyUrl: '/es/privacy.html', ai: 'Asistente con IA, una persona lee cada formulario'
    }
  }[LANG];

  var LANG_NAME = { en: 'English', fr: 'French', es: 'Spanish' }[LANG];
  var BUSINESS = {
    name: 'Zoomy',
    type: 'Studio that builds websites, admin panels, AI chatbots, AI phone agents, animated video ads, app designs and 3D models for businesses of any size and any kind',
    tagline: 'Websites, chatbots and phone agents for any business',
    reply_rules: 'You are the assistant on zoomy.services. Reply in the language the visitor writes in; the page they are on is in ' + LANG_NAME + '. Keep replies short: two to four sentences, plain and friendly, no lists unless asked, no emojis, no exclamation marks. Only use the facts below. If you do not know something, say so and suggest the contact form. Zoomy works with every type and size of business: never call Zoomy small, never say it is only for small, local or food businesses, never assume the visitor runs a restaurant or food business, and never say where Zoomy is located.',
    services: [
      'Websites: designed and hand-coded for each business, no templates, WordPress or page builders. Fast on phones, set up for Google, multilingual when needed. Online ordering, booking, product catalogues and card payments (Stripe) when the project needs them. Zoomy can host the site, or connect it to a domain the client already has.',
      'Admin panels: every site can come with a private admin panel so the owner and staff can change their products and services, prices, photos, opening hours, closed days and holiday hours, announcements and ordering rules themselves, from a phone or computer. Changes can be previewed before publishing, there is a history with undo, and staff can get their own logins with limited rights.',
      'AI chatbots: an assistant on the business website trained on its own products, services, hours and policies. It answers visitors in their language, sticks to the facts it was given, and can pass a visitor’s name and number to the team.',
      'AI phone agents: an AI receptionist on the business phone number. It answers every call, speaks naturally in English, Spanish or other languages, knows the business’s products and services, today’s date and the opening hours including holidays, takes orders and requests, reads them back, and the moment the call ends it sends each order or message to the team by text message and email (and into the admin panel) so someone can call back to confirm. It never takes card details on the phone.',
      'Animated video ads: motion-graphics ads made from a short brief, no filming needed. Delivered as MP4 in square 1:1, vertical 4:5 and full-screen 9:16 for Instagram, Facebook and TikTok. Two rounds of changes are included; a typical turnaround is about a week.'
    ],
    not_offered: 'Zoomy does not run or manage ad campaigns (no Google Ads or Meta Ads management) and does not make AI-generated images or videos. If asked, say so briefly and mention what Zoomy does offer.',
    pricing: 'Zoomy does not publish prices. Every project gets a fixed quote after a short brief, agreed in writing before work starts, with no hourly billing. Never state, estimate or hint at any price, rate, range or discount. Suggest sending a brief through the contact page.',
    process: '1) The client sends a brief through the contact form or by email. 2) Zoomy replies within 24 hours with questions or a fixed quote and a timeline. 3) For websites, Zoomy builds the whole site (every page, the content and the admin panel) and shows it to the client all at once. 4) The client asks for changes, then launch and a short walkthrough of the admin panel. The site belongs to the client. Never mention Google Analytics, never say things are set up on the client’s own accounts, and never say how many minutes, days or weeks a website takes to build.',
    clients: 'Never name, describe or discuss specific clients or past projects. If asked for examples, say Zoomy builds for businesses of every size and kind, and that examples can be shared by email.',
    timeline: 'Every quote comes with a timeline. It depends on the size of the project; do not promise a number of days or weeks for websites, chat assistants or phone agents. Animated ads usually take five to seven days.',
    contact: 'Email contact@zoomy.services or use the form at zoomy.services/contact.html. Replies within 24 hours. Works with clients anywhere.',
    languages: 'The website is in English, French and Spanish. Sites, chatbots and phone agents can be built in whatever languages the client’s customers speak.'
  };

  var state = { history: [], open: false };
  try { var s = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (s && Array.isArray(s.history)) state.history = s.history.slice(-30); } catch (e) {}
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ history: state.history.slice(-30) })); } catch (e) {} }

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8" cy="10" r="3.2" fill="#fff" stroke="#1e2a44" stroke-width="1.6"/><circle cx="16" cy="10" r="3.2" fill="#fff" stroke="#1e2a44" stroke-width="1.6"/><circle cx="8.9" cy="10.4" r="1.3" fill="#1e2a44"/><circle cx="16.9" cy="10.4" r="1.3" fill="#1e2a44"/><path d="M8.5 16c1.9 1.6 5.1 1.6 7 0" stroke="#1e2a44" stroke-width="1.7" stroke-linecap="round"/></svg>';
  var ICON_Z = ICON_CHAT;
  var ICON_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_SEND = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';

  var launch = d.createElement('button');
  launch.className = 'zc-launch';
  launch.type = 'button';
  launch.setAttribute('aria-haspopup', 'dialog');
  launch.innerHTML = '<span class="av">' + ICON_CHAT + '</span><span>' + TXT.open + '</span>';

  var box = d.createElement('section');
  box.className = 'zc';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', TXT.title);
  box.innerHTML =
    '<header class="zc__hd"><div class="zc__av">' + ICON_Z + '</div>' +
    '<div class="zc__title"><b>' + TXT.title + '</b><small>' + TXT.status + '</small></div>' +
    '<button type="button" class="zc__x" aria-label="' + TXT.close + '">' + ICON_X + '</button></header>' +
    '<div class="zc__msgs" aria-live="polite"></div>' +
    '<div class="zc__ft"><form class="zc__form"><textarea rows="1" maxlength="800" placeholder="' + TXT.ph + '" aria-label="' + TXT.ph + '"></textarea>' +
    '<button type="submit" class="zc__send" aria-label="' + TXT.send + '" disabled>' + ICON_SEND + '</button></form>' +
    '<p class="zc__legal">' + TXT.ai + ' · <a href="' + TXT.privacyUrl + '">' + TXT.privacy + '</a></p></div>';

  d.body.appendChild(launch);
  d.body.appendChild(box);

  var msgs = box.querySelector('.zc__msgs');
  var form = box.querySelector('.zc__form');
  var input = form.querySelector('textarea');
  var sendBtn = form.querySelector('.zc__send');
  var busy = false;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(text) {
    var t = esc(String(text || '').replace(/¡/g, '').replace(/!+/g, '.').replace(/\.\.+/g, '.'));
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    t = t.replace(/(^|[\s(])((?:https?:\/\/)?zoomy\.services(?:\/[\w\-./#]*)?)/g, function (m, pre, url) { var href = url.indexOf('http') === 0 ? url : 'https://' + url; return pre + '<a href="' + href + '">' + url + '</a>'; });
    t = t.replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');
    return t.split(/\n{2,}/).map(function (p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; }).join('');
  }
  function add(role, text, animate) {
    var el = d.createElement('div');
    el.className = 'zc__m ' + (role === 'user' ? 'zc__m--me' : 'zc__m--bot');
    if (!animate) el.style.animation = 'none';
    el.innerHTML = role === 'user' ? '<p>' + esc(text) + '</p>' : fmt(text);
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }
  function suggestions() {
    var wrap = d.createElement('div');
    wrap.className = 'zc__sugg';
    TXT.sugg.forEach(function (q) {
      var b = d.createElement('button'); b.type = 'button'; b.textContent = q;
      b.addEventListener('click', function () { wrap.remove(); ask(q); });
      wrap.appendChild(b);
    });
    msgs.appendChild(wrap);
  }
  function render() {
    msgs.innerHTML = '';
    var p = d.createElement('span'); p.className = 'zc__day'; p.textContent = TXT.today; msgs.appendChild(p);
    add('bot', TXT.hello, false);
    state.history.forEach(function (h) { add(h.role === 'user' ? 'user' : 'bot', h.text, false); });
    if (!state.history.length) suggestions();
  }

  function ask(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    var sugg = msgs.querySelector('.zc__sugg'); if (sugg) sugg.remove();
    add('user', text, true);
    var prior = state.history.slice(-8);
    state.history.push({ role: 'user', text: text }); save();
    var typing = d.createElement('div'); typing.className = 'zc__typing'; typing.innerHTML = '<i></i><i></i><i></i>';
    msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight;
    if (window.zmyTrack) window.zmyTrack('chat_message');
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 25000);
    fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({ message: text, history: prior, business: BUSINESS })
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) {
        var reply = (j && j.reply) ? String(j.reply).trim() : '';
        if (!reply) throw new Error('empty');
        typing.remove(); add('bot', reply, true);
        state.history.push({ role: 'bot', text: reply }); save();
      })
      .catch(function () { typing.remove(); add('bot', TXT.err, true); })
      .then(function () { clearTimeout(timer); busy = false; updateSend(); });
  }

  function updateSend() { sendBtn.disabled = busy || !input.value.trim(); }
  function grow() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; }
  input.addEventListener('input', function () { grow(); updateSend(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); }
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; grow(); updateSend(); ask(v); });

  var rendered = false;
  function open() {
    if (!rendered) { render(); rendered = true; }
    state.open = true; box.classList.add('open'); launch.classList.add('hidden');
    launch.setAttribute('aria-expanded', 'true');
    setTimeout(function () { if (window.innerWidth > 560) input.focus(); msgs.scrollTop = msgs.scrollHeight; }, 60);
    if (window.zmyTrack) window.zmyTrack('chat_open');
  }
  function close() {
    state.open = false; box.classList.remove('open'); launch.classList.remove('hidden');
    launch.setAttribute('aria-expanded', 'false'); launch.focus();
  }
  launch.addEventListener('click', open);
  box.querySelector('.zc__x').addEventListener('click', close);
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.open) close(); });
  d.querySelectorAll('[data-open-chat]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
  window.zoomyChat = { open: open, close: close };
})();
