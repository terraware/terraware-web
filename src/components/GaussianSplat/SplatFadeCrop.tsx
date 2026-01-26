import React from 'react';

import { Script } from '@playcanvas/react/components';
import { Vec3 } from 'playcanvas';

import { GsplatFadeCropShaderEffect } from './gsplat-fade-crop-effect';

interface SplatFadeCropProps {
  aabbMin?: [number, number, number];
  aabbMax?: [number, number, number];
  fadeDistance?: number;
}

const SplatFadeCrop = ({ aabbMin = [-1, -1, -1], aabbMax = [1, 1, 1], fadeDistance = 0.5 }: SplatFadeCropProps) => {
  return (
    <Script
      script={GsplatFadeCropShaderEffect}
      aabbMin={new Vec3(...aabbMin)}
      aabbMax={new Vec3(...aabbMax)}
      fadeDistance={fadeDistance}
    />
  );
};

export default SplatFadeCrop;
