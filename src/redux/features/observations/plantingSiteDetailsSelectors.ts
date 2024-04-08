import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';

import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { RootState } from 'src/redux/rootReducer';
import { Aggregation, ZoneAggregation } from 'src/types/Observations';
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
            monitoringPlots: Array.from(zones[zone.id]?.subzones[sz.id] ?? [])
              .map((plotId) => zones[zone.id].plots[plotId])
              .filter((plot) => !!plot),
          })),
        })
      ) ?? []
    );
  }
);

/**
 * Select a single planting zone by id
 */
export const selectPlantingZone = createSelector(
  [
    (state: RootState, plantingSiteId: number, zoneId: number) => selectPlantingSiteZones(state, plantingSiteId),
    (state: RootState, plantingSiteId: number, zoneId: number) => zoneId,
  ],
  (results, zoneId) => results?.find((z) => z.id === zoneId)
);

/**
 * Select a single planting subzone by id
 */
export const selectPlantingSubzone = createSelector(
  [
    (state: RootState, plantingSiteId: number, zoneId: number, subzoneId: number) =>
      selectPlantingZone(state, plantingSiteId, zoneId),
    (state: RootState, plantingSiteId: number, zoneId: number, subzoneId: number) => subzoneId,
  ],
  (zone, subzoneId): ZoneAggregation | undefined => {
    const subzone = zone?.plantingSubzones.find((sz) => sz.id === subzoneId);
    if (subzone) {
      return {
        ...zone,
        plantingSubzones: [subzone],
      } as ZoneAggregation;
    } else {
      return undefined;
    }
  }
);

/**
 * Search zones by name
 */
export const searchPlantingSiteZones = createCachedSelector(
  (state: RootState, plantingSiteId: number, query: string) => {
    const data = selectPlantingSiteZones(state, plantingSiteId);
    return (query ? data?.filter((datum) => regexMatch(datum.name, query)) : data) ?? [];
  },
  (data) => data
)((state: RootState, plantingSiteId: number, query: string) => `${plantingSiteId}_${query}`);

/**
 * Search subzones by name
 */
export const searchPlantingSiteSubzones = (state: RootState, plantingSiteId: number, zoneId: number, query: string) => {
  const data = selectPlantingZone(state, plantingSiteId, zoneId);

  if (!query || !data) {
    return data;
  }

  return {
    ...data,
    plantingSubzones: data.plantingSubzones.filter((sz) => regexMatch(sz.name, query)),
  };
};

/**
 * Search monitoring plots by name
 */
export const searchPlantingSiteMonitoringPlots = createCachedSelector(
  (state: RootState, plantingSiteId: number, zoneId: number, subzoneId: number, query: string) => query,
  (state: RootState, plantingSiteId: number, zoneId: number, subzoneId: number, query: string) =>
    selectPlantingSubzone(state, plantingSiteId, zoneId, subzoneId),
  (query, data): ZoneAggregation | undefined => {
    if (!query || !data) {
      return data;
    }

    const subzone = data.plantingSubzones[0];

    return {
      ...data,
      plantingSubzones: [
        {
          ...subzone,
          monitoringPlots: subzone.monitoringPlots.filter((plot) => regexMatch(plot.monitoringPlotName, query)),
        },
      ],
    } as ZoneAggregation;
  }
)(
  (state: RootState, plantingSiteId: number, zoneId: number, subzoneId: number, query: string) =>
    `${plantingSiteId}_${zoneId}_${subzoneId}_${query}`
);
