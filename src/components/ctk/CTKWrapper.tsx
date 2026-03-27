'use client';
import dynamic from 'next/dynamic';

const CTKSimulator = dynamic(() => import('./CTKSimulator'), { ssr: false });

interface Props { initialGasA?: string; }

export default function CTKWrapper({ initialGasA }: Props) {
  return <CTKSimulator initialGasA={initialGasA} />;
}
