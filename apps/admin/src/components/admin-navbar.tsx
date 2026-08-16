'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function AdminNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          VENTURRA HOMES<span>//ADMIN</span>
        </Link>

        <div className="nav-links">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-btn ${pathname === l.href ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-user">
          <span className="muted mono" style={{ fontSize: 13 }}>
            {user.name} ({user.role})
          </span>
          <button className="nav-btn" onClick={logout}>
            Logout
          </button>
        </div>

        <button className="nav-burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="nav-mobile">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-mobile-link"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="nav-mobile-divider" />
          <button
            className="nav-mobile-link"
            style={{ textAlign: 'left', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 15 }}
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
