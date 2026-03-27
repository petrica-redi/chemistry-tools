import type { Metadata } from 'next';
import VdWWrapper from '@/components/vdw/VdWWrapper';

export const metadata: Metadata = {
  title: 'VdW Explorer',
  description: 'Van der Waals real gas P-V-T explorer with 2D isotherms and 3D surfaces for 18 gases.',
};

export default function VdWExplorerPage() {
  return <VdWWrapper />;
}
