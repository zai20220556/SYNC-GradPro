import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { formatDate } from '../format.js';

const TYPES = ['QUESTION', 'PROBLEM', 'FEEDBACK'];
const emptyForm = { name: '', email: '', type: 'QUESTION', subject: '', message: '' };

export default function Help() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');
  const [mine, setMine] = useState([]);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const { hash } = useLocation();
  useEffect(() => {
    if (hash === '#contact') document.getElementById('contact')?.scrollIntoView({ block: 'start' });
  }, [hash]);

  const loadMine = () => api('/support/mine').then((d) => setMine(d.tickets)).catch(() => {});
  useEffect(() => {
    if (!user) { setMine([]); return; }
    setForm((f) => ({ ...f, email: f.email || user.email }));
    loadMine();
  }, [user?.id]);

  const faq = t('help.faq', { returnObjects: true });
  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return faq;
    return faq
      .map((g) => ({ ...g, items: g.items.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(term)) }))
      .filter((g) => g.items.length > 0);
  }, [faq, search]);

  async function submit(e) {
    e.preventDefault();
    setSending(true); setError(''); setSent('');
    try {
      await api('/support', { method: 'POST', body: form });
      setForm({ ...emptyForm, name: form.name, email: form.email });
      setSent(t(user ? 'help.sentAccount' : 'help.sent'));
      if (user) loadMine();
    } catch (err) {
      setError(err.message && err.message !== 'Something went wrong on the server.' ? err.message : t('help.sendError'));
    }
    setSending(false);
  }

  return (
    <div className="help">
      <section className="help-hero">
        <div className="wrap">
          <h1>{t('help.title')}</h1>
          <p>{t('help.intro')}</p>
          <div className="help-search">
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="M13.2 13.2L17 17" /></svg>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('help.search')} aria-label={t('help.search')} />
          </div>
        </div>
      </section>

      <div className="wrap help-layout">
        <section aria-labelledby="faq-title">
          <h2 id="faq-title">{t('help.faqTitle')}</h2>
          {groups.length === 0 && (
            <div className="panel state">
              <p className="muted">{t('help.noResults')}</p>
              <a className="btn" href="#contact">{t('help.askUs')}</a>
            </div>
          )}
          {groups.map((g) => (
            <div className="faq-group" key={g.group}>
              <h3>{g.group}</h3>
              {g.items.map((item) => (
                <details className="faq-item" key={item.q} open={search.trim() ? true : undefined}>
                  <summary>
                    {item.q}
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          ))}
        </section>

        <aside className="help-side">
          <form className="panel" id="contact" onSubmit={submit}>
            <h2>{t('help.contactTitle')}</h2>
            <p className="muted">{t('help.contactIntro')}</p>
            <fieldset className="type-pick">
              <legend>{t('help.type')}</legend>
              {TYPES.map((type) => (
                <label key={type}>
                  <input type="radio" name="support-type" value={type} checked={form.type === type} onChange={set('type')} />
                  <span>{t('help.types.' + type)}</span>
                </label>
              ))}
            </fieldset>
            <div className="fld"><label htmlFor="sup-name">{t('help.name')}</label>
              <input id="sup-name" autoComplete="name" value={form.name} onChange={set('name')} required minLength={2} maxLength={100} /></div>
            <div className="fld"><label htmlFor="sup-email">{t('help.email')}</label>
              <input id="sup-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required maxLength={190} /></div>
            <div className="fld"><label htmlFor="sup-subject">{t('help.subject')}</label>
              <input id="sup-subject" value={form.subject} onChange={set('subject')} required minLength={3} maxLength={150} /></div>
            <div className="fld"><label htmlFor="sup-message">{t('help.message')}</label>
              <textarea id="sup-message" rows="4" value={form.message} onChange={set('message')} required minLength={10} maxLength={2000} />
              <small className="muted">{t('help.messageHint')}</small></div>
            {error && <p className="error" role="alert">{error}</p>}
            {sent && <p className="notice" role="status">{sent}</p>}
            <button className="btn block" type="submit" disabled={sending}>{sending ? t('help.sending') : t('help.send')}</button>
          </form>

          {user && (
            <section className="panel">
              <h2>{t('help.mineTitle')}</h2>
              {mine.length === 0 && <p className="muted">{t('help.mineEmpty')}</p>}
              <ul className="ticket-list">
                {mine.map((ticket) => (
                  <li key={ticket.id}>
                    <div className="ticket-head">
                      <b>{ticket.subject}</b>
                      <span className="st" data-status={ticket.status}>{t('help.status.' + ticket.status)}</span>
                    </div>
                    <small className="muted">{t('help.types.' + ticket.type)} · {formatDate(ticket.createdAt, i18n.language)}</small>
                    {ticket.adminReply
                      ? <p className="ticket-reply"><b>{t('help.reply')}</b>{ticket.adminReply}</p>
                      : <p className="muted">{t('help.awaiting')}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
