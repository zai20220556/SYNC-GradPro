import { helpAr, helpEn } from './helpContent.js';

// The SYNC Assistant runs in the browser. It matches questions to the FAQ and listings,
// so it needs no paid service and can only answer from SYNC's own content.
const BROWSE_BUDGETS = [200, 500, 1000, 2000];
const MAX_RESULTS = 3;
const FAQ_THRESHOLD = 0.85;

export function normalize(text) {
  return String(text || '').toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0))
    .replace(/(\d),(?=\d{3})/g, '$1')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP = new Set(`a an the i me my we our you your it its is are am be was were do does did can could will would should shall of to in on at for from by with and or but if so this that these those there here how what when where why who which about please tell know get have has had need want not no just there sync
هل ما ماذا كيف لماذا اين متي من في علي الي عن مع او ثم هذا هذه ذلك تلك انا نحن انت هو هي لي لك كان يكون ان عند كل اي sync يمكن يمكنني اريد بدي ممكن شو ايش`.split(/\s+/));

const SYNONYMS = {
  cost: 'cost price fee charge free money expensive paid subscription سعر اسعار تكلفه رسوم مجاني مجانا مدفوع بكم',
  pay: 'pay payment process transfer invoice دفع مدفوعات ادفع تحويل',
  verify: 'verify verified verification badge trusted trust document توثيق موثق شاره مستند هويه',
  support: 'support contact help problem issue bug complaint report feedback دعم تواصل مساعده مشكله شكوي بلاغ ملاحظات',
  post: 'post publish upload create نشر انشر اضيف',
  listing: 'listing opportunity فرصه فرص اعلان اعلانات',
  account: 'account register signup sign join login حساب تسجيل اسجل',
  language: 'language arabic english لغه لغات عربي انجليزي',
  match: 'match score rank توافق درجه',
  compare: 'compare comparison قارن مقارنه',
  deal: 'deal booking contract صفقه صفقات عقد عقود',
  result: 'result reach engagement sale نتائج نتيجه وصول تفاعل مبيعات',
  message: 'message chat رساله رسائل',
  package: 'package باقه باقات',
  request: 'request طلب طلبات',
  reply: 'reply answer respond رد الرد اجابه',
  about: 'platform website site منصه موقع',
};
const SYNONYM_OF = Object.fromEntries(Object.entries(SYNONYMS).flatMap(([key, words]) => words.split(' ').map((w) => [w, key])));

function stem(word) {
  if (/^[a-z]/.test(word)) {
    if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
    if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
    if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
    return word;
  }
  return word.replace(/^(وال|بال|فال|كال|لل|ال)(?=.{2,})/, '').replace(/^و(?=.{3,})/, '');
}

function tokens(text) {
  const out = new Set();
  for (const raw of normalize(text).split(' ')) {
    if (!raw || STOP.has(raw)) continue;
    const base = stem(raw);
    if (STOP.has(base)) continue;
    out.add(SYNONYM_OF[raw] || SYNONYM_OF[base] || base);
  }
  return [...out];
}

