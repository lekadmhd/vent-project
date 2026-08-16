'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getToken } from '@/lib/api';
import { fmtIdr, fmtDate, StatusBadge } from '@/lib/format';

interface Booking {
  id: string;
  booking_code: string;
  check_in: string;
  check_out: string;
  rent_amount: string;
  deposit_amount: string;
  platform_fee: string;
  total_paid: string;
  status: string;
  apartment?: {
    title: string;
    complex_name: string;
    unit_number: string;
    city: string;
  };
}

export default function BookingsPage() {
  const token = getToken();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Booking[]>('/bookings/mine', { token });
      setBookings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat booking');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="title" style={{ marginBottom: 24 }}>
        Booking <span style={{ color: 'var(--accent)' }}>Saya</span>
      </h1>

      {error && <div className="error">{error}</div>}
      {loading && <p className="muted">Memuat booking...</p>}

      {!loading && bookings.length === 0 && (
        <p className="muted">Belum ada booking. <Link href="/">Cari unit disini</Link>.</p>
      )}

      <div className="grid">
        {bookings.map((b) => (
          <Link key={b.id} href={`/bookings/${b.id}`} style={{ color: 'inherit' }}>
            <div className="card">
              <div className="row-between">
                <span className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  {b.booking_code}
                </span>
                <StatusBadge status={b.status} />
              </div>
              <p style={{ marginTop: 10, fontWeight: 600 }}>
                {b.apartment ? `${b.apartment.complex_name} · Unit ${b.apartment.unit_number}` : 'Unit apartemen'}
              </p>
              <p className="muted mono" style={{ fontSize: 13, marginTop: 4 }}>
                {fmtDate(b.check_in)} → {fmtDate(b.check_out)} · Total {fmtIdr(b.total_paid)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
