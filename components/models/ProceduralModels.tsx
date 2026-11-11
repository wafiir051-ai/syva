'use client';

/**
 * Procedural 3D models for the five subjects. They are built from code so the lab
 * works without any .glb file, and they are sized (about ±0.9 units) to line up with
 * the annotation pins in lib/presets.ts. A real .glb in public/models still wins.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { AssetType } from '@/types/syva';

type V3 = [number, number, number];

const PAL = {
  ink: '#2a2788',
  inkDeep: '#1f1c6b',
  inkDark: '#15124f',
  surface: '#3836a8',
  line: '#5559d9',
  periwinkle: '#9da3f7',
  flame: '#ff7a1f',
  glow: '#3fefff',
  lilac: '#c4c0ff',
  paper: '#f4f4ff',
};

function usePrefersReducedMotion() {
  return useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
}

function Glow({ color, intensity = 1.6 }: { color: string; intensity?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />;
}

function Tube({ points, radius, color, rough = 0.4 }: { points: V3[]; radius: number; color: string; rough?: number }) {
  const geo = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 56, radius, 16, false),
    [points, radius]
  );
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.7} clearcoatRoughness={0.25} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ PC */

function Fan({ position, size = 0.18, color, spin = true }: { position: V3; size?: number; color: string; spin?: boolean }) {
  const blades = useRef<THREE.Group>(null!);
  const reduce = usePrefersReducedMotion();
  useFrame((_, dt) => {
    if (spin && !reduce && blades.current) blades.current.rotation.z += dt * 7;
  });
  return (
    <group position={position}>
      <mesh>
        <torusGeometry args={[size, 0.012, 8, 40]} />
        <Glow color={color} intensity={1.3} />
      </mesh>
      <group ref={blades}>
        {Array.from({ length: 7 }, (_, i) => (
          <group key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]}>
            <mesh position={[size * 0.5, 0, 0]} rotation={[0.55, 0, 0]}>
              <boxGeometry args={[size * 0.82, size * 0.3, 0.008]} />
              <meshStandardMaterial color={PAL.ink} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.2, size * 0.2, 0.03, 20]} />
        <meshStandardMaterial color={PAL.inkDark} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

const PC_TUBE_A: V3[] = [[-0.4, 0.55, -0.26], [-0.46, 0.7, -0.22], [-0.5, 0.82, -0.2]];
const PC_TUBE_B: V3[] = [[-0.3, 0.55, -0.26], [-0.28, 0.7, -0.22], [-0.2, 0.82, -0.2]];

function PcModel() {
  const frame = <meshStandardMaterial color={PAL.line} roughness={0.5} metalness={0.35} />;
  const glass = (
    <meshPhysicalMaterial color={PAL.periwinkle} transparent opacity={0.1} roughness={0.05} metalness={0.2} clearcoat={1} depthWrite={false} />
  );
  return (
    <group>
      {/* chassis: solid back/top/bottom, glass front and sides, corner posts */}
      <mesh position={[0, 0, -0.46]}>
        <boxGeometry args={[1.76, 1.76, 0.04]} />
        {frame}
      </mesh>
      <mesh position={[0, -0.89, 0]}>
        <boxGeometry args={[1.76, 0.04, 0.96]} />
        {frame}
      </mesh>
      <mesh position={[0, 0.89, 0]}>
        <boxGeometry args={[1.76, 0.04, 0.96]} />
        {frame}
      </mesh>
      {[-0.88, 0.88].flatMap((x) => [-0.46, 0.46].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0, z]}>
          <boxGeometry args={[0.05, 1.8, 0.05]} />
          {frame}
        </mesh>
      )))}
      {[-0.89, 0.89].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.02, 1.76, 0.92]} />
          {glass}
        </mesh>
      ))}
      <mesh position={[0, 0, 0.47]}>
        <boxGeometry args={[1.74, 1.76, 0.02]} />
        {glass}
      </mesh>
      {/* RGB edge strips */}
      <mesh position={[-0.84, 0, 0.44]}>
        <boxGeometry args={[0.02, 1.62, 0.02]} />
        <Glow color={PAL.glow} />
      </mesh>
      <mesh position={[0, -0.84, 0.44]}>
        <boxGeometry args={[1.62, 0.02, 0.02]} />
        <Glow color={PAL.flame} />
      </mesh>

      {/* motherboard */}
      <mesh position={[-0.08, 0.1, -0.42]}>
        <boxGeometry args={[1.3, 1.4, 0.03]} />
        <meshStandardMaterial color={PAL.surface} roughness={0.6} />
      </mesh>
      {[[-0.6, 0.15], [-0.6, -0.1], [-0.55, 0.38]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, -0.38]}>
          <boxGeometry args={[0.2, 0.14, 0.05]} />
          <meshStandardMaterial color={PAL.line} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}

      {/* CPU liquid cooler: pump, tubes, radiator */}
      <group position={[-0.35, 0.5, -0.32]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.12, 40]} />
          <meshStandardMaterial color={PAL.inkDeep} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <torusGeometry args={[0.11, 0.012, 8, 40]} />
          <Glow color={PAL.glow} />
        </mesh>
      </group>
      <Tube points={PC_TUBE_A} radius={0.022} color={PAL.periwinkle} />
      <Tube points={PC_TUBE_B} radius={0.022} color={PAL.periwinkle} />
      <mesh position={[-0.35, 0.82, -0.2]}>
        <boxGeometry args={[0.9, 0.1, 0.2]} />
        <meshStandardMaterial color={PAL.inkDeep} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* RAM */}
      {[0.08, 0.2].map((x, i) => (
        <group key={x} position={[x, 0.45, -0.34]}>
          <mesh>
            <boxGeometry args={[0.05, 0.52, 0.16]} />
            <meshStandardMaterial color={PAL.inkDeep} roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.27, 0]}>
            <boxGeometry args={[0.055, 0.03, 0.17]} />
            <Glow color={i ? PAL.flame : PAL.glow} />
          </mesh>
        </group>
      ))}

      {/* GPU, vertically mounted so its fans face the glass */}
      <group position={[-0.05, -0.02, 0.1]}>
        <mesh>
          <boxGeometry args={[1.06, 0.5, 0.1]} />
          <meshStandardMaterial color={PAL.inkDeep} roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.26, 0.02]}>
          <boxGeometry args={[1.06, 0.02, 0.1]} />
          <Glow color={PAL.glow} />
        </mesh>
        {[-0.34, 0, 0.34].map((x) => (
          <Fan key={x} position={[x, 0, 0.056]} size={0.14} color={PAL.glow} />
        ))}
      </group>

      {/* PSU */}
      <mesh position={[0, -0.7, -0.05]}>
        <boxGeometry args={[1.62, 0.32, 0.8]} />
        <meshStandardMaterial color={PAL.inkDeep} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, -0.7, 0.36]}>
        <boxGeometry args={[1.2, 0.04, 0.02]} />
        <Glow color={PAL.flame} intensity={1.1} />
      </mesh>

      {/* intake fans */}
      {[0.5, 0.15, -0.2].map((y) => (
        <Fan key={y} position={[0.68, y, -0.22]} size={0.15} color={PAL.flame} />
      ))}
    </group>
  );
}

