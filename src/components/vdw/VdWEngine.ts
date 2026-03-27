const R = 0.082057;

export interface Gas {
  id: string;
  name: string;
  formula: string;
  a: number;
  b: number;
  Tc: number;
  Pc: number;
  Tt: number;
  Pt: number;
  cat: string;
}

export const GAS_DB: Gas[] = [
  { id: 'co2', formula: 'CO₂', name: 'Dioxyde de carbone', a: 3.592, b: 0.04267, Tc: 304.2, Pc: 72.8, Tt: 216.55, Pt: 5.11, cat: 'Industrial' },
  { id: 'h2o', formula: 'H₂O', name: 'Eau', a: 5.536, b: 0.03049, Tc: 647.1, Pc: 217.7, Tt: 273.16, Pt: 0.006, cat: 'Common' },
  { id: 'n2', formula: 'N₂', name: 'Diazote', a: 1.390, b: 0.03913, Tc: 126.2, Pc: 33.5, Tt: 63.18, Pt: 0.124, cat: 'Atmospheric' },
  { id: 'o2', formula: 'O₂', name: 'Dioxygène', a: 1.360, b: 0.03183, Tc: 154.6, Pc: 50.4, Tt: 54.36, Pt: 0.0015, cat: 'Atmospheric' },
  { id: 'ar', formula: 'Ar', name: 'Argon', a: 1.345, b: 0.03219, Tc: 150.9, Pc: 48.0, Tt: 83.80, Pt: 0.68, cat: 'Noble gas' },
  { id: 'ch4', formula: 'CH₄', name: 'Méthane', a: 2.283, b: 0.04278, Tc: 190.6, Pc: 45.4, Tt: 90.69, Pt: 0.117, cat: 'Hydrocarbon' },
  { id: 'c2h6', formula: 'C₂H₆', name: 'Éthane', a: 5.562, b: 0.06380, Tc: 305.3, Pc: 48.2, Tt: 90.35, Pt: 0.000011, cat: 'Hydrocarbon' },
  { id: 'c3h8', formula: 'C₃H₈', name: 'Propane', a: 8.779, b: 0.08445, Tc: 369.8, Pc: 41.9, Tt: 85.47, Pt: 1.7e-7, cat: 'Hydrocarbon' },
  { id: 'nh3', formula: 'NH₃', name: 'Ammoniac', a: 4.170, b: 0.03707, Tc: 405.5, Pc: 111.3, Tt: 195.40, Pt: 0.060, cat: 'Industrial' },
  { id: 'h2', formula: 'H₂', name: 'Dihydrogène', a: 0.2476, b: 0.02661, Tc: 33.2, Pc: 12.8, Tt: 13.84, Pt: 0.069, cat: 'Light' },
  { id: 'he', formula: 'He', name: 'Hélium', a: 0.03457, b: 0.02370, Tc: 5.19, Pc: 2.27, Tt: 2.17, Pt: 0.050, cat: 'Noble gas' },
  { id: 'ne', formula: 'Ne', name: 'Néon', a: 0.2107, b: 0.01709, Tc: 44.4, Pc: 26.5, Tt: 24.57, Pt: 0.426, cat: 'Noble gas' },
  { id: 'kr', formula: 'Kr', name: 'Krypton', a: 2.318, b: 0.03978, Tc: 209.4, Pc: 54.3, Tt: 115.78, Pt: 0.73, cat: 'Noble gas' },
  { id: 'xe', formula: 'Xe', name: 'Xénon', a: 4.194, b: 0.05105, Tc: 289.7, Pc: 57.6, Tt: 161.36, Pt: 0.81, cat: 'Noble gas' },
  { id: 'cl2', formula: 'Cl₂', name: 'Dichlore', a: 6.579, b: 0.05622, Tc: 417.0, Pc: 76.1, Tt: 172.12, Pt: 0.014, cat: 'Halogen' },
  { id: 'so2', formula: 'SO₂', name: 'Dioxyde de soufre', a: 6.714, b: 0.05636, Tc: 430.8, Pc: 77.8, Tt: 197.69, Pt: 0.0017, cat: 'Industrial' },
  { id: 'co', formula: 'CO', name: 'Monoxyde de carbone', a: 1.485, b: 0.03985, Tc: 132.9, Pc: 34.5, Tt: 68.13, Pt: 0.154, cat: 'Industrial' },
  { id: 'c2h4', formula: 'C₂H₄', name: 'Éthylène', a: 4.612, b: 0.05821, Tc: 282.4, Pc: 50.4, Tt: 104.0, Pt: 0.0012, cat: 'Hydrocarbon' },
  { id: 'sf6', formula: 'SF₆', name: 'Hexafluorure de soufre', a: 7.857, b: 0.08786, Tc: 318.7, Pc: 37.1, Tt: 223.56, Pt: 2.26, cat: 'Industrial' },
];

