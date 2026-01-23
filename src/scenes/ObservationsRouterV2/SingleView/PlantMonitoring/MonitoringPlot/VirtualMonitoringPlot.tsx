import React, { useEffect } from 'react';

import { Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { Color } from 'playcanvas';
import { AnnotationManager } from 'playcanvas/scripts/esm/annotations.mjs';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

import Annotation from 'src/components/GaussianSplat/Annotation';
import GradientSky from 'src/components/GaussianSplat/GradientSky';
import SplatControls from 'src/components/GaussianSplat/SplatControls';
import SplatModel from 'src/components/GaussianSplat/SplatModel';
import { useCameraPosition } from 'src/hooks/useCameraPosition';

interface VirtualMonitoringPlotProps {
  observationId?: string;
  monitoringPlotId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VirtualMonitoringPlot = (_props: VirtualMonitoringPlotProps) => {
  // TODO: Use observationId and monitoringPlotId to fetch and render actual plot data
  const { setCamera } = useCameraPosition();

  useEffect(() => {
    setCamera([0, 0.1, 0], [0, 0.1, 0]);
  }, [setCamera]);
  return (
    <>
      <GradientSky topColor='#FFFFFF' horizonColor='#EAF8FF' groundColor='#C3BDB7' />

      <Entity name='camera'>
        <Camera clearColor='#EAF8FF' fov={60} />
        <Script script={CameraControls} moveSpeed={0.3} moveFastSpeed={0.5} moveSlowSpeed={0.15} rotateSpeed={0.1} />
      </Entity>

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
    </>
  );
};

export default VirtualMonitoringPlot;
