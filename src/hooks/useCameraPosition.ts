import { useCallback, useMemo } from 'react';

import { useApp } from '@playcanvas/react/hooks';
import { Vec3 } from 'playcanvas';

export const useCameraPosition = () => {
  const app = useApp();

  const setCamera = useCallback(
    (focus: [number, number, number], position?: [number, number, number]) => {
      const camera = app.root.findByName('camera');
      // @ts-expect-error - cameraControls and its script are added dynamically to the camera entity
      const controls = camera?.script?.cameraControls;
      if (controls && camera) {
        controls.reset(new Vec3(focus), position ? new Vec3(position) : camera.getPosition());
      }
    },
    [app]
  );

  const getCameraState = useCallback(() => {
    const camera = app.root.findByName('camera');
    // @ts-expect-error - cameraControls and its script are added dynamically to the camera entity
    const controls = camera?.script?.cameraControls;
    if (camera && controls) {
      const position = camera.getPosition();
      const focusPoint = controls?.focusPoint;
      return {
        position: [position.x, position.y, position.z] as [number, number, number],
        focus: [focusPoint.x, focusPoint.y, focusPoint.z] as [number, number, number],
      };
    }
    return null;
  }, [app]);

  return useMemo(() => ({ setCamera, getCameraState }), [setCamera, getCameraState]);
};
