import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

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
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
