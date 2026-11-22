import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import MessagePanel from '../components/MessagePanel.jsx';
import { formatNumber } from '../format.js';

export default function Requests() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [value, setValue] = useState({});
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/requests').then((d) => setRequests(d.requests)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function answer(id, status) {
    setError('');
    try { await api('/requests/' + id, { method: 'PATCH', body: { status } }); load(); } catch (e) { setError(e.message); }
  }
  async function record(r) {
    setError('');
    try {
      const agreedValue = value[r.id] !== undefined && value[r.id] !== '' ? Number(value[r.id]) : undefined;
      await api('/bookings', { method: 'POST', body: { requestId: r.id, agreedValue } });
      load();
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="page">
      <h1 className="page-title">{t('req.title')}</h1>
      {error && <p className="error" role="alert">{error}</p>}
      {requests.length === 0 && (
        <div className="panel state">
          <p className="muted">{t('req.empty')}</p>
          <Link className="btn" to="/browse">{t('nav.browse')}</Link>
        </div>
      )}
      {requests.map((r) => (
        <article className="panel request" key={r.id}>
          <div className="request-head">
            <h2><Link className="plain" to={'/listings/' + r.listing.id}>{r.listing.title}</Link></h2>
            <span className="st" data-status={r.status}>{t('status.' + r.status)}</span>
          </div>
          <p className="request-meta">
            <span>{user.role === 'SEEKER' ? r.sponsor.businessName : r.listing.seeker.name}</span>
            <span aria-hidden="true">·</span>
            <span>{r.package.name}</span>
            <span aria-hidden="true">·</span>
            <b>{t('browse.jod', { amount: formatNumber(r.package.price, i18n.language) })}</b>
          </p>
          <p className="request-msg">{r.message}</p>
          <div className="request-actions">
            {user.role === 'SEEKER' && r.status === 'PENDING' && (
              <>
                <button className="btn" onClick={() => answer(r.id, 'ACCEPTED')}>{t('req.accept')}</button>
                <button className="btn alt" onClick={() => answer(r.id, 'DECLINED')}>{t('req.decline')}</button>
              </>
            )}
            {r.status === 'ACCEPTED' && !r.booking && (
              <>
                <label htmlFor={'v' + r.id}>{t('req.agreed')}</label>
                <input id={'v' + r.id} type="number" min="0" placeholder={String(r.package.price)}
                  value={value[r.id] ?? ''} onChange={(e) => setValue({ ...value, [r.id]: e.target.value })} />
                <button className="btn" onClick={() => record(r)}>{t('req.record')}</button>
              </>
            )}
            {r.booking && <Link className="btn alt" to="/tracker">{t('req.inTracker')}</Link>}
            <button className="link spacer" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>{open === r.id ? t('msg.hide') : t('msg.show')}</button>
          </div>
          {open === r.id && <MessagePanel requestId={r.id} />}
        </article>
      ))}
    </div>
  );
}
