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

// TODO change this to script - https://developer.playcanvas.com/user-manual/react/guide/interactivity/#the-script-component
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

    // todo change this so that mousedown stops interaction until mouseup, also add keyboard events
    canvas.addEventListener('mousedown', handleUserInteraction);
    canvas.addEventListener('wheel', handleUserInteraction);
    // todo could also change these to useAppEvent - https://developer.playcanvas.com/user-manual/react/api/hooks/use-app-event/

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
      splatEntity.rotate(0, dt * 5, 0);
    }
  });

  return null;
};

export default SplatAutoRotate;
