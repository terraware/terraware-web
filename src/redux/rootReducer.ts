import { Action, combineReducers } from '@reduxjs/toolkit';

import { cohortsReducer, cohortsRequestsReducer } from 'src/redux/features/cohorts/cohortsSlice';
import {
  deliverablesEditReducer,
  deliverablesReducer,
  deliverablesSearchReducer,
} from 'src/redux/features/deliverables/deliverablesSlice';
import {
  draftPlantingSiteCreateReducer,
  draftPlantingSiteEditReducer,
  draftPlantingSiteGetReducer,
  draftPlantingSiteSearchReducer,
} from 'src/redux/features/draftPlantingSite/draftPlantingSiteSlice';
import {
  globalRolesUserUpdateReducer,
  globalRolesUsersListReducer,
  globalRolesUsersRemoveReducer,
} from 'src/redux/features/globalRoles/globalRolesSlice';
import { projectsReducer, projectsRequestsReducer } from 'src/redux/features/projects/projectsSlice';
import { reportsSettingsReducer } from 'src/redux/features/reportsSettings/reportsSettingsSlice';
import { speciesProjectsReducer } from 'src/redux/features/species/speciesProjectsSlice';

import { acceleratorOrgsReducer } from './features/accelerator/acceleratorSlice';
import { accessionsReducer } from './features/accessions/accessionsSlice';
import { appVersionReducer } from './features/appVersion/appVersionSlice';
import { batchesReducer, batchesRequestsReducer } from './features/batches/batchesSlice';
import { messageReducer } from './features/message/messageSlice';
import {
  observationsReducer,
  observationsResultsReducer,
  plantingSiteObservationsResultsReducer,
  replaceObservationPlotReducer,
  rescheduleObservationReducer,
  scheduleObservationReducer,
} from './features/observations/observationsSlice';
import {
  participantCreateReducer,
  participantDeleteReducer,
  participantListReducer,
  participantReducer,
  participantUpdateReducer,
} from './features/participants/participantsSlice';
import {
  plantingsReducer,
  updatePlantingCompletedReducer,
  updatePlantingsCompletedReducer,
} from './features/plantings/plantingsSlice';
import { scoreListReducer, scoresUpdateReducer } from './features/scores/scoresSlice';
import { snackbarReducer } from './features/snackbar/snackbarSlice';
import { speciesReducer } from './features/species/speciesSlice';
import { subLocationsReducer } from './features/subLocations/subLocationsSlice';
import {
  monitoringPlotsReducer,
  plantingSitesSearchResultsReducer,
  sitePopulationReducer,
  siteReportedPlantsReducer,
  trackingReducer,
} from './features/tracking/trackingSlice';
import { userAnalyticsReducer } from './features/user/userAnalyticsSlice';
import { usersByEmailReducer, usersReducer } from './features/user/usersSlice';
import { votesReducer, votesRequestsReducer } from './features/votes/votesSlice';

// assembly of app reducers
export const reducers = {
  acceleratorOrgs: acceleratorOrgsReducer,
  accessions: accessionsReducer,
  appVersion: appVersionReducer,
  batches: batchesReducer,
  batchesRequests: batchesRequestsReducer,
  cohorts: cohortsReducer,
  cohortsRequests: cohortsRequestsReducer,
  deliverablesEdit: deliverablesEditReducer,
  deliverablesSearch: deliverablesSearchReducer,
  deliverables: deliverablesReducer,
  draftPlantingSiteCreate: draftPlantingSiteCreateReducer,
  draftPlantingSiteEdit: draftPlantingSiteEditReducer,
  draftPlantingSiteGet: draftPlantingSiteGetReducer,
  draftPlantingSiteSearch: draftPlantingSiteSearchReducer,
  globalRolesUsersList: globalRolesUsersListReducer,
  globalRolesUsersRemove: globalRolesUsersRemoveReducer,
  globalRolesUserUpdate: globalRolesUserUpdateReducer,
  message: messageReducer,
  monitoringPlots: monitoringPlotsReducer,
  observations: observationsReducer,
  observationsResults: observationsResultsReducer,
  participantCreate: participantCreateReducer,
  participantDelete: participantDeleteReducer,
  participant: participantReducer,
  participantList: participantListReducer,
  participantUpdate: participantUpdateReducer,
  plantingSiteObservationsResults: plantingSiteObservationsResultsReducer,
  plantingSitesSearchResults: plantingSitesSearchResultsReducer,
  plantings: plantingsReducer,
  projects: projectsReducer,
  projectsRequests: projectsRequestsReducer,
  replaceObservationPlot: replaceObservationPlotReducer,
  reportsSettings: reportsSettingsReducer,
  rescheduleObservation: rescheduleObservationReducer,
  scheduleObservation: scheduleObservationReducer,
  scoreList: scoreListReducer,
  scoresUpdate: scoresUpdateReducer,
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
  users: usersReducer,
  usersByEmail: usersByEmailReducer,
  votes: votesReducer,
  votesRequests: votesRequestsReducer,
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
