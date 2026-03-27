export const a0 = 52.9177; // Bohr radius in pm
export const PM = 1 / 100; // pm to internal units

export const ELEMENTS = ["","H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca","Sc","Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn","Ga","Ge","As","Se","Br","Kr","Rb","Sr","Y","Zr","Nb","Mo","Tc","Ru","Rh","Pd","Ag","Cd","In","Sn","Sb","Te","I","Xe","Cs","Ba","La","Ce","Pr","Nd","Pm","Sm","Eu","Gd","Tb","Dy","Ho","Er","Tm","Yb","Lu","Hf","Ta","W","Re","Os","Ir","Pt","Au","Hg","Tl","Pb","Bi","Po","At","Rn","Fr","Ra","Ac","Th","Pa","U","Np","Pu","Am","Cm","Bk","Cf","Es","Fm","Md","No","Lr","Rf","Db","Sg","Bh","Hs","Mt","Ds","Rg","Cn","Nh","Fl","Mc","Lv","Ts","Og"];

const LNAME = 'spdf';
const FILL: [number, number][] = [[1,0],[2,0],[2,1],[3,0],[3,1],[4,0],[3,2],[4,1],[5,0],[4,2],[5,1],[6,0],[4,3],[5,2],[6,1],[7,0],[5,3],[6,2],[7,1]];
const MAXE: Record<number, number> = { 0: 2, 1: 6, 2: 10, 3: 14 };

// Clementi-Raimondi Zeff data (Z=1 to 36, key subset)
const CR_DATA: Record<number, Record<string, number>> = {
  1:{"1s":1.000},2:{"1s":1.688},3:{"1s":2.691,"2s":1.279},4:{"1s":3.685,"2s":1.912},
  5:{"1s":4.680,"2s":2.576,"2p":2.421},6:{"1s":5.673,"2s":3.217,"2p":3.136},
  7:{"1s":6.665,"2s":3.847,"2p":3.834},8:{"1s":7.658,"2s":4.492,"2p":4.453},
  9:{"1s":8.650,"2s":5.128,"2p":5.100},10:{"1s":9.642,"2s":5.758,"2p":5.758},
  11:{"1s":10.626,"2s":6.571,"2p":6.802,"3s":2.507},
  12:{"1s":11.609,"2s":7.392,"2p":7.826,"3s":3.308},
  13:{"1s":12.591,"2s":8.214,"2p":8.963,"3s":4.117,"3p":4.066},
  14:{"1s":13.575,"2s":9.020,"2p":9.945,"3s":4.903,"3p":4.285},
  15:{"1s":14.558,"2s":9.825,"2p":10.961,"3s":5.642,"3p":4.886},
  16:{"1s":15.541,"2s":10.629,"2p":11.977,"3s":6.367,"3p":5.482},
  17:{"1s":16.524,"2s":11.430,"2p":12.993,"3s":7.068,"3p":6.116},
  18:{"1s":17.508,"2s":12.230,"2p":14.008,"3s":7.757,"3p":6.764},
  19:{"1s":18.490,"2s":13.006,"2p":15.027,"3s":8.680,"3p":7.726,"4s":3.495},
  20:{"1s":19.473,"2s":13.776,"2p":16.041,"3s":9.602,"3p":8.658,"4s":4.398},
  21:{"1s":20.457,"2s":14.574,"2p":17.055,"3s":10.340,"3p":9.406,"4s":4.632,"3d":7.120},
  22:{"1s":21.441,"2s":15.377,"2p":18.065,"3s":11.033,"3p":10.104,"4s":4.817,"3d":8.141},
  23:{"1s":22.426,"2s":16.181,"2p":19.073,"3s":11.709,"3p":10.785,"4s":4.981,"3d":8.983},
  24:{"1s":23.414,"2s":16.984,"2p":20.075,"3s":12.368,"3p":11.466,"4s":5.133,"3d":9.757},
  25:{"1s":24.396,"2s":17.794,"2p":21.084,"3s":13.018,"3p":12.109,"4s":5.283,"3d":10.528},
  26:{"1s":25.381,"2s":18.599,"2p":22.089,"3s":13.676,"3p":12.778,"4s":5.434,"3d":11.180},
  27:{"1s":26.367,"2s":19.405,"2p":23.092,"3s":14.322,"3p":13.435,"4s":5.576,"3d":11.855},
  28:{"1s":27.353,"2s":20.213,"2p":24.095,"3s":14.961,"3p":14.085,"4s":5.711,"3d":12.530},
  29:{"1s":28.339,"2s":21.020,"2p":25.097,"3s":15.594,"3p":14.731,"4s":5.842,"3d":13.201},
  30:{"1s":29.325,"2s":21.828,"2p":26.098,"3s":16.219,"3p":15.369,"4s":5.965,"3d":13.878},
  31:{"1s":30.309,"2s":22.599,"2p":27.091,"3s":16.996,"3p":16.204,"4s":7.067,"3d":15.093,"4p":6.222},
  32:{"1s":31.294,"2s":23.365,"2p":28.082,"3s":17.790,"3p":17.014,"4s":8.044,"3d":16.251,"4p":6.780},
  33:{"1s":32.278,"2s":24.127,"2p":29.074,"3s":18.596,"3p":17.850,"4s":8.944,"3d":17.378,"4p":7.449},
  34:{"1s":33.262,"2s":24.888,"2p":30.065,"3s":19.403,"3p":18.705,"4s":9.758,"3d":18.477,"4p":8.287},
  35:{"1s":34.247,"2s":25.643,"2p":31.056,"3s":20.218,"3p":19.571,"4s":10.553,"3d":19.559,"4p":9.028},
  36:{"1s":35.232,"2s":26.398,"2p":32.047,"3s":21.033,"3p":20.434,"4s":11.316,"3d":20.626,"4p":9.769},
};

