import { CTK_GASES, type MixGas, type CTKParams } from './CTKGasDB';

export interface SimResult {
  data: Record<string, number>[];
  gasKeys: string[];
  switchToB: number;
  switchBackToA: number;
  totalTime: number;
  nCells: number;
  Pe_bed: string;
  Pe_in: string;
  Pe_out: string;
  V_bed_mL: string;
  V_total_mL: string;
  tau_s: string;
}

export function runSimulation(
  mixA: MixGas[],
  mixB: MixGas[],
  params: CTKParams
): SimResult {
  const {
    T: T_C, P, rID, bedH: bedHParam, tID, Lin, Lout,
    dp, eps, frit, neFlow: neF, tSW, tSS, tBT,
  } = params;

  const TK = T_C + 273.15;
  const Pa = P / 101325;
  const ag = new Set<string>();
  [...mixA, ...mixB].forEach((g) => { if (g.g !== 'none') ag.add(g.g); });
  ag.add('Ne');
  const gk = [...ag];

  const fA = mixA.reduce((s, g) => s + (g.g !== 'none' ? g.f : 0), 0);
  const fB = mixB.reduce((s, g) => s + (g.g !== 'none' ? g.f : 0), 0);

  if (!fA && !fB) {
    return { data: [], gasKeys: gk, switchToB: 0, switchBackToA: 0, totalTime: 0, nCells: 0, Pe_bed: '0', Pe_in: '0', Pe_out: '0', V_bed_mL: '0', V_total_mL: '0', tau_s: '0' };
  }

  const xA: Record<string, number> = {};
  const xB: Record<string, number> = {};
  gk.forEach((k) => { xA[k] = 0; xB[k] = 0; });
  mixA.forEach((g) => { if (g.g !== 'none' && fA > 0) xA[g.g] = (xA[g.g] || 0) + g.f / fA; });
  mixB.forEach((g) => { if (g.g !== 'none' && fB > 0) xB[g.g] = (xB[g.g] || 0) + g.f / fB; });

  const d2 = tID / 1e3;
  const At = Math.PI / 4 * d2 * d2;
  const dr = rID / 1e3;
  const Ar = Math.PI / 4 * dr * dr;
  const Lb = bedHParam / 1e3;
  const dpp = dp / 1e3;

  const Vi = At * (Lin / 1e3);
  const Vb = Ar * Lb * eps;
  const Ve = Ar * 0.005;
  const Vf = Ar * 0.003 * 0.35;
  const Vo = At * (Lout / 1e3);

  const af = Math.max((fA + fB) / 2, 0.5);
  const Qa = (af / 60e6) * (TK / 273.15) / Pa;
  const aDm = 3e-5 * Math.pow(TK / 273.15, 1.75) / Pa;

  const ut = Qa / At;
  const Rt = d2 / 2;
  const DT = aDm + ut * ut * Rt * Rt / (48 * aDm);

  const Pi = ut * (Lin / 1e3) / DT;
  const Po = ut * (Lout / 1e3) / DT;
  const ub = Qa / Ar;
  const Dax = aDm / eps + 0.5 * ub * dpp;
  const Pb = ub * Lb / Dax;

  const Ni = Math.max(2, Math.min(40, Math.round(Pi / 2)));
  const Ne2 = 2;
  const Nb = Math.max(1, Math.min(20, Math.round(Pb / 2)));
  const Nf = 1;
  const No = Math.max(2, Math.min(40, Math.round(Po / 2)));

  const cells: { V: number }[] = [];
  const addCells = (n: number, V: number) => {
    const v = V / n;
    for (let i = 0; i < n; i++) cells.push({ V: v });
  };
  addCells(Ni, Vi);
  addCells(Ne2, Ve);
  addCells(Nf, Vf);
  addCells(Nb, Vb);
  addCells(No, Vo);
  const nC = cells.length;

  const pre = 5;
  const s2B = pre;
  const sBA = s2B + tSW + tSS;
  const tT = sBA + tBT + 5;

  const mnV = Math.min(...cells.map((c) => c.V));
  const mxQ = Math.max(fA, fB, 0.5) / 60e6 * (TK / 273.15) / Pa;
  let ddt = Math.min(0.8 * mnV / mxQ, 0.05);
  ddt = Math.max(ddt, 5e-5);
  const nS = Math.ceil(tT / ddt);

  let co: Record<string, number>[] = [];
  let ff: number[] = [];
  for (let i = 0; i < nC; i++) {
    const c: Record<string, number> = {};
    gk.forEach((k) => (c[k] = xA[k] || 0));
    co.push(c);
    ff.push(fA);
  }

  const sE = Math.max(1, Math.floor(nS / 900));
  const data: Record<string, number>[] = [];

  for (let s = 0; s < nS; s++) {
    const t = s * ddt;
    let iF: Record<string, number>, QS: number;
    if (t < s2B) { iF = xA; QS = fA; }
    else if (t < sBA) { iF = xB; QS = fB; }
    else { iF = xA; QS = fA; }

    const nc: Record<string, number>[] = [];
    const nf: number[] = [];
    for (let i = 0; i < nC; i++) {
      const Ql = ((i === 0 ? QS : ff[i - 1]) / 60e6) * (TK / 273.15) / Pa;
      const r = ddt * Ql / cells[i].V;
      const pC = i === 0 ? iF : co[i - 1];
      const cC = co[i];
      const c: Record<string, number> = {};
      gk.forEach((k) => { c[k] = cC[k] + r * ((pC[k] || 0) - cC[k]); });
      nc.push(c);
      nf.push(ff[i] + r * ((i === 0 ? QS : ff[i - 1]) - ff[i]));
    }
    co = nc;
    ff = nf;

    if (s % sE === 0 || s === nS - 1) {
      const oc = co[nC - 1];
      const Qo = ff[nC - 1];
      const QN = neF;
      const tot = Qo + QN;
      const pt: Record<string, number> = { t: +t.toFixed(4) };
      gk.forEach((k) => {
        pt[k] = k === 'Ne'
          ? (tot > 0 ? QN / tot * P / 1e3 : 0)
          : (tot > 0 ? (oc[k] || 0) * Qo / tot * P / 1e3 : 0);
      });
      data.push(pt);
    }
  }

  return {
    data,
    gasKeys: gk,
    switchToB: s2B,
    switchBackToA: sBA,
    totalTime: tT,
    nCells: nC,
    Pe_bed: Pb.toFixed(1),
    Pe_in: Pi.toFixed(1),
    Pe_out: Po.toFixed(1),
    V_bed_mL: (Vb * 1e6).toFixed(2),
    V_total_mL: (cells.reduce((s, c) => s + c.V, 0) * 1e6).toFixed(2),
    tau_s: (cells.reduce((s, c) => s + c.V, 0) / Qa).toFixed(3),
  };
}
