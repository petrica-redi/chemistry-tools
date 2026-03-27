'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MAT, LAT } from './FIMData';
import {
  updateCrystAxes, buildCrystalRM, generateAtoms, computeCoord,
  computeFields, renderTip3D, renderMicrograph, Q, mm3,
  type ColormapName,
} from './FIMEngine';
import Panel from '@/components/shared/Panel';
import SliderControl from '@/components/shared/SliderControl';
import SelectControl from '@/components/shared/SelectControl';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import TabBar from '@/components/shared/TabBar';
import RelatedTools from '@/components/shared/RelatedTools';
import EducationPanel, { FormulaBlock, DefTerm } from '@/components/shared/EducationPanel';
import { SYMBOL_TO_Z } from '@/lib/connections';

interface FIMState {
  matKey: string;
  apexR: number;
  shankDeg: number;
  shankLenMul: number;
  poleH: number;
  poleK: number;
  poleL: number;
  voltage: number;
  alpha: number;
  probeHeight: number;
  fieldExp: number;
  screenDist: number;
  colormap: ColormapName;
  threshold: number;
  showDim: boolean;
  bulkOpacity: number;
  bulkColor: string;
  lightAz: number;
  lightEl: number;
  ambient: number;
  atomSize: number;
  wulffFrac: number;
  projN: number;
  aperture: number;
  microBright: number;
  microContrast: number;
  spotSize: number;
  // Stereographic projection
  showStereo: boolean;
  stereoSize: number;
  stereoFont: number;
  showZones: boolean;
  zoneLineW: number;
  // Miller indices
  millerMode: 'off' | 'main' | 'all';
  miller3dFont: number;
  // Self-rotation
  selfRot: number;
  // Field evaporation
  evapThresh: number;
  evapMaxIter: number;
  // Colormaps & display
  greyscale: boolean;
  customCmapLow: string;
  customCmapHigh: string;
  bgColor: string;
  // Micrograph advanced
  spotSoftness: number;
  fieldThreshold: number;
  negativeImage: boolean;
  phosphorColor: 'green' | 'blue' | 'white' | 'amber' | 'custom';
  phosphorCustom: string;
  gammaR: number;
  gammaG: number;
  gammaB: number;
  microOpacity: number;
  // Micrograph Miller indices
  microMillerMode: 'off' | 'main' | 'all';
  microMillerFont: number;
  microMillerDots: boolean;
  // Projection presets
  projPreset: 'radial' | 'fim' | 'stereo' | 'ortho' | 'custom';
  // Ring calculator
  ringPole: string;
  ringsCount: number;
  ringTheta: number;
  // Zoom
  zoom: number;
}

const INITIAL: FIMState = {
  matKey: 'Pt',
  apexR: 25,
  shankDeg: 5,
  shankLenMul: 2.9,
  poleH: 0, poleK: 0, poleL: 1,
  voltage: 2727,
  alpha: 1.5,
  probeHeight: 1.0,
  fieldExp: 0.20,
  screenDist: 820,
  colormap: 'custom',
  threshold: 8,
  showDim: false,
  bulkOpacity: 100,
  bulkColor: '#000000',
  lightAz: 30,
  lightEl: 60,
  ambient: 30,
  atomSize: 100,
  wulffFrac: 0,
  projN: 2.0,
  aperture: 60,
  microBright: 1.0,
  microContrast: 1.0,
  spotSize: 1.0,
  showStereo: false,
  stereoSize: 0,
  stereoFont: 7,
  showZones: true,
  zoneLineW: 0.7,
  millerMode: 'off',
  miller3dFont: 10,
  selfRot: 0,
  evapThresh: 6,
  evapMaxIter: 1,
  greyscale: false,
  customCmapLow: '#0a0a0a',
  customCmapHigh: '#00cc00',
  bgColor: '#08080e',
  spotSoftness: 0.50,
  fieldThreshold: 0.20,
  negativeImage: false,
  phosphorColor: 'green',
  phosphorCustom: '#00ff44',
  gammaR: 1.0,
  gammaG: 1.0,
  gammaB: 1.0,
  microOpacity: 100,
  microMillerMode: 'main',
  microMillerFont: 9,
  microMillerDots: true,
  projPreset: 'custom',
  ringPole: '001',
  ringsCount: 5,
  ringTheta: 15,
  zoom: 1.0,
};

interface FIMSimulatorProps {
  initialMatKey?: string;
  initialH?: number;
  initialK?: number;
  initialL?: number;
}

