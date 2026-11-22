import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Benefits from '../components/Benefits.jsx';
import { formatDate, formatNumber } from '../format.js';
import { catLabel, cityLabel } from '../categories.js';

export default function ListingDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [pkgId, setPkgId] = useState(null);
  const [message, setMessage] = useState('');
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    api('/listings/' + id)
      .then((d) => { setListing(d.listing); setPkgId(d.listing.packages[0]?.id ?? null); })
      .catch((e) => setError(e.message));
  }, [id]);

  async function send(e) {
    e.preventDefault();
    setSendError('');
    try {
      await api('/requests', { method: 'POST', body: { listingId: listing.id, packageId: pkgId, message } });
      navigate('/requests');
    } catch (err) { setSendError(err.message); }
  }

  if (error) return <div className="page"><p className="error" role="alert">{error}</p></div>;
  if (!listing) return <div className="page"><div className="card skeleton" aria-hidden="true"><i /><i /><i /></div></div>;

  const jod = (amount) => t('browse.jod', { amount: formatNumber(amount, i18n.language) });
  const packageBody = (p) => (
    <span className="pkg-body">
      <span className="pkg-head"><b>{p.name}</b><span className="pkg-price">{jod(p.price)}</span></span>
      <Benefits text={p.benefits} />
    </span>
  );

  return (
    <div className="page">
      <Link className="back-link" to={'/browse' + (location.state?.from || '')}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
        {t('detail.back')}
      </Link>
      <div className="detail">
        <article>
          <div className="detail-tags">
            <span className="tag">{catLabel(t, listing.category)}</span>
            <span className="tag">{cityLabel(t, listing.city)}</span>
          </div>
          <h1 className="detail-title">{listing.title}</h1>
          <p className="detail-byline">
            {listing.seeker.logoUrl && <img className="avatar" src={listing.seeker.logoUrl} alt="" />}
            <b>{listing.seeker.name}</b>
            {listing.seeker.user?.isVerified && (
              <span className="verified" title={t('browse.helpVerified')}>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
                {t('browse.verified')}
              </span>
            )}
          </p>
          {listing.imageUrl && <img className="hero-img" src={listing.imageUrl} alt="" />}
          <p className="detail-body">{listing.description}</p>
          <dl className="detail-facts">
            <div><dt>{t('browse.reachLabel')}</dt><dd>{formatNumber(listing.expectedReach, i18n.language)}</dd></div>
            {listing.targetAudience && <div><dt>{t('detail.audience')}</dt><dd>{listing.targetAudience}</dd></div>}
            {listing.eventDate && <div><dt>{t('detail.date')}</dt><dd>{formatDate(listing.eventDate, i18n.language)}</dd></div>}
            {listing.seeker.website && (
              <div><dt>{t('detail.website')}</dt><dd><a className="text-link" href={listing.seeker.website} target="_blank" rel="noopener noreferrer">{listing.seeker.website.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</a></dd></div>
            )}
          </dl>
        </article>

        <aside className="deal-rail">
          <h2>{t('detail.packages')}</h2>
          {user?.role === 'SPONSOR' ? (
            <form onSubmit={send}>
              {listing.packages.map((p) => (
                <label className="pkg" key={p.id}>
                  <input type="radio" name="pk" checked={pkgId === p.id} onChange={() => setPkgId(p.id)} />
                  {packageBody(p)}
                </label>
              ))}
              <div className="fld">
                <label htmlFor="msg">{t('detail.message')}</label>
                <textarea id="msg" rows="3" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={2} placeholder={t('detail.messageHint')} />
              </div>
              {sendError && <p className="error" role="alert">{sendError}</p>}
              <button className="btn block" type="submit">{t('detail.send')}</button>
            </form>
          ) : (
            <>
              {listing.packages.map((p) => <div className="pkg" key={p.id}>{packageBody(p)}</div>)}
              {!user && (
                <div className="rail-cta">
                  <span className="muted">{t('nav.login')} {t('detail.loginToRequest')}</span>
                  <Link className="btn block" to="/login">{t('nav.login')}</Link>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
