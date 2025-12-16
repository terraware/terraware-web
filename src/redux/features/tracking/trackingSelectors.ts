import { createCachedSelector } from 're-reselect';

import { RootState } from 'src/redux/rootReducer';
import { PlantingSite } from 'src/types/Tracking';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;

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

export const selectOnePlantingSite = (requestId: string) => (state: RootState) => state.plantingSite[requestId];

export const selectMonitoringPlots = (state: RootState, requestId: string) => state.monitoringPlots[requestId];

export const selectPlantingSiteList = (requestId: string) => (state: RootState) => state.plantingSiteList[requestId];

export const selectPlantingSiteHistory = (state: RootState, requestId: string) => state.plantingSiteHistory[requestId];

export const selectPlantingSiteHistories = (requestId: string) => (state: RootState) =>
  state.plantingSiteHistories[requestId];

export const selectPlantingSiteReportedPlants = (requestId: string) => (state: RootState) =>
  state.plantingSiteReportedPlants[requestId];

export const selectOrganizationReportedPlants = (requestId: string) => (state: RootState) =>
  state.organizationReportedPlants[requestId];

export const selectPlotsWithObservations = (requestId: string) => (state: RootState) =>
  state.plotsWithObservations[requestId];

export const selectProjectPlantingSiteList = (requestId: string) => (state: RootState) =>
  state.projectPlantingSites[requestId];

export const selectPlantingSiteT0AllSet = (requestId: string) => (state: RootState) =>
  state.plantingSiteT0AllSet[requestId];