function buildIndex(content) {
  const items = content.faq.flatMap((group) => group.items.map((item) => ({ ...item, qTokens: new Set(tokens(item.q)), aTokens: new Set(tokens(item.a)) })));
  const df = new Map();
  items.forEach((item) => new Set([...item.qTokens, ...item.aTokens]).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  return { items, df };
}
const INDEX = { en: buildIndex(helpEn), ar: buildIndex(helpAr) };

function bestFaq(question, lang) {
  const { items, df } = INDEX[lang];
  const query = tokens(question);
  if (!query.length) return { score: 0, item: null };
  const weight = (t) => Math.log(1 + items.length / (df.get(t) || 0.6));
  const total = query.reduce((sum, t) => sum + weight(t), 0);
  let best = { score: 0, item: null };
  for (const item of items) {
    const hit = query.reduce((sum, t) => sum + weight(t) * (item.qTokens.has(t) ? 1.5 : item.aTokens.has(t) ? 0.6 : 0), 0);
    const score = hit / total;
    if (score > best.score) best = { score, item };
  }
  return best;
}

const CATEGORY_TERMS = [
  ['Sports', /\b(sports?|football|soccer|padel|running|runners?|race|marathon|boxing|gymnastics?|athletes?|taekwondo|basketball|tennis)\b/, ['رياض', 'كره', 'بادل', 'ملاكم', 'جمباز', 'تايكوندو', 'جري', 'سباق']],
  ['Creators', /\b(creators?|influencers?|content|youtubers?|bloggers?)\b/, ['صناع', 'صانع', 'مؤثر', 'محتوي']],
  ['Student activities', /\b(students?|universit(?:y|ies)|campus)\b/, ['طلاب', 'طالب', 'جامع']],
  ['Charity', /\b(charit(?:y|ies)|nonprofits?|ngos?|donations?)\b/, ['خيري', 'تبرع', 'جمعيه']],
  ['Music and arts', /\b(music|concerts?|arts?|festivals?)\b/, ['موسيق', 'فنون', 'حفل']],
  ['Gaming and esports', /\b(gaming|games?|gamers?|esports?)\b/, ['العاب', 'الكترونيه', 'جيمنج']],
  ['Tech and startups', /\b(tech|technology|startups?)\b/, ['تقنيه', 'تكنولوج', 'ناشئ']],
  ['Education and workshops', /\b(education|workshops?|courses?)\b/, ['تعليم', 'ورش', 'ورشه']],
  ['Culture and community', /\b(culture|cultural|community)\b/, ['ثقاف', 'مجتمع']],
  ['Events', /\b(events?|conferences?)\b/, ['فعاليه', 'فعاليات', 'مؤتمر']],
];
const CITY_TERMS = [['Amman', /\bamman\b/, 'عمان'], ['Irbid', /\birbid\b/, 'اربد'], ['Zarqa', /\bzarqa\b/, 'زرقاء']];
const KEYWORDS = [['padel', 'بادل'], ['football', 'كره قدم'], ['boxing', 'ملاكم'], ['gymnastics', 'جمباز'], ['run', 'جري'], ['padel', 'padel'], ['football', 'football'], ['football', 'soccer'], ['boxing', 'boxing'], ['gymnastics', 'gymnast'], ['run', 'running'], ['run', 'runner'], ['run', 'race']];

function parseFilters(text) {
  const filters = {};
  const category = CATEGORY_TERMS.find(([, en, ar]) => en.test(text) || ar.some((term) => text.includes(term)));
  if (category) [filters.category] = category;
  const city = CITY_TERMS.find(([, en, ar]) => en.test(text) || text.includes(ar));
  if (city) [filters.city] = city;
  const budget = text.match(/(?:under|below|less than|max|maximum|up to|within|budget(?: of| is)?|cheaper than|no more than|اقل من|باقل من|تحت|حتي|بحدود|ميزانيه|ميزانيتي|بميزانيه)\s*(\d{2,6})/)
    || text.match(/\b(\d{2,6})\s*(?:jod|jd|dinars?)\b/)
    || text.match(/(\d{2,6})\s*(?:دينار|دنانير)/);
  if (budget) filters.budget = Number(budget[1]);
  const keyword = KEYWORDS.find(([, term]) => text.includes(term));
  if (keyword) [filters.keyword] = keyword;
  return filters;
}

function parseSort(text) {
  if (/\b(cheapest|cheaper|lowest|affordable)\b/.test(text) || /ارخص|اقل سعر|الاقل/.test(text)) return 'price';
  if (/\b(biggest|largest|highest|most reach|top reach)\b/.test(text) || /اكبر|اعلي|الاعلي/.test(text)) return 'reach';
  if (/\b(soonest|upcoming|next)\b/.test(text) || /اقرب|القادم/.test(text)) return 'date';
  return '';
}

const lowest = (l) => Math.min(...l.packages.map((p) => p.price));
const SORTERS = {
  price: (a, b) => lowest(a) - lowest(b),
  reach: (a, b) => b.expectedReach - a.expectedReach,
  date: (a, b) => (a.eventDate ? new Date(a.eventDate).getTime() : Infinity) - (b.eventDate ? new Date(b.eventDate).getTime() : Infinity),
};

function filterListings(listings, { category, city, budget, keyword }) {
  let out = listings.filter((l) => (!category || l.category === category)
    && (!city || l.city === city)
    && (!budget || l.packages.some((p) => p.price <= budget)));
  if (keyword) {
    const narrowed = out.filter((l) => normalize(`${l.title} ${l.description}`).includes(keyword));
    if (narrowed.length) out = narrowed;
  }
  return out;
}

function browseLink({ category, city, budget }) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (city) params.set('city', city);
  if (BROWSE_BUDGETS.includes(budget)) params.set('budget', String(budget));
  const query = params.toString();
  return '/browse' + (query ? '?' + query : '');
}

const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key]);
const card = (l) => ({ id: l.id, title: l.title, city: l.city, price: lowest(l) });

function searchReply(listings, filters, sort, copy) {
  if (!listings) return { kind: 'error', text: copy.loadError, context: { filters, sort } };
  const order = SORTERS[sort] || SORTERS.price;
  const found = filterListings(listings, filters).sort(order);
  const context = { filters, sort };
  if (found.length) {
    const shown = Math.min(found.length, MAX_RESULTS);
    const text = found.length === 1 ? copy.foundOne : found.length > shown ? fill(copy.foundMany, { total: found.length, shown }) : fill(copy.foundAll, { total: found.length });
    return { kind: 'listings', text, listings: found.slice(0, shown).map(card), link: browseLink(filters), context };
  }
  for (const relaxed of [{ ...filters, budget: undefined }, { ...filters, budget: undefined, category: undefined, keyword: undefined }, { ...filters, budget: undefined, city: undefined }]) {
    const closest = filterListings(listings, relaxed).sort(order);
    if (closest.length) return { kind: 'listings', text: `${copy.none} ${copy.closest}`, listings: closest.slice(0, MAX_RESULTS).map(card), link: browseLink(relaxed), context };
  }
  return { kind: 'unknown', text: copy.none, link: '/browse', context };
}

