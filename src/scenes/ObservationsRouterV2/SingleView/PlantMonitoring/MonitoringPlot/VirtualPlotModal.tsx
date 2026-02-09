import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { OverlayModal } from '@terraware/web-components';

import { AnnotationProps } from 'src/components/GaussianSplat/Annotation';
import Application from 'src/components/GaussianSplat/Application';
import { APP_PATHS } from 'src/constants';
import { useListObservationSplatAnnotationsQuery } from 'src/queries/generated/observationSplats';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

import VirtualMonitoringPlot from './VirtualMonitoringPlot';
import VirtualPlotData from './VirtualPlotData';

interface VirtualPlotModalProps {
  monitoringPlot: ObservationMonitoringPlotResultsPayload;
  plantingSiteId: number;
  observationId: number;
  fileId: number;
  stratumName: string;
  monitoringPlotId: number;
  onClose?: () => void;
}

const VirtualPlotModal = ({
  monitoringPlot,
  plantingSiteId,
  observationId,
  fileId,
  stratumName,
  monitoringPlotId,
  onClose,
}: VirtualPlotModalProps) => {
  const navigate = useNavigate();
  const { data } = useListObservationSplatAnnotationsQuery({ observationId, fileId });

  // Eventually instead of changing to a fully different page, this could modify the Box that is used to render full screen.
  // That way it's not a fully separate page loading, but just the modal and all of the data in memory is kept.
  // Could still replace the url too, and have both urls load this page so that it still handles direct url navigation.
  const handleToggleFullScreen = useCallback(() => {
    const path = APP_PATHS.OBSERVATION_VIRTUAL_MONITORING_PLOT.replace(':observationId', observationId.toString())
      .replace(':stratumName', stratumName)
      .replace(':monitoringPlotId', monitoringPlotId.toString());
    void navigate(path);
  }, [navigate, observationId, stratumName, monitoringPlotId]);

  const annotations = useMemo(
    () =>
      data?.annotations.map(
        (annotation) =>
          ({
            ...annotation,
            position: [annotation.position.x, annotation.position.y, annotation.position.z],
            cameraPosition: annotation.cameraPosition
              ? [annotation.cameraPosition.x, annotation.cameraPosition.y, annotation.cameraPosition.z]
              : undefined,
          }) as AnnotationProps
      ) ?? [],
    [data]
  );

  return (
    <OverlayModal
      open={true}
      onClose={onClose}
      belowComponent={<VirtualPlotData monitoringPlot={monitoringPlot} plantingSiteId={plantingSiteId} />}
    >
      <Application
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          margin: '0 auto',
        }}
      >
        <VirtualMonitoringPlot
          observationId={observationId.toString()}
          fileId={fileId.toString()}
          annotations={annotations}
          editable={true}
          onToggleFullScreen={handleToggleFullScreen}
        />
      </Application>
    </OverlayModal>
  );
};

export default VirtualPlotModal;
