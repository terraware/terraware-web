/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSelector } from '@reduxjs/toolkit';

import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { PlantingSearchData } from 'src/redux/features/plantings/plantingsSlice';
import { selectPlantingSites, selectPlantingSitesSearchResults } from 'src/redux/features/tracking/trackingSelectors';
import { RootState } from 'src/redux/rootReducer';
import strings from 'src/strings';
import { SearchNodePayload } from 'src/types/Search';
import { PlantingSiteSearchResult } from 'src/types/Tracking';
import { regexMatch } from 'src/utils/search';

export const selectPlantings = (state: RootState) => state.plantings?.plantings;

export const selectPlantingsForSite = createSelector(
  [(state: RootState, id: number) => state.plantings?.plantings, (state: RootState, id: number) => id],
  (plantings, id) => (plantings ?? []).filter((planting) => planting.plantingSite.id.toString() === id.toString())
);

export const getTotalPlantsBySubzone = (plantings: PlantingSearchData[]) => {
  return plantings?.reduce((plantingsBySubzone: { [key: string]: number }, planting) => {
    if (!planting.substratum) {
      return plantingsBySubzone;
    }
    const subzoneId = planting.substratum.id;
    plantingsBySubzone[subzoneId] = planting.substratum['totalPlants(raw)'];
    return plantingsBySubzone;
  }, {});
};

export const getTotalPlantsBySite = (plantingsSites: PlantingSiteSearchResult[]) => {
  return plantingsSites?.reduce((totalPlantsBySite: { [key: string]: number }, plantingSite) => {
    const plantingSiteId = plantingSite.id;
    totalPlantsBySite[plantingSiteId] = Number(plantingSite['totalPlants(raw)']);
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
          const plantingSiteProject = plantingSitesSearchResults.find(
            (pssr: PlantingSiteSearchResult) => `${ps.id}` === `${pssr.id}`
          );

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
            ...(plantingSiteProject
              ? {
                  projectName: plantingSiteProject.project_name,
                  projectId: plantingSiteProject.project_id,
                }
              : {}),
          };
        });
    }
  }
);

// selector to search plantings
export type PlantingProgress = {
  plantingCompleted: boolean;
  plantingSize: string;
  projectName: string;
  siteId: number;
  siteName: string;
  subzoneId: number;
  subzoneName: string;
  targetPlantingDensity: number;
  totalPlants: number;
  totalSeedlingsSent: number;
  zoneId: number;
  zoneName: string;
};

export const searchPlantingProgress = createSelector(
  [
    (state: RootState, query: string, filters: Record<string, SearchNodePayload>) => selectPlantingProgress(state),
    (state: RootState, query: string, filters: Record<string, SearchNodePayload>) => query,
    (state: RootState, query: string, filters: Record<string, SearchNodePayload>) => filters,
  ],
  (plantingProgress, query, filters) => {
    return plantingProgress?.reduce((acc, curr) => {
      const { siteId, siteName, totalPlants, reported, projectName, projectId } = curr;

      const plantingCompleted: boolean | undefined = filters.plantingCompleted?.values[0]
        ? filters.plantingCompleted?.values[0] === strings.YES
        : undefined;

      const siteNameSelected: string | undefined = filters.siteName?.values[0];

      const projectIdsSelected: number[] | undefined = filters.project_id?.values.map((value: string) => Number(value));
      const projectNotPresentSelected = (filters.project_id?.values || [])[0] === null;

      if (reported && reported.length > 0) {
        reported?.forEach((progress) => {
          const matchesQuery = !query || regexMatch(progress.subzoneName, query);
          const matchesPlantingCompleted =
            plantingCompleted === undefined || progress.plantingCompleted === plantingCompleted;
          const matchesSiteName = siteNameSelected === undefined || siteName === siteNameSelected;
          const matchesProjectId =
            projectNotPresentSelected ||
            projectIdsSelected === undefined ||
            projectIdsSelected.includes(Number(projectId));
          const matchesProjectNotPresent = !projectNotPresentSelected || (projectNotPresentSelected && !projectId);

          if (
            matchesQuery &&
            matchesPlantingCompleted &&
            matchesSiteName &&
            matchesProjectId &&
            matchesProjectNotPresent
          ) {
            acc.push({ siteId, siteName, totalPlants, projectName, ...progress });
          }
        });
      } else if (
        plantingCompleted === undefined &&
        (siteNameSelected ? siteNameSelected === siteName : regexMatch(siteName, query))
      ) {
        if (projectNotPresentSelected && !projectId) {
          acc.push({ siteId, siteName, totalSeedlingsSent: totalPlants, projectName });
        } else if (projectIdsSelected === undefined || projectIdsSelected.includes(Number(projectId))) {
          acc.push({ siteId, siteName, totalSeedlingsSent: totalPlants, projectName });
        }
      }

      return acc;
    }, [] as Partial<PlantingProgress>[]);
  }
);

export const selectUpdatePlantingCompleted = (state: RootState, requestId: string) =>
  state.updatePlantingCompleted[requestId];

export const selectUpdatePlantingsCompleted = (state: RootState, requestId: string) =>
  state.updatePlantingsCompleted[requestId];

export const selectZonesHaveStatistics = createSelector(
  [
    (state: RootState, orgId: number, zoneIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) =>
      state,
    (state: RootState, orgId: number, zoneIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) =>
      orgId,
    (state: RootState, orgId: number, zoneIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) =>
      zoneIdsBySiteId,
    (state: RootState, orgId: number, zoneIdsBySiteId?: Record<number, Set<number>>, defaultTimeZoneId?: string) =>
      defaultTimeZoneId,
  ],
  (state, orgId, zoneIdsBySiteId, defaultTimeZoneId) => {
    if (zoneIdsBySiteId && defaultTimeZoneId) {
      const zonesHaveStatistics = Object.keys(zoneIdsBySiteId).some((siteId) => {
        const siteIdSelected = Number(siteId);
        const latestObservations = selectLatestObservation(state, siteIdSelected, orgId, defaultTimeZoneId);
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
