'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';import { api } from '@/lib/api';
import { fmtIdr } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import { BuildingArt } from '@/components/building-art';
import { Reveal } from '@/components/reveal';
import { PinIcon, BedIcon, BathIcon, RulerIcon, CheckIcon, ShieldIcon, LockIcon } from '@/components/icons';

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
  furnishing: string;
  image_urls?: string[];
  occupied?: boolean;
}

const amenities = ['Furnished Unit', 'CCTV 24 Jam', 'Security 24/7', 'Kolam Renang', 'Gym Center', 'Smart Door Lock'];

export default function ApartmentDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const touchStartX = useRef(0);

  const goTo = (dir: -1 | 1) => {
    if (!apartment?.image_urls?.length) return;
    setActiveImg(
      (prev) =>
        (prev + dir + apartment.image_urls!.length) % apartment.image_urls!.length,
    );
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!apartment?.image_urls?.length) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -40) goTo(1);
    else if (delta > 40) goTo(-1);
  };

  useEffect(() => {
    api<Apartment>(`/apartments/${params.id}`)
      .then((found) => {
        setApartment(found);
        setActiveImg(0);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Unit tidak ditemukan'));
  }, [params.id]);

  if (error) return <div className="error">{error}</div>;
  if (!apartment)
    return (
      <div className="search-panel" style={{ maxWidth: 760, margin: '0 auto' }}>
        <p className="muted">Memuat detail unit...</p>
      </div>
    );

  const price = parseFloat(apartment.price_monthly);
  const adminFee = Math.round(price * 0.05);
  const firstPayment = price + parseFloat(apartment.deposit_amount) + adminFee;

  return (
    <div className="container" style={{ maxWidth: 980, padding: 0 }}>
      {/* Visual header */}
      <div
        className="card"
        style={{ overflow: 'hidden', padding: 0, marginBottom: 24 }}
      >
        <div
          className="unit-media"
          style={{ height: 280 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {apartment.image_urls && apartment.image_urls.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={apartment.image_urls[activeImg]} alt={apartment.title} className="unit-media-img" />
              <div className="unit-media-overlay" style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(14,42,71,0.75) 100%)' }} />
              {apartment.image_urls.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-nav"
                    onClick={() => goTo(-1)}
                    aria-label="Foto sebelumnya"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="gallery-nav"
                    onClick={() => goTo(1)}
                    aria-label="Foto berikutnya"
                  >
                    ›
                  </button>
                  <div className="gallery-thumbs">
                    {apartment.image_urls.map((u, i) => (
                      <button
                        key={u + i}
                        type="button"
                        className={`gallery-thumb ${i === activeImg ? 'active' : ''}`}
                        onClick={() => setActiveImg(i)}
                        aria-label={`Foto ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="" />
                      </button>
                    ))}
                  </div>
                  <span className="gallery-count">{activeImg + 1}/{apartment.image_urls.length}</span>
                </>
              )}
            </>
          ) : (
            <>
              <BuildingArt seed={`${apartment.title}-${apartment.complex_name}-${apartment.id}`} />
              <div className="unit-media-overlay" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(14,42,71,0.85) 100%)' }} />
            </>
          )}
          <span className={`badge ${apartment.occupied ? 'danger' : 'success'} unit-badge`}>
            {apartment.occupied ? 'Sudah Tersewa' : 'Terverifikasi'}
          </span>
          {apartment.furnishing !== 'unfurnished' && (
            <span className="unit-furnish-pill" style={{ top: 12, right: 12 }}>
              {apartment.furnishing === 'semi_furnished' ? 'Semi Furnish' : 'Furnished'}
            </span>
          )}
          <span className="unit-price-pill" style={{ bottom: 16, right: 18, fontSize: 16 }}>
            {fmtIdr(apartment.price_monthly)}<span style={{ fontSize: 11, fontWeight: 500 }}>/bulan</span>
          </span>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          <Reveal>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="row-between" style={{ marginBottom: 6 }}>
                <h1 className="title" style={{ fontSize: 26 }}>{apartment.title}</h1>
              </div>
              <p className="muted" style={{ fontSize: 14, marginBottom: 18 }}>
                <PinIcon /> {apartment.complex_name}
                {apartment.tower ? ` · Tower ${apartment.tower}` : ''} — Unit {apartment.unit_number}
                <br />
                {apartment.address}, {apartment.city}
              </p>

              <div className="chip-row" style={{ marginBottom: 20 }}>
                <span className="spec-chip"><BedIcon /> {apartment.bedroom_count} Kamar</span>
                <span className="spec-chip muted-chip"><BathIcon /> {apartment.bathroom_count} Bathroom</span>
                {apartment.size_sqm && <span className="spec-chip muted-chip"><RulerIcon /> {apartment.size_sqm} m²</span>}
                {apartment.furnishing !== 'unfurnished' && (
                  <span className="chip" style={{ borderColor: 'rgba(184,134,11,0.35)', color: 'var(--accent)' }}>
                    {apartment.furnishing === 'semi_furnished' ? 'Semi Furnish' : 'Furnished'}
                  </span>
                )}
              </div>

              <div className="glass" style={{ padding: 18, marginBottom: 20 }}>
                <div className="muted" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Lokasi Koordinat
                </div>
                <div className="mono" style={{ fontSize: 14, color: 'var(--accent)' }}>
                  {apartment.latitude}, {apartment.longitude}
                </div>
              </div>

              <div className="section-title" style={{ fontSize: 18 }}>Fasilitas Unit</div>
              <div className="chip-row" style={{ marginBottom: 4 }}>
                {amenities.map((a) => (
                  <span key={a} className="chip">
                    <CheckIcon /> {a}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="card">
              <div className="section-title" style={{ fontSize: 18 }}>Cara Booking Aman</div>
              <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                <div className="icon-badge" style={{ width: 38, height: 38, fontSize: 15 }}>1</div>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  Sistem menerbitkan invoice dengan <strong style={{ color: 'var(--text)' }}>kode unik transfer</strong> agar pembayaran dapat dipetakan otomatis.
                </p>
              </div>
              <div className="row" style={{ gap: 10, alignItems: 'flex-start', marginTop: 12 }}>
                <div className="icon-badge" style={{ width: 38, height: 38, fontSize: 15 }}>2</div>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  Transfer ke rekening escrow resmi platform, lalu upload bukti transfer Anda.
                </p>
              </div>
              <div className="row" style={{ gap: 10, alignItems: 'flex-start', marginTop: 12 }}>
                <div className="icon-badge" style={{ width: 38, height: 38, fontSize: 15 }}>3</div>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text)' }}>Finance Admin</strong> memverifikasi nominal & kode unik secara manual sebelum dana masuk escrow.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="card" style={{ position: 'sticky', top: 88 }}>
            <div className="section-title" style={{ fontSize: 18 }}>Rincian Biaya Transparan</div>

            <div className="row-between" style={{ padding: '10px 0' }}>
              <span className="muted" style={{ fontSize: 14 }}>Sewa / Bulan</span>
              <span className="mono" style={{ fontSize: 14 }}>{fmtIdr(apartment.price_monthly)}</span>
            </div>
            <div className="row-between" style={{ padding: '10px 0' }}>
              <span className="muted" style={{ fontSize: 14 }}>Deposit</span>
              <span className="mono" style={{ fontSize: 14 }}>{fmtIdr(apartment.deposit_amount)}</span>
            </div>
            <div className="row-between" style={{ padding: '10px 0' }}>
              <span className="muted" style={{ fontSize: 14 }}>Admin Fee (5%)</span>
              <span className="mono" style={{ fontSize: 14 }}>{fmtIdr(adminFee)}</span>
            </div>
            <div className="row-between" style={{ padding: '10px 0', marginBottom: 4 }}>
              <span className="muted" style={{ fontSize: 14 }}>Kode Unik</span>
              <span className="mono muted" style={{ fontSize: 13 }}>Ditentukan saat booking</span>
            </div>

            <hr className="glow-line" style={{ margin: '10px 0' }} />

            <div className="row-between">
              <span style={{ fontWeight: 700 }}>Pembayaran Pertama</span>
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                {fmtIdr(firstPayment)}
              </span>
            </div>
            <p className="muted" style={{ fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
              Termasuk sewa bulan pertama + deposit + admin fee. Kode unik transfer ditambahkan saat booking.
            </p>

            {user ? (
              apartment.occupied ? (
                <span className="btn btn-danger" style={{ width: '100%', marginTop: 18, padding: '14px', cursor: 'not-allowed' }}>
                  Unit Sedang Tersewa
                </span>
              ) : (
                <Link href={`/book/${apartment.id}`} className="btn btn-primary" style={{ width: '100%', marginTop: 18, padding: '14px' }}>
                  Booking Sekarang →
                </Link>
              )
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ width: '100%', marginTop: 18, padding: '14px' }}>
                Masuk untuk Booking
              </Link>
            )}

            <div className="chip-row" style={{ marginTop: 16, justifyContent: 'center' }}>
              <span className="chip"><LockIcon /> Escrow</span>
              <span className="chip"><CheckIcon /> Terverifikasi</span>
              <span className="chip"><ShieldIcon /> Aman</span>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
