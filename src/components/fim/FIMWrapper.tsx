'use client';
import dynamic from 'next/dynamic';
import ToolPageHeader from '@/components/shared/ToolPageHeader';

const FIMSimulator = dynamic(() => import('./FIMSimulator'), { ssr: false });

interface Props {
  initialMatKey?: string;
  initialH?: number;
  initialK?: number;
  initialL?: number;
}

export default function FIMWrapper(props: Props) {
  return (
    <>
      <ToolPageHeader toolId="fim" />
      <FIMSimulator {...props} />
    </>
  );
}
