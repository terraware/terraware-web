import { createSelector } from '@reduxjs/toolkit';

import { ObservationMonitoringPlotResults, ObservationSubstratumResults } from 'src/types/Observations';

import { ZoneParams, selectObservationPlantingZone } from './observationPlantingZoneSelectors';

export type MonitoringPlotParams = ZoneParams & {
  monitoringPlotId: number;
};

export type PlotObservations = ObservationMonitoringPlotResults & {
  plantingZoneName: string;
  plantingSubzoneName: string;
};

export const selectObservationMonitoringPlot = createSelector(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [selectObservationPlantingZone, (state, params, defaultTimeZone) => params],
  (observationPlantingZone, params) =>
    observationPlantingZone?.substrata
      .flatMap((subzone: ObservationSubstratumResults): PlotObservations[] =>
        subzone.monitoringPlots.map((plot: ObservationMonitoringPlotResults) => ({
          ...plot,
          plantingZoneName: observationPlantingZone.stratumName,
          plantingSubzoneName: subzone.substratumName,
        }))
      )
      .find((monitoringPlot: PlotObservations) => monitoringPlot.monitoringPlotId === params.monitoringPlotId)
);