export function vdwP(V: number, T: number, a: number, b: number): number {
  if (V <= b) return NaN;
  return R * T / (V - b) - a / (V * V);
}

function dPdV(V: number, T: number, a: number, b: number): number {
  if (V <= b) return NaN;
  return -R * T / ((V - b) * (V - b)) + 2 * a / (V * V * V);
}

interface Extrema { vMin: number | null; pMin: number | null; vMax: number | null; pMax: number | null }

function findExtrema(T: number, a: number, b: number): Extrema {
  const Vc = 3 * b;
  const pts: number[] = [];
  const vs = b * 1.0005;
  const ve = Vc * 16;
  const fs = Math.max(vs, Vc * 0.4);
  const fe = Vc * 2.5;
  for (let i = 0; i <= 800; i++) pts.push(vs + (ve - vs) * i / 800);
  for (let i = 0; i <= 800; i++) pts.push(fs + (fe - fs) * i / 800);
  pts.sort((x, y) => x - y);

  let v1: number | null = null, v2: number | null = null;
  let p1: number | null = null, p2: number | null = null;
  let pr = dPdV(pts[0], T, a, b);

  for (let i = 1; i < pts.length; i++) {
    const v = pts[i];
    const d = dPdV(v, T, a, b);
    if (!isNaN(pr) && !isNaN(d) && pr * d < 0) {
      let lo = pts[i - 1], hi = v;
      for (let j = 0; j < 60; j++) {
        const m = (lo + hi) / 2;
        if (dPdV(m, T, a, b) * dPdV(lo, T, a, b) > 0) lo = m; else hi = m;
      }
      const vE = (lo + hi) / 2;
      const pE = vdwP(vE, T, a, b);
      if (v1 === null) { v1 = vE; p1 = pE; }
      else { v2 = vE; p2 = pE; break; }
    }
    pr = d;
  }
  if (v1 !== null && v2 !== null && p1! > p2!) {
    [v1, v2] = [v2, v1];
    [p1, p2] = [p2, p1];
  }
  return { vMin: v1, pMin: p1, vMax: v2, pMax: p2 };
}

function findVatP(Pt: number, T: number, a: number, b: number, vL: number, vH: number): number {
  let lo = vL, hi = vH;
  const pL = vdwP(lo, T, a, b);
  const pH = vdwP(hi, T, a, b);
  if (isNaN(pL) || isNaN(pH) || (pL - Pt) * (pH - Pt) > 0) return NaN;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if ((vdwP(m, T, a, b) - Pt) * (pL - Pt) > 0) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}

export interface MaxwellResult { Peq: number; Vl: number; Vg: number }

export function maxwell(T: number, a: number, b: number): MaxwellResult | null {
  const Tc = 8 * a / (27 * R * b);
  const ex = findExtrema(T, a, b);
  if (!ex.vMin || !ex.vMax || ex.pMin! >= ex.pMax!) return null;
  const nS = (T / Tc) > 0.95 ? 1500 : 600;
  let pL = Math.max(ex.pMin!, 0.001);
  let pH = ex.pMax!;
  if (ex.pMin! < 0) pL = 0.001;

  for (let it = 0; it < 80; it++) {
    const pm = (pL + pH) / 2;
    const V1 = findVatP(pm, T, a, b, b * 1.0005, ex.vMin);
    const V3 = findVatP(pm, T, a, b, ex.vMax, ex.vMax * 20);
    if (isNaN(V1) || isNaN(V3)) { pL = pm; continue; }
    let ig = 0;
    for (let i = 0; i < nS; i++) {
      const va = V1 + (V3 - V1) * i / nS;
      const vb = V1 + (V3 - V1) * (i + 1) / nS;
      ig += (vdwP(va, T, a, b) - pm + vdwP(vb, T, a, b) - pm) / 2 * (vb - va);
    }
    if (ig > 0) pL = pm; else pH = pm;
  }
  const Pe = (pL + pH) / 2;
  const Vl = findVatP(Pe, T, a, b, b * 1.0005, ex.vMin);
  const Vg = findVatP(Pe, T, a, b, ex.vMax, ex.vMax * 20);
  if (isNaN(Vl) || isNaN(Vg) || Pe < 0 || Math.abs(Vg - Vl) / (Vg + Vl) < 1e-4) return null;
  return { Peq: Pe, Vl, Vg };
}

