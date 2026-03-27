import { MAT, LAT, WULFF_GAMMA, type Material, type LatticeConfig } from './FIMData';

/* ================================================================
   MATH UTILITIES
   ================================================================ */
function rv(m: number[], x: number, y: number, z: number): [number, number, number] {
  return [
    m[0]*x + m[1]*y + m[2]*z,
    m[3]*x + m[4]*y + m[5]*z,
    m[6]*x + m[7]*y + m[8]*z,
  ];
}

function mm3(a: number[], b: number[]): number[] {
  return [
    a[0]*b[0]+a[1]*b[3]+a[2]*b[6], a[0]*b[1]+a[1]*b[4]+a[2]*b[7], a[0]*b[2]+a[1]*b[5]+a[2]*b[8],
    a[3]*b[0]+a[4]*b[3]+a[5]*b[6], a[3]*b[1]+a[4]*b[4]+a[5]*b[7], a[3]*b[2]+a[4]*b[5]+a[5]*b[8],
    a[6]*b[0]+a[7]*b[3]+a[8]*b[6], a[6]*b[1]+a[7]*b[4]+a[8]*b[7], a[6]*b[2]+a[7]*b[5]+a[8]*b[8],
  ];
}

function mt3(m: number[]): number[] {
  return [m[0],m[3],m[6], m[1],m[4],m[7], m[2],m[5],m[8]];
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

function gcd3(a: number, b: number, c: number): number {
  return gcd(gcd(Math.abs(a), Math.abs(b)), Math.abs(c));
}

function hexToRGB(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/* ================================================================
   CRYSTAL DIRECTIONS
   ================================================================ */
let crystAxes = [Math.SQRT2, Math.SQRT2, Math.SQRT2];

export function updateCrystAxes(mat: Material) {
  const cfg = LAT[mat.lat];
  crystAxes = cfg.getAxes(mat);
}

export function poleDir(h: number, k: number, l: number): [number, number, number] {
  const nx = h / crystAxes[0], ny = k / crystAxes[1], nz = l / crystAxes[2];
  const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
  return len > 1e-12 ? [nx/len, ny/len, nz/len] : [0, 0, 1];
}

export function zoneDir(u: number, v: number, w: number): [number, number, number] {
  const dx = u * crystAxes[0], dy = v * crystAxes[1], dz = w * crystAxes[2];
  const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
  return len > 1e-12 ? [dx/len, dy/len, dz/len] : [0, 0, 1];
}

export function buildCrystalRM(h: number, k: number, l: number): number[] {
  const [nx, ny, nz] = poleDir(h, k, l);
  if (Math.abs(nx) < 1e-9 && Math.abs(ny) < 1e-9 && Math.abs(nz) < 1e-9) return [1,0,0, 0,1,0, 0,0,1];
  if (nz > 0.9999) return [1,0,0, 0,1,0, 0,0,1];
  if (nz < -0.9999) return [1,0,0, 0,-1,0, 0,0,-1];
  const axLen = Math.sqrt(nx*nx + ny*ny);
  const ux = ny / axLen, uy = -nx / axLen;
  const angle = Math.acos(Math.max(-1, Math.min(1, nz)));
  const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
  return [
    t*ux*ux+c, t*ux*uy, s*uy,
    t*ux*uy, t*uy*uy+c, -s*ux,
    -s*uy, s*ux, c,
  ];
}

/* ================================================================
   POLE GENERATION
   ================================================================ */
export interface Pole {
  h: number; k: number; l: number;
  lb: string;
  isMain: boolean;
}

export function millerLabel(h: number, k: number, l: number): string {
  const f = (v: number) => v < 0 ? Math.abs(v) + '\u0305' : '' + v;
  return '(' + f(h) + f(k) + f(l) + ')';
}

export function generatePoles(cfg: LatticeConfig, maxIdx: number): Pole[] {
  function canon(h: number, k: number, l: number): [number, number, number] {
    if (h !== 0) return h > 0 ? [h, k, l] : [-h, -k, -l];
    if (k !== 0) return k > 0 ? [h, k, l] : [-h, -k, -l];
    if (l !== 0) return l > 0 ? [h, k, l] : [-h, -k, -l];
    return [0, 0, 0];
  }

  const mainSet = new Set<string>();
  const isCubic = cfg !== LAT.HCP;
  for (const m of cfg.mainHKL) {
    const vals = [m[0], m[1], m[2]];
    const perms = isCubic
      ? [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]
      : [[0,1,2]];
    for (const p of perms) {
      const a = vals[p[0]], b = vals[p[1]], c = vals[p[2]];
      for (const sa of [-1, 1]) for (const sb of [-1, 1]) for (const sc of [-1, 1]) {
        const [ch, ck, cl] = canon(sa*a, sb*b, sc*c);
        if (ch === 0 && ck === 0 && cl === 0) continue;
        mainSet.add(ch + ',' + ck + ',' + cl);
      }
    }
  }

  const seen = new Set<string>();
  const poles: Pole[] = [];
  for (let h = -maxIdx; h <= maxIdx; h++)
    for (let k = -maxIdx; k <= maxIdx; k++)
      for (let l = -maxIdx; l <= maxIdx; l++) {
        if (h === 0 && k === 0 && l === 0) continue;
        if (h*h + k*k + l*l > maxIdx*maxIdx + 1) continue;
        if (gcd3(h, k, l) !== 1) continue;
        const [ch, ck, cl] = canon(h, k, l);
        const key = ch + ',' + ck + ',' + cl;
        if (seen.has(key)) continue;
        seen.add(key);
        const isMain = mainSet.has(key);
        poles.push({ h: ch, k: ck, l: cl, lb: millerLabel(ch, ck, cl), isMain });
      }
  return poles;
}

/* ================================================================
   WULFF CONSTRUCTION
   ================================================================ */
interface WulffFacet { n: [number, number, number]; gamma: number; }

function expandWulffFamily(hkl: number[], gamma: number, isCubic: boolean): WulffFacet[] {
  const result: WulffFacet[] = [];
  const seen = new Set<string>();
  const [h, k, l] = hkl;
  const perms = isCubic
    ? [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]
    : [[0,1,2]];
  const vals = [h, k, l];
  for (const p of perms) {
    const a = vals[p[0]], b = vals[p[1]], c = vals[p[2]];
    for (const sa of [-1, 1]) for (const sb of [-1, 1]) for (const sc of [-1, 1]) {
      const nh = sa*a, nk = sb*b, nl = sc*c;
      if (nh === 0 && nk === 0 && nl === 0) continue;
      const d = poleDir(nh, nk, nl);
      const key = d.map(v => v.toFixed(6)).join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ n: d, gamma });
    }
  }
  return result;
}

