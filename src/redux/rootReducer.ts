import { Action, combineReducers } from '@reduxjs/toolkit';

import acceleratorReducers from './features/accelerator/acceleratorSlice';
import accessionsReducers from './features/accessions/accessionsSlice';
import appVersionReducers from './features/appVersion/appVersionSlice';
import applicationReducers from './features/application/applicationSlice';
import batchesReducers from './features/batches/batchesSlice';
import cohortModuleReducers from './features/cohortModules/cohortModulesSlice';
import cohortsReducers from './features/cohorts/cohortsSlice';
import deliverablesReducers from './features/deliverables/deliverablesSlice';
import documentProducerReducers from './features/documentProducer';
import draftPlantingSiteReducers from './features/draftPlantingSite/draftPlantingSiteSlice';
import eventReducers from './features/events/eventsSlice';
import fundingEntitiesReducers from './features/funder/entities/fundingEntitiesSlice';
import globalRolesReducers from './features/globalRoles/globalRolesSlice';
import locationReducers from './features/location/locationSlice';
import messageReducers from './features/message/messageSlice';
import moduleReducers from './features/modules/modulesSlice';
import observationsReducers from './features/observations/observationsSlice';
import organizationUsersReducers from './features/organizationUser/organizationUsersSlice';
import organizationsReducers from './features/organizations/organizationsSlice';
import participantProjectSpeciesReducers from './features/participantProjectSpecies/participantProjectSpeciesSlice';
import participantProjectsReducers from './features/participantProjects/participantProjectsSlice';
import participantsReducers from './features/participants/participantsSlice';
import plantingSiteReducers from './features/plantingSite/plantingSiteSlice';
import plantingsReducers from './features/plantings/plantingsSlice';
import projectSpeciesReducers from './features/projectSpecies/projectSpeciesSlice';
import projectToDoReducers from './features/projectToDo/projectToDoSlice';
import projectsReducers from './features/projects/projectsSlice';
import reportsReducers from './features/reports/reportsSlice';
import reportsSettingsReducers from './features/reportsSettings/reportsSettingsSlice';
import scoresReducers from './features/scores/scoresSlice';
import snackbarReducers from './features/snackbar/snackbarSlice';
import speciesReducers from './features/species';
import speciesAsyncThunkReducers from './features/species/speciesSlice';
import subLocationsReducers from './features/subLocations/subLocationsSlice';
import supportReducers from './features/support/supportSlice';
import trackingReducers from './features/tracking/trackingSlice';
import userAnalyticsReducers from './features/user/userAnalyticsSlice';
import usersReducers from './features/user/usersSlice';
import userInternalInterestsReducers from './features/userInternalInterests/userInternalInterestsSlice';
import votesReducers from './features/votes/votesSlice';

// assembly of app reducers
export const reducers = {
  ...acceleratorReducers,
  ...accessionsReducers,
  ...applicationReducers,
  ...appVersionReducers,
  ...batchesReducers,
  ...cohortModuleReducers,
  ...cohortsReducers,
  ...deliverablesReducers,
  ...documentProducerReducers,
  ...draftPlantingSiteReducers,
  ...eventReducers,
  ...fundingEntitiesReducers,
  ...globalRolesReducers,
  ...locationReducers,
  ...messageReducers,
  ...moduleReducers,
  ...observationsReducers,
  ...organizationsReducers,
  ...organizationUsersReducers,
  ...participantsReducers,
  ...participantProjectsReducers,
  ...participantProjectSpeciesReducers,
  ...plantingsReducers,
  ...plantingSiteReducers,
  ...projectsReducers,
  ...projectSpeciesReducers,
  ...projectToDoReducers,
  ...reportsReducers,
  ...reportsSettingsReducers,
  ...scoresReducers,
  ...snackbarReducers,
  ...speciesAsyncThunkReducers,
  ...speciesReducers,
  ...subLocationsReducers,
  ...supportReducers,
  ...trackingReducers,
  ...userAnalyticsReducers,
  ...userInternalInterestsReducers,
  ...usersReducers,
  ...votesReducers,
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
