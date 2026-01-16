import { useEffect, useRef } from 'react';

import { useApp, useAppEvent } from '@playcanvas/react/hooks';

const DEFAULT_RESTART_ROTATE_TIME_MS = 3000;

interface SplatAutoRotateProps {
  /** stop rotation when user interacts with model
   * @default true */
  stopOnInteraction?: boolean;
  /** restart rotation after this many milliseconds of inactivity.
   * @default 3000 */
  restartRotateTimeoutMs?: number;
}

const SplatAutoRotate = ({
  stopOnInteraction = true,
  restartRotateTimeoutMs = DEFAULT_RESTART_ROTATE_TIME_MS,
}: SplatAutoRotateProps) => {
  const app = useApp();
  const autoRotateRef = useRef(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = app.graphicsDevice.canvas;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      autoRotateRef.current = false;
      inactivityTimerRef.current = setTimeout(() => {
        autoRotateRef.current = true;
      }, restartRotateTimeoutMs || DEFAULT_RESTART_ROTATE_TIME_MS);
    };

    const handleUserInteraction = () => {
      if (stopOnInteraction) {
        resetInactivityTimer();
      }
    };

    // todo change this so that mousedown stops interaction until mouseup
    canvas.addEventListener('mousedown', handleUserInteraction);
    canvas.addEventListener('wheel', handleUserInteraction);

    return () => {
      canvas.removeEventListener('mousedown', handleUserInteraction);
      canvas.removeEventListener('wheel', handleUserInteraction);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [app, restartRotateTimeoutMs, stopOnInteraction]);

  useAppEvent('update', (dt: number) => {
    const splatEntity = app.root.findByName('splat');
    if (autoRotateRef.current && splatEntity) {
      const currentRotation = splatEntity.getEulerAngles();
      // TODO fix this when it gets stuck on 90. Perhaps >90 gets changed to <90
      splatEntity.setEulerAngles(currentRotation.x, currentRotation.y + dt * 5, currentRotation.z);
    }
  });

  return null;
};

export default SplatAutoRotate;
