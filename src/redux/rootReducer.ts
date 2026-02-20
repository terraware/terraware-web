import { Action, combineReducers } from '@reduxjs/toolkit';

import { rtkReducers } from 'src/queries/reducers';

import acceleratorReducers from './features/accelerator/acceleratorSlice';
import acceleratorProjectSpeciesReducers from './features/acceleratorProjectSpecies/acceleratorProjectSpeciesSlice';
import accessionsReducers from './features/accessions/accessionsSlice';
import activityReducers from './features/activities/activitiesSlice';
import appVersionReducers from './features/appVersion/appVersionSlice';
import applicationReducers from './features/application/applicationSlice';
import batchesReducers from './features/batches/batchesSlice';
import deliverablesReducers from './features/deliverables/deliverablesSlice';
import disclaimersReducers from './features/disclaimer/disclaimerSlice';
import documentProducerReducers from './features/documentProducer';
import draftPlantingSiteReducers from './features/draftPlantingSite/draftPlantingSiteSlice';
import eventReducers from './features/events/eventsSlice';
import funderActivitiesReducers from './features/funder/activities/funderActivitiesSlice';
import fundingEntitiesReducers from './features/funder/entities/fundingEntitiesSlice';
import funderProjectsReducers from './features/funder/projects/funderProjectsSlice';
import gisReducers from './features/gis/gisSlice';
import globalRolesReducers from './features/globalRoles/globalRolesSlice';
import locationReducers from './features/location/locationSlice';
import matrixViewReducers from './features/matrixView/matrixViewSlice';
import messageReducers from './features/message/messageSlice';
import moduleReducers from './features/modules/modulesSlice';
import nurseryWithdrawalsReducers from './features/nurseryWithdrawals/nurseryWithdrawalsSlice';
import observationsReducers from './features/observations/observationsSlice';
import organizationUsersReducers from './features/organizationUser/organizationUsersSlice';
import organizationsReducers from './features/organizations/organizationsSlice';
import plantingSiteReducers from './features/plantingSite/plantingSiteSlice';
import plantingsReducers from './features/plantings/plantingsSlice';
import projectSpeciesReducers from './features/projectSpecies/projectSpeciesSlice';
import projectToDoReducers from './features/projectToDo/projectToDoSlice';
import projectsReducers from './features/projects/projectsSlice';
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
  ...activityReducers,
  ...applicationReducers,
  ...appVersionReducers,
  ...batchesReducers,
  ...deliverablesReducers,
  ...disclaimersReducers,
  ...documentProducerReducers,
  ...draftPlantingSiteReducers,
  ...eventReducers,
  ...funderActivitiesReducers,
  ...funderProjectsReducers,
  ...fundingEntitiesReducers,
  ...gisReducers,
  ...globalRolesReducers,
  ...locationReducers,
  ...messageReducers,
  ...matrixViewReducers,
  ...moduleReducers,
  ...nurseryWithdrawalsReducers,
  ...observationsReducers,
  ...organizationsReducers,
  ...organizationUsersReducers,
  ...acceleratorProjectSpeciesReducers,
  ...plantingsReducers,
  ...plantingSiteReducers,
  ...projectsReducers,
  ...projectSpeciesReducers,
  ...projectToDoReducers,
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
  ...rtkReducers,
};
const combinedReducers = combineReducers(reducers);

// used for building the typed root state
type CombinedState = ReturnType<typeof combinedReducers>;

export const rootReducer = (state: CombinedState | undefined, action: Action) => {
  if (action.type === 'RESET_APP') {
    state = undefined;
  }

  return combinedReducers(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;
