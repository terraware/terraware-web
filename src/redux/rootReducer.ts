import { Action, combineReducers } from '@reduxjs/toolkit';

import { rtkReducers } from 'src/queries/reducers';

import acceleratorReducers from './features/accelerator/acceleratorSlice';
import acceleratorProjectSpeciesReducers from './features/acceleratorProjectSpecies/acceleratorProjectSpeciesSlice';
import appVersionReducers from './features/appVersion/appVersionSlice';
import applicationReducers from './features/application/applicationSlice';
import batchesReducers from './features/batches/batchesSlice';
import deliverablesReducers from './features/deliverables/deliverablesSlice';
import documentProducerReducers from './features/documentProducer';
import draftPlantingSiteReducers from './features/draftPlantingSite/draftPlantingSiteSlice';
import eventReducers from './features/events/eventsSlice';
import fundingEntitiesReducers from './features/funder/entities/fundingEntitiesSlice';
import funderProjectsReducers from './features/funder/projects/funderProjectsSlice';
import gisReducers from './features/gis/gisSlice';
import locationReducers from './features/location/locationSlice';
import matrixViewReducers from './features/matrixView/matrixViewSlice';
import messageReducers from './features/message/messageSlice';
import moduleReducers from './features/modules/modulesSlice';
import organizationUsersReducers from './features/organizationUser/organizationUsersSlice';
import plantingSiteReducers from './features/plantingSite/plantingSiteSlice';
import projectSpeciesReducers from './features/projectSpecies/projectSpeciesSlice';
import projectToDoReducers from './features/projectToDo/projectToDoSlice';
import reportsSettingsReducers from './features/reportsSettings/reportsSettingsSlice';
import snackbarReducers from './features/snackbar/snackbarSlice';
import speciesReducers from './features/species';
import speciesAsyncThunkReducers from './features/species/speciesSlice';
import subLocationsReducers from './features/subLocations/subLocationsSlice';
import trackingReducers from './features/tracking/trackingSlice';
import userAnalyticsReducers from './features/user/userAnalyticsSlice';
import votesReducers from './features/votes/votesSlice';

// assembly of app reducers
export const reducers = {
  ...acceleratorReducers,
  ...applicationReducers,
  ...appVersionReducers,
  ...batchesReducers,
  ...deliverablesReducers,
  ...documentProducerReducers,
  ...draftPlantingSiteReducers,
  ...eventReducers,
  ...funderProjectsReducers,
  ...fundingEntitiesReducers,
  ...gisReducers,
  ...locationReducers,
  ...messageReducers,
  ...matrixViewReducers,
  ...moduleReducers,
  ...organizationUsersReducers,
  ...acceleratorProjectSpeciesReducers,
  ...plantingSiteReducers,
  ...projectSpeciesReducers,
  ...projectToDoReducers,
  ...reportsSettingsReducers,
  ...snackbarReducers,
  ...speciesAsyncThunkReducers,
  ...speciesReducers,
  ...subLocationsReducers,
  ...trackingReducers,
  ...userAnalyticsReducers,
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
