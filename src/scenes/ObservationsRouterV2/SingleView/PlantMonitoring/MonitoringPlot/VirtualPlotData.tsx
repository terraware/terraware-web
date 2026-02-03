import React, { useMemo } from 'react';

import { Grid } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { useLocalization } from 'src/providers';
import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

interface VirtualPlotDataProps {
  monitoringPlot: ObservationMonitoringPlotResultsPayload;
  plantingSiteId: number;
}

const VirtualPlotData = ({ monitoringPlot, plantingSiteId }: VirtualPlotDataProps) => {
  const { strings } = useLocalization();
  const defaultTimeZone = useDefaultTimeZone().get().id;
  const { data } = useGetPlantingSiteQuery(plantingSiteId);
  const plantingSite = useMemo(() => data?.site, [data?.site]);
  const timeZone = useMemo(() => plantingSite?.timeZone ?? defaultTimeZone, [defaultTimeZone, plantingSite?.timeZone]);

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
        {strings.LIVE_PLANTS}: {monitoringPlot.species.reduce((total, plotSpecies) => total + plotSpecies.totalLive, 0)}
      </Grid>
      <Grid item style={{ paddingTop: 0 }}>
        {strings.SPECIES}: {monitoringPlot.totalSpecies}
      </Grid>
    </Grid>
  );
};

export default VirtualPlotData;
