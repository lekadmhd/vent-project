'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, getToken } from '@/lib/api';
import { RequireAdmin } from '@/components/require-admin';
import { fmtIdr, StatusBadge } from '@/lib/format';

interface ApartmentRow {
  id: string;
  title: string;
  complex_name: string;
  unit_number: string;
  city: string;
  price_monthly: string;
  deposit_amount: string;
  status: string;
  landlord_id: string;
}

export default function ApartmentsPage() {
  const token = getToken();
  const [apartments, setApartments] = useState<ApartmentRow[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<ApartmentRow[]>('/apartments/admin/all', { token });
      setApartments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat apartemen');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const moderate = async (id: string, status: string) => {
    setBusyId(id);
    setError('');
    try {
      await api(`/apartments/${id}/moderate`, {
        method: 'PATCH',
        body: { status },
        token,
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal moderasi');
    } finally {
      setBusyId(null);
    }
  };

  const pending = apartments.filter((a) => a.status === 'pending_approval');
  const others = apartments.filter((a) => a.status !== 'pending_approval');

  return (
    <RequireAdmin>
      <div>
        <h1 className="title" style={{ marginBottom: 8 }}>
          Apartment <span style={{ color: 'var(--accent)' }}>Moderation</span>
        </h1>
        <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>
          Approve listing baru sebelum tampil di portal tenant.
        </p>

        {error && <div className="error">{error}</div>}

        {pending.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ color: 'var(--warn)' }}>Menunggu Persetujuan ({pending.length})</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Kota</th>
                  <th>Sewa</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.title}
                      <div className="muted" style={{ fontSize: 12 }}>{a.complex_name} · Unit {a.unit_number}</div>
                    </td>
                    <td>{a.city}</td>
                    <td className="mono">{fmtIdr(a.price_monthly)}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      <div className="row">
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busyId === a.id} onClick={() => moderate(a.id, 'rejected')}>
                          Reject
                        </button>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busyId === a.id} onClick={() => moderate(a.id, 'active')}>
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card">
          <h2 className="section-title">Semua Unit</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Kota</th>
                <th>Sewa</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {others.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.title}
                    <div className="muted" style={{ fontSize: 12 }}>{a.complex_name} · Unit {a.unit_number}</div>
                  </td>
                  <td>{a.city}</td>
                  <td className="mono">{fmtIdr(a.price_monthly)}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status !== 'suspended' ? (
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busyId === a.id} onClick={() => moderate(a.id, 'suspended')}>
                        Suspend
                      </button>
                    ) : (
                      <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busyId === a.id} onClick={() => moderate(a.id, 'active')}>
                        Aktifkan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {others.length === 0 && pending.length === 0 && (
                <tr><td colSpan={5} className="muted">Belum ada unit.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAdmin>
  );
}