function sgrp(n: number, l: number): number { return l <= 1 ? n * 10 + 1 : n * 10 + l; }

function econf(Z: number): Record<string, number> {
  const c: Record<string, number> = {};
  let r = Z;
  for (const [n, l] of FILL) {
    if (r <= 0) break;
    const k = n + '_' + l;
    c[k] = Math.min(r, MAXE[l]);
    r -= c[k];
  }
  return c;
}

function zeffSlater(Z: number, n: number, l: number): number {
  if (Z <= 0) return 1;
  const cfg = { ...econf(Z) };
  const tg = sgrp(n, l);
  const targetKey = n + '_' + l;
  if (!cfg[targetKey] || cfg[targetKey] <= 0) cfg[targetKey] = 1;

  let s = 0;
  for (const [k, cnt] of Object.entries(cfg)) {
    const en = +k[0], el = +k[2], eg = sgrp(en, el);
    if (eg > tg) continue;
    if (eg === tg) {
      const self = (en === n && el === l) ? 1 : 0;
      s += (cnt - self) * (tg === 11 ? 0.30 : 0.35);
    } else if (l <= 1) {
      s += cnt * (eg >= (n - 1) * 10 ? 0.85 : 1);
    } else {
      s += cnt * 1;
    }
  }
  return Math.max(Z - s, 1);
}

export function zeff(Z: number, n: number, l: number): number {
  const sub = n + LNAME[l];
  if (CR_DATA[Z] && CR_DATA[Z][sub] !== undefined) return CR_DATA[Z][sub];
  return zeffSlater(Z, n, l);
}

export function electronConfig(Z: number): string {
  let r = Z;
  const parts: string[] = [];
  for (const [n, l] of FILL) {
    if (r <= 0) break;
    const e = Math.min(r, MAXE[l]);
    parts.push(`${n}${LNAME[l]}${e > 1 ? '⁰¹²³⁴⁵⁶⁷⁸⁹ˡ⁰¹²³⁴'[e] || e : ''}`);
    r -= e;
  }
  return parts.join(' ');
}

