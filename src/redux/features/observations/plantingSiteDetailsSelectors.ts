import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/rootReducer';
import {
  ObservationMonitoringPlotResultsPayload,
  ObservationsAggregation,
  ZoneObservationsAggregation,
} from 'src/types/Observations';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { isAfter } from 'src/utils/dateUtils';
import { regexMatch } from 'src/utils/search';

/**
 * Observations results selectors below
 */
export const selectPlantingSiteObservationsResults = (state: RootState, plantingSiteId: number) =>
  state.plantingSiteObservationsResults?.[plantingSiteId]?.observations;
export const selectPlantingSiteObservationsResultsError = (state: RootState, plantingSiteId: number) =>
  state.plantingSiteObservationsResults?.[plantingSiteId]?.error;

/**
 * Aggregate monitoring plots and last observed times across observation results for a planting site
 */
export const selectPlantingSiteZones = createSelector(
  [
    (state: RootState, plantingSiteId: number) => selectPlantingSite(state, plantingSiteId),
    (state: RootState, plantingSiteId: number) => selectPlantingSiteObservationsResults(state, plantingSiteId),
  ],
  (plantingSite, observationsResults) => {
    /**
     * Aggregate unique monitoring plots across results and keep those zones/subzones data with latest completed times
     */

    const zones: Record<number, ObservationsAggregation> = {};
    observationsResults
      ?.flatMap((result) => result.plantingZones)
      .forEach((zone) => {
        const { plantingZoneId, completedTime, plantingSubzones } = zone;
        if (!zones[plantingZoneId]) {
          zones[plantingZoneId] = { subzones: {}, plots: {}, completedTime };
        }
        plantingSubzones.forEach((subzone) => {
          const { plantingSubzoneId, monitoringPlots } = subzone;
          const monitoringPlotIds = monitoringPlots.map((plot) => plot.monitoringPlotId);
          const lastSubzones = zones[plantingZoneId].subzones[plantingSubzoneId];
          if (!lastSubzones) {
            zones[plantingZoneId].subzones[plantingSubzoneId] = new Set(monitoringPlotIds);
          } else {
            zones[plantingZoneId].subzones[plantingSubzoneId] = new Set([
              ...Array.from(lastSubzones),
              ...monitoringPlotIds,
            ]);
          }
          monitoringPlots.forEach((monitoringPlot) => {
            const { monitoringPlotId } = monitoringPlot;
            const lastUpdated = zones[plantingZoneId].plots[monitoringPlotId];
            if (lastUpdated && !isAfter(monitoringPlot.completedTime, lastUpdated.completedTime)) {
              return;
            }
            zones[plantingZoneId].plots[monitoringPlotId] = monitoringPlot;
          });
        });
        const lastCompletedTime = zones[plantingZoneId].completedTime;
        if (lastCompletedTime !== completedTime && isAfter(completedTime, lastCompletedTime)) {
          zones[plantingZoneId].completedTime = completedTime;
        }
      });

    return (
      plantingSite?.plantingZones?.map(
        (zone): ZoneObservationsAggregation => ({
          ...zone,
          completedTime: zones[zone.id]?.completedTime,
          plantingCompleted:
            zone.plantingSubzones.length > 0 && !zone.plantingSubzones.some((sz) => !sz.plantingCompleted),
          plantingSubzones: zone.plantingSubzones.map((sz) => ({
            ...sz,
            monitoringPlots: zone.plantingSubzones
              .filter((plantingSubzone) => !!zones[zone.id]?.subzones[plantingSubzone.id])
              .reduce((acc, plantingSubzone) => {
                const monitoringPlots =
                  Array.from(zones[zone.id].subzones[plantingSubzone.id] ?? [])
                    ?.map((plotId) => zones[zone.id].plots[plotId])
                    .filter((plot) => !!plot) ?? [];
                return monitoringPlots.length ? [...acc, ...monitoringPlots] : acc;
              }, [] as ObservationMonitoringPlotResultsPayload[]),
          })),
        })
      ) ?? []
    );
  }
);

/**
 * Search by name
 */
export const searchPlantingSiteZones = (state: RootState, plantingSiteId: number, query: string) => {
  const data = selectPlantingSiteZones(state, plantingSiteId);
  return (query.trim() ? data?.filter((datum) => regexMatch(datum.name, query)) : data) ?? [];
};