function getWulffFacets(latType: string): WulffFacet[] {
  const families = WULFF_GAMMA[latType] || WULFF_GAMMA.FCC;
  const isCubic = latType !== 'HCP';
  let all: WulffFacet[] = [];
  for (const f of families) {
    all = all.concat(expandWulffFamily(f.hkl, f.gamma, isCubic));
  }
  return all;
}

function wulffDist(nx: number, ny: number, nz: number, facets: WulffFacet[]): number {
  let hMin = 1e12;
  for (let i = 0; i < facets.length; i++) {
    const f = facets[i];
    const dot = nx * f.n[0] + ny * f.n[1] + nz * f.n[2];
    if (dot > 0.0005) {
      const h = f.gamma / dot;
      if (h < hMin) hMin = h;
    }
  }
  return hMin;
}

/* ================================================================
   TIP GENERATION — spherical cap + straight cone
   ================================================================ */
export function generateAtoms(
  latType: string, matKey: string, apexR: number, shankDeg: number,
  shankLenMul: number, crystRM: number[], wulffFrac: number
): Float64Array {
  const cfg = LAT[latType];
  const mat = MAT[matKey];
  const axes = cfg.getAxes(mat);
  const ax = axes[0], ay = axes[1], az = axes[2];
  const a = Math.max(ax, ay, az);
  const R = apexR;
  const sRad = shankDeg * Math.PI / 180;
  const tanA = Math.tan(sRad);
  const sinA = Math.sin(sRad);
  const dT = R * (1 - sinA);
  const rT = R * Math.cos(sRad);
  const zApex = R;
  const sLen = R * shankLenMul;
  const shell = 4 * a;
  const solidDepth = R * 1.5;
  const shellTrans = R * 0.5;

  const wF = wulffFrac;
  let wFacets: WulffFacet[] | null = null;
  let wNorm = 1;
  const cRMt = mt3(crystRM);
  if (wF > 0) {
    wFacets = getWulffFacets(latType);
    const aCx = cRMt[2], aCy = cRMt[5], aCz = cRMt[8];
    const aLen = Math.sqrt(aCx*aCx + aCy*aCy + aCz*aCz) || 1;
    wNorm = wulffDist(aCx/aLen, aCy/aLen, aCz/aLen, wFacets);
  }

  const rMax_bottom = sLen <= dT
    ? Math.sqrt(Math.max(0, 2*R*sLen - sLen*sLen))
    : rT + (sLen - dT) * tanA;
  const labR = rMax_bottom + a;
  const labZlo = zApex - sLen - a;
  const labZhi = zApex + a;
  const corners = [
    [-labR, -labR, labZlo], [labR, -labR, labZlo],
    [-labR, labR, labZlo], [labR, labR, labZlo],
    [-labR, -labR, labZhi], [labR, -labR, labZhi],
    [-labR, labR, labZhi], [labR, labR, labZhi],
  ];
  let cxMn = Infinity, cxMx = -Infinity;
  let cyMn = Infinity, cyMx = -Infinity;
  let czMn = Infinity, czMx = -Infinity;
  for (const [cx, cy, cz] of corners) {
    const [rx, ry, rz] = rv(cRMt, cx, cy, cz);
    if (rx < cxMn) cxMn = rx; if (rx > cxMx) cxMx = rx;
    if (ry < cyMn) cyMn = ry; if (ry > cyMx) cyMx = ry;
    if (rz < czMn) czMn = rz; if (rz > czMx) czMx = rz;
  }
  const iMin = Math.floor(cxMn / a) - 1, iMax = Math.ceil(cxMx / a) + 1;
  const jMin = Math.floor(cyMn / a) - 1, jMax = Math.ceil(cyMx / a) + 1;
  const kMin = Math.floor(czMn / a) - 1, kMax = Math.ceil(czMx / a) + 1;

  const buf: number[] = [];
  const blendZone = dT * 0.3;
  for (let i = iMin; i <= iMax; i++)
    for (let j = jMin; j <= jMax; j++)
      for (let k = kMin; k <= kMax; k++)
        for (const b of cfg.basis) {
          const cx = (i + b[0]) * ax, cy = (j + b[1]) * ay, cz = (k + b[2]) * az;
          const [x, y, z] = rv(crystRM, cx, cy, cz);
          const d = zApex - z;
          if (d < -0.01 || d > sLen + 0.01) continue;
          const rxy2 = x*x + y*y;
          const rxy = Math.sqrt(rxy2);
          const dc = Math.max(0, Math.min(sLen, d));
          const rOuter = dc <= dT
            ? Math.sqrt(Math.max(0, 2*R*dc - dc*dc))
            : rT + (dc - dT) * tanA;
          if (rxy > rOuter) continue;

          if (wF > 0 && wFacets && dc <= dT) {
            const dist2 = x*x + y*y + z*z;
            if (dist2 > 0.01) {
              const invD = 1 / Math.sqrt(dist2);
              const cnx = cRMt[0]*x*invD + cRMt[1]*y*invD + cRMt[2]*z*invD;
              const cny = cRMt[3]*x*invD + cRMt[4]*y*invD + cRMt[5]*z*invD;
              const cnz = cRMt[6]*x*invD + cRMt[7]*y*invD + cRMt[8]*z*invD;
              const rW = wulffDist(cnx, cny, cnz, wFacets);
              const rW_norm = R * rW / wNorm;
              let localW = wF;
              if (dc > dT - blendZone) localW *= Math.max(0, (dT - dc) / blendZone);
              const rEff = (1 - localW) * R + localW * rW_norm;
              if (Math.sqrt(dist2) > rEff) continue;
            }
          }

          if (dc <= solidDepth) {
            buf.push(x, y, z);
          } else if (dc <= solidDepth + shellTrans) {
            const f = (dc - solidDepth) / shellTrans;
            const fS = f * f * (3 - 2 * f);
            const rInner = fS * Math.max(0, rOuter - shell);
            if (rxy >= rInner) buf.push(x, y, z);
          } else {
            if (rxy >= Math.max(0, rOuter - shell)) buf.push(x, y, z);
          }
        }
  return new Float64Array(buf);
}

