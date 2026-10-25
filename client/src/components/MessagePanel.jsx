import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';

export default function MessagePanel({ requestId }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const load = () => api(`/requests/${requestId}/messages`).then((d) => setMessages(d.messages)).catch((e) => setError(e.message));
  useEffect(() => {
    load();
    const timer = setInterval(load, 5000); // checks for new messages every 5 seconds
    return () => clearInterval(timer);
  }, [requestId]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages.length]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api(`/requests/${requestId}/messages`, { method: 'POST', body: { content: text } });
      setText(''); setError(''); load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="msgpanel">
      {messages.length === 0 && <p className="muted">{t('msg.empty')}</p>}
      {messages.map((m) => <div key={m.id} className={'msg' + (m.mine ? ' me' : '')}>{m.content}</div>)}
      <div ref={endRef} />
      {error && <p className="error">{error}</p>}
      <form className="row" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('msg.placeholder')} aria-label={t('msg.placeholder')} />
        <button className="btn" type="submit">{t('msg.send')}</button>
      </form>
    </div>
  );
}
