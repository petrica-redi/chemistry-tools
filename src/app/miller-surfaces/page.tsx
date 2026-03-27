import type { Metadata } from 'next';
import MillerWrapper from '@/components/miller/MillerWrapper';

export const metadata: Metadata = {
  title: 'Miller Surface Viewer',
  description: 'Crystallographic Miller index surface viewer for FCC, BCC, and HCP lattices.',
};

export default async function MillerSurfacesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  return (
    <MillerWrapper
      initialH={sp.h ? Number(sp.h) : undefined}
      initialK={sp.k ? Number(sp.k) : undefined}
      initialL={sp.l ? Number(sp.l) : undefined}
      initialLattice={sp.lattice}
      initialElement={sp.element}
    />
  );
}
