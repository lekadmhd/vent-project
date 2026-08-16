'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface Lead {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface Message {
  id: string;
  sender: 'guest' | 'admin';
  body: string;
  created_at: string;
}

const STORAGE_KEY = 'venturra_chat_lead';

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLead(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const poll = useCallback(async (leadId: string) => {
    try {
      const data = await api<{ messages: Message[] }>(`/leads/${leadId}/messages`);
      setMessages(data.messages ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open || !lead) return;
    poll(lead.id);
    const timer = setInterval(() => poll(lead.id), 4000);
    return () => clearInterval(timer);
  }, [open, lead, poll]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const created = await api<Lead>('/leads', {
        method: 'POST',
        body: form,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(created));
      setLead(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memulai chat');
    } finally {
      setLoading(false);
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !text.trim() || sending) return;
    const body = text.trim();
    setText('');
    setSending(true);
    try {
      await api(`/leads/${lead.id}/messages`, { method: 'POST', body: { body } });
      poll(lead.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim pesan');
      setText(body);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLead(null);
    setMessages([]);
    setError('');
  };

  return (
    <>
      <button
        type="button"
        className="livechat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="Tanya Jawab Live"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        {!open && <span className="livechat-fab-dot" />}
      </button>

      {open && (
        <div className="livechat-panel">
          <div className="livechat-head">
            <div>
              <div className="livechat-title">Tanya Jawab Live</div>
              <div className="livechat-sub">
                <span className="livechat-online" /> Admin Online
              </div>
            </div>
            <button type="button" className="livechat-close" onClick={() => setOpen(false)} aria-label="Tutup">
              ×
            </button>
          </div>

          {!lead ? (
            <form className="livechat-body" onSubmit={startChat}>
              <p className="livechat-intro">
                Isi data Anda, lalu admin akan merespons pertanyaan Anda secara langsung.
              </p>
              <label className="livechat-label">Nama</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama lengkap"
                required
                minLength={2}
              />
              <label className="livechat-label">Alamat</label>
              <input
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Alamat tempat tinggal"
                required
                minLength={5}
              />
              <label className="livechat-label">No. HP</label>
              <input
                className="input"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                required
                minLength={8}
              />
              {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={loading}>
                {loading ? 'Memproses...' : 'Mulai Chat'}
              </button>
            </form>
          ) : (
            <>
              <div className="livechat-body livechat-list" ref={listRef}>
                <div className="livechat-msg livechat-msg-admin">
                  Halo {lead.name}! Ada yang bisa kami bantu?
                </div>
                {messages.map((m) => (
                  <div key={m.id} className={`livechat-msg ${m.sender === 'admin' ? 'livechat-msg-admin' : 'livechat-msg-guest'}`}>
                    {m.body}
                    <span className="livechat-time">
                      {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                {messages.length > 0 && (
                  <div className="livechat-meta">
                    Data Anda tersimpan sebagai lead di admin. Nomor handphone Anda dapat dihubungi admin.
                  </div>
                )}
              </div>
              <form className="livechat-inputrow" onSubmit={send}>
                <input
                  className="input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tulis pesan..."
                  disabled={sending}
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
                  Kirim
                </button>
              </form>
              <div className="livechat-foot">
                <button type="button" onClick={reset}>Mulai chat baru</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
