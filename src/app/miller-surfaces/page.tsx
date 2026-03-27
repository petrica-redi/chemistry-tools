import type { Metadata } from 'next';
import MillerWrapper from '@/components/miller/MillerWrapper';

export const metadata: Metadata = {
  title: 'Miller Surface Viewer',
  description: 'Crystallographic Miller index surface viewer for FCC, BCC, and HCP lattices.',
};

export default function MillerSurfacesPage() {
  return <MillerWrapper />;
}
