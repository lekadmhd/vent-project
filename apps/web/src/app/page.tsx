'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { fmtIdr } from '@/lib/format';
import { BuildingArt } from '@/components/building-art';
import { Reveal } from '@/components/reveal';
import { PinIcon } from '@/components/icons';

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

const steps = [
  {
    n: '01',
    title: 'Temukan Unit',
    desc: 'Cari apartemen dengan filter kota, harga, dan radius geografis real-time di seluruh kota.',
  },
  {
    n: '02',
    title: 'Booking & Transfer',
    desc: 'Sistem menerbitkan invoice dengan kode unik. Transfer ke rekening escrow resmi platform.',
  },
  {
    n: '03',
    title: 'Verifikasi Finance',
    desc: 'Finance Admin memverifikasi bukti transfer secara manual 2-layer sebelum dana masuk escrow.',
  },
];

const securityFeatures = [
  {
    title: 'Enkripsi AES-256',
    desc: 'NIK, KTP, dan data sensitif dienkripsi field-level menggunakan AES-256-GCM sebelum disimpan.',
    tag: 'PRIVACY',
  },
  {
    title: 'Escrow Berlapis',
    desc: 'Dana tenant diamankan di escrow dan hanya dilepas setelah verifikasi ketat & check-in.',
    tag: 'TRUST',
  },
  {
    title: 'Verifikasi Manual 2-Layer',
    desc: 'Setiap pembayaran dicek oleh Finance Admin — nominal, kode unik, dan mutasi rekening.',
    tag: 'COMPLIANCE',
  },
  {
    title: 'Audit Trail Lengkap',
    desc: 'Setiap akses data sensitif tercatat dalam security audit log dengan identitas & IP.',
    tag: 'ACCOUNTABILITY',
  },
];

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

  const resetFilters = () => {
    setFilters(initialFilters);
    setLoading(true);
    setError('');
    api<Apartment[]>('/apartments')
      .then(setApartments)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat data'))
      .finally(() => setLoading(false));
  };

  const hasFilter =
    filters.city || filters.max_price || filters.bedrooms || filters.radius_km || filters.lat || filters.lng;

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="bg-grid" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="hero-content">
          <div className="hero-kicker">Enterprise Apartment Marketplace</div>
          <h1 className="hero-title">
            Sewa Apartemen Premium,
            <br />
            <span className="gradient-text">Dijamin Aman & Transparan</span>
          </h1>
          <p className="hero-sub">
            Platform sewa unit apartemen enterprise dengan escrow berlapis, enkripsi data AES-256,
            dan verifikasi pembayaran manual oleh Finance Admin. Transparan dari harga hingga proses check-in.
          </p>
          <div className="hero-cta">
            <a href="#search" className="btn btn-primary btn-lg">
              Cari Unit Sekarang
            </a>
            <a href="#how-it-works" className="btn btn-outline btn-lg">
              Cara Booking
            </a>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-value">{apartments.length}</div>
              <div className="stat-label">Unit Aktif</div>
            </div>
            <div className="stat">
              <div className="stat-value">12+</div>
              <div className="stat-label">Kota Tersedia</div>
            </div>
            <div className="stat">
              <div className="stat-value">2-Layer</div>
              <div className="stat-label">Verifikasi Finance</div>
            </div>
            <div className="stat">
              <div className="stat-value">AES-256</div>
              <div className="stat-label">Enkripsi Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SEARCH ============ */}
      <section id="search" className="section" style={{ paddingTop: 8 }}>
        <div className="search-panel">
          <div className="row-between" style={{ marginBottom: 20 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Cari Unit Anda
            </h2>
            <div className="chip-row">
              <span className="chip">Harga Transparan</span>
              <span className="chip">Escrow Aman</span>
              <span className="chip">Terverifikasi</span>
            </div>
          </div>

          <form
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
                <input className="input" type="number" value={filters.max_price} onChange={(e) => set('max_price', e.target.value)} placeholder="5.000.000" />
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
            <div className="row" style={{ justifyContent: 'space-between' }}>
              {hasFilter ? (
                <button type="button" className="btn" onClick={resetFilters}>
                  Reset Filter
                </button>
              ) : (
                <span className="muted" style={{ fontSize: 13 }}>
                  {apartments.length} unit tersedia
                </span>
              )}
              <button type="submit" className="btn btn-primary">
                Cari Unit →
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ============ UNIT LIST ============ */}
      <section className="section" id="units" style={{ paddingTop: 32 }}>
        <div className="section-head">
          <div className="section-kicker">Featured Units</div>
          <h2 className="section-title" style={{ fontSize: 30 }}>
            Unit Tersedia untuk Anda
          </h2>
          <p className="section-desc">
            Setiap unit telah diverifikasi dan menampilkan rincian biaya transparan sebelum booking.
          </p>
        </div>

        {error && <div className="error">{error}</div>}
        {loading && (
          <div className="grid grid-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="unit-card" style={{ height: 320 }}>
                <div className="unit-media" style={{ background: 'rgba(255,255,255,0.03)' }} />
                <div className="unit-body" style={{ gap: 12 }}>
                  <div className="skeleton-line" style={{ width: '70%' }} />
                  <div className="skeleton-line" style={{ width: '50%' }} />
                  <div className="skeleton-line" style={{ width: '85%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && apartments.length === 0 && (
          <div className="search-panel" style={{ textAlign: 'center', marginTop: 0 }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Belum ada unit yang cocok</p>
            <p className="muted" style={{ fontSize: 14 }}>
              Coba ubah filter pencarian Anda.
            </p>
          </div>
        )}

        <div className="grid grid-3">
          {apartments.map((a, idx) => (
            <Reveal key={a.id} delay={(idx % 3) * 90}>
              <Link href={`/apartments/${a.id}`} style={{ color: 'inherit', height: '100%', display: 'block' }}>
                <article className="unit-card">
                  <div className="unit-media">
                    <BuildingArt seed={`${a.title}-${a.complex_name}-${a.id}`} />
                    <div className="unit-media-overlay" />
                    <span className="badge success unit-badge">Terverifikasi</span>
                    <span className="unit-price-pill">{fmtIdr(a.price_monthly)}<span style={{ fontSize: 10, fontWeight: 500 }}>/bln</span></span>
                  </div>
                  <div className="unit-body">
                    <div>
                      <h3 className="unit-title">{a.title}</h3>
                      <div className="unit-loc" style={{ marginTop: 4 }}>
                        <PinIcon />
                        {a.complex_name} · {a.city}
                      </div>
                    </div>
                    <div className="chip-row" style={{ marginTop: 4 }}>
                      <span className="spec-chip">{a.bedroom_count} BR</span>
                      <span className="spec-chip muted-chip">{a.bathroom_count} BA</span>
                      {a.size_sqm && <span className="spec-chip muted-chip">{a.size_sqm} m²</span>}
                      {a.tower && <span className="spec-chip muted-chip">Tower {a.tower}</span>}
                    </div>
                    <div className="row-between" style={{ marginTop: 'auto', paddingTop: 6 }}>
                      <span className="muted" style={{ fontSize: 12 }}>
                        Deposit {fmtIdr(a.deposit_amount)}
                      </span>
                      <span className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                        Lihat Detail →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="glow-line" />

      {/* ============ HOW IT WORKS ============ */}
      <section className="section" id="how-it-works">
        <div className="section-head">
          <div className="section-kicker">Proses Transparan</div>
          <h2 className="section-title" style={{ fontSize: 30 }}>
            Bagaimana Cara Kerja
          </h2>
          <p className="section-desc">
            Alur booking enterprise dengan escrow berlapis dan verifikasi manual oleh Finance Admin.
          </p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {steps.map((s, idx) => (
            <Reveal key={s.n} delay={idx * 120}>
              <div className="feature">
                <div className="icon-badge">{s.n}</div>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 17, marginBottom: 8 }}>{s.title}</h3>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="glow-line" />

      {/* ============ SECURITY ============ */}
      <section className="section" id="security">
        <div className="section-head">
          <div className="section-kicker">Zero-Trust Architecture</div>
          <h2 className="section-title" style={{ fontSize: 30 }}>
            Keamanan Data Enterprise-Grade
          </h2>
          <p className="section-desc">
            Arsitektur keamanan berlapis untuk melindungi data pribadi dan dana Anda.
          </p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {securityFeatures.map((f, idx) => (
            <Reveal key={f.title} delay={idx * 100}>
              <div className="feature">
                <span className="chip" style={{ borderColor: 'rgba(0,240,255,0.3)', color: 'var(--accent)', marginBottom: 14 }}>
                  {f.tag}
                </span>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ TRUST ROW ============ */}
      <section className="section" style={{ paddingTop: 8, paddingBottom: 24 }}>
        <div className="trust-row">
          <span>AES-256-GCM</span>
          <span>S3 Private Storage</span>
          <span>Signed URL 15 Min</span>
          <span>Escrow Berlapis</span>
          <span>Audit Trail</span>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="section">
        <div className="cta-band">
          <h2 className="title" style={{ fontSize: 30, marginBottom: 12 }}>
            Siap Menyewa Apartemen Impian Anda?
          </h2>
          <p className="muted" style={{ maxWidth: 520, margin: '0 auto 28px', fontSize: 15, lineHeight: 1.65 }}>
            Daftar gratis, booking unit, dan nikmati proses yang transparan dengan jaminan escrow enterprise.
          </p>
          <div className="hero-cta" style={{ marginBottom: 0 }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Buat Akun Gratis
            </Link>
            <Link href="#search" className="btn btn-outline btn-lg">
              Jelajahi Unit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
