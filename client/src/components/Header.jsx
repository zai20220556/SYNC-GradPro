import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { applyLanguage } from '../i18n.js';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header">
      <Link className="logo" to="/" aria-label="SYNC home">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M13 2C5 4 3 12 7 15c3 2 7 0 8-3 1-4 1-8-2-10z" />
          <path d="M19 17c-1 3-5 5-8 3 0 5 3 9 9 11 8-3 10-11 6-14-2-1-5-1-7 0z" />
        </svg>
        SYNC
      </Link>
      <nav className="nav" aria-label="Main">
        <NavLink to="/browse">{t('nav.browse')}</NavLink>
        {user?.role === 'SEEKER' && <NavLink to="/post">{t('nav.post')}</NavLink>}
        {user && <NavLink to="/profile">{t('nav.profile')}</NavLink>}
        {user ? (
          <button className="link" onClick={async () => { await logout(); navigate('/'); }}>{t('nav.logout')}</button>
        ) : (
          <>
            <NavLink to="/login">{t('nav.login')}</NavLink>
            <Link className="btn" to="/register">{t('nav.register')}</Link>
          </>
        )}
        <button className="link" onClick={() => applyLanguage(i18n.language === 'ar' ? 'en' : 'ar')}>
          {i18n.language === 'ar' ? 'English' : 'العربية'}
        </button>
      </nav>
    </header>
  );
}
