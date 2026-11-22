import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { applyLanguage } from '../i18n.js';
import NotificationBell from './NotificationBell.jsx';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className="header">
      <div className="header-inner">
        <Link className="logo" to="/" aria-label="SYNC home">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M13 2C5 4 3 12 7 15c3 2 7 0 8-3 1-4 1-8-2-10z" />
            <path d="M19 17c-1 3-5 5-8 3 0 5 3 9 9 11 8-3 10-11 6-14-2-1-5-1-7 0z" />
          </svg>
          SYNC
        </Link>
        <button type="button" className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={t('menu')} aria-expanded={menuOpen} aria-controls="main-nav">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            {menuOpen ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
          </svg>
        </button>
        <nav id="main-nav" className={'nav' + (menuOpen ? ' is-open' : '')} aria-label="Main">
          <NavLink to="/browse">{t('nav.browse')}</NavLink>
          {user?.role === 'SEEKER' && <NavLink to="/post">{t('nav.post')}</NavLink>}
          {user && user.role !== 'ADMIN' && <NavLink to="/requests">{t('nav.requests')}</NavLink>}
          {user && user.role !== 'ADMIN' && <NavLink to="/tracker">{t('nav.tracker')}</NavLink>}
          {user?.role === 'ADMIN' && <NavLink to="/admin">{t('nav.admin')}</NavLink>}
          {user && <NavLink to="/profile">{t('nav.profile')}</NavLink>}
          <NavLink to="/help">{t('nav.help')}</NavLink>
          {user && <NotificationBell />}
          <button type="button" className="link lang" onClick={() => applyLanguage(i18n.language === 'ar' ? 'en' : 'ar')}>
            {i18n.language === 'ar' ? 'English' : 'العربية'}
          </button>
          {user ? (
            <button type="button" className="link" onClick={async () => { await logout(); navigate('/'); }}>{t('nav.logout')}</button>
          ) : (
            <>
              <NavLink to="/login">{t('nav.login')}</NavLink>
              <Link className="btn" to="/register">{t('nav.register')}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
