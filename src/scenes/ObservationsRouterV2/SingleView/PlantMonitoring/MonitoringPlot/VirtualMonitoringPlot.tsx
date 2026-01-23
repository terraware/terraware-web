import React from 'react';

import { Box } from '@mui/material';
import { Application, Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import SplatAutoRotate from 'src/components/GaussianSplat/SplatAutoRotate';
import SplatModel from 'src/components/GaussianSplat/SplatModel';

const VirtualMonitoringPlot = () => {
  // http://localhost:3000/observations/358/stratum/2/plot/40321018/virtual?organizationId=243

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
          // splatSrc={'/assets/models/test/PlyExamples/trees3.sog'}
          splatSrc={'/assets/models/test/PlyExamples/outside.ply'}
          position={[0, -0.1, 0]}
          rotation={[-90, 0, 0]}
        />
        <SplatAutoRotate />
      </Application>
    </Box>
  );
};

export default VirtualMonitoringPlot;
