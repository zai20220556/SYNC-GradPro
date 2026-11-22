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
    return <div className="page"><h2>{t('cmp.title')}</h2><p>{t('cmp.need')}</p><Link className="btn" to="/browse">{t('nav.browse')}</Link></div>;
  }

  const rows = [
    ['category', (l) => catLabel(t, l.category)],
    ['city', (l) => cityLabel(t, l.city)],
    ['reach', (l) => formatNumber(l.expectedReach, i18n.language)],
    ['audience', (l) => l.targetAudience || '-'],
    ['lowest', (l) => t('browse.jod', { amount: formatNumber(Math.min(...l.packages.map((p) => p.price)), i18n.language) })],
    ['packages', (l) => l.packages.length],
    ['verified', (l) => (l.seeker.user?.isVerified ? t('cmp.row.yes') : t('cmp.row.no'))],
  ];

  return (
    <div className="page">
      <Link className="muted" to={'/browse' + (location.state?.from || '')}>{t('detail.back')}</Link>
      <h2 style={{ marginTop: 8 }}>{t('cmp.title')}</h2>
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr><th />{items.map((l) => <th key={l.id}><Link className="plain" to={'/listings/' + l.id}>{l.title}</Link></th>)}</tr>
          </thead>
          <tbody>
            {rows.map(([key, fn]) => (
              <tr key={key}><th>{t('cmp.row.' + key)}</th>{items.map((l) => <td key={l.id}>{fn(l)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
