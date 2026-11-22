import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';

export default function Admin() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [verifs, setVerifs] = useState([]);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState([]);
  const [supportReady, setSupportReady] = useState(true);
  const [replies, setReplies] = useState({});

  const loadSupport = () => api('/admin/support')
    .then((d) => { setTickets(d.tickets); setSupportReady(true); })
    .catch(() => setSupportReady(false));

  async function updateTicket(ticket, body) {
    setError('');
    try { await api('/admin/support/' + ticket.id, { method: 'PATCH', body }); loadSupport(); } catch (e) { setError(e.message); }
  }

  const load = () => {
    loadSupport();
    api('/admin/users').then((d) => setUsers(d.users)).catch((e) => setError(e.message));
    api('/admin/verifications').then((d) => setVerifs(d.verifications)).catch((e) => setError(e.message));
    api('/admin/listings').then((d) => setListings(d.listings)).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); }, []);

  async function toggle(u) { await api('/admin/users/' + u.id, { method: 'PATCH', body: { isVerified: !u.isVerified } }); load(); }
  async function review(v, status) { await api('/admin/verifications/' + v.id, { method: 'PATCH', body: { status } }); load(); }
  async function remove(l) {
    setError('');
    try { await api('/admin/listings/' + l.id, { method: 'DELETE' }); load(); } catch (e) { setError(e.message); }
  }

  return (
    <div className="page">
      <h1 className="page-title">{t('admin.title')}</h1>
      {error && <p className="error" role="alert">{error}</p>}
      <h2 className="section-title">{t('adminv.title')}</h2>
      <div className="panel">
        {verifs.length === 0 && <p className="muted">{t('adminv.none')}</p>}
        {verifs.map((v) => (
          <div className="verif-row" key={v.id}>
            <span>{v.email} <span className="muted">({v.role})</span></span>
            <span className="verif-actions">
              {v.documentUrl ? <a className="text-link" href={v.documentUrl} target="_blank" rel="noreferrer">{t('adminv.open')}</a> : <span className="muted">{t('adminv.noDoc')}</span>}
              <button className="btn sm" onClick={() => review(v, 'APPROVED')}>{t('adminv.approve')}</button>
              <button className="btn alt sm" onClick={() => review(v, 'REJECTED')}>{t('adminv.reject')}</button>
            </span>
          </div>
        ))}
      </div>
      <h2 className="section-title">{t('help.adminTitle')}</h2>
      <div className="panel">
        {!supportReady && <p className="muted">{t('help.adminUnavailable')}</p>}
        {supportReady && tickets.length === 0 && <p className="muted">{t('help.adminEmpty')}</p>}
        {tickets.map((ticket) => {
          const reply = replies[ticket.id] ?? ticket.adminReply ?? '';
          return (
            <article className="support-ticket" key={ticket.id}>
              <div className="ticket-head">
                <b>{ticket.subject}</b>
                <span className="st" data-status={ticket.status}>{t('help.status.' + ticket.status)}</span>
              </div>
              <p className="request-meta">
                <span>{t('help.types.' + ticket.type)}</span><span aria-hidden="true">·</span>
                <span>{ticket.name}</span><span aria-hidden="true">·</span>
                <span>{ticket.email}</span>
                {!ticket.userId && <><span aria-hidden="true">·</span><span>{t('help.guest')}</span></>}
              </p>
              <p className="request-msg">{ticket.message}</p>
              <div className="fld">
                <label htmlFor={'reply' + ticket.id}>{t('help.adminReply')}</label>
                <textarea id={'reply' + ticket.id} rows="2" maxLength={2000} value={reply} onChange={(e) => setReplies({ ...replies, [ticket.id]: e.target.value })} />
              </div>
              <div className="verif-actions">
                <button className="btn sm" disabled={!reply.trim() || reply.trim() === (ticket.adminReply || '')} onClick={() => updateTicket(ticket, { adminReply: reply })}>{t('help.adminSave')}</button>
                <button className="btn alt sm" onClick={() => updateTicket(ticket, { status: ticket.status === 'OPEN' ? 'RESOLVED' : 'OPEN' })}>{t(ticket.status === 'OPEN' ? 'help.adminResolve' : 'help.adminReopen')}</button>
                {!ticket.userId && <a className="text-link" href={'mailto:' + ticket.email + '?subject=' + encodeURIComponent('SYNC: ' + ticket.subject)}>{t('help.adminEmail')}</a>}
              </div>
            </article>
          );
        })}
      </div>
      <h2 className="section-title">{t('admin.users')}</h2>
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>{t('auth.email')}</th><th>{t('auth.role')}</th><th>{t('browse.verified')}</th><th /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td><td>{u.role}</td>
                <td>{u.isVerified && <span className="mark" role="img" aria-label={t('browse.verified')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg></span>}</td>
                <td><div className="cell-actions">{u.role !== 'ADMIN' && <button className="btn alt sm" onClick={() => toggle(u)}>{u.isVerified ? t('admin.unverify') : t('admin.verify')}</button>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="section-title">{t('admin.listings')}</h2>
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>{t('post.name')}</th><th>{t('admin.by')}</th><th /></tr></thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id}><td><b>{l.title}</b></td><td>{l.seeker.name}</td><td><div className="cell-actions"><button className="link danger" onClick={() => remove(l)}>{t('profile.delete')}</button></div></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