export function electronConfigHTML(Z: number): string {
  let r = Z;
  const parts: string[] = [];
  for (const [n, l] of FILL) {
    if (r <= 0) break;
    const e = Math.min(r, MAXE[l]);
    parts.push(`${n}${LNAME[l]}<sup>${e}</sup>`);
    r -= e;
  }
  return parts.join(' ');
}

export function getOccupiedSubs(Z: number): Record<string, number> {
  let r = Z;
  const map: Record<string, number> = {};
  for (const [n, l] of FILL) {
    if (r <= 0) break;
    const e = Math.min(r, MAXE[l]);
    map[n + LNAME[l]] = e;
    r -= e;
  }
  return map;
}

// Associated Laguerre polynomial
function lag(p: number, q: number, x: number): number {
  if (p === 0) return 1;
  if (p === 1) return 1 + q - x;
  let a = 1, b = 1 + q - x;
  for (let i = 2; i <= p; i++) {
    const c = ((2 * i - 1 + q - x) * b - (i - 1 + q) * a) / i;
    a = b; b = c;
  }
  return b;
}

function Rnl(n: number, l: number, r: number, Z: number): number {
  const rho = 2 * Z * r / (n * a0);
  return Math.exp(-rho / 2) * Math.pow(rho, l) * lag(n - l - 1, 2 * l + 1, rho);
}

function Ylm(l: number, m: number, th: number, ph: number): number {
  const ct = Math.cos(th), st = Math.sin(th);
  if (l === 0) return 1;
  if (l === 1) { if (m === 0) return ct; if (m === 1) return st * Math.cos(ph); return st * Math.sin(ph); }
  if (l === 2) {
    if (m === 0) return 3 * ct * ct - 1;
    if (m === 1) return st * ct * Math.cos(ph);
    if (m === -1) return st * ct * Math.sin(ph);
    if (m === 2) return st * st * Math.cos(2 * ph);
    return st * st * Math.sin(2 * ph);
  }
  if (l === 3) {
    if (m === 0) return ct * (5 * ct * ct - 3);
    if (m === 1) return st * (5 * ct * ct - 1) * Math.cos(ph);
    if (m === -1) return st * (5 * ct * ct - 1) * Math.sin(ph);
    if (m === 2) return st * st * ct * Math.cos(2 * ph);
    if (m === -2) return st * st * ct * Math.sin(2 * ph);
    if (m === 3) return st * st * st * Math.cos(3 * ph);
    return st * st * st * Math.sin(3 * ph);
  }
  return 0;
}

export function psi2(n: number, l: number, m: number, r: number, th: number, ph: number, Z: number): number {
  const v = Rnl(n, l, r, Z) * Ylm(l, m, th, ph);
  return v * v;
}

export function psi2Cart(n: number, l: number, m: number, x: number, y: number, z: number, Zeff: number): number {
  const r = Math.sqrt(x * x + y * y + z * z);
  if (r < 1e-12) return l === 0 ? psi2(n, 0, 0, 1e-6, 0, 0, Zeff) : 0;
  const th = Math.acos(Math.max(-1, Math.min(1, y / r)));
  const ph = Math.atan2(z, x);
  return psi2(n, l, m, r / PM, th, ph, Zeff);
}

const M_LABELS: Record<number, Record<number, string>> = {
  0: { 0: '' },
  1: { 0: 'z', 1: 'x', [-1]: 'y' },
  2: { 0: 'z²', 1: 'xz', [-1]: 'yz', 2: 'x²−y²', [-2]: 'xy' },
  3: { 0: 'z³', 1: 'xz²', [-1]: 'yz²', 2: 'z(x²−3y²)', [-2]: 'xyz', 3: 'x(x²−3y²)', [-3]: 'y(3x²−y²)' },
};