/* --------------------------------------------------------------- Heart */

const AORTA: V3[] = [[0.1, 0.3, 0], [0.06, 0.62, 0.04], [0, 0.88, 0], [0.2, 0.92, -0.1], [0.4, 0.72, -0.15], [0.45, 0.4, -0.2]];
const PULMONARY: V3[] = [[-0.05, 0.3, 0.15], [0, 0.55, 0.18], [-0.2, 0.72, 0.1], [-0.34, 0.74, 0]];
const VENA_CAVA: V3[] = [[-0.45, 0.95, -0.1], [-0.46, 0.6, -0.08], [-0.42, 0.3, -0.02], [-0.38, 0.12, 0]];

function HeartModel() {
  const body = useRef<THREE.Group>(null!);
  const reduce = usePrefersReducedMotion();
  useFrame(({ clock }) => {
    if (reduce || !body.current) return;
    // "lub-dub": two quick pulses, then rest
    const p = (clock.elapsedTime * 1.1) % 1;
    const pulse = Math.pow(Math.max(0, Math.sin(p * Math.PI * 2 * 2)), 6) * (p < 0.5 ? 1 : 0.5);
    body.current.scale.setScalar(1 + pulse * 0.05);
  });
  const muscle = <meshPhysicalMaterial color="#e8476d" roughness={0.38} clearcoat={0.7} clearcoatRoughness={0.25} />;
  const atria = <meshPhysicalMaterial color="#d63d62" roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.3} />;
  return (
    <group ref={body} rotation={[0, 0, 0.1]}>
      <mesh position={[0.12, -0.2, 0]} scale={[0.5, 0.64, 0.46]}>
        <sphereGeometry args={[1, 48, 36]} />
        {muscle}
      </mesh>
      <mesh position={[-0.22, -0.12, 0.1]} scale={[0.42, 0.54, 0.4]}>
        <sphereGeometry args={[1, 48, 36]} />
        {muscle}
      </mesh>
      <mesh position={[0.08, -0.6, 0]} scale={[0.3, 0.4, 0.3]}>
        <sphereGeometry args={[1, 32, 24]} />
        {muscle}
      </mesh>
      <mesh position={[-0.36, 0.2, 0.05]} scale={[0.3, 0.3, 0.28]}>
        <sphereGeometry args={[1, 32, 24]} />
        {atria}
      </mesh>
      <mesh position={[0.3, 0.22, -0.1]} scale={[0.27, 0.27, 0.25]}>
        <sphereGeometry args={[1, 32, 24]} />
        {atria}
      </mesh>
      <Tube points={AORTA} radius={0.105} color="#ff6b8b" />
      <Tube points={PULMONARY} radius={0.085} color={PAL.periwinkle} />
      <Tube points={VENA_CAVA} radius={0.085} color="#5b5bf0" />
    </group>
  );
}

