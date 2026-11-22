import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, upload, uploadImage } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { cityLabel } from '../categories.js';

const INDUSTRIES = ['Restaurant or cafe', 'Gym or fitness', 'Bank or financial institution', 'Telecommunications', 'Clothing, beauty, or retail', 'Other'];
const CITIES = ['Amman', 'Irbid', 'Zarqa'];
const SEEKER_FIELDS = [['name', 'text'], ['seekerType', 'text'], ['city', 'city'], ['phone', 'text'], ['website', 'text'], ['audienceSize', 'number'], ['description', 'area']];
const SPONSOR_FIELDS = [['businessName', 'text'], ['industry', 'industry'], ['city', 'city'], ['phone', 'text'], ['budgetMin', 'number'], ['budgetMax', 'number'], ['preferredAudience', 'text'], ['description', 'area']];

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [mine, setMine] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [ver, setVer] = useState(null);
  const [busy, setBusy] = useState(false);
  const fields = user.role === 'SEEKER' ? SEEKER_FIELDS : SPONSOR_FIELDS;

  useEffect(() => {
    api('/profile').then((d) => setForm(d.profile || {}));
    if (user.role === 'SEEKER') api('/listings/mine').then((d) => setMine(d.listings));
    api('/verification/mine').then(setVer).catch(() => {});
  }, [user.role]);

  async function save(e) {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const body = {};
      fields.forEach(([k]) => { body[k] = form[k] ?? ''; });
      if (form.logoUrl) body.logoUrl = form.logoUrl;
      await api('/profile', { method: 'PUT', body });
      setMsg(t('profile.saved'));
    } catch (err) { setError(err.message); }
  }

  async function pickLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true); setError('');
    try { const url = await uploadImage(file); setForm({ ...form, logoUrl: url }); setMsg(t('up.logoReady')); } catch (err) { setError(err.message); }
    setBusy(false);
  }

  async function sendDocument(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      fd.append('document', file);
      await upload('/verification', fd);
      setMsg(t('ver.sent'));
      setVer(await api('/verification/mine'));
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  async function remove(id) {
    try {
      await api('/listings/' + id, { method: 'DELETE' });
      setMine(mine.filter((l) => l.id !== id));
    } catch (e) { setError(e.message); }
  }

  if (!form) return <div className="page"><div className="card skeleton" aria-hidden="true"><i /><i /><i /></div></div>;
  return (
    <div className="page">
      <h1 className="page-title">{t('profile.title')}</h1>
      <div className="profile-layout">
        <form className="panel" onSubmit={save}>
          <div className="fld">
            <label htmlFor="logo">{t('up.logo')}</label>
            {form.logoUrl && <img className="avatar big-avatar" src={form.logoUrl} alt="" />}
            <input id="logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickLogo} />
            <small className="muted">{busy ? t('up.uploading') : t('up.hint')}</small>
          </div>
          <div className="fgrid">
            {fields.filter(([, type]) => type !== 'area').map(([k, type]) => (
              <div className="fld" key={k}>
                <label htmlFor={k}>{t('profile.' + k)}</label>
                {type === 'industry' ? (
                  <select id={k} value={form[k] || 'Other'} onChange={(e) => setForm({ ...form, [k]: e.target.value })}>
                    {INDUSTRIES.map((value) => <option key={value} value={value}>{t('match.industries.' + value)}</option>)}
                  </select>
                ) : type === 'city' ? (
                  <select id={k} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })}>
                    <option value="">{t('match.chooseCity')}</option>
                    {CITIES.map((value) => <option key={value} value={value}>{cityLabel(t, value)}</option>)}
                  </select>
                ) : (
                  <input id={k} type={type} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          {fields.filter(([, type]) => type === 'area').map(([k]) => (
            <div className="fld" key={k}>
              <label htmlFor={k}>{t('profile.' + k)}</label>
              <textarea id={k} rows="4" value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          {error && <p className="error" role="alert">{error}</p>}
          {msg && <p className="notice" role="status">{msg}</p>}
          <button className="btn" type="submit">{t('profile.save')}</button>
        </form>

        <div className="profile-side">
          {ver && (
            <section className="panel">
              <h2>{t('ver.title')}</h2>
              {ver.isVerified ? (
                <p className="verified">
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
                  {t('ver.verified')}
                </p>
              ) : ver.latest?.status === 'PENDING' ? <span className="st" data-status="PENDING">{t('ver.pending')}</span> : (
                <>
                  <p className="muted">{ver.latest?.status === 'REJECTED' ? t('ver.rejected') : t('ver.none')}</p>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={sendDocument} aria-label={t('ver.choose')} />
                </>
              )}
            </section>
          )}

          {user.role === 'SEEKER' && (
            <section className="panel">
              <h2>{t('profile.myListings')}</h2>
              {mine.length === 0 ? (
                <>
                  <p className="muted">{t('profile.noListings')}</p>
                  <Link className="btn alt" to="/post">{t('nav.post')}</Link>
                </>
              ) : (
                <ul className="mine-list">
                  {mine.map((l) => (
                    <li key={l.id}>
                      <Link className="text-link" to={'/listings/' + l.id}>{l.title}</Link>
                      <button className="link danger" onClick={() => remove(l.id)}>{t('profile.delete')}</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
