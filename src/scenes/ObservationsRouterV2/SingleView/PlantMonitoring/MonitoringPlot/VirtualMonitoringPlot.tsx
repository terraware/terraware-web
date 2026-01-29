import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography } from '@mui/material';
import { Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { Color } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { XrControllers } from 'playcanvas/scripts/esm/xr-controllers.mjs';

import Annotation from 'src/components/GaussianSplat/Annotation';
import GradientSky from 'src/components/GaussianSplat/GradientSky';
import SplatControls from 'src/components/GaussianSplat/SplatControls';
import SplatModel from 'src/components/GaussianSplat/SplatModel';
import { TfAnnotationManager } from 'src/components/GaussianSplat/TfAnnotationManager';
import { TfXrNavigation } from 'src/components/GaussianSplat/TfXrNavigation';
import { useCameraPosition } from 'src/hooks/useCameraPosition';

interface VirtualMonitoringPlotProps {
  observationId: string;
  fileId: string;
}

const DEFAULT_FOCUS_POINT: [number, number, number] = [0, 0.1, 0];
const DEFAULT_POSITION: [number, number, number] = [1, 0.1, 0];

const VirtualMonitoringPlot = ({ observationId, fileId }: VirtualMonitoringPlotProps) => {
  const { setCamera } = useCameraPosition();
  const [showAnnotations, setShowAnnotations] = useState(true);

  const splatSrc = useMemo(
    () => `/api/v1/tracking/observations/${observationId}/splats/${fileId}`,
    [observationId, fileId]
  );

  useEffect(() => {
    setCamera(DEFAULT_FOCUS_POINT, DEFAULT_POSITION);
  }, [setCamera]);

  return (
    <>
      <GradientSky topColor='#FFFFFF' horizonColor='#EAF8FF' groundColor='#C3BDB7' />

      <Entity name='camera-root'>
        <Entity name='camera'>
          <Camera clearColor='#EAF8FF' fov={60} />
          <Script script={CameraControls} moveSpeed={0.3} moveFastSpeed={0.5} moveSlowSpeed={0.15} rotateSpeed={0.1} />
        </Entity>
        <Script script={XrControllers} />
        <Script script={TfXrNavigation} enableTeleport={false} />
      </Entity>

      {/* When a rerender occurs (such as changing showAnnotations), the splat model disappears (https://github.com/playcanvas/react/pull/298 and https://github.com/playcanvas/react/issues/302) */}
      {/* The key includes showAnnotations the PR is merged and we're on a version that includes it */}
      <SplatModel key={`splat-${showAnnotations}`} splatSrc={splatSrc} rotation={[-180, 0, 0]} />

      <Script
        script={TfAnnotationManager}
        hotspotSize={75}
        maxWorldSize={0.05}
        opacity={1}
        hotspotColor={new Color(1, 0, 0, 1)}
        hoverColor={new Color(0, 1, 0, 1)}
      />
      <Annotation
        label={1}
        position={[-0.2, 0.1, 0.4]}
        title={'An annotation'}
        text={'This annotation moves the camera.'}
        cameraPosition={[0.5, 0.3, 0.8]}
        visible={showAnnotations}
      />
      <Annotation
        label={2}
        position={[0.2, 0.1, 0.4]}
        title={'Another annotation'}
        text={"This annotation leaves the camera where it's at."}
        visible={showAnnotations}
      />
      <Annotation
        label={3}
        position={[0, 0.1, 0.2]}
        title={'React Component'}
        text={
          <Box sx={{ padding: 2, backgroundColor: 'darkcyan', borderRadius: 1 }}>
            <Typography variant='h6' gutterBottom>
              Custom React Content
            </Typography>
            <Typography variant='body2'>
              This annotation contains a full React component with Material-UI styling.
            </Typography>
            <Typography variant='caption' display='block' sx={{ mt: 1 }}>
              You can put any React component here.
            </Typography>
          </Box>
        }
        cameraPosition={[-0.2, 0.3, 0.5]}
        visible={showAnnotations}
      />
      <SplatControls
        defaultCameraFocus={DEFAULT_FOCUS_POINT}
        defaultCameraPosition={DEFAULT_POSITION}
        showAnnotations={showAnnotations}
        onToggleAnnotations={setShowAnnotations}
      />
    </>
  );
};

export default VirtualMonitoringPlot;
