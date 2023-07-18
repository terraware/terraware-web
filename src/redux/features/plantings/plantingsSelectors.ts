import { RootState } from 'src/redux/rootReducer';
import { selectSearchPlantingSites } from '../tracking/trackingSelectors';
import { createSelector } from '@reduxjs/toolkit';
import { PlantingSearchData } from './plantingsSlice';
import { PlantingSiteSearchResult } from 'src/types/Tracking';

export const selectPlantings = (state: RootState) => state.plantings?.plantings;

export const selectPlantingsForSite = createSelector(
  [(state: RootState, id: number) => state.plantings?.plantings, (state: RootState, id: number) => id],
  (plantings, id) => (plantings ?? []).filter((planting) => planting.plantingSite.id.toString() === id.toString())
);

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

export const getTotalPlantsBySite = (plantingsSites: PlantingSiteSearchResult[]) => {
  return plantingsSites?.reduce((totalPlantsBySite: { [key: string]: number }, plantingSite) => {
    const plantingSiteId = plantingSite.id;
    if (totalPlantsBySite[plantingSiteId]) {
      totalPlantsBySite[plantingSiteId] = totalPlantsBySite[plantingSiteId] + plantingSite['totalPlants(raw)'];
    } else {
      totalPlantsBySite[plantingSiteId] = plantingSite['totalPlants(raw)'];
    }
    return totalPlantsBySite;
  }, {});
};

export const selectPlantingsDateRange = (state: RootState, dateRange: string[], plantingSiteId: number) =>
  selectPlantingsForSite(state, plantingSiteId)?.filter((planting) => {
    if (!dateRange || dateRange.length === 0) {
      return true;
    }
    return planting.createdTime > dateRange[0] && (dateRange.length < 2 || planting.createdTime < dateRange[1]);
  }) ?? [];

export const selectPlantingProgressSubzones = createSelector(
  [(state: RootState) => selectSearchPlantingSites(state), (state: RootState) => selectPlantings(state)],
  (plantingSites, plantings) => {
    if (plantingSites && plantings) {
      const plantingsBySubzone = getTotalPlantsBySubzone(plantings);
      const totalPlantsBySite = getTotalPlantsBySite(plantingSites);
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
          totalPlants: totalPlantsBySite[ps.id],
        };
      });
    }
  }
);

// selector for single site
export const getReportedPlantsForSite = (state: RootState, siteId: number) =>
  selectPlantingProgressSubzones(state)?.find((report) => report.siteId === siteId);

export const selectUpdatePlantingCompleted = (state: RootState, requestId: string) =>
  (state.updatePlantingCompleted as any)[requestId];
