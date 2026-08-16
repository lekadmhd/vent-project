'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ImageUploader } from '@/components/image-uploader';
import { fmtIdr } from '@/lib/format';

interface MyApartment {
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
  furnishing: string;
  image_urls?: string[];
  created_at?: string;
}

interface ApartmentForm {
  title: string;
  complex_name: string;
  unit_number: string;
  tower: string;
  bedroom_count: number;
  bathroom_count: number;
  size_sqm: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  price_monthly: string;
  deposit_amount: string;
  furnishing: string;
  image_urls: string[];
}

const EMPTY_FORM: ApartmentForm = {
  title: '',
  complex_name: '',
  unit_number: '',
  tower: '',
  bedroom_count: 1,
  bathroom_count: 1,
  size_sqm: '',
  address: '',
  city: 'Jakarta Selatan',
  latitude: '-6.2620',
  longitude: '106.8320',
  price_monthly: '',
  deposit_amount: '',
  furnishing: 'unfurnished',
  image_urls: [],
};

const FURNISH_OPTIONS = [
  { value: 'unfurnished', label: 'Tanpa Perabot' },
  { value: 'semi_furnished', label: 'Semi Furnish' },
  { value: 'furnished', label: 'Furnished' },
];

const CITY_OPTIONS = [
  'Jakarta Selatan',
  'Jakarta Barat',
  'Jakarta Utara',
  'Jakarta Pusat',
  'Jakarta Timur',
  'Tangerang',
  'Bekasi',
  'Cikarang',
  'Depok',
  'Bogor',
  'Bandung',
];

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  draft: { text: 'Draft', cls: 'neutral' },
  pending_approval: { text: 'Menunggu Persetujuan', cls: 'warn' },
  active: { text: 'Aktif', cls: 'success' },
  rejected: { text: 'Ditolak', cls: 'danger' },
  suspended: { text: 'Ditangguhkan', cls: 'danger' },
};

