import React from 'react';

import { Entity } from '@playcanvas/react';
import { GSplat } from '@playcanvas/react/components';
import { useSplat } from '@playcanvas/react/hooks';

import BlockingSpinner from '../common/BlockingSpinner';
import SplatCrop from './SplatCrop';

interface SplatModelProps {
  splatSrc: string;
  rotation?: [number, number, number];
  cropAabbMin?: [number, number, number];
  cropAabbMax?: [number, number, number];
  cropEdgeScaleFactor?: number;
}

const SplatModel = ({ splatSrc, rotation, cropAabbMin, cropAabbMax, cropEdgeScaleFactor }: SplatModelProps) => {
  const { asset, loading } = useSplat(splatSrc);

  if (loading) {
    return <BlockingSpinner />;
  }

  // todo add error handling

  if (!asset) {
    return null;
  }

  return (
    <Entity name='splat' rotation={rotation}>
      <GSplat asset={asset} />
      {(cropAabbMin || cropAabbMax) && (
        <SplatCrop aabbMin={cropAabbMin} aabbMax={cropAabbMax} edgeScaleFactor={cropEdgeScaleFactor} />
      )}
    </Entity>
  );
};

export default SplatModel;
