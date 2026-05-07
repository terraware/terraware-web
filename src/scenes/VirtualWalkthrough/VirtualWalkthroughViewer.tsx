import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { Color, Vec3 } from 'playcanvas';
import { XrControllers } from 'playcanvas/scripts/esm/xr-controllers.mjs';

import Annotation, { AnnotationProps } from 'src/components/GaussianSplat/Annotation';
import { AutoRotator } from 'src/components/GaussianSplat/AutoRotator';
import GradientSky from 'src/components/GaussianSplat/GradientSky';
import SplatControls from 'src/components/GaussianSplat/SplatControls';
import SplatModel from 'src/components/GaussianSplat/SplatModel';
import { TfAnnotationManager } from 'src/components/GaussianSplat/TfAnnotationManager';
import { TfXrNavigation } from 'src/components/GaussianSplat/TfXrNavigation';
import { WalkthroughCamera } from 'src/components/GaussianSplat/walkthrough-camera';
import { useCameraPosition } from 'src/hooks/useCameraPosition';
import { useDevicePerformance } from 'src/hooks/useDevicePerformance';
import {
  useLazyListSplatDetailsQuery,
  useSetObservationSplatAnnotationsMutation,
} from 'src/queries/generated/observationSplats';
import { useLazyGetOrganizationSplatInfoQuery } from 'src/queries/generated/organizationSplats';

const DEFAULT_FOCUS_POINT: [number, number, number] = [0, 0.1, 0];
const DEFAULT_POSITION: [number, number, number] = [1, 0.1, 0];

export type VirtualWalkthroughViewerProps = {
  fileId: number;
  observationId?: number;
  organizationId?: number;
  editable?: boolean;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
};

