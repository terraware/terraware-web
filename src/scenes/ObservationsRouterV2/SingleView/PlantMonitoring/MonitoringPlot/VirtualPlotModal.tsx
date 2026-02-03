import React from 'react';

import { Box, Typography } from '@mui/material';
import { OverlayModal } from '@terraware/web-components';

import { AnnotationProps } from 'src/components/GaussianSplat/Annotation';
import Application from 'src/components/GaussianSplat/Application';
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

const annotations: AnnotationProps[] = [
  {
    label: 1,
    position: [-0.2, 0.1, 0.4],
    title: 'An annotation',
    text: 'This annotation moves the camera.',
    cameraPosition: [0.5, 0.3, 0.8],
  },
  {
    label: 2,
    position: [0.2, 0.1, 0.4],
    title: 'Another annotation',
    text: "This annotation leaves the camera where it's at.",
  },
  {
    label: 3,
    position: [0, 0.1, 0.2],
    title: 'React Component',
    text: (
      <Box sx={{ padding: 2, backgroundColor: 'darkcyan', borderRadius: 1 }}>
        <Typography variant='h6' gutterBottom>
          Custom React Content
        </Typography>
        <Typography variant='body2'>
          This annotation contains a full React component with Material-UI styling.
        </Typography>
        <Typography variant='caption' display='block' sx={{ mt: 1 }}>
          You can put any React component here.
        </Typography>
      </Box>
    ),
    cameraPosition: [-0.2, 0.3, 0.5],
  },
];

const VirtualPlotModal = ({
  monitoringPlot,
  plantingSiteId,
  observationId,
  fileId,
  onClose,
}: VirtualPlotModalProps) => {
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
        />
      </Application>
    </OverlayModal>
  );
};

export default VirtualPlotModal;
