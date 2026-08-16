'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, getToken } from '@/lib/api';
import { RequireAdmin } from '@/components/require-admin';
import { fmtDateTime } from '@/lib/format';

interface LeadRow {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message: string | null;
}

interface ChatMessage {
  id: string;
  sender: 'guest' | 'admin';
  body: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Baru',
  contacted: 'Sudah Dihubungi',
  closed: 'Ditutup',
};

const STATUS_TONE: Record<string, string> = {
  new: 'badge warn',
  contacted: 'badge accent',
  closed: 'badge success',
};

export default function LeadsPage() {
  const token = getToken();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [lead, setLead] = useState<LeadRow | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api<LeadRow[]>('/leads', { token });
      setLeads(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat bucket admin');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const openThread = useCallback(
    async (id: string) => {
      setSelected(id);
      setError('');
      try {
        const data = await api<{ messages: ChatMessage[] } & LeadRow>(`/leads/${id}`, { token });
        setLead(data);
        setThread(data.messages ?? []);
        setNotes(data.notes ?? '');
        setStatus(data.status);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Gagal membuka percakapan');
      }
    },
    [token],
  );

  const poll = useCallback(async () => {
    if (!selected) return;
    try {
      const data = await api<{ messages: ChatMessage[] } & LeadRow>(`/leads/${selected}`, { token });
      setThread(data.messages ?? []);
      setLead(data);
      load();
    } catch {
      /* ignore */
    }
  }, [selected, token, load]);

  useEffect(() => {
    if (!selected) return;
    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, [selected, poll]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      await api(`/leads/${selected}/reply`, { method: 'POST', body: { body: reply.trim() }, token });
      setReply('');
      poll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membalas');
    } finally {
      setSending(false);
    }
  };

  const saveLead = async () => {
    if (!selected || saving) return;
    setSaving(true);
    setError('');
    try {
      await api(`/leads/${selected}`, {
        method: 'PATCH',
        body: { status, notes },
        token,
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan lead');
    } finally {
      setSaving(false);
    }
  };

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(phone);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <RequireAdmin>
      <div>
        <div className="row-between page-header">
          <div>
            <h1 className="title">
              Bucket <span style={{ color: 'var(--accent)' }}>Admin</span>
            </h1>
            <p>Data kontak dari chat live pengunjung — hubungi calon tenant di sini.</p>
          </div>
          <button className="btn" onClick={load}>
            ↻ Refresh
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
          <div className="card">
            <h2 className="section-title">Daftar Kontak ({leads.length})</h2>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>No. HP</th>
                    <th>Status</th>
                    <th>Pesan</th>
                    <th>Diterima</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr
                      key={l.id}
                      className={selected === l.id ? 'table-active' : ''}
                      onClick={() => openThread(l.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <strong>{l.name}</strong>
                        <div className="muted" style={{ fontSize: 12 }}>{l.address}</div>
                      </td>
                      <td>
                        <span className="mono" style={{ fontSize: 13 }}>{l.phone}</span>
                        <button
                          type="button"
                          className="btn"
                          style={{ padding: '2px 8px', fontSize: 11, marginLeft: 6 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            copyPhone(l.phone);
                          }}
                        >
                          {copied === l.phone ? 'Disalin' : 'Salin'}
                        </button>
                      </td>
                      <td>
                        <span className={STATUS_TONE[l.status] ?? 'badge'}>
                          {STATUS_LABEL[l.status] ?? l.status}
                        </span>
                      </td>
                      <td className="muted" style={{ fontSize: 12 }}>{l.message_count} pesan</td>
                      <td className="muted" style={{ fontSize: 12 }}>{fmtDateTime(l.created_at)}</td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="muted">
                        Belum ada lead. Ketika pengunjung mengisi form chat di website, kontaknya akan masuk ke sini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ position: 'sticky', top: 24 }}>
            {!lead ? (
              <p className="muted" style={{ fontSize: 14 }}>
                Klik salah satu kontak di tabel untuk membuka percakapan dan menghubungi calon tenant.
              </p>
            ) : (
              <>
                <h2 className="section-title">Percakapan — {lead.name}</h2>
                <div className="glass" style={{ padding: 12, marginBottom: 14 }}>
                  <div className="muted" style={{ fontSize: 12 }}>No. HP</div>
                  <div className="row" style={{ alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>
                      {lead.phone}
                    </span>
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => copyPhone(lead.phone)}
                    >
                      {copied === lead.phone ? 'Disalin ✓' : 'Salin'}
                    </button>
                  </div>
                </div>

                <div className="livechat-list" style={{ height: 240, overflowY: 'auto', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="livechat-msg livechat-msg-admin">
                    Halo {lead.name}! Ada yang bisa kami bantu?
                  </div>
                  {thread.map((m) => (
                    <div key={m.id} className={`livechat-msg ${m.sender === 'admin' ? 'livechat-msg-admin' : 'livechat-msg-guest'}`}>
                      {m.body}
                      <span className="livechat-time">
                        {new Date(m.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                <form className="row" style={{ gap: 8 }} onSubmit={sendReply}>
                  <input
                    className="input"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Balas chat..."
                    disabled={sending}
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending || !reply.trim()}>
                    Kirim
                  </button>
                </form>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>
                  <div className="field">
                    <label>Status</label>
                    <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="new">Baru</option>
                      <option value="contacted">Sudah Dihubungi</option>
                      <option value="closed">Ditutup</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Catatan</label>
                    <input
                      className="input"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Catatan internal..."
                    />
                  </div>
                </div>
                <button className="btn btn-gold" style={{ marginTop: 10, width: '100%' }} disabled={saving} onClick={saveLead}>
                  {saving ? 'Menyimpan...' : 'Simpan Status & Catatan'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