/* ================================================================
   COORDINATION — spatial hash O(N)
   ================================================================ */
export function computeCoord(flat: Float64Array, latType: string): Int32Array {
  const cfg = LAT[latType];
  const n = flat.length / 3;
  const cut = cfg.nn, cSq = cut * cut, cs = cut;
  const h = new Map<string, number[]>();
  for (let i = 0; i < n; i++) {
    const x = i * 3;
    const k = Math.floor(flat[x] / cs) + ',' + Math.floor(flat[x+1] / cs) + ',' + Math.floor(flat[x+2] / cs);
    let a = h.get(k);
    if (!a) { a = []; h.set(k, a); }
    a.push(i);
  }
  const out = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i * 3;
    const ax = flat[x], ay = flat[x+1], az = flat[x+2];
    const cx = Math.floor(ax / cs), cy = Math.floor(ay / cs), cz = Math.floor(az / cs);
    let cnt = 0;
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          const cl = h.get((cx+dx) + ',' + (cy+dy) + ',' + (cz+dz));
          if (!cl) continue;
          for (let ci = 0; ci < cl.length; ci++) {
            const j = cl[ci];
            if (j === i) continue;
            const jx = j * 3;
            const dd = ax - flat[jx], de = ay - flat[jx+1], df = az - flat[jx+2];
            if (dd*dd + de*de + df*df < cSq) cnt++;
          }
        }
    out[i] = cnt;
  }
  return out;
}

