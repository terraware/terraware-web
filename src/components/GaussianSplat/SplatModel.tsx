import React from 'react';

import { Entity } from '@playcanvas/react';
import { GSplat } from '@playcanvas/react/components';
import { useSplat } from '@playcanvas/react/hooks';

import BlockingSpinner from '../common/BlockingSpinner';

interface SplatModelProps {
  splatSrc: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const SplatModel = ({ splatSrc, position, rotation }: SplatModelProps) => {
  const { asset, loading } = useSplat(splatSrc);

  if (loading) {
    return <BlockingSpinner />;
  }

  // todo add error handling

  if (!asset) {
    return null;
  }

  return (
    <Entity name='splat' position={position} rotation={rotation}>
      <GSplat asset={asset} />
    </Entity>
  );
};

export default SplatModel;
