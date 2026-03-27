import type { Metadata } from 'next';
import FIMWrapper from '@/components/fim/FIMWrapper';

export const metadata: Metadata = {
  title: 'FIM Tip Simulator',
  description: 'Advanced field ion microscopy tip simulator with 3D visualization.',
};

export default function FIMSimulatorPage() {
  return <FIMWrapper />;
}
