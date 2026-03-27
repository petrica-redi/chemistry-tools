'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CTK_GASES, type MixGas, type CTKParams } from './CTKGasDB';

interface Props {
  params: CTKParams;
  mixA: MixGas[];
  mixB: MixGas[];
}

// Reactor definitions
const RXDEFS: Record<string, { id: number; totalH: number; frit: number; name: string }> = {
  '1': { id: 24, totalH: 40, frit: 2.5, name: 'R1 — ø24mm' },
  '2': { id: 15, totalH: 24, frit: 2, name: 'R2 — ø15mm' },
};

interface ReactorGeometry {
  R: number;
  rT: number;
  tubeLen: number;
  coneH: number;
  y0: number;
  yTubeTop: number;
  yConeTop: number;
  yFritBot: number;
  yFritTop: number;
  yBedTop: number;
  yBodyTop: number;
  yContrBot: number;
  yContrTop: number;
  yOutTop: number;
  def: { id: number; totalH: number; frit: number; name: string };
  bedH: number;
}

interface Particle {
  pos: THREE.Vector3;
  gk: string;
}

const NP = 4500;
const dummy = new THREE.Object3D();

export default function CTK3DView({ params, mixA, mixB }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rxGrpRef = useRef<THREE.Group | null>(null);
  const pMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const pDataRef = useRef<Particle[]>([]);
  const pColRef = useRef<Float32Array | null>(null);
  const rxRef = useRef<ReactorGeometry | null>(null);
  const glassMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  const [selectedRx, setSelectedRx] = useState('1');
  const [particleSize, setParticleSize] = useState(0.35);
  const [particleSpeed, setParticleSpeed] = useState(1);
  const [glassOpacity, setGlassOpacity] = useState(0.08);
  const [phase, setPhase] = useState<'A' | 'B'>('A');
  const [phaseTime, setPhaseTime] = useState(0);
  const [phaseSwitching, setPhaseSwitching] = useState(false);

  const orbitRef = useRef({
    d: false,
    p: false,
    px: 0,
    py: 0,
    th: 0.6,
    ph: 1.1,
    dst: 60,
    tx: 0,
    ty: 25,
    tz: 0,
  });

  const ltRef = useRef(0);
  const cfdTRef = useRef(0);

  // Compute reactor geometry
  function computeRx(): ReactorGeometry {
    const def = RXDEFS[selectedRx];
    const R = def.id / 2;
    const rT = 1.5;
    const tubeLen = 15;
    const coneH = R * 0.8;

    const y0 = 0;
    const yTubeTop = tubeLen;
    const yConeTop = yTubeTop + coneH;
    const yFritBot = yConeTop;
    const yFritTop = yConeTop + def.frit;
    const bedH = Math.min(params.bedH, def.totalH - def.frit);
    const yBedTop = yFritTop + bedH;
    const yBodyTop = yConeTop + def.totalH;
    const yContrBot = yBodyTop;
    const yContrTop = yBodyTop + coneH;
    const yOutTop = yContrTop + tubeLen;

    return {
      R,
      rT,
      tubeLen,
      coneH,
      y0,
      yTubeTop,
      yConeTop,
      yFritBot,
      yFritTop,
      yBedTop,
      yBodyTop,
      yContrBot,
      yContrTop,
      yOutTop,
      def,
      bedH,
    };
  }

  // Vector utilities
  function v3(x: number, y: number, z: number): THREE.Vector3 {
    return new THREE.Vector3(x, y, z);
  }

  function rnd(s: number): number {
    return (Math.random() - 0.5) * s * 2;
  }

  // Random point in cylinder
  function rndInCyl(cx: number, cz: number, R: number, yMin: number, yMax: number): THREE.Vector3 {
    const a = Math.random() * 6.28;
    const rad = Math.random() * R;
    return v3(cx + Math.cos(a) * rad, yMin + Math.random() * (yMax - yMin), cz + Math.sin(a) * rad);
  }

  // Pick a gas from a mixture
  function pickG(mx: MixGas[]): string {
    const active = mx.filter((g) => g.g !== 'none' && g.f > 0);
    if (!active.length) return 'Ar';
    const total = active.reduce((s, g) => s + g.f, 0);
    let r = Math.random() * total;
    for (const g of active) {
      r -= g.f;
      if (r <= 0) return g.g;
    }
    return active[0].g;
  }

  // Get local radius at height
  function localRadius(y: number, rx: ReactorGeometry): number {
    const r = rx;
    if (y < r.y0) return r.rT;
    if (y <= r.yTubeTop) return r.rT;
    if (y <= r.yConeTop) {
      const f = (y - r.yTubeTop) / r.coneH;
      return r.rT + (r.R - r.rT) * f;
    }
    if (y <= r.yBodyTop) return r.R;
    if (y <= r.yContrTop) {
      const f = (y - r.yContrBot) / r.coneH;
      return r.R + (r.rT - r.R) * f;
    }
    return r.rT;
  }

  // Velocity field
  function getVel(pos: THREE.Vector3, rx: ReactorGeometry, spd: number): THREE.Vector3 {
    const base = 15 * spd;
    const r = rx;
    const y = pos.y;
    const x = pos.x;
    const z = pos.z;
    const dA = Math.sqrt(x * x + z * z);
    const areaRatio = (r.R * r.R) / (r.rT * r.rT);
    const vTube = base * areaRatio * 0.15;
    const vBody = base * 0.15;

    if (y < r.yTubeTop) return v3(rnd(0.3), vTube, rnd(0.3));

    if (y >= r.yTubeTop && y < r.yConeTop) {
      const frac = (y - r.yTubeTop) / r.coneH;
      const vUp = vTube * (1 - frac * 0.7);
      const spread = dA > 0.5 ? base * 0.3 * frac : 0;
      return v3((x / Math.max(dA, 0.1)) * spread + rnd(1), vUp + rnd(0.5), (z / Math.max(dA, 0.1)) * spread + rnd(1));
    }

    if (y >= r.yConeTop && y < r.yFritBot) {
      return v3(rnd(2), vBody * 0.5 + rnd(0.5), rnd(2));
    }

    if (y >= r.yFritBot && y < r.yFritTop) {
      return v3(rnd(0.2), vBody * 0.3, rnd(0.2));
    }

    if (y >= r.yFritTop && y < r.yBedTop) {
      return v3(rnd(1.5), vBody * 0.5 + rnd(0.3), rnd(1.5));
    }

    if (y >= r.yBedTop && y < r.yBodyTop) {
      return v3(rnd(0.8), vBody * 1.2 + rnd(0.3), rnd(0.8));
    }

    if (y >= r.yContrBot && y < r.yContrTop) {
      const frac = (y - r.yContrBot) / r.coneH;
      const vUp = vBody + vTube * frac * 0.7;
      const converge = dA > 0.5 ? -base * 0.4 * frac : 0;
      return v3((x / Math.max(dA, 0.1)) * converge + rnd(0.5), vUp, (z / Math.max(dA, 0.1)) * converge + rnd(0.5));
    }

    if (y >= r.yContrTop) return v3(rnd(0.3), vTube, rnd(0.3));

    return v3(rnd(1), vBody, rnd(1));
  }

  // Create cylinder mesh
  function mkCyl(rTop: number, rBot: number, h: number, yCenter: number, glassMat: THREE.Material): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 32, 1, true), glassMat);
    m.position.y = yCenter;
    return m;
  }

  // Set particle color
  function setCol(i: number, gk: string, pCol: Float32Array) {
    const c = new THREE.Color(CTK_GASES[gk]?.color || '#fff');
    pCol[i * 3] = c.r;
    pCol[i * 3 + 1] = c.g;
    pCol[i * 3 + 2] = c.b;
  }

  // Spawn particle anywhere
  function spawnAnywhere(rx: ReactorGeometry): THREE.Vector3 {
    const r = rx;
    const z = Math.random();

    if (z < 0.08) {
      return rndInCyl(0, 0, r.rT * 0.8, r.y0, r.yTubeTop);
    }
    if (z < 0.15) {
      const y = r.yTubeTop + Math.random() * r.coneH;
      const frac = (y - r.yTubeTop) / r.coneH;
      const localR = r.rT + (r.R - r.rT) * frac;
      return rndInCyl(0, 0, localR * 0.9, y, y + 0.1);
    }
    if (z < 0.75) {
      return rndInCyl(0, 0, r.R * 0.92, r.yConeTop, r.yBodyTop);
    }
    if (z < 0.85) {
      const y = r.yContrBot + Math.random() * r.coneH;
      const frac = (y - r.yContrBot) / r.coneH;
      const localR = r.R + (r.rT - r.R) * frac;
      return rndInCyl(0, 0, localR * 0.9, y, y + 0.1);
    }
    return rndInCyl(0, 0, r.rT * 0.8, r.yContrTop, r.yOutTop);
  }

  // Spawn inlet
  function spawnInlet(rx: ReactorGeometry): THREE.Vector3 {
    return rndInCyl(0, 0, rx.rT * 0.7, rx.y0, rx.y0 + 1);
  }

  // Update particles
  function updateP(dt: number, rx: ReactorGeometry, pMesh: THREE.InstancedMesh, pData: Particle[], pCol: Float32Array, spd: number, currentMix: MixGas[]) {
    if (!rx.R) return;

    for (let i = 0; i < NP; i++) {
      const p = pData[i];
      const vel = getVel(p.pos, rx, spd);
      p.pos.x += vel.x * dt;
      p.pos.y += vel.y * dt;
      p.pos.z += vel.z * dt;

      // Radial confinement
      const lR = localRadius(p.pos.y, rx) * 0.92;
      const dA = Math.sqrt(p.pos.x ** 2 + p.pos.z ** 2);
      if (dA > lR && dA > 0.01) {
        const s = lR / dA;
        p.pos.x *= s;
        p.pos.z *= s;
      }

      // Recycle
      let recycle = false;
      if (p.pos.y > rx.yOutTop + 2) recycle = true;
      if (p.pos.y < rx.y0 - 2) recycle = true;

      if (recycle) {
        const sp = spawnInlet(rx);
        p.pos.copy(sp);
        p.gk = pickG(currentMix);
        setCol(i, p.gk, pCol);
      }

      dummy.position.copy(p.pos);
      dummy.scale.setScalar(particleSize);
      dummy.updateMatrix();
      pMesh.setMatrixAt(i, dummy.matrix);
    }
    pMesh.instanceMatrix.needsUpdate = true;
    pMesh.instanceColor!.needsUpdate = true;
  }

  // Build reactor
  function buildRx(rx: ReactorGeometry, scene: THREE.Scene, glassMat: THREE.MeshPhysicalMaterial) {
    const r = rx;

    const newRxGrp = new THREE.Group();

    // Inlet tube
    newRxGrp.add(mkCyl(r.rT, r.rT, r.tubeLen, r.y0 + r.tubeLen / 2, glassMat));

    // Expansion cone
    newRxGrp.add(mkCyl(r.R, r.rT, r.coneH, r.yTubeTop + r.coneH / 2, glassMat));

    // Reactor body
    newRxGrp.add(mkCyl(r.R, r.R, r.def.totalH, r.yConeTop + r.def.totalH / 2, glassMat));

    // Contraction cone
    newRxGrp.add(mkCyl(r.rT, r.R, r.coneH, r.yContrBot + r.coneH / 2, glassMat));

    // Outlet tube
    newRxGrp.add(mkCyl(r.rT, r.rT, r.tubeLen, r.yContrTop + r.tubeLen / 2, glassMat));

    // Frit P4
    const fM = new THREE.MeshPhysicalMaterial({
      color: 0x99aabb,
      transparent: true,
      opacity: 0.45,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const frit = new THREE.Mesh(new THREE.CylinderGeometry(r.R * 0.97, r.R * 0.97, r.def.frit, 32), fM);
    frit.position.y = r.yFritBot + r.def.frit / 2;
    newRxGrp.add(frit);

    // Catalyst grains
    const cM = new THREE.MeshPhysicalMaterial({
      color: 0x667788,
      roughness: 0.5,
      metalness: 0.3,
      transparent: true,
      opacity: 0.45,
    });
    const cG = new THREE.SphereGeometry(1, 6, 4);
    const nG = Math.min(250, Math.round(r.R * r.R * r.bedH * 0.02));
    for (let i = 0; i < nG; i++) {
      const a = Math.random() * 6.28;
      const rad = Math.random() * r.R * 0.88;
      const y = r.yFritTop + Math.random() * r.bedH;
      const m = new THREE.Mesh(cG, cM);
      m.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad);
      m.scale.setScalar(params.dp * 0.7 + Math.random() * params.dp * 0.6);
      newRxGrp.add(m);
    }

    // Arrows
    const aG = new THREE.ConeGeometry(1, 2.5, 8);
    const aIn = new THREE.Mesh(aG, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    aIn.position.set(0, r.y0 - 1.5, 0);
    newRxGrp.add(aIn);
    const aOut = new THREE.Mesh(aG, new THREE.MeshBasicMaterial({ color: 0x34d399 }));
    aOut.position.set(0, r.yOutTop + 2, 0);
    newRxGrp.add(aOut);

    scene.add(newRxGrp);
    return newRxGrp;
  }

  // Initialize particles
  function initP(rx: ReactorGeometry, scene: THREE.Scene): { pMesh: THREE.InstancedMesh; pData: Particle[]; pCol: Float32Array } {
    const pCol = new Float32Array(NP * 3);
    const geo = new THREE.SphereGeometry(0.5, 5, 3);
    const mat = new THREE.MeshPhysicalMaterial({ roughness: 0.3, metalness: 0.15 });
    const pMesh = new THREE.InstancedMesh(geo, mat, NP);
    pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pMesh.instanceColor = new THREE.InstancedBufferAttribute(pCol, 3);
    const pData: Particle[] = [];

    for (let i = 0; i < NP; i++) {
      const pos = spawnAnywhere(rx);
      const gk = pickG(mixA);
      pData.push({ pos: pos.clone(), gk });
      setCol(i, gk, pCol);
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.35);
      dummy.updateMatrix();
      pMesh.setMatrixAt(i, dummy.matrix);
    }
    pMesh.instanceMatrix.needsUpdate = true;
    scene.add(pMesh);

    return { pMesh, pData, pCol };
  }

  // Setup orbit controls
  function setupOrb(el: HTMLCanvasElement) {
    const O = orbitRef.current;
    el.addEventListener('mousedown', (e) => {
      if (e.button === 0) O.d = true;
      if (e.button === 2) O.p = true;
      O.px = e.clientX;
      O.py = e.clientY;
      e.preventDefault();
    });

    el.addEventListener('mousemove', (e) => {
      const dx = e.clientX - O.px;
      const dy = e.clientY - O.py;
      O.px = e.clientX;
      O.py = e.clientY;
      if (O.d) {
        O.th -= dx * 0.005;
        O.ph = Math.max(0.1, Math.min(Math.PI - 0.1, O.ph - dy * 0.005));
      }
      if (O.p) {
        O.tx -= dx * 0.12;
        O.ty += dy * 0.12;
      }
    });

    el.addEventListener('mouseup', () => {
      O.d = false;
      O.p = false;
    });

    el.addEventListener('mouseleave', () => {
      O.d = false;
      O.p = false;
    });

    el.addEventListener('wheel', (e) => {
      O.dst = Math.max(10, Math.min(250, O.dst + e.deltaY * 0.06));
      e.preventDefault();
    });

    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Update camera
  function updCam(camera: THREE.PerspectiveCamera, O: typeof orbitRef.current) {
    camera.position.set(O.tx + O.dst * Math.sin(O.ph) * Math.sin(O.th), O.ty + O.dst * Math.cos(O.ph), O.tz + O.dst * Math.sin(O.ph) * Math.cos(O.th));
    camera.lookAt(O.tx, O.ty, O.tz);
  }

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030610);

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0x8899bb, 0.55));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(20, 60, 40);
    scene.add(dl);
    scene.add(new THREE.DirectionalLight(0x4466aa, 0.25)).position.set(-15, 30, -30);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x99ccee,
      transparent: true,
      opacity: glassOpacity,
      roughness: 0.02,
      metalness: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    glassMatRef.current = glassMat;
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Compute and build reactor
    const rx = computeRx();
    rxRef.current = rx;
    const rxGrp = buildRx(rx, scene, glassMat);
    rxGrpRef.current = rxGrp;

    const O = orbitRef.current;
    O.ty = rx.yBodyTop / 2 + 5;
    O.dst = rx.R * 3.5 + 20;
    O.tx = 0;
    O.tz = 0;
    camera.position.set(rx.R * 2.5, rx.yBodyTop / 2 + 10, rx.R * 3.5);
    camera.lookAt(0, rx.yBodyTop / 2, 0);

    // Initialize particles
    const { pMesh, pData, pCol } = initP(rx, scene);
    pMeshRef.current = pMesh;
    pDataRef.current = pData;
    pColRef.current = pCol;

    setupOrb(canvas);

    // Handle resize
    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let frameId: number;
    const animate = (t: number) => {
      frameId = requestAnimationFrame(animate);

      const now = Date.now();
      const dt = Math.min((now - ltRef.current) / 1000, 0.04) || 0.016;
      ltRef.current = now;

      if (phaseSwitching) {
        cfdTRef.current += dt * particleSpeed;
        setPhaseTime(cfdTRef.current);
      }

      updCam(camera, O);

      if (pMeshRef.current && rxRef.current && pDataRef.current && pColRef.current) {
        const currentMix = phase === 'A' ? mixA : mixB;
        updateP(dt, rxRef.current, pMeshRef.current, pDataRef.current, pColRef.current, particleSpeed, currentMix);
      }

      renderer.render(scene, camera);
    };

    ltRef.current = Date.now();
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [selectedRx, phase, mixA, mixB, params]);

  // Update glass opacity
  useEffect(() => {
    if (glassMatRef.current) {
      glassMatRef.current.opacity = glassOpacity;
    }
  }, [glassOpacity]);

  // Handle phase switch
  const switchPhase = (newPhase: 'A' | 'B') => {
    setPhase(newPhase);
    setPhaseSwitching(true);
    cfdTRef.current = 0;
  };

  // Collect active gases for legend
  const activeGases = new Set<string>();
  [...mixA, ...mixB].forEach((g) => {
    if (g.g !== 'none') activeGases.add(g.g);
  });

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Controls */}
      <div className="bg-[var(--color-bg-primary)] rounded-lg p-3 border border-[var(--color-border)]">
        <div className="flex flex-wrap gap-4 items-center text-sm">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[var(--color-text-secondary)] font-semibold">Reactor</label>
            <select
              value={selectedRx}
              onChange={(e) => setSelectedRx(e.target.value)}
              className="text-xs"
            >
              <option value="1">R1 — ID 24 mm, H 40 mm</option>
              <option value="2">R2 — ID 15 mm, H 24 mm</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[var(--color-text-secondary)] font-semibold">Molecules</label>
            <input
              type="range"
              min="0.08"
              max="1.5"
              step="0.02"
              value={particleSize}
              onChange={(e) => setParticleSize(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-[var(--color-text-secondary)] w-10">{particleSize.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[var(--color-text-secondary)] font-semibold">Speed</label>
            <input
              type="range"
              min="0.1"
              max="8"
              step="0.1"
              value={particleSpeed}
              onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-[var(--color-text-secondary)] w-12">{particleSpeed.toFixed(1)}×</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[var(--color-text-secondary)] font-semibold">Glass</label>
            <input
              type="range"
              min="0.02"
              max="0.3"
              step="0.01"
              value={glassOpacity}
              onChange={(e) => setGlassOpacity(parseFloat(e.target.value))}
              className="w-20"
            />
          </div>

          <div className="flex-grow" />

          <span className="text-xs font-mono text-[var(--color-text-secondary)]">t = {phaseTime.toFixed(2)} s</span>

          <button
            onClick={() => switchPhase('B')}
            disabled={phase === 'B'}
            className="text-xs px-2 py-1 rounded font-mono font-semibold bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-default"
          >
            ▶ A→B
          </button>
          <button
            onClick={() => switchPhase('A')}
            disabled={phase === 'A'}
            className="text-xs px-2 py-1 rounded font-mono font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-500 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-default"
          >
            ▶ B→A
          </button>

          <div
            className="px-2 py-1 rounded text-xs font-semibold text-center min-w-12"
            style={{
              background: phase === 'A' ? '#ef444422' : '#60a5fa22',
              color: phase === 'A' ? '#ef4444' : '#60a5fa',
            }}
          >
            Mix {phase}
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-black/40 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Legend */}
      <div className="bg-[var(--color-bg-primary)] rounded-lg p-3 border border-[var(--color-border)]">
        <div className="flex flex-wrap gap-3">
          {Array.from(activeGases).map((k) => (
            <div key={k} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: CTK_GASES[k]?.color || '#fff' }}
              />
              <span className="font-mono text-[var(--color-text-secondary)]">
                {CTK_GASES[k]?.label || k} (M={CTK_GASES[k]?.M || '?'})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Help text */}
      <div className="text-center text-[8px] text-[var(--color-text-muted)] font-mono">
        Click: rotation · Wheel: zoom · Right-click: pan · Flow: inlet 3mm → expansion → frit P4 → catalyst bed → contraction → outlet 3mm
      </div>
    </div>
  );
}
