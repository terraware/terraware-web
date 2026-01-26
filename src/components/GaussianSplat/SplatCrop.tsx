import React from 'react';

import { Script } from '@playcanvas/react/components';
import { Vec3 } from 'playcanvas';
import { GsplatCropShaderEffect } from 'playcanvas/scripts/esm/gsplat/shader-effect-crop.mjs';

interface SplatCropProps {
  aabbMin?: [number, number, number];
  aabbMax?: [number, number, number];
  edgeScaleFactor?: number;
}

const SplatCrop = ({ aabbMin = [-1, -1, -1], aabbMax = [1, 1, 1], edgeScaleFactor = 0.5 }: SplatCropProps) => {
  return (
    <Script
      script={GsplatCropShaderEffect}
      aabbMin={new Vec3(...aabbMin)}
      aabbMax={new Vec3(...aabbMax)}
      edgeScaleFactor={edgeScaleFactor}
    />
  );
};

export default SplatCrop;
