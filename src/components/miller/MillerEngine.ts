import * as THREE from 'three';

export interface ElementData {
  name: string;
  lattice: string;
  a: number;
  c?: number;
  color: string;
}

export const ELEMENTS_DB: Record<string, ElementData> = {
  Al: { name: 'Aluminium', lattice: 'FCC', a: 4.05, color: '#C0C0C0' },
  Ag: { name: 'Silver', lattice: 'FCC', a: 4.09, color: '#C0C0C0' },
  Au: { name: 'Gold', lattice: 'FCC', a: 4.08, color: '#FFD700' },
  Cu: { name: 'Copper', lattice: 'FCC', a: 3.61, color: '#B87333' },
  Ni: { name: 'Nickel', lattice: 'FCC', a: 3.52, color: '#8C92AC' },
  Pb: { name: 'Lead', lattice: 'FCC', a: 4.95, color: '#767676' },
  Pd: { name: 'Palladium', lattice: 'FCC', a: 3.89, color: '#B0B0B0' },
  Pt: { name: 'Platinum', lattice: 'FCC', a: 3.92, color: '#E5E4E2' },
  Rh: { name: 'Rhodium', lattice: 'FCC', a: 3.80, color: '#A8A8A8' },
  Ir: { name: 'Iridium', lattice: 'FCC', a: 3.84, color: '#BEBEBE' },
  Cr: { name: 'Chromium', lattice: 'BCC', a: 2.88, color: '#8C92AC' },
  Fe: { name: 'Iron', lattice: 'BCC', a: 2.87, color: '#696969' },
  W: { name: 'Tungsten', lattice: 'BCC', a: 3.16, color: '#767676' },
  Mo: { name: 'Molybdenum', lattice: 'BCC', a: 3.15, color: '#696969' },
  V: { name: 'Vanadium', lattice: 'BCC', a: 3.03, color: '#A8A8A8' },
  Nb: { name: 'Niobium', lattice: 'BCC', a: 3.30, color: '#8C92AC' },
  Ta: { name: 'Tantalum', lattice: 'BCC', a: 3.31, color: '#A0A0A0' },
  Ba: { name: 'Barium', lattice: 'BCC', a: 5.02, color: '#D3D3D3' },
  K: { name: 'Potassium', lattice: 'BCC', a: 5.23, color: '#E0E0E0' },
  Na: { name: 'Sodium', lattice: 'BCC', a: 4.29, color: '#D0D0D0' },
  Li: { name: 'Lithium', lattice: 'BCC', a: 3.51, color: '#C0C0C0' },
  Mg: { name: 'Magnesium', lattice: 'HCP', a: 3.21, c: 5.21, color: '#8C92AC' },
  Zn: { name: 'Zinc', lattice: 'HCP', a: 2.66, c: 4.95, color: '#7C7C7C' },
  Ti: { name: 'Titanium', lattice: 'HCP', a: 2.95, c: 4.68, color: '#8C92AC' },
  Zr: { name: 'Zirconium', lattice: 'HCP', a: 3.23, c: 5.15, color: '#A8A8A8' },
  Co: { name: 'Cobalt', lattice: 'HCP', a: 2.51, c: 4.07, color: '#6B6B6B' },
  Cd: { name: 'Cadmium', lattice: 'HCP', a: 2.98, c: 5.62, color: '#A0A0A0' },
  Be: { name: 'Beryllium', lattice: 'HCP', a: 2.29, c: 3.58, color: '#C0C0C0' },
  Re: { name: 'Rhenium', lattice: 'HCP', a: 2.76, c: 4.46, color: '#8C92AC' },
};

export type LatticeType = 'SC' | 'BCC' | 'FCC' | 'HCP';

export function generateLatticePositions(
  type: LatticeType, sizeX: number, sizeY: number, sizeZ: number, caRatio = 1.633
): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  const a = 1.0;

  const range = (n: number) => {
    const r: number[] = [];
    for (let i = -n; i <= n; i++) r.push(i);
    return r;
  };

  if (type === 'SC') {
    for (const x of range(sizeX)) for (const y of range(sizeY)) for (const z of range(sizeZ))
      positions.push(new THREE.Vector3(x * a, y * a, z * a));
  }

  if (type === 'BCC') {
    for (const x of range(sizeX)) for (const y of range(sizeY)) for (const z of range(sizeZ)) {
      positions.push(new THREE.Vector3(x * a, y * a, z * a));
      positions.push(new THREE.Vector3((x + 0.5) * a, (y + 0.5) * a, (z + 0.5) * a));
    }
  }

  if (type === 'FCC') {
    for (const x of range(sizeX)) for (const y of range(sizeY)) for (const z of range(sizeZ)) {
      positions.push(new THREE.Vector3(x * a, y * a, z * a));
      positions.push(new THREE.Vector3((x + 0.5) * a, (y + 0.5) * a, z * a));
      positions.push(new THREE.Vector3((x + 0.5) * a, y * a, (z + 0.5) * a));
      positions.push(new THREE.Vector3(x * a, (y + 0.5) * a, (z + 0.5) * a));
    }
  }

  if (type === 'HCP') {
    const c = caRatio;
    for (const x of range(sizeX)) for (const y of range(sizeY)) for (const z of range(sizeZ)) {
      positions.push(new THREE.Vector3(x * a + y * a * 0.5, y * a * Math.sqrt(3) / 2, z * c));
      positions.push(new THREE.Vector3(
        (x + 1 / 3) * a + (y + 1 / 3) * a * 0.5,
        (y + 1 / 3) * a * Math.sqrt(3) / 2,
        (z + 0.5) * c
      ));
    }
  }

  return positions;
}

export function computePlaneNormal(h: number, k: number, l: number): THREE.Vector3 {
  return new THREE.Vector3(h, k, l).normalize();
}

export function getPlaneD(h: number, k: number, l: number): number {
  const normal = new THREE.Vector3(h, k, l);
  const len = normal.length();
  if (len === 0) return 0;
  return len;
}

export function atomDistToPlane(pos: THREE.Vector3, h: number, k: number, l: number): number {
  const normal = new THREE.Vector3(h, k, l);
  const len = normal.length();
  if (len === 0) return 0;
  return pos.dot(normal) / len;
}

export function nearestNeighborDist(type: LatticeType): number {
  switch (type) {
    case 'SC': return 1.0;
    case 'BCC': return Math.sqrt(3) / 2;
    case 'FCC': return Math.sqrt(2) / 2;
    case 'HCP': return 1.0;
    default: return 1.0;
  }
}
