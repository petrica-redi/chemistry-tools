'use client';
import dynamic from 'next/dynamic';
const VdWSimulator = dynamic(() => import('./VdWSimulator'), { ssr: false });
export default function VdWWrapper() { return <VdWSimulator />; }
