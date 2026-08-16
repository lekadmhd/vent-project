'use client';

import { useEffect, useState } from 'react';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  highlight: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Rizky Pratama',
    role: 'Tenant — Jakarta Selatan',
    quote:
      'Proses booking sangat transparan. Invoice dengan kode unik bikin saya yakin dana sampai ke rekening resmi. Verifikasi Finance Admin juga cepat.',
    highlight: 'Transparan',
  },
  {
    name: 'Sarah Wijaya',
    role: 'Tenant — Tangerang',
    quote:
      'Akhirnya nemu platform yang aman. KTP saya terenkripsi, dan pembayaran masuk escrow dulu baru dana dilepas setelah check-in.',
    highlight: 'Aman',
  },
  {
    name: 'Budi Santoso',
    role: 'Landlord — Jakarta Barat',
    quote:
      'Sebagai pemilik unit, saya bisa pantau payout saldo di dashboard. Laporan keuangan real-time dan jelas.',
    highlight: 'Profesional',
  },
  {
    name: 'Maya Lestari',
    role: 'Tenant — Bekasi',
    quote:
      'Rincian biaya lengkap dari awal: sewa, deposit, admin fee, sampai kode unik. Tidak ada biaya tersembunyi sama sekali.',
    highlight: 'Jujur',
  },
];

export function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);

  const t = testimonials[idx];

  return (
    <div className="testimonial">
      <div className="quote-mark">“</div>
      <div className="testimonial-body" key={idx} style={{ animation: 'wordIn 0.5s ease' }}>
        <p className="testimonial-quote">{t.quote}</p>
        <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
          <span className="chip" style={{ borderColor: 'rgba(184,134,11,0.35)', color: 'var(--accent)' }}>
            {t.highlight}
          </span>
        </div>
        <div className="testimonial-name">{t.name}</div>
        <div className="muted" style={{ fontSize: 13 }}>{t.role}</div>
      </div>
      <div className="testimonial-nav">
        {testimonials.map((_, i) => (
          <button
            key={i}
            aria-label={`Testimoni ${i + 1}`}
            className={`dot ${i === idx ? 'active' : ''}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </div>
  );
}
