// Rule-based matching: scores how well a listing fits a sponsor profile, from 0 to 100.
// Four rules: category fit (30), city (20), budget (30), audience (20).

const CATEGORY_FIT = {
  'Restaurant or cafe': ['Events', 'Creators', 'Student activities'],
  'Gym or fitness': ['Sports', 'Events'],
  'Bank or financial institution': ['Events', 'Student activities', 'Charity'],
  'Telecommunications': ['Events', 'Creators', 'Student activities'],
  'Clothing, beauty, or retail': ['Creators', 'Events'],
};

function words(text) {
  return String(text || '').toLowerCase().split(/[^a-z0-9؀-ۿ]+/).filter((w) => w.length > 2);
}

export function scoreListing(sponsor, listing) {
  const reasons = [];
  let score = 0;

  // 1. Category fit
  const fits = CATEGORY_FIT[sponsor.industry];
  if (!fits) score += 15; // unknown industry: neutral
  else if (fits.includes(listing.category)) { score += 30; reasons.push('category'); }

  // 2. City
  if (!sponsor.city) score += 10;
  else if (sponsor.city === listing.city) { score += 20; reasons.push('city'); }

  // 3. Budget: does the cheapest package fit the sponsor's budget?
  const lowest = Math.min(...listing.packages.map((p) => p.price));
  if (sponsor.budgetMax == null) score += 15;
  else if (lowest <= sponsor.budgetMax && (sponsor.budgetMin == null || lowest >= 0)) { score += 30; reasons.push('budget'); }

  // 4. Audience: shared words between preferred audience and target audience
  if (!sponsor.preferredAudience) score += 10;
  else {
    const wanted = new Set(words(sponsor.preferredAudience));
    const overlap = words(listing.targetAudience).some((w) => wanted.has(w));
    if (overlap) { score += 20; reasons.push('audience'); }
  }

  return { score: Math.min(100, score), reasons };
}
