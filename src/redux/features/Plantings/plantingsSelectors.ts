import { RootState } from 'src/redux/rootReducer';
import { selectPlantingSites } from '../tracking/trackingSelectors';
import { createSelector } from '@reduxjs/toolkit';
import { PlantingSearchData } from './plantingsSlice';

export const selectPlantings = (state: RootState) => state.plantings?.plantings;

export const getTotalPlantsBySubzone = (plantings: PlantingSearchData[]) => {
  return plantings?.reduce((plantingsBySubzone: { [key: string]: number }, planting) => {
    const subzoneId = planting.plantingSubzone.id;
    if (plantingsBySubzone[subzoneId]) {
      plantingsBySubzone[subzoneId] = plantingsBySubzone[subzoneId] + planting.totalPlants;
    } else {
      plantingsBySubzone[subzoneId] = planting.totalPlants;
    }
    return plantingsBySubzone;
  }, {});
};

export const selectPlantingsDateRange = (state: RootState, dateRange: string[]) =>
  selectPlantings(state)?.filter((planting) => {
    if (!dateRange || dateRange.length === 0) {
      return true;
    }
    return planting.createdTime > dateRange[0] && (dateRange.length < 2 || planting.createdTime < dateRange[1]);
  }) ?? [];

export const selectPlantingProgressSubzones = createSelector(
  [(state: RootState) => selectPlantingSites(state), (state: RootState) => selectPlantings(state)],
  (plantingSites, plantings) => {
    if (plantings) {
      const plantingsBySubzone = getTotalPlantsBySubzone(plantings);
      return plantingSites?.map((ps) => {
        return {
          siteId: ps.id,
          siteName: ps.name,
          reported: ps.plantingZones?.flatMap((zone) => {
            return zone.plantingSubzones.map((sz) => {
              return {
                subzoneName: sz.fullName,
                plantingComplete: sz.plantingCompleted,
                plantingSite: ps.name,
                zone: zone.name,
                targetPlantingDensity: zone.targetPlantingDensity,
                totalSeedlingsSent: plantingsBySubzone[sz.id],
              };
            });
          }),
        };
      });
    }
  }
);

// selector for single site
export const getReportedPlantsForSite = (state: RootState, siteId: number) =>
  selectPlantingProgressSubzones(state)?.find((report) => report.siteId === siteId);

// selector for search and filtering
export const searchReportedPlants = (state: RootState, siteIds: string[], query: string) => {
  selectPlantingProgressSubzones(state)?.filter((report) => {
    return !!siteIds.find((siteId) => siteId === report.siteId.toString());
  });
};