export interface BinodalPoint { Vl: number; Vg: number; P: number; T: number }

export function computeBinodal(a: number, b: number, Tc: number): BinodalPoint[] {
  const Vc = 3 * b;
  const Pc = a / (27 * b * b);
  const pts: BinodalPoint[] = [];
  for (let i = 0; i <= 50; i++) {
    const T = Tc * 0.50 + (Tc * 0.92 - Tc * 0.50) * i / 50;
    const mc = maxwell(T, a, b);
    if (mc && mc.Peq > 0) pts.push({ Vl: mc.Vl, Vg: mc.Vg, P: mc.Peq, T });
  }
  for (let i = 1; i <= 80; i++) {
    const f = i / 80;
    const T = Tc * 0.92 + (Tc * 0.999 - Tc * 0.92) * f * f;
    const mc = maxwell(T, a, b);
    if (mc && mc.Peq > 0) pts.push({ Vl: mc.Vl, Vg: mc.Vg, P: mc.Peq, T });
  }
  pts.sort((x, y) => x.T - y.T);
  pts.push({ Vl: Vc, Vg: Vc, P: Pc, T: Tc });
  return pts;
}

export function computeSpinodal(a: number, b: number): { V: number; P: number; T: number }[] {
  const pts: { V: number; P: number; T: number }[] = [];
  for (let i = 0; i <= 200; i++) {
    const V = b * 1.05 + (b * 15 - b * 1.05) * i / 200;
    const T = 2 * a * (V - b) * (V - b) / (R * V * V * V);
    const P = vdwP(V, T, a, b);
    if (P > 0 && T > 0) pts.push({ V, P, T });
  }
  return pts;
}

export function realPhaseDiagram(g: Gas) {
  const { Tc, Pc, Tt, Pt } = g;
  const dHR = Math.log(Pc / Math.max(Pt, 1e-12)) / (1 / Tt - 1 / Tc);
  const dHsR = dHR * 1.1;

  const vT: number[] = [], vP: number[] = [];
  for (let i = 0; i <= 120; i++) {
    const T = Tt + (Tc - Tt) * i / 120;
    const P = Pt * Math.exp(dHR * (1 / Tt - 1 / T));
    if (P > 0 && P <= Pc * 1.01) { vT.push(T); vP.push(Math.min(P, Pc)); }
  }
  vT.push(Tc); vP.push(Pc);

  const sT: number[] = [], sP: number[] = [];
  const Tl = Math.max(Tt * 0.4, 1);
  for (let i = 0; i <= 60; i++) {
    const T = Tl + (Tt - Tl) * i / 60;
    const P = Pt * Math.exp(dHsR * (1 / Tt - 1 / T));
    if (P > 0 && P < Pc * 3) { sT.push(T); sP.push(P); }
  }

  const isWater = g.id === 'h2o';
  const mSl = isWater ? -100 : (Pc * 3) / ((Tc - Tt) * 0.3);
  const mT: number[] = [], mP: number[] = [];
  const Ptop = Pc * 2.5;
  for (let i = 0; i <= 50; i++) {
    const P = Pt + (Ptop - Pt) * i / 50;
    const T = Tt + (P - Pt) / mSl;
    if (T > 0 && T < Tc * 2) { mT.push(T); mP.push(P); }
  }

  return { vT, vP, sT, sP, mT, mP };
}

export function tempColor(f: number): string {
  const r = f < 0.5 ? Math.round(20 + f * 2 * 200) : Math.round(220 + (f - 0.5) * 2 * 35);
  const g = f < 0.5 ? Math.round(80 + f * 2 * 175) : Math.round(255 - (f - 0.5) * 2 * 220);
  const b = f < 0.5 ? Math.round(220 - f * 2 * 200) : Math.round(20);
  return `rgb(${r},${g},${b})`;
}

export function formatTemp(T: number): string {
  return `${T.toFixed(1)} K (${(T - 273.15).toFixed(1)} °C)`;
}

export function formatTempShort(T: number): string {
  return `${T.toFixed(0)} K (${(T - 273.15).toFixed(0)} °C)`;
}