/* ================================================================
   ELECTRIC FIELD COMPUTATION
   ================================================================ */
export function computeFields(
  atoms: Float64Array, coords: Int32Array, latType: string, matKey: string,
  apexR: number, shankDeg: number, voltage: number, alpha: number,
  probeHeight: number, fieldExp: number, screenDist: number
): Float64Array {
  const cfg = LAT[latType];
  const mat = MAT[matKey];
  const dA = cfg.dnn(mat.a);
  const dnm = dA / 10;
  const Rnm = apexR * dnm;
  const ra = dnm / 2;
  const n = atoms.length / 3;
  const fields = new Float64Array(n);

  const KF_eff = Math.log(2 * screenDist / Rnm + 1);
  const E_apex = voltage / (KF_eff * Rnm);

  const R = apexR;
  const sRad = shankDeg * Math.PI / 180;
  const sinA = Math.sin(sRad);
  const dT = R * (1 - sinA);
  const zApex = R;
  const pd = probeHeight * dnm;

  for (let i = 0; i < n; i++) {
    if (coords[i] >= cfg.bc) { fields[i] = 0; continue; }
    const x = i * 3;
    const az = atoms[x + 2];
    const d = zApex - az;
    if (d < 0) { fields[i] = 0; continue; }

    const cosTheta = d <= dT ? Math.max(0, (R - d) / R) : sinA;
    let E_pos = E_apex * Math.pow(Math.max(0.001, (1 + cosTheta) / 2), fieldExp);
    if (d > R) E_pos *= Math.exp(-(d - R) / (3 * R));

    const beta = 1 + alpha * (cfg.bc - coords[i]) / cfg.bc;
    const ratio = ra / (ra + pd);
    fields[i] = E_pos * beta * ratio * ratio;
  }
  return fields;
}

