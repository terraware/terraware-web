import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Entity } from '@playcanvas/react';
import { Camera, Script } from '@playcanvas/react/components';
import { Color } from 'playcanvas';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { XrControllers } from 'playcanvas/scripts/esm/xr-controllers.mjs';

import Annotation, { AnnotationProps } from 'src/components/GaussianSplat/Annotation';
import { AutoRotator } from 'src/components/GaussianSplat/AutoRotator';
import GradientSky from 'src/components/GaussianSplat/GradientSky';
import SplatControls from 'src/components/GaussianSplat/SplatControls';
import SplatModel from 'src/components/GaussianSplat/SplatModel';
import { TfAnnotationManager } from 'src/components/GaussianSplat/TfAnnotationManager';
import { TfXrNavigation } from 'src/components/GaussianSplat/TfXrNavigation';
import { useCameraPosition } from 'src/hooks/useCameraPosition';
import { useDevicePerformance } from 'src/hooks/useDevicePerformance';
import { useSetObservationSplatAnnotationsMutation } from 'src/queries/generated/observationSplats';

interface VirtualMonitoringPlotProps {
  observationId: string;
  fileId: string;
  annotations?: AnnotationProps[];
}

const DEFAULT_FOCUS_POINT: [number, number, number] = [0, 0.1, 0];
const DEFAULT_POSITION: [number, number, number] = [1, 0.1, 0];

const VirtualMonitoringPlot = ({ observationId, fileId, annotations = [] }: VirtualMonitoringPlotProps) => {
  const { setCamera } = useCameraPosition();
  const { isHighPerformance } = useDevicePerformance();
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState<number | null>(null);
  const [localAnnotations, setLocalAnnotations] = useState(annotations);
  const [saveAnnotations] = useSetObservationSplatAnnotationsMutation();

  const splatSrc = useMemo(
    () => `/api/v1/tracking/observations/${observationId}/splats/${fileId}`,
    [observationId, fileId]
  );

  useEffect(() => {
    setCamera(DEFAULT_FOCUS_POINT, DEFAULT_POSITION);
  }, [setCamera]);

  useEffect(() => {
    if (!isEdit) {
      setSelectedAnnotationIndex(null);
    }
  }, [isEdit]);

  useEffect(() => {
    setLocalAnnotations(annotations);
  }, [annotations]);

  const handleAnnotationPositionChange = useCallback((label: string | number, position: [number, number, number]) => {
    setLocalAnnotations((prev) => {
      // TODO find something more robust than the label
      const index = prev.findIndex((ann) => ann.label === label);
      if (index === -1) {
        return prev;
      }

      const updated = [...prev];
      updated[index] = { ...updated[index], position };
      return updated;
    });
  }, []);

  const handleSave = useCallback(() => {
    const saveAndClose = async () => {
      await saveAnnotations({
        observationId: Number(observationId),
        fileId: Number(fileId),
        setSplatAnnotationsRequestPayload: {
          annotations: localAnnotations.map((annotation) => ({
            ...annotation,
            position: {
              x: annotation.position[0],
              y: annotation.position[1],
              z: annotation.position[2],
            },
            cameraPosition: annotation.cameraPosition
              ? { x: annotation.cameraPosition[0], y: annotation.cameraPosition[1], z: annotation.cameraPosition[2] }
              : undefined,
          })),
        },
      });
      setIsEdit(false);
      setSelectedAnnotationIndex(null);
    };
    void saveAndClose();
  }, [observationId, fileId, saveAnnotations, localAnnotations]);

  const handleCancel = useCallback(() => {
    setLocalAnnotations(annotations);
    setIsEdit(false);
    setSelectedAnnotationIndex(null);
  }, [annotations]);

  /* When a rerender occurs, the splat model disappears (https://github.com/playcanvas/react/pull/298 and https://github.com/playcanvas/react/issues/302)
  The key should include items that cause the SplatModel to rerender. Remove them (and the useMemo) once the PR is merged and we're on a version that includes it */
  const splatModel = useMemo(
    () => <SplatModel key={'splat'} splatSrc={splatSrc} rotation={[-180, 0, 0]} revealRain={isHighPerformance} />,
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
        {!isEdit && (
          <>
            <Script script={XrControllers} />
            <Script script={TfXrNavigation} enableTeleport={false} />
            {autoRotate && <Script script={AutoRotator} startDelay={0.5} restartDelay={3} startFadeInTime={0.5} />}
          </>
        )}
      </Entity>

      {splatModel}

      {localAnnotations.length > 0 && (
        <Script
          script={TfAnnotationManager}
          hotspotSize={30}
          maxWorldSize={0.05}
          opacity={1}
          hotspotColor={new Color().fromString('#ffffff')}
          hoverColor={new Color().fromString('#ffffff')}
          hotspotBackgroundColor='#2C8658'
        />
      )}
      {localAnnotations.map((annotation, index) => (
        <Annotation
          key={index}
          {...annotation}
          visible={showAnnotations}
          isEdit={isEdit}
          isSelected={selectedAnnotationIndex === index}
          onSelect={() => setSelectedAnnotationIndex(index)}
          onPositionChange={handleAnnotationPositionChange}
        />
      ))}
      <SplatControls
        defaultCameraFocus={DEFAULT_FOCUS_POINT}
        defaultCameraPosition={DEFAULT_POSITION}
        showAnnotations={showAnnotations}
        onToggleAnnotations={setShowAnnotations}
        autoRotate={autoRotate}
        onToggleAutoRotate={setAutoRotate}
        isEdit={isEdit}
        onToggleEdit={setIsEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </>
  );
};

export default VirtualMonitoringPlot;
