'use client';

import { Canvas } from '@react-three/fiber';
import ProceduralModel, { hasProceduralModel } from '@/components/models/ProceduralModels';
import StageLights from '@/components/models/StageLights';
import type { AssetType } from '@/types/syva';

/** Live, slowly turning preview of the subject model the teacher picked. */
export default function ModelPreview({ asset }: { asset: AssetType }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.3, 5.8], fov: 38 }} gl={{ antialias: true, alpha: true }} style={{ touchAction: 'pan-y' }}>
      <StageLights />
      {hasProceduralModel(asset) && <ProceduralModel key={asset} asset={asset} />}
    </Canvas>
  );
}
