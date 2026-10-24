import { useTranslation } from 'react-i18next';

export default function ListingCard({ listing }) {
  const { t } = useTranslation();
  const lowest = Math.min(...listing.packages.map((p) => p.price));
  return (
    <article className="card">
      <div>
        <span className="tag">{listing.category}</span>
        <span className="tag">{listing.city}</span>
        {listing.isPromoted && <span className="tag promo">Promoted</span>}
      </div>
      <h3>{listing.title}</h3>
      <p className="muted">
        {listing.seeker.name}
        {listing.seeker.user?.isVerified ? ` · ${t('browse.verified')}` : ''}
      </p>
      <p>
        {listing.expectedReach.toLocaleString()} {t('browse.reach')}
      </p>
      <p className="price">
        {t('browse.from')} {lowest} JOD
      </p>
    </article>
  );
}
