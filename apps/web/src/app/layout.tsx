import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import LiveChat from '@/components/live-chat';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-gf', display: 'swap' });

export const metadata: Metadata = {
  title: 'Venturra Homes — Platform Sewa Apartemen',
  description: 'Venturra Homes - Enterprise apartment rental platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container" style={{ paddingTop: 24, paddingBottom: 64 }}>
            {children}
          </main>
          <Footer />
          <LiveChat />
        </AuthProvider>
      </body>
    </html>
  );
}
