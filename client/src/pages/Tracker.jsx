import { formatDate, formatNumber } from '../format.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const NEXT = { CONFIRMED: 'ACTIVE', ACTIVE: 'COMPLETED' };

function Bar({ label, value, max, text }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="meter">
      <div className="meter-head"><span>{label}</span><b>{text}</b></div>
      <div className="bar"><i style={{ width: pct + '%' }} /></div>
    </div>
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
  const num = (n) => formatNumber(n, i18n.language);

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
      <h1 className="page-title">{t('tracker.title')}</h1>
      {error && <p className="error" role="alert">{error}</p>}

      {summary && (
        <div className="stats">
          <div className="stat"><span>{t('dash.deals')}</span><b className="big">{num(summary.deals)}</b></div>
          <div className="stat"><span>{t('dash.value')}</span><b className="big">{num(summary.totalValue)}</b></div>
          <div className="stat"><span>{t('dash.reach')}</span><b className="big">{num(summary.totalReach)}</b></div>
          <div className="stat"><span>{t('dash.engagement')}</span><b className="big">{summary.avgEngagement}</b></div>
          <div className="stat"><span>{t('dash.sales')}</span><b className="big">{num(summary.totalSales)}</b></div>
        </div>
      )}

      {bookings.length === 0 ? <div className="panel state"><p className="muted">{t('tracker.empty')}</p></div> : (
        <div className="panel table-wrap">
          <table className="stack-table">
            <thead>
              <tr><th>{t('tracker.deal')}</th><th>{t('tracker.with')}</th><th>{t('tracker.package')}</th><th>{t('tracker.value')}</th><th>{t('tracker.status')}</th><th /></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="deal-name"><b>{b.request.listing.title}</b></td>
                  <td data-label={t('tracker.with')}>{user.role === 'SEEKER' ? b.request.sponsor.businessName : b.request.listing.seeker.name}</td>
                  <td data-label={t('tracker.package')}>{b.request.package.name}</td>
                  <td className="num" data-label={t('tracker.value')}>{t('browse.jod', { amount: num(b.agreedValue) })}</td>
                  <td data-label={t('tracker.status')}><span className="st" data-status={b.status}>{t('status.' + b.status)}</span></td>
                  <td className="deal-actions">
                    <div className="cell-actions">
                      <button className="btn alt sm" onClick={() => setSel(b.id)} aria-pressed={sel === b.id}>{t('dash.select')}</button>
                      {NEXT[b.status] && <button className="btn alt sm" onClick={() => advance(b)}>{t('tracker.markAs', { status: t('status.' + NEXT[b.status]) })}</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <section className="panel">
          <h2>{t('dash.resultsFor')}: {selected.request.listing.title}</h2>
          <p className="muted">{t('dash.note')}</p>
          <div className="results-grid">
            <div>
              {latest ? (
                <>
                  <Bar label={t('dash.reachLabel')} value={latest.reach} max={Math.max(expected, latest.reach)} text={`${num(latest.reach)} / ${num(expected)}`} />
                  <Bar label={t('dash.engLabel')} value={latest.engagement} max={10} text={latest.engagement + '%'} />
                  <Bar label={t('dash.salesLabel')} value={latest.reportedSales} max={Math.max(60, latest.reportedSales)} text={num(latest.reportedSales)} />
                </>
              ) : <p className="muted">{t('dash.none')}</p>}
              {reports.length > 0 && (
                <>
                  <h3 className="history-title">{t('dash.history')}</h3>
                  <ul className="history">
                    {reports.map((r) => (
                      <li key={r.id}>
                        {formatDate(r.createdAt, i18n.language)} · {r.mine ? t('dash.you') : t('dash.other')}: {num(r.reach)} / {r.engagement}% / {num(r.reportedSales)}{r.notes ? ` · ${r.notes}` : ''}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <form onSubmit={saveReport}>
              <div className="fld"><label htmlFor="r1">{t('dash.reachLabel')}</label><input id="r1" type="number" min="0" value={f.reach} onChange={set('reach')} required /></div>
              <div className="fgrid">
                <div className="fld"><label htmlFor="r2">{t('dash.engLabel')}</label><input id="r2" type="number" min="0" max="100" step="0.1" value={f.engagement} onChange={set('engagement')} required /></div>
                <div className="fld"><label htmlFor="r3">{t('dash.salesLabel')}</label><input id="r3" type="number" min="0" value={f.reportedSales} onChange={set('reportedSales')} required /></div>
              </div>
              <div className="fld"><label htmlFor="r4">{t('dash.notes')}</label><input id="r4" value={f.notes} onChange={set('notes')} maxLength={500} /></div>
              <button className="btn" type="submit">{t('dash.submit')}</button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
