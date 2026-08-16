'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const navLinks = [
  { label: 'Cari Unit', href: '/#search' },
  { label: 'Cara Kerja', href: '/#how-it-works' },
  { label: 'Keamanan', href: '/#security' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          VENTURRA HOMES<span>//v4</span>
        </Link>

        <div className="nav-links">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Link href="/bookings" className="nav-link">
                Bookings
              </Link>
              {user.role === 'landlord' && (
                <Link href="/landlord" className="nav-link">
                  Panel Landlord
                </Link>
              )}
              <span className="muted mono" style={{ fontSize: 13 }}>
                {user.name}
              </span>
              <button className="btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Masuk
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: '9px 18px' }}>
                Daftar
              </Link>
            </>
          )}
        </div>

        <button className="nav-burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="nav-mobile">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="nav-mobile-link" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="nav-mobile-divider" />
          {user ? (
            <>
              <Link href="/bookings" className="nav-mobile-link" onClick={() => setOpen(false)}>
                Bookings Saya
              </Link>
              <button
                className="btn nav-mobile-link"
                style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', border: 'none', padding: 0 }}
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-mobile-link" onClick={() => setOpen(false)}>
                Masuk
              </Link>
              <Link href="/register" className="nav-mobile-link" onClick={() => setOpen(false)}>
                Daftar Akun
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
