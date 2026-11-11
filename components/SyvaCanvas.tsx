// components/SyvaCanvas.tsx
'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text, OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import { useRef, memo, Suspense, useMemo, Component, ReactNode, useState, useEffect } from 'react';
import * as THREE from 'three';
import { SyvaModule, SyvaNode, SyvaAnnotation, AssetType } from '@/types/syva';
import ProceduralModel, { hasProceduralModel } from '@/components/models/ProceduralModels';

const GLB_FILE_MAP: Partial<Record<AssetType, string>> = {
  PC_GAMING: '/models/pc.glb',
  ORGAN_HEART: '/models/heart.glb',
  COLOSSEUM: '/models/colloseum.glb',
  EARTH_GRAVITY: '/models/earth.glb',
  GEOMETRY_MATH: '/models/rubik.glb',
};

interface EBProps { fallback: ReactNode; children: ReactNode }
interface EBState { hasError: boolean }

class GLTFErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('Aset 3D gagal dimuatkan, beralih ke fallback:', error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function SpatialAnnotationPin({
  anno,
  isDark,
  handPos,
  fingerCount,
  onSelectAnnotation,
}: {
  anno: SyvaAnnotation;
  isDark: boolean;
  handPos: { x: number; y: number };
  fingerCount: number;
  onSelectAnnotation?: (anno: SyvaAnnotation) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const pinRef = useRef<HTMLDivElement>(null!);
  const { camera } = useThree();

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useFrame(() => {
    if (!pinRef.current) return;

    const isPointingMode = fingerCount >= 1 && fingerCount <= 4;

    if (isPointingMode) {
      const vec = new THREE.Vector3(...anno.position);
      vec.project(camera);

      const screenX = (vec.x + 1) / 2;
      const screenY = (-vec.y + 1) / 2;

      const dx = handPos.x - screenX;
      const dy = handPos.y - screenY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.09) {
        if (!isOpenRef.current) {
          isOpenRef.current = true;
          setTimeout(() => {
            setIsOpen(true);
            if (onSelectAnnotation) {
              onSelectAnnotation(anno);
            }
          }, 0);
        }
      } else {
        if (isOpenRef.current) {
          isOpenRef.current = false;
          setTimeout(() => {
            setIsOpen(false);
          }, 0);
        }
      }
    }
  });

  const handlePinClick = () => {
    const nextState = !isOpen;
    isOpenRef.current = nextState;
    setIsOpen(nextState);
    if (nextState && onSelectAnnotation) {
      onSelectAnnotation(anno);
    }
  };

  return (
    <Html position={anno.position} center distanceFactor={8}>
      <div ref={pinRef} className="relative group font-sans select-none pointer-events-auto">
        <button
          type="button"
          onClick={handlePinClick}
          className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
            isOpen
              ? 'bg-flame scale-125 ring-4 ring-flame/50'
              : 'bg-flame hover:scale-125 hover:bg-flame-hi'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute" />
          <span className="w-2.5 h-2.5 rounded-full bg-white relative z-10" />
        </button>

        <div
          className={`absolute left-9 top-1/2 -translate-y-1/2 w-56 p-3 rounded-xl border shadow-2xl transition-all duration-200 ${
            isOpen
              ? 'opacity-100 scale-100 pointer-events-auto z-50'
              : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-40'
          } ${
            isDark
              ? 'bg-ink-deep border-line text-white shadow-ink-deep/60'
              : 'bg-white border-paper-line text-ink-deep shadow-paper-line/60'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-1 mb-1 border-current/20">
            <span className={`text-[11px] font-extrabold tracking-wide ${isDark ? 'text-glow' : 'text-surface'}`}>
              {anno.label}
            </span>
            <span className="text-[9px] font-mono px-1 rounded bg-flame text-ink-deep">
              {anno.subtitle}
            </span>
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">{anno.description}</p>
        </div>
      </div>
    </Html>
  );
}

function AutoScaledGLTF({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null!);

  const normalizedScene = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.geometry) {
          mesh.geometry.computeVertexNormals();
        }
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = maxDim > 0 ? 2.4 / maxDim : 1;

    cloned.position.x = -center.x * targetScale;
    cloned.position.y = -center.y * targetScale;
    cloned.position.z = -center.z * targetScale;

    cloned.scale.set(targetScale, targetScale, targetScale);

    return cloned;
  }, [scene]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
    </group>
  );
}

function DefaultFallbackMesh({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.4;
  });

  return (
    <group scale={1.2}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}

/** Checks a static model file exists before the GLTF loader asks for it, so a missing
 *  file falls back quietly instead of throwing (and raising the dev error overlay). */
function useAssetAvailable(url: string | undefined): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!url) {
      setOk(false);
      return;
    }
    if (url.startsWith('data:')) {
      setOk(true);
      return;
    }
    let cancelled = false;
    setOk(false);
    fetch(url, { method: 'HEAD' })
      .then((res) => {
        const type = res.headers.get('content-type') ?? '';
        if (!cancelled) setOk(res.ok && !type.includes('text/html'));
      })
      .catch(() => {
        if (!cancelled) setOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return ok;
}

function ModelSelector({
  node,
  isDark,
  handPos,
  fingerCount,
  onSelectAnnotation,
}: {
  node: SyvaNode;
  isDark: boolean;
  handPos: { x: number; y: number };
  fingerCount: number;
  onSelectAnnotation?: (anno: SyvaAnnotation) => void;
}) {
  const color = node.color || '#ff7a1f';
  const asset = node.assetType;
  const labelLower = (node.label || '').toLowerCase();

  let resolvedAsset: AssetType = asset || 'PC_GAMING';

  if (asset === 'ORGAN_HEART' || labelLower.includes('jantung')) {
    resolvedAsset = 'ORGAN_HEART';
  } else if (asset === 'COLOSSEUM' || labelLower.includes('colosseum') || labelLower.includes('sejarah')) {
    resolvedAsset = 'COLOSSEUM';
  } else if (asset === 'EARTH_GRAVITY' || labelLower.includes('gravitasi')) {
    resolvedAsset = 'EARTH_GRAVITY';
  } else if (asset === 'GEOMETRY_MATH' || labelLower.includes('geometri') || labelLower.includes('rubik')) {
    resolvedAsset = 'GEOMETRY_MATH';
  }

  let glbUrl = GLB_FILE_MAP[resolvedAsset];

  if (node.customGlbUrl && node.customGlbUrl.startsWith('data:')) {
    glbUrl = node.customGlbUrl;
  }

  const glbAvailable = useAssetAvailable(glbUrl);

  // Without a .glb file the lab still shows a real model, built from code.
  const fallback = hasProceduralModel(resolvedAsset) ? (
    <ProceduralModel asset={resolvedAsset} />
  ) : (
    <DefaultFallbackMesh color={color} />
  );

  return (
    <group>
      {glbUrl && glbAvailable ? (
        <GLTFErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <AutoScaledGLTF url={glbUrl} />
          </Suspense>
        </GLTFErrorBoundary>
      ) : (
        fallback
      )}

      {node.annotations &&
        node.annotations.map((anno) => (
          <SpatialAnnotationPin
            key={anno.id}
            anno={anno}
            isDark={isDark}
            handPos={handPos}
            fingerCount={fingerCount}
            onSelectAnnotation={onSelectAnnotation}
          />
        ))}
    </group>
  );
}

const SingleNode = memo(function SingleNode({
  node,
  isDark,
  handPos,
  fingerCount,
  onSelectAnnotation,
}: {
  node: SyvaNode;
  isDark: boolean;
  handPos: { x: number; y: number };
  fingerCount: number;
  onSelectAnnotation?: (anno: SyvaAnnotation) => void;
}) {
  const nodeColor = node.color || '#ff7a1f';

  return (
    <group position={node.position}>
      <ModelSelector
        node={node}
        isDark={isDark}
        handPos={handPos}
        fingerCount={fingerCount}
        onSelectAnnotation={onSelectAnnotation}
      />

      <Billboard position={[0, 1.85, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.5, 0.65]} />
          <meshBasicMaterial color={isDark ? '#1f1c6b' : '#ffffff'} />
        </mesh>
        <mesh position={[-1.23, 0, 0]}>
          <planeGeometry args={[0.04, 0.65]} />
          <meshBasicMaterial color={nodeColor} />
        </mesh>
        <Text
          position={[-1.05, 0.12, 0]}
          fontSize={0.13}
          color={isDark ? '#ffffff' : '#1f1c6b'}
          anchorX="left"
          anchorY="middle"
        >
          {node.label}
        </Text>
        <Text
          position={[-1.05, -0.11, 0]}
          fontSize={0.095}
          color={isDark ? '#3fefff' : '#4347c6'}
          anchorX="left"
          anchorY="middle"
        >
          {node.subtitle}
        </Text>
      </Billboard>
    </group>
  );
});

function SyvaScene({
  moduleData,
  handPos,
  isGrabbing,
  fingerCount,
  twoHandDist,
  isDark,
  onSelectAnnotation,
}: {
  moduleData: SyvaModule;
  handPos: { x: number; y: number };
  isGrabbing: boolean;
  fingerCount: number;
  twoHandDist: number;
  isDark: boolean;
  onSelectAnnotation?: (anno: SyvaAnnotation) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      if (isGrabbing) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          (handPos.x - 0.5) * Math.PI * 3,
          0.08
        );
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          (handPos.y - 0.5) * Math.PI * 1.5,
          0.08
        );
      }

      if (twoHandDist > 0) {
        const targetScale = THREE.MathUtils.clamp(
          THREE.MathUtils.mapLinear(twoHandDist, 0.2, 0.75, 0.5, 2.5),
          0.5,
          2.5
        );
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {moduleData.nodes.map((node) => (
        <SingleNode
          key={node.id}
          node={node}
          isDark={isDark}
          handPos={handPos}
          fingerCount={fingerCount}
          onSelectAnnotation={onSelectAnnotation}
        />
      ))}
    </group>
  );
}

export default function SyvaCanvas(props: {
  moduleData: SyvaModule;
  handPos: { x: number; y: number };
  isGrabbing: boolean;
  fingerCount: number;
  isSimulating: boolean;
  twoHandDist: number;
  theme?: 'dark' | 'light';
  onSelectAnnotation?: (anno: SyvaAnnotation) => void;
}) {
  const isDark = props.theme === 'dark';
  const bgColor = isDark ? '#2a2788' : '#f4f4ff';
  const gridCenterColor = isDark ? '#9da3f7' : '#b9bcf5';
  const gridLineColor = isDark ? '#3d3ab0' : '#dcddfb';

  return (
    <div className={`w-full h-screen absolute inset-0 z-0 ${isDark ? 'bg-ink' : 'bg-paper'}`}>
      <Canvas camera={{ position: [0, 0.3, 6], fov: 45 }}>
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 8, 24]} />

        <Environment preset={isDark ? 'city' : 'studio'} />

        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.8} color={isDark ? '#9da3f7' : '#e2e1ff'} />

        <gridHelper args={[40, 40, gridCenterColor, gridLineColor]} position={[0, -2.8, 0]} />

        <SyvaScene {...props} isDark={isDark} />
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}