import React from 'react';

import { Box, useTheme } from '@mui/material';

import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { PlotT0Data, SpeciesPlot } from 'src/types/Tracking';

import PlotT0Box from './PlotT0Box';

type PermanentPlotsTabProps = {
  plantingSiteId: number;
  plotsWithObservations?: PlotsWithObservationsSearchResult[];
  t0Plots?: PlotT0Data[];
  withdrawnSpeciesPlots?: SpeciesPlot[];
};
const PermanentPlotsTab = ({
  plantingSiteId,
  plotsWithObservations,
  t0Plots,
  withdrawnSpeciesPlots,
}: PermanentPlotsTabProps) => {
  const theme = useTheme();

  if (!plotsWithObservations || plotsWithObservations.length === 0) {
    return <Box padding={theme.spacing(2)}>{strings.NO_PERMANENT_PLOTS_FOR_SURVIVAL_RATE_CALCULATION}</Box>;
  }
  return (
    plantingSiteId &&
    plotsWithObservations?.map((plot) => (
      <PlotT0Box
        plot={plot}
        key={plot.id}
        plantingSiteId={plantingSiteId}
        t0Plot={t0Plots?.find((t0Plot) => t0Plot.monitoringPlotId.toString() === plot.id.toString())}
        withdrawnSpeciesPlot={withdrawnSpeciesPlots?.find(
          (spPlot) => spPlot.monitoringPlotId.toString() === plot.id.toString()
        )}
      />
    ))
  );
};

export default PermanentPlotsTab;
