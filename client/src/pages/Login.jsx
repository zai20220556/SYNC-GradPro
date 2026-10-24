import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    try { await login(email, password); navigate('/browse'); } catch (err) { setError(err.message); }
  }

  return (
    <div className="page narrow">
      <h2>{t('auth.loginTitle')}</h2>
      <form className="panel" onSubmit={submit}>
        <div className="fld"><label htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="fld"><label htmlFor="pw">{t('auth.password')}</label>
          <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">{t('auth.submitLogin')}</button>
        <p className="muted">{t('auth.noAccount')} <Link to="/register">{t('nav.register')}</Link></p>
      </form>
    </div>
  );
}
