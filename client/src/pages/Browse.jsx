import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import ListingCard from '../components/ListingCard.jsx';

const CATEGORIES = ['Events', 'Sports', 'Creators', 'Student activities', 'Charity'];
const CITIES = ['Amman', 'Irbid', 'Zarqa'];

export default function Browse() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    api('/listings?' + params.toString())
      .then((d) => { setListings(d.listings); setError(''); })
      .catch((e) => setError(e.message));
  }, [q, category, city]);

  return (
    <div className="page">
      <h2>{t('browse.title')}</h2>
      <div className="filters">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('browse.search')} aria-label={t('browse.search')} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">{t('browse.all')}</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
          <option value="">{t('browse.allCities')}</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
      {!error && listings.length === 0 && <p>{t('browse.empty')}</p>}
    </div>
  );
}
