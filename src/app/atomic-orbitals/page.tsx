import type { Metadata } from 'next';
import OrbitalsWrapper from '@/components/orbitals/OrbitalsWrapper';

export const metadata: Metadata = {
  title: 'Atomic Orbitals',
  description: '3D atomic orbital visualization with point clouds, Clementi-Raimondi Zeff, and Klechkowski filling order.',
};

export default function AtomicOrbitalsPage() {
  return <OrbitalsWrapper />;
}
