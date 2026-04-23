import React, { useEffect, useMemo } from 'react';

import { Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { OverlayModal } from '@terraware/web-components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';

import Application from 'src/components/GaussianSplat/Application';
import CameraBounds from 'src/components/GaussianSplat/CameraBounds';
import GradientSky from 'src/components/GaussianSplat/GradientSky';
import SplatModel from 'src/components/GaussianSplat/SplatModel';
import { useCameraPosition } from 'src/hooks/useCameraPosition';
import { useDevicePerformance } from 'src/hooks/useDevicePerformance';
import { useLazyListSplatDetailsQuery } from 'src/queries/generated/observationSplats';
import { useLazyGetOrganizationSplatInfoQuery } from 'src/queries/generated/organizationSplats';

const DEFAULT_FOCUS_POINT: [number, number, number] = [0, 0.1, 0];
const DEFAULT_POSITION: [number, number, number] = [1, 0.1, 0];

type VirtualWalkthroughViewerProps =
  | { organizationId: number; fileId: number; observationId?: never }
  | { observationId: number; fileId: number; organizationId?: never };

const VirtualWalkthroughViewer = ({ fileId, organizationId, observationId }: VirtualWalkthroughViewerProps) => {
  const { setCamera } = useCameraPosition();
  const { isHighPerformance } = useDevicePerformance();

  const [getOrgSplatInfo, { data: orgData }] = useLazyGetOrganizationSplatInfoQuery();
  const [getObsSplatInfo, { data: obsData }] = useLazyListSplatDetailsQuery();

  useEffect(() => {
    if (organizationId !== undefined) {
      void getOrgSplatInfo({ organizationId, fileId });
    } else if (observationId !== undefined) {
      void getObsSplatInfo({ observationId, fileId });
    }
  }, [fileId, getObsSplatInfo, getOrgSplatInfo, observationId, organizationId]);

  const data = observationId === undefined ? orgData : obsData;

  const splatSrc =
    observationId === undefined
      ? `/api/v1/organizations/${organizationId}/splats/${fileId}`
      : `/api/v1/tracking/observations/${observationId}/splats/${fileId}`;

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

  // Derive an exploration radius from the initial camera-to-origin distance,
  // giving the user 2× that distance to pan in any direction from the origin.
  const boundsRadius = useMemo(() => {
    const dx = cameraPosition[0] - origin[0];
    const dy = cameraPosition[1] - origin[1];
    const dz = cameraPosition[2] - origin[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz) * 2;
  }, [cameraPosition, origin]);

  const boundsMin = useMemo<[number, number, number]>(
    () => [origin[0] - boundsRadius, origin[1] - boundsRadius, origin[2] - boundsRadius],
    [origin, boundsRadius]
  );

  const boundsMax = useMemo<[number, number, number]>(
    () => [origin[0] + boundsRadius, origin[1] + boundsRadius, origin[2] + boundsRadius],
    [origin, boundsRadius]
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
          <CameraBounds boundsMin={boundsMin} boundsMax={boundsMax} />
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
