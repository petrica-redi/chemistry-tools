'use client';
import dynamic from 'next/dynamic';
const OrbitalsViewer = dynamic(() => import('./OrbitalsViewer'), { ssr: false });
export default function OrbitalsWrapper() { return <OrbitalsViewer />; }
