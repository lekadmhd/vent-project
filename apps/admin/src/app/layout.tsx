import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { AdminNavbar } from '@/components/admin-navbar';

export const metadata: Metadata = {
  title: 'AptRent Admin — Control Center',
  description: 'AptRent v4.0 Admin & Finance Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <AdminNavbar />
          <main className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
