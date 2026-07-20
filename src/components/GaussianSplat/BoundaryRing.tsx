import React, { useEffect } from 'react';

import { Entity } from '@playcanvas/react';
import { Script } from '@playcanvas/react/components';
import { useApp } from '@playcanvas/react/hooks';
import { Vec3 } from 'playcanvas';

import { BoundaryRingScript } from 'src/components/GaussianSplat/boundary-ring';

export type BoundaryRingProps = {
  center: Vec3;
  radius: number;
  groundPlane: Vec3[];
};

const BoundaryRing = ({ center, radius, groundPlane }: BoundaryRingProps) => {
  const app = useApp();

  useEffect(() => {
    // Set imperatively rather than via reactive Script props. @playcanvas/react wraps Script
    // in memo() whose shallowEquals returns early on the first prop with a .equals() method
    // (Vec3), so any prop after a Vec3 is never compared and would not propagate. This mirrors
    // the WalkthroughCamera.groundPlane workaround.
    // @ts-expect-error - scripts are added dynamically to the entity
    const script = app.root.findByName('boundary-ring')?.script?.boundaryRing;
    if (script) {
      script.center = center;
      script.radius = radius;
      script.groundPlane = groundPlane;
    }
  }, [app, center, radius, groundPlane]);

  return (
    <Entity name='boundary-ring'>
      <Script script={BoundaryRingScript} />
    </Entity>
  );
};

export default BoundaryRing;
