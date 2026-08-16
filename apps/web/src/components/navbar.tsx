'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand">
          APTRENT<span>//v4</span>
        </Link>
        <div className="row">
          {user ? (
            <>
              <Link href="/bookings" className="btn">
                Bookings
              </Link>
              <span className="muted mono" style={{ fontSize: 13 }}>
                {user.name}
              </span>
              <button className="btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
