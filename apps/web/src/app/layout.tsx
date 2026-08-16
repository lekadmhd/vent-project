import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'AptRent — Platform Sewa Apartemen',
  description: 'AptRent v4.0 - Enterprise apartment rental platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
