export interface Material {
  n: string;
  lat: 'FCC' | 'BCC' | 'HCP';
  a: number;
  ca?: number;
  BIF: number;
}

export const MAT: Record<string, Material> = {
  Sc: { n: 'Scandium', lat: 'HCP', a: 3.309, ca: 1.594, BIF: 18 },
  Ti: { n: 'Titanium', lat: 'HCP', a: 2.951, ca: 1.588, BIF: 26 },
  V:  { n: 'Vanadium', lat: 'BCC', a: 3.024, BIF: 30 },
  Cr: { n: 'Chromium', lat: 'BCC', a: 2.884, BIF: 29 },
  Fe: { n: 'Iron', lat: 'BCC', a: 2.866, BIF: 33 },
  Co: { n: 'Cobalt', lat: 'HCP', a: 2.507, ca: 1.623, BIF: 36 },
  Ni: { n: 'Nickel', lat: 'FCC', a: 3.524, BIF: 35 },
  Cu: { n: 'Copper', lat: 'FCC', a: 3.615, BIF: 30 },
  Zn: { n: 'Zinc', lat: 'HCP', a: 2.665, ca: 1.856, BIF: 23 },
  Zr: { n: 'Zirconium', lat: 'HCP', a: 3.232, ca: 1.593, BIF: 28 },
  Nb: { n: 'Niobium', lat: 'BCC', a: 3.300, BIF: 35 },
  Mo: { n: 'Molybdenum', lat: 'BCC', a: 3.147, BIF: 45 },
  Ru: { n: 'Ruthenium', lat: 'HCP', a: 2.706, ca: 1.582, BIF: 44 },
  Rh: { n: 'Rhodium', lat: 'FCC', a: 3.803, BIF: 47 },
  Pd: { n: 'Palladium', lat: 'FCC', a: 3.890, BIF: 37 },
  Ag: { n: 'Silver', lat: 'FCC', a: 4.086, BIF: 24 },
  Hf: { n: 'Hafnium', lat: 'HCP', a: 3.195, ca: 1.581, BIF: 32 },
  Ta: { n: 'Tantalum', lat: 'BCC', a: 3.303, BIF: 45 },
  W:  { n: 'Tungsten', lat: 'BCC', a: 3.165, BIF: 57 },
  Re: { n: 'Rhenium', lat: 'HCP', a: 2.761, ca: 1.614, BIF: 50 },
  Os: { n: 'Osmium', lat: 'HCP', a: 2.735, ca: 1.579, BIF: 57 },
  Ir: { n: 'Iridium', lat: 'FCC', a: 3.839, BIF: 53 },
  Pt: { n: 'Platinum', lat: 'FCC', a: 3.924, BIF: 44 },
  Au: { n: 'Gold', lat: 'FCC', a: 4.078, BIF: 35 },
};

export interface LatticeConfig {
  bc: number;
  basis: number[][];
  nn: number;
  dt: number;
  dnn: (a: number) => number;
  getAxes: (m?: Material) => number[];
  mainHKL: number[][];
}

export const LAT: Record<string, LatticeConfig> = {
  FCC: {
    bc: 12, basis: [[0,0,0],[.5,.5,0],[.5,0,.5],[0,.5,.5]], nn: 1.08, dt: 8,
    dnn: (a) => a / Math.SQRT2,
    getAxes: () => { const af = Math.SQRT2; return [af, af, af]; },
    mainHKL: [[0,0,1],[0,1,1],[1,0,1],[1,1,1],[0,1,2],[1,0,2],[1,1,3],[1,1,2],[1,0,3],[0,1,3],[2,1,1],[1,2,1],[3,1,1],[1,3,1]],
  },
  BCC: {
    bc: 8, basis: [[0,0,0],[.5,.5,.5]], nn: 1.08, dt: 5,
    dnn: (a) => a * Math.sqrt(3) / 2,
    getAxes: () => { const af = 2 / Math.sqrt(3); return [af, af, af]; },
    mainHKL: [[0,0,1],[0,1,1],[1,0,1],[1,1,1],[0,1,2],[1,0,2],[1,1,2],[1,1,3],[2,1,1],[1,2,1]],
  },
  HCP: {
    bc: 12, basis: [[0,0,0],[.5,.5,0],[.5,1/6,.5],[0,2/3,.5]], nn: 1.08, dt: 8,
    dnn: (a) => a,
    getAxes: (m) => [1, Math.sqrt(3), m && m.ca ? m.ca : 1.633],
    mainHKL: [[0,0,1],[1,0,0],[0,1,0],[1,1,0],[1,0,1],[0,1,1],[1,0,2],[0,1,2],[1,1,1],[2,0,1],[0,2,1],[1,1,2]],
  },
};

export const WULFF_GAMMA: Record<string, { hkl: number[]; gamma: number }[]> = {
  FCC: [
    { hkl: [1,1,1], gamma: 1.00 },
    { hkl: [1,0,0], gamma: 1.15 },
    { hkl: [1,1,0], gamma: 1.12 },
    { hkl: [2,1,0], gamma: 1.20 },
    { hkl: [2,1,1], gamma: 1.10 },
    { hkl: [3,1,1], gamma: 1.14 },
  ],
  BCC: [
    { hkl: [1,1,0], gamma: 1.00 },
    { hkl: [1,0,0], gamma: 1.14 },
    { hkl: [1,1,1], gamma: 1.12 },
    { hkl: [2,1,0], gamma: 1.10 },
    { hkl: [2,1,1], gamma: 1.08 },
  ],
  HCP: [
    { hkl: [0,0,1], gamma: 1.00 },
    { hkl: [1,0,0], gamma: 1.10 },
    { hkl: [1,0,1], gamma: 1.05 },
    { hkl: [1,1,0], gamma: 1.12 },
  ],
};