const SEARCH_VERB = /\b(find|show|search|looking|look|recommend|suggest|give|list|browse|any|which)\b|ابحث|اعرض|اظهر|اعطني|دور|اقترح|وين/;
const LISTING_NOUN = /\b(listings?|opportunit(?:y|ies))\b|فرص|اعلانات|اعلان/;
const QUESTION_START = /^(how|what is|what does|what are|why|does|do|can|is|are|who|where|will|كيف|ما هو|ما هي|ماذا|لماذا|هل|من|اين|متي)\b/;
const GREETING = /^(hi|hello|hey|salam|salaam|marhaba|good (morning|evening|afternoon)|مرحبا|اهلا|السلام عليكم|هلا|صباح الخير|مساء الخير)( there| sync)?$/;
const THANKS = /^(thanks?|thank you|thx|ok thanks|شكرا|يسلمو|مشكور|شكرا لك)( a lot| so much| جزيلا)?$/;

// Common wordings that map straight to an FAQ entry: [group index, question index].
const FAQ_INTENTS = [
  [/\b(what is sync|what s sync|whats sync|about sync|how does (sync|it) work|what do you do)\b|(ما هو|ما هي|شو هو|عن|كيف يعمل) sync/, [0, 0]],
  [/\b(payments?|pay|paying)\b|مدفوعات|ادفع|الدفع/, [3, 0]],
  [/\b(is (it|sync) free|free to use|how much|costs?|fees?|charges?|pricing)\b|مجاني|تكلف|رسوم|بكم/, [0, 2]],
  [/\b(get|become|be) verified\b|\bverify my\b|احصل علي التوثيق|اوثق حساب/, [4, 1]],
  [/\b(who can see|who sees)\b.*\bdocuments?\b|من (يري|يمكنه رؤيه).*مستند/, [4, 2]],
  [/\bcompare\b|قارن|اقارن|مقارنه/, [2, 0]],
  [/\b(report|problem|issue|bug|complaint|feedback|contact|customer support|talk to|speak to)\b|مشكله|ابلغ|شكوي|ملاحظات|تواصل/, [5, 0]],
];

function intentFaq(text, lang) {
  const match = FAQ_INTENTS.find(([pattern]) => pattern.test(text));
  if (!match) return null;
  const [group, item] = match[1];
  return (lang === 'ar' ? helpAr : helpEn).faq[group].items[item];
}

export function replyLanguage(question, uiLanguage) {
  if (/[؀-ۿ]/.test(question)) return 'ar';
  if (/[a-z]/i.test(question)) return 'en';
  return uiLanguage === 'ar' ? 'ar' : 'en';
}

export function answer(question, { listings = null, context = null, uiLanguage = 'en' } = {}) {
  const lang = replyLanguage(question, uiLanguage);
  const copy = (lang === 'ar' ? helpAr : helpEn).assistant;
  const text = normalize(question);
  const keep = context || null;

  if (!text) return { lang, kind: 'unknown', text: copy.unknown, link: '/help#contact', context: keep };
  if (GREETING.test(text)) return { lang, kind: 'chat', text: copy.greeting, context: keep };
  if (THANKS.test(text)) return { lang, kind: 'chat', text: copy.thanks, context: keep };

  const filters = parseFilters(text);
  const sort = parseSort(text);
  const hasFilter = Boolean(filters.category || filters.city || filters.budget || filters.keyword);
  const hasPlace = Boolean(filters.city || filters.budget);
  const verb = SEARCH_VERB.test(text);
  const noun = LISTING_NOUN.test(text);
  const howQuestion = QUESTION_START.test(text);
  const faq = bestFaq(question, lang);
  const faqStrong = faq.score >= FAQ_THRESHOLD;
  const intent = hasPlace ? null : intentFaq(text, lang);
  if (intent) return { lang, kind: 'faq', text: intent.a, title: intent.q, context: keep };

  if (howQuestion && !hasPlace && faqStrong && !(verb && filters.category)) {
    return { lang, kind: 'faq', text: faq.item.a, title: faq.item.q, context: keep };
  }
  if (hasFilter) {
    const merged = keep && !verb ? { ...keep.filters, ...filters } : filters;
    return { lang, ...searchReply(listings, merged, sort || (keep && !verb ? keep.sort : ''), copy) };
  }
  if (sort && (keep || verb || noun)) {
    return { lang, ...searchReply(listings, keep?.filters || {}, sort, copy) };
  }
  if (noun && verb) return { lang, ...searchReply(listings, {}, sort, copy) };
  if (faqStrong) return { lang, kind: 'faq', text: faq.item.a, title: faq.item.q, context: keep };
  return { lang, kind: 'unknown', text: copy.unknown, link: '/help#contact', context: keep };
}
