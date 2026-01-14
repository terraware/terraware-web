import React, { useEffect, useRef } from 'react';

import { Box } from '@mui/material';
import { Application, Entity } from '@playcanvas/react';
import { Camera, GSplat } from '@playcanvas/react/components';
import { useApp, useAppEvent, useSplat } from '@playcanvas/react/hooks';
import { OrbitControls } from '@playcanvas/react/scripts';

const AutoRotate = () => {
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
      }, 3000);
    };

    const handleUserInteraction = () => {
      resetInactivityTimer();
    };

    canvas.addEventListener('mousedown', handleUserInteraction);
    canvas.addEventListener('wheel', handleUserInteraction);

    return () => {
      canvas.removeEventListener('mousedown', handleUserInteraction);
      canvas.removeEventListener('wheel', handleUserInteraction);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [app]);

  useAppEvent('update', (dt: number) => {
    const splatEntity = app.root.findByName('splat');
    if (autoRotateRef.current && splatEntity) {
      const currentRotation = splatEntity.getEulerAngles();
      splatEntity.setEulerAngles(currentRotation.x, currentRotation.y + dt * 5, currentRotation.z);
    }
  });

  return null;
};

const SplatModel = () => {
  const { asset } = useSplat('/assets/models/test/PlyExamples/backyard.ply');
  if (!asset) {
    return null;
  }
  return (
    <Entity name='splat' position={[0, -0.1, 0]} rotation={[-90, 0, 0]}>
      <GSplat asset={asset} />
    </Entity>
  );
};

const PreviewRouter = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 96px)',
        position: 'relative',
      }}
    >
      <Application
        style={{
          width: '80%',
          height: '80%',
          display: 'block',
          margin: '0 auto',
        }}
        graphicsDeviceOptions={{ antialias: false }}
      >
        <Entity name='camera'>
          <Camera clearColor='#1a1a1a' fov={60} />
          <OrbitControls distanceMin={0.8} distanceMax={2.3} />
        </Entity>

        <SplatModel />
        <AutoRotate />
      </Application>
    </Box>
  );
};

export default PreviewRouter;
