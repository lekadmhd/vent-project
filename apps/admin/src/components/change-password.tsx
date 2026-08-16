'use client';

import { useState } from 'react';
import { api, getToken } from '@/lib/api';

export function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOk('');
    if (form.new_password.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return;
    }
    if (form.new_password !== form.confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setSaving(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: { old_password: form.old_password, new_password: form.new_password },
        token: getToken(),
      });
      setOk('Password berhasil diganti.');
      setForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengganti password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className="nav-btn" onClick={() => setOpen(true)}>
        Ganti Password
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => !saving && setOpen(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="title" style={{ marginBottom: 4 }}>Ganti Password</h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
              Masukkan password lama dan password baru untuk akun Anda.
            </p>
            <form onSubmit={submit}>
              <div className="field">
                <label>Password Lama</label>
                <input
                  className="input"
                  type="password"
                  required
                  value={form.old_password}
                  onChange={(e) => setForm({ ...form, old_password: e.target.value })}
                  placeholder="Password saat ini"
                />
              </div>
              <div className="field">
                <label>Password Baru</label>
                <input
                  className="input"
                  type="password"
                  required
                  value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div className="field">
                <label>Konfirmasi Password Baru</label>
                <input
                  className="input"
                  type="password"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Ulangi password baru"
                />
              </div>
              {error && <div className="error">{error}</div>}
              {ok && <div className="ok">{ok}</div>}
              <div className="row" style={{ marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Password'}
                </button>
                <button type="button" className="btn" onClick={() => setOpen(false)} disabled={saving}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
