'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  ELEMENTS_DB, type LatticeType,
  generateLatticePositions, atomDistToPlane, nearestNeighborDist,
} from './MillerEngine';
import Panel from '@/components/shared/Panel';
import SliderControl from '@/components/shared/SliderControl';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

interface MillerState {
  element: string;
  lattice: LatticeType;
  h: number;
  k: number;
  l: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  showPlane: boolean;
  cutAtoms: boolean;
  showAxes: boolean;
  atomSize: number;
}

const INITIAL: MillerState = {
  element: '',
  lattice: 'FCC',
  h: 1, k: 1, l: 1,
  sizeX: 5, sizeY: 5, sizeZ: 5,
  showPlane: true,
  cutAtoms: true,
  showAxes: true,
  atomSize: 100,
};

export default function MillerViewer() {
  const [s, setS] = useState<MillerState>(INITIAL);
  const [stats, setStats] = useState({ atoms: 0, surface: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group>(new THREE.Group());
  const axesRef = useRef<THREE.AxesHelper | null>(null);
  const orbitRef = useRef({ drag: false, pan: false, px: 0, py: 0, th: Math.PI / 4, ph: Math.PI / 4, dst: 25, tx: 0, ty: 0, tz: 0 });
  const animRef = useRef<number>(0);

  const update = useCallback((patch: Partial<MillerState>) => {
    setS((prev) => {
      const next = { ...prev, ...patch };
      if (patch.element && patch.element !== '' && ELEMENTS_DB[patch.element]) {
        const el = ELEMENTS_DB[patch.element];
        next.lattice = el.lattice as LatticeType;
      }
      return next;
    });
  }, []);

  // Initialize Three.js
  useEffect(() => {
    if (!canvasRef.current) return;
    const W = canvasRef.current.clientWidth;
    const H = canvasRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a12);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
    camera.position.set(15, 15, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(50, 50, 50);
    scene.add(dl);
    scene.add(new THREE.AmbientLight(0x404040, 0.6));
    scene.add(new THREE.DirectionalLight(0x4fc3f7, 0.4).translateX(-50).translateY(-50));

    scene.add(groupRef.current);

    const el = renderer.domElement;
    const O = orbitRef.current;

    const onDown = (e: MouseEvent) => {
      if (e.button === 0) O.drag = true;
      if (e.button === 2) O.pan = true;
      O.px = e.clientX; O.py = e.clientY;
    };
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - O.px, dy = e.clientY - O.py;
      O.px = e.clientX; O.py = e.clientY;
      if (O.drag) {
        O.th += dx * 0.01;
        O.ph = Math.max(0.1, Math.min(Math.PI - 0.1, O.ph + dy * 0.01));
      }
      if (O.pan) {
        O.tx -= dx * 0.05;
        O.ty += dy * 0.05;
      }
    };
    const onUp = () => { O.drag = false; O.pan = false; };
    const onWheel = (e: WheelEvent) => {
      O.dst = Math.max(5, Math.min(100, O.dst + e.deltaY * 0.03));
      e.preventDefault();
    };

    el.addEventListener('mousedown', onDown);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseup', onUp);
    el.addEventListener('mouseleave', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('contextmenu', (e) => e.preventDefault());

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      camera.position.set(
        O.tx + O.dst * Math.sin(O.ph) * Math.cos(O.th),
        O.ty + O.dst * Math.cos(O.ph),
        O.tz + O.dst * Math.sin(O.ph) * Math.sin(O.th)
      );
      camera.lookAt(O.tx, O.ty, O.tz);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (canvasRef.current && renderer.domElement.parentNode === canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Rebuild crystal
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear
    const group = groupRef.current;
    while (group.children.length > 0) {
      const child = group.children[0];
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) (child as any).material.dispose();
      group.remove(child);
    }
    if (axesRef.current) { scene.remove(axesRef.current); axesRef.current = null; }

    // Axes
    if (s.showAxes) {
      const ax = new THREE.AxesHelper(10);
      axesRef.current = ax;
      scene.add(ax);
    }

    // Generate lattice
    const positions = generateLatticePositions(s.lattice, s.sizeX, s.sizeY, s.sizeZ);
    const { h, k, l } = s;
    const normalLen = Math.sqrt(h * h + k * k + l * l);

    const atomColor = s.element && ELEMENTS_DB[s.element]
      ? ELEMENTS_DB[s.element].color
      : '#E5E4E2';

    const nnDist = nearestNeighborDist(s.lattice);
    const radius = (nnDist / 2) * (s.atomSize / 100);
    const sphereGeo = new THREE.SphereGeometry(radius, 16, 12);

    let surfaceCount = 0;
    const surfaceMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#4fc3f7'),
      metalness: 0.6, roughness: 0.2,
    });
    const bulkMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(atomColor),
      metalness: 0.4, roughness: 0.3,
    });

    for (const pos of positions) {
      const dist = normalLen > 0 ? atomDistToPlane(pos, h, k, l) : 0;
      if (s.cutAtoms && normalLen > 0 && dist > 0.01) continue;

      const isSurface = normalLen > 0 && Math.abs(dist) < 0.3;
      if (isSurface) surfaceCount++;

      const mesh = new THREE.Mesh(sphereGeo, isSurface ? surfaceMat : bulkMat);
      mesh.position.copy(pos);
      group.add(mesh);
    }

    // Miller plane
    if (s.showPlane && normalLen > 0) {
      const planeGeo = new THREE.PlaneGeometry(s.sizeX * 3, s.sizeY * 3);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x4fc3f7,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      const normal = new THREE.Vector3(h, k, l).normalize();
      planeMesh.lookAt(normal);
      group.add(planeMesh);

      // Plane border
      const edgeGeo = new THREE.EdgesGeometry(planeGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.4 });
      const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);
      edgeMesh.lookAt(normal);
      group.add(edgeMesh);
    }

    setStats({ atoms: group.children.length, surface: surfaceCount });
  }, [s]);

  const elemGroups = {
    FCC: Object.entries(ELEMENTS_DB).filter(([, v]) => v.lattice === 'FCC'),
    BCC: Object.entries(ELEMENTS_DB).filter(([, v]) => v.lattice === 'BCC'),
    HCP: Object.entries(ELEMENTS_DB).filter(([, v]) => v.lattice === 'HCP'),
  };

  return (
    <div className="flex h-full">
      <div className="w-[320px] min-w-[320px] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 flex flex-col gap-3">
        <Panel title="Element">
          <select value={s.element} onChange={(e) => update({ element: e.target.value })}>
            <option value="">Generic</option>
            {Object.entries(elemGroups).map(([lattice, elems]) => (
              <optgroup key={lattice} label={lattice}>
                {elems.map(([sym, data]) => (
                  <option key={sym} value={sym}>
                    {sym} — {data.name} ({data.a} Å)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Panel>

        <Panel title="Lattice Type">
          <select value={s.lattice} onChange={(e) => update({ lattice: e.target.value as LatticeType })}>
            <option value="SC">SC — Simple Cubic</option>
            <option value="BCC">BCC — Body-Centered Cubic</option>
            <option value="FCC">FCC — Face-Centered Cubic</option>
            <option value="HCP">HCP — Hexagonal Close-Packed</option>
          </select>
        </Panel>

        <Panel title={`Miller Indices (${s.lattice === 'HCP' ? 'h k i l' : 'h k l'})`}>
          <div className="flex gap-2">
            <div>
              <label className="text-[9px] text-[var(--color-text-muted)] block mb-1">h</label>
              <input type="number" value={s.h} onChange={(e) => update({ h: +e.target.value })} />
            </div>
            <div>
              <label className="text-[9px] text-[var(--color-text-muted)] block mb-1">k</label>
              <input type="number" value={s.k} onChange={(e) => update({ k: +e.target.value })} />
            </div>
            <div>
              <label className="text-[9px] text-[var(--color-text-muted)] block mb-1">l</label>
              <input type="number" value={s.l} onChange={(e) => update({ l: +e.target.value })} />
            </div>
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-2 bg-[var(--color-bg-tertiary)] p-2 rounded border-l-2 border-[var(--color-accent-cyan)]">
            ({s.h} {s.k} {s.l}) plane — surface atoms highlighted in cyan
          </div>
        </Panel>

        <Panel title="Box Size (atoms)">
          <div className="flex gap-2">
            {(['sizeX', 'sizeY', 'sizeZ'] as const).map((key, i) => (
              <div key={key}>
                <label className="text-[9px] text-[var(--color-text-muted)] block mb-1">{['X', 'Y', 'Z'][i]}</label>
                <input type="number" value={s[key]} min={1} max={20} onChange={(e) => update({ [key]: +e.target.value })} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Display">
          <ToggleSwitch label="Show cutting plane" checked={s.showPlane} onChange={(v) => update({ showPlane: v })} color="var(--color-accent-cyan)" />
          <ToggleSwitch label="Cut atoms above plane" checked={s.cutAtoms} onChange={(v) => update({ cutAtoms: v })} color="var(--color-accent-blue)" />
          <ToggleSwitch label="Show axes" checked={s.showAxes} onChange={(v) => update({ showAxes: v })} />
          <SliderControl label="Atom size" value={s.atomSize} min={10} max={150} step={5} unit="%" onChange={(v) => update({ atomSize: v })} />
        </Panel>

        <Panel title="Quick Surfaces">
          <div className="grid grid-cols-3 gap-1">
            {[
              [1, 0, 0], [1, 1, 0], [1, 1, 1],
              [2, 1, 0], [2, 1, 1], [3, 1, 1],
            ].map(([h, k, l]) => (
              <button
                key={`${h}${k}${l}`}
                onClick={() => update({ h, k, l })}
                className={`text-[10px] font-mono py-1.5 rounded border transition-all ${
                  s.h === h && s.k === k && s.l === l
                    ? 'border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)] bg-[var(--color-accent-cyan)]/10'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-cyan)]'
                }`}
              >
                ({h}{k}{l})
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="flex-1 relative min-w-0">
        <div ref={canvasRef} className="w-full h-full" />
        <div className="absolute top-3 right-3 bg-[var(--color-bg-primary)]/80 px-3 py-2 rounded-lg font-mono text-[11px] text-[var(--color-text-secondary)]">
          <div>Atoms: <span className="text-[var(--color-text-primary)] font-bold">{stats.atoms}</span></div>
          <div>Surface: <span className="text-[var(--color-accent-cyan)] font-bold">{stats.surface}</span></div>
          <div>Lattice: <span className="text-[var(--color-text-primary)] font-bold">{s.lattice}</span></div>
          <div>Plane: <span className="text-[var(--color-accent-cyan)] font-bold">({s.h} {s.k} {s.l})</span></div>
        </div>
      </div>
    </div>
  );
}
