import React, { useEffect, useMemo } from 'react';

import { Entity } from '@playcanvas/react';
import { Render } from '@playcanvas/react/components';
import { useApp } from '@playcanvas/react/hooks';
import { Color, PIXELFORMAT_RGBA8, StandardMaterial, Texture } from 'playcanvas';

interface GradientSkyProps {
  topColor?: string;
  horizonColor?: string;
  groundColor?: string;
  resolution?: number;
}

const GradientSky = ({
  topColor = '#1e90ff',
  horizonColor = '#87ceeb',
  groundColor = '#8b7355',
  resolution = 512,
}: GradientSkyProps) => {
  const app = useApp();

  const material = useMemo(() => {
    if (!app) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, resolution);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(0.5, horizonColor);
    gradient.addColorStop(0.5, groundColor);
    gradient.addColorStop(1, groundColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, resolution, resolution);

    const texture = new Texture(app.graphicsDevice, {
      width: resolution,
      height: resolution,
      format: PIXELFORMAT_RGBA8,
      mipmaps: false,
    });

    const pixels = ctx.getImageData(0, 0, resolution, resolution);
    texture.lock().set(new Uint8Array(pixels.data));
    texture.unlock();

    const mat = new StandardMaterial();
    mat.emissiveMap = texture;
    mat.emissive = new Color(1, 1, 1);
    mat.useLighting = false;
    mat.cull = 0;
    mat.depthWrite = false;
    mat.update();

    return mat;
  }, [app, topColor, horizonColor, groundColor, resolution]);

  useEffect(() => {
    // remove material to avoid memory leak
    return () => {
      if (material) {
        material.destroy();
      }
    };
  }, [material]);

  if (!material) {
    return null;
  }

  return (
    <Entity name='gradient-sky' position={[0, 0, 0]} scale={[500, 500, 500]}>
      <Render type='sphere' material={material} castShadows={false} receiveShadows={false} />
    </Entity>
  );
};

export default GradientSky;
