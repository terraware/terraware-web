import React from 'react';

import { Box } from '@mui/material';
import { Application, Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { Color } from 'playcanvas';
import { AnnotationManager } from 'playcanvas/scripts/esm/annotations.mjs';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

import Annotation from 'src/components/GaussianSplat/Annotation';
import CameraPosition from 'src/components/GaussianSplat/CameraPosition';
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
          <Camera clearColor='#000000' fov={60} />
          <Script script={CameraControls} moveSpeed={0.3} moveFastSpeed={0.5} moveSlowSpeed={0.15} rotateSpeed={0.1} />
        </Entity>

        <CameraPosition focus={[0, 0.1, 0]} position={[0, 0.1, 0]} />

        <Entity name={'grid'} scale={[100, 100, 100]}>
          <Script script={Grid} />
        </Entity>

        <SplatModel splatSrc={'/assets/models/test/PlyExamples/outside.ply'} rotation={[-90, 0, 0]} />

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
