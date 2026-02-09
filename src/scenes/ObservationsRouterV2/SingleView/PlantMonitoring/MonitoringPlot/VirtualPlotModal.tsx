import React, { useMemo } from 'react';

import { OverlayModal } from '@terraware/web-components';

import { AnnotationProps } from 'src/components/GaussianSplat/Annotation';
import Application from 'src/components/GaussianSplat/Application';
import { useListObservationSplatAnnotationsQuery } from 'src/queries/generated/observationSplats';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

import VirtualMonitoringPlot from './VirtualMonitoringPlot';
import VirtualPlotData from './VirtualPlotData';

interface VirtualPlotModalProps {
  monitoringPlot: ObservationMonitoringPlotResultsPayload;
  plantingSiteId: number;
  observationId: number;
  fileId: number;
  onClose?: () => void;
}

const VirtualPlotModal = ({
  monitoringPlot,
  plantingSiteId,
  observationId,
  fileId,
  onClose,
}: VirtualPlotModalProps) => {
  const { data } = useListObservationSplatAnnotationsQuery({ observationId, fileId });
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
        />
      </Application>
    </OverlayModal>
  );
};

export default VirtualPlotModal;
