import { Kw } from '@/lib/physics/constants';
import { type Species, getKas, getPkas } from './AcidBaseDB';

export interface TitrationPoint {
  x: number; // volume of titrant (mL)
  y: number; // pH
}

export interface EquivalencePoint {
  v: number;
  pH: number;
  label: string;
}

export interface HalfEquivalencePoint {
  v: number;
  pH: number;
  pk: { label: string; value: number };
}

export interface TitrationResult {
  ph: TitrationPoint[];
  deriv: TitrationPoint[];
  eq: EquivalencePoint[];
  he: HalfEquivalencePoint[];
  Vmax: number;
  pka: { label: string; value: number }[];
}

/** Degree of ionization: sum of i * alpha_i */
function ionizationDegree(h: number, ka: number[]): number {
  const n = ka.length;
  const t = [Math.pow(h, n)];
  for (let i = 1; i <= n; i++) t[i] = (t[i - 1] * ka[i - 1]) / h;
  const D = t.reduce((a, b) => a + b, 0);
  if (!D || !isFinite(D)) return n / 2;
  let s = 0;
  for (let i = 1; i <= n; i++) s += (i * t[i]) / D;
  return s;
}

function titrantKaConj(ts: Species): number | null {
  if (ts.strong) return null;
  if (ts.type === 'base') {
    if (ts.kb) return Kw / ts.kb[0];
    if (ts.cka) return ts.cka[0];
    return null;
  }
  return ts.ka![0];
}

/** Charge balance for acid titrated by base */
function fAB(h: number, Ca: number, Cb: number, ka: number[], ts: Species): number {
  const OH = Kw / h;
  let tc: number;
  if (ts.strong) {
    tc = Cb;
  } else {
    const KC = titrantKaConj(ts)!;
    tc = (Cb * h) / (h + KC);
  }
  return h + tc - Ca * ionizationDegree(h, ka) - OH;
}

/** Charge balance for base titrated by acid */
function fBA(h: number, Cb2: number, Ca2: number, ka: number[], nP: number, ts: Species): number {
  const OH = Kw / h;
  let tc: number;
  if (ts.strong) {
    tc = Ca2;
  } else {
    const KT = ts.ka![0];
    tc = (Ca2 * KT) / (h + KT);
  }
  return h + Cb2 * (nP - ionizationDegree(h, ka)) - tc - OH;
}

function solve(
  fn: (h: number, ...args: unknown[]) => number,
  args: unknown[]
): number {
  let a = -0.5;
  let b = 15;
  const f = (p: number) => fn(Math.pow(10, -p), ...(args as [number, number, number[], Species]));
  const fa = f(a);
  const fb = f(b);
  if (!isFinite(fa) || !isFinite(fb) || fa * fb > 0) return 7;
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2;
    if (Math.abs(f(m)) < 1e-18 || b - a < 1e-12) return m;
    if (f(m) * f(a) > 0) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

export function calculate(
  sub: Species,
  tSub: Species,
  Ca: number,
  Va: number,
  Cb: number
): TitrationResult {
  const ka = getKas(sub);
  const n = ka.length;
  const nP = sub.np || n;
  const isA = sub.type === 'acid';
  const nEq = isA ? n : nP;

  const VeqL = (Ca * Va * nEq) / Cb;
  const Vmax = VeqL * 1.6 + 2;
  const N = 600;

  const ph: TitrationPoint[] = [];
  const deriv: TitrationPoint[] = [];
  const eq: EquivalencePoint[] = [];
  const he: HalfEquivalencePoint[] = [];

  // pH curve
  for (let i = 0; i <= N; i++) {
    const Vb = (i / N) * Vmax;
    const Vt = Va + Vb;
    const Ci = (Ca * Va) / Vt;
    const Ti = (Cb * Vb) / Vt;
    let p = isA
      ? solve(fAB as never, [Ci, Ti, ka, tSub])
      : solve(fBA as never, [Ci, Ti, ka, nP, tSub]);
    p = Math.max(-0.5, Math.min(15, p));
    ph.push({ x: +Vb.toFixed(3), y: +p.toFixed(3) });
  }

  // Derivative
  for (let i = 1; i < ph.length - 1; i++) {
    const dx = ph[i + 1].x - ph[i - 1].x;
    if (dx > 0) {
      deriv.push({
        x: ph[i].x,
        y: +((ph[i + 1].y - ph[i - 1].y) / dx).toFixed(3),
      });
    }
  }

  // Equivalence points
  for (let k = 1; k <= nEq; k++) {
    const Ve = (Ca * Va * k) / Cb;
    const Vt = Va + Ve;
    const Ci = (Ca * Va) / Vt;
    const Ti = (Cb * Ve) / Vt;
    const pe = isA
      ? solve(fAB as never, [Ci, Ti, ka, tSub])
      : solve(fBA as never, [Ci, Ti, ka, nP, tSub]);
    eq.push({
      v: +Ve.toFixed(2),
      pH: +pe.toFixed(2),
      label: nEq > 1 ? `Eq.${k}` : 'Eq.',
    });
  }

  // Half-equivalence points
  const pk = getPkas(sub);
  if (isA) {
    for (let i = 0; i < eq.length && i < pk.length; i++) {
      if (pk[i].value > 0 && pk[i].value < 14) {
        const pv = i === 0 ? 0 : eq[i - 1].v;
        const hv = (pv + eq[i].v) / 2;
        const Vt2 = Va + hv;
        const Ci2 = (Ca * Va) / Vt2;
        const Ti2 = (Cb * hv) / Vt2;
        const phHe = solve(fAB as never, [Ci2, Ti2, ka, tSub]);
        he.push({ v: +hv.toFixed(2), pk: pk[i], pH: +phHe.toFixed(2) });
      }
    }
  } else {
    for (let i = 0; i < eq.length; i++) {
      const pv = i === 0 ? 0 : eq[i - 1].v;
      const hv = (pv + eq[i].v) / 2;
      const Vt2 = Va + hv;
      const Ci2 = (Ca * Va) / Vt2;
      const Ti2 = (Cb * hv) / Vt2;
      const phHe = solve(fBA as never, [Ci2, Ti2, ka, nP, tSub]);
      const pkIdx = nP - 1 - i;
      const pki = pk[pkIdx] || { label: `½eq.${i + 1}`, value: phHe };
      he.push({ v: +hv.toFixed(2), pk: pki, pH: +phHe.toFixed(2) });
    }
  }

  return { ph, deriv, eq, he, Vmax, pka: pk };
}
