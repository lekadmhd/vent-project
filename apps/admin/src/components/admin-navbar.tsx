'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function AdminNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/finance', label: 'Finance Queue' },
    { href: '/kyc', label: 'KYC Moderation' },
    { href: '/apartments', label: 'Apartments' },
    { href: '/audit', label: 'Audit Logs' },
  ];

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand">
          APTRENT<span>//ADMIN</span>
        </Link>
        <div className="row" style={{ gap: 4 }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="btn"
              style={
                pathname === l.href
                  ? { borderColor: 'var(--accent)', boxShadow: '0 0 12px rgba(0,240,255,0.25)' }
                  : undefined
              }
            >
              {l.label}
            </Link>
          ))}
          <span className="muted mono" style={{ fontSize: 13, marginLeft: 8 }}>
            {user.name} ({user.role})
          </span>
          <button className="btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
