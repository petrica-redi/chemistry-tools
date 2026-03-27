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
}

const INITIAL: FIMState = {
  matKey: 'Pt',
  apexR: 25,
  shankDeg: 5,
  shankLenMul: 2.9,
  poleH: 0, poleK: 0, poleL: 1,
  voltage: 5000,
  alpha: 0.5,
  probeHeight: 0.5,
  fieldExp: 1.5,
  screenDist: 500,
  colormap: 'jet',
  threshold: 8,
  showDim: false,
  lightAz: 45,
  lightEl: 45,
  ambient: 40,
  atomSize: 100,
  wulffFrac: 0,
  projN: 2.0,
  aperture: 60,
  microBright: 1.2,
  microContrast: 1.5,
  spotSize: 1.0,
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
  const zoomRef = useRef(1.0);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, px: 0, py: 0 });
  const animRef = useRef(0);
  const stateRef = useRef(s);
  stateRef.current = s;

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
          mat.lat, st.apexR, st.shankLenMul,
          viewQRef.current.mat(), zoomRef.current,
          panRef.current.x, panRef.current.y,
          st.colormap, st.threshold, st.showDim,
          st.lightAz, st.lightEl, st.ambient / 100, st.atomSize,
        );
      } else {
        renderMicrograph(
          ctx, W, H, atoms, coords, fields,
          mat.lat, st.apexR, st.projN, st.aperture,
          st.microBright, st.microContrast, st.spotSize,
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
          <SliderControl label="Apex radius" value={s.apexR} min={5} max={80} step={1} unit=" d_nn" onChange={(v) => update({ apexR: v })} />
          <SliderControl label="Shank angle" value={s.shankDeg} min={1} max={20} step={0.5} unit="°" onChange={(v) => update({ shankDeg: v })} />
          <SliderControl label="Shank length" value={s.shankLenMul} min={1} max={5} step={0.1} unit="×R" onChange={(v) => update({ shankLenMul: v })} />
          <SliderControl label="Wulff faceting" value={s.wulffFrac} min={0} max={1} step={0.05} unit="" onChange={(v) => update({ wulffFrac: v })} />
        </Panel>

        <Panel title="Crystal Orientation">
          <div className="flex gap-2">
            {(['poleH', 'poleK', 'poleL'] as const).map((key, i) => (
              <div key={key}>
                <label className="text-[9px] text-[var(--color-text-muted)] block mb-1">{['h', 'k', 'l'][i]}</label>
                <input type="number" value={s[key]} onChange={(e) => update({ [key]: +e.target.value })} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1 mt-2">
            {[
              [0,0,1], [0,1,1], [1,1,1], [0,1,2],
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
          <SliderControl label="Voltage" value={s.voltage} min={500} max={20000} step={100} unit=" V" onChange={(v) => update({ voltage: v })} />
          <SliderControl label="Alpha (coord. enhancement)" value={s.alpha} min={0} max={2} step={0.05} unit="" onChange={(v) => update({ alpha: v })} />
          <SliderControl label="Probe height" value={s.probeHeight} min={0} max={2} step={0.05} unit=" d_nn" onChange={(v) => update({ probeHeight: v })} />
          <SliderControl label="Field exponent" value={s.fieldExp} min={0.5} max={4} step={0.1} unit="" onChange={(v) => update({ fieldExp: v })} />
          <SliderControl label="Screen distance" value={s.screenDist} min={10} max={10000} step={10} unit=" nm" onChange={(v) => update({ screenDist: v })} />
        </Panel>

        <Panel title="Display">
          <SelectControl
            label="Colormap"
            value={s.colormap}
            options={[
              { label: 'Jet', value: 'jet' },
              { label: 'Viridis', value: 'viridis' },
              { label: 'Plasma', value: 'plasma' },
              { label: 'Inferno', value: 'inferno' },
              { label: 'Hot', value: 'hot' },
              { label: 'Green', value: 'green' },
              { label: 'Cool-Warm', value: 'coolwarm' },
              { label: 'Turbo', value: 'turbo' },
            ]}
            onChange={(v) => update({ colormap: v as ColormapName })}
          />
          <SliderControl label="Atom size" value={s.atomSize} min={20} max={200} step={5} unit="%" onChange={(v) => update({ atomSize: v })} />
          <ToggleSwitch label="Show bulk atoms" checked={s.showDim} onChange={(v) => update({ showDim: v })} />
          <SliderControl label="Light azimuth" value={s.lightAz} min={0} max={360} step={5} unit="°" onChange={(v) => update({ lightAz: v })} />
          <SliderControl label="Light elevation" value={s.lightEl} min={0} max={90} step={5} unit="°" onChange={(v) => update({ lightEl: v })} />
          <SliderControl label="Ambient" value={s.ambient} min={0} max={100} step={5} unit="%" onChange={(v) => update({ ambient: v })} />
        </Panel>

        {tab === 'micro' && (
          <Panel title="Micrograph">
            <SliderControl label="Projection n" value={s.projN} min={1} max={4} step={0.05} unit="" onChange={(v) => update({ projN: v })} />
            <SliderControl label="Aperture" value={s.aperture} min={20} max={90} step={1} unit="°" onChange={(v) => update({ aperture: v })} />
            <SliderControl label="Brightness" value={s.microBright} min={0.1} max={3} step={0.1} unit="" onChange={(v) => update({ microBright: v })} />
            <SliderControl label="Contrast" value={s.microContrast} min={0.5} max={4} step={0.1} unit="" onChange={(v) => update({ microContrast: v })} />
            <SliderControl label="Spot size" value={s.spotSize} min={0.3} max={3} step={0.1} unit="" onChange={(v) => update({ spotSize: v })} />
            <div className="text-[10px] text-[var(--color-text-muted)] mt-1 bg-[var(--color-bg-tertiary)] p-2 rounded border-l-2 border-[var(--color-accent-green)]">
              n=1: radial | n≈1.65: typical FIM | n=2: stereographic
            </div>
          </Panel>
        )}

        <button
          onClick={doGenerate}
          disabled={generating}
          className="w-full py-2 rounded-lg font-bold text-sm transition-all border border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] hover:bg-[var(--color-accent-cyan)]/10 disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Regenerate Tip'}
        </button>

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
            <div>R = {s.apexR} d<sub>nn</sub> = {(s.apexR * dnn / 10).toFixed(1)} nm</div>
            <div>Pole: ({s.poleH} {s.poleK} {s.poleL})</div>
          </div>
        </div>
      </div>
    </div>
  );
}
