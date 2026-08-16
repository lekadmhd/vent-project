'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { fmtIdr } from '@/lib/format';
import { useAuth } from '@/lib/auth';

interface Apartment {
  id: string;
  title: string;
  complex_name: string;
  unit_number: string;
  tower: string | null;
  city: string;
  bedroom_count: number;
  bathroom_count: number;
  size_sqm: string | null;
  address: string;
  latitude: string;
  longitude: string;
  price_monthly: string;
  deposit_amount: string;
  status: string;
}

export default function ApartmentDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Apartment>(`/apartments/${params.id}`)
      .then((found) => setApartment(found))
      .catch((e) => setError(e instanceof Error ? e.message : 'Unit tidak ditemukan'));
  }, [params.id]);

  if (error) return <div className="error">{error}</div>;
  if (!apartment) return <p className="muted">Memuat detail unit...</p>;

  return (
    <div className="card" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="row-between" style={{ marginBottom: 16 }}>
        <h1 className="title">{apartment.title}</h1>
        <span className="badge success">Active</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 20 }}>
        <div>
          <p className="muted" style={{ fontSize: 14 }}>
            <strong style={{ color: 'var(--text)' }}>{apartment.complex_name}</strong>
            <br />
            Unit {apartment.unit_number}
            {apartment.tower ? ` · Tower ${apartment.tower}` : ''}
            <br />
            {apartment.address}
          </p>
        </div>
        <div>
          <p className="muted mono" style={{ fontSize: 13, textAlign: 'right' }}>
            {apartment.bedroom_count} BR · {apartment.bathroom_count} BA
            {apartment.size_sqm ? ` · ${apartment.size_sqm} m²` : ''}
            <br />
            {apartment.latitude}, {apartment.longitude}
          </p>
        </div>
      </div>

      <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
        <div className="row-between">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Sewa per Bulan</div>
            <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>
              {fmtIdr(apartment.price_monthly)}
            </div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Deposit</div>
            <div className="mono" style={{ fontSize: 26, fontWeight: 700 }}>
              {fmtIdr(apartment.deposit_amount)}
            </div>
          </div>
        </div>
      </div>

      <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
        Biaya transparan: Sewa + Deposit + Admin Fee platform + kode unik transfer akan
        dihitung saat booking. Pembayaran diverifikasi manual oleh Finance Admin sebelum
        dana masuk escrow.
      </p>

      {user ? (
        <Link href={`/book/${apartment.id}`} className="btn btn-primary">
          Booking Sekarang
        </Link>
      ) : (
        <Link href="/login" className="btn btn-primary">
          Masuk untuk Booking
        </Link>
      )}
    </div>
  );
}