/* ================================================================
   COLORMAPS
   ================================================================ */
export type ColormapName = 'jet' | 'green' | 'hot' | 'viridis' | 'plasma' | 'inferno' | 'coolwarm' | 'turbo' | 'cividis' | 'custom';

export function getColor(t: number, cm: ColormapName, customLow?: string, customHigh?: string): [number, number, number] {
  t = Math.max(0, Math.min(1, t));
  switch (cm) {
    case 'green':
      return [Math.round(t*t*40), Math.round(t*255), Math.round(t*t*40)];
    case 'hot':
      return [
        Math.round(Math.min(1, t*3)*255),
        Math.round(Math.max(0, Math.min(1, (t-0.33)*3))*255),
        Math.round(Math.max(0, Math.min(1, (t-0.67)*3))*255),
      ];
    case 'viridis': {
      const r = Math.round((0.267 + t*(0.993*t - 0.426))*255);
      const g = Math.round((0.004 + t*(1.52 - 0.58*t))*255);
      const b = Math.round((0.329 + t*(0.42 - 1.68*t + 1.32*t*t))*255);
      return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
    }
    case 'plasma': {
      const r = Math.round((0.050 + t*(2.74 - t*1.99))*255);
      const g = Math.round((0.030 + t*t*(2.83 - t*2.17))*255);
      const b = Math.round((0.530 + t*(0.76 - t*2.94 + t*t*2.56))*255);
      return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
    }
    case 'inferno': {
      const r = Math.round(Math.min(255, (0.002 + t*(1.23 + t*(3.03 - t*3.61)))*255));
      const g = Math.round(Math.max(0, Math.min(255, (0.001 + t*t*(2.47 - t*1.70))*255)));
      const b = Math.round(Math.max(0, Math.min(255, (0.014 + t*(1.68 - t*4.03 + t*t*3.39))*255)));
      return [r, g, b];
    }
    case 'coolwarm': {
      if (t < 0.5) {
        const s = t * 2;
        return [Math.round((0.23 + s*0.77)*255), Math.round((0.30 + s*0.70)*255), Math.round((0.75 + s*0.25)*255)];
      } else {
        const s = (t - 0.5) * 2;
        return [255, Math.round((1.0 - s*0.72)*255), Math.round((1.0 - s*0.77)*255)];
      }
    }
    case 'turbo': {
      const r = Math.round(Math.max(0, Math.min(255, (0.13 + t*(10.05 - t*(42.4 - t*(77.2 - t*51.0))))*255)));
      const g = Math.round(Math.max(0, Math.min(255, (0.09 + t*(4.95 - t*(12.7 - t*10.6)))*0.98*255)));
      const b = Math.round(Math.max(0, Math.min(255, (0.11 + t*(8.73 - t*(33.2 - t*(38.4 - t*14.0))))*255)));
      return [r, g, b];
    }
    case 'cividis': {
      // Cividis colormap optimized for color blindness
      const r = Math.round((0.127 + t*(3.50 - t*(2.90 - t*1.42)))*255);
      const g = Math.round((0.080 + t*(1.52 - t*(1.01 - t*0.29)))*255);
      const b = Math.round((0.233 + t*(1.68 - t*(1.87 - t*0.94)))*255);
      return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
    }
    case 'custom': {
      // Blend between custom low and high colors
      const low = customLow ? hexToRGB(customLow) : [0, 0, 255];
      const high = customHigh ? hexToRGB(customHigh) : [255, 0, 0];
      const r = Math.round(low[0] + t * (high[0] - low[0]));
      const g = Math.round(low[1] + t * (high[1] - low[1]));
      const b = Math.round(low[2] + t * (high[2] - low[2]));
      return [r, g, b];
    }
    default: {
      const r = Math.min(1, Math.max(0, 1.5 - Math.abs(t - 0.75)*4));
      const g = Math.min(1, Math.max(0, 1.5 - Math.abs(t - 0.5)*4));
      const b = Math.min(1, Math.max(0, 1.5 - Math.abs(t - 0.25)*4));
      return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
    }
  }
}

