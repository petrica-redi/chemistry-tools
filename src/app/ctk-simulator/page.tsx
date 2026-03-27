import type { Metadata } from 'next';
import CTKWrapper from '@/components/ctk/CTKWrapper';

export const metadata: Metadata = {
  title: 'CTK Simulator',
  description: 'Chemical Transient Kinetics gas switching simulator with tanks-in-series model.',
};

export default function CTKSimulatorPage() {
  return <CTKWrapper />;
}
