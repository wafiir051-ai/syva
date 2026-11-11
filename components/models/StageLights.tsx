'use client';

import { Environment, Lightformer } from '@react-three/drei';

/**
 * Studio lighting for a lone model: a procedural environment (no HDR download, so it
 * appears instantly), a key light, and a soft disc under the model for grounding.
 */
export default function StageLights() {
  return (
    <>
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, 3]} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#9da3f7" position={[-5, 1, -2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.3} color="#ffb070" position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
      </Environment>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.1, 0]}>
        <circleGeometry args={[1.05, 64]} />
        <meshBasicMaterial color="#1f1c6b" transparent opacity={0.5} />
      </mesh>
    </>
  );
}
