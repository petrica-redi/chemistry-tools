import { Kw } from '@/lib/physics/constants';

export interface Species {
  id: string;
  name: string;
  formula: string;
  type: 'acid' | 'base';
  ka?: number[];
  kb?: number[];
  /** Conjugate Ka values (for bases derived from polyprotic acids) */
  cka?: number[];
  /** Number of protons the base can accept */
  np?: number;
  /** Strong electrolyte flag */
  strong?: boolean;
  /** Polyprotic flag */
  poly?: boolean;
  color: string;
}

export const DB: Species[] = [
  // Strong acids
  { id: 'hcl', name: 'Acide chlorhydrique', formula: 'HCl', type: 'acid', ka: [1e8], strong: true, color: '#ff4d6a' },
  { id: 'hno3', name: 'Acide nitrique', formula: 'HNO₃', type: 'acid', ka: [1e8], strong: true, color: '#ff7043' },
  { id: 'hbr', name: 'Acide bromhydrique', formula: 'HBr', type: 'acid', ka: [1e8], strong: true, color: '#ff8a65' },
  { id: 'hi', name: 'Acide iodhydrique', formula: 'HI', type: 'acid', ka: [1e8], strong: true, color: '#ef5350' },
  { id: 'hclo4', name: 'Acide perchlorique', formula: 'HClO₄', type: 'acid', ka: [1e8], strong: true, color: '#e53935' },

  // Weak monoprotic acids
  { id: 'ch3cooh', name: 'Acide acétique', formula: 'CH₃COOH', type: 'acid', ka: [1.8e-5], color: '#f0c040' },
  { id: 'hcooh', name: 'Acide formique', formula: 'HCOOH', type: 'acid', ka: [1.77e-4], color: '#8bc34a' },
  { id: 'hf', name: 'Acide fluorhydrique', formula: 'HF', type: 'acid', ka: [6.8e-4], color: '#26c6da' },
  { id: 'hcn', name: 'Acide cyanhydrique', formula: 'HCN', type: 'acid', ka: [6.2e-10], color: '#5c6bc0' },
  { id: 'c6h5cooh', name: 'Acide benzoïque', formula: 'C₆H₅COOH', type: 'acid', ka: [6.3e-5], color: '#ab47bc' },
  { id: 'hno2', name: 'Acide nitreux', formula: 'HNO₂', type: 'acid', ka: [4.5e-4], color: '#ec407a' },
  { id: 'hlac', name: 'Acide lactique', formula: 'CH₃CHOHCOOH', type: 'acid', ka: [1.38e-4], color: '#7cb342' },
  { id: 'hocl', name: 'Acide hypochloreux', formula: 'HOCl', type: 'acid', ka: [2.9e-8], color: '#00acc1' },
  { id: 'hclo2', name: 'Acide chloreux', formula: 'HClO₂', type: 'acid', ka: [1.1e-2], color: '#e91e63' },
  { id: 'c6h5oh', name: 'Phénol', formula: 'C₆H₅OH', type: 'acid', ka: [1.0e-10], color: '#8d6e63' },
  { id: 'hio3', name: 'Acide iodique', formula: 'HIO₃', type: 'acid', ka: [1.7e-1], color: '#ff6e40' },
  { id: 'ch3ch2cooh', name: 'Acide propanoïque', formula: 'CH₃CH₂COOH', type: 'acid', ka: [1.34e-5], color: '#aed581' },
  { id: 'ch2clcooh', name: 'Acide chloroacétique', formula: 'ClCH₂COOH', type: 'acid', ka: [1.4e-3], color: '#4dd0e1' },
  { id: 'chcl2cooh', name: 'Acide dichloroacétique', formula: 'Cl₂CHCOOH', type: 'acid', ka: [5.0e-2], color: '#4fc3f7' },
  { id: 'ccl3cooh', name: 'Acide trichloroacétique', formula: 'Cl₃CCOOH', type: 'acid', ka: [2.0e-1], color: '#29b6f6' },
  { id: 'c3h5o3', name: 'Acide pyruvique', formula: 'CH₃COCOOH', type: 'acid', ka: [3.2e-3], color: '#ce93d8' },
  { id: 'hcoo2h', name: 'Acide glycolique', formula: 'HOCH₂COOH', type: 'acid', ka: [1.5e-4], color: '#4db6ac' },
  { id: 'hc2h3o2f', name: 'Acide fluoroacétique', formula: 'FCH₂COOH', type: 'acid', ka: [2.6e-3], color: '#81d4fa' },
  { id: 'c4h5o5', name: 'Acide malique', formula: 'C₄H₆O₅', type: 'acid', ka: [3.9e-4], color: '#a5d6a7' },
  { id: 'c4h5o4', name: 'Acide succinique (1)', formula: 'C₄H₆O₄ (1)', type: 'acid', ka: [6.2e-5], color: '#c5e1a5' },
  { id: 'asc', name: 'Acide ascorbique (1)', formula: 'C₆H₈O₆ (1)', type: 'acid', ka: [7.9e-5], color: '#fff176' },
  { id: 'hf2', name: 'Acide nitrobenzoïque', formula: 'NO₂C₆H₄COOH', type: 'acid', ka: [6.1e-4], color: '#ffab91' },

  // Polyprotic acids
  { id: 'h2so4', name: 'Acide sulfurique', formula: 'H₂SO₄', type: 'acid', ka: [1e8, 1.2e-2], color: '#e53935', poly: true },
  { id: 'h3po4', name: 'Acide phosphorique', formula: 'H₃PO₄', type: 'acid', ka: [7.5e-3, 6.2e-8, 4.8e-13], color: '#00897b', poly: true },
  { id: 'h2co3', name: 'Acide carbonique', formula: 'H₂CO₃', type: 'acid', ka: [4.3e-7, 4.7e-11], color: '#1e88e5', poly: true },
  { id: 'h2c2o4', name: 'Acide oxalique', formula: 'H₂C₂O₄', type: 'acid', ka: [5.9e-2, 6.4e-5], color: '#8e24aa', poly: true },
  { id: 'h2so3', name: 'Acide sulfureux', formula: 'H₂SO₃', type: 'acid', ka: [1.5e-2, 6.3e-8], color: '#d81b60', poly: true },
  { id: 'h3cit', name: 'Acide citrique', formula: 'C₆H₈O₇', type: 'acid', ka: [7.4e-4, 1.7e-5, 4.0e-7], color: '#ff8f00', poly: true },
  { id: 'h2s', name: 'Acide sulfhydrique', formula: 'H₂S', type: 'acid', ka: [1.0e-7, 1.0e-14], color: '#6d4c41', poly: true },
  { id: 'h2se', name: 'Acide sélénhydrique', formula: 'H₂Se', type: 'acid', ka: [1.3e-4, 1.0e-11], color: '#795548', poly: true },
  { id: 'h2cro4', name: 'Acide chromique', formula: 'H₂CrO₄', type: 'acid', ka: [1.8e-1, 3.2e-7], color: '#ff7043', poly: true },
  { id: 'h4edta', name: 'EDTA (acide)', formula: 'H₄EDTA', type: 'acid', ka: [1.0e-2, 2.2e-3, 6.9e-7, 5.5e-11], color: '#5c6bc0', poly: true },
  { id: 'h2mal', name: 'Acide malonique', formula: 'CH₂(COOH)₂', type: 'acid', ka: [1.49e-3, 2.01e-6], color: '#66bb6a', poly: true },
  { id: 'h2tart', name: 'Acide tartrique', formula: 'C₄H₆O₆', type: 'acid', ka: [9.2e-4, 4.3e-5], color: '#ab47bc', poly: true },
  { id: 'h2succ', name: 'Acide succinique', formula: 'C₄H₆O₄', type: 'acid', ka: [6.2e-5, 2.3e-6], color: '#c0ca33', poly: true },
  { id: 'h2phthal', name: 'Acide phtalique', formula: 'C₈H₆O₄', type: 'acid', ka: [1.1e-3, 3.9e-6], color: '#7e57c2', poly: true },
  { id: 'h3asc', name: 'Acide ascorbique', formula: 'C₆H₈O₆', type: 'acid', ka: [7.9e-5, 1.6e-12], color: '#fdd835', poly: true },

  // Strong bases
  { id: 'naoh', name: 'Hydroxyde de sodium', formula: 'NaOH', type: 'base', cka: [Kw], np: 1, strong: true, color: '#42a5f5' },
  { id: 'koh', name: 'Hydroxyde de potassium', formula: 'KOH', type: 'base', cka: [Kw], np: 1, strong: true, color: '#7e57c2' },
  { id: 'lioh', name: 'Hydroxyde de lithium', formula: 'LiOH', type: 'base', cka: [Kw], np: 1, strong: true, color: '#5c6bc0' },
  { id: 'csoh', name: 'Hydroxyde de césium', formula: 'CsOH', type: 'base', cka: [Kw], np: 1, strong: true, color: '#3f51b5' },

  // Weak monoprotic bases
  { id: 'nh3', name: 'Ammoniac', formula: 'NH₃', type: 'base', kb: [1.8e-5], np: 1, color: '#29b6f6' },
  { id: 'ch3nh2', name: 'Méthylamine', formula: 'CH₃NH₂', type: 'base', kb: [4.4e-4], np: 1, color: '#26a69a' },
  { id: 'c2h5nh2', name: 'Éthylamine', formula: 'C₂H₅NH₂', type: 'base', kb: [5.6e-4], np: 1, color: '#66bb6a' },
  { id: 'c5h5n', name: 'Pyridine', formula: 'C₅H₅N', type: 'base', kb: [1.7e-9], np: 1, color: '#ba68c8' },
  { id: 'c6h5nh2', name: 'Aniline', formula: 'C₆H₅NH₂', type: 'base', kb: [4.3e-10], np: 1, color: '#ef5350' },
  { id: '(ch3)2nh', name: 'Diméthylamine', formula: '(CH₃)₂NH', type: 'base', kb: [5.4e-4], np: 1, color: '#009688' },
  { id: '(ch3)3n', name: 'Triméthylamine', formula: '(CH₃)₃N', type: 'base', kb: [6.3e-5], np: 1, color: '#00bcd4' },
  { id: 'morph', name: 'Morpholine', formula: 'C₄H₉NO', type: 'base', kb: [2.1e-6], np: 1, color: '#ff9800' },
  { id: 'pip', name: 'Pipéridine', formula: 'C₅H₁₁N', type: 'base', kb: [1.3e-3], np: 1, color: '#ff5722' },
  { id: 'imid', name: 'Imidazole', formula: 'C₃H₄N₂', type: 'base', kb: [1.1e-7], np: 1, color: '#e91e63' },
  { id: 'hydraz', name: 'Hydrazine', formula: 'N₂H₄', type: 'base', kb: [1.3e-6], np: 1, color: '#9c27b0' },
  { id: 'hydrox', name: 'Hydroxylamine', formula: 'NH₂OH', type: 'base', kb: [1.1e-8], np: 1, color: '#673ab7' },
  { id: '(c2h5)2nh', name: 'Diéthylamine', formula: '(C₂H₅)₂NH', type: 'base', kb: [1.3e-3], np: 1, color: '#00796b' },
  { id: '(c2h5)3n', name: 'Triéthylamine', formula: '(C₂H₅)₃N', type: 'base', kb: [5.6e-4], np: 1, color: '#0097a7' },

  // Polybases
  { id: 'na2co3', name: 'Carbonate de sodium', formula: 'Na₂CO₃', type: 'base', cka: [4.3e-7, 4.7e-11], np: 2, color: '#0288d1', poly: true },
  { id: 'na3po4', name: 'Phosphate de sodium', formula: 'Na₃PO₄', type: 'base', cka: [7.5e-3, 6.2e-8, 4.8e-13], np: 3, color: '#00897b', poly: true },
  { id: 'en', name: 'Éthylènediamine', formula: 'H₂N(CH₂)₂NH₂', type: 'base', kb: [8.5e-5, 2.7e-8], np: 2, color: '#7b1fa2', poly: true },
  { id: 'piper', name: 'Pipérazine', formula: 'C₄H₁₀N₂', type: 'base', kb: [4.7e-5, 3.1e-9], np: 2, color: '#c62828', poly: true },
  { id: 'dien', name: 'Diéthylènetriamine', formula: 'C₄H₁₃N₃', type: 'base', kb: [9.7e-5, 5.2e-8, 2.3e-12], np: 3, color: '#1565c0', poly: true },
  { id: 'na2s', name: 'Sulfure de sodium', formula: 'Na₂S', type: 'base', cka: [1.0e-7, 1.0e-14], np: 2, color: '#4e342e', poly: true },
  { id: 'na2c2o4', name: 'Oxalate de sodium', formula: 'Na₂C₂O₄', type: 'base', cka: [5.9e-2, 6.4e-5], np: 2, color: '#7b1fa2', poly: true },
];

export function getKas(s: Species): number[] {
  if (s.type === 'acid') return s.ka!;
  if (s.cka) return s.cka;
  return s.kb!.map((k) => Kw / k).reverse();
}

export function getPkas(s: Species): { label: string; value: number }[] {
  return getKas(s)
    .map((k, i, a) => ({
      label: a.length > 1 ? `pKa${i + 1}` : 'pKa',
      value: -Math.log10(k),
    }))
    .filter((p) => p.value > 0 && p.value < 14);
}

export function getTitrantCandidates(sub: Species): Species[] {
  return sub.type === 'acid'
    ? DB.filter((s) => s.type === 'base' && !s.poly)
    : DB.filter((s) => s.type === 'acid' && !s.poly);
}

export function getDefaultTitrant(sub: Species): string {
  return sub.type === 'acid' ? 'naoh' : 'hcl';
}
