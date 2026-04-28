import React, { useEffect, useMemo } from 'react';

import { Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { OverlayModal } from '@terraware/web-components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import Application from 'src/components/GaussianSplat/Application';
import GradientSky from 'src/components/GaussianSplat/GradientSky';
import SplatModel from 'src/components/GaussianSplat/SplatModel';
import { useCameraPosition } from 'src/hooks/useCameraPosition';
import { useDevicePerformance } from 'src/hooks/useDevicePerformance';
import { useLazyListSplatDetailsQuery } from 'src/queries/generated/observationSplats';
import { useLazyGetOrganizationSplatInfoQuery } from 'src/queries/generated/organizationSplats';

const DEFAULT_FOCUS_POINT: [number, number, number] = [0, 0.1, 0];
const DEFAULT_POSITION: [number, number, number] = [1, 0.1, 0];

type VirtualWalkthroughViewerProps = {
  fileId: number;
  observationId?: number;
  organizationId?: number;
};

const VirtualWalkthroughViewer = ({ fileId, observationId, organizationId }: VirtualWalkthroughViewerProps) => {
  const { setCamera } = useCameraPosition();
  const { isHighPerformance } = useDevicePerformance();

  const [getOrgSplatInfo, { data: orgData }] = useLazyGetOrganizationSplatInfoQuery();
  const [getObsSplatInfo, { data: obsData }] = useLazyListSplatDetailsQuery();

  useEffect(() => {
    if (observationId !== undefined) {
      void getObsSplatInfo({ observationId, fileId });
    } else if (organizationId !== undefined) {
      void getOrgSplatInfo({ organizationId, fileId });
    }
  }, [fileId, getObsSplatInfo, getOrgSplatInfo, observationId, organizationId]);

  const data = observationId !== undefined ? obsData : orgData;

  const splatSrc =
    observationId !== undefined
      ? `/api/v1/tracking/observations/${observationId}/splats/${fileId}`
      : `/api/v1/organizations/${organizationId}/splats/${fileId}`;

  const origin: [number, number, number] = useMemo(
    () =>
      data?.originPosition
        ? [data.originPosition.x, data.originPosition.y, data.originPosition.z]
        : DEFAULT_FOCUS_POINT,
    [data]
  );

  const cameraPosition: [number, number, number] = useMemo(
    () =>
      data?.cameraPosition ? [data.cameraPosition.x, data.cameraPosition.y, data.cameraPosition.z] : DEFAULT_POSITION,
    [data]
  );

  useEffect(() => {
    setCamera(origin, cameraPosition);
  }, [origin, cameraPosition, setCamera]);

  const splatModel = useMemo(
    () => <SplatModel key='splat' splatSrc={splatSrc} rotation={[-180, 0, 0]} revealRain={isHighPerformance} />,
    [isHighPerformance, splatSrc]
  );

  return (
    <>
      <GradientSky topColor='#FFFFFF' horizonColor='#EAF8FF' groundColor='#C3BDB7' />
      <Entity name='camera-root'>
        <Entity name='camera'>
          <Camera clearColor='#EAF8FF' fov={60} />
          <Script script={CameraControls} moveSpeed={0.3} moveFastSpeed={0.5} moveSlowSpeed={0.15} rotateSpeed={0.1} />
        </Entity>
      </Entity>
      {splatModel}
    </>
  );
};

type VirtualWalkthroughModalProps = VirtualWalkthroughViewerProps & {
  onClose: () => void;
};

const VirtualWalkthroughModal = ({ onClose, ...viewerProps }: VirtualWalkthroughModalProps) => {
  return (
    <OverlayModal open={true} onClose={onClose}>
      <Application style={{ width: '100%', height: '100%', display: 'block', margin: '0 auto' }}>
        <VirtualWalkthroughViewer {...viewerProps} />
      </Application>
    </OverlayModal>
  );
};

export default VirtualWalkthroughModal;
