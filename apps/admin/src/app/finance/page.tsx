'use client';

import { useCallback, useEffect, useState, Fragment } from 'react';
import { api, getToken } from '@/lib/api';
import { RequireAdmin } from '@/components/require-admin';
import { fmtDateTime, fmtIdr, StatusBadge } from '@/lib/format';

interface Payment {
  id: string;
  bank_destination: string;
  sender_bank_name: string;
  sender_account_name: string;
  transfer_amount: string;
  proof_of_transfer_url: string;
  id_card_url: string | null;
  verification_status: string;
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
  tenant?: { name: string; email: string; phone: string };
  booking?: {
    booking_code: string;
    check_in: string;
    check_out: string;
    rent_amount: string;
    deposit_amount: string;
    platform_fee: string;
    unique_code: number;
    total_paid: string;
    status: string;
    apartment?: {
      title: string;
      complex_name: string;
      unit_number: string;
      city: string;
    };
  };
}

const FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'pending_review', label: 'Pending Verification' },
  { value: 'verified_approved', label: 'Approved' },
  { value: 'rejected_invalid', label: 'Rejected' },
];

export default function FinancePage() {
  const token = getToken();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState('pending_review');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await api<Payment[]>(`/payments/finance${filter ? `?status=${filter}` : ''}`, { token });
      setPayments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat antrian pembayaran');
    }
  }, [token, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    setError('');
    try {
      await api(`/payments/${id}/${action}`, {
        method: 'PATCH',
        body: action === 'reject' ? { reason: rejectReason[id] ?? '' } : {},
        token,
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Gagal ${action} pembayaran`);
    } finally {
      setBusyId(null);
    }
  };

  const toggle = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

  return (
    <RequireAdmin>
      <div>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <h1 className="title">
            Finance <span style={{ color: 'var(--accent)' }}>Verification Matrix</span>
          </h1>
          <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>
          Verifikasi manual 2-layer: kesesuaian nominal + mutasi. Klik Detail untuk melihat invoice, lalu Approve untuk melepas dana ke escrow.
        </p>

        {error && <div className="error">{error}</div>}

        {payments.length === 0 && <p className="muted">Tidak ada pembayaran di filter ini.</p>}

        {payments.length > 0 && (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-striped table-hover table-sm">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Kode Booking</th>
                    <th>Tenant</th>
                    <th>Unit</th>
                    <th>Kota</th>
                    <th>Transfer</th>
                    <th>Total Invoice</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const b = p.booking;
                    const isPending = p.verification_status === 'pending_review';
                    const open = expandedId === p.id;
                    return (
                      <Fragment key={p.id}>
                        <tr className={open ? 'table-active' : ''}>
                          <td className="mono" style={{ fontSize: 12 }}>{fmtDateTime(p.created_at)}</td>
                          <td className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>{b?.booking_code ?? p.id.slice(0, 8)}</td>
                          <td>
                            {p.tenant?.name ?? '-'}
                            {p.tenant?.email && <div className="muted mono" style={{ fontSize: 11 }}>{p.tenant.email}</div>}
                          </td>
                          <td>{b?.apartment ? `${b.apartment.complex_name} · Unit ${b.apartment.unit_number}` : '-'}</td>
                          <td>{b?.apartment?.city ?? '-'}</td>
                          <td className="mono" style={{ fontWeight: 600 }}>{fmtIdr(p.transfer_amount)}</td>
                          <td className="mono">{fmtIdr(b?.total_paid ?? 0)}</td>
                          <td>
                            <StatusBadge status={p.verification_status} />
                            {b?.status && <div style={{ marginTop: 4 }}><StatusBadge status={b.status} /></div>}
                          </td>
                          <td>
                            <div className="row" style={{ gap: 6 }}>
                              <button className="btn" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => toggle(p.id)}>
                                {open ? 'Tutup' : 'Detail'}
                              </button>
                              <a className="btn" href={p.proof_of_transfer_url} target="_blank" rel="noreferrer" style={{ padding: '5px 10px', fontSize: 12 }}>
                                Bukti
                              </a>
                              {p.id_card_url && (
                                <a className="btn" href={p.id_card_url} target="_blank" rel="noreferrer" style={{ padding: '5px 10px', fontSize: 12 }}>
                                  KTP
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>

                        {open && (
                          <tr>
                            <td colSpan={9} style={{ background: 'var(--surface)' }}>
                              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                                <div className="glass" style={{ padding: 16 }}>
                                  <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                    Bukti Transfer (Tenant)
                                  </div>
                                  <p style={{ fontSize: 14, marginBottom: 6 }}>
                                    <strong>{p.sender_account_name}</strong> · {p.sender_bank_name}
                                  </p>
                                  <p className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', marginBottom: 10 }}>
                                    {fmtIdr(p.transfer_amount)}
                                  </p>
                                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Bank Tujuan (Escrow)</div>
                                  <div className="mono" style={{ fontSize: 12, marginBottom: 10 }}>{p.bank_destination}</div>
                                  {p.rejection_reason && (
                                    <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                                      Alasan reject: {p.rejection_reason}
                                    </div>
                                  )}
                                </div>

                                <div className="glass" style={{ padding: 16 }}>
                                  <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                    Invoice Pembayaran
                                  </div>
                                  <p style={{ fontSize: 14, marginBottom: 6 }}>
                                    {b?.apartment ? `${b.apartment.complex_name} · Unit ${b.apartment.unit_number}` : 'Apartemen'}
                                    <span className="muted"> · {b?.apartment?.city}</span>
                                  </p>
                                  {[
                                    ['Sewa', b?.rent_amount],
                                    ['Deposit', b?.deposit_amount],
                                    ['Admin Fee', b?.platform_fee],
                                    ['Kode Unik', b ? String(b.unique_code) : ''],
                                  ].map(([label, value]) => (
                                    <div className="row-between" style={{ marginBottom: 4 }} key={label}>
                                      <span className="muted" style={{ fontSize: 13 }}>{label}</span>
                                      <span className="mono" style={{ fontSize: 13 }}>
                                        {label === 'Kode Unik' ? value : fmtIdr(value ?? 0)}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="row-between" style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 700 }}>Total Invoice</span>
                                    <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                                      {fmtIdr(b?.total_paid ?? 0)}
                                    </span>
                                  </div>
                                  <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
                                    Periode {b?.check_in} → {b?.check_out} · Tenant: {p.tenant?.name ?? '-'}
                                  </div>
                                </div>
                              </div>

                              {isPending && (
                                <div className="row" style={{ justifyContent: 'flex-end' }}>
                                  <input
                                    className="input"
                                    placeholder="Alasan reject (wajib saat reject)"
                                    style={{ flex: 1, maxWidth: 360 }}
                                    value={rejectReason[p.id] ?? ''}
                                    onChange={(e) => setRejectReason((r) => ({ ...r, [p.id]: e.target.value }))}
                                  />
                                  <button
                                    className="btn btn-danger"
                                    disabled={busyId === p.id || !(rejectReason[p.id]?.trim() ?? '')}
                                    onClick={() => act(p.id, 'reject')}
                                  >
                                    Reject Payment
                                  </button>
                                  <button
                                    className="btn btn-primary"
                                    disabled={busyId === p.id}
                                    onClick={() => act(p.id, 'approve')}
                                  >
                                    {busyId === p.id ? 'Memproses...' : 'APPROVE PAYMENT'}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RequireAdmin>
  );
}
