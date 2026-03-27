'use client';
import dynamic from 'next/dynamic';
const TitrationSimulator = dynamic(() => import('./TitrationSimulator'), { ssr: false });
export default function TitrationWrapper() { return <TitrationSimulator />; }
