import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';

export default function Admin() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [verifs, setVerifs] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api('/admin/users').then((d) => setUsers(d.users)).catch((e) => setError(e.message));
    api('/admin/verifications').then((d) => setVerifs(d.verifications)).catch((e) => setError(e.message));
    api('/admin/listings').then((d) => setListings(d.listings)).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); }, []);

  async function toggle(u) { await api('/admin/users/' + u.id, { method: 'PATCH', body: { isVerified: !u.isVerified } }); load(); }
  async function review(v, status) { await api('/admin/verifications/' + v.id, { method: 'PATCH', body: { status } }); load(); }
  async function remove(l) { await api('/admin/listings/' + l.id, { method: 'DELETE' }); load(); }

  return (
    <div className="page">
      <h2>{t('admin.title')}</h2>
      {error && <p className="error">{error}</p>}
      <h3>{t('adminv.title')}</h3>
      <div className="panel">
        {verifs.length === 0 && <p className="muted">{t('adminv.none')}</p>}
        {verifs.map((v) => (
          <div className="row" key={v.id}>
            <span>{v.email} ({v.role})</span>
            <span>
              {v.documentUrl ? <a href={v.documentUrl} target="_blank" rel="noreferrer">{t('adminv.open')}</a> : <span className="muted">{t('adminv.noDoc')}</span>}{' '}
              <button className="btn" onClick={() => review(v, 'APPROVED')}>{t('adminv.approve')}</button>{' '}
              <button className="btn alt" onClick={() => review(v, 'REJECTED')}>{t('adminv.reject')}</button>
            </span>
          </div>
        ))}
      </div>
      <h3 style={{ marginTop: 24 }}>{t('admin.users')}</h3>
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>{t('auth.email')}</th><th>{t('auth.role')}</th><th>{t('browse.verified')}</th><th /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td><td>{u.role}</td><td>{u.isVerified ? '✓' : ''}</td>
                <td>{u.role !== 'ADMIN' && <button className="btn alt" onClick={() => toggle(u)}>{u.isVerified ? t('admin.unverify') : t('admin.verify')}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 style={{ marginTop: 24 }}>{t('admin.listings')}</h3>
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>{t('post.name')}</th><th>{t('admin.by')}</th><th /></tr></thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id}><td>{l.title}</td><td>{l.seeker.name}</td><td><button className="btn alt" onClick={() => remove(l)}>{t('profile.delete')}</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
