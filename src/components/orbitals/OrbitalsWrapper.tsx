'use client';
import dynamic from 'next/dynamic';

const OrbitalsViewer = dynamic(() => import('./OrbitalsViewer'), { ssr: false });

interface Props { initialZ?: number; initialElement?: string; }

export default function OrbitalsWrapper({ initialZ, initialElement }: Props) {
  return <OrbitalsViewer initialZ={initialZ} initialElement={initialElement} />;
}
