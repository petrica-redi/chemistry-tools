/**
 * Cross-tool scientific connections.
 * Each entry describes a directed relationship between two tools,
 * explains WHY they are linked, and provides helpers to build
 * deep-link URLs carrying the relevant parameter context.
 */

export type ToolId = 'fim' | 'ctk' | 'orbitals' | 'titration' | 'miller' | 'vdw';

export interface Connection {
  from: ToolId;
  to: ToolId;
  /** Short label shown on the linking button */
  label: string;
  /** One-sentence scientific explanation */
  description: string;
  /** Text shown in the source tool: why would you jump to the target? */
  fromHint: string;
  /** Text shown in the target tool: what context arrived from the source? */
  toHint: string;
  /** Accent colour for the bridge card */
  accent: string;
}

export const CONNECTIONS: Connection[] = [
  // ─── FIM ↔ Miller ──────────────────────────────────────────────
  {
    from: 'fim',
    to: 'miller',
    label: 'View surface in Miller Viewer',
    description:
      'The crystal orientation set on the FIM tip defines which (hkl) facet is at the apex. Visualize that exact surface plane in the Miller Viewer.',
    fromHint:
      "The current pole (hkl) and lattice define the apex facet — see it in 3D with atom positions.",
    toHint:
      "Arrived from FIM Tip Simulator — showing the apex crystal facet.",
    accent: '#4f8ef7',
  },
  {
    from: 'miller',
    to: 'fim',
    label: 'Simulate this surface as a FIM tip',
    description:
      'Any (hkl) surface you view here appears as a bright pole in the FIM stereographic projection. Build the tip to see the full map.',
    fromHint:
      'This (hkl) surface appears as a prominent ring/pole in the FIM stereographic projection.',
    toHint:
      'Arrived from Miller Surface Viewer — tip oriented to match this facet.',
    accent: '#2dd4a0',
  },

  // ─── CTK ↔ VdW ─────────────────────────────────────────────────
  {
    from: 'ctk',
    to: 'vdw',
    label: 'Explore gas real-gas behavior',
    description:
      'The gases in this CTK reactor deviate from ideal behavior at reactor pressures. The VdW Explorer quantifies those deviations via the equation of state.',
    fromHint:
      'At elevated pressures, these gases compress non-ideally — see their P-V-T surface.',
    toHint:
      'Arrived from CTK Simulator — showing the real-gas behavior of the selected reactant.',
    accent: '#f97340',
  },
  {
    from: 'vdw',
    to: 'ctk',
    label: 'Simulate this gas in a reactor',
    description:
      'Flowing this gas over a catalyst surface is modelled in the CTK Simulator, where switching kinetics and residence time distributions are computed.',
    fromHint:
      'The real-gas corrections for this species affect transient kinetics in the CTK reactor.',
    toHint:
      'Arrived from VdW Explorer — pre-selecting the gas in circuit A.',
    accent: '#2dd4a0',
  },

  // ─── Orbitals ↔ FIM ────────────────────────────────────────────
  {
    from: 'orbitals',
    to: 'fim',
    label: 'Simulate this element as a FIM tip',
    description:
      "The FIM field-evaporation voltage depends directly on an element's ionization energy, which is set by the outermost orbital shown here.",
    fromHint:
      'The outermost orbital energy level determines the FIM imaging field for this element.',
    toHint:
      'Arrived from Atomic Orbitals — tip material set to match this element.',
    accent: '#9d79f5',
  },
  {
    from: 'fim',
    to: 'orbitals',
    label: 'Explore atomic orbitals of tip material',
    description:
      'The local electric field that ionizes surface atoms in FIM is set by their orbital energies and effective nuclear charge (Zeff).',
    fromHint:
      "The BIF (best image field) for this material is tied to the outermost orbital's ionization energy.",
    toHint:
      'Arrived from FIM Tip Simulator — showing orbitals of the selected tip metal.',
    accent: '#4f8ef7',
  },

  // ─── Miller ↔ Orbitals ──────────────────────────────────────────
  {
    from: 'miller',
    to: 'orbitals',
    label: 'Explore surface atom orbitals',
    description:
      'The catalytic reactivity of a (hkl) facet is governed by the overlap between adsorbate orbitals and the d-orbital density of surface atoms.',
    fromHint:
      'Surface chemistry on this facet depends on d-orbital availability of the surface metal atoms.',
    toHint:
      'Arrived from Miller Surface Viewer — showing orbitals of the surface metal.',
    accent: '#f5c842',
  },
  {
    from: 'orbitals',
    to: 'titration',
    label: 'Link to acid strength',
    description:
      'The pKa of an acid is directly related to the electronegativity and orbital energy of its central atom — higher Zeff tightens bonds, increasing acid strength.',
    fromHint:
      'Higher Zeff (from Clementi-Raimondi data) → stronger bond polarisation → lower pKa of the element\'s oxide/hydride.',
    toHint:
      'Arrived from Atomic Orbitals — showing how orbital structure governs acid-base chemistry.',
    accent: '#e879c4',
  },
];

