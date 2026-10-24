import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';

export default function ListingDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/listings/' + id).then((d) => setListing(d.listing)).catch((e) => setError(e.message));
  }, [id]);

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
      <div className="panel">
        <p><b>{listing.seeker.name}</b> · {listing.expectedReach.toLocaleString()} {t('browse.reach')}</p>
        {listing.targetAudience && <p>{t('detail.audience')}: {listing.targetAudience}</p>}
        {listing.eventDate && <p>{t('detail.date')}: {new Date(listing.eventDate).toLocaleDateString()}</p>}
        <p>{listing.description}</p>
      </div>
      <h3 style={{ marginTop: 24 }}>{t('detail.packages')}</h3>
      <div className="grid">
        {listing.packages.map((p) => (
          <div className="card" key={p.id}>
            <h3>{p.name}</h3>
            <p className="price">{p.price} JOD</p>
            <p className="muted">{p.benefits}</p>
          </div>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 16 }}>{t('detail.soon')}</p>
    </div>
  );
}
