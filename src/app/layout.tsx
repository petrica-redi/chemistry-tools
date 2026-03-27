import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Chemistry Tools',
    default: 'Chemistry Tools — Scientific Simulation Platform',
  },
  description:
    'Interactive scientific simulation tools for chemistry research and teaching: FIM microscopy, chemical kinetics, atomic orbitals, titration, crystallography, and thermodynamics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`} style={{ colorScheme: 'dark' }}>
      <body className="flex h-screen overflow-hidden antialiased" style={{ background: 'var(--color-bg-primary)', fontFamily: 'var(--font-sans)' }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto scroll-smooth" style={{ background: 'var(--color-bg-primary)' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
