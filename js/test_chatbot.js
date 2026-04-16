'use strict';
// Mock browser globals
global.window = {};
Object.defineProperty(global, 'navigator', { value: { language:'en-US' }, writable:true });
global.localStorage = { getItem:()=>null, setItem:()=>{} };
const noop = ()=>{};
global.document = {
  createElement:()=>({ style:{}, setAttribute:noop, addEventListener:noop, appendChild:noop,
    innerHTML:'', textContent:'', children:[], scrollHeight:0, querySelectorAll:()=>[], remove:noop }),
  head:{ appendChild:noop }, body:{ appendChild:noop, style:{} },
  getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[]
};
global.setTimeout = ()=>{};

let src = require('fs').readFileSync(__dirname + '/chatbot.js','utf8');
src = src.replace('render();\n', '');  // skip UI
eval(src + '\nglobal.__zmy={getResponse,KB,norm,anyKw,expandSynonyms};');
const { getResponse:gr, KB:kb, norm, anyKw, expandSynonyms } = global.__zmy;

function isFallback(r) {
  return r.includes("didn't quite catch") || r.includes("n'ai pas bien saisi") || r.includes("No entendí");
}

const tests = [
  // Greetings
  ['hello','greeting'],['hi','greeting'],['hey','greeting'],['bonjour','greeting'],
  ['salut','greeting'],['hola','greeting'],['buenos dias','greeting'],
  ['good morning','greeting'],['anyone there','greeting'],['start','greeting'],
  ['begin','greeting'],['help','greeting'],
  // Thanks
  ['thanks','thanks'],['thank you','thanks'],['merci','thanks'],
  ['gracias','thanks'],['perfect','thanks'],['awesome','thanks'],['great','thanks'],
  // Contact
  ['contact','contact'],['email you','contact'],['how do i reach you','contact'],
  ['contacter','contact'],['talk to a human','contact'],['get in touch','contact'],
  ['speak to someone','contact'],
  // Pricing/Quote
  ['how much','quote'],['pricing','quote'],['get a quote','quote'],
  ['what does it cost','quote'],['fees','quote'],['combien','quote'],
  ['presupuesto','quote'],['devis','quote'],['cost','quote'],['budget','quote'],
  // Free page
  ['free page','freepage'],['first page free','freepage'],['free sample','freepage'],
  ['page gratuite','freepage'],['primera pagina gratis','freepage'],['trial','freepage'],
  // Campaigns
  ['paid media','campaigns'],['campaign management','campaigns'],
  ['manage ads','campaigns'],['digital advertising','campaigns'],
  ['paid ads','campaigns'],['campagne','campaigns'],['campañas','campaigns'],
  // Meta
  ['meta ads','meta-ads'],['facebook ads','meta-ads'],['instagram ads','meta-ads'],
  ['fb ads','meta-ads'],['meta pixel','meta-ads'],['lookalike','meta-ads'],
  ['carousel ads','meta-ads'],['facebook campaign','meta-ads'],
  // Google
  ['google ads','google-ads'],['adwords','google-ads'],['ppc','google-ads'],
  ['pay per click','google-ads'],['quality score','google-ads'],
  ['performance max','google-ads'],['negative keywords','google-ads'],
  ['search campaign','google-ads'],
  // TikTok
  ['tiktok ads','tiktok-ads'],['tiktok advertising','tiktok-ads'],
  ['spark ads','tiktok-ads'],['infeed','tiktok-ads'],['topfeed','tiktok-ads'],
  // LinkedIn
  ['linkedin ads','linkedin-ads'],['b2b ads','linkedin-ads'],
  ['inmail','linkedin-ads'],['lead gen form','linkedin-ads'],['sponsored content','linkedin-ads'],
  // Budget
  ['ad spend','ad-spend'],['minimum budget','ad-spend'],['roas','ad-spend'],
  ['minimum spend','ad-spend'],['media budget','ad-spend'],
  // Retargeting
  ['retargeting','retargeting'],['remarketing','retargeting'],
  ['warm audience','retargeting'],['custom audience','retargeting'],
  ['website visitors','retargeting'],
  // Reporting
  ['report','reporting'],['analytics','reporting'],['kpis','reporting'],
  ['conversion rate','reporting'],['cpa','reporting'],['cpl','reporting'],
  ['ctr','reporting'],['dashboard','reporting'],
  // Websites
  ['website','websites'],['custom website','websites'],['web design','websites'],
  ['from scratch','websites'],['site web','websites'],['sitio web','websites'],
  ['no template','websites'],
  // WordPress
  ['wordpress','wordpress'],['wix','wordpress'],['squarespace','wordpress'],
  ['do you use wordpress','wordpress'],['page builder','wordpress'],
  // Ecommerce
  ['online store','ecommerce'],['shopify','ecommerce'],['sell online','ecommerce'],
  ['mollie','ecommerce'],['e-commerce','ecommerce'],['online shop','ecommerce'],
  // Booking
  ['booking system','booking'],['reservation system','booking'],
  ['book online','booking'],['appointment booking','booking'],['slot booking','booking'],
  // Multilingual
  ['multilingual','multilingual'],['multiple languages','multilingual'],
  ['french website','multilingual'],['hreflang','multilingual'],['translation','multilingual'],
  // Domain/hosting
  ['domain','domain-hosting'],['hosting','domain-hosting'],
  ['deploy','domain-hosting'],['go live','domain-hosting'],['dns','domain-hosting'],
  // Admin
  ['admin panel','admin-panel'],['admin dashboard','admin-panel'],
  ['backend access','admin-panel'],['mfa','admin-panel'],['control panel','admin-panel'],
  // Landing
  ['landing page','landing'],['single page','landing'],['conversion page','landing'],
  ['squeeze page','landing'],
  // Phone agent
  ['phone agent','phoneagent'],['voice agent','phoneagent'],['ai phone','phoneagent'],
  ['answer calls','phoneagent'],['virtual receptionist','phoneagent'],
  ['elevenlabs','phoneagent'],['call bot','phoneagent'],['ai receptionist','phoneagent'],
  // Phone booking
  ['phone booking','phone-booking'],['book by phone','phone-booking'],
  ['google calendar','phone-booking'],['webhook','phone-booking'],['calendar integration','phone-booking'],
  // Transcripts
  ['transcript','phone-transcripts'],['call recording','phone-transcripts'],
  ['call log','phone-transcripts'],['quality control','phone-transcripts'],
  // Phone number
  ['phone number','phone-number'],['link number','phone-number'],['call forwarding','phone-number'],
  // Chatbot
  ['chatbot','chatbot'],['chat bot','chatbot'],['website chatbot','chatbot'],
  ['chat widget','chatbot'],['conversational ai','chatbot'],
  // Chatbot training
  ['how do you train','chatbot-training'],['knowledge base','chatbot-training'],
  ['what data','chatbot-training'],['teach chatbot','chatbot-training'],
  // API chatbot
  ['openai chatbot','chatbot-api'],['api chatbot','chatbot-api'],['gpt chatbot','chatbot-api'],
  // Process
  ['how does it work','process'],['how do we start','process'],
  ['next steps','process'],['getting started','process'],['processus','process'],
  // Timeline
  ['how long','timeline'],['turnaround','timeline'],['how fast','timeline'],
  ['deadline','timeline'],['délai','timeline'],['plazo','timeline'],
  // About
  ['who are you','about'],['about zoomy','about'],['your company','about'],
  ['a propos','about'],['quienes son','about'],
  // SEO
  ['seo','seo'],['search ranking','seo'],['google ranking','seo'],
  ['technical seo','seo'],['on page seo','seo'],
  // Analytics
  ['ga4','analytics'],['google tag manager','analytics'],
  ['meta pixel setup','analytics'],['conversion tracking','analytics'],['gtm','analytics'],
  // Bye
  ['goodbye','bye'],['au revoir','bye'],['bye','bye'],['adios','bye'],
  // Typos & informal
  ['campaine','campaigns'],['websit','websites'],['chatbt','chatbot'],
  ['phon agent','phoneagent'],['adword','google-ads'],['facbook ads','meta-ads'],
  ['bookng system','booking'],['pricng','quote'],['hostng','domain-hosting'],
  // FR phrases
  ['comment ça marche','process'],['combien coute un site','quote'],
  ['systeme de reservation','booking'],['agent telephonique','phoneagent'],
  ['site multilingue','multilingual'],['nom de domaine','domain-hosting'],
  // ES phrases
  ['como funciona','process'],['cuanto cuesta','quote'],
  ['agente de llamadas','phoneagent'],['pagina de aterrizaje','landing'],
  ['sitio personalizado','websites'],
];

