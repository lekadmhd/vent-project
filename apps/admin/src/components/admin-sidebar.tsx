'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const links = [
  {
    href: '/',
    label: 'Dashboard',
    icon: 'M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v7h-7zM3 14h7v7H3z',
  },
  {
    href: '/finance',
    label: 'Finance Queue',
    icon: 'M2 7h20v10H2zM2 10h20M6 15h4',
  },
  {
    href: '/kyc',
    label: 'KYC Moderation',
    icon: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z',
  },
  {
    href: '/apartments',
    label: 'Apartments',
    icon: 'M3 21h18M5 21V6a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M13 21v-9h4a1 1 0 0 1 1 1v8M8 9h3M8 13h3',
  },
  {
    href: '/audit',
    label: 'Audit Logs',
    icon: 'M9 4h6v4H9zM9 4a2 2 0 0 0-2 2v14h10V6a2 2 0 0 0-2-2M12 11h4M12 15h4M8 11h1M8 15h1',
  },
];

function Icon({ d }: { d: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const menu = (
    <>
      <div className="sidebar-brand">
        <span className="brand">
          VENTURRA HOMES<span>//ADMIN</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`sidebar-link ${active ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon d={l.icon} />
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-user">
          <div style={{ fontWeight: 600, color: '#fff' }}>{user.name}</div>
          <div className="muted mono" style={{ fontSize: 11 }}>
            {user.role}
          </div>
        </div>
        <button className="nav-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="admin-topbar">
        <span className="brand">
          VENTURRA HOMES<span>//ADMIN</span>
        </span>
        <button className="nav-burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          <span />
          <span />
          <span />
        </button>
      </div>

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>{menu}</aside>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
    </>
  );
}
