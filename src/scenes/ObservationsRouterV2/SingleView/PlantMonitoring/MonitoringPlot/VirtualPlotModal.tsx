import React, { useMemo } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { OverlayModal } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { AnnotationProps } from 'src/components/GaussianSplat/Annotation';
import Application from 'src/components/GaussianSplat/Application';
import { useLocalization } from 'src/providers';
import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import VirtualMonitoringPlot from './VirtualMonitoringPlot';

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
  const { strings } = useLocalization();
  const defaultTimeZone = useDefaultTimeZone().get().id;
  const { data } = useGetPlantingSiteQuery(plantingSiteId);
  const plantingSite = useMemo(() => data?.site, [data?.site]);
  const timeZone = useMemo(() => plantingSite?.timeZone ?? defaultTimeZone, [defaultTimeZone, plantingSite?.timeZone]);

  const belowComponent = useMemo(() => {
    if (monitoringPlot === undefined) {
      return null;
    }

    return (
      <Grid
        container
        spacing={2}
        sx={{
          backgroundColor: 'black',
          color: 'white',
          padding: '1rem',
          textAlign: 'center',
          borderRadius: '1rem',
        }}
      >
        <Grid item style={{ paddingTop: 0 }}>
          {strings.PLOT_CAPTURED}:{' '}
          {monitoringPlot.completedTime ? getDateDisplayValue(monitoringPlot.completedTime, timeZone) : undefined}
        </Grid>
        <Grid item style={{ paddingTop: 0 }}>
          {strings.LIVE_PLANTS}:{' '}
          {monitoringPlot.species.reduce((total, plotSpecies) => total + plotSpecies.totalLive, 0)}
        </Grid>
        <Grid item style={{ paddingTop: 0 }}>
          {strings.SPECIES}: {monitoringPlot.totalSpecies}
        </Grid>
      </Grid>
    );
  }, [monitoringPlot, timeZone, strings]);

  return (
    <OverlayModal open={true} onClose={onClose} belowComponent={<>{belowComponent}</>}>
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
