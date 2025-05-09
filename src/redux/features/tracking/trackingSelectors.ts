import { createCachedSelector } from 're-reselect';

import { RootState } from 'src/redux/rootReducer';
import { PlantingSite } from 'src/types/Tracking';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;

export const selectOrgPlantingSites = (organizationId: number) => (state: RootState) =>
  state.tracking?.[organizationId]?.data?.plantingSites;

export const selectPlantingSitesNames = createCachedSelector(
  (state: RootState) => selectPlantingSites(state),
  (plantingSites) => {
    const names = plantingSites?.map((ps) => ps.name);
    return names;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
)((state: RootState) => 'plantingSitesNames');

export const selectPlantingSitesSearchResults = (state: RootState) => state.plantingSitesSearchResults.sites;

export const selectPlantingSitesError = (state: RootState) => state.tracking?.error;

export const selectPlantingSite = (state: RootState, plantingSiteId: number) =>
  selectPlantingSites(state)?.find((site: PlantingSite) => site.id === plantingSiteId);

export const selectOrgPlantingSite = (state: RootState, plantingSiteId: number, orgId: number) =>
  selectOrgPlantingSites(orgId)(state)?.find((site: PlantingSite) => site.id === plantingSiteId);

export const selectSiteReportedPlants = (state: RootState, plantingSiteId: number) =>
  state.siteReportedPlantsResults[plantingSiteId]?.site;

export const selectMultipleSitesTotalPlants = (state: RootState, plantingSiteIds: string[]) => {
  return plantingSiteIds.reduce((total, psId) => {
    const siteData = state.siteReportedPlantsResults[+psId]?.site;
    return total + (siteData?.totalPlants ?? 0);
  }, 0);
};

export const selectSiteReportedPlantsError = (state: RootState, plantingSiteId: number) =>
  state.siteReportedPlantsResults[plantingSiteId]?.error;

export const selectMonitoringPlots = (state: RootState, requestId: string) => state.monitoringPlots[requestId];

export const selectPlantingSiteHistory = (state: RootState, requestId: string) => state.plantingSiteHistory[requestId];

export const selectPlantingSiteHistories = (requestId: string) => (state: RootState) =>
  state.plantingSiteHistories[requestId];

export const selectPlantingSiteReportedPlants = (requestId: string) => (state: RootState) =>
  state.plantingSiteReportedPlants[requestId];
