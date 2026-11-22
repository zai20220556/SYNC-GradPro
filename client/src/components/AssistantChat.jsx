import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api.js';
import { answer, replyLanguage } from '../assistantEngine.js';
import { cityLabel } from '../categories.js';
import { formatNumber } from '../format.js';

const LOCAL_DELAY_MS = 260;
const HISTORY_LIMIT = 9;
const MAX_CARDS = 3;
const MARKER = /\[\[listing:(\d+)\]\]/g;

// Removes listing markers, including one still arriving in the stream.
const visibleText = (raw) => raw
  .replace(MARKER, '')
  .replace(/\[\[?[^\]]*$/, '')
  .replace(/\*\*/g, '')
  .replace(/^\s*[-•*]\s+/gm, '')
  .trim();

function listingCards(raw, catalog) {
  const ids = [...new Set([...raw.matchAll(MARKER)].map((m) => Number(m[1])))];
  return ids.map((id) => catalog?.find((l) => l.id === id)).filter(Boolean).slice(0, MAX_CARDS)
    .map((l) => ({ id: l.id, title: l.title, city: l.city, price: Math.min(...l.packages.map((p) => p.price)) }));
}

export default function AssistantChat() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const catalogRef = useRef(null);
  const contextRef = useRef(null);
  const abortRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  const loadCatalog = () => {
    catalogRef.current ||= api('/listings').then((d) => d.listings).catch(() => { catalogRef.current = null; return null; });
    return catalogRef.current;
  };

  useEffect(() => {
    api('/assistant/status').then((d) => setAiReady(Boolean(d.ai))).catch(() => setAiReady(false));
    return () => abortRef.current?.abort();
  }, []);
  useEffect(() => { if (open) { loadCatalog(); inputRef.current?.focus(); } }, [open]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages, busy]);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  function localReply(content, listings) {
    const reply = answer(content, { listings, context: contextRef.current, uiLanguage: i18n.language });
    contextRef.current = reply.context || null;
    return { role: 'bot', ...reply };
  }

  async function streamAi(history, lang, listings) {
    const start = Math.max(0, history.length - HISTORY_LIMIT);
    const recent = history.slice(start % 2 === 0 ? start : start + 1);
    const controller = new AbortController();
    abortRef.current = controller;
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: recent.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text.slice(0, 1500) })) }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('unavailable');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let raw = '';
    const show = (done) => {
      const reply = { role: 'bot', lang, kind: 'ai', text: visibleText(raw), listings: done ? listingCards(raw, listings) : [] };
      setMessages((list) => (list.at(-1)?.role === 'bot' ? [...list.slice(0, -1), reply] : [...list, reply]));
    };
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line) continue;
        const event = JSON.parse(line);
        if (event.error) throw new Error('unavailable');
        if (event.text) { raw += event.text; show(false); }
      }
    }
    if (!visibleText(raw)) throw new Error('empty');
    show(true);
  }

  async function ask(question) {
    const content = question.trim();
    if (!content || busy) return;
    const history = [...messages.filter((m) => m.text), { role: 'user', text: content }];
    setMessages((list) => [...list, { role: 'user', text: content }]);
    setText('');
    setBusy(true);
    const listings = await loadCatalog();
    const lang = replyLanguage(content, i18n.language);

    let answered = false;
    if (aiReady) {
      try {
        await streamAi(history, lang, listings);
        answered = true;
      } catch {
        // The built-in assistant answers below, so the chat keeps working if AI is unavailable.
        setMessages((list) => (list.at(-1)?.kind === 'ai' ? list.slice(0, -1) : list));
      }
      abortRef.current = null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, LOCAL_DELAY_MS));
    }
    if (!answered) {
      const reply = localReply(content, listings);
      setMessages((list) => [...list, reply]);
    }
    setBusy(false);
    inputRef.current?.focus();
  }

  function submit(e) {
    e.preventDefault();
    ask(text);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      ask(text);
    }
  }

  const suggestions = t('help.assistant.suggestions', { returnObjects: true });
  const streaming = busy && messages.at(-1)?.kind === 'ai';

  return (
    <div className="assistant">
      {open && (
        <section className="assistant-panel" role="dialog" aria-label={t('help.assistant.title')} onKeyDown={(e) => { if (e.key === 'Escape') close(); }}>
          <header className="assistant-head">
            <div>
              <h2>{t('help.assistant.title')}</h2>
              <p>{t(aiReady ? 'help.assistant.aiSubtitle' : 'help.assistant.subtitle')}</p>
            </div>
            <button type="button" onClick={close} aria-label={t('help.assistant.close')}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
            </button>
          </header>

          <div className="assistant-log" aria-live="polite">
            {messages.length === 0 && (
              <div className="assistant-welcome">
                <p>{t('help.assistant.welcome')}</p>
                <div className="assistant-suggestions">
                  {suggestions.map((s) => <button type="button" key={s} onClick={() => ask(s)}>{s}</button>)}
                </div>
              </div>
            )}
            {messages.map((m, i) => {
              if (m.role === 'user') return <div className="assistant-msg from-user" dir="auto" key={i}>{m.text}</div>;
              const copyT = i18n.getFixedT(m.lang);
              return (
                <div className="assistant-msg from-bot" dir={m.lang === 'ar' ? 'rtl' : 'ltr'} key={i}>
                  {m.title && <b className="assistant-answer-title">{m.title}</b>}
                  <span>{m.text}</span>
                  {m.listings?.length > 0 && (
                    <ul className="assistant-results">
                      {m.listings.map((l) => (
                        <li key={l.id}>
                          <Link to={'/listings/' + l.id} onClick={() => setOpen(false)}>
                            <b dir="auto">{l.title}</b>
                            <small>{cityLabel(copyT, l.city)} · {copyT('browse.from')} {copyT('browse.jod', { amount: formatNumber(l.price, m.lang) })}</small>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {m.link && (
                    <Link className="assistant-link" to={m.link} onClick={() => setOpen(false)}>
                      {copyT(m.link.startsWith('/help') ? 'help.contactTitle' : 'help.assistant.seeAll')}
                    </Link>
                  )}
                </div>
              );
            })}
            {busy && !streaming && <div className="assistant-typing" role="status" aria-label={t('help.assistant.thinking')}><i /><i /><i /></div>}
            <div ref={endRef} />
          </div>

          <form className="assistant-form" onSubmit={submit}>
            <textarea ref={inputRef} rows="1" dir="auto" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} placeholder={t('help.assistant.placeholder')} aria-label={t('help.assistant.placeholder')} />
            <button type="submit" disabled={!text.trim() || busy} aria-label={t('help.assistant.send')}>
              <svg className="assistant-send" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4L12.5 8l-4 4" /></svg>
            </button>
          </form>
          <p className="assistant-note">{t(aiReady ? 'help.assistant.aiNote' : 'help.assistant.note')}</p>
        </section>
      )}
      <button type="button" ref={launcherRef} className="assistant-launcher" onClick={() => (open ? close() : setOpen(true))} aria-expanded={open} aria-label={t('help.assistant.open')}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4.5h12a1.5 1.5 0 011.5 1.5v7a1.5 1.5 0 01-1.5 1.5H9l-4 3v-3H4A1.5 1.5 0 012.5 13V6A1.5 1.5 0 014 4.5z" /></svg>
        <span>{t('help.assistant.launcher')}</span>
      </button>
    </div>
  );
}
