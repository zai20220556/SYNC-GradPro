// Stored values are the English names (they are saved in the database and used for filtering).
export const CATEGORIES = [
  'Events',
  'Sports',
  'Creators',
  'Student activities',
  'Charity',
  'Music and arts',
  'Gaming and esports',
  'Tech and startups',
  'Education and workshops',
  'Culture and community',
];

const KEYS = {
  'Events': 'events',
  'Sports': 'sports',
  'Creators': 'creators',
  'Student activities': 'student',
  'Charity': 'charity',
  'Music and arts': 'music',
  'Gaming and esports': 'gaming',
  'Tech and startups': 'tech',
  'Education and workshops': 'education',
  'Culture and community': 'culture',
};

// Shows the category in the current language; unknown values are shown as saved.
export function catLabel(t, value) {
  const key = KEYS[value];
  return key ? t('cat.' + key) : value;
}
