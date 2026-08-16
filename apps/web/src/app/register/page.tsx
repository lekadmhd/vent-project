'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'tenant',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 460 }}>
      <div className="card">
        <h1 className="title" style={{ marginBottom: 24 }}>
          Daftar <span style={{ color: 'var(--accent)' }}>AptRent</span>
        </h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Nama Lengkap</label>
            <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="field">
            <label>No. HP</label>
            <input className="input" type="tel" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} />
          </div>
          <div className="field">
            <label>Saya adalah</label>
            <select className="select" value={form.role} onChange={(e) => set('role', e.target.value)}>
              <option value="tenant">Tenant (Penyewa)</option>
              <option value="landlord">Landlord (Pemilik Unit)</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>
          Sudah punya akun? <Link href="/login">Masuk disini</Link>
        </p>
      </div>
    </div>
  );
}
