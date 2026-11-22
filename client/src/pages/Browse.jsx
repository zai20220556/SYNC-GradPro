import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ListingCard from '../components/ListingCard.jsx';
import { CATEGORIES, catLabel, cityLabel } from '../categories.js';
import { formatNumber } from '../format.js';

const CITIES = ['Amman', 'Irbid', 'Zarqa'];
const BUDGETS = [200, 500, 1000, 2000];
const lowestPrice = (l) => Math.min(...l.packages.map((p) => p.price));
const dateValue = (l) => (l.eventDate ? new Date(l.eventDate).getTime() : Infinity);
const SORTERS = {
  price: (a, b) => lowestPrice(a) - lowestPrice(b),
  reach: (a, b) => b.expectedReach - a.expectedReach,
  date: (a, b) => dateValue(a) - dateValue(b),
};
const SEARCH_DELAY_MS = 250;
const SKELETON_CARDS = [1, 2, 3, 4, 5, 6];
const MAX_COMPARE = 3;

function parsePicked(value) {
  const ids = (value || '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(ids)].slice(0, MAX_COMPARE);
}

export default function Browse() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  // Filters and compare picks live in the URL, so Back and shared links keep them.
  const searchTerm = params.get('q') || '';
  const category = params.get('category') || '';
  const city = params.get('city') || '';
  const budget = BUDGETS.includes(Number(params.get('budget'))) ? params.get('budget') : '';
  const sort = SORTERS[params.get('sort')] ? params.get('sort') : '';
  const pickedParam = params.get('picked') || '';
  const selected = parsePicked(pickedParam);

  const [q, setQ] = useState(searchTerm);
  const lastWrittenQ = useRef(searchTerm);
  const [listings, setListings] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [titles, setTitles] = useState({});
  const [scores, setScores] = useState({});
  const [reasons, setReasons] = useState({});
  const [matchInfo, setMatchInfo] = useState(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  const updateParams = (changes) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    Object.entries(changes).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    return next;
  }, { replace: true });

  // Wait for a pause in typing so each keystroke does not start a request.
  useEffect(() => {
    const value = q.trim();
    if (value === searchTerm) return undefined;
    const timer = setTimeout(() => { lastWrittenQ.current = value; updateParams({ q: value }); }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [q, searchTerm]);

  // Keep the search box in step when the URL changes through Back or Forward.
  useEffect(() => {
    if (searchTerm !== lastWrittenQ.current) { lastWrittenQ.current = searchTerm; setQ(searchTerm); }
  }, [searchTerm]);

  // Cancelling the previous request stops a slow reply from replacing newer results.
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams();
    if (searchTerm) query.set('q', searchTerm);
    if (category) query.set('category', category);
    if (city) query.set('city', city);
    if (budget) query.set('maxPrice', budget);
    setStatus('loading');
    api('/listings?' + query.toString(), { signal: controller.signal })
      .then((d) => {
        setListings(d.listings);
        setTitles((prev) => ({ ...prev, ...Object.fromEntries(d.listings.map((l) => [l.id, l.title])) }));
        setStatus('ready');
      })
      .catch((e) => { if (e.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, [searchTerm, category, city, budget, attempt]);

  // The full catalog gives each filter option its count, so dead ends can be hidden.
  useEffect(() => {
    const controller = new AbortController();
    api('/listings', { signal: controller.signal }).then((d) => setCatalog(d.listings)).catch(() => {});
    return () => controller.abort();
  }, [attempt]);

  // A pick can be hidden by the current filters, so fetch its name for the tray.
  useEffect(() => {
    if (status !== 'ready') return undefined;
    const missing = selected.filter((id) => !titles[id]);
    if (missing.length === 0) return undefined;
    const controller = new AbortController();
    Promise.all(missing.map((id) => api('/listings/' + id, { signal: controller.signal })
      .then((d) => [id, d.listing.title])
      .catch((e) => (e.name === 'AbortError' ? null : [id, null]))))
      .then((results) => {
        if (controller.signal.aborted) return;
        const found = results.filter((r) => r && r[1]);
        const gone = results.filter((r) => r && !r[1]).map((r) => r[0]);
        if (found.length) setTitles((prev) => ({ ...prev, ...Object.fromEntries(found) }));
        if (gone.length) updateParams({ picked: selected.filter((id) => !gone.includes(id)).join(',') });
      });
    return () => controller.abort();
  }, [status, pickedParam, titles]);

  useEffect(() => {
    if (user?.role !== 'SPONSOR') { setScores({}); setReasons({}); setMatchInfo(null); return; }
    api('/matches').then((d) => {
      setScores(Object.fromEntries(d.matches.map((m) => [m.listingId, m.score])));
      setReasons(Object.fromEntries(d.matches.map((m) => [m.listingId, m.reasons])));
      setMatchInfo({ ready: d.ready, missing: d.missing });
    }).catch(() => {});
  }, [user]);

  const setPicked = (ids) => updateParams({ picked: ids.join(',') });
  const toggle = (id) => {
    if (selected.includes(id)) setPicked(selected.filter((x) => x !== id));
    else if (selected.length < MAX_COMPARE) setPicked([...selected, id]);
  };
  const isFull = selected.length >= MAX_COMPARE;
  const hasFilters = Boolean(q.trim() || category || city || budget);
  const clearFilters = () => { lastWrittenQ.current = ''; setQ(''); updateParams({ q: '', category: '', city: '', budget: '' }); };
  const shown = [...listings].sort(SORTERS[sort] || ((a, b) => (scores[b.id] ?? -1) - (scores[a.id] ?? -1)));
  const countBy = (key, value) => catalog.filter((l) => l[key] === value).length;
  const showOption = (key, value, current) => catalog.length === 0 || value === current || countBy(key, value) > 0;
  const optionLabel = (label, key, value) => (catalog.length ? `${label} (${countBy(key, value)})` : label);
  const compare = () => navigate('/compare?ids=' + selected.join(','), { state: { from: location.search } });

  return (
    <div className="page">
      <h1 className="page-title">{t('browse.title')}</h1>
      <div className="filters">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('browse.search')} aria-label={t('browse.search')} />
        <select value={category} onChange={(e) => updateParams({ category: e.target.value })} aria-label={t('browse.category')}>
          <option value="">{t('browse.all')}</option>
          {CATEGORIES.filter((c) => showOption('category', c, category)).map((c) => <option key={c} value={c}>{optionLabel(catLabel(t, c), 'category', c)}</option>)}
        </select>
        <select value={city} onChange={(e) => updateParams({ city: e.target.value })} aria-label={t('browse.city')}>
          <option value="">{t('browse.allCities')}</option>
          {CITIES.filter((c) => showOption('city', c, city)).map((c) => <option key={c} value={c}>{optionLabel(cityLabel(t, c), 'city', c)}</option>)}
        </select>
        <select value={budget} onChange={(e) => updateParams({ budget: e.target.value })} aria-label={t('browse.budget')}>
          <option value="">{t('browse.anyBudget')}</option>
          {BUDGETS.map((b) => <option key={b} value={b}>{t('browse.upTo', { amount: formatNumber(b, i18n.language) })}</option>)}
        </select>
        <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })} aria-label={t('browse.sort')}>
          <option value="">{t('browse.sortRecommended')}</option>
          <option value="price">{t('browse.sortPrice')}</option>
          <option value="reach">{t('browse.sortReach')}</option>
          <option value="date">{t('browse.sortDate')}</option>
        </select>
      </div>
      {matchInfo?.ready && <p className="muted">{t('cmp.sorted')}</p>}
      {matchInfo && !matchInfo.ready && (
        <div className="match-prompt">
          <div>
            <b>{t('match.promptTitle')}</b>
            <p>{t('match.promptText', { missing: new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(matchInfo.missing.map((m) => t('match.missing.' + m))) })}</p>
          </div>
          <Link className="btn" to="/profile">{t('match.promptCta')}</Link>
        </div>
      )}
      <div className="result-bar">
        <p className="muted" role="status">
          {status === 'loading' ? t('browse.loading') : status === 'ready' ? t('browse.results', { count: listings.length }) : ''}
        </p>
        {hasFilters && <button type="button" className="link" onClick={clearFilters}>{t('browse.clear')}</button>}
      </div>
      <details className="label-help">
        <summary>{t('browse.helpTitle')}</summary>
        <ul>
          <li>{t('browse.helpVerified')}</li>
          <li>{t('browse.helpReach')}</li>
          <li>{t('browse.helpMatch')}</li>
          <li>{t('browse.helpPayment')}</li>
        </ul>
      </details>
      {status === 'error' && (
        <div className="panel state" role="alert">
          <p>{t('browse.loadError')}</p>
          <button type="button" className="btn" onClick={() => setAttempt((n) => n + 1)}>{t('browse.retry')}</button>
        </div>
      )}
      {status === 'loading' && listings.length === 0 && (
        <div className="grid" aria-hidden="true">
          {SKELETON_CARDS.map((n) => <div className="card skeleton" key={n}><i /><i /><i /></div>)}
        </div>
      )}
      {status !== 'error' && listings.length > 0 && (
        <div className={'grid' + (status === 'loading' ? ' is-stale' : '')} aria-busy={status === 'loading'}>
          {shown.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              match={scores[l.id]}
              reasons={reasons[l.id]}
              selected={selected.includes(l.id)}
              compareDisabled={isFull && !selected.includes(l.id)}
              onToggle={toggle}
            />
          ))}
        </div>
      )}
      {status === 'ready' && listings.length === 0 && (
        <div className="panel state">
          <p>{t('browse.empty')}</p>
          {hasFilters && <button type="button" className="btn" onClick={clearFilters}>{t('browse.clear')}</button>}
        </div>
      )}
      {selected.length > 0 && (
        <aside className="compare-tray" aria-label={t('cmp.tray')}>
          <div className="tray-main">
            <p className="tray-count" role="status">
              <b>{t('cmp.count', { count: selected.length, max: MAX_COMPARE })}</b>
              <span className="muted">{selected.length < 2 ? t('cmp.more') : isFull ? t('cmp.full') : ''}</span>
            </p>
            <ul className="tray-list">
              {selected.map((id) => {
                const title = titles[id] || '…';
                return (
                  <li key={id}>
                    <span>{title}</span>
                    <button type="button" onClick={() => toggle(id)} aria-label={t('cmp.remove', { title })}>
                      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="tray-actions">
            <button type="button" className="link" onClick={() => setPicked([])}>{t('cmp.clear')}</button>
            <button type="button" className="btn" disabled={selected.length < 2} onClick={compare}>{t('cmp.go')}</button>
          </div>
        </aside>
      )}
    </div>
  );
}
