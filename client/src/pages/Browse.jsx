import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ListingCard from '../components/ListingCard.jsx';
import { CATEGORIES, catLabel } from '../categories.js';

const CITIES = ['Amman', 'Irbid', 'Zarqa'];

export default function Browse() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [listings, setListings] = useState([]);
  const [scores, setScores] = useState({});
  const [selected, setSelected] = useState([]);
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

  useEffect(() => {
    if (user?.role !== 'SPONSOR') { setScores({}); return; }
    api('/matches').then((d) => {
      const map = {};
      d.matches.forEach((m) => { map[m.listingId] = m.score; });
      setScores(map);
    }).catch(() => {});
  }, [user]);

  const toggle = (id) => setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : selected.length < 3 ? [...selected, id] : selected);
  const shown = [...listings].sort((a, b) => (scores[b.id] ?? -1) - (scores[a.id] ?? -1));

  return (
    <div className="page">
      <h2>{t('browse.title')}</h2>
      <div className="filters">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('browse.search')} aria-label={t('browse.search')} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">{t('browse.all')}</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(t, c)}</option>)}
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
          <option value="">{t('browse.allCities')}</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn alt" disabled={selected.length < 2} onClick={() => navigate('/compare?ids=' + selected.join(','))}>
          {t('cmp.go')} ({selected.length})
        </button>
      </div>
      {user?.role === 'SPONSOR' && <p className="muted">{t('cmp.sorted')}</p>}
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {shown.map((l) => <ListingCard key={l.id} listing={l} match={scores[l.id]} selected={selected.includes(l.id)} onToggle={toggle} />)}
      </div>
      {!error && listings.length === 0 && <p>{t('browse.empty')}</p>}
    </div>
  );
}
