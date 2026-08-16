'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { fmtIdr } from '@/lib/format';
import { BuildingArt } from '@/components/building-art';
import { Reveal } from '@/components/reveal';
import { Counter } from '@/components/counter';
import { RotatingWords } from '@/components/rotating-words';
import { TestimonialCarousel } from '@/components/testimonial-carousel';
import { PinIcon, BedIcon, BathIcon, RulerIcon, CheckIcon, ShieldIcon, LockIcon, SearchIcon } from '@/components/icons';

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

const quickCities = ['Jakarta', 'Jakarta Selatan', 'Tangerang', 'Bekasi', 'BSD City', 'Depok'];

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

const trustFeatures = [
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

const marqueeItems = [
  'AES-256-GCM',
  'S3 Private Storage',
  'Signed URL 15 Menit',
  'Escrow Berlapis',
  'Verifikasi Finance 2-Layer',
  'Audit Trail Lengkap',
  'KYC Terenkripsi',
  'Watermark Otomatis',
];

function cityHue(city: string): number {
  let h = 0;
  for (let i = 0; i < city.length; i++) h = (Math.imul(31, h) + city.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

export default function HomePage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (next: Filters) => {
    setFilters(next);
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (next.city) params.set('city', next.city);
      if (next.max_price) params.set('max_price', next.max_price);
      if (next.bedrooms) params.set('bedrooms', next.bedrooms);
      if (next.radius_km && next.lat && next.lng) {
        params.set('radius_km', next.radius_km);
        params.set('lat', next.lat);
        params.set('lng', next.lng);
      }
      const query = params.toString();
      const data = await api<Apartment[]>(`/apartments${query ? `?${query}` : ''}`);
      setApartments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  const load = useCallback(() => {
    doSearch(filters);
  }, [doSearch, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key: keyof Filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(filters);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cityCounts = apartments.reduce<Record<string, number>>((acc, a) => {
    acc[a.city] = (acc[a.city] ?? 0) + 1;
    return acc;
  }, {});
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="bg-grid" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />

        <div className="hero-main">
          <div className="hero-kicker">
            <span className="live-dot" />
            Enterprise Apartment Marketplace
          </div>
          <h1 className="hero-title">
            Sewa Apartemen Premium,
            <br />
            <span className="gradient-text">
              <RotatingWords words={['Aman & Transparan', 'Cepat & Mudah', 'Terverifikasi', 'Escrow Berlapis']} />
            </span>
          </h1>
          <p className="hero-sub">
            Platform sewa unit apartemen enterprise dengan escrow berlapis, enkripsi data AES-256,
            dan verifikasi pembayaran manual oleh Finance Admin. Transparan dari harga hingga check-in.
          </p>

          {/* Prominent search bar — jendela360 style */}
          <div className="hero-search" id="search">
            <form onSubmit={handleSearch}>
              <div className="field">
                <label>Nama Area / Kota</label>
                <input className="input" value={filters.city} onChange={(e) => set('city', e.target.value)} placeholder="Jakarta, Tangerang, Bekasi..." />
              </div>
              <div className="field">
                <label>Max Harga / Bulan</label>
                <input className="input" type="number" value={filters.max_price} onChange={(e) => set('max_price', e.target.value)} placeholder="5.000.000" />
              </div>
              <div className="field">
                <label>Tipe Kamar</label>
                <select className="select" value={filters.bedrooms} onChange={(e) => set('bedrooms', e.target.value)}>
                  <option value="">Semua</option>
                  <option value="1">1 BR</option>
                  <option value="2">2 BR</option>
                  <option value="3">3 BR+</option>
                </select>
              </div>
              <div className="field">
                <label>Radius (km)</label>
                <input className="input" type="number" value={filters.radius_km} onChange={(e) => set('radius_km', e.target.value)} placeholder="10" />
              </div>
              <button type="submit" className="btn btn-primary">
                <SearchIcon size={13} color="currentColor" />Cari
              </button>
            </form>
            <div className="hero-quick"> 
              <span>Populer:</span>
              {quickCities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    doSearch({ ...filters, city: filters.city === c ? '' : c });
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={filters.city === c ? { color: 'var(--accent)', borderColor: 'rgba(184,134,11,0.5)' } : undefined}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-value">
                <Counter value={apartments.length} />
              </div>
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
            
          </div>
        </div>

        <div className="hero-skyline">
          <BuildingArt variant="skyline" seed="venturra-skyline" />
        </div>
      </section>

      {/* ============ POPULAR UNITS ============ */}
      <section className="section" id="units" ref={resultsRef} style={{ scrollMarginTop: 80 }}>
        <div className="section-head">
          <div className="section-kicker">Star Listing Units</div>
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
                <div className="unit-media" style={{ background: 'rgba(14,42,71,0.04)' }} />
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
                    <span className="unit-price-pill">
                      {fmtIdr(a.price_monthly)}<span style={{ fontSize: 10, fontWeight: 500 }}>/bln</span>
                    </span>
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
                      <span className="spec-chip"><BedIcon /> {a.bedroom_count} BR</span>
                      <span className="spec-chip muted-chip"><BathIcon /> {a.bathroom_count} BA</span>
                      {a.size_sqm && <span className="spec-chip muted-chip"><RulerIcon /> {a.size_sqm} m²</span>}
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

      {/* ============ DISCOVER BY CITY ============ */}
      <section className="section">
        <div className="section-head">
          <div className="section-kicker">Discover</div>
          <h2 className="section-title" style={{ fontSize: 30 }}>
            Temukan Apartemen di
          </h2>
          <p className="section-desc">
            Jelajahi unit berdasarkan kota dengan jumlah listing real-time dari database.
          </p>
        </div>
        <div className="city-grid">
          {topCities.length === 0 &&
            ['Jakarta', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Bandung'].map((c, i) => (
              <CityCard key={c} name={c} count="—" delay={i * 60} />
            ))}
          {topCities.map(([city, count], i) => (
            <CityCard key={city} name={city} count={String(count)} delay={i * 60} onSelect={() => {
              doSearch({ ...filters, city });
              resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }} />
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

      {/* ============ WHY CHOOSE US ============ */}
      <section className="section" id="security">
        <div className="section-head">
          <div className="section-kicker">Zero-Trust Architecture</div>
          <h2 className="section-title" style={{ fontSize: 30 }}>
            Mengapa Memilih Venturra Homes
          </h2>
          <p className="section-desc">
            Arsitektur keamanan berlapis untuk melindungi data pribadi dan dana Anda.
          </p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {trustFeatures.map((f, idx) => (
            <Reveal key={f.title} delay={idx * 100}>
              <div className="feature">
                <div className="feature-icon">
                  {idx === 0 ? <LockIcon size={22} /> : <ShieldIcon size={22} />}
                </div>
                <span className="chip" style={{ borderColor: 'rgba(184,134,11,0.35)', color: 'var(--accent)', marginBottom: 14 }}>
                  {f.tag}
                </span>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ TESTIMONIAL ============ */}
      <section className="section">
        <div className="section-head">
          <div className="section-kicker">Kata Mereka</div>
          <h2 className="section-title" style={{ fontSize: 30 }}>
            Dipercaya Ribuan Penyewa
          </h2>
        </div>
        <Reveal>
          <TestimonialCarousel />
        </Reveal>
      </section>

      {/* ============ MARQUEE ============ */}
      <section className="section" style={{ paddingTop: 8, paddingBottom: 24 }}>
        <div className="marquee">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i}>
                <CheckIcon size={13} color="var(--success)" /> {item}
              </span>
            ))}
          </div>
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

interface CityCardProps {
  name: string;
  count: string;
  delay: number;
  onSelect?: () => void;
}

function CityCard({ name, count, delay, onSelect }: CityCardProps) {
  const hue = cityHue(name);
  const style = {
    '--city-a': `linear-gradient(160deg, hsl(${hue}, 80%, 22%), rgba(10,14,23,0.9))`,
    '--city-b': `hsl(${(hue + 40) % 360}, 85%, 55%)`,
  } as React.CSSProperties;

  return (
    <Reveal delay={delay}>
      <button
        type="button"
        className="city-card"
        style={style}
        onClick={onSelect}
        aria-label={`Lihat unit di ${name}`}
      >
        <h3>{name}</h3>
        <div className="city-count">
          {count} unit
          <span style={{ color: 'var(--accent)' }}>→</span>
        </div>
      </button>
    </Reveal>
  );
}
