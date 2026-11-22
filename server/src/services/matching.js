// Rule-based matching: scores how well a listing fits a sponsor profile, from 0 to 100.
// Four rules: category fit (30), city (20), budget (30), audience (20).
// A rule with no profile data is left out, so blank details never create a fake score.

// Used when a sponsor leaves "Budget from" blank. 50 JOD is a small local sponsorship.
const DEFAULT_MIN_BUDGET_JOD = 50;

const CATEGORY_FIT = {
  'Restaurant or cafe': ['Events', 'Creators', 'Student activities', 'Music and arts', 'Culture and community'],
  'Gym or fitness': ['Sports', 'Events', 'Education and workshops'],
  'Bank or financial institution': ['Events', 'Student activities', 'Charity', 'Education and workshops', 'Tech and startups'],
  'Telecommunications': ['Events', 'Creators', 'Student activities', 'Gaming and esports', 'Tech and startups', 'Music and arts'],
  'Clothing, beauty, or retail': ['Creators', 'Events', 'Music and arts', 'Gaming and esports'],
};

export const INDUSTRIES = [...Object.keys(CATEGORY_FIT), 'Other'];
export const CITIES = ['Amman', 'Irbid', 'Zarqa'];

function words(text) {
  return String(text || '').toLowerCase().split(/[^a-z0-9؀-ۿ]+/).filter((w) => w.length > 2);
}

// City and maximum budget are needed before a score means anything.
export function missingMatchDetails(sponsor) {
  const missing = [];
  if (!sponsor?.city) missing.push('city');
  if (sponsor?.budgetMax == null) missing.push('budget');
  return missing;
}

export function scoreListing(sponsor, listing) {
  const reasons = [];
  let earned = 0;
  let possible = 0;

  // 1. Category fit
  const fits = CATEGORY_FIT[sponsor.industry];
  if (fits) {
    possible += 30;
    if (fits.includes(listing.category)) { earned += 30; reasons.push('category'); }
  }

  // 2. City
  if (sponsor.city) {
    possible += 20;
    if (sponsor.city === listing.city) { earned += 20; reasons.push('city'); }
  }

  // 3. Budget: does at least one package fall inside the sponsor's budget?
  if (sponsor.budgetMax != null) {
    possible += 30;
    const budgetMin = sponsor.budgetMin ?? DEFAULT_MIN_BUDGET_JOD;
    if (listing.packages.some((p) => p.price >= budgetMin && p.price <= sponsor.budgetMax)) { earned += 30; reasons.push('budget'); }
  }

  // 4. Audience: shared words between preferred audience and target audience
  if (sponsor.preferredAudience) {
    possible += 20;
    const wanted = new Set(words(sponsor.preferredAudience));
    if (words(listing.targetAudience).some((w) => wanted.has(w))) { earned += 20; reasons.push('audience'); }
  }

  return { score: possible ? Math.round((earned / possible) * 100) : 0, reasons };
}
