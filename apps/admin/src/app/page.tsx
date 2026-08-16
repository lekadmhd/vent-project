'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getToken } from '@/lib/api';
import { RequireAdmin } from '@/components/require-admin';
import { fmtDateTime, StatusBadge } from '@/lib/format';

interface Payment {
  id: string;
  verification_status: string;
  transfer_amount: string;
  sender_account_name: string;
  created_at: string;
  booking?: { booking_code: string };
}

interface UserRow {
  id: string;
  name: string;
  role: string;
  kyc_status: string;
}

interface ApartmentRow {
  id: string;
  title: string;
  status: string;
}

interface AuditRow {
  id: string;
  action: string;
  target_resource: string;
  created_at: string;
}

function StatCard({ label, value, to, tone }: { label: string; value: number; to: string; tone?: string }) {
  return (
    <Link href={to} style={{ color: 'inherit' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: tone ?? 'var(--accent)' }}>
          {value}
        </div>
        <div className="muted" style={{ fontSize: 13 }}>{label}</div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const token = getToken();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [apartments, setApartments] = useState<ApartmentRow[]>([]);
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api<Payment[]>('/payments/finance', { token }).catch(() => []),
      api<UserRow[]>('/users', { token }).catch(() => []),
      api<ApartmentRow[]>('/apartments/admin/all', { token }).catch(() => []),
      api<AuditRow[]>('/audit', { token }).catch(() => []),
    ]).then(([p, u, a, al]) => {
      setPayments(p);
      setUsers(u);
      setApartments(a);
      setAudits(al);
    }).catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat dashboard'));
  }, [token]);

  const pendingFinance = payments.filter((p) => p.verification_status === 'pending_review').length;
  const pendingKyc = users.filter((u) => u.kyc_status === 'pending').length;
  const pendingApartments = apartments.filter((a) => a.status === 'pending_approval').length;

  return (
    <RequireAdmin>
      <div>
        <div className="page-header">
          <h1 className="title">
            Dashboard <span style={{ color: 'var(--accent)' }}>Control</span>
          </h1>
          <p>
            Realtime Analytics — Finance Escalation & Operations Control
          </p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 24 }}>
          <StatCard label="Finance Pending" value={pendingFinance} to="/finance" tone="var(--warn)" />
          <StatCard label="KYC Pending" value={pendingKyc} to="/kyc" />
          <StatCard label="Apartment Pending" value={pendingApartments} to="/apartments" />
          <StatCard label="Total Apartments" value={apartments.length} to="/apartments" tone="var(--success)" />
        </div>

        <div className="card">
          <h2 className="section-title">Audit Trail Terbaru</h2>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Aksi</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              {audits.slice(0, 10).map((l) => (
                <tr key={l.id}>
                  <td className="mono" style={{ fontSize: 12 }}>{fmtDateTime(l.created_at)}</td>
                  <td><span className="mono" style={{ color: 'var(--accent)' }}>{l.action}</span></td>
                  <td className="mono" style={{ fontSize: 13 }}>{l.target_resource}</td>
                </tr>
              ))}
              {audits.length === 0 && (
                <tr><td colSpan={3} className="muted">Belum ada aktivitas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAdmin>
  );
}