// Run main tests
let pass=0, fail=0, failures=[];
for (const [input, expectedId] of tests) {
  const resp = gr(input);
  if (isFallback(resp) && expectedId !== 'fallback') {
    fail++; failures.push([input, expectedId, 'fallback']);
  } else { pass++; }
}

// Follow-up tests
const fuTests = [
  {prime:'campaigns', q:'which platform should i start with', mustHave:'Meta'},
  {prime:'campaigns', q:'both platforms at once', mustHave:'Meta'},
  {prime:'meta-ads', q:'how much do meta ads cost', mustHave:'email'},
  {prime:'meta-ads', q:'what roas can i expect', mustHave:'ROAS'},
  {prime:'websites', q:'how much does a website cost', mustHave:'200'},
  {prime:'websites', q:'can i see examples', mustHave:'email'},
  {prime:'phoneagent', q:'how much does the phone agent cost', mustHave:'600'},
  {prime:'phoneagent', q:'can i try a demo', mustHave:'phone-agent'},
  {prime:'chatbot', q:'what is the price', mustHave:'500'},
  {prime:'quote', q:'i need a website quote', mustHave:'email'},
];
let fuPass=0, fuFail=0;
for (const t of fuTests) {
  gr(t.prime);
  const resp = gr(t.q);
  if (resp.includes(t.mustHave)) { fuPass++; }
  else { fuFail++; failures.push(['followup:'+t.q, t.mustHave, resp.slice(0,80)]); }
}