/** Return all connections that originate from a given tool */
export function getConnectionsFrom(toolId: ToolId): Connection[] {
  return CONNECTIONS.filter((c) => c.from === toolId);
}

/** Return all connections that arrive at a given tool */
export function getConnectionsTo(toolId: ToolId): Connection[] {
  return CONNECTIONS.filter((c) => c.to === toolId);
}

/** Tool metadata (label + href) for building links */
export const TOOL_META: Record<ToolId, { label: string; href: string; icon: string }> = {
  fim:      { label: 'FIM Tip Simulator', href: '/fim-simulator',  icon: '🔬' },
  ctk:      { label: 'CTK Simulator',     href: '/ctk-simulator',  icon: '⚗️' },
  orbitals: { label: 'Atomic Orbitals',   href: '/atomic-orbitals', icon: '⚛️' },
  titration:{ label: 'Titration',         href: '/titration',      icon: '🧪' },
  miller:   { label: 'Miller Viewer',     href: '/miller-surfaces', icon: '💎' },
  vdw:      { label: 'VdW Explorer',      href: '/vdw-explorer',   icon: '🌡️' },
};

/** Element symbol → atomic number, for cross-tool linking */
export const SYMBOL_TO_Z: Record<string, number> = {
  H:1,He:2,Li:3,Be:4,B:5,C:6,N:7,O:8,F:9,Ne:10,
  Na:11,Mg:12,Al:13,Si:14,P:15,S:16,Cl:17,Ar:18,K:19,Ca:20,
  Sc:21,Ti:22,V:23,Cr:24,Mn:25,Fe:26,Co:27,Ni:28,Cu:29,Zn:30,
  Ga:31,Ge:32,As:33,Se:34,Br:35,Kr:36,Rb:37,Sr:38,Y:39,Zr:40,
  Nb:41,Mo:42,Tc:43,Ru:44,Rh:45,Pd:46,Ag:47,Cd:48,In:49,Sn:50,
  Sb:51,Te:52,I:53,Xe:54,Cs:55,Ba:56,La:57,Hf:72,Ta:73,W:74,
  Re:75,Os:76,Ir:77,Pt:78,Au:79,Hg:80,Tl:81,Pb:82,Bi:83,
};

/**
 * Map CTK gas keys → VdW gas IDs.
 * Only gases that exist in both databases are mapped.
 */
export const CTK_TO_VDW: Record<string, string> = {
  H2:  'h2',
  He:  'he',
  Ne:  'ne',
  Ar:  'ar',
  N2:  'n2',
  O2:  'o2',
  CO:  'co',
  CO2: 'co2',
  CH4: 'ch4',
  C2H6:'c2h6',
  C2H4:'c2h4',
  C3H8:'c3h8',
  NH3: 'nh3',
  SO2: 'so2',
  H2O: 'h2o',
};
