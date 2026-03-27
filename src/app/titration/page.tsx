import type { Metadata } from 'next';
import TitrationWrapper from '@/components/titration/TitrationWrapper';

export const metadata: Metadata = {
  title: 'Acid-Base Titration Simulator',
  description: 'Simulate titration curves for 40+ acid-base couples with polyacids, polybases, and Henderson-Hasselbalch buffer zones.',
};

export default function TitrationPage() {
  return <TitrationWrapper />;
}
