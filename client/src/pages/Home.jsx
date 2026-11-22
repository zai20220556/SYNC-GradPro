import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { CATEGORIES, catLabel, cityLabel } from '../categories.js';
import { formatNumber } from '../format.js';

const CITIES = ['Amman', 'Irbid', 'Zarqa'];
const BUDGETS = [200, 500, 1000, 2000];
const SHORTCUT_COUNT = 6;

function matches(listing, { q, category, city, budget }) {
  const term = q.trim().toLowerCase();
  if (term && !`${listing.title} ${listing.description}`.toLowerCase().includes(term)) return false;
  if (category && listing.category !== category) return false;
  if (city && listing.city !== city) return false;
  if (budget && !listing.packages.some((p) => p.price <= Number(budget))) return false;
  return true;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [filters, setFilters] = useState({ q: '', category: '', city: '', budget: '' });
  const steps = [1, 2, 3, 4];
  const seekerPath = user?.role === 'SEEKER' ? '/post' : user ? null : '/register?role=SEEKER';
  const sponsorPath = !user ? '/register?role=SPONSOR' : user.role === 'SPONSOR' ? '/browse' : null;
  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  useEffect(() => {
    const controller = new AbortController();
    api('/listings', { signal: controller.signal }).then((d) => setCatalog(d.listings)).catch(() => {});
    return () => controller.abort();
  }, []);

  const count = useMemo(() => (catalog ? catalog.filter((l) => matches(l, filters)).length : null), [catalog, filters]);
  const shortcuts = useMemo(() => (catalog || [])
    .reduce((list, l) => {
      const found = list.find((c) => c.name === l.category);
      if (found) found.total += 1; else list.push({ name: l.category, total: 1 });
      return list;
    }, [])
    .sort((a, b) => b.total - a.total)
    .slice(0, SHORTCUT_COUNT), [catalog]);
  const hasListings = (key, value) => !catalog || catalog.some((l) => l[key] === value);

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value.trim()) params.set(key, value.trim()); });
    const query = params.toString();
    navigate('/browse' + (query ? '?' + query : ''));
  }

  return (
    <div className="home">
      <section className="home-hero">
        <div className="wrap home-hero-inner">
          <div className="hero-copy">
            <h1>{t('tagline')}</h1>
            <p>{t('heroText')}</p>
            {user && <p>{t('welcome')} {user.email}</p>}
          </div>

          <form className="finder" role="search" aria-labelledby="finder-title" onSubmit={submit}>
            <h2 id="finder-title">{t('home.finderTitle')}</h2>
            <div className="finder-search">
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="M13.2 13.2L17 17" /></svg>
              <input type="search" value={filters.q} onChange={set('q')} placeholder={t('browse.search')} aria-label={t('browse.search')} />
            </div>
            <div className="finder-fields">
              <div className="fld">
                <label htmlFor="finder-category">{t('browse.category')}</label>
                <select id="finder-category" value={filters.category} onChange={set('category')}>
                  <option value="">{t('browse.all')}</option>
                  {CATEGORIES.filter((c) => hasListings('category', c)).map((c) => <option key={c} value={c}>{catLabel(t, c)}</option>)}
                </select>
              </div>
              <div className="fld">
                <label htmlFor="finder-city">{t('browse.city')}</label>
                <select id="finder-city" value={filters.city} onChange={set('city')}>
                  <option value="">{t('browse.allCities')}</option>
                  {CITIES.filter((c) => hasListings('city', c)).map((c) => <option key={c} value={c}>{cityLabel(t, c)}</option>)}
                </select>
              </div>
              <div className="fld">
                <label htmlFor="finder-budget">{t('browse.budget')}</label>
                <select id="finder-budget" value={filters.budget} onChange={set('budget')}>
                  <option value="">{t('browse.anyBudget')}</option>
                  {BUDGETS.map((b) => <option key={b} value={b}>{t('browse.upTo', { amount: formatNumber(b, i18n.language) })}</option>)}
                </select>
              </div>
            </div>
            <button className="btn block finder-submit" type="submit" disabled={count === 0} aria-live="polite">
              {count === null ? t('home.finderCta') : count === 0 ? t('browse.empty') : t('home.finderShow', { results: t('browse.results', { count }) })}
            </button>
            <div className="finder-shortcuts">
              {shortcuts.length > 0 && (
                <>
                  <p id="finder-shortcuts-label">{t('home.finderShortcuts')}</p>
                  <ul aria-labelledby="finder-shortcuts-label">
                    {shortcuts.map((c) => (
                      <li key={c.name}>
                        <Link to={'/browse?category=' + encodeURIComponent(c.name)}>
                          {catLabel(t, c.name)} <b>{formatNumber(c.total, i18n.language)}</b>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </form>
        </div>
      </section>

      <div className="wrap">
        <section className="role-paths" aria-label={t('home.pathsLabel')}>
          <div className="role-path">
            <h2>{t('home.seekerTitle')}</h2>
            <p className="muted">{t('home.seekerText')}</p>
            {seekerPath && <Link className="btn" to={seekerPath}>{t('home.seekerCta')}</Link>}
          </div>
          <div className="role-path">
            <h2>{t('home.sponsorTitle')}</h2>
            <p className="muted">{t('home.sponsorText')}</p>
            {sponsorPath && <Link className="btn" to={sponsorPath}>{t(user ? 'home.cta' : 'home.sponsorCta')}</Link>}
          </div>
        </section>

        <section className="home-section">
          <h2>{t('home.how')}</h2>
          <ol className="steps">
            {steps.map((n) => (
              <li key={n}>
                <b>{t(`home.s${n}`)}</b>
                <p className="muted">{t(`home.s${n}t`)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="trust-split">
          <h2>{t('home.trustTitle')}</h2>
          <div className="trust-col">
            <h3>
              <span className="trust-icon"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg></span>
              {t('home.checkedTitle')}
            </h3>
            <p className="muted">{t('home.checkedText')}</p>
          </div>
          <div className="trust-col">
            <h3>
              <span className="trust-icon off"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8" /></svg></span>
              {t('home.uncheckedTitle')}
            </h3>
            <p className="muted">{t('home.uncheckedText')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
