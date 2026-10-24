import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const SEEKER_FIELDS = [['name', 'text'], ['seekerType', 'text'], ['city', 'text'], ['phone', 'text'], ['audienceSize', 'number'], ['description', 'area']];
const SPONSOR_FIELDS = [['businessName', 'text'], ['industry', 'text'], ['city', 'text'], ['phone', 'text'], ['budgetMin', 'number'], ['budgetMax', 'number'], ['preferredAudience', 'text'], ['description', 'area']];

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [mine, setMine] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const fields = user.role === 'SEEKER' ? SEEKER_FIELDS : SPONSOR_FIELDS;

  useEffect(() => {
    api('/profile').then((d) => setForm(d.profile || {}));
    if (user.role === 'SEEKER') api('/listings/mine').then((d) => setMine(d.listings));
  }, [user.role]);

  async function save(e) {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const body = {};
      fields.forEach(([k]) => { body[k] = form[k] ?? ''; });
      await api('/profile', { method: 'PUT', body });
      setMsg(t('profile.saved'));
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    await api('/listings/' + id, { method: 'DELETE' });
    setMine(mine.filter((l) => l.id !== id));
  }

  if (!form) return <div className="page" />;
  return (
    <div className="page narrow">
      <h2>{t('profile.title')}</h2>
      <form className="panel" onSubmit={save}>
        {fields.map(([k, type]) => (
          <div className="fld" key={k}>
            <label htmlFor={k}>{t('profile.' + k)}</label>
            {type === 'area'
              ? <textarea id={k} rows="3" value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              : <input id={k} type={type} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
          </div>
        ))}
        {error && <p className="error">{error}</p>}
        {msg && <p className="muted">{msg}</p>}
        <button className="btn" type="submit">{t('profile.save')}</button>
      </form>

      {user.role === 'SEEKER' && (
        <>
          <h3 style={{ marginTop: 28 }}>{t('profile.myListings')}</h3>
          {mine.length === 0 && <p className="muted">{t('profile.noListings')} <Link to="/post">{t('nav.post')}</Link></p>}
          {mine.map((l) => (
            <div className="panel row" key={l.id}>
              <Link to={'/listings/' + l.id}>{l.title}</Link>
              <button className="link" onClick={() => remove(l.id)}>{t('profile.delete')}</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
