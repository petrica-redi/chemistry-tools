import type { Metadata } from 'next';
import FIMWrapper from '@/components/fim/FIMWrapper';

export const metadata: Metadata = {
  title: 'FIM Tip Simulator',
  description: 'Advanced field ion microscopy tip simulator with 3D visualization.',
};

export default async function FIMSimulatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  return (
    <FIMWrapper
      initialMatKey={sp.material}
      initialH={sp.h ? Number(sp.h) : undefined}
      initialK={sp.k ? Number(sp.k) : undefined}
      initialL={sp.l ? Number(sp.l) : undefined}
    />
  );
}
