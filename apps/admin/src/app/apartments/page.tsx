'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, getToken } from '@/lib/api';
import { RequireAdmin } from '@/components/require-admin';
import { fmtIdr, StatusBadge } from '@/lib/format';

interface ApartmentRow {
  id: string;
  title: string;
  complex_name: string;
  unit_number: string;
  tower: string | null;
  city: string;
  price_monthly: string;
  deposit_amount: string;
  status: string;
  landlord_id: string;
  bedroom_count: number;
  bathroom_count: number;
  size_sqm: string | null;
  address: string;
  latitude: string;
  longitude: string;
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
  status: string;
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
  status: 'active',
};

const STATUS_OPTIONS = [
  'draft',
  'pending_approval',
  'active',
  'rejected',
  'suspended',
];

const CITY_OPTIONS = [
  'Jakarta Selatan',
  'Jakarta Barat',
  'Jakarta Utara',
  'Jakarta Pusat',
  'Jakarta Timur',
  'Tangerang',
  'Bekasi',
  'Depok',
  'Bogor',
  'Bandung',
];

export default function ApartmentsPage() {
  const token = getToken();
  const [apartments, setApartments] = useState<ApartmentRow[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ApartmentForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<ApartmentRow[]>('/apartments/admin/all', { token });
      setApartments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat apartemen');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof ApartmentForm>(key: K, value: ApartmentForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModal('create');
  };

  const openEdit = (a: ApartmentRow) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      complex_name: a.complex_name,
      unit_number: a.unit_number,
      tower: a.tower ?? '',
      bedroom_count: a.bedroom_count,
      bathroom_count: a.bathroom_count,
      size_sqm: a.size_sqm ?? '',
      address: a.address,
      city: a.city,
      latitude: a.latitude,
      longitude: a.longitude,
      price_monthly: String(Math.round(parseFloat(a.price_monthly))),
      deposit_amount: String(Math.round(parseFloat(a.deposit_amount))),
      status: a.status,
    });
    setModal('edit');
  };

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
      status: form.status,
    };
    try {
      if (modal === 'edit' && editingId) {
        await api(`/apartments/${editingId}`, { method: 'PATCH', body, token });
      } else {
        await api('/apartments', { method: 'POST', body, token });
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan unit');
    } finally {
      setSaving(false);
    }
  };

  const moderate = async (id: string, status: string) => {
    setBusyId(id);
    setError('');
    try {
      await api(`/apartments/${id}/moderate`, {
        method: 'PATCH',
        body: { status },
        token,
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal moderasi');
    } finally {
      setBusyId(null);
    }
  };

  const doDelete = async (id: string) => {
    setBusyId(id);
    setError('');
    try {
      await api(`/apartments/${id}`, { method: 'DELETE', token });
      setConfirmDelete(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus unit');
    } finally {
      setBusyId(null);
    }
  };

  const pending = apartments.filter((a) => a.status === 'pending_approval');
  const others = apartments.filter((a) => a.status !== 'pending_approval');

  return (
    <RequireAdmin>
      <div>
        <div className="row-between page-header">
          <div>
            <h1 className="title">
              Apartment <span style={{ color: 'var(--accent)' }}>Management</span>
            </h1>
            <p>Kelola unit apartemen — tambah, edit, hapus, dan moderasi listing.</p>
          </div>
          <button className="btn btn-gold" onClick={openCreate}>
            + Tambah Unit
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {pending.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 className="section-title" style={{ color: 'var(--warn)' }}>Menunggu Persetujuan ({pending.length})</h2>
            <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Kota</th>
                  <th>Sewa</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.title}
                      <div className="muted" style={{ fontSize: 12 }}>{a.complex_name} · Unit {a.unit_number}</div>
                    </td>
                    <td>{a.city}</td>
                    <td className="mono" style={{ color: 'var(--navy)', fontWeight: 600 }}>{fmtIdr(a.price_monthly)}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busyId === a.id} onClick={() => moderate(a.id, 'rejected')}>
                          Reject
                        </button>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busyId === a.id} onClick={() => moderate(a.id, 'active')}>
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="section-title">Semua Unit ({apartments.length})</h2>
          <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Kota</th>
                <th>Sewa</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {others.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.title}
                    <div className="muted" style={{ fontSize: 12 }}>{a.complex_name} · Unit {a.unit_number}</div>
                  </td>
                  <td>{a.city}</td>
                  <td className="mono" style={{ color: 'var(--navy)', fontWeight: 600 }}>{fmtIdr(a.price_monthly)}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busyId === a.id} onClick={() => openEdit(a)}>
                        Edit
                      </button>
                      {a.status !== 'suspended' ? (
                        <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busyId === a.id} onClick={() => moderate(a.id, 'suspended')}>
                          Suspend
                        </button>
                      ) : (
                        <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busyId === a.id} onClick={() => moderate(a.id, 'active')}>
                          Aktifkan
                        </button>
                      )}
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busyId === a.id} onClick={() => setConfirmDelete(a.id)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {others.length === 0 && pending.length === 0 && (
                <tr><td colSpan={5} className="muted">Belum ada unit. Klik &quot;Tambah Unit&quot; untuk membuat listing pertama.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {modal && (
          <div className="modal-overlay" onClick={() => !saving && setModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="title" style={{ marginBottom: 4 }}>
                {modal === 'create' ? 'Tambah Unit Baru' : 'Edit Unit'}
              </h2>
              <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
                Status default unit baru: <strong>Active</strong> (langsung tampil di portal tenant).
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
                  <div className="field">
                    <label>Status</label>
                    <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  <button type="submit" className="btn btn-gold" disabled={saving}>
                    {saving ? 'Menyimpan...' : modal === 'create' ? 'Simpan Unit' : 'Simpan Perubahan'}
                  </button>
                  <button type="button" className="btn" onClick={() => setModal(null)} disabled={saving}>
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
              <h2 className="title" style={{ marginBottom: 8, fontSize: 22 }}>Hapus Unit?</h2>
              <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
                Unit ini akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="row">
                <button className="btn btn-danger" disabled={busyId === confirmDelete} onClick={() => doDelete(confirmDelete)}>
                  {busyId === confirmDelete ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
                <button className="btn" onClick={() => setConfirmDelete(null)}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAdmin>
  );
}
