'use client';
import dynamic from 'next/dynamic';
const CTKSimulator = dynamic(() => import('./CTKSimulator'), { ssr: false });
export default function CTKWrapper() { return <CTKSimulator />; }
