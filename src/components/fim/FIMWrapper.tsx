'use client';
import dynamic from 'next/dynamic';

const FIMSimulator = dynamic(() => import('./FIMSimulator'), { ssr: false });

interface Props {
  initialMatKey?: string;
  initialH?: number;
  initialK?: number;
  initialL?: number;
}

export default function FIMWrapper(props: Props) {
  return <FIMSimulator {...props} />;
}
