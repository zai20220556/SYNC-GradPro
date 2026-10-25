export function formatDate(value, lang) {
  const locale = lang === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB';
  return new Date(value).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

// Turns "- a\n- b" into ['a', 'b'] so bullets render correctly in both directions.
export function benefitLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-\u2022*]+\s*/, '').trim())
    .filter(Boolean);
}
