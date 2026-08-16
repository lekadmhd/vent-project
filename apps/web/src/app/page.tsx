'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { fmtIdr } from '@/lib/format';

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
  price_monthly: string;
  deposit_amount: string;
  status: string;
}

interface Filters {
  city: string;
  max_price: string;
  bedrooms: string;
  radius_km: string;
  lat: string;
  lng: string;
}

const initialFilters: Filters = {
  city: '',
  max_price: '',
  bedrooms: '',
  radius_km: '',
  lat: '',
  lng: '',
};

export default function HomePage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.max_price) params.set('max_price', filters.max_price);
      if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
      if (filters.radius_km && filters.lat && filters.lng) {
        params.set('radius_km', filters.radius_km);
        params.set('lat', filters.lat);
        params.set('lng', filters.lng);
      }
      const query = params.toString();
      const data = await api<Apartment[]>(`/apartments${query ? `?${query}` : ''}`);
      setApartments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key: keyof Filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <section style={{ marginBottom: 28 }}>
        <h1 className="title">
          Cari Apartemen <span style={{ color: 'var(--accent)' }}>Sekarang</span>
        </h1>
        <p className="muted" style={{ marginTop: 8 }}>
          Platform sewa unit apartemen enterprise — transparan, aman, terverifikasi.
        </p>
      </section>

      <form
        className="card"
        style={{ marginBottom: 28 }}
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="field">
            <label>Kota</label>
            <input className="input" value={filters.city} onChange={(e) => set('city', e.target.value)} placeholder="Jakarta" />
          </div>
          <div className="field">
            <label>Max Harga / Bulan</label>
            <input className="input" type="number" value={filters.max_price} onChange={(e) => set('max_price', e.target.value)} placeholder="5000000" />
          </div>
          <div className="field">
            <label>Kamar Tidur</label>
            <select className="select" value={filters.bedrooms} onChange={(e) => set('bedrooms', e.target.value)}>
              <option value="">Semua</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3+</option>
            </select>
          </div>
          <div className="field">
            <label>Radius (km)</label>
            <input className="input" type="number" value={filters.radius_km} onChange={(e) => set('radius_km', e.target.value)} placeholder="10" />
          </div>
          <div className="field">
            <label>Latitude</label>
            <input className="input" type="number" step="any" value={filters.lat} onChange={(e) => set('lat', e.target.value)} placeholder="-6.20" />
          </div>
          <div className="field">
            <label>Longitude</label>
            <input className="input" type="number" step="any" value={filters.lng} onChange={(e) => set('lng', e.target.value)} placeholder="106.81" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Cari
        </button>
      </form>

      {error && <div className="error">{error}</div>}
      {loading && <p className="muted">Memuat unit apartemen...</p>}

      {!loading && apartments.length === 0 && (
        <p className="muted">Belum ada unit tersedia. Coba ubah filter.</p>
      )}

      <div className="grid grid-3">
        {apartments.map((a) => (
          <Link key={a.id} href={`/apartments/${a.id}`} style={{ color: 'inherit' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="row-between">
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{a.title}</h3>
                <span className="badge success">Active</span>
              </div>
              <p className="muted" style={{ fontSize: 14 }}>
                {a.complex_name} — Unit {a.unit_number}
                {a.tower ? ` (Tower ${a.tower})` : ''} · {a.city}
              </p>
              <p className="muted mono" style={{ fontSize: 13 }}>
                {a.bedroom_count} BR · {a.bathroom_count} BA
                {a.size_sqm ? ` · ${a.size_sqm} m²` : ''}
              </p>
              <div className="row-between" style={{ marginTop: 'auto' }}>
                <div>
                  <div className="mono" style={{ color: 'var(--accent)', fontSize: 18, fontWeight: 600 }}>
                    {fmtIdr(a.price_monthly)}
                    <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>/bulan</span>
                  </div>
                  <div className="muted mono" style={{ fontSize: 12 }}>
                    Deposit {fmtIdr(a.deposit_amount)}
                  </div>
                </div>
                <span className="btn btn-primary" style={{ padding: '8px 16px' }}>
                  Detail →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
