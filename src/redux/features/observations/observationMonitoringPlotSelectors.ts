import { createSelector } from '@reduxjs/toolkit';
import { ObservationPlantingSubzoneResults, ObservationMonitoringPlotResults } from 'src/types/Observations';
import { ZoneParams, selectObservationPlantingZone } from './observationPlantingZoneSelectors';

export type MonitoringPlotParams = ZoneParams & {
  monitoringPlotId: number;
};

export const selectObservationMonitoringPlot = createSelector(
  [selectObservationPlantingZone, (state, params, defaultTimeZone) => params],
  (observationPlantingZone, params) => {
    observationPlantingZone?.plantingSubzones
      .flatMap((subzone: ObservationPlantingSubzoneResults) => ({
        ...subzone.monitoringPlots,
        plantingZoneName: observationPlantingZone.plantingZoneName,
        plantingSubzoneName: subzone.plantingSubzoneName,
      }))
      .find(
        (monitoringPlot: ObservationMonitoringPlotResults) =>
          monitoringPlot.monitoringPlotId === params.monitoringPlotId
      )
);
