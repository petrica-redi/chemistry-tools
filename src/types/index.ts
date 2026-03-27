export interface Tool {
  id: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  gradient: string;
  icon: string;
  tags: string[];
}

export const TOOLS: Tool[] = [
  {
    id: 'fim',
    name: 'FIM Tip Simulator',
    shortName: 'FIM',
    description: 'Advanced field ion microscopy simulator. Model hemisphere-on-cone tips for different lattices, compute local electric fields, generate stereographic projections and simulated micrographs.',
    href: '/fim-simulator',
    gradient: 'from-blue-500 to-cyan-400',
    icon: '🔬',
    tags: ['Three.js', 'FCC/BCC/HCP', 'Wulff'],
  },
  {
    id: 'ctk',
    name: 'CTK Simulator',
    shortName: 'CTK',
    description: 'Chemical Transient Kinetics simulator. Model gas switching experiments with a CSTR reactor, visualize MS signals, and explore 3D reactor flow with particle tracking.',
    href: '/ctk-simulator',
    gradient: 'from-green-500 to-emerald-400',
    icon: '⚗️',
    tags: ['Chart.js', 'Three.js', 'CSTR'],
  },
  {
    id: 'orbitals',
    name: 'Atomic Orbitals',
    shortName: 'Orbitals',
    description: 'Visualize atomic orbital shapes, sizes, and periodic trends in 3D. Point cloud and isosurface rendering modes with Clementi-Raimondi effective nuclear charges.',
    href: '/atomic-orbitals',
    gradient: 'from-violet-500 to-purple-400',
    icon: '⚛️',
    tags: ['Three.js', 'Quantum', '1s→7p'],
  },
  {
    id: 'titration',
    name: 'Acid-Base Titration',
    shortName: 'Titration',
    description: 'Simulate titration curves for 40+ acid-base couples including polyacids and polybases. Visualize equivalence points, buffer zones, and Henderson-Hasselbalch regions.',
    href: '/titration',
    gradient: 'from-pink-500 to-rose-400',
    icon: '🧪',
    tags: ['Chart.js', 'Polyacids', 'HH zones'],
  },
  {
    id: 'miller',
    name: 'Miller Surface Viewer',
    shortName: 'Miller',
    description: 'Display crystallographic (hkl) facets for FCC, BCC, and HCP lattices. Interactive 3D visualization of Miller index planes cutting through crystal structures.',
    href: '/miller-surfaces',
    gradient: 'from-amber-500 to-yellow-400',
    icon: '💎',
    tags: ['Three.js', 'FCC/BCC/HCP', 'hkl'],
  },
  {
    id: 'vdw',
    name: 'VdW Explorer',
    shortName: 'VdW',
    description: 'Explore Van der Waals real gas behavior. Plot P-V isotherms with Maxwell construction, binodal/spinodal curves, and 3D P-V-T hypersurfaces for 18 gases.',
    href: '/vdw-explorer',
    gradient: 'from-orange-500 to-red-400',
    icon: '🌡️',
    tags: ['Plotly', 'Thermodynamics', '3D'],
  },
];
