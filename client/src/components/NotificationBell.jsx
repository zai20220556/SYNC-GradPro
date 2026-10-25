import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';

export default function NotificationBell() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = () => api('/notifications').then((d) => setItems(d.notifications)).catch(() => {});
  useEffect(() => {
    load();
    const timer = setInterval(load, 10000); // checks for new notifications every 10 seconds
    return () => clearInterval(timer);
  }, []);

  const unread = items.filter((n) => !n.isRead).length;
  async function markAll() { await api('/notifications/read-all', { method: 'PATCH' }); load(); }

  return (
    <div className="bell">
      <button className="link" onClick={() => setOpen(!open)} aria-label={t('notif.title')} aria-expanded={open}>
        {t('notif.title')}{unread > 0 && <span className="badge">{unread}</span>}
      </button>
      {open && (
        <div className="bellmenu panel">
          {items.length === 0 && <p className="muted">{t('notif.none')}</p>}
          {items.map((n) => (
            <p key={n.id} style={{ fontWeight: n.isRead ? 400 : 600 }}>{n.content}</p>
          ))}
          {unread > 0 && <button className="link" onClick={markAll}>{t('notif.markAll')}</button>}
        </div>
      )}
    </div>
  );
}
