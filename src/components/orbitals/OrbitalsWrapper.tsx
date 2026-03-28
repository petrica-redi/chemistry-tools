'use client';
import dynamic from 'next/dynamic';
import ToolPageHeader from '@/components/shared/ToolPageHeader';

const OrbitalsViewer = dynamic(() => import('./OrbitalsViewer'), { ssr: false });

interface Props { initialZ?: number; initialElement?: string; }

export default function OrbitalsWrapper({ initialZ, initialElement }: Props) {
  return (
    <>
      <ToolPageHeader toolId="orbitals" />
      <OrbitalsViewer initialZ={initialZ} initialElement={initialElement} />
    </>
  );
}
