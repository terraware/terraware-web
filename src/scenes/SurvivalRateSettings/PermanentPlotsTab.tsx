import React from 'react';

import { SpeciesPlot } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import { PlotT0Data } from 'src/types/Tracking';

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
