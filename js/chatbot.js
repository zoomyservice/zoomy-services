(function () {
'use strict';

/* ── Language ── */
function lang() {
  return localStorage.getItem('zmy_lang') ||
    (['fr','es'].includes((navigator.language||'').slice(0,2))
      ? (navigator.language||'').slice(0,2) : 'en');
}
function t(en, fr, es) {
  const l = lang(); if (l === 'fr') return fr; if (l === 'es') return es; return en;
}

/* ── Business ── */
const BIZ = {
  name: 'Zoomy',
  email: 'contact@zoomy.services',
  url: 'zoomy.services',
  phoneTokenUrl: 'https://zoomy-ai.zoozoomfast.workers.dev/elevenlabs-token',
};

/* ── Conversation history (AI only — no KB) ── */
const memory = { history: [] };
const DEMO_WORKER = 'https://zoomy-ai.zoozoomfast.workers.dev/demo-chat';
const CB_PRESETS = {
  restaurant:{name:'The Golden Fork',type:'Restaurant & Bar',tagline:'Modern European cuisine with seasonal ingredients, craft cocktails, and weekend brunch',services:['Dine-in lunch & dinner','Weekend brunch (Sat–Sun 10am–3pm)','Private dining & event buyouts','Takeout orders','Corporate catering'],hours:'Mon–Thu 11:30am–10pm, Fri–Sat 11:30am–11pm, Sun 10am–3pm (brunch only)',pricing:'Starters $10–18, Mains $24–48, Weekend brunch $16–28, Cocktails $13–18',dietary:'We accommodate vegetarian, vegan, and gluten-free guests with dedicated menu options. We are not a kosher-certified or halal-certified kitchen, but our team can walk through ingredients for guests with specific needs. Allergens including nuts are flagged on the menu.',reservations:'Book online, call during hours, or walk in — we hold tables for walk-ins nightly.',location:'Downtown city center, 5 min from the central metro station'},
  gym:{name:'Peak Performance Fitness',type:'Gym & Fitness Studio',tagline:'Results-driven training for all levels — from first-timers to competitive athletes',services:['Full gym floor access','1-on-1 personal training','Group fitness classes (HIIT, yoga, spin)','Nutrition coaching','Sauna & cold plunge recovery'],hours:'Mon–Fri 5:30am–11pm, Sat–Sun 7am–9pm',pricing:'Basic $49/mo (gym only), Unlimited $79/mo (gym + all classes), PT from $129/mo. Day pass $15.',trial:'Free 3-day trial pass — no credit card required. Sign up at the front desk or online.',cancellation:'Month-to-month; cancel with 15 days notice. No long-term contracts unless on annual plan.',facilities:'3 floors: cardio, free weights, group class studio. Locker rooms with showers and secure storage.',location:'Multiple city locations — main branch in the financial district'},
  salon:{name:'Luxe Beauty Studio',type:'Beauty Salon & Spa',tagline:'Where great hair, flawless skin, and total relaxation come together',services:['Haircuts & blow-dry styling','Balayage, highlights & color','Lash lifts & extensions','Facials & skin treatments','Manicure, pedicure & nail art'],hours:'Tue–Sat 9am–7pm, Sun 10am–5pm. Closed Mondays.',pricing:'Haircuts from $55, Balayage from $180, Lash extensions from $120, Facials from $85, Manicure from $35.',booking:'All appointments online or by phone. Book 1–2 weeks ahead for color. Same-day slots available for cuts.',cancellation:'Please cancel or reschedule 24h in advance to avoid a 50% late-cancellation fee.',products:'We use and retail Kerastase and Olaplex. Cruelty-free and vegan options available on request.',location:'Uptown, free parking in the building lot'},
  dental:{name:'Bright Smile Dental',type:'Dental Clinic',tagline:'Comfortable, modern dentistry for the whole family — gentle care from the first visit',services:['Routine cleanings & checkups','Teeth whitening','Invisalign clear aligners','Dental implants','Emergency same-day care','Pediatric dentistry'],hours:'Mon–Thu 8am–6pm, Fri 8am–3pm, Sat 9am–2pm (select dates)',pricing:'Cleaning from $120, Whitening $350, Invisalign consultation free, Implants from $2,200, Emergency visit from $100 (waived if proceeding with treatment).',insurance:'We accept most major dental insurance plans and bill directly. 0% financing through CareCredit available.',anxiety:'We specialize in anxious patients. Nitrous oxide available, team trained to work at your pace.',location:'Inside the Westside Medical Plaza, validated parking available'},
  legal:{name:'Harrington & Associates',type:'Law Firm',tagline:'Straightforward legal guidance for individuals, families, and growing businesses',services:['Personal injury claims','Business contracts & formation','Real estate transactions','Family law & divorce','Estate planning & wills'],hours:'Mon–Fri 9am–6pm. Evening consultations available by appointment.',pricing:'Free 30-minute initial consultation for most cases. Personal injury on contingency (no win, no fee). Business law from $250/hr. Flat-fee packages for wills and real estate closings.',process:'After your free consult we outline options and fees in writing before any engagement. No surprise billing.',location:'Financial district, 12th floor — elevator accessible, parking validated'},
  realestate:{name:'Crestview Realty',type:'Real Estate Agency',tagline:'Helping you buy, sell, or rent with confidence — local experts, honest advice',services:['Residential buying & selling','Rental property management','Commercial real estate','Free home valuations','Investor portfolio consulting'],hours:'Mon–Sat 9am–7pm, Sun by appointment',pricing:'Seller commission 5% (split with buyer agent). Rental management 8%/mo of collected rent. Home valuation always free.',process:'Buyers: free strategy call, pre-approval guidance, property tours. Sellers: listed within 5 days, professional photos included.',contract:'Listing agreements 90 days. Buyer representation agreements are flexible.',location:'Full metro area with local offices in three neighborhoods'},
  store:{name:'Nomad Supply Co.',type:'Online Outdoor & Lifestyle Store',tagline:'Gear tested in the field, not just in marketing photos — built for people who actually go outside',services:['Outdoor apparel & footwear','Camping & hiking gear','Monthly subscription box','Gift cards'],hours:'Customer support Mon–Fri 9am–6pm EST. Orders ship 24/7.',pricing:'Apparel $35–$180, Gear $20–$400, Subscription box $49/mo. Free standard shipping on orders over $75.',returns:'60-day returns on unworn/unused items. If it breaks under normal field use, contact us — we stand behind our gear.',shipping:'Standard (3–5 days) free over $75, Express (1–2 days) $12. International shipping to 30+ countries.',loyalty:'Earn 1 point per $1 spent. 100 points = $5 off. Points never expire.',location:'Ships from Portland, OR — online only, no retail locations'},
  auto:{name:'ProTech Auto Repair',type:'Auto Repair Shop',tagline:'Honest repairs, fair prices, done right the first time — no upselling',services:['Oil changes & fluid services','Brake inspection & replacement','Transmission service & repair','Full diagnostics','Tire rotation & balancing','AC & heating repair'],hours:'Mon–Fri 7:30am–6pm, Sat 8am–3pm',pricing:'Oil change from $49, Brake pads from $120/axle, Diagnostics $75 (waived with repair), Tire rotation $25.',warranty:'All repairs include 12-month / 12,000-mile warranty on parts and labor.',process:'We show you what we find before doing any work — photos included. No repair starts without your approval.',location:'East side, 2 min off the highway. Free shuttle within 3 miles.'},
};
let popupTailoredBiz = null;

function md(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g, '<br>');
}

/* ── UI ─────────────────────────────────────────────────────────── */
function render() {
  const CSS = `
#zmy-bubble{position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7,#06b6d4);border:none;cursor:pointer;box-shadow:0 4px 24px rgba(99,102,241,.5);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s}
#zmy-bubble:hover{transform:scale(1.08);box-shadow:0 8px 32px rgba(99,102,241,.6)}
#zmy-bubble svg{width:26px;height:26px;fill:#fff;pointer-events:none}
#zmy-attn{position:fixed;bottom:90px;right:24px;z-index:9998;background:#fff;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;padding:10px 14px;border-radius:12px 12px 4px 12px;box-shadow:0 4px 20px rgba(0,0,0,.15);max-width:200px;line-height:1.4;animation:zmyfade .4s ease}
@keyframes zmyfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
#zmy-win{position:fixed;bottom:90px;right:24px;z-index:9998;width:360px;max-width:calc(100vw - 32px);border-radius:20px;background:#08080f;border:1px solid rgba(99,102,241,.2);box-shadow:0 20px 60px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
#zmy-win.open{display:flex}
#zmy-head{background:linear-gradient(135deg,#6366f1,#a855f7);padding:14px 16px;display:flex;align-items:center;gap:12px}
#zmy-avatar{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
#zmy-name{font-weight:700;font-size:.9rem;color:#fff}
#zmy-status{font-size:.7rem;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:5px;margin-top:2px}
#zmy-status::before{content:'';width:6px;height:6px;border-radius:50%;background:#4ade80;flex-shrink:0;animation:zmypulse 2s infinite}
@keyframes zmypulse{0%,100%{opacity:1}50%{opacity:.4}}
#zmy-close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.7);font-size:18px;cursor:pointer;padding:4px;line-height:1;border-radius:4px}
#zmy-close:hover{color:#fff;background:rgba(255,255,255,.1)}
#zmy-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;min-height:260px;max-height:340px;background:#0d0d1c;scroll-behavior:smooth}#zmy-msgs::-webkit-scrollbar{width:4px}#zmy-msgs::-webkit-scrollbar-track{background:transparent}#zmy-msgs::-webkit-scrollbar-thumb{background:rgba(99,102,241,.35);border-radius:2px}#zmy-msgs::-webkit-scrollbar-thumb:hover{background:rgba(99,102,241,.6)}
.zmy-msg{max-width:86%;padding:10px 14px;border-radius:14px;font-size:.85rem;line-height:1.55;word-wrap:break-word}
.zmy-msg a{color:#a5b4fc;text-decoration:underline}
.zmy-bot{background:#111128;border:1px solid rgba(99,102,241,.18);color:#cbd5e1;align-self:flex-start;border-bottom-left-radius:4px}
.zmy-user{background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.zmy-typing{display:flex;gap:5px;align-items:center;padding:10px 14px}
.zmy-typing span{width:7px;height:7px;border-radius:50%;background:#6366f1;animation:zmybounce 1.2s infinite ease-in-out}
.zmy-typing span:nth-child(2){animation-delay:.2s}
.zmy-typing span:nth-child(3){animation-delay:.4s}
@keyframes zmybounce{0%,80%,100%{transform:scale(.7);opacity:.5}40%{transform:scale(1);opacity:1}}
#zmy-inp-row{padding:10px 12px;border-top:1px solid rgba(99,102,241,.15);display:flex;gap:8px;background:#08080f}
#zmy-input{flex:1;background:#111128;border:1px solid rgba(99,102,241,.2);border-radius:20px;padding:9px 14px;font-size:16px;color:#f1f5f9;outline:none;font-family:inherit;resize:none;max-height:80px;overflow-y:hidden}
#zmy-input:focus{border-color:rgba(99,102,241,.5)}
#zmy-input::placeholder{color:#64748b}
#zmy-send{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;transition:transform .15s}
#zmy-send:hover{transform:scale(1.1)}
@media(max-width:480px){#zmy-win{right:0;bottom:0;width:100vw;border-radius:20px 20px 0 0;max-height:80vh}#zmy-bubble{bottom:16px;right:16px}#zmy-inp-row{padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}}#zmy-bubble.zmy-hidden{display:none!important}
#zmy-phone-btn{background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;padding:4px;border-radius:4px;display:flex;align-items:center;transition:color .15s,background .15s}
#zmy-phone-btn:hover{color:#4ade80;background:rgba(74,222,128,.1)}
#zmy-phone-btn.active-call{color:#4ade80}
#zmy-call-panel{display:none;flex-direction:column;align-items:center;justify-content:center;gap:1.1rem;padding:2rem 1.5rem;background:#0d0d1c;min-height:280px;max-height:340px;overflow-y:auto}
#zmy-call-panel.active{display:flex}
#zmy-call-orb{width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,#312e81,#6366f1);display:flex;align-items:center;justify-content:center;font-size:2rem;position:relative;box-shadow:0 0 40px rgba(99,102,241,.45)}
#zmy-call-orb.live{background:linear-gradient(135deg,#14532d,#16a34a);box-shadow:0 0 40px rgba(22,163,74,.4)}
#zmy-call-ring{position:absolute;inset:-8px;border-radius:50%;border:1.5px solid rgba(99,102,241,.35);animation:zmypulse 2s ease-in-out infinite}
#zmy-call-label{font-size:.8rem;font-weight:600;color:#cbd5e1;text-align:center}
#zmy-call-statusline{font-family:monospace;font-size:.7rem;color:#475569;text-align:center}
#zmy-call-statusline.live{color:#4ade80}
#zmy-call-timer{font-family:monospace;font-size:.75rem;color:#64748b}
#zmy-call-waves{display:none;align-items:center;gap:3px;height:22px}
#zmy-call-waves span{display:block;width:3px;border-radius:2px;background:#6366f1;animation:zmybounce 1s ease-in-out infinite}
#zmy-call-waves span:nth-child(2){animation-delay:.15s}
#zmy-call-waves span:nth-child(3){animation-delay:.3s}
#zmy-call-waves span:nth-child(4){animation-delay:.45s}
#zmy-call-waves span:nth-child(5){animation-delay:.6s}
#zmy-call-startbtn{padding:12px 28px;background:linear-gradient(135deg,#6366f1,#a855f7);border:none;border-radius:24px;color:#fff;font-weight:700;font-size:.88rem;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 0 24px rgba(99,102,241,.35);transition:filter .2s,transform .2s}
#zmy-call-startbtn:hover{filter:brightness(1.1);transform:scale(1.02)}
#zmy-call-startbtn.ending{background:linear-gradient(135deg,#ef4444,#dc2626);box-shadow:0 0 24px rgba(239,68,68,.35)}
#zmy-call-controls{display:none;width:100%;gap:.6rem;flex-direction:row}
#zmy-call-mutebtn,#zmy-call-speakerbtn{flex:1;padding:10px 10px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:24px;color:#fff;font-size:.78rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background .2s,border-color .2s}
@media(min-width:481px){#zmy-call-speakerbtn{display:none!important}}
#zmy-call-transcript-wrap{width:100%}
#zmy-call-transcript-btn{width:100%;padding:9px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#64748b;font-size:.75rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background .2s}
#zmy-call-transcript-body{display:none;margin-top:.5rem;background:#0a0a18;border:1px solid rgba(99,102,241,.15);border-radius:10px;padding:.9rem 1rem;max-height:140px;overflow-y:auto;font-size:.75rem;line-height:1.6;color:#94a3b8}
#zmy-call-back{font-size:.72rem;color:#475569;background:none;border:none;cursor:pointer;text-decoration:underline;margin-top:.2rem;transition:color .15s}
#zmy-call-back:hover{color:#94a3b8}
#zmy-presets{padding:8px 14px 12px;background:#0d0d1c;border-top:1px solid rgba(99,102,241,.12);flex-shrink:0}
#zmy-presets-lbl{font-size:.7rem;color:#64748b;margin-bottom:7px}
#zmy-presets-grid{display:flex;flex-wrap:wrap;gap:5px}
.zmy-pb{background:#111128;border:1px solid rgba(99,102,241,.2);border-radius:7px;padding:.3rem .6rem;font-size:.74rem;color:#94a3b8;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;line-height:1.5}
.zmy-pb:hover{border-color:rgba(99,102,241,.5);color:#a5b4fc;background:rgba(99,102,241,.12);transform:translateY(-1px)}
.zmy-pb.zmy-pb-on{border-color:#6366f1;background:rgba(99,102,241,.2);color:#a5b4fc;font-weight:700}
#zmy-demo-bar{display:none;padding:5px 14px;background:#0a0a18;border-top:1px solid rgba(99,102,241,.12);align-items:center;justify-content:space-between;font-size:.72rem;flex-shrink:0}
#zmy-demo-bar.on{display:flex}
#zmy-demo-biz{color:#94a3b8}
#zmy-demo-reset{color:#6366f1;background:none;border:none;cursor:pointer;font-family:inherit;font-size:.72rem;padding:0;text-decoration:underline}
.zmy-presets-msg{max-width:100%!important;width:100%;box-sizing:border-box;padding:10px 12px!important}
.zmy-pb-intro{font-size:.72rem;color:#64748b;margin-bottom:7px}
.zmy-pb-grid{display:flex;flex-wrap:wrap;gap:5px}
html[data-theme="light"] #zmy-win{background:#fff;border-color:rgba(99,102,241,.2)}
html[data-theme="light"] #zmy-msgs{background:#f8f9fc}
html[data-theme="light"] .zmy-bot{background:#eef0f8;border-color:rgba(99,102,241,.15);color:#1e293b}
html[data-theme="light"] .zmy-msg a{color:#6366f1}
html[data-theme="light"] .zmy-typing span{background:#6366f1}
html[data-theme="light"] #zmy-inp-row{background:#fff;border-top-color:rgba(99,102,241,.15)}
html[data-theme="light"] #zmy-input{background:#eef0f8;border-color:rgba(99,102,241,.2);color:#0f172a}
html[data-theme="light"] #zmy-input::placeholder{color:#94a3b8}
html[data-theme="light"] .zmy-pb{background:#fff;border-color:rgba(99,102,241,.28);color:#475569}
html[data-theme="light"] .zmy-pb:hover{background:rgba(99,102,241,.07);border-color:rgba(99,102,241,.45);color:#6366f1}
html[data-theme="light"] .zmy-pb.zmy-pb-on{background:rgba(99,102,241,.1);border-color:#6366f1;color:#6366f1}
html[data-theme="light"] #zmy-demo-bar{background:#f5f3ff;border-top-color:rgba(99,102,241,.15)}
html[data-theme="light"] #zmy-demo-biz{color:#475569}
html[data-theme="light"] #zmy-demo-reset{color:#6366f1}
html[data-theme="light"] #zmy-presets{background:#f5f3ff;border-top-color:rgba(99,102,241,.15)}
`;

  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // Bubble
  const bubble = document.createElement('button');
  bubble.id = 'zmy-bubble';
  bubble.setAttribute('aria-label', t('Open chat','Ouvrir le chat','Abrir chat'));
  bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;

  // Chat window
  const win = document.createElement('div');
  win.id = 'zmy-win';
  win.innerHTML = `
    <div id="zmy-head">
      <div id="zmy-avatar">🤖</div>
      <div>
        <div id="zmy-name">${BIZ.name}</div>
        <div id="zmy-status">${t('Online — ask me anything','En ligne — posez-moi une question','En línea — pregúntame lo que sea')}</div>
      </div>
      <button id="zmy-phone-btn" aria-label="${t('Start voice call','Appel vocal','Llamada de voz')}" title="${t('Talk to the AI agent','Parler à l\'agent IA','Hablar con el agente IA')}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
      </button>
      <button id="zmy-close" aria-label="Close">✕</button>
    </div>
    <div id="zmy-msgs"></div>
    <div id="zmy-call-panel">
      <div id="zmy-call-orb">📞<div id="zmy-call-ring"></div></div>
      <div id="zmy-call-label">${t('Zoomy AI Agent','Agent IA Zoomy','Agente IA Zoomy')}</div>
      <div id="zmy-call-statusline">${t('Ready','Prêt','Listo')}</div>
      <div id="zmy-call-waves"><span></span><span></span><span></span><span></span><span></span></div>
      <div id="zmy-call-timer" style="display:none">0:00</div>
      <button id="zmy-call-startbtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        <span id="zmy-call-startlabel">${t('Start Call','Démarrer l\'appel','Iniciar llamada')}</span>
      </button>
      <div id="zmy-call-controls">
        <button id="zmy-call-mutebtn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" id="zmy-mute-icon"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          <span id="zmy-mute-label">${t('Mute','Muet','Silencio')}</span>
        </button>
        <button id="zmy-call-speakerbtn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" id="zmy-speaker-icon"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          <span id="zmy-speaker-label">${t('Speaker','Haut-parleur','Altavoz')}</span>
        </button>
      </div>
      <div id="zmy-call-transcript-wrap" style="display:none">
        <button id="zmy-call-transcript-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span id="zmy-transcript-label">${t('View Transcript','Voir la transcription','Ver transcripción')}</span>
        </button>
        <div id="zmy-call-transcript-body"></div>
      </div>
      <button id="zmy-call-back">← ${t('Back to chat','Retour au chat','Volver al chat')}</button>
    </div>
    <div id="zmy-presets" style="display:none">
      <div id="zmy-presets-lbl">Try it as a business type:</div>
      <div id="zmy-presets-grid">
        <button class="zmy-pb" data-biz="restaurant">🍽️ Restaurant</button>
        <button class="zmy-pb" data-biz="gym">💪 Gym</button>
        <button class="zmy-pb" data-biz="salon">💇 Beauty Salon</button>
        <button class="zmy-pb" data-biz="dental">🦷 Dental Clinic</button>
        <button class="zmy-pb" data-biz="legal">⚖️ Law Firm</button>
        <button class="zmy-pb" data-biz="realestate">🏡 Real Estate</button>
        <button class="zmy-pb" data-biz="store">🛒 Online Store</button>
        <button class="zmy-pb" data-biz="auto">🚗 Auto Shop</button>
      </div>
    </div>
    <div id="zmy-demo-bar">
      <span id="zmy-demo-biz">Demo mode</span>
      <button id="zmy-demo-reset">↺ Back to Zoomy</button>
    </div>
    <div id="zmy-inp-row">
      <textarea id="zmy-input" rows="1" placeholder="${t('Ask about our services...','Posez votre question...','Pregunta sobre nuestros servicios...')}"></textarea>
      <button id="zmy-send" aria-label="Send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  const msgs = document.getElementById('zmy-msgs');
  const input = document.getElementById('zmy-input');
  const presetsEl   = document.getElementById('zmy-presets');
  const presetsGrid = document.getElementById('zmy-presets-grid');
  const demoBar     = document.getElementById('zmy-demo-bar');
  const demoBizEl   = document.getElementById('zmy-demo-biz');
  const demoResetBtn= document.getElementById('zmy-demo-reset');
  let isOpen = false;
  let savedScrollY = 0;

  // ── Session persistence ──────────────────────────────────────────────────
  const POPUP_STORE = 'zmy_popup_v1';
  function savePopup() {
    try {
      const items = Array.from(msgs.children).map(el => ({ cls: el.className, html: el.innerHTML }));
      sessionStorage.setItem(POPUP_STORE, JSON.stringify({ items, history: memory.history, tailoredBiz: popupTailoredBiz }));
    } catch(e) {}
  }
  function restorePopup() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(POPUP_STORE));
      if (!saved || !saved.items || !saved.items.length) return false;
      saved.items.forEach(m => {
        const d = document.createElement('div');
        d.className = m.cls;
        d.innerHTML = m.html;
        msgs.appendChild(d);
      });
      if (saved.history) memory.history = saved.history;
      if (saved.tailoredBiz) {
        popupTailoredBiz = saved.tailoredBiz;
        demoBizEl.textContent = saved.tailoredBiz.name;
        demoBar.classList.add('on');
        document.getElementById('zmy-name').textContent = saved.tailoredBiz.name;
        document.getElementById('zmy-status').textContent = saved.tailoredBiz.type;
      }
      msgs.scrollTop = msgs.scrollHeight;
      return true;
    } catch(e) { return false; }
  }

  function addMsg(html, role) {
    const d = document.createElement('div');
    d.className = 'zmy-msg ' + (role === 'bot' ? 'zmy-bot' : 'zmy-user');
    d.innerHTML = html;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    savePopup();
    return d;
  }

  function showTyping() {
    const d = document.createElement('div');
    d.className = 'zmy-msg zmy-bot zmy-typing';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  const AI_WORKER = 'https://zoomy-ai.zoozoomfast.workers.dev/chat';

  function showPresetsMsg() {
    const icons = {restaurant:'🍽️',gym:'💪',salon:'💇',dental:'🦷',legal:'⚖️',realestate:'🏡',store:'🛒',auto:'🚗'};
    const labels = {restaurant:'Restaurant',gym:'Gym',salon:'Beauty Salon',dental:'Dental Clinic',legal:'Law Firm',realestate:'Real Estate',store:'Online Store',auto:'Auto Shop'};
    const d = document.createElement('div');
    d.className = 'zmy-msg zmy-bot zmy-presets-msg';
    d.innerHTML = '<div class="zmy-pb-intro">💡 Optional — see a live demo as a specific business type:</div><div class="zmy-pb-grid">' +
      Object.keys(CB_PRESETS).map(k => '<button class="zmy-pb" data-biz="' + k + '">' + (icons[k]||'') + ' ' + labels[k] + '</button>').join('') +
      '</div>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    savePopup();
  }

  let sending = false;
  async function send() {
    if (sending) return;
    sending = true;
    setTimeout(() => { sending = false; }, 1500);
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    memory.history.push({ role: 'user', text }); if (memory.history.length > 20) memory.history.shift();
    input.style.height = 'auto';
    const typing = showTyping();

    const delay = 600 + Math.random() * 500;
    await new Promise(r => setTimeout(r, delay));

    // All messages go to Gemini — prices and knowledge come from the worker's PRICING object
    try {
      const endpoint = popupTailoredBiz ? DEMO_WORKER : AI_WORKER;
      const reqBody = popupTailoredBiz
        ? JSON.stringify({ message: text, history: memory.history.slice(-8), business: popupTailoredBiz })
        : JSON.stringify({ message: text, history: memory.history.slice(-8) });
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: reqBody
      });
      if (res.ok) {
        const { reply } = await res.json();
        typing.remove();
        addMsg(md(reply), 'bot');
        memory.history.push({ role: 'bot', text: reply }); if (memory.history.length > 20) memory.history.shift();
        return;
      }
    } catch { /* fall through to offline response */ }

    // Offline fallback only — worker unreachable
    typing.remove();
    addMsg(md(t(
      'Something went wrong — email us at **contact@zoomy.services** and we\'ll reply typically within 24 hours.',
      'Une erreur s\'est produite — écrivez-nous à **contact@zoomy.services**, nous répondons généralement sous 24h.',
      'Algo salió mal — escríbenos a **contact@zoomy.services** y respondemos normalmente en 24 horas.'
    )), 'bot');
  }

  function dismissAttn() {
    const a = document.getElementById('zmy-attn');
    if (a) a.remove();
  }

  function openChat() {
    if (isOpen) return;
    isOpen = true;
    dismissAttn();
    savedScrollY = window.scrollY;
    win.classList.add('open');
    if(window.innerWidth<=480){bubble.classList.add('zmy-hidden');}
    bubble.innerHTML = `<svg viewBox="0 0 24 24" fill="#fff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    if (msgs.children.length === 0 && !restorePopup()) {
      addMsg(md(t(
      "Hi there! 👋 I'm the Zoomy assistant. Ask me about campaigns, websites, chatbots, phone agents, or pricing.",
      "Bonjour ! 👋 Je suis l'assistant Zoomy. Posez-moi une question sur nos campagnes, sites web, chatbots, agents téléphoniques ou tarifs.",
      "¡Hola! 👋 Soy el asistente de Zoomy. Pregúntame sobre campañas, sitios web, chatbots, agentes telefónicos o precios."
    )), 'bot');
      if (!popupTailoredBiz) showPresetsMsg();
    }
    setTimeout(() => input.focus(), 300);
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('open');
    bubble.classList.remove('zmy-hidden');
    bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;
  }

  bubble.addEventListener('click', () => isOpen ? closeChat() : openChat());
  document.getElementById('zmy-close').addEventListener('click', closeChat);
  document.getElementById('zmy-send').addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });

  // ── Phone Agent Call Panel ────────────────────────────────────────────────
  // Hide the floating phone button on pages that have their own dedicated call demo
  // (phone-agent.html has #call-btn, index.html has #hp-call-btn)
  // — prevents users from accidentally using the wrong call UI on those pages
  // Hide the entire chatbot bubble on pages with their own dedicated call demo
  // (phone-agent.html has #call-btn, index.html has #hp-call-btn)
  // Showing the chatbot widget alongside the page's own call UI creates a confusing double-UI
  // Only hide popup on phone-agent page (has its own full-screen call UI)
  // Popup chatbot shows on all pages
  const phoneBtn      = document.getElementById('zmy-phone-btn');
  const callPanel     = document.getElementById('zmy-call-panel');
  const callOrb       = document.getElementById('zmy-call-orb');
  const callStatus    = document.getElementById('zmy-call-statusline');
  const callWaves     = document.getElementById('zmy-call-waves');
  const callTimer     = document.getElementById('zmy-call-timer');
  const callStartBtn  = document.getElementById('zmy-call-startbtn');
  const callStartLbl  = document.getElementById('zmy-call-startlabel');
  const callControls  = document.getElementById('zmy-call-controls');
  const callMuteBtn   = document.getElementById('zmy-call-mutebtn');
  const callMuteLbl   = document.getElementById('zmy-mute-label');
  const callMuteIcon  = document.getElementById('zmy-mute-icon');
  const callSpeakerBtn= document.getElementById('zmy-call-speakerbtn');
  const callSpeakerLbl= document.getElementById('zmy-speaker-label');
  const callSpeakerIc = document.getElementById('zmy-speaker-icon');
  const transcriptWrap= document.getElementById('zmy-call-transcript-wrap');
  const transcriptBtn = document.getElementById('zmy-call-transcript-btn');
  const transcriptLbl = document.getElementById('zmy-transcript-label');
  const transcriptBody= document.getElementById('zmy-call-transcript-body');
  const callBackBtn   = document.getElementById('zmy-call-back');

  let callConv = null;
  let callTimerInterval = null;
  let callSeconds = 0;
  let isMuted = false;
  let isSpeaker = false;
  let transcriptLines = [];
  let audioObserver = null;
  let desiredSinkId = null; // null = not active, '' or deviceId = speaker target

  function showCallPanel() {
    msgs.style.display = 'none';
    document.getElementById('zmy-inp-row').style.display = 'none';
    callPanel.classList.add('active');
    phoneBtn.classList.add('active-call');
  }

  function hideCallPanel() {
    callPanel.classList.remove('active');
    msgs.style.display = 'flex';
    document.getElementById('zmy-inp-row').style.display = 'flex';
    phoneBtn.classList.remove('active-call');
  }

  function resetCallUI(statusMsg) {
    if (callTimerInterval) { clearInterval(callTimerInterval); callTimerInterval = null; }
    callSeconds = 0;
    callConv = null; isMuted = false; isSpeaker = false; desiredSinkId = null;
    stopAudioObserver();
    callOrb.className = '';
    callOrb.style.cssText = '';
    callWaves.style.display = 'none';
    callTimer.style.display = 'none';
    callTimer.textContent = '0:00';
    callControls.style.display = 'none';
    callStartBtn.className = '';
    callStartBtn.disabled = false;
    callStartLbl.textContent = t('Start Call','Démarrer l\'appel','Iniciar llamada');
    callStartBtn.querySelector('svg').innerHTML = '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>';
    callMuteBtn.style.cssText = '';
    callMuteLbl.textContent = t('Mute','Muet','Silencio');
    callMuteIcon.innerHTML = '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>';
    callSpeakerBtn.style.cssText = '';
    callSpeakerLbl.textContent = t('Speaker','Haut-parleur','Altavoz');
    if (statusMsg !== null) {
      callStatus.textContent = statusMsg || t('Ready','Prêt','Listo');
      callStatus.className = '';
    }
    transcriptWrap.style.display = transcriptLines.length ? 'block' : 'none';
  }

  function startCallClock() {
    callSeconds = 0;
    callTimer.style.display = 'block';
    callTimerInterval = setInterval(() => {
      callSeconds++;
      const m = Math.floor(callSeconds / 60);
      const s = callSeconds % 60;
      callTimer.textContent = m + ':' + String(s).padStart(2, '0');
    }, 1000);
  }

  async function toggleCall() {
    if (callConv) {
      await callConv.endSession();
      return; // onDisconnect resets
    }
    try {
      callStartBtn.disabled = true;
      callStartLbl.textContent = t('Calling...','Appel en cours...','Llamando...');
      callStatus.textContent = t('Requesting microphone...','Demande microphone...','Solicitando micrófono...');
      callStatus.className = '';

      // SDK handles its own getUserMedia internally — no pre-flight needed

      callStatus.textContent = t('Ringing...','Sonnerie...','Llamando...');
      const tokenRes = await fetch(BIZ.phoneTokenUrl);
      const { signedUrl } = await tokenRes.json();

      callStatus.textContent = t('Connecting...','Connexion...','Conectando...');
      transcriptLines = [];
      transcriptBody.innerHTML = '';
      transcriptWrap.style.display = 'none';

      const pageLang = lang();
      const firstMessages = {
        fr: "Bonjour ! Je suis l'assistante IA de Zoomy. Comment puis-je vous aider aujourd'hui ?",
        es: "¡Hola! Soy la asistente IA de Zoomy. ¿En qué puedo ayudarle hoy?",
        en: "Hi there, this is Zoomy. I can help answer any questions about our services. What can I do for you?"
      };
      const systemPrompts = {
        fr: `# Langue (CRITIQUE)\nTu DOIS répondre UNIQUEMENT en français. # Personnalité\nTu es l'assistante IA de Zoomy, une agence digitale. Chaleureuse et professionnelle. # Services\nCampagnes (Meta/Google/TikTok) — setup à partir de 999$. Sites web — à partir de 199$/page. Agents téléphoniques IA — à partir de 699$. Chatbots — à partir de 599$. Contact: contact@zoomy.services`,
        es: `# Idioma (CRÍTICO)\nDEBES responder ÚNICAMENTE en español. # Personalidad\nEres la asistente IA de Zoomy, una agencia digital. # Servicios\nCampañas — setup desde $1.000. Sitios web desde $199/página. Agentes telefónicos IA — desde $699. Chatbots desde $599. Contacto: contact@zoomy.services`,
        en: undefined
      };
      const agentOverride = { language: pageLang, firstMessage: firstMessages[pageLang] || firstMessages.en };
      if (systemPrompts[pageLang]) agentOverride.prompt = { prompt: systemPrompts[pageLang] };

      const { Conversation } = await import('https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.4.0/+esm');
      callConv = await Conversation.startSession({
        signedUrl,
        overrides: { agent: agentOverride },
        onConnect: () => {
          startAudioObserver();
          callStartBtn.disabled = false;
          callStartBtn.classList.add('ending');
          callStartLbl.textContent = t('End Call','Terminer l\'appel','Terminar llamada');
          callStartBtn.querySelector('svg').innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
          callOrb.classList.add('live');
          callWaves.style.display = 'flex';
          callControls.style.display = 'flex';
          callStatus.textContent = t('Live','En direct','En vivo');
          callStatus.classList.add('live');
          startCallClock();
        },
        onMessage: (msg) => {
          const role = (msg.source === 'ai' || msg.source === 'agent' || msg.role === 'agent') ? t('Agent','Agent','Agente') : t('You','Vous','Tú');
          const text = msg.message || msg.text || '';
          if (text && text.trim()) transcriptLines.push({ role, text: text.trim() });
        },
        onDisconnect: (details) => {
          if (details && details.reason === 'error') {
            const code = details.closeCode ? ` (${details.closeCode})` : '';
            resetCallUI(null);
            callStatus.textContent = t('Connection error','Erreur de connexion','Error de conexión') + code;
            callStatus.style.color = '#ef4444';
          } else {
            if (transcriptLines.length) {
              transcriptBody.innerHTML = transcriptLines.map(l => `<div><strong>${l.role}:</strong> ${l.text}</div>`).join('');
              transcriptWrap.style.display = 'block';
            }
            resetCallUI(t('Call ended','Appel terminé','Llamada finalizada'));
          }
        },
        onError: (err) => {
          resetCallUI(null);
          callStatus.textContent = t('Could not connect. Check mic permissions.','Impossible de se connecter. Vérifiez le microphone.','No se pudo conectar. Revise el micrófono.');
          callStatus.style.color = '#ef4444';
        }
      });
    } catch(e) {
      resetCallUI(null);
      callStatus.textContent = t('Could not connect. Check mic permissions.','Impossible de se connecter. Vérifiez le microphone.','No se pudo conectar. Revise el micrófono.');
      callStatus.style.color = '#ef4444';
    }
  }

  callMuteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    if (callConv && callConv.setMicMuted) callConv.setMicMuted(isMuted);
    if (isMuted) {
      callMuteBtn.style.background = 'rgba(239,68,68,.18)';
      callMuteBtn.style.borderColor = 'rgba(239,68,68,.4)';
      callMuteIcon.innerHTML = '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" opacity=".3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" opacity=".3"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/><line x1="1" y1="1" x2="23" y2="23" stroke="#ef4444" stroke-width="2.5"/>';
      callMuteLbl.textContent = t('Unmute','Réactiver','Reanudar');
    } else {
      callMuteBtn.style.cssText = '';
      callMuteIcon.innerHTML = '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>';
      callMuteLbl.textContent = t('Mute','Muet','Silencio');
    }
  });

  function applyAudioSink(audioEl) {
    if (desiredSinkId !== null && typeof audioEl.setSinkId === 'function') {
      audioEl.setSinkId(desiredSinkId).catch(() => {});
    }
  }

  function startAudioObserver() {
    if (audioObserver) return;
    // Apply to any audio elements already in the DOM
    document.querySelectorAll('audio').forEach(applyAudioSink);
    // Watch for audio elements the ElevenLabs SDK creates dynamically
    audioObserver = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeName === 'AUDIO') applyAudioSink(node);
          if (node.querySelectorAll) node.querySelectorAll('audio').forEach(applyAudioSink);
        });
      });
    });
    audioObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  function stopAudioObserver() {
    if (audioObserver) { audioObserver.disconnect(); audioObserver = null; }
  }

  callSpeakerBtn.addEventListener('click', async () => {
    // iOS Safari and Firefox do not support setSinkId — show a friendly fallback
    const testAudio = document.createElement('audio');
    if (typeof testAudio.setSinkId !== 'function') {
      const prevText = callStatus.textContent;
      callStatus.textContent = t('Use device speaker button','Touche haut-parleur','Botón altavoz');
      setTimeout(() => { if (callStatus.textContent === t('Use device speaker button','Touche haut-parleur','Botón altavoz')) callStatus.textContent = prevText; }, 3000);
      return;
    }

    isSpeaker = !isSpeaker;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outputs = devices.filter(d => d.kind === 'audiooutput');
      const spkDev = outputs.find(d => /speaker|loud/i.test(d.label));
      const targetId = isSpeaker ? (spkDev ? spkDev.deviceId : '') : '';
      desiredSinkId = isSpeaker ? targetId : null;
      // Apply to all current audio elements (includes any the SDK has added)
      document.querySelectorAll('audio').forEach(a => { if (typeof a.setSinkId === 'function') a.setSinkId(targetId).catch(() => {}); });
    } catch(e) {}

    if (isSpeaker) {
      callSpeakerBtn.style.background = 'rgba(74,222,128,.18)';
      callSpeakerBtn.style.borderColor = 'rgba(74,222,128,.4)';
      callSpeakerIc.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
      callSpeakerLbl.textContent = t('Speaker On','Haut-parleur On','Altavoz On');
    } else {
      callSpeakerBtn.style.cssText = '';
      callSpeakerIc.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
      callSpeakerLbl.textContent = t('Speaker','Haut-parleur','Altavoz');
    }
  });

  transcriptBtn.addEventListener('click', () => {
    const open = transcriptBody.style.display !== 'none';
    transcriptBody.style.display = open ? 'none' : 'block';
    transcriptLbl.textContent = open
      ? t('View Transcript','Voir la transcription','Ver transcripción')
      : t('Hide Transcript','Masquer la transcription','Ocultar transcripción');
  });

  phoneBtn.addEventListener('click', () => {
    if (callPanel.classList.contains('active')) {
      if (callConv) return; // can't exit mid-call
      hideCallPanel();
    } else {
      showCallPanel();
    }
  });

  callBackBtn.addEventListener('click', () => {
    if (callConv) return; // can't exit mid-call, must end call first
    hideCallPanel();
  });

  callStartBtn.addEventListener('click', toggleCall);


  // ── Business type preset buttons ────────────────────────────────────────────
  msgs.addEventListener('click', async function(e) {
    const btn = e.target.closest('.zmy-pb');
    if (!btn) return;
    const type = btn.dataset.biz;
    const preset = CB_PRESETS[type];
    if (!preset) return;
    msgs.querySelectorAll('.zmy-pb').forEach(b => { b.classList.remove('zmy-pb-on'); b.disabled = true; });
    btn.classList.add('zmy-pb-on');
    presetsEl.style.display = 'none';
    msgs.innerHTML = '';
    memory.history = [];
    popupTailoredBiz = preset;
    const typing = showTyping();
    try {
      const res = await fetch(DEMO_WORKER, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '__INTRO__', history: [], business: preset })
      });
      let intro = `Hi! I'm the assistant for ${preset.name}. How can I help you today?`;
      if (res.ok) { const d = await res.json(); if (d.reply) intro = d.reply; }
      typing.remove();
      addMsg(md(intro), 'bot');
      memory.history.push({ role: 'bot', text: intro });
      demoBizEl.textContent = preset.name;
      demoBar.classList.add('on');
      document.getElementById('zmy-name').textContent = preset.name;
      document.getElementById('zmy-status').textContent = preset.type;
      savePopup();
    } catch(err) {
      typing.remove();
      addMsg(md('Something went wrong — try again.'), 'bot');
      popupTailoredBiz = null;
    }
    msgs.querySelectorAll('.zmy-pb').forEach(b => { b.disabled = false; });
  });

  demoResetBtn.addEventListener('click', function() {
    popupTailoredBiz = null;
    memory.history = [];
    msgs.innerHTML = '';
    demoBar.classList.remove('on');
    msgs.querySelectorAll('.zmy-pb').forEach(b => b.classList.remove('zmy-pb-on'));
    document.getElementById('zmy-name').textContent = BIZ.name;
    document.getElementById('zmy-status').textContent = t('Online — ask me anything','En ligne — posez-moi une question','En línea — pregúntame');
    addMsg(md(t(
      "Hi there! 👋 I'm the Zoomy assistant. Ask me about campaigns, websites, chatbots, phone agents, or pricing.",
      "Bonjour ! 👋 Je suis l'assistant Zoomy. Posez-moi une question sur nos services.",
      "¡Hola! 👋 Soy el asistente de Zoomy. Pregúntame sobre nuestros servicios."
    )), 'bot');
    showPresetsMsg();
    try { sessionStorage.removeItem(POPUP_STORE); } catch(e) {}
  });

  // Attention bubble — shown once ever via localStorage
  setTimeout(() => {
    if (isOpen) return;
    if (localStorage.getItem('zmy_popup_seen')) return;
    localStorage.setItem('zmy_popup_seen', '1');
    const attn = document.createElement('div');
    attn.id = 'zmy-attn';
    attn.textContent = t('Have a question? Ask me! 💬','Une question ? Demandez-moi ! 💬','¿Tienes una pregunta? ¡Pregúntame! 💬');
    document.body.appendChild(attn);
    attn.addEventListener('click', openChat);
    setTimeout(() => { if (document.getElementById('zmy-attn')) attn.remove(); }, 8000);
  }, 2500);

  // Mobile viewport fix
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      if (!isOpen) return;
      msgs.style.maxHeight = Math.max(120, window.visualViewport.height - 200) + 'px';
      msgs.scrollTop = msgs.scrollHeight;
    });
  }
}

render();

/* Export for test runner */

if (typeof window !== 'undefined') {
  window.__zmy = { ready: true };
}

})(); /* end IIFE */