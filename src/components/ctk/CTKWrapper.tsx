'use client';
import dynamic from 'next/dynamic';
import ToolPageHeader from '@/components/shared/ToolPageHeader';

const CTKSimulator = dynamic(() => import('./CTKSimulator'), { ssr: false });

interface Props { initialGasA?: string; }

export default function CTKWrapper({ initialGasA }: Props) {
  return (
    <>
      <ToolPageHeader toolId="ctk" />
      <CTKSimulator initialGasA={initialGasA} />
    </>
  );
}
