import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { formatNumber } from '../format.js';

const SAMPLE_PACKAGES = [['samplePkg1', 200], ['samplePkg2', 450], ['samplePkg3', 900]];

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const steps = [1, 2, 3, 4];
  const seekerPath = user?.role === 'SEEKER' ? '/post' : user ? null : '/register?role=SEEKER';
  const sponsorPath = !user ? '/register?role=SPONSOR' : user.role === 'SPONSOR' ? '/browse' : null;
  const jod = (amount) => t('browse.jod', { amount: formatNumber(amount, i18n.language) });

  return (
    <div className="page">
      <section className="home-hero">
        <div className="hero-copy">
          <h1>{t('tagline')}</h1>
          <p>{t('heroText')}</p>
          {user && <p className="muted">{t('welcome')} {user.email}</p>}
          <Link className="text-link" to="/browse">{t('home.cta')}</Link>
        </div>

        <figure className="sample" aria-label={t('home.sampleLabel')}>
          <figcaption>{t('home.sampleLabel')}</figcaption>
          <h2>{t('home.sampleTitle')}</h2>
          <p className="seeker">
            <span>{t('home.sampleSeeker')}</span>
            <span className="verified">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
              {t('browse.verified')}
            </span>
          </p>
          <p className="sample-note">{t('home.noteVerified')}</p>
          <ul className="sample-packages">
            {SAMPLE_PACKAGES.map(([key, price]) => (
              <li key={key}><span>{t('home.' + key)}</span><b>{jod(price)}</b></li>
            ))}
          </ul>
          <p className="sample-note">{t('home.notePackages')}</p>
          <dl className="facts">
            <div><dt>{t('browse.reachLabel')}</dt><dd>{formatNumber(700, i18n.language)}</dd></div>
          </dl>
          <p className="sample-note">{t('home.noteReach')}</p>
        </figure>
      </section>

      <section className="role-paths" aria-label={t('home.pathsLabel')}>
        <div className="role-path">
          <h2>{t('home.seekerTitle')}</h2>
          <p className="muted">{t('home.seekerText')}</p>
          {seekerPath && <Link className="btn" to={seekerPath}>{t('home.seekerCta')}</Link>}
        </div>
        <div className="role-path">
          <h2>{t('home.sponsorTitle')}</h2>
          <p className="muted">{t('home.sponsorText')}</p>
          {sponsorPath && <Link className="btn" to={sponsorPath}>{t(user ? 'home.cta' : 'home.sponsorCta')}</Link>}
        </div>
      </section>

      <h2>{t('home.how')}</h2>
      <ol className="steps">
        {steps.map((n) => (
          <li key={n}>
            <b>{t(`home.s${n}`)}</b>
            <p className="muted">{t(`home.s${n}t`)}</p>
          </li>
        ))}
      </ol>

      <section className="trust-split">
        <h2>{t('home.trustTitle')}</h2>
        <div>
          <h3>{t('home.checkedTitle')}</h3>
          <p className="muted">{t('home.checkedText')}</p>
        </div>
        <div>
          <h3>{t('home.uncheckedTitle')}</h3>
          <p className="muted">{t('home.uncheckedText')}</p>
        </div>
      </section>
    </div>
  );
}