export default function LandlordPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [apartments, setApartments] = useState<MyApartment[]>([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<ApartmentForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<MyApartment[]>('/apartments/mine', { token });
      setApartments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat unit');
    }
  }, [token]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'landlord') {
      router.push('/');
      return;
    }
    load();
  }, [loading, user, router, load]);

  const set = <K extends keyof ApartmentForm>(key: K, value: ApartmentForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {
      title: form.title,
      complex_name: form.complex_name,
      unit_number: form.unit_number,
      tower: form.tower || undefined,
      bedroom_count: Number(form.bedroom_count),
      bathroom_count: Number(form.bathroom_count),
      size_sqm: form.size_sqm ? Number(form.size_sqm) : undefined,
      address: form.address,
      city: form.city,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      price_monthly: Number(form.price_monthly),
      deposit_amount: Number(form.deposit_amount),
      furnishing: form.furnishing,
      image_urls: form.image_urls,
    };
    try {
      await api('/apartments', { method: 'POST', body, token });
      setModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan unit');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || user.role !== 'landlord') {
    return (
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="card"><p className="muted">Memuat panel landlord...</p></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 980 }}>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="title">
            Panel <span style={{ color: 'var(--accent)' }}>Landlord</span>
          </h1>
          <p className="muted">Kelola unit apartemen Anda. Unit baru akan diverifikasi admin sebelum tampil.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          + Tambah Unit
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="glass" style={{ padding: 16, marginBottom: 24 }}>
        <p className="muted" style={{ fontSize: 14 }}>
          Setelah submit, unit Anda masuk antrean <strong style={{ color: 'var(--warn)' }}>moderasi admin</strong>.
          Begitu disetujui, unit otomatis tampil di pencarian publik.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Kota</th>
                <th>Sewa / Bulan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {apartments.map((a) => {
                const st = STATUS_LABEL[a.status] ?? { text: a.status, cls: 'neutral' };
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                        {a.image_urls?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.image_urls[0]} alt="" width="52" height="40" className="img-thumb" />
                        ) : (
                          <span className="img-thumb" style={{ width: 52, height: 40, display: 'inline-block', background: 'var(--bg-2)' }} />
                        )}
                        <div>
                          {a.title}
                          <div className="muted" style={{ fontSize: 12 }}>
                            {a.complex_name} · Unit {a.unit_number}
                            {a.tower ? ` · Tower ${a.tower}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{a.city}</td>
                    <td className="mono" style={{ color: 'var(--navy)', fontWeight: 600 }}>{fmtIdr(a.price_monthly)}</td>
                    <td><span className={`badge ${st.cls}`}>{st.text}</span></td>
                  </tr>
                );
              })}
              {apartments.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted">
                    Anda belum punya unit. Klik &quot;+ Tambah Unit&quot; untuk mengunggah listing pertama Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => !saving && setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="title" style={{ marginBottom: 4 }}>
              Tambah Unit Baru
            </h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
              Unit akan disimpan sebagai <strong>Menunggu Persetujuan</strong> admin.
            </p>
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="field">
                  <label>Judul</label>
                  <input className="input" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="2BR Taman Rasuna" />
                </div>
                <div className="field">
                  <label>Nama Kompleks</label>
                  <input className="input" required value={form.complex_name} onChange={(e) => set('complex_name', e.target.value)} placeholder="Taman Rasuna Apartment" />
                </div>
                <div className="field">
                  <label>No. Unit</label>
                  <input className="input" required value={form.unit_number} onChange={(e) => set('unit_number', e.target.value)} placeholder="2208" />
                </div>
                <div className="field">
                  <label>Tower</label>
                  <input className="input" value={form.tower} onChange={(e) => set('tower', e.target.value)} placeholder="Tower A" />
                </div>
                <div className="field">
                  <label>Kamar Tidur</label>
                  <input className="input" type="number" min={0} required value={form.bedroom_count} onChange={(e) => set('bedroom_count', Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Kamar Mandi</label>
                  <input className="input" type="number" min={0} required value={form.bathroom_count} onChange={(e) => set('bathroom_count', Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Luas (m²)</label>
                  <input className="input" type="number" min={0} step="0.01" value={form.size_sqm} onChange={(e) => set('size_sqm', e.target.value)} placeholder="78" />
                </div>
                <div className="field">
                  <label>Kota</label>
                  <select className="select" value={form.city} onChange={(e) => set('city', e.target.value)}>
                    {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Perabot</label>
                  <select className="select" value={form.furnishing} onChange={(e) => set('furnishing', e.target.value)}>
                    {FURNISH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label>Alamat</label>
                  <input className="input" required value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Jl. H.R. Rasuna Said, Setiabudi" />
                </div>
                <div className="field">
                  <label>Latitude</label>
                  <input className="input" required value={form.latitude} onChange={(e) => set('latitude', e.target.value)} placeholder="-6.2273" />
                </div>
                <div className="field">
                  <label>Longitude</label>
                  <input className="input" required value={form.longitude} onChange={(e) => set('longitude', e.target.value)} placeholder="106.8296" />
                </div>
                <div className="field">
                  <label>Sewa / Bulan (IDR)</label>
                  <input className="input" type="number" min={0} required value={form.price_monthly} onChange={(e) => set('price_monthly', e.target.value)} placeholder="9500000" />
                </div>
                <div className="field">
                  <label>Deposit (IDR)</label>
                  <input className="input" type="number" min={0} required value={form.deposit_amount} onChange={(e) => set('deposit_amount', e.target.value)} placeholder="4750000" />
                </div>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Foto Unit</label>
                <ImageUploader images={form.image_urls} onChange={(urls) => set('image_urls', urls)} />
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Unit'}
                </button>
                <button type="button" className="btn" onClick={() => setModal(false)} disabled={saving}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p className="muted" style={{ fontSize: 13, marginTop: 20 }}>
        Ingin bertanya soal verifikasi? Hubungi tim di <Link href="/#contact">halaman utama</Link>.
      </p>
    </div>
  );
}
