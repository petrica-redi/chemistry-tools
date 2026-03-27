'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  ELEMENTS, zeff, makeOrbitals, genPointCloud, getOccupiedSubs, electronConfigHTML,
  type OrbitalDef,
} from './OrbitalPhysics';
import Panel from '@/components/shared/Panel';
import SliderControl from '@/components/shared/SliderControl';

export default function OrbitalsViewer() {
  const [Z, setZ] = useState(6);
  const [mode, setMode] = useState<'points' | 'iso'>('points');
  const [density, setDensity] = useState(2);
  const [orbitals, setOrbitals] = useState<OrbitalDef[]>(() => makeOrbitals());
  const [showAxes, setShowAxes] = useState(false);
  const [showNucleus, setShowNucleus] = useState(true);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbGroupRef = useRef<THREE.Group>(new THREE.Group());
  const nucleusRef = useRef<THREE.Mesh | null>(null);
  const axesRef = useRef<THREE.Group | null>(null);
  const orbitRef = useRef({ drag: false, px: 0, py: 0, th: 0.6, ph: 1.1, dst: 8, tx: 0, ty: 0 });
  const animRef = useRef<number>(0);

  const occupied = useMemo(() => getOccupiedSubs(Z), [Z]);

  // Initialize Three.js
  useEffect(() => {
    if (!canvasRef.current) return;
    const W = canvasRef.current.clientWidth;
    const H = canvasRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a12);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 500);
    camera.position.set(5, 3, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0x8899bb, 0.55));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(20, 60, 40);
    scene.add(dl);

    // Nucleus
    const nucGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const nucMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0x4a9eff, emissiveIntensity: 0.5 });
    const nuc = new THREE.Mesh(nucGeo, nucMat);
    nucleusRef.current = nuc;
    scene.add(nuc);

    scene.add(orbGroupRef.current);

    // Orbit controls
    const el = renderer.domElement;
    const O = orbitRef.current;

    const onDown = (e: MouseEvent) => { O.drag = true; O.px = e.clientX; O.py = e.clientY; };
    const onMove = (e: MouseEvent) => {
      if (!O.drag) return;
      O.th -= (e.clientX - O.px) * 0.005;
      O.ph = Math.max(0.1, Math.min(Math.PI - 0.1, O.ph - (e.clientY - O.py) * 0.005));
      O.px = e.clientX; O.py = e.clientY;
    };
    const onUp = () => { O.drag = false; };
    const onWheel = (e: WheelEvent) => {
      O.dst = Math.max(1, Math.min(100, O.dst + e.deltaY * 0.01));
      e.preventDefault();
    };

    el.addEventListener('mousedown', onDown);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseup', onUp);
    el.addEventListener('mouseleave', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      camera.position.set(
        O.tx + O.dst * Math.sin(O.ph) * Math.sin(O.th),
        O.ty + O.dst * Math.cos(O.ph),
        O.dst * Math.sin(O.ph) * Math.cos(O.th)
      );
      camera.lookAt(O.tx, O.ty, 0);
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
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseup', onUp);
      el.removeEventListener('mouseleave', onUp);
      el.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (canvasRef.current && renderer.domElement.parentNode === canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update nucleus visibility
  useEffect(() => {
    if (nucleusRef.current) nucleusRef.current.visible = showNucleus;
  }, [showNucleus]);

  // Update axes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (axesRef.current) { scene.remove(axesRef.current); axesRef.current = null; }
    if (showAxes) {
      const g = new THREE.Group();
      const colors = [0xff4444, 0x44ff44, 0x4444ff];
      const dirs = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
      dirs.forEach((d, i) => {
        const arrow = new THREE.ArrowHelper(d, new THREE.Vector3(0, 0, 0), 3, colors[i], 0.2, 0.1);
        g.add(arrow);
      });
      axesRef.current = g;
      scene.add(g);
    }
  }, [showAxes]);

  // Rebuild orbital meshes
  const rebuildOrbitals = useCallback(() => {
    const group = orbGroupRef.current;
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Points;
      if (child.geometry) child.geometry.dispose();
      if ((child as any).material) (child as any).material.dispose();
      group.remove(child);
    }

    const visibleOrbs = orbitals.filter((o) => o.visible);
    if (visibleOrbs.length === 0) return;

    setLoading(true);
    setTimeout(() => {
      for (const orb of visibleOrbs) {
        const Zeff = zeff(Z, orb.n, orb.l);
        const pts = genPointCloud(orb.n, orb.l, orb.m, Zeff, density);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
        const mat = new THREE.PointsMaterial({
          color: new THREE.Color(orb.color),
          size: 0.02,
          transparent: true,
          opacity: orb.opacity,
          sizeAttenuation: true,
          depthWrite: false,
        });
        group.add(new THREE.Points(geo, mat));
      }
      setLoading(false);
    }, 30);
  }, [orbitals, Z, density]);

  useEffect(() => {
    rebuildOrbitals();
  }, [rebuildOrbitals]);

  const toggleOrbital = useCallback((idx: number) => {
    setOrbitals((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], visible: !next[idx].visible };
      return next;
    });
  }, []);

  const toggleSubshell = useCallback((sub: string) => {
    setOrbitals((prev) => {
      const subOrbs = prev.filter((o) => o.sub === sub);
      const allVisible = subOrbs.every((o) => o.visible);
      return prev.map((o) => o.sub === sub ? { ...o, visible: !allVisible } : o);
    });
  }, []);

  // Group orbitals by subshell
  const subshellGroups = useMemo(() => {
    const groups: { sub: string; orbs: (OrbitalDef & { idx: number })[] }[] = [];
    let currentSub = '';
    for (let i = 0; i < orbitals.length; i++) {
      if (orbitals[i].sub !== currentSub) {
        currentSub = orbitals[i].sub;
        groups.push({ sub: currentSub, orbs: [] });
      }
      groups[groups.length - 1].orbs.push({ ...orbitals[i], idx: i });
    }
    return groups;
  }, [orbitals]);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-[340px] min-w-[340px] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex flex-col">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-mono text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] bg-clip-text text-transparent">
            Atomic Orbitals
          </h2>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-1">
            3D Visualization · 1s → 7p · Klechkowski
          </p>
        </div>

        {/* Element selector */}
        <div className="px-5 py-3 border-b border-[var(--color-border)]">
          <label className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] font-mono mb-2 block">
            Element (Z)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={118}
              value={Z}
              onChange={(e) => setZ(+e.target.value)}
              className="flex-1"
            />
            <span className="font-mono text-sm font-bold text-[var(--color-accent-cyan)] min-w-[70px] text-right">
              {ELEMENTS[Z]} ({Z})
            </span>
          </div>
          <div
            className="mt-2 text-[11px] font-mono text-[var(--color-text-secondary)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: electronConfigHTML(Z) }}
          />
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 px-5 py-2 border-b border-[var(--color-border)]">
          {(['points', 'iso'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 rounded-md text-[11px] font-mono font-semibold border transition-all ${
                mode === m
                  ? 'bg-[var(--color-accent-blue)]/10 border-[var(--color-accent-blue)] text-[var(--color-accent-blue)]'
                  : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              {m === 'points' ? 'Point Cloud' : 'Isosurface'}
            </button>
          ))}
        </div>

        {/* Orbital list */}
        <div className="flex-1 overflow-y-auto py-2">
          {subshellGroups.map(({ sub, orbs }) => {
            const isOccupied = occupied[sub] !== undefined;
            const electrons = occupied[sub] || 0;
            const allVisible = orbs.every((o) => o.visible);
            return (
              <div key={sub} className="mx-3 mb-1">
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                    isOccupied
                      ? 'border-[var(--color-accent-blue)]/30 bg-[var(--color-accent-blue)]/5'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)]'
                  } hover:bg-[var(--color-bg-tertiary)]`}
                  onClick={() => toggleSubshell(sub)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold" style={{ color: orbs[0].color }}>
                      {sub}
                    </span>
                    {isOccupied && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-accent-blue)]/15 text-[var(--color-accent-blue)] font-mono">
                        {electrons}e⁻
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-[var(--color-text-muted)]">
                    {allVisible ? '▼' : '▶'} {orbs.length} orb.
                  </span>
                </div>
                {allVisible && (
                  <div className="pl-2 py-1">
                    {orbs.map((o) => (
                      <div key={o.idx} className="flex items-center gap-2 py-1">
                        <div
                          className={`w-7 h-4 rounded-full cursor-pointer transition-colors ${
                            o.visible ? 'bg-[var(--color-accent-blue)]' : 'bg-[var(--color-border)]'
                          }`}
                          onClick={(e) => { e.stopPropagation(); toggleOrbital(o.idx); }}
                        >
                          <div
                            className="w-3 h-3 rounded-full bg-white shadow mt-0.5 transition-transform"
                            style={{ marginLeft: o.visible ? '14px' : '2px' }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                          {o.label}
                        </span>
                        <input
                          type="color"
                          value={o.color}
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                          onChange={(e) => {
                            setOrbitals((prev) => {
                              const next = [...prev];
                              next[o.idx] = { ...next[o.idx], color: e.target.value };
                              return next;
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom controls */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] flex flex-col gap-2">
          <SliderControl label="Zoom" value={orbitRef.current.dst} min={0.5} max={50} step={0.1} onChange={(v) => { orbitRef.current.dst = v; }} />
          <SliderControl label="Density" value={density} min={0} max={4} step={1} onChange={setDensity} formatValue={(v) => ['Low', 'Med', 'High', 'Ultra', 'Max'][v]} />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAxes(!showAxes)}
              className={`flex-1 text-[10px] font-mono py-1.5 rounded border transition-all ${
                showAxes ? 'border-[var(--color-accent-blue)] text-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              Axes
            </button>
            <button
              onClick={() => setShowNucleus(!showNucleus)}
              className={`flex-1 text-[10px] font-mono py-1.5 rounded border transition-all ${
                showNucleus ? 'border-[var(--color-accent-blue)] text-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              Nucleus
            </button>
          </div>
        </div>
      </div>

      {/* 3D View */}
      <div className="flex-1 relative min-w-0">
        <div ref={canvasRef} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 bg-[var(--color-bg-primary)]/80 flex items-center justify-center">
            <span className="font-mono text-sm text-[var(--color-accent-blue)] animate-pulse">
              Computing orbitals...
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4 font-mono text-[11px] text-[var(--color-text-muted)] pointer-events-none leading-relaxed">
          <div>{ELEMENTS[Z]} (Z={Z})</div>
          <div>Zeff: Clementi-Raimondi / Slater</div>
        </div>
      </div>
    </div>
  );
}
