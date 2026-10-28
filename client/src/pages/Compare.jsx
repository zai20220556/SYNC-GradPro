import { catLabel } from '../categories.js';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';

export default function Compare() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
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
    ['city', (l) => l.city],
    ['reach', (l) => l.expectedReach.toLocaleString()],
    ['audience', (l) => l.targetAudience || '-'],
    ['lowest', (l) => Math.min(...l.packages.map((p) => p.price)) + ' JOD'],
    ['packages', (l) => l.packages.length],
    ['verified', (l) => (l.seeker.user?.isVerified ? t('cmp.row.yes') : t('cmp.row.no'))],
  ];

  return (
    <div className="page">
      <h2>{t('cmp.title')}</h2>
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