/* ================================================================
   QUATERNION
   ================================================================ */
export class Q {
  w: number; x: number; y: number; z: number;
  constructor(w = 1, x = 0, y = 0, z = 0) { this.w = w; this.x = x; this.y = y; this.z = z; }
  mul(q: Q): Q {
    return new Q(
      this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z,
      this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y,
      this.w*q.y - this.x*q.z + this.y*q.w + this.z*q.x,
      this.w*q.z + this.x*q.y - this.y*q.x + this.z*q.w,
    );
  }
  norm(): Q {
    const l = Math.sqrt(this.w*this.w + this.x*this.x + this.y*this.y + this.z*this.z) || 1;
    return new Q(this.w/l, this.x/l, this.y/l, this.z/l);
  }
  mat(): number[] {
    const { w, x, y, z } = this;
    return [
      1-2*(y*y+z*z), 2*(x*y-w*z), 2*(x*z+w*y),
      2*(x*y+w*z), 1-2*(x*x+z*z), 2*(y*z-w*x),
      2*(x*z-w*y), 2*(y*z+w*x), 1-2*(x*x+y*y),
    ];
  }
  static ax(ax: number, ay: number, az: number, a: number): Q {
    const s = Math.sin(a/2), c = Math.cos(a/2);
    const l = Math.sqrt(ax*ax + ay*ay + az*az) || 1;
    return new Q(c, ax/l*s, ay/l*s, az/l*s);
  }
}

/* ================================================================
   RENDERING HELPERS
   ================================================================ */
export { rv, mm3, mt3 };

