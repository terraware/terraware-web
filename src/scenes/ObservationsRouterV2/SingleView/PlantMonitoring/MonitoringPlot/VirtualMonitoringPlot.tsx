import React, { useEffect } from 'react';

import { Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { Color } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Grid } from 'playcanvas/scripts/esm/grid.mjs';

import Annotation from 'src/components/GaussianSplat/Annotation';
import GradientSky from 'src/components/GaussianSplat/GradientSky';
import SplatControls from 'src/components/GaussianSplat/SplatControls';
import SplatModel from 'src/components/GaussianSplat/SplatModel';
import { TfAnnotationManager } from 'src/components/GaussianSplat/TfAnnotationManager';
import { useCameraPosition } from 'src/hooks/useCameraPosition';

interface VirtualMonitoringPlotProps {
  observationId: string;
  monitoringPlotId: string;
}

const VirtualMonitoringPlot = ({ observationId, monitoringPlotId }: VirtualMonitoringPlotProps) => {
  // TODO: Use observationId and monitoringPlotId to fetch and render actual plot data
  console.log('VirtualMonitoringPlot', observationId, monitoringPlotId);

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
      />
      <Annotation
        label={2}
        position={[0.2, 0.1, 0.4]}
        title={'Another annotation'}
        text={"This annotation leaves the camera where it's at."}
      />
      <SplatControls />
    </>
  );
};

export default VirtualMonitoringPlot;
