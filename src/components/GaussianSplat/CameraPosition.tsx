import { useEffect } from 'react';

import { useApp } from '@playcanvas/react/hooks';
import { Vec3 } from 'playcanvas';

interface CameraPositionProps {
  focus: [number, number, number];
  position?: [number, number, number];
}

const CameraPosition = ({ focus, position }: CameraPositionProps) => {
  const app = useApp();

  useEffect(() => {
    const camera = app.root.findByName('camera');
    // @ts-expect-error - cameraControls and its script are added dynamically to the camera entity
    const controls = camera?.script?.cameraControls;
    if (controls && camera) {
      controls.reset(new Vec3(focus), position ? new Vec3(position) : camera.getPosition());
    }
  }, [app, focus, position]);

  return null;
};

export default CameraPosition;
