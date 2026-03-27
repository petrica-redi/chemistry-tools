'use client';
import dynamic from 'next/dynamic';
const FIMSimulator = dynamic(() => import('./FIMSimulator'), { ssr: false });
export default function FIMWrapper() { return <FIMSimulator />; }
