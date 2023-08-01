import { RootState } from 'src/redux/rootReducer';
import { selectPlantingSites, selectPlantingSitesSearchResults } from '../tracking/trackingSelectors';
import { regexMatch } from 'src/utils/search';
import { createSelector } from '@reduxjs/toolkit';
import { PlantingSearchData } from './plantingsSlice';
import { PlantingSiteSearchResult } from 'src/types/Tracking';
import { selectLatestObservation } from '../observations/observationsSelectors';

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

export const selectPlantingProgress = createSelector(
  [
    (state: RootState) => selectPlantingSitesSearchResults(state),
    (state: RootState) => selectPlantingSites(state),
    (state: RootState) => selectPlantings(state),
  ],
  (plantingSitesSearchResults, plantingSites, plantings) => {
    if (plantingSitesSearchResults && plantings) {
      const plantingsBySubzone = getTotalPlantsBySubzone(plantings);
      const totalPlantsBySite = getTotalPlantsBySite(plantingSitesSearchResults);
      return plantingSites
        ?.filter((ps) => totalPlantsBySite[ps.id])
        .map((ps) => {
          return {
            siteId: ps.id,
            siteName: ps.name,
            reported: ps.plantingZones?.flatMap((zone) =>
              zone.plantingSubzones
                .filter((sz) => plantingsBySubzone[sz.id])
                .map((sz) => ({
                  subzoneId: sz.id,
                  subzoneName: sz.fullName,
                  plantingCompleted: sz.plantingCompleted,
                  plantingSite: ps.name,
                  zoneName: zone.name,
                  zoneId: zone.id,
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
    (state: RootState, query: string, plantingCompleted?: boolean, plantingSiteId?: number) =>
      selectPlantingProgress(state),
    (state: RootState, query: string, plantingCompleted?: boolean, plantingSiteId?: number) => query,
    (state: RootState, query: string, plantingCompleted?: boolean, plantingSiteId?: number) => plantingCompleted,
    (state: RootState, query: string, plantingCompleted?: boolean, plantingSiteId?: number) => plantingSiteId,
  ],
  (plantingProgress, query, plantingCompleted, plantingSiteId) => {
    return plantingProgress?.reduce((acc, curr) => {
      const { siteId, siteName, totalPlants, reported } = curr;
      const matchesPlantingSite =
        plantingSiteId === undefined || plantingSiteId === -1 || siteId === plantingSiteId;
      if (!matchesPlantingSite) {
        return acc;
      }
      if (reported && reported.length > 0) {
        reported?.forEach((progress) => {
          const matchesQuery = !query || regexMatch(progress.subzoneName, query);
          const matchesPlantingCompleted =
            plantingCompleted === undefined || progress.plantingCompleted === plantingCompleted;
          if (matchesQuery && matchesPlantingCompleted) {
            acc.push({ siteId, siteName, totalPlants, ...progress });
          }
        });
      } else if (plantingCompleted === undefined && regexMatch(siteName, query)) {
        acc.push({ siteId, siteName, totalSeedlingsSent: totalPlants });
      }
      return acc;
    }, [] as any[]);
  }
);

export const selectUpdatePlantingCompleted = (state: RootState, requestId: string) =>
  (state.updatePlantingCompleted as any)[requestId];

export const selectUpdatePlantingsCompleted = (state: RootState, requestId: string) =>
  (state.updatePlantingsCompleted as any)[requestId];

export const selectZonesHaveStatistics = createSelector(
  [
    (state: RootState, zoneIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) => state,
    (state: RootState, zoneIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) => zoneIdsBySiteId,
    (state: RootState, zoneIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) => defaultTimeZoneId,
  ],
  (state, zoneIdsBySiteId, defaultTimeZoneId) => {
    if (zoneIdsBySiteId && defaultTimeZoneId) {
      const zonesHaveStatistics = Object.keys(zoneIdsBySiteId).some((siteId) => {
        const siteIdSelected = Number(siteId);
        const latestObservations = selectLatestObservation(state, siteIdSelected, defaultTimeZoneId);
        return Array.from(zoneIdsBySiteId[siteIdSelected]).some((zoneId) => {
          return latestObservations?.plantingZones.some(
            (plantingZone) =>
              plantingZone.plantingZoneId === zoneId &&
              plantingZone.estimatedPlants !== null &&
              plantingZone.estimatedPlants !== undefined
          );
        });
      });

      return zonesHaveStatistics;
    }
  }
);
