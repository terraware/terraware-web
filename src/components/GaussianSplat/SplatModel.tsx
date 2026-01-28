import React, { useEffect } from 'react';

import { Entity } from '@playcanvas/react';
import { GSplat } from '@playcanvas/react/components';
import { useSplat } from '@playcanvas/react/hooks';

import useSnackbar from 'src/utils/useSnackbar';

import BlockingSpinner from '../common/BlockingSpinner';
import SplatCrop from './SplatCrop';
import SplatFadeCrop from './SplatFadeCrop';

interface SplatModelProps {
  splatSrc: string;
  rotation?: [number, number, number];
  cropAabbMin?: [number, number, number];
  cropAabbMax?: [number, number, number];
  cropEdgeScaleFactor?: number;
  cropFade?: boolean;
  cropFadeDistance?: number;
}

const SplatModel = ({
  splatSrc,
  rotation,
  cropAabbMin,
  cropAabbMax,
  cropEdgeScaleFactor,
  cropFade = false,
  cropFadeDistance = 0.5,
}: SplatModelProps) => {
  // A filename is required for the file props to assist with the asset loading. Otherwise it assumes that the splatSrc is a ply file.
  const { asset, loading, error } = useSplat(splatSrc, { file: { filename: 'model.sog' } });
  const snackbar = useSnackbar();

  useEffect(() => {
    if (error) {
      snackbar.toastError();
    }
  }, [error, snackbar]);

  if (loading) {
    return <BlockingSpinner />;
  }

  if (!asset) {
    return null;
  }

  return (
    <Entity name='splat' rotation={rotation}>
      <GSplat asset={asset} />
      {(cropAabbMin || cropAabbMax) &&
        (cropFade ? (
          <SplatFadeCrop aabbMin={cropAabbMin} aabbMax={cropAabbMax} fadeDistance={cropFadeDistance} />
        ) : (
          <SplatCrop aabbMin={cropAabbMin} aabbMax={cropAabbMax} edgeScaleFactor={cropEdgeScaleFactor} />
        ))}
    </Entity>
  );
};

export default SplatModel;
