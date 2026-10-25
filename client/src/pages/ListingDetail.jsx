import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!listing) return <div className="page" />;

  return (
    <div className="page">
      <Link className="muted" to="/browse">{t('detail.back')}</Link>
      <h1 style={{ fontSize: 44, marginTop: 8 }}>{listing.title}</h1>
      <p>
        <span className="tag">{listing.category}</span>
        <span className="tag">{listing.city}</span>
        {listing.seeker.user?.isVerified && <span className="tag">{t('browse.verified')}</span>}
      </p>
      {listing.imageUrl && <img className="hero-img" src={listing.imageUrl} alt="" />}
      <div className="panel">
        <p>{listing.seeker.logoUrl && <img className="avatar" src={listing.seeker.logoUrl} alt="" />}<b>{listing.seeker.name}</b> · {listing.expectedReach.toLocaleString()} {t('browse.reach')}</p>
        {listing.targetAudience && <p>{t('detail.audience')}: {listing.targetAudience}</p>}
        {listing.eventDate && <p>{t('detail.date')}: {new Date(listing.eventDate).toLocaleDateString()}</p>}
        <p>{listing.description}</p>
      </div>

      <h3 style={{ marginTop: 24 }}>{t('detail.packages')}</h3>
      {user?.role === 'SPONSOR' ? (
        <form onSubmit={send}>
          {listing.packages.map((p) => (
            <label className="pkg" key={p.id}>
              <input type="radio" name="pk" checked={pkgId === p.id} onChange={() => setPkgId(p.id)} />
              <span><b>{p.name} · {p.price} JOD</b><span className="muted benefits">{p.benefits}</span></span>
            </label>
          ))}
          <div className="fld">
            <label htmlFor="msg">{t('detail.message')}</label>
            <textarea id="msg" rows="3" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={2} placeholder={t('detail.messageHint')} />
          </div>
          {sendError && <p className="error">{sendError}</p>}
          <button className="btn" type="submit">{t('detail.send')}</button>
        </form>
      ) : (
        <>
          <div className="grid">
            {listing.packages.map((p) => (
              <div className="card" key={p.id}>
                <h3>{p.name}</h3>
                <p className="price">{p.price} JOD</p>
                <p className="muted benefits">{p.benefits}</p>
              </div>
            ))}
          </div>
          {!user && <p className="muted" style={{ marginTop: 16 }}><Link to="/login">{t('nav.login')}</Link> {t('detail.loginToRequest')}</p>}
        </>
      )}
    </div>
  );
}
