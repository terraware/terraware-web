import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/rootReducer';
import { ObservationMonitoringPlotResultsPayload, Aggregation, ZoneAggregation } from 'src/types/Observations';
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

    const zones: Record<number, Aggregation> = {};
    /**
     * Iterate through all the planting zones in the observations results to book-keep subzones and monitoring plots for the zone
     */
    observationsResults
      ?.flatMap((result) => result.plantingZones)
      .forEach((zone) => {
        const { plantingZoneId, completedTime, plantingSubzones } = zone;
        if (!zones[plantingZoneId]) {
          // initialize book-keeping data for zone
          zones[plantingZoneId] = { subzones: {}, plots: {}, completedTime };
        }
        /**
         * Iterate through planting zones and maintain a running set of all monitoring plots for a planting sub zone (across observations results)
         * Ex. if result1 has subzoneA->[monitoring-plot-1, monitoring-plot-2] and result2 has subzoneA->[monitoring-plot-2, monitoring-plot-3],
         *     we want to generate a complete set of subzoneA->[monitoring-plot-1, monitoring-plot-2, monitoring-plot-3]
         *     In addition, we maintain a map of plotId->monitoring-plot-data (geometry, plot type, completed time, etc.), this is used to eventually generate
         *     a mapping of subzoneA->[monitoring plots data]
         */
        plantingSubzones.forEach((subzone) => {
          const { plantingSubzoneId, monitoringPlots } = subzone;
          const monitoringPlotIds = monitoringPlots.map((plot) => plot.monitoringPlotId);
          const lastSubzones = zones[plantingZoneId].subzones[plantingSubzoneId];
          // book keep subzoneId->[set of monitoring plot ids]
          if (!lastSubzones) {
            zones[plantingZoneId].subzones[plantingSubzoneId] = new Set(monitoringPlotIds);
          } else {
            zones[plantingZoneId].subzones[plantingSubzoneId] = new Set([
              ...Array.from(lastSubzones),
              ...monitoringPlotIds,
            ]);
          }
          // populate map of monitoringPlotId->monitoringPlotData (keep the one with latest observed time)
          monitoringPlots.forEach((monitoringPlot) => {
            const { monitoringPlotId } = monitoringPlot;
            const lastUpdated = zones[plantingZoneId].plots[monitoringPlotId];
            if (lastUpdated && !isAfter(monitoringPlot.completedTime, lastUpdated.completedTime)) {
              return;
            }
            zones[plantingZoneId].plots[monitoringPlotId] = monitoringPlot;
          });
        });
        // keep the latest observed time for the zone
        const lastCompletedTime = zones[plantingZoneId].completedTime;
        if (lastCompletedTime !== completedTime && isAfter(completedTime, lastCompletedTime)) {
          zones[plantingZoneId].completedTime = completedTime;
        }
      });

    /**
     * Here we repopulate the planting site zones with additional aggregated information
     * Additional data:
     *  zone-> completedTime, plantingCompleted (in addition to existing fields in PlantingZone)
     *  subzone-> union of monitoring plots across observation results (in addition to existing fields in PlantingSubzone)
     */
    return (
      plantingSite?.plantingZones?.map(
        (zone): ZoneAggregation => ({
          ...zone,
          // get completed time from book-keeping
          completedTime: zones[zone.id]?.completedTime,
          // roll up planting completed from sub zones
          plantingCompleted:
            zone.plantingSubzones.length > 0 && !zone.plantingSubzones.some((sz) => !sz.plantingCompleted),
          // repopulate subzones with additional monitoring plots data
          plantingSubzones: zone.plantingSubzones.map((sz) => ({
            ...sz,
            // generate monitoring plots from book-keeping data
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
