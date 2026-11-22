import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, uploadImage } from '../api.js';
import { CATEGORIES, catLabel, cityLabel } from '../categories.js';

const CITIES = ['Amman', 'Irbid', 'Zarqa'];
const emptyPackage = { name: '', price: '', benefits: '' };

export default function PostListing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [f, setF] = useState({ title: '', category: 'Events', city: 'Amman', description: '', expectedReach: '', targetAudience: '', eventDate: '' });
  const [packages, setPackages] = useState([{ ...emptyPackage }]);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setPkg = (i, k, v) => setPackages(packages.map((p, j) => (j === i ? { ...p, [k]: v } : p)));

  async function pickImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true); setError('');
    try { setImageUrl(await uploadImage(file)); } catch (err) { setError(err.message); }
    setBusy(false);
  }

  async function submit(e) {
    e.preventDefault();
    try {
      const body = {
        title: f.title, category: f.category, city: f.city, description: f.description,
        expectedReach: Number(f.expectedReach) || 0,
        packages: packages.map((p) => ({ name: p.name, price: Number(p.price) || 0, benefits: p.benefits })),
      };
      if (f.targetAudience) body.targetAudience = f.targetAudience;
      if (imageUrl) body.imageUrl = imageUrl;
      if (f.eventDate) body.eventDate = new Date(f.eventDate).toISOString();
      const d = await api('/listings', { method: 'POST', body });
      navigate('/listings/' + d.listing.id);
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="page form-page">
      <h1 className="page-title">{t('post.title')}</h1>
      <form className="panel" onSubmit={submit}>
        <section className="form-section">
          <div className="fld"><label htmlFor="title">{t('post.name')}</label><input id="title" value={f.title} onChange={set('title')} required minLength={3} /></div>
          <div className="fgrid">
            <div className="fld"><label htmlFor="cat">{t('post.category')}</label>
              <select id="cat" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(t, c)}</option>)}</select></div>
            <div className="fld"><label htmlFor="city">{t('post.city')}</label>
              <select id="city" value={f.city} onChange={set('city')}>{CITIES.map((c) => <option key={c} value={c}>{cityLabel(t, c)}</option>)}</select></div>
          </div>
          <div className="fld"><label htmlFor="desc">{t('post.description')}</label><textarea id="desc" rows="5" value={f.description} onChange={set('description')} required minLength={10} /></div>
          <div className="fld"><label htmlFor="aud">{t('post.audience')}</label><input id="aud" value={f.targetAudience} onChange={set('targetAudience')} /></div>
          <div className="fgrid">
            <div className="fld"><label htmlFor="reach">{t('post.reach')}</label><input id="reach" type="number" min="0" value={f.expectedReach} onChange={set('expectedReach')} /></div>
            <div className="fld"><label htmlFor="date">{t('post.date')}</label><input id="date" type="date" value={f.eventDate} onChange={set('eventDate')} /></div>
          </div>
          <div className="fld">
            <label htmlFor="photo">{t('up.photo')}</label>
            <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage} />
            <small className="muted">{busy ? t('up.uploading') : t('up.hint')}</small>
            {imageUrl && <img className="thumb" src={imageUrl} alt="" />}
          </div>
        </section>

        <section className="form-section">
          <h2>{t('post.packages')}</h2>
          {packages.map((p, i) => (
            <div className="pkg-editor" key={i}>
              <div className="fgrid">
                <div className="fld"><label htmlFor={'pn' + i}>{t('post.pkgName')}</label><input id={'pn' + i} value={p.name} onChange={(e) => setPkg(i, 'name', e.target.value)} required minLength={2} /></div>
                <div className="fld"><label htmlFor={'pp' + i}>{t('post.pkgPrice')}</label><input id={'pp' + i} type="number" min="0" value={p.price} onChange={(e) => setPkg(i, 'price', e.target.value)} required /></div>
              </div>
              <div className="fld"><label htmlFor={'pb' + i}>{t('post.pkgBenefits')}</label><textarea id={'pb' + i} rows="2" value={p.benefits} onChange={(e) => setPkg(i, 'benefits', e.target.value)} required minLength={2} /></div>
              {packages.length > 1 && <button type="button" className="link danger" onClick={() => setPackages(packages.filter((_, j) => j !== i))}>{t('post.removePkg')}</button>}
            </div>
          ))}
          <p><button type="button" className="btn alt" onClick={() => setPackages([...packages, { ...emptyPackage }])}>{t('post.addPkg')}</button></p>
        </section>

        {error && <p className="error" role="alert">{error}</p>}
        <div className="form-actions"><button className="btn" type="submit">{t('post.publish')}</button></div>
      </form>
    </div>
  );
}