export function renderTip3D(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  atoms: Float64Array, coords: Int32Array, fields: Float64Array,
  latType: string, apexR: number, shankDeg: number, shankLenMul: number,
  viewRM: number[], zoom: number, panX: number, panY: number,
  colormap: ColormapName, threshold: number, showDim: boolean,
  bulkOpacity: number, bulkColor: string,
  lightAz: number, lightEl: number, ambientFrac: number, atomSizePct: number,
  selfRotDeg: number,
  millerMode: 'off' | 'main' | 'all', miller3dFont: number,
  showStereo: boolean, stereoSize: number, stereoFont: number,
  showZones: boolean, zoneLineW: number,
  greyscale?: boolean, bgColor?: string, customCmapLow?: string, customCmapHigh?: string,
) {
  const cfg = LAT[latType];
  const n = atoms.length / 3;
  const cxS = W / 2 + panX, cyS = H / 2 + panY;
  const totalExtent = Math.max(apexR * 2, apexR * (1 + shankLenMul)) * 1.3;
  const fov = Math.min(W, H) * zoom / totalExtent;

  ctx.fillStyle = bgColor || '#060a12';
  ctx.fillRect(0, 0, W, H);

  let Emin = 1e9, Emax = -1e9;
  for (let i = 0; i < n; i++) {
    if (coords[i] >= cfg.bc) continue;
    if (fields[i] > 0) {
      if (fields[i] < Emin) Emin = fields[i];
      if (fields[i] > Emax) Emax = fields[i];
    }
  }
  if (Emin >= Emax) { Emin = 0; Emax = 1; }
  const Erange = Emax - Emin || 1;

  const _azRad = lightAz * Math.PI / 180;
  const _elRad = lightEl * Math.PI / 180;
  const _lightDir = [
    Math.cos(_elRad) * Math.sin(_azRad),
    Math.cos(_elRad) * Math.cos(_azRad),
    Math.sin(_elRad),
  ];
  const atomR = fov * 0.5 * (atomSizePct / 100);

  // Apply self-rotation around tip axis (z)
  const srRad = selfRotDeg * Math.PI / 180;
  const csr = Math.cos(srRad), ssr = Math.sin(srRad);
  const selfRM = [csr, -ssr, 0, ssr, csr, 0, 0, 0, 1];
  const combinedRM = mm3(viewRM, selfRM);

  interface Pt { sx: number; sy: number; depth: number; light: number; sz: number; c: number; El: number; isSurf: boolean; }
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const x = i * 3;
    const c = coords[i];
    const isSurf = c < cfg.bc;
    if (!isSurf && !showDim) continue;
    const [rx, ry, rz] = rv(combinedRM, atoms[x], atoms[x+1], atoms[x+2]);
    const projX = cxS + rx * fov, projY = cyS - ry * fov;
    if (projX < -60 || projX > W + 60 || projY < -60 || projY > H + 60) continue;
    const r2 = Math.sqrt(rx*rx + ry*ry + rz*rz) || 1;
    const dot = Math.max(0, (rx*_lightDir[0] + ry*_lightDir[1] + rz*_lightDir[2]) / r2);
    const light = ambientFrac + (1 - ambientFrac) * dot;
    pts.push({ sx: projX, sy: projY, depth: rz, light, sz: Math.max(0.8, atomR), c, El: fields[i], isSurf });
  }

  pts.sort((a, b) => a.depth - b.depth);

  // Parse bulk color
  const bulkRGB = hexToRGB(bulkColor);
  const bulkAlpha = bulkOpacity / 100;

  for (const a of pts) {
    if (!a.isSurf) {
      const brt = a.light;
      let br, bg, bb;
      br = Math.round(bulkRGB[0] * brt);
      bg = Math.round(bulkRGB[1] * brt);
      bb = Math.round(bulkRGB[2] * brt);
      ctx.globalAlpha = bulkAlpha;
      ctx.fillStyle = `rgb(${br},${bg},${bb})`;
      ctx.beginPath(); ctx.arc(a.sx, a.sy, a.sz, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      continue;
    }

    const t = (a.El - Emin) / Erange;
    let [cr, cg, cb] = getColor(t, colormap, customCmapLow, customCmapHigh);
    // Apply greyscale filter
    if (greyscale) {
      const grey = Math.round(0.299*cr + 0.587*cg + 0.114*cb);
      cr = cg = cb = grey;
    }
    const lr = Math.round(cr * a.light);
    const lg = Math.round(cg * a.light);
    const lb = Math.round(cb * a.light);

    if (atomR > 3.5 && a.sz > 1.5) {
      const gOff = a.sz * 0.25;
      const grd = ctx.createRadialGradient(
        a.sx - gOff * _lightDir[0], a.sy + gOff * _lightDir[1], 0,
        a.sx, a.sy, a.sz,
      );
      grd.addColorStop(0, `rgb(${Math.min(255, lr+80)},${Math.min(255, lg+80)},${Math.min(255, lb+80)})`);
      grd.addColorStop(0.45, `rgb(${lr},${lg},${lb})`);
      grd.addColorStop(1, `rgb(${lr>>1},${lg>>1},${lb>>1})`);
      ctx.fillStyle = grd;
    } else {
      ctx.fillStyle = `rgb(${lr},${lg},${lb})`;
    }
    ctx.beginPath(); ctx.arc(a.sx, a.sy, a.sz, 0, Math.PI * 2); ctx.fill();
  }

  // Miller indices (placeholder - would need crystal rotation matrix)
  if (millerMode !== 'off') {
    // Implementation would go here - requires crystal orientation data
  }

  // Stereographic projection (placeholder)
  if (showStereo) {
    // Implementation would go here
  }
}

