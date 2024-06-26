import { createSelector } from '@reduxjs/toolkit';

import { ObservationMonitoringPlotResults, ObservationPlantingSubzoneResults } from 'src/types/Observations';

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
    observationPlantingZone?.plantingSubzones
      .flatMap((subzone: ObservationPlantingSubzoneResults): PlotObservations[] =>
        subzone.monitoringPlots.map((plot: ObservationMonitoringPlotResults) => ({
          ...plot,
          plantingZoneName: observationPlantingZone.plantingZoneName,
          plantingSubzoneName: subzone.plantingSubzoneName,
        }))
      )
      .find((monitoringPlot: PlotObservations) => monitoringPlot.monitoringPlotId === params.monitoringPlotId)
);
