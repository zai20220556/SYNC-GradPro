import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ListingCard({ listing, match, selected, onToggle }) {
  const { t } = useTranslation();
  const lowest = Math.min(...listing.packages.map((p) => p.price));
  return (
    <article className="card">
      {listing.imageUrl && <img className="thumb" src={listing.imageUrl} alt="" loading="lazy" />}
      <div>
        <span className="tag">{listing.category}</span>
        <span className="tag">{listing.city}</span>
        {listing.isPromoted && <span className="tag promo">Promoted</span>}
      </div>
      <h3><Link className="plain" to={'/listings/' + listing.id}>{listing.title}</Link></h3>
      <p className="muted">
        {listing.seeker.logoUrl && <img className="avatar" src={listing.seeker.logoUrl} alt="" />}
        {listing.seeker.name}
        {listing.seeker.user?.isVerified ? ` · ${t('browse.verified')}` : ''}
      </p>
      <p>{listing.expectedReach.toLocaleString()} {t('browse.reach')}</p>
      <div className="row">
        <span className="price">{t('browse.from')} {lowest} JOD</span>
        {match != null && <span className="match">{t('cmp.match')} {match}%</span>}
      </div>
      {onToggle && (
        <label className="muted"><input className="inl" type="checkbox" checked={selected} onChange={() => onToggle(listing.id)} /> {t('cmp.add')}</label>
      )}
    </article>
  );
}