export function renderMicrograph(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  atoms: Float64Array, coords: Int32Array, fields: Float64Array,
  latType: string, apexR: number, projN: number, apertureDeg: number,
  brightness: number, contrast: number, spotScale: number,
  spotSoftness?: number, fieldThreshold?: number, negativeImage?: boolean,
  phosphorColor?: 'green' | 'blue' | 'white' | 'amber' | 'custom', phosphorCustom?: string,
  gammaR?: number, gammaG?: number, gammaB?: number,
  microOpacity?: number,
  microMillerMode?: 'off' | 'main' | 'all', microMillerFont?: number, microMillerDots?: boolean,
) {
  const cfg = LAT[latType];
  const n = atoms.length / 3;
  const R = apexR;
  const zApex = R;
  const apertureRad = apertureDeg * Math.PI / 180;
  const Cz = zApex - projN * R;

  let Emin = 1e9, Emax = -1e9;
  for (let i = 0; i < n; i++) {
    if (coords[i] >= cfg.bc) continue;
    if (fields[i] > 0) {
      if (fields[i] < Emin) Emin = fields[i];
      if (fields[i] > Emax) Emax = fields[i];
    }
  }
  if (Emin >= Emax) { Emin = 0; Emax = 1; }
  const Erange = Emax - Emin;

  const projected: { px: number; py: number; t: number }[] = [];
  let maxPD = 0;
  for (let i = 0; i < n; i++) {
    if (coords[i] >= cfg.bc) continue;
    const x = i * 3;
    const ax = atoms[x], ay = atoms[x+1], az = atoms[x+2];
    const d = zApex - az;
    if (d < 0) continue;
    const rxy = Math.sqrt(ax*ax + ay*ay);
    const theta = Math.atan2(rxy, R - d);
    if (theta > apertureRad) continue;
    const t = Math.max(0, Math.min(1, (fields[i] - Emin) / Erange));
    if (t < 0.05) continue;

    const denom = az - Cz;
    if (Math.abs(denom) < 0.001) continue;
    const param = -Cz / denom;
    if (param < 0) continue;
    const px = ax * param;
    const py = ay * param;
    const pd = Math.sqrt(px*px + py*py);
    if (pd > maxPD) maxPD = pd;
    projected.push({ px, py, t });
  }
  if (projected.length === 0) return;

  const rAp = R * Math.sin(apertureRad);
  const zApRel = -(R * (1 - Math.cos(apertureRad)));
  const denomAp = zApRel - (-projN * R);
  const maxProjR0 = denomAp > 0.001 ? rAp * projN * R / denomAp : 1;
  const maxProjR = Math.max(maxProjR0, maxPD * 0.95);

  const mgR = Math.min(W, H) * 0.45;
  const mgCx = W / 2, mgCy = H / 2;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.beginPath();
  ctx.arc(mgCx, mgCy, mgR + 2, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,120,80,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(mgCx, mgCy, mgR, 0, Math.PI * 2);
  ctx.clip();

  const baseSpotR = Math.max(1.5, mgR * 0.018 * spotScale);

  for (const p of projected) {
    const sx = mgCx + p.px / maxProjR * mgR * 0.92;
    const sy = mgCy - p.py / maxProjR * mgR * 0.92;
    const dr = Math.sqrt((sx - mgCx)**2 + (sy - mgCy)**2);
    if (dr > mgR - 1) continue;

    let intensity = p.t;
    intensity = Math.pow(intensity, 1 / contrast) * brightness;
    intensity = Math.max(0, Math.min(3.0, intensity));
    const sr = baseSpotR * (0.7 + 0.6 * intensity);
    const a = Math.min(1, intensity);
    const ir = Math.min(255, Math.round(100 * a));
    const ig = Math.min(255, Math.round(255 * a));
    const ib = Math.min(255, Math.round(100 * a));

    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    grad.addColorStop(0, `rgba(${ir},${ig},${ib},${a.toFixed(3)})`);
    grad.addColorStop(0.3, `rgba(${ir},${ig},${ib},${(a*0.6).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${ir},${ig},${ib},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
  }

  ctx.restore();
}
