import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin-sidebar';

export const metadata: Metadata = {
  title: 'Venturra Homes Admin — Control Center',
  description: 'Venturra Homes Admin & Finance Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-main">
              <div className="container">{children}</div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
