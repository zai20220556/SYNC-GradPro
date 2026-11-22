import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get('role') === 'SPONSOR' ? 'SPONSOR' : 'SEEKER';
  const [form, setForm] = useState({ name: '', email: '', password: '', role: initialRole });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    try { await register(form); navigate('/browse'); } catch (err) { setError(err.message); }
  }

  return (
    <div className="page narrow">
      <h2>{t('auth.registerTitle')}</h2>
      <form className="panel" onSubmit={submit}>
        <div className="fld"><label htmlFor="role">{t('auth.role')}</label>
          <select id="role" value={form.role} onChange={set('role')}>
            <option value="SEEKER">{t('auth.seeker')}</option>
            <option value="SPONSOR">{t('auth.sponsor')}</option>
          </select></div>
        <div className="fld"><label htmlFor="name">{t('auth.name')}</label>
          <input id="name" value={form.name} onChange={set('name')} required minLength={2} /></div>
        <div className="fld"><label htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" value={form.email} onChange={set('email')} required /></div>
        <div className="fld"><label htmlFor="pw">{t('auth.password')}</label>
          <input id="pw" type="password" value={form.password} onChange={set('password')} required minLength={8} />
          <small className="muted">{t('auth.passwordHint')}</small></div>
        {error && <p className="error">{error}</p>}
        <button className="btn block" type="submit">{t('auth.submitRegister')}</button>
        <div className="switch">
          <p className="muted">{t('auth.haveAccount')}</p>
          <Link className="btn alt block" to="/login">{t('auth.submitLogin')}</Link>
        </div>
      </form>
    </div>
  );
}
