import { formatDate } from '../format.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const NEXT = { CONFIRMED: 'ACTIVE', ACTIVE: 'COMPLETED' };

function Bar({ label, value, max, text }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <>
      <div>{label}: <b>{text}</b></div>
      <div className="bar"><i style={{ width: pct + '%' }} /></div>
    </>
  );
}

export default function Tracker() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [sel, setSel] = useState(null);
  const [reports, setReports] = useState([]);
  const [expected, setExpected] = useState(0);
  const [f, setF] = useState({ reach: '', engagement: '', reportedSales: '', notes: '' });
  const [error, setError] = useState('');

  const loadAll = () => {
    api('/bookings').then((d) => setBookings(d.bookings)).catch((e) => setError(e.message));
    api('/bookings/summary').then((d) => setSummary(d.summary)).catch(() => {});
  };
  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (!sel) return;
    api(`/bookings/${sel}/reports`).then((d) => { setReports(d.reports); setExpected(d.expectedReach || 0); }).catch((e) => setError(e.message));
  }, [sel]);

  async function advance(b) {
    try { await api('/bookings/' + b.id, { method: 'PATCH', body: { status: NEXT[b.status] } }); loadAll(); } catch (e) { setError(e.message); }
  }
  async function saveReport(e) {
    e.preventDefault();
    setError('');
    try {
      await api(`/bookings/${sel}/reports`, {
        method: 'POST',
        body: { reach: Number(f.reach) || 0, engagement: Number(f.engagement) || 0, reportedSales: Number(f.reportedSales) || 0, notes: f.notes || undefined },
      });
      setF({ reach: '', engagement: '', reportedSales: '', notes: '' });
      const d = await api(`/bookings/${sel}/reports`);
      setReports(d.reports);
      loadAll();
    } catch (err) { setError(err.message); }
  }

  const latest = reports[0];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const selected = bookings.find((b) => b.id === sel);

  return (
    <div className="page">
      <h2>{t('tracker.title')}</h2>
      {error && <p className="error">{error}</p>}

      {summary && (
        <div className="stats">
          <div className="panel"><div className="muted">{t('dash.deals')}</div><b className="big">{summary.deals}</b></div>
          <div className="panel"><div className="muted">{t('dash.value')}</div><b className="big">{summary.totalValue.toLocaleString()}</b></div>
          <div className="panel"><div className="muted">{t('dash.reach')}</div><b className="big">{summary.totalReach.toLocaleString()}</b></div>
          <div className="panel"><div className="muted">{t('dash.engagement')}</div><b className="big">{summary.avgEngagement}</b></div>
          <div className="panel"><div className="muted">{t('dash.sales')}</div><b className="big">{summary.totalSales.toLocaleString()}</b></div>
        </div>
      )}

      {bookings.length === 0 ? <p className="muted">{t('tracker.empty')}</p> : (
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr><th>{t('tracker.deal')}</th><th>{t('tracker.with')}</th><th>{t('tracker.package')}</th><th>{t('tracker.value')}</th><th>{t('tracker.status')}</th><th /></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.request.listing.title}</td>
                  <td>{user.role === 'SEEKER' ? b.request.sponsor.businessName : b.request.listing.seeker.name}</td>
                  <td>{b.request.package.name}</td>
                  <td>{b.agreedValue} JOD</td>
                  <td className="st">{t('status.' + b.status)}</td>
                  <td>
                    <button className="btn alt" onClick={() => setSel(b.id)}>{t('dash.select')}</button>{' '}
                    {NEXT[b.status] && <button className="btn alt" onClick={() => advance(b)}>{t('tracker.markAs', { status: t('status.' + NEXT[b.status]) })}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="panel">
          <h3>{t('dash.resultsFor')}: {selected.request.listing.title}</h3>
          <p className="muted">{t('dash.note')}</p>
          {latest ? (
            <>
              <Bar label={t('dash.reachLabel')} value={latest.reach} max={Math.max(expected, latest.reach)} text={`${latest.reach.toLocaleString()} / ${expected.toLocaleString()}`} />
              <Bar label={t('dash.engLabel')} value={latest.engagement} max={10} text={latest.engagement + '%'} />
              <Bar label={t('dash.salesLabel')} value={latest.reportedSales} max={Math.max(60, latest.reportedSales)} text={String(latest.reportedSales)} />
            </>
          ) : <p>{t('dash.none')}</p>}

          <form onSubmit={saveReport}>
            <div className="fgrid">
              <div className="fld"><label htmlFor="r1">{t('dash.reachLabel')}</label><input id="r1" type="number" min="0" value={f.reach} onChange={set('reach')} required /></div>
              <div className="fld"><label htmlFor="r2">{t('dash.engLabel')}</label><input id="r2" type="number" min="0" max="100" step="0.1" value={f.engagement} onChange={set('engagement')} required /></div>
              <div className="fld"><label htmlFor="r3">{t('dash.salesLabel')}</label><input id="r3" type="number" min="0" value={f.reportedSales} onChange={set('reportedSales')} required /></div>
            </div>
            <div className="fld"><label htmlFor="r4">{t('dash.notes')}</label><input id="r4" value={f.notes} onChange={set('notes')} maxLength={500} /></div>
            <button className="btn" type="submit">{t('dash.submit')}</button>
          </form>

          {reports.length > 0 && (
            <>
              <h3 style={{ marginTop: 20 }}>{t('dash.history')}</h3>
              {reports.map((r) => (
                <p key={r.id} className="muted">
                  {formatDate(r.createdAt, i18n.language)} · {r.mine ? t('dash.you') : t('dash.other')}: {r.reach.toLocaleString()} / {r.engagement}% / {r.reportedSales}{r.notes ? ` · ${r.notes}` : ''}
                </p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
