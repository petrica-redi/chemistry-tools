'use client';
import dynamic from 'next/dynamic';

const MillerViewer = dynamic(() => import('./MillerViewer'), { ssr: false });

interface Props {
  initialH?: number;
  initialK?: number;
  initialL?: number;
  initialLattice?: string;
  initialElement?: string;
}

export default function MillerWrapper(props: Props) {
  return <MillerViewer {...props} />;
}
