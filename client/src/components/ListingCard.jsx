import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { catLabel, cityLabel } from '../categories.js';
import { formatDate, formatNumber } from '../format.js';

export default function ListingCard({ listing, match, selected, compareDisabled = false, onToggle }) {
  const { t, i18n } = useTranslation();
  const { search } = useLocation();
  const lowest = Math.min(...listing.packages.map((p) => p.price));
  const to = '/listings/' + listing.id;
  const isVerified = Boolean(listing.seeker.user?.isVerified);
  return (
    <article className="card listing-card">
      {listing.imageUrl && (
        <Link to={to} state={{ from: search }} tabIndex={-1} aria-hidden="true">
          <img className="thumb" src={listing.imageUrl} alt="" loading="lazy" />
        </Link>
      )}
      <div className="card-tags">
        <span className="tag">{catLabel(t, listing.category)}</span>
        <span className="tag">{cityLabel(t, listing.city)}</span>
        {listing.isPromoted && <span className="tag promo">{t('browse.promoted')}</span>}
      </div>
      <h2 className="listing-title"><Link className="plain" to={to} state={{ from: search }}>{listing.title}</Link></h2>
      <p className="seeker">
        {listing.seeker.logoUrl && <img className="avatar" src={listing.seeker.logoUrl} alt="" />}
        <span>{listing.seeker.name}</span>
        {isVerified && (
          <span className="verified" title={t('browse.helpVerified')}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
            {t('browse.verified')}
          </span>
        )}
      </p>
      <dl className="facts">
        {listing.targetAudience && <div><dt>{t('browse.audience')}</dt><dd>{listing.targetAudience}</dd></div>}
        <div><dt>{t('browse.reachLabel')}</dt><dd>{formatNumber(listing.expectedReach, i18n.language)}</dd></div>
        {listing.eventDate && <div><dt>{t('browse.date')}</dt><dd>{formatDate(listing.eventDate, i18n.language)}</dd></div>}
      </dl>
      <div className="card-foot">
        <p className="price">
          <small>{t('browse.from')}</small>
          <b>{t('browse.jod', { amount: formatNumber(lowest, i18n.language) })}</b>
        </p>
        {match != null && <span className="match">{t('cmp.match')} {match}%</span>}
      </div>
      {onToggle && (
        <label className={'compare-check muted' + (compareDisabled ? ' is-disabled' : '')} title={compareDisabled ? t('cmp.full') : undefined}>
          <input className="inl" type="checkbox" checked={selected} disabled={compareDisabled} onChange={() => onToggle(listing.id)} /> {t('cmp.add')}
        </label>
      )}
    </article>
  );
}