export default function FIMSimulator({
  initialMatKey, initialH, initialK, initialL,
}: FIMSimulatorProps = {}) {
  const [s, setS] = useState<FIMState>({
    ...INITIAL,
    matKey: initialMatKey && MAT[initialMatKey] ? initialMatKey : INITIAL.matKey,
    poleH: initialH ?? INITIAL.poleH,
    poleK: initialK ?? INITIAL.poleK,
    poleL: initialL ?? INITIAL.poleL,
  });
  const [tab, setTab] = useState<'3d' | 'micro'>('3d');
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState({ atoms: 0, surface: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const atomsRef = useRef<Float64Array | null>(null);
  const coordsRef = useRef<Int32Array | null>(null);
  const fieldsRef = useRef<Float64Array | null>(null);
  const viewQRef = useRef(Q.ax(1, 0.3, 0, 0.4).norm());
  const zoomRef = useRef(s.zoom);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, px: 0, py: 0 });
  const animRef = useRef(0);
  const stateRef = useRef(s);
  stateRef.current = s;

  // Update zoom ref when zoom state changes
  useEffect(() => {
    zoomRef.current = s.zoom;
  }, [s.zoom]);

  const update = useCallback((patch: Partial<FIMState>) => {
    setS((prev) => ({ ...prev, ...patch }));
  }, []);

  const doGenerate = useCallback(() => {
    const st = stateRef.current;
    const mat = MAT[st.matKey];
    if (!mat) return;
    const cfg = LAT[mat.lat];
    if (!cfg) return;

    setGenerating(true);
    updateCrystAxes(mat);
    const cRM = buildCrystalRM(st.poleH, st.poleK, st.poleL);

    setTimeout(() => {
      const atoms = generateAtoms(
        mat.lat, st.matKey, st.apexR, st.shankDeg,
        st.shankLenMul, cRM, st.wulffFrac,
      );
      atomsRef.current = atoms;

      const coords = computeCoord(atoms, mat.lat);
      coordsRef.current = coords;

      const fields = computeFields(
        atoms, coords, mat.lat, st.matKey,
        st.apexR, st.shankDeg, st.voltage, st.alpha,
        st.probeHeight, st.fieldExp, st.screenDist,
      );
      fieldsRef.current = fields;

      const n = atoms.length / 3;
      let surfCount = 0;
      for (let i = 0; i < n; i++) if (coords[i] < cfg.bc) surfCount++;
      setStats({ atoms: n, surface: surfCount });
      setGenerating(false);
    }, 50);
  }, []);

  // Generate on mount and when key params change
  useEffect(() => {
    doGenerate();
  }, [s.matKey, s.apexR, s.shankDeg, s.shankLenMul, s.poleH, s.poleK, s.poleL, s.wulffFrac, doGenerate]);

  // Recompute fields when field params change
  useEffect(() => {
    const atoms = atomsRef.current;
    const coords = coordsRef.current;
    if (!atoms || !coords) return;
    const mat = MAT[s.matKey];
    if (!mat) return;
    const fields = computeFields(
      atoms, coords, mat.lat, s.matKey,
      s.apexR, s.shankDeg, s.voltage, s.alpha,
      s.probeHeight, s.fieldExp, s.screenDist,
    );
    fieldsRef.current = fields;
  }, [s.voltage, s.alpha, s.probeHeight, s.fieldExp, s.screenDist, s.matKey, s.apexR, s.shankDeg]);

  // Canvas setup + render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize);

    const onDown = (e: MouseEvent) => {
      dragRef.current = { active: true, px: e.clientX, py: e.clientY };
    };
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.px;
      const dy = e.clientY - dragRef.current.py;
      dragRef.current.px = e.clientX;
      dragRef.current.py = e.clientY;

      if (e.shiftKey) {
        panRef.current.x += dx;
        panRef.current.y += dy;
      } else {
        const q = viewQRef.current;
        const qx = Q.ax(0, 1, 0, dx * 0.005);
        const qy = Q.ax(1, 0, 0, dy * 0.005);
        viewQRef.current = qx.mul(qy).mul(q).norm();
      }
    };
    const onUp = () => { dragRef.current.active = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.max(0.1, Math.min(10, zoomRef.current * (1 - e.deltaY * 0.001)));
    };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      const atoms = atomsRef.current;
      const coords = coordsRef.current;
      const fields = fieldsRef.current;
      if (!atoms || !coords || !fields) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const W = canvas.width, H = canvas.height;
      const st = stateRef.current;
      const mat = MAT[st.matKey];
      if (!mat) return;

      if (tab === '3d') {
        renderTip3D(
          ctx, W, H, atoms, coords, fields,
          mat.lat, st.apexR, st.shankDeg, st.shankLenMul,
          viewQRef.current.mat(), zoomRef.current,
          panRef.current.x, panRef.current.y,
          st.colormap, st.threshold, st.showDim,
          st.bulkOpacity, st.bulkColor,
          st.lightAz, st.lightEl, st.ambient / 100, st.atomSize,
          st.selfRot,
          st.millerMode, st.miller3dFont,
          st.showStereo, st.stereoSize, st.stereoFont,
          st.showZones, st.zoneLineW,
          st.greyscale, st.bgColor, st.customCmapLow, st.customCmapHigh,
        );
      } else {
        renderMicrograph(
          ctx, W, H, atoms, coords, fields,
          mat.lat, st.apexR, st.projN, st.aperture,
          st.microBright, st.microContrast, st.spotSize,
          st.spotSoftness, st.fieldThreshold, st.negativeImage,
          st.phosphorColor, st.phosphorCustom,
          st.gammaR, st.gammaG, st.gammaB,
          st.microOpacity,
          st.microMillerMode, st.microMillerFont, st.microMillerDots,
        );
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [tab]);

  const mat = MAT[s.matKey];
  const latType = mat?.lat || 'FCC';
  const cfg = LAT[latType];
  const dnn = cfg ? cfg.dnn(mat.a) : 2.77;

  const matOptions = Object.entries(MAT).map(([key, m]) => ({
    label: `${key} — ${m.n}`,
    value: key,
    group: m.lat,
  }));

  return (
    <div className="flex h-full">
      <div className="w-[340px] min-w-[340px] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 flex flex-col gap-3">
        <Panel title="Material">
          <SelectControl
            label="Element"
            value={s.matKey}
            options={matOptions}
            onChange={(v) => update({ matKey: v })}
            grouped
          />
          <div className="text-[10px] text-[var(--color-text-muted)] mt-1 bg-[var(--color-bg-tertiary)] p-2 rounded">
            <div>Lattice: <span className="text-[var(--color-text-primary)]">{latType}</span> | a = {mat?.a.toFixed(3)} Å</div>
            <div>d<sub>nn</sub> = {dnn.toFixed(3)} Å | BIF = {mat?.BIF} V/nm</div>
          </div>
        </Panel>

        <Panel title="Tip Geometry">
          <SliderControl label="Apex radius" value={s.apexR} min={1} max={150} step={1} unit=" d_nn" onChange={(v) => update({ apexR: v })} />
          <SliderControl label="Shank angle" value={s.shankDeg} min={0.5} max={30} step={0.1} unit="°" onChange={(v) => update({ shankDeg: v })} />
          <SliderControl label="Shank length" value={s.shankLenMul} min={0.5} max={20} step={0.1} unit="×R" onChange={(v) => update({ shankLenMul: v })} />
          <SliderControl label="Wulff faceting" value={s.wulffFrac} min={0} max={1} step={0.05} unit="" onChange={(v) => update({ wulffFrac: v })} />
        </Panel>

        <Panel title="Crystal Orientation">
          <SelectControl
            label="Central pole"
            value={`${s.poleH}${s.poleK}${s.poleL}`}
            options={[
              { label: '(001)', value: '001' },
              { label: '(011)', value: '011' },
              { label: '(111)', value: '111' },
              { label: '(112)', value: '112' },
              { label: '(113)', value: '113' },
              { label: '(012)', value: '012' },
              { label: '(102)', value: '102' },
              { label: '(013)', value: '013' },
            ]}
            onChange={(v) => {
              const h = parseInt(v[0]), k = parseInt(v[1]), l = parseInt(v[2]);
              update({ poleH: h, poleK: k, poleL: l });
            }}
          />
          <div className="grid grid-cols-4 gap-1 mt-2">
            {[
              [0,0,1], [0,1,1], [1,1,1], [1,1,2],
              [0,1,2], [1,0,2], [1,1,0], [1,-1,0],
            ].map(([h, k, l]) => (
              <button
                key={`${h}${k}${l}`}
                onClick={() => update({ poleH: h, poleK: k, poleL: l })}
                className={`text-[10px] font-mono py-1 rounded border transition-all ${
                  s.poleH === h && s.poleK === k && s.poleL === l
                    ? 'border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] bg-[var(--color-accent-cyan)]/10'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-cyan)]'
                }`}
              >
                ({h}{k}{l})
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Electric Field">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <SliderControl label="Voltage" value={s.voltage} min={100} max={25000} step={50} unit=" V" onChange={(v) => update({ voltage: v })} />
            </div>
            <button
              onClick={() => {
                const mat = MAT[s.matKey];
                if (!mat) return;
                const cfg = LAT[mat.lat];
                const dnn = cfg.dnn(mat.a) / 10; // Å to nm
                const Rnm = s.apexR * dnn;
                const screenDistNm = Math.exp((s.screenDist / 1000) * Math.log(1000));
                const KF_eff = Math.log(2 * screenDistNm / Rnm + 1);
                const V = Math.round(mat.BIF * KF_eff * Rnm);
                update({ voltage: Math.min(25000, V) });
              }}
              className="px-3 py-2 text-[10px] font-bold rounded border border-[var(--color-accent-green)] text-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)]/10 transition-all mb-1"
            >
              Auto BIF
            </button>
          </div>
          <SliderControl label="Alpha (coord. enhancement)" value={s.alpha} min={0.5} max={3} step={0.1} unit="" onChange={(v) => update({ alpha: v })} />
          <SliderControl label="Probe height" value={s.probeHeight} min={0.1} max={3} step={0.1} unit=" d_nn" onChange={(v) => update({ probeHeight: v })} />
          <SliderControl label="Field exponent" value={s.fieldExp} min={0.15} max={3} step={0.05} unit="" onChange={(v) => update({ fieldExp: v })} />
          <SliderControl label="Screen distance" value={s.screenDist} min={0} max={1000} step={1} unit="" onChange={(v) => update({ screenDist: v })} />
        </Panel>

        <Panel title="Field Evaporation">
          <SliderControl label="Evaporation (coord ≤)" value={s.evapThresh} min={0} max={7} step={1} unit="" onChange={(v) => update({ evapThresh: v })} />
          <SliderControl label="Max iterations" value={s.evapMaxIter} min={1} max={50} step={1} unit="" onChange={(v) => update({ evapMaxIter: v })} />
          <div className="flex gap-2 mt-2">
            <button
              onClick={doGenerate}
              className="flex-1 px-2 py-1 text-[10px] font-bold rounded border border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] hover:bg-[var(--color-accent-cyan)]/10 transition-all"
            >
              +1 Iteration
            </button>
            <button
              onClick={() => doGenerate()}
              className="flex-1 px-2 py-1 text-[10px] font-bold rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-all"
            >
              Reset
            </button>
          </div>
        </Panel>

        <Panel title="View & Rotation">
          <SliderControl label="Zoom" value={s.zoom} min={0.1} max={10} step={0.1} unit="×" onChange={(v) => update({ zoom: v })} />
          <SliderControl label="Self-rotation" value={s.selfRot} min={-180} max={180} step={1} unit="°" onChange={(v) => update({ selfRot: v })} />
          <SelectControl
            label="Miller indices"
            value={s.millerMode}
            options={[
              { label: 'Off', value: 'off' },
              { label: 'Principal poles', value: 'main' },
              { label: 'All poles (incl. negative)', value: 'all' },
            ]}
            onChange={(v) => update({ millerMode: v as 'off' | 'main' | 'all' })}
          />
          {s.millerMode !== 'off' && (
            <SliderControl label="3D label size" value={s.miller3dFont} min={5} max={24} step={1} unit=" px" onChange={(v) => update({ miller3dFont: v })} />
          )}
        </Panel>

        <Panel title="Stereographic Projection">
          <ToggleSwitch label="Show projection" checked={s.showStereo} onChange={(v) => update({ showStereo: v })} />
          {s.showStereo && (
            <>
              <SliderControl label="Projection size" value={s.stereoSize} min={0} max={100} step={1} unit="%" onChange={(v) => update({ stereoSize: v })} />
              <SliderControl label="Label size" value={s.stereoFont} min={4} max={20} step={1} unit=" px" onChange={(v) => update({ stereoFont: v })} />
              <ToggleSwitch label="Show zone lines [uvw]" checked={s.showZones} onChange={(v) => update({ showZones: v })} />
              {s.showZones && (
                <SliderControl label="Zone line width" value={s.zoneLineW} min={0.1} max={4} step={0.1} unit=" px" onChange={(v) => update({ zoneLineW: v })} />
              )}
            </>
          )}
        </Panel>

        <Panel title="Display">
          <SelectControl
            label="Colormap"
            value={s.colormap}
            options={[
              { label: 'Surface Charge (Jet)', value: 'jet' },
              { label: 'FIM Green', value: 'green' },
              { label: 'Hot', value: 'hot' },
              { label: 'Viridis', value: 'viridis' },
              { label: 'Plasma', value: 'plasma' },
              { label: 'Inferno', value: 'inferno' },
              { label: 'Cool-Warm', value: 'coolwarm' },
              { label: 'Turbo', value: 'turbo' },
              { label: 'Cividis', value: 'cividis' },
              { label: 'Custom (pick colors)', value: 'custom' },
            ]}
            onChange={(v) => update({ colormap: v as ColormapName })}
          />
          {s.colormap === 'custom' && (
            <div className="flex gap-2 items-center">
              <label className="text-[10px] text-[var(--color-text-muted)]">Low:</label>
              <input
                type="color"
                value={s.customCmapLow}
                onChange={(e) => update({ customCmapLow: e.target.value })}
                className="w-10 h-8 rounded cursor-pointer"
              />
              <label className="text-[10px] text-[var(--color-text-muted)]">High:</label>
              <input
                type="color"
                value={s.customCmapHigh}
                onChange={(e) => update({ customCmapHigh: e.target.value })}
                className="w-10 h-8 rounded cursor-pointer"
              />
            </div>
          )}
          <ToggleSwitch label="Greyscale" checked={s.greyscale} onChange={(v) => update({ greyscale: v })} />
          <div className="flex gap-2 items-center">
            <label className="text-[10px] text-[var(--color-text-muted)]">3D Background:</label>
            <input
              type="color"
              value={s.bgColor}
              onChange={(e) => update({ bgColor: e.target.value })}
              className="w-10 h-8 rounded cursor-pointer"
            />
          </div>
          <SliderControl label="Atom size" value={s.atomSize} min={1} max={150} step={1} unit="%" onChange={(v) => update({ atomSize: v })} />
          <ToggleSwitch label="Show bulk atoms" checked={s.showDim} onChange={(v) => update({ showDim: v })} />
          {s.showDim && (
            <>
              <SliderControl label="Bulk opacity" value={s.bulkOpacity} min={1} max={100} step={1} unit="%" onChange={(v) => update({ bulkOpacity: v })} />
              <div className="flex gap-2 items-center">
                <label className="text-[10px] text-[var(--color-text-muted)]">Bulk color:</label>
                <input
                  type="color"
                  value={s.bulkColor}
                  onChange={(e) => update({ bulkColor: e.target.value })}
                  className="w-10 h-8 rounded cursor-pointer"
                />
              </div>
            </>
          )}
          <SliderControl label="Light azimuth" value={s.lightAz} min={-180} max={180} step={5} unit="°" onChange={(v) => update({ lightAz: v })} />
          <SliderControl label="Light elevation" value={s.lightEl} min={0} max={90} step={5} unit="°" onChange={(v) => update({ lightEl: v })} />
          <SliderControl label="Ambient" value={s.ambient} min={5} max={80} step={1} unit="%" onChange={(v) => update({ ambient: v })} />
        </Panel>

        {tab === 'micro' && (
          <>
            <Panel title="Projection">
              <div className="grid grid-cols-2 gap-2 mb-2">
                {[
                  { label: 'Radial', preset: 'radial' as const, n: 1 },
                  { label: 'FIM', preset: 'fim' as const, n: 1.65 },
                  { label: 'Stereo', preset: 'stereo' as const, n: 2 },
                  { label: 'Ortho', preset: 'ortho' as const, n: Infinity },
                ].map(({ label, preset, n }) => (
                  <button
                    key={preset}
                    onClick={() => update({ projPreset: preset, projN: n === Infinity ? 4 : n })}
                    className={`text-[10px] font-mono py-1 rounded border transition-all ${
                      s.projPreset === preset
                        ? 'border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] bg-[var(--color-accent-cyan)]/10'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-cyan)]'
                    }`}
                  >
                    n={n === Infinity ? '∞' : n.toFixed(2)}
                  </button>
                ))}
              </div>
              <SliderControl label="Projection n" value={s.projN} min={1} max={4} step={0.05} unit="" onChange={(v) => update({ projN: v, projPreset: 'custom' })} />
              <SliderControl label="Aperture" value={s.aperture} min={20} max={90} step={1} unit="°" onChange={(v) => update({ aperture: v })} />
            </Panel>

            <Panel title="Micrograph Display">
              <SliderControl label="Spot softness" value={s.spotSoftness} min={0.05} max={1} step={0.05} unit="" onChange={(v) => update({ spotSoftness: v })} />
              <SliderControl label="Field threshold" value={s.fieldThreshold} min={0} max={0.95} step={0.01} unit="" onChange={(v) => update({ fieldThreshold: v })} />
              <ToggleSwitch label="Negative image" checked={s.negativeImage} onChange={(v) => update({ negativeImage: v })} />
              <SelectControl
                label="Phosphor color"
                value={s.phosphorColor}
                options={[
                  { label: 'Green (P43)', value: 'green' },
                  { label: 'Blue (P47)', value: 'blue' },
                  { label: 'White', value: 'white' },
                  { label: 'Amber (P12)', value: 'amber' },
                  { label: 'Custom', value: 'custom' },
                ]}
                onChange={(v) => update({ phosphorColor: v as 'green' | 'blue' | 'white' | 'amber' | 'custom' })}
              />
              {s.phosphorColor === 'custom' && (
                <div className="flex gap-2 items-center">
                  <label className="text-[10px] text-[var(--color-text-muted)]">Color:</label>
                  <input
                    type="color"
                    value={s.phosphorCustom}
                    onChange={(e) => update({ phosphorCustom: e.target.value })}
                    className="w-10 h-8 rounded cursor-pointer"
                  />
                </div>
              )}
              <SliderControl label="Brightness" value={s.microBright} min={0.1} max={5.0} step={0.1} unit="" onChange={(v) => update({ microBright: v })} />
              <SliderControl label="Contrast" value={s.microContrast} min={0.1} max={5.0} step={0.1} unit="" onChange={(v) => update({ microContrast: v })} />
              <SliderControl label="Spot size" value={s.spotSize} min={0.2} max={5.0} step={0.1} unit="" onChange={(v) => update({ spotSize: v })} />
              <SliderControl label="Opacity" value={s.microOpacity} min={5} max={100} step={1} unit="%" onChange={(v) => update({ microOpacity: v })} />
            </Panel>

            <Panel title="Gamma Curves">
              <div className="space-y-2">
                <SliderControl label="R gamma" value={s.gammaR} min={0.1} max={4} step={0.05} unit="" onChange={(v) => update({ gammaR: v })} />
                <SliderControl label="G gamma" value={s.gammaG} min={0.1} max={4} step={0.05} unit="" onChange={(v) => update({ gammaG: v })} />
                <SliderControl label="B gamma" value={s.gammaB} min={0.1} max={4} step={0.05} unit="" onChange={(v) => update({ gammaB: v })} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { label: 'Linear', r: 1, g: 1, b: 1 },
                  { label: 'Bright', r: 0.6, g: 0.6, b: 0.6 },
                  { label: 'Dark', r: 1.8, g: 1.8, b: 1.8 },
                  { label: 'Cool', r: 1.2, g: 0.7, b: 1.5 },
                  { label: 'Warm', r: 0.7, g: 1.0, b: 1.8 },
                ].map(({ label, r, g, b }) => (
                  <button
                    key={label}
                    onClick={() => update({ gammaR: r, gammaG: g, gammaB: b })}
                    className="text-[9px] py-1 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Miller Indices on Micrograph">
              <SelectControl
                label="Mode"
                value={s.microMillerMode}
                options={[
                  { label: 'Off', value: 'off' },
                  { label: 'Main poles', value: 'main' },
                  { label: 'All poles', value: 'all' },
                ]}
                onChange={(v) => update({ microMillerMode: v as 'off' | 'main' | 'all' })}
              />
              {s.microMillerMode !== 'off' && (
                <>
                  <SliderControl label="Font size" value={s.microMillerFont} min={5} max={20} step={1} unit=" px" onChange={(v) => update({ microMillerFont: v })} />
                  <ToggleSwitch label="Pole dots" checked={s.microMillerDots} onChange={(v) => update({ microMillerDots: v })} />
                </>
              )}
            </Panel>

            <Panel title="Ring Calculator">
              <SelectControl
                label="Pole (hkl)"
                value={s.ringPole}
                options={[
                  { label: '(001)/(0001)', value: '001' },
                  { label: '(011)', value: '011' },
                  { label: '(111)', value: '111' },
                  { label: '(112)', value: '112' },
                  { label: '(113)', value: '113' },
                  { label: '(012)', value: '012' },
                  { label: '(100)', value: '100' },
                  { label: '(110)', value: '110' },
                  { label: '(101)', value: '101' },
                  { label: '(102)', value: '102' },
                ]}
                onChange={(v) => update({ ringPole: v })}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-[var(--color-text-muted)] block mb-1">Rings counted</label>
                  <input
                    type="number"
                    value={s.ringsCount}
                    onChange={(e) => update({ ringsCount: Math.max(1, parseInt(e.target.value) || 1) })}
                    min={1}
                    max={20}
                    className="w-full px-2 py-1 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded text-[10px] text-[var(--color-text-primary)]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-[var(--color-text-muted)] block mb-1">θ half-angle (°)</label>
                  <input
                    type="number"
                    value={s.ringTheta}
                    onChange={(e) => update({ ringTheta: Math.max(0, parseFloat(e.target.value) || 0) })}
                    min={0}
                    max={90}
                    step={0.5}
                    className="w-full px-2 py-1 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded text-[10px] text-[var(--color-text-primary)]"
                  />
                </div>
              </div>
              <button className="w-full mt-2 px-2 py-1 text-[10px] font-bold rounded border border-[var(--color-accent-green)] text-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)]/10 transition-all">
                Calculate R from rings
              </button>
              <div className="text-[9px] text-[var(--color-text-muted)] mt-2 bg-[var(--color-bg-tertiary)] p-2 rounded">
                Result: R = {(s.ringsCount / (2 * Math.sin(s.ringTheta * Math.PI / 180))).toFixed(2)} nm
              </div>
            </Panel>
          </>
        )}

        <button
          onClick={doGenerate}
          disabled={generating}
          className="w-full py-2 rounded-lg font-bold text-sm transition-all border border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] hover:bg-[var(--color-accent-cyan)]/10 disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Regenerate Tip'}
        </button>

        <Panel title="Export Image">
          <SelectControl
            label="Resolution"
            value="2048"
            options={[
              { label: '2K (2048)', value: '2048' },
              { label: '3K (3072)', value: '3072' },
              { label: '4K (4096)', value: '4096' },
              { label: '5K (5120)', value: '5120' },
              { label: '8K (8192)', value: '8192' },
            ]}
            onChange={() => {}}
          />
          <button className="w-full mt-2 px-3 py-2 text-[11px] font-bold rounded bg-[var(--color-accent-cyan)] text-white hover:bg-[var(--color-accent-cyan)]/80 transition-all">
            Export PNG
          </button>
        </Panel>

        <Panel title="Selected Atom(s)">
          <div className="text-[9px] text-[var(--color-text-muted)] mb-2 bg-[var(--color-bg-tertiary)] p-2 rounded">
            Click: select • Shift+click: multi-select
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-2 py-1 text-[10px] font-bold rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-all">
              Delete
            </button>
            <button className="flex-1 px-2 py-1 text-[10px] font-bold rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-all">
              Add here
            </button>
            <button className="flex-1 px-2 py-1 text-[10px] font-bold rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-all">
              Clear
            </button>
          </div>
        </Panel>

        <Panel title="Model Info">
          <div className="text-[8px] text-[var(--color-text-muted)] space-y-2 bg-[var(--color-bg-tertiary)] p-2 rounded">
            <div>
              <span className="text-[var(--color-text-primary)] font-bold">Geometry:</span> Sphere cap + cone + Wulff faceting
            </div>
            <div>
              <span className="text-[var(--color-text-primary)] font-bold">Field model:</span> E_pos and image charge effects
            </div>
            <div className="border-t border-[var(--color-border)] pt-2 mt-2">
              <span className="text-[var(--color-accent-cyan)]">References:</span>
              <div>Katnagallu et al. J.Phys.D (2018)</div>
              <div>Klaes et al. Comp.Phys.Comm. (2021)</div>
              <div>Wulff, Z.Kristallogr. (1901)</div>
            </div>
          </div>
        </Panel>

        <EducationPanel title="FIM Theory" icon="📖">
          <p className="mb-2">
            <b>Field Ion Microscopy (FIM)</b> produces atomic-resolution images of a sharp metal tip
            by field-ionizing an imaging gas (He, Ne) near protruding surface atoms. It was invented by
            Erwin Müller in 1951 — the first technique to resolve individual atoms.
          </p>
          <FormulaBlock label="Best Image Field (BIF)">
            F<sub>BIF</sub> — the electric field at which the ionization rate of the imaging gas
            is optimal for a given metal surface. Typical: 20–57 V/nm.
          </FormulaBlock>
          <FormulaBlock label="Field at Tip Apex">
            <div>F = V / (k<sub>f</sub> · r<sub>tip</sub>)</div>
            <div className="text-[9px] text-[var(--color-text-muted)] mt-1">
              V = applied voltage, r<sub>tip</sub> = tip radius, k<sub>f</sub> ≈ 5–8 (geometric factor)
            </div>
          </FormulaBlock>
          <FormulaBlock label="Magnification">
            <div>M = L / (β · r<sub>tip</sub>)</div>
            <div className="text-[9px] text-[var(--color-text-muted)] mt-1">
              L = tip-to-screen distance, β ≈ 1.5 (image compression factor)
            </div>
          </FormulaBlock>
          <DefTerm term="Field evaporation">
            Above a critical field, surface atoms are ionized and removed from the tip — the basis
            of Atom Probe Tomography (APT).
          </DefTerm>
          <DefTerm term="Wulff construction">
            Determines the equilibrium crystal shape by minimizing total surface energy.
            Different {'{hkl}'} facets have different surface energies γ.
          </DefTerm>
        </EducationPanel>

        <EducationPanel title="Crystal Lattices" icon="🔬">
          <DefTerm term="FCC (Face-Centered Cubic)">
            4 atoms per unit cell (corners + face centers). Examples: Cu, Ni, Au, Pt, Ag, Al.
            Coordination number = 12. d<sub>nn</sub> = a/√2.
          </DefTerm>
          <DefTerm term="BCC (Body-Centered Cubic)">
            2 atoms per unit cell (corners + body center). Examples: Fe, W, Cr, Mo, V.
            Coordination number = 8. d<sub>nn</sub> = a√3/2.
          </DefTerm>
          <DefTerm term="HCP (Hexagonal Close-Packed)">
            Effective 6 atoms per unit cell. Examples: Ti, Co, Zr, Hf, Re.
            Coordination number = 12. Ideal c/a = √(8/3) ≈ 1.633.
          </DefTerm>
          <FormulaBlock label="Zone lines on FIM images">
            <div>Zone lines appear where crystallographic planes intersect the tip surface.</div>
            <div className="text-[9px] text-[var(--color-text-muted)] mt-1">
              Poles correspond to low-index directions; rings indicate terrace edges on facets.
            </div>
          </FormulaBlock>
        </EducationPanel>

        <EducationPanel title="Learning Exercises" icon="📝">
          <div className="space-y-2">
            <div className="bg-[var(--color-bg-tertiary)] rounded p-2 border border-[var(--color-border)]">
              <div className="font-semibold text-[var(--color-accent-yellow)] text-[10px] mb-1">Exercise 1</div>
              <div>Compare the FIM patterns of <b>Pt (FCC)</b> vs <b>W (BCC)</b>. Why does Pt show
              a distinct (111) central pole while W shows (110)?</div>
            </div>
            <div className="bg-[var(--color-bg-tertiary)] rounded p-2 border border-[var(--color-border)]">
              <div className="font-semibold text-[var(--color-accent-yellow)] text-[10px] mb-1">Exercise 2</div>
              <div>Increase the tip radius from 20 to 40 nm. How does the number of visible rings
              around each pole change, and why?</div>
            </div>
            <div className="bg-[var(--color-bg-tertiary)] rounded p-2 border border-[var(--color-border)]">
              <div className="font-semibold text-[var(--color-accent-yellow)] text-[10px] mb-1">Exercise 3</div>
              <div>Switch between materials in the same lattice family (e.g. Cu → Ni → Ag, all FCC).
              How does the lattice parameter affect the ring spacing?</div>
            </div>
          </div>
        </EducationPanel>

        <RelatedTools
          toolId="fim"
          links={{
            miller: `?h=${s.poleH}&k=${s.poleK}&l=${s.poleL}&lattice=${latType}&material=${s.matKey}`,
            orbitals: SYMBOL_TO_Z[s.matKey] ? `?z=${SYMBOL_TO_Z[s.matKey]}` : `?element=${s.matKey}`,
          }}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 pt-3 pb-2">
          <TabBar
            tabs={[
              { id: '3d', label: '3D Tip View' },
              { id: 'micro', label: 'Micrograph' },
            ]}
            activeTab={tab}
            onChange={(id) => setTab(id as '3d' | 'micro')}
          />
        </div>
        <div ref={containerRef} className="flex-1 relative min-w-0">
          <canvas ref={canvasRef} className="w-full h-full" />
          {generating && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-primary)]/80">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[var(--color-accent-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <div className="text-sm text-[var(--color-text-muted)]">Generating tip...</div>
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-[var(--color-bg-primary)]/80 px-3 py-2 rounded-lg font-mono text-[11px] text-[var(--color-text-secondary)]">
            <div>Atoms: <span className="text-[var(--color-text-primary)] font-bold">{stats.atoms.toLocaleString()}</span></div>
            <div>Surface: <span className="text-[var(--color-accent-cyan)] font-bold">{stats.surface.toLocaleString()}</span></div>
            <div>R tip: {(s.apexR * dnn / 10).toFixed(1)} nm</div>
            <div>E max: {((s.voltage / (s.apexR * dnn / 10)) * 0.1).toFixed(1)} V/nm</div>
            <div>Pole: ({s.poleH} {s.poleK} {s.poleL})</div>
          </div>
        </div>
      </div>
    </div>
  );
}
