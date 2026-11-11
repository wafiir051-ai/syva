'use client';

import { useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { MotionValue } from 'motion/react';
import ProceduralModel from '@/components/models/ProceduralModels';
import StageLights from '@/components/models/StageLights';
import type { AssetType, SyvaAnnotation } from '@/types/syva';

/** Turns and scales the model from scroll progress. Between two subjects it shrinks out and pops back in. */
function Rig({ progress, count, reduced, children }: { progress: MotionValue<number>; count: number; reduced: boolean; children: ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = reduced ? 0.12 : progress.get();
    const seg = Math.min(count - 0.0001, Math.max(0, p * count));
    const local = seg - Math.floor(seg);
    const edge = Math.min(local, 1 - local);
    const pop = reduced ? 1 : THREE.MathUtils.smoothstep(edge, 0, 0.14);
    g.scale.setScalar(0.001 + pop);
    g.rotation.y = 0.5 + p * Math.PI * 2 * 2.4;
    g.rotation.x = reduced ? 0 : Math.sin(p * Math.PI * 2 * count) * 0.08;
  });
  return <group ref={group}>{children}</group>;
}

function Pin({ pin, index, active }: { pin: SyvaAnnotation; index: number; active: boolean }) {
  return (
    <Html position={pin.position} center zIndexRange={[20, 0]}>
      <div className="pointer-events-none flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold transition-transform duration-200 ${
            active ? 'scale-110 border-flame bg-flame text-ink-deep' : 'border-line bg-ink-deep text-white'
          }`}
        >
          {index + 1}
        </span>
        {active && (
          <span className="whitespace-nowrap rounded-full border border-line bg-ink-deep px-2.5 py-1 text-xs font-medium text-white">
            {pin.label}
          </span>
        )}
      </div>
    </Html>
  );
}

export interface ScrollModelStageProps {
  progress: MotionValue<number>;
  count: number;
  asset: AssetType;
  pins: SyvaAnnotation[];
  activePin: number;
  showPins: boolean;
  /** Only render frames while the section is on screen. */
  running: boolean;
  reduced: boolean;
}

export default function ScrollModelStage({ progress, count, asset, pins, activePin, showPins, running, reduced }: ScrollModelStageProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.3, 5.8], fov: 38 }}
      frameloop={running ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'pan-y' }}
    >
      <StageLights />

      <Rig progress={progress} count={count} reduced={reduced}>
        <ProceduralModel key={asset} asset={asset} autoRotate={false} />
        {showPins && pins.map((pin, i) => <Pin key={pin.id} pin={pin} index={i} active={i === activePin} />)}
      </Rig>
    </Canvas>
  );
}
