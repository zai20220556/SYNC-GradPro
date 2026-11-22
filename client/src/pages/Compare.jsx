import { catLabel, cityLabel } from '../categories.js';
import { formatNumber } from '../format.js';
import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';

export default function Compare() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const ids = (params.get('ids') || '').split(',').filter(Boolean).slice(0, 3);

  useEffect(() => {
    Promise.all(ids.map((id) => api('/listings/' + id).then((d) => d.listing).catch(() => null)))
      .then((list) => setItems(list.filter(Boolean)));
  }, [params.get('ids')]);

  if (ids.length < 2) {
    return (
      <div className="page">
        <div className="panel state">
          <h1 className="page-title">{t('cmp.title')}</h1>
          <p className="muted">{t('cmp.need')}</p>
          <Link className="btn" to="/browse">{t('nav.browse')}</Link>
        </div>
      </div>
    );
  }

  const rows = [
    ['lowest', (l) => <b>{t('browse.jod', { amount: formatNumber(Math.min(...l.packages.map((p) => p.price)), i18n.language) })}</b>],
    ['packages', (l) => formatNumber(l.packages.length, i18n.language)],
    ['reach', (l) => formatNumber(l.expectedReach, i18n.language)],
    ['audience', (l) => l.targetAudience || '-'],
    ['category', (l) => catLabel(t, l.category)],
    ['city', (l) => cityLabel(t, l.city)],
    ['verified', (l) => (l.seeker.user?.isVerified ? (
      <span className="verified">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
        {t('cmp.row.yes')}
      </span>
    ) : t('cmp.row.no'))],
  ];

  return (
    <div className="page">
      <Link className="back-link" to={'/browse' + (location.state?.from || '')}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
        {t('detail.back')}
      </Link>
      <h1 className="page-title">{t('cmp.title')}</h1>
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr><th />{items.map((l) => <th key={l.id}><Link className="plain" to={'/listings/' + l.id}>{l.title}</Link></th>)}</tr>
          </thead>
          <tbody>
            {rows.map(([key, fn]) => (
              <tr key={key}><th scope="row">{t('cmp.row.' + key)}</th>{items.map((l) => <td key={l.id}>{fn(l)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
