'use client';
import dynamic from 'next/dynamic';
const MillerViewer = dynamic(() => import('./MillerViewer'), { ssr: false });
export default function MillerWrapper() { return <MillerViewer />; }
