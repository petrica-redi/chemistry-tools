export interface GasSpec {
  id: string;
  label: string;
  M: number;
  color: string;
  Sv: number;
}

export const CTK_GASES: Record<string, GasSpec> = {
  none: { id: 'none', label: '— None —', M: 0, color: '#555', Sv: 0 },
  H2: { id: 'H2', label: 'H₂', M: 2.016, color: '#ef4444', Sv: 7.07 },
  D2: { id: 'D2', label: 'D₂', M: 4.028, color: '#dc2626', Sv: 7.07 },
  HD: { id: 'HD', label: 'HD', M: 3.022, color: '#f87171', Sv: 7.07 },
  He: { id: 'He', label: 'He', M: 4.003, color: '#fbbf24', Sv: 2.88 },
  Ne: { id: 'Ne', label: 'Ne', M: 20.18, color: '#fb923c', Sv: 5.59 },
  Ar: { id: 'Ar', label: 'Ar', M: 39.95, color: '#a78bfa', Sv: 16.1 },
  Kr: { id: 'Kr', label: 'Kr', M: 83.80, color: '#7c3aed', Sv: 22.8 },
  N2: { id: 'N2', label: 'N₂', M: 28.01, color: '#34d399', Sv: 17.9 },
  O2: { id: 'O2', label: 'O₂', M: 32.00, color: '#22d3ee', Sv: 16.6 },
  CO: { id: 'CO', label: 'CO', M: 28.01, color: '#60a5fa', Sv: 18.9 },
  CO2: { id: 'CO2', label: 'CO₂', M: 44.01, color: '#f97316', Sv: 26.9 },
  CH4: { id: 'CH4', label: 'CH₄', M: 16.04, color: '#4ade80', Sv: 24.42 },
  C2H6: { id: 'C2H6', label: 'C₂H₆', M: 30.07, color: '#2dd4bf', Sv: 45.66 },
  C2H4: { id: 'C2H4', label: 'C₂H₄', M: 28.05, color: '#38bdf8', Sv: 40.68 },
  C3H8: { id: 'C3H8', label: 'C₃H₈', M: 44.10, color: '#c084fc', Sv: 65.34 },
  C3H6: { id: 'C3H6', label: 'C₃H₆', M: 42.08, color: '#e879f9', Sv: 60.54 },
  H2O: { id: 'H2O', label: 'H₂O', M: 18.02, color: '#7dd3fc', Sv: 12.7 },
  NO: { id: 'NO', label: 'NO', M: 30.01, color: '#a8a29e', Sv: 17.9 },
  NH3: { id: 'NH3', label: 'NH₃', M: 17.03, color: '#94a3b8', Sv: 14.9 },
  SO2: { id: 'SO2', label: 'SO₂', M: 64.07, color: '#fcd34d', Sv: 41.1 },
  '13CO': { id: '13CO', label: '¹³CO', M: 29.01, color: '#818cf8', Sv: 18.9 },
};

export const GAS_KEYS = Object.keys(CTK_GASES).filter((k) => k !== 'none');

export interface MixGas {
  g: string;
  f: number;
}

export interface CTKParams {
  T: number;
  P: number;
  rID: number;
  bedH: number;
  totalH: number;
  tID: number;
  Lin: number;
  Lout: number;
  dp: number;
  eps: number;
  frit: number;
  neFlow: number;
  tSW: number;
  tSS: number;
  tBT: number;
}

export const DEFAULT_PARAMS: CTKParams = {
  T: 250,
  P: 101325,
  rID: 24,
  bedH: 15,
  totalH: 40,
  tID: 3,
  Lin: 500,
  Lout: 300,
  dp: 0.3,
  eps: 0.40,
  frit: 2.5,
  neFlow: 5,
  tSW: 20,
  tSS: 15,
  tBT: 20,
};
