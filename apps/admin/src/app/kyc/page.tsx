'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, getToken } from '@/lib/api';
import { RequireAdmin } from '@/components/require-admin';
import { StatusBadge } from '@/lib/format';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  kyc_status: string;
}

interface KycDetail {
  id_card_number: string | null;
  id_card_url: string | null;
  selfie_url: string | null;
  kyc_status: string;
}

export default function KycPage() {
  const token = getToken();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<KycDetail | null>(null);
  const [detailUser, setDetailUser] = useState<UserRow | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<UserRow[]>('/users', { token });
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat pengguna');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (u: UserRow) => {
    setError('');
    setBusy(true);
    try {
      const d = await api<KycDetail>(`/users/${u.id}/kyc`, { token });
      setDetail(d);
      setDetailUser(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membuka KYC');
    } finally {
      setBusy(false);
    }
  };

  const moderate = async (userId: string, status: 'approved' | 'rejected') => {
    setBusy(true);
    try {
      await api(`/users/${userId}/kyc`, {
        method: 'PATCH',
        body: { status },
        token,
      });
      setDetail(null);
      setDetailUser(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal moderasi KYC');
    } finally {
      setBusy(false);
    }
  };

  return (
    <RequireAdmin>
      <div>
        <h1 className="title" style={{ marginBottom: 8 }}>
          KYC <span style={{ color: 'var(--accent)' }}>Moderation</span>
        </h1>
        <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>
          Dokumen KTP dilindungi enkripsi field-level dan ditampilkan dengan watermark dinamis.
        </p>

        {error && <div className="error">{error}</div>}

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>KYC Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td className="mono" style={{ fontSize: 13 }}>{u.email}</td>
                  <td className="mono" style={{ fontSize: 13 }}>{u.role}</td>
                  <td><StatusBadge status={u.kyc_status} /></td>
                  <td>
                    <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => openDetail(u)} disabled={busy}>
                      Lihat / Moderasi
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="muted">Belum ada pengguna.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {detail && detailUser && (
          <div className="card">
            <div className="row-between" style={{ marginBottom: 16 }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                KYC — {detailUser.name}
              </h2>
              <StatusBadge status={detail.kyc_status} />
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  No. KTP (Decrypted — Watermarked)
                </div>
                <div className="watermark">
                  {detail.id_card_number ?? '(kosong)'}
                  <div className="muted mono" style={{ fontSize: 11, marginTop: 8 }}>
                    [ADMIN {detailUser.id.slice(0, 8)}] · [{new Date().toISOString()}]
                  </div>
                </div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Dokumen & Selfie
                </div>
                <div className="row" style={{ marginBottom: 10 }}>
                  {detail.id_card_url && (
                    <a className="btn" style={{ padding: '6px 12px', fontSize: 12 }} href={detail.id_card_url} target="_blank" rel="noreferrer">
                      Lihat KTP
                    </a>
                  )}
                  {detail.selfie_url && (
                    <a className="btn" style={{ padding: '6px 12px', fontSize: 12 }} href={detail.selfie_url} target="_blank" rel="noreferrer">
                      Lihat Selfie
                    </a>
                  )}
                </div>
                <p className="muted" style={{ fontSize: 12 }}>
                  File hanya diakses via presigned URL (TTL 15 menit). Semua akses tercatat di audit trail.
                </p>
              </div>
            </div>

            <div className="row">
              <button className="btn btn-danger" onClick={() => moderate(detailUser.id, 'rejected')} disabled={busy}>
                Reject KYC
              </button>
              <button className="btn btn-primary" onClick={() => moderate(detailUser.id, 'approved')} disabled={busy}>
                Approve KYC
              </button>
            </div>
          </div>
        )}
      </div>
    </RequireAdmin>
  );
}
