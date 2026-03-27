'use client';
import dynamic from 'next/dynamic';

const VdWSimulator = dynamic(() => import('./VdWSimulator'), { ssr: false });

interface Props { initialGasId?: string; }

export default function VdWWrapper({ initialGasId }: Props) {
  return <VdWSimulator initialGasId={initialGasId} />;
}