/* --------------------------------------------------------------- Earth */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  if (g) draw(g);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function earthTexture() {
  return makeTexture(1024, 512, (g) => {
    const sea = g.createLinearGradient(0, 0, 0, 512);
    sea.addColorStop(0, '#2456d6');
    sea.addColorStop(0.5, '#2f7bff');
    sea.addColorStop(1, '#2456d6');
    g.fillStyle = sea;
    g.fillRect(0, 0, 1024, 512);
    const r = seeded(7);
    for (const [cx, cy] of [[200, 170], [330, 300], [560, 190], [640, 260], [820, 170], [880, 340], [470, 370]]) {
      for (let i = 0; i < 16; i++) {
        g.fillStyle = r() > 0.3 ? '#3fbf6e' : '#c9b068';
        g.beginPath();
        g.ellipse(cx + (r() - 0.5) * 160, cy + (r() - 0.5) * 90, 20 + r() * 46, 14 + r() * 30, r() * 3, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.fillStyle = PAL.paper;
    g.fillRect(0, 0, 1024, 24);
    g.fillRect(0, 488, 1024, 24);
  });
}

function cloudTexture() {
  return makeTexture(1024, 512, (g) => {
    const r = seeded(21);
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.3})`;
      g.beginPath();
      g.ellipse(r() * 1024, 60 + r() * 392, 24 + r() * 60, 6 + r() * 14, 0, 0, Math.PI * 2);
      g.fill();
    }
  });
}

function layersTexture() {
  return makeTexture(512, 512, (g) => {
    const rings: [number, string][] = [
      [256, '#6b3d22'],
      [210, '#e0551a'],
      [185, '#ff7a1f'],
      [92, '#ffd84a'],
    ];
    for (const [rad, color] of rings) {
      g.fillStyle = color;
      g.beginPath();
      g.arc(256, 256, rad, 0, Math.PI * 2);
      g.fill();
    }
  });
}

/** The wedge removed from the front, in radians around the Y axis (front = +Z = π/2). */
const CUT_START = Math.PI / 4;
const CUT_END = (Math.PI * 3) / 4;

function EarthModel() {
  const sat = useRef<THREE.Group>(null!);
  const clouds = useRef<THREE.Mesh>(null!);
  const reduce = usePrefersReducedMotion();
  const [earthMap, cloudMap, layerMap] = useMemo(() => [earthTexture(), cloudTexture(), layersTexture()], []);
  const R = 0.78;

  useFrame((_, dt) => {
    if (reduce) return;
    if (sat.current) sat.current.rotation.z += dt * 0.7;
    if (clouds.current) clouds.current.rotation.y += dt * 0.05;
  });

  return (
    <group rotation={[0.12, 0, 0]}>
      {/* crust with a cut-away wedge */}
      <mesh>
        <sphereGeometry args={[R, 64, 48, CUT_END, Math.PI * 2 - (CUT_END - CUT_START)]} />
        <meshStandardMaterial map={earthMap} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[R * 1.02, 48, 36, CUT_END, Math.PI * 2 - (CUT_END - CUT_START)]} />
        <meshStandardMaterial map={cloudMap} transparent depthWrite={false} roughness={1} />
      </mesh>
      {/* layered cut faces */}
      {[CUT_START, CUT_END].map((phi) => (
        <mesh key={phi} rotation={[0, phi - Math.PI, 0]}>
          <circleGeometry args={[R, 48, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial map={layerMap} side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.28, 32, 24]} />
        <Glow color="#ffd84a" intensity={1.2} />
      </mesh>
      {/* atmosphere halo */}
      <mesh>
        <sphereGeometry args={[R * 1.1, 48, 36]} />
        <meshBasicMaterial color={PAL.glow} transparent opacity={0.1} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* equator */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R * 1.005, 0.007, 8, 96]} />
        <Glow color={PAL.flame} intensity={1.2} />
      </mesh>
      {/* satellite orbit */}
      <group rotation={[1, 0.3, 0.2]}>
        <mesh>
          <torusGeometry args={[1.04, 0.006, 8, 120]} />
          <meshBasicMaterial color={PAL.periwinkle} transparent opacity={0.8} />
        </mesh>
        <group ref={sat}>
          <group position={[1.04, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.09, 0.09, 0.09]} />
              <meshStandardMaterial color={PAL.paper} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.001, 0.13]}>
              <boxGeometry args={[0.02, 0.1, 0.2]} />
              <Glow color={PAL.glow} intensity={1} />
            </mesh>
            <mesh position={[0, 0.001, -0.13]}>
              <boxGeometry args={[0.02, 0.1, 0.2]} />
              <Glow color={PAL.glow} intensity={1} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/* --------------------------------------------------------------- Rubik */

const STICKERS: { dir: V3; rot: V3; color: string }[] = [
  { dir: [1, 0, 0], rot: [0, Math.PI / 2, 0], color: PAL.flame },
  { dir: [-1, 0, 0], rot: [0, -Math.PI / 2, 0], color: '#ff6b8b' },
  { dir: [0, 1, 0], rot: [-Math.PI / 2, 0, 0], color: PAL.paper },
  { dir: [0, -1, 0], rot: [Math.PI / 2, 0, 0], color: '#ffc94d' },
  { dir: [0, 0, 1], rot: [0, 0, 0], color: PAL.glow },
  { dir: [0, 0, -1], rot: [0, Math.PI, 0], color: PAL.lilac },
];

const STEP = 0.37;
const CUBE = 0.35;
const AXES = [
  { dir: [1, 0, 0] as V3, rot: [0, 0, -Math.PI / 2] as V3, color: PAL.flame },
  { dir: [0, 1, 0] as V3, rot: [0, 0, 0] as V3, color: PAL.glow },
  { dir: [0, 0, 1] as V3, rot: [Math.PI / 2, 0, 0] as V3, color: PAL.lilac },
];

function MiniCube({ at }: { at: V3 }) {
  return (
    <group position={[at[0] * STEP, at[1] * STEP, at[2] * STEP]}>
      <RoundedBox args={[CUBE, CUBE, CUBE]} radius={0.04} smoothness={2}>
        <meshStandardMaterial color={PAL.inkDark} roughness={0.5} />
      </RoundedBox>
      {STICKERS.filter((s) => s.dir[0] * at[0] + s.dir[1] * at[1] + s.dir[2] * at[2] === 1).map((s) => (
        <mesh
          key={s.color}
          position={[s.dir[0] * (CUBE / 2 + 0.002), s.dir[1] * (CUBE / 2 + 0.002), s.dir[2] * (CUBE / 2 + 0.002)]}
          rotation={s.rot}
        >
          <planeGeometry args={[CUBE * 0.82, CUBE * 0.82]} />
          <meshStandardMaterial color={s.color} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function RubikModel() {
  const top = useRef<THREE.Group>(null!);
  const reduce = usePrefersReducedMotion();
  const cubes = useMemo(() => {
    const all: { at: V3; top: boolean }[] = [];
    for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) for (const k of [-1, 0, 1]) all.push({ at: [i, j, k], top: j === 1 });
    return all;
  }, []);

  useFrame(({ clock }) => {
    if (reduce || !top.current) return;
    // the top layer turns a quarter every three seconds
    const cycle = clock.elapsedTime / 3;
    const n = Math.floor(cycle);
    const ph = cycle - n;
    const e = ph > 0.7 ? 0.5 - 0.5 * Math.cos(((ph - 0.7) / 0.3) * Math.PI) : 0;
    top.current.rotation.y = (n + e) * (Math.PI / 2);
  });

  return (
    <group rotation={[0.15, 0, 0]}>
      {cubes.filter((c) => !c.top).map((c) => <MiniCube key={c.at.join()} at={c.at} />)}
      <group ref={top}>
        {cubes.filter((c) => c.top).map((c) => <MiniCube key={c.at.join()} at={c.at} />)}
      </group>
      {AXES.map((a) => (
        <group key={a.color} rotation={a.rot}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 1, 12]} />
            <Glow color={a.color} intensity={1.2} />
          </mesh>
          <mesh position={[0, 0.98, 0]}>
            <coneGeometry args={[0.045, 0.12, 16]} />
            <Glow color={a.color} intensity={1.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ----------------------------------------------------------- Colosseum */

function archTexture() {
  return makeTexture(2048, 512, (g) => {
    g.fillStyle = '#d9c19a';
    g.fillRect(0, 0, 2048, 512);
    const arches = 32;
    const cw = 2048 / arches;
    for (let row = 0; row < 3; row++) {
      const y0 = 20 + row * 140;
      for (let i = 0; i < arches; i++) {
        const x0 = i * cw + cw * 0.2;
        const w = cw * 0.6;
        g.fillStyle = '#3a2e5a';
        g.beginPath();
        g.moveTo(x0, y0 + 120);
        g.lineTo(x0, y0 + w / 2);
        g.arc(x0 + w / 2, y0 + w / 2, w / 2, Math.PI, 0);
        g.lineTo(x0 + w, y0 + 120);
        g.closePath();
        g.fill();
      }
      g.fillStyle = 'rgba(80,55,30,0.35)';
      g.fillRect(0, y0 + 126, 2048, 6);
    }
    g.fillStyle = '#c9ad82';
    g.fillRect(0, 440, 2048, 72);
    for (let i = 0; i < arches; i++) {
      g.fillStyle = '#3a2e5a';
      g.fillRect(i * cw + cw * 0.4, 462, cw * 0.2, 30);
    }
  });
}

function ColosseumModel() {
  const wallMap = useMemo(() => {
    const t = archTexture();
    t.wrapS = THREE.RepeatWrapping;
    return t;
  }, []);
  const tiers = [0, 1, 2, 3];
  const r = (i: number) => 0.46 + i * 0.1;
  const y = (i: number) => -0.32 + i * 0.14;
  return (
    <group scale={[1, 1, 0.8]}>
      {/* outer arcade wall, open at the front so the inside shows */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.8, 96, 1, true, 0.9, Math.PI * 2 - 1.8]} />
        <meshStandardMaterial map={wallMap} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* seating tiers (cavea) */}
      {tiers.map((i) => (
        <group key={i}>
          <mesh position={[0, y(i), 0]}>
            <cylinderGeometry args={[r(i), r(i), 0.14, 64, 1, true]} />
            <meshStandardMaterial color="#b99a6c" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, y(i) + 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r(i), r(i) + 0.1, 64]} />
            <meshStandardMaterial color="#e2cb9d" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* arena floor with the hypogeum grid */}
      <mesh position={[0, -0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.46, 64]} />
        <meshStandardMaterial color="#eed9a8" roughness={1} />
      </mesh>
      {[-0.24, -0.08, 0.08, 0.24].map((v) => (
        <group key={v}>
          <mesh position={[v, -0.335, 0]}>
            <boxGeometry args={[0.012, 0.004, 0.8]} />
            <meshStandardMaterial color="#6b5a86" />
          </mesh>
          <mesh position={[0, -0.335, v]}>
            <boxGeometry args={[0.8, 0.004, 0.012]} />
            <meshStandardMaterial color="#6b5a86" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------- API */

const MODELS: Partial<Record<AssetType, () => React.JSX.Element>> = {
  PC_GAMING: PcModel,
  ORGAN_HEART: HeartModel,
  EARTH_GRAVITY: EarthModel,
  GEOMETRY_MATH: RubikModel,
  COLOSSEUM: ColosseumModel,
};

export function hasProceduralModel(asset: AssetType): boolean {
  return asset in MODELS;
}

/** Slowly turns by itself unless `autoRotate` is false (the landing page drives rotation from scroll). */
export default function ProceduralModel({ asset, autoRotate = true }: { asset: AssetType; autoRotate?: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const reduce = usePrefersReducedMotion();
  useFrame((_, dt) => {
    if (autoRotate && !reduce && group.current) group.current.rotation.y += dt * 0.25;
  });
  const Model = MODELS[asset];
  if (!Model) return null;
  return (
    <group ref={group}>
      <Model />
    </group>
  );
}
