'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getToken } from '@/lib/api';
import { fmtIdr } from '@/lib/format';

interface Apartment {
  id: string;
  title: string;
  complex_name: string;
  unit_number: string;
  city: string;
  price_monthly: string;
  deposit_amount: string;
}

interface Booking {
  id: string;
  booking_code: string;
  check_in: string;
  check_out: string;
  rent_amount: string;
  deposit_amount: string;
  platform_fee: string;
  unique_code: number;
  total_paid: string;
  status: string;
}

const PLATFORM_BANK = 'BCA 1234567890 a.n. PT AptRent (Escrow)';

export default function BookPage({ params }: { params: { id: string } }) {
  const token = getToken();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [payment, setPayment] = useState({
    bank_destination: PLATFORM_BANK,
    sender_bank_name: '',
    sender_account_name: '',
    transfer_amount: '',
    proof_of_transfer_url: '',
  });
  const [paymentError, setPaymentError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api<Apartment>(`/apartments/${params.id}`)
      .then(setApartment)
      .catch(() => {});
  }, [params.id]);

  const createBooking = async () => {
    setError('');
    setBusy(true);
    try {
      const b = await api<Booking>(`/bookings/${params.id}`, {
        method: 'POST',
        body: { check_in: checkIn, check_out: checkOut },
        token,
      });
      setBooking(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Booking gagal');
    } finally {
      setBusy(false);
    }
  };

  const submitPayment = async () => {
    if (!booking) return;
    setPaymentError('');
    setBusy(true);
    try {
      await api(`/payments/bookings/${booking.id}`, {
        method: 'POST',
        body: {
          ...payment,
          transfer_amount: parseFloat(payment.transfer_amount),
        },
        token,
      });
      setSubmitted(true);
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : 'Gagal submit pembayaran');
    } finally {
      setBusy(false);
    }
  };

  if (submitted && booking) {
    return (
      <div className="card" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <h1 className="title" style={{ marginBottom: 12 }}>
          Bukti Terkirim
        </h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Pembayaran Anda menunggu verifikasi Finance Admin. Anda akan mendapat notifikasi
          setelah diverifikasi.
        </p>
        <Link href={`/bookings/${booking.id}`} className="btn btn-primary">
          Lihat Status Booking
        </Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <h1 className="title" style={{ marginBottom: 8 }}>
          Booking Unit
        </h1>
        <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
          {apartment ? `${apartment.complex_name} · Unit ${apartment.unit_number} · ${apartment.city}` : 'Pilih tanggal sewa Anda.'}
        </p>
        {error && <div className="error">{error}</div>}
        <div className="field">
          <label>Check-in</label>
          <input className="input" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </div>
        <div className="field">
          <label>Check-out</label>
          <input className="input" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </div>
        <p className="muted" style={{ fontSize: 12, marginBottom: 20 }}>
          Tarif dihitung dari harga bulanan ÷ 30 hari. Deposit & admin fee ditambahkan
          bersama kode unik transfer.
        </p>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={createBooking} disabled={busy || !checkIn || !checkOut}>
          {busy ? 'Memproses...' : 'Buat Booking'}
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="row-between" style={{ marginBottom: 16 }}>
        <h1 className="title">Invoice & Pembayaran</h1>
        <span className="badge warn">Pending Payment</span>
      </div>

      <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <span className="muted" style={{ fontSize: 12 }}>Kode Booking</span>
          <span className="mono" style={{ color: 'var(--accent)' }}>{booking.booking_code}</span>
        </div>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <span className="muted" style={{ fontSize: 12 }}>Periode</span>
          <span className="mono">{booking.check_in} → {booking.check_out}</span>
        </div>
        {[
          ['Sewa', booking.rent_amount],
          ['Deposit', booking.deposit_amount],
          ['Admin Fee', booking.platform_fee],
          ['Kode Unik', String(booking.unique_code)],
        ].map(([label, value]) => (
          <div className="row-between" style={{ marginBottom: 8 }} key={label}>
            <span className="muted" style={{ fontSize: 14 }}>{label}</span>
            <span className="mono" style={{ fontSize: 14 }}>{label === 'Kode Unik' ? value : fmtIdr(value)}</span>
          </div>
        ))}
        <div className="row-between" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
          <span style={{ fontWeight: 700 }}>Total Transfer</span>
          <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>
            {fmtIdr(booking.total_paid)}
          </span>
        </div>
      </div>

      <p className="notice">
        Transfer ke rekening resmi: <strong>{PLATFORM_BANK}</strong>. Pastikan jumlah
        transfer persis termasuk kode unik.
      </p>

      {paymentError && <div className="error">{paymentError}</div>}

      <div className="field">
        <label>Bank Penerima (Escrow)</label>
        <input className="input" value={payment.bank_destination} onChange={(e) => setPayment((p) => ({ ...p, bank_destination: e.target.value }))} />
      </div>
      <div className="field">
        <label>Bank Pengirim</label>
        <input className="input" value={payment.sender_bank_name} onChange={(e) => setPayment((p) => ({ ...p, sender_bank_name: e.target.value }))} placeholder="BCA" />
      </div>
      <div className="field">
        <label>Nama Pengirim (Rekening)</label>
        <input className="input" value={payment.sender_account_name} onChange={(e) => setPayment((p) => ({ ...p, sender_account_name: e.target.value }))} />
      </div>
      <div className="field">
        <label>Jumlah Transfer (Rp)</label>
        <input className="input" type="number" value={payment.transfer_amount} onChange={(e) => setPayment((p) => ({ ...p, transfer_amount: e.target.value }))} placeholder={booking.total_paid} />
      </div>
      <div className="field">
        <label>URL Bukti Transfer (JPG/PNG/PDF, maks 5MB)</label>
        <input className="input" value={payment.proof_of_transfer_url} onChange={(e) => setPayment((p) => ({ ...p, proof_of_transfer_url: e.target.value }))} placeholder="https://.../bukti-transfer.jpg" />
      </div>

      <div className="row">
        <button className="btn btn-primary" onClick={submitPayment} disabled={busy}>
          {busy ? 'Mengirim...' : 'Kirim Bukti Transfer'}
        </button>
        <Link href={`/apartments/${params.id}`} className="btn">
          Kembali
        </Link>
      </div>
    </div>
  );
}
