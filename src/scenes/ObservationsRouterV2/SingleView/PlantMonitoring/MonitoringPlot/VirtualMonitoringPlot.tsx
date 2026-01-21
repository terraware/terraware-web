import React from 'react';

import { Box } from '@mui/material';
import { Application, Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { Color } from 'playcanvas';
import { AnnotationManager } from 'playcanvas/scripts/esm/annotations.mjs';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import Annotation from 'src/components/GaussianSplat/Annotation';
import SplatAutoRotate from 'src/components/GaussianSplat/SplatAutoRotate';
import SplatControls from 'src/components/GaussianSplat/SplatControls';
import SplatModel from 'src/components/GaussianSplat/SplatModel';

const VirtualMonitoringPlot = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Application
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          margin: '0 auto',
        }}
        graphicsDeviceOptions={{ antialias: false }}
      >
        <Entity name='camera'>
          <Camera clearColor='#1a1a1a' fov={60} />
          <Script script={CameraControls} />
        </Entity>

        <SplatModel
          splatSrc={'/assets/models/test/PlyExamples/outside.ply'}
          position={[0, -0.1, 0]}
          rotation={[-90, 0, 0]}
        />
        <SplatAutoRotate />

        <Script
          script={AnnotationManager}
          hotspotSize={200}
          opacity={1}
          hotspotColor={new Color(1, 0, 0, 1)}
          hoverColor={new Color(0, 1, 0, 1)}
        />
        <Annotation
          label={2}
          position={[0, 0.1, 0.4]}
          title={'An annotation'}
          text={'This annotation is for testing stuff.'}
        />
        <SplatControls />
      </Application>
    </Box>
  );
};

export default VirtualMonitoringPlot;
