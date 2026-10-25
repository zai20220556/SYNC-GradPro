import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import MessagePanel from '../components/MessagePanel.jsx';

export default function Requests() {
  const { t } = useTranslation();
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
      <h2>{t('req.title')}</h2>
      {error && <p className="error">{error}</p>}
      {requests.length === 0 && <p className="muted">{t('req.empty')} <Link to="/browse">{t('nav.browse')}</Link></p>}
      {requests.map((r) => (
        <div className="panel" key={r.id}>
          <div className="row">
            <h3 style={{ margin: 0 }}><Link className="plain" to={'/listings/' + r.listing.id}>{r.listing.title}</Link></h3>
            <span className="st">{t('status.' + r.status)}</span>
          </div>
          <p className="muted">
            {user.role === 'SEEKER' ? r.sponsor.businessName : r.listing.seeker.name} · {r.package.name} · {r.package.price} JOD
          </p>
          <p>{r.message}</p>
          {user.role === 'SEEKER' && r.status === 'PENDING' && (
            <div className="row" style={{ justifyContent: 'flex-start' }}>
              <button className="btn" onClick={() => answer(r.id, 'ACCEPTED')}>{t('req.accept')}</button>
              <button className="btn alt" onClick={() => answer(r.id, 'DECLINED')}>{t('req.decline')}</button>
            </div>
          )}
          {r.status === 'ACCEPTED' && !r.booking && (
            <div className="row" style={{ justifyContent: 'flex-start' }}>
              <label htmlFor={'v' + r.id}>{t('req.agreed')}</label>
              <input id={'v' + r.id} type="number" min="0" style={{ width: 120 }} placeholder={String(r.package.price)}
                value={value[r.id] ?? ''} onChange={(e) => setValue({ ...value, [r.id]: e.target.value })} />
              <button className="btn" onClick={() => record(r)}>{t('req.record')}</button>
            </div>
          )}
          {r.booking && <p><Link to="/tracker">{t('req.inTracker')}</Link></p>}
          <button className="link" onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? t('msg.hide') : t('msg.show')}</button>
          {open === r.id && <MessagePanel requestId={r.id} />}
        </div>
      ))}
    </div>
  );
}