// Gibberish / edge cases
const edgeCases = [
  ['', undefined], ['   ', undefined], ['asdfghjkl', 'fallback'],
  ['123456', 'fallback'], ['!@#$%', 'fallback'],
];
let edgePass=0;
for (const [input, exp] of edgeCases) {
  try { const r = gr(input); edgePass++; } catch(e) { failures.push(['edge:'+input, exp, e.message]); }
}

const total = tests.length + fuTests.length + edgeCases.length;
const totalPass = pass + fuPass + edgePass;
console.log('\n══════════════════════════════════════════');
console.log('   ZOOMY CHATBOT TEST RESULTS');
console.log('══════════════════════════════════════════');
console.log(`Total tests run:    ${total}`);
console.log(`✅ Passed:          ${totalPass}`);
console.log(`❌ Failed:          ${fail + fuFail}`);
console.log(`Pass rate:          ${((totalPass/total)*100).toFixed(1)}%`);
console.log(`KB entries:         ${kb.length}`);
console.log(`Follow-up tests:    ${fuPass}/${fuTests.length} passed`);
console.log(`Edge case handling: ${edgePass}/${edgeCases.length} stable`);
if (failures.length) {
  console.log('\nTop failures:');
  failures.slice(0,15).forEach(([i,e,g])=>console.log(` ✗ "${i}" → expected "${e}", got: ${g}`));
}
console.log('══════════════════════════════════════════');
