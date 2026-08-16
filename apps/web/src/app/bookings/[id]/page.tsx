'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getToken } from '@/lib/api';
import { fmtIdr, fmtDate, StatusBadge } from '@/lib/format';

interface Booking {
  id: string;
  booking_code: string;
  apartment_id: string;
  check_in: string;
  check_out: string;
  rent_amount: string;
  deposit_amount: string;
  platform_fee: string;
  unique_code: number;
  total_paid: string;
  status: string;
  created_at: string;
  apartment?: {
    title: string;
    complex_name: string;
    unit_number: string;
    city: string;
  };
}

interface Payment {
  id: string;
  booking_id: string;
  bank_destination: string;
  sender_bank_name: string;
  sender_account_name: string;
  transfer_amount: string;
  proof_of_transfer_url: string;
  verification_status: string;
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
}

export default function BookingDetail({ params }: { params: { id: string } }) {
  const token = getToken();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api<Booking>(`/bookings/${params.id}`, { token })
      .then(setBooking)
      .catch((e) => setError(e instanceof Error ? e.message : 'Booking tidak ditemukan'));
    api<Payment[]>(`/payments/mine`, { token })
      .then((list) => setPayments(list.filter((p) => p.booking_id === params.id)))
      .catch(() => {});
  }, [params.id, token]);

  const cancel = async () => {
    setCancelling(true);
    try {
      await api(`/bookings/${params.id}/status`, {
        method: 'PATCH',
        body: { status: 'cancelled' },
        token,
      });
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membatalkan');
    } finally {
      setCancelling(false);
    }
  };

  if (error) return <div className="error">{error}</div>;
  if (!booking) return <p className="muted">Memuat detail booking...</p>;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div>
            <h1 className="title" style={{ fontSize: 22 }}>
              {booking.apartment ? `${booking.apartment.complex_name} · Unit ${booking.apartment.unit_number}` : 'Booking'}
            </h1>
            <span className="mono muted" style={{ fontSize: 13 }}>{booking.booking_code}</span>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="glass" style={{ padding: 18, marginBottom: 16 }}>
          {[
            ['Periode', `${fmtDate(booking.check_in)} → ${fmtDate(booking.check_out)}`],
            ['Sewa', fmtIdr(booking.rent_amount)],
            ['Deposit', fmtIdr(booking.deposit_amount)],
            ['Admin Fee', fmtIdr(booking.platform_fee)],
            ['Kode Unik', String(booking.unique_code)],
          ].map(([label, value]) => (
            <div className="row-between" style={{ marginBottom: 8 }} key={label}>
              <span className="muted" style={{ fontSize: 14 }}>{label}</span>
              <span className="mono" style={{ fontSize: 14 }}>{value}</span>
            </div>
          ))}
          <div className="row-between" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
              {fmtIdr(booking.total_paid)}
            </span>
          </div>
        </div>

        {(booking.status === 'pending_payment' || booking.status === 'pending_finance_approval') && (
          <div className="row">
            {booking.status === 'pending_payment' && (
              <Link href={`/book/${booking.apartment_id}`} className="btn btn-primary">
                Bayar / Upload Ulang Bukti
              </Link>
            )}
            {booking.status === 'pending_finance_approval' && (
              <span className="notice" style={{ marginBottom: 0 }}>
                Menunggu verifikasi Finance Admin. Harap tunggu...
              </span>
            )}
            <button className="btn btn-danger" onClick={cancel} disabled={cancelling}>
              Batalkan Booking
            </button>
          </div>
        )}

        {booking.status === 'paid_in_escrow' && (
          <span className="badge success">Dana Anda aman di escrow. Selamat menikmati unit Anda.</span>
        )}
      </div>

      {payments.length > 0 && (
        <div className="card">
          <h2 className="section-title">Riwayat Pembayaran</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Bank Pengirim</th>
                <th>Jumlah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="mono" style={{ fontSize: 13 }}>{fmtDate(p.created_at)}</td>
                  <td>{p.sender_bank_name} · {p.sender_account_name}</td>
                  <td className="mono">{fmtIdr(p.transfer_amount)}</td>
                  <td>
                    <StatusBadge status={p.verification_status} />
                    {p.rejection_reason && (
                      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                        {p.rejection_reason}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
