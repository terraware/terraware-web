import React from 'react';

import { Script } from '@playcanvas/react/components';
import { Vec3 } from 'playcanvas';

import { CameraBoundsScript } from './camera-bounds';

interface CameraBoundsProps {
  boundsMin: [number, number, number];
  boundsMax: [number, number, number];
}

const CameraBounds = ({ boundsMin, boundsMax }: CameraBoundsProps) => (
  <Script script={CameraBoundsScript} boundsMin={new Vec3(...boundsMin)} boundsMax={new Vec3(...boundsMax)} />
);

export default CameraBounds;