export interface OrbitalDef {
  n: number;
  l: number;
  m: number;
  label: string;
  sub: string;
  color: string;
  visible: boolean;
  opacity: number;
}

const SUB_COLORS: Record<string, string> = {
  '1s': '#4a9eff', '2s': '#38bdf8', '2p': '#34d399', '3s': '#818cf8', '3p': '#f472b6',
  '4s': '#facc15', '3d': '#fb923c', '4p': '#f87171', '5s': '#22d3ee', '4d': '#2dd4bf',
  '5p': '#a78bfa', '6s': '#e879f9', '4f': '#c084fc', '5d': '#f59e0b', '6p': '#6ee7b7',
  '7s': '#f9a8d4', '5f': '#93c5fd', '6d': '#fca5a5', '7p': '#86efac',
};

export function makeOrbitals(): OrbitalDef[] {
  const SUBS = [
    { n: 1, l: 0, label: '1s' }, { n: 2, l: 0, label: '2s' }, { n: 2, l: 1, label: '2p' },
    { n: 3, l: 0, label: '3s' }, { n: 3, l: 1, label: '3p' }, { n: 4, l: 0, label: '4s' },
    { n: 3, l: 2, label: '3d' }, { n: 4, l: 1, label: '4p' }, { n: 5, l: 0, label: '5s' },
    { n: 4, l: 2, label: '4d' }, { n: 5, l: 1, label: '5p' }, { n: 6, l: 0, label: '6s' },
    { n: 4, l: 3, label: '4f' }, { n: 5, l: 2, label: '5d' }, { n: 6, l: 1, label: '6p' },
    { n: 7, l: 0, label: '7s' }, { n: 5, l: 3, label: '5f' }, { n: 6, l: 2, label: '6d' },
    { n: 7, l: 1, label: '7p' },
  ];

  const out: OrbitalDef[] = [];
  for (const sub of SUBS) {
    const ord = [0];
    for (let i = 1; i <= sub.l; i++) { ord.push(i); ord.push(-i); }
    for (const m of ord) {
      const ml = M_LABELS[sub.l]?.[m] || '';
      out.push({
        n: sub.n, l: sub.l, m,
        label: sub.l === 0 ? sub.label : `${sub.label}_${ml}`,
        sub: sub.label,
        color: SUB_COLORS[sub.label] || '#ffffff',
        visible: false,
        opacity: 0.7,
      });
    }
  }
  return out;
}

const DENS = [2500, 6000, 12000, 20000, 32000];

export function genPointCloud(
  n: number, l: number, m: number, Z: number, densityLevel: number
): Float32Array {
  const num = DENS[Math.min(densityLevel, DENS.length - 1)];
  const rMax = (n * n * 2.5 + n * 4) * a0 / Z;
  let mx = 0;
  for (let i = 0; i < 50; i++) {
    const r = (0.5 + i) / 50 * rMax;
    for (let j = 0; j < 18; j++) {
      const th = (0.5 + j) / 18 * Math.PI;
      for (let k = 0; k < 18; k++) {
        const v = psi2(n, l, m, r, th, k / 18 * 2 * Math.PI, Z) * r * r;
        if (v > mx) mx = v;
      }
    }
  }
  if (!mx) mx = 1;
  const pos: number[] = [];
  let att = 0;
  while (pos.length < num * 3 && att < num * 120) {
    att++;
    const r = rMax * Math.cbrt(Math.random());
    const th = Math.acos(1 - 2 * Math.random());
    const ph = 2 * Math.PI * Math.random();
    if (Math.random() < psi2(n, l, m, r, th, ph, Z) * r * r / mx) {
      const st = Math.sin(th);
      pos.push(r * st * Math.cos(ph) * PM, r * Math.cos(th) * PM, r * st * Math.sin(ph) * PM);
    }
  }
  return new Float32Array(pos);
}
