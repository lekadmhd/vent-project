'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, getToken } from '@/lib/api';
import { RequireAdmin } from '@/components/require-admin';
import { fmtDateTime } from '@/lib/format';

interface AuditRow {
  id: string;
  action: string;
  target_resource: string;
  ip_address: string;
  user_agent: string | null;
  created_at: string;
  actor?: { name: string; email: string };
}

export default function AuditPage() {
  const token = getToken();
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api<AuditRow[]>('/audit', { token });
      setLogs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat audit logs');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <RequireAdmin>
      <div>
        <h1 className="title" style={{ marginBottom: 8 }}>
          Security <span style={{ color: 'var(--accent)' }}>Audit Logs</span>
        </h1>
        <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>
          Anonymized data trail — pelacakan akses data sensitif dan aksi finansial.
        </p>

        {error && <div className="error">{error}</div>}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Aktor</th>
                <th>Aksi</th>
                <th>Target</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="mono" style={{ fontSize: 12 }}>{fmtDateTime(l.created_at)}</td>
                  <td>
                    {l.actor?.name ?? 'unknown'}
                    <div className="muted mono" style={{ fontSize: 11 }}>{l.actor?.email ?? ''}</div>
                  </td>
                  <td><span className="mono" style={{ color: 'var(--accent)', fontSize: 13 }}>{l.action}</span></td>
                  <td className="mono" style={{ fontSize: 13 }}>{l.target_resource}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{l.ip_address}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="muted">Belum ada log.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAdmin>
  );
}
