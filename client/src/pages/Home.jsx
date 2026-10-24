import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const steps = [1, 2, 3, 4];
  return (
    <div className="page">
      <section className="hero">
        <h1>{t('tagline')}</h1>
        <p>{t('heroText')}</p>
        {user && <p className="muted">{t('welcome')} {user.email}</p>}
        <Link className="btn" to="/browse">{t('home.cta')}</Link>
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
    </div>
  );
}