const VirtualWalkthroughViewer = ({
  fileId,
  observationId,
  organizationId,
  editable = false,
  isFullScreen = false,
  onToggleFullScreen,
}: VirtualWalkthroughViewerProps) => {
  const { setCamera } = useCameraPosition();
  const { isHighPerformance } = useDevicePerformance();

  const [showAnnotations, setShowAnnotations] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState(-1);
  const [localAnnotations, setLocalAnnotations] = useState<AnnotationProps[]>([]);
  const [getOrgSplatInfo, { data: orgData }] = useLazyGetOrganizationSplatInfoQuery();
  const [getObsSplatInfo, { data: obsData }] = useLazyListSplatDetailsQuery();
  const [saveAnnotations] = useSetObservationSplatAnnotationsMutation();

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

  const boundsXZRadius = useMemo(() => {
    const dx = cameraPosition[0] - origin[0];
    const dy = cameraPosition[1] - origin[1];
    const dz = cameraPosition[2] - origin[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz) * 0.5;
  }, [cameraPosition, origin]);

  const boundsCenter = useMemo(() => new Vec3(origin[0], cameraPosition[1], origin[2]), [origin, cameraPosition]);

  useEffect(() => {
    setCamera(origin, cameraPosition);
  }, [origin, cameraPosition, setCamera]);

  const apiAnnotations = useMemo<AnnotationProps[]>(
    () =>
      obsData?.annotations?.map(
        (annotation) =>
          ({
            ...annotation,
            position: [annotation.position.x, annotation.position.y, annotation.position.z] as [number, number, number],
            cameraPosition: annotation.cameraPosition
              ? ([annotation.cameraPosition.x, annotation.cameraPosition.y, annotation.cameraPosition.z] as [
                  number,
                  number,
                  number,
                ])
              : undefined,
          }) as AnnotationProps
      ) ?? [],
    [obsData?.annotations]
  );

  useEffect(() => {
    setLocalAnnotations(apiAnnotations);
  }, [apiAnnotations]);

  useEffect(() => {
    if (!isEdit) {
      setSelectedAnnotationIndex(-1);
    }
  }, [isEdit]);

  const handleAnnotationPositionChange = useCallback(
    (position: [number, number, number]) => {
      setLocalAnnotations((prev) => {
        if (selectedAnnotationIndex === -1) {
          return prev;
        }
        const updated = [...prev];
        updated[selectedAnnotationIndex] = { ...updated[selectedAnnotationIndex], position };
        return updated;
      });
    },
    [selectedAnnotationIndex]
  );

  const handleSave = useCallback(() => {
    if (observationId === undefined) {
      return;
    }
    const saveAndClose = async () => {
      await saveAnnotations({
        observationId,
        fileId,
        setSplatAnnotationsRequestPayload: {
          annotations: localAnnotations.map((annotation) => ({
            ...annotation,
            position: {
              x: annotation.position[0],
              y: annotation.position[1],
              z: annotation.position[2],
            },
            cameraPosition: annotation.cameraPosition
              ? {
                  x: annotation.cameraPosition[0],
                  y: annotation.cameraPosition[1],
                  z: annotation.cameraPosition[2],
                }
              : undefined,
          })),
        },
      });
      setIsEdit(false);
      setSelectedAnnotationIndex(-1);
    };
    void saveAndClose();
  }, [observationId, fileId, saveAnnotations, localAnnotations]);

  const handleCancel = useCallback(() => {
    setLocalAnnotations(apiAnnotations);
    setIsEdit(false);
    setSelectedAnnotationIndex(-1);
  }, [apiAnnotations]);

  const handleAddAnnotation = useCallback(() => {
    const newAnnotation: AnnotationProps = { position: origin, title: '' };
    setLocalAnnotations((prev) => [...prev, newAnnotation]);
    setSelectedAnnotationIndex(localAnnotations.length);
  }, [origin, localAnnotations]);

  const handleDeleteAnnotation = useCallback(() => {
    if (selectedAnnotationIndex === -1) {
      return;
    }
    setLocalAnnotations((prev) => prev.filter((_, index) => index !== selectedAnnotationIndex));
    setSelectedAnnotationIndex(-1);
  }, [selectedAnnotationIndex]);

  const handleDeselectAnnotation = useCallback(() => {
    setSelectedAnnotationIndex(-1);
  }, []);

  const handleAnnotationUpdate = useCallback(
    (updates: Partial<AnnotationProps>) => {
      if (selectedAnnotationIndex === -1) {
        return;
      }
      setLocalAnnotations((prev) => {
        const updated = [...prev];
        updated[selectedAnnotationIndex] = { ...updated[selectedAnnotationIndex], ...updates };
        return updated;
      });
    },
    [selectedAnnotationIndex]
  );

  const canSave = useMemo(
    () => localAnnotations.every((annotation) => annotation.title && annotation.title.trim() !== ''),
    [localAnnotations]
  );

  const splatModel = useMemo(
    () => <SplatModel key='splat' splatSrc={splatSrc} rotation={[-180, 0, 0]} revealRain={isHighPerformance} />,
    [isHighPerformance, splatSrc]
  );

  return (
    <>
      <GradientSky
        topColor={data?.skyColor || '#FFFFFF'}
        horizonColor={data?.skyColor || '#EAF8FF'}
        groundColor={data?.groundColor || '#C3BDB7'}
      />

      <Entity name='camera-root'>
        <Entity name='camera'>
          <Camera clearColor='#EAF8FF' fov={60} />
          <Script script={WalkthroughCamera} boundsCenter={boundsCenter} boundsXZRadius={boundsXZRadius} />
        </Entity>
        <Script script={XrControllers} enabled={!isEdit} />
        <Script script={TfXrNavigation} enabled={!isEdit} enableTeleport={false} />
        <Script
          script={AutoRotator}
          enabled={!isEdit && autoRotate}
          startDelay={0.5}
          restartDelay={3}
          startFadeInTime={0.5}
        />
      </Entity>

      {splatModel}

      <Script
        script={TfAnnotationManager}
        enabled={localAnnotations.length > 0}
        hotspotSize={30}
        maxWorldSize={0.05}
        opacity={1}
        hotspotColor={new Color().fromString('#ffffff')}
        hoverColor={new Color().fromString('#ffffff')}
        hotspotBackgroundColor='#2C8658'
      />
      {localAnnotations.map((annotation, index) => (
        <Annotation
          key={`${index}-${annotation.title}-${annotation.label ?? ''}`}
          {...annotation}
          index={index}
          visible={showAnnotations}
          isEdit={isEdit}
          isSelected={selectedAnnotationIndex === index}
          onSelect={() => setSelectedAnnotationIndex(index)}
          onPositionChange={handleAnnotationPositionChange}
        />
      ))}

      <SplatControls
        defaultCameraFocus={origin}
        defaultCameraPosition={cameraPosition}
        showAnnotations={showAnnotations}
        onToggleAnnotations={setShowAnnotations}
        autoRotate={autoRotate}
        onToggleAutoRotate={setAutoRotate}
        isEdit={isEdit}
        onToggleEdit={setIsEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onAddAnnotation={handleAddAnnotation}
        onDeleteAnnotation={handleDeleteAnnotation}
        onDeselectAnnotation={handleDeselectAnnotation}
        hasSelectedAnnotation={selectedAnnotationIndex >= 0}
        selectedAnnotation={selectedAnnotationIndex >= 0 ? localAnnotations[selectedAnnotationIndex] : null}
        onAnnotationUpdate={handleAnnotationUpdate}
        onTextFieldFocus={() => undefined}
        canSave={canSave}
        editable={editable}
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
      />
    </>
  );
};

export default VirtualWalkthroughViewer;
