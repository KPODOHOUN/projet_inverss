import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const GREETING = {
  role: 'assistant',
  content: "Bonjour ! Je suis l'assistant IMC. Posez-moi vos questions sur votre compte, les dépôts, retraits, investissements, trading, parrainage ou vérification."
};

export default function AIAssistant() {
  const { api, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [escalation, setEscalation] = useState(null);
  const bottomRef = useRef(null);
  const loadedHistory = useRef(false);

  useEffect(() => {
    if (open && isAuthenticated && !loadedHistory.current) {
      loadedHistory.current = true;
      api.get('/support/history').then(res => {
        const history = res.data?.data?.messages || [];
        if (history.length) setMessages([GREETING, ...history]);
      }).catch(() => {});
    }
  }, [open, isAuthenticated, api]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    setSending(true);
    setEscalation(null);
    try {
      const res = await api.post('/support/message', { message: text });
      const { reply, escalated, supportContactUrl } = res.data.data;
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
      if (escalated) setEscalation(supportContactUrl);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: "Désolé, l'assistant est momentanément indisponible." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Assistant"
        className="fixed bottom-5 right-5 z-[90] w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 text-black shadow-2xl shadow-yellow-500/30 flex items-center justify-center hover:scale-105 transition-transform border-none cursor-pointer"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.5 8.5 0 01-8.5 8.5 8.4 8.4 0 01-3.6-.8L3 21l1.8-5.6A8.4 8.4 0 013.5 11.5 8.5 8.5 0 0112 3a8.5 8.5 0 019 8.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[90] w-[92vw] max-w-sm h-[70vh] max-h-[520px] bg-[#0a0a0a] border-2 border-yellow-900/30 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 flex items-center justify-between">
            <p className="font-black text-black text-sm">Assistant IMC</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-yellow-500 text-black font-medium' : 'bg-gray-900 text-gray-200 border border-yellow-900/20'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg bg-gray-900 border border-yellow-900/20 text-gray-500 text-sm">…</div>
              </div>
            )}
            {escalation && (
              <div className="flex justify-start">
                <a
                  href={escalation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-yellow-500 text-black font-bold text-xs rounded hover:bg-yellow-400 transition-colors"
                >
                  Contacter le support →
                </a>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="p-3 border-t border-yellow-900/20 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Votre question…"
              disabled={sending}
              className="flex-1 px-3 py-2 bg-black border border-yellow-900/30 rounded text-white text-sm focus:border-yellow-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-4 py-2 bg-yellow-500 text-black font-bold text-sm rounded hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer"
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  );
}
