'use client';
import dynamic from 'next/dynamic';
import ToolPageHeader from '@/components/shared/ToolPageHeader';

const TitrationSimulator = dynamic(() => import('./TitrationSimulator'), { ssr: false });

export default function TitrationWrapper() {
  return (
    <>
      <ToolPageHeader toolId="titration" />
      <TitrationSimulator />
    </>
  );
}
