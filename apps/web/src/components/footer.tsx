import Link from 'next/link';

const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Cari Apartemen', href: '/#search' },
      { label: 'Cara Booking', href: '/#how-it-works' },
      { label: 'Keamanan Dana', href: '/#security' },
      { label: 'Registrasi', href: '/register' },
    ],
  },
  {
    title: 'Akun',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Bookings Saya', href: '/bookings' },
      { label: 'Admin Panel', href: 'https://admin.piraku.net' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              VENTURRA HOMES
            </div>
            <p className="footer-about">
              Platform sewa unit apartemen enterprise dengan escrow berlapis, enkripsi data
              berstandar AES-256, dan verifikasi pembayaran manual oleh Finance Admin.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href} className="footer-link">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Venturra Homes — Enterprise Apartment Marketplace</span>
          <span className="mono">ENCRYPTED · ZERO-TRUST · VERIFIED</span>
        </div>
      </div>
    </footer>
  );
}
