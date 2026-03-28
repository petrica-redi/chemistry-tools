'use client';
import dynamic from 'next/dynamic';
import ToolPageHeader from '@/components/shared/ToolPageHeader';

const VdWSimulator = dynamic(() => import('./VdWSimulator'), { ssr: false });

interface Props { initialGasId?: string; }

export default function VdWWrapper({ initialGasId }: Props) {
  return (
    <>
      <ToolPageHeader toolId="vdw" />
      <VdWSimulator initialGasId={initialGasId} />
    </>
  );
}
