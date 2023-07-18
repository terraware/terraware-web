import { RootState } from 'src/redux/rootReducer';
import { regexMatch } from 'src/utils/search';
import { selectPlantingSites } from '../tracking/trackingSelectors';
import { createSelector } from '@reduxjs/toolkit';
import { PlantingSearchData } from './plantingsSlice';

export const selectPlantings = (state: RootState) => state.plantings?.plantings;

export const selectPlantingsForSite = createSelector(
  [(state: RootState, id: number) => state.plantings?.plantings, (state: RootState, id: number) => id],
  (plantings, id) => (plantings ?? []).filter((planting) => planting.plantingSite.id.toString() === id.toString())
);

export const getTotalPlantsBySubzone = (plantings: PlantingSearchData[]) => {
  return plantings?.reduce((plantingsBySubzone: { [key: string]: number }, planting) => {
    if (!planting.plantingSubzone) {
      return plantingsBySubzone;
    }
    const subzoneId = planting.plantingSubzone.id;
    const totalPlants = Number(planting.plantingSubzone['totalPlants(raw)']);
    if (plantingsBySubzone[subzoneId]) {
      plantingsBySubzone[subzoneId] = plantingsBySubzone[subzoneId] + totalPlants;
    } else {
      plantingsBySubzone[subzoneId] = totalPlants;
    }
    return plantingsBySubzone;
  }, {});
};

export const getTotalPlantsBySite = (plantings: PlantingSearchData[]) => {
  return plantings?.reduce((totalPlantsBySite: { [key: string]: number }, planting) => {
    totalPlantsBySite[planting.plantingSite.id] = 5; // TODO: fix this selector
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

export const selectPlantingProgress = createSelector(
  [(state: RootState) => selectPlantingSites(state), (state: RootState) => selectPlantings(state)],
  (plantingSites, plantings) => {
    if (plantings) {
      const plantingsBySubzone = getTotalPlantsBySubzone(plantings);
      const totalPlantsBySite = getTotalPlantsBySite(plantings);
      return plantingSites?.map((ps) => {
        return {
          siteId: ps.id,
          siteName: ps.name,
          reported: ps.plantingZones?.flatMap((zone) =>
            zone.plantingSubzones
              .filter((sz) => plantingsBySubzone[sz.id])
              .map((sz) => ({
                subzoneName: sz.fullName,
                plantingCompleted: sz.plantingCompleted,
                plantingSite: ps.name,
                zoneName: zone.name,
                targetPlantingDensity: zone.targetPlantingDensity,
                totalSeedlingsSent: plantingsBySubzone[sz.id],
              }))
          ),
          totalPlants: totalPlantsBySite[ps.id],
        };
      });
    }
  }
);

// selector to search plantings
export const searchPlantingProgress = createSelector(
  [
    (state: RootState, query: string, plantingCompleted?: boolean) => selectPlantingProgress(state),
    (state: RootState, query: string, plantingCompleted?: boolean) => query,
    (state: RootState, query: string, plantingCompleted?: boolean) => plantingCompleted,
  ],
  (plantingProgress, query, plantingCompleted) => {
    return plantingProgress
      ?.filter((planting) => planting.totalPlants > 0)
      .reduce((acc, curr) => {
        const { siteId, siteName, totalPlants, reported } = curr;
        if (reported && reported.length > 0) {
          reported?.forEach((progress) => {
            const matchesQuery = !query || regexMatch(progress.subzoneName, query);
            const matchesPlantingCompleted =
              plantingCompleted === undefined || progress.plantingCompleted === plantingCompleted;
            if (matchesQuery && matchesPlantingCompleted) {
              acc.push({ siteId, siteName, totalPlants, ...progress });
            }
          });
        } else if (!query && plantingCompleted === undefined) {
          acc.push({ siteId, siteName, totalSeedlingsSent: totalPlants });
        }
        return acc;
      }, [] as any[]);
  }
);

export const selectUpdatePlantingCompleted = (state: RootState, requestId: string) =>
  (state.updatePlantingCompleted as any)[requestId];
