import { Action, combineReducers } from '@reduxjs/toolkit';
import { appVersionReducer } from './features/appVersion/appVersionSlice';
import {
  observationsReducer,
  observationsResultsReducer,
  plantingSiteObservationsResultsReducer,
  scheduleObservationReducer,
  replaceObservationPlotReducer,
  rescheduleObservationReducer,
} from './features/observations/observationsSlice';
import {
  plantingsReducer,
  updatePlantingCompletedReducer,
  updatePlantingsCompletedReducer,
} from './features/plantings/plantingsSlice';
import { speciesReducer } from './features/species/speciesSlice';
import {
  monitoringPlotsReducer,
  plantingSitesSearchResultsReducer,
  sitePopulationReducer,
  siteReportedPlantsReducer,
  trackingReducer,
} from './features/tracking/trackingSlice';
import { snackbarReducer } from './features/snackbar/snackbarSlice';
import { messageReducer } from './features/message/messageSlice';
import { userAnalyticsReducer } from './features/user/userAnalyticsSlice';
import { projectsReducer, projectsRequestsReducer } from 'src/redux/features/projects/projectsSlice';
import { subLocationsReducer } from './features/subLocations/subLocationsSlice';
import { batchesReducer, batchesRequestsReducer } from './features/batches/batchesSlice';
import { accessionsReducer } from './features/accessions/accessionsSlice';
import { reportsSettingsReducer } from 'src/redux/features/reportsSettings/reportsSettingsSlice';
import { speciesProjectsReducer } from 'src/redux/features/species/speciesProjectsSlice';
import {
  draftPlantingSiteCreateReducer,
  draftPlantingSiteEditReducer,
  draftPlantingSiteGetReducer,
  draftPlantingSiteSearchReducer,
} from 'src/redux/features/draftPlantingSite/draftPlantingSiteSlice';
import { deliverableListReducer, deliverablesReducer } from 'src/redux/features/deliverables/deliverablesSlice';

// assembly of app reducers
export const reducers = {
  accessions: accessionsReducer,
  appVersion: appVersionReducer,
  batches: batchesReducer,
  batchesRequests: batchesRequestsReducer,
  deliverableList: deliverableListReducer,
  deliverables: deliverablesReducer,
  draftPlantingSiteCreate: draftPlantingSiteCreateReducer,
  draftPlantingSiteEdit: draftPlantingSiteEditReducer,
  draftPlantingSiteGet: draftPlantingSiteGetReducer,
  draftPlantingSiteSearch: draftPlantingSiteSearchReducer,
  message: messageReducer,
  monitoringPlots: monitoringPlotsReducer,
  observations: observationsReducer,
  observationsResults: observationsResultsReducer,
  plantingSiteObservationsResults: plantingSiteObservationsResultsReducer,
  plantingSitesSearchResults: plantingSitesSearchResultsReducer,
  plantings: plantingsReducer,
  projects: projectsReducer,
  projectsRequests: projectsRequestsReducer,
  replaceObservationPlot: replaceObservationPlotReducer,
  reportsSettings: reportsSettingsReducer,
  rescheduleObservation: rescheduleObservationReducer,
  scheduleObservation: scheduleObservationReducer,
  sitePopulation: sitePopulationReducer,
  siteReportedPlantsResults: siteReportedPlantsReducer,
  snackbar: snackbarReducer,
  species: speciesReducer,
  speciesProjects: speciesProjectsReducer,
  subLocations: subLocationsReducer,
  tracking: trackingReducer,
  updatePlantingCompleted: updatePlantingCompletedReducer,
  updatePlantingsCompleted: updatePlantingsCompletedReducer,
  userAnalytics: userAnalyticsReducer,
};
const combinedReducers = combineReducers(reducers);

// used for building the typed root state
type CombinedState = ReturnType<typeof combinedReducers>;

export const rootReducer = (state: CombinedState | undefined, action: Action) => {
  if (action.type === 'RESET_APP') {
    state = undefined;
  }

  return combinedReducers(state as any, action);
};

export type RootState = ReturnType<typeof rootReducer>;
