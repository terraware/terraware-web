import { Action, combineReducers } from '@reduxjs/toolkit';

import { baseApi } from 'src/queries/baseApi';
import { rtkReducers } from 'src/queries/reducers';

import acceleratorReducers from './features/accelerator/acceleratorSlice';
import acceleratorProjectSpeciesReducers from './features/acceleratorProjectSpecies/acceleratorProjectSpeciesSlice';
import applicationReducers from './features/application/applicationSlice';
import batchesReducers from './features/batches/batchesSlice';
import deliverablesReducers from './features/deliverables/deliverablesSlice';
import documentProducerReducers from './features/documentProducer';
import draftPlantingSiteReducers from './features/draftPlantingSite/draftPlantingSiteSlice';
import eventReducers from './features/events/eventsSlice';
import fundingEntitiesReducers from './features/funder/entities/fundingEntitiesSlice';
import funderProjectsReducers from './features/funder/projects/funderProjectsSlice';
import gisReducers from './features/gis/gisSlice';
import matrixViewReducers from './features/matrixView/matrixViewSlice';
import messageReducers from './features/message/messageSlice';
import moduleReducers from './features/modules/modulesSlice';
import organizationUsersReducers from './features/organizationUser/organizationUsersSlice';
import plantingSiteReducers from './features/plantingSite/plantingSiteSlice';
import projectSpeciesReducers from './features/projectSpecies/projectSpeciesSlice';
import projectToDoReducers from './features/projectToDo/projectToDoSlice';
import snackbarReducers from './features/snackbar/snackbarSlice';
import speciesReducers from './features/species';
import speciesAsyncThunkReducers from './features/species/speciesSlice';
import subLocationsReducers from './features/subLocations/subLocationsSlice';
import trackingReducers from './features/tracking/trackingSlice';
import userAnalyticsReducers from './features/user/userAnalyticsSlice';

// assembly of app reducers
export const reducers = {
  ...acceleratorReducers,
  ...applicationReducers,
  ...batchesReducers,
  ...deliverablesReducers,
  ...documentProducerReducers,
  ...draftPlantingSiteReducers,
  ...eventReducers,
  ...funderProjectsReducers,
  ...fundingEntitiesReducers,
  ...gisReducers,
  ...messageReducers,
  ...matrixViewReducers,
  ...moduleReducers,
  ...organizationUsersReducers,
  ...acceleratorProjectSpeciesReducers,
  ...plantingSiteReducers,
  ...projectSpeciesReducers,
  ...projectToDoReducers,
  ...snackbarReducers,
  ...speciesAsyncThunkReducers,
  ...speciesReducers,
  ...subLocationsReducers,
  ...trackingReducers,
  ...userAnalyticsReducers,
  ...rtkReducers,
};
const combinedReducers = combineReducers(reducers);

// used for building the typed root state
type CombinedState = ReturnType<typeof combinedReducers>;

export const rootReducer = (state: CombinedState | undefined, action: Action) => {
  if (action.type === 'RESET_APP' && state) {
    // Reset every feature slice, but leave the RTK Query cache slice alone. That slice is owned by
    // RTK and is reset separately via baseApi.util.resetApiState(), which also re-triggers active
    // subscriptions so always-mounted queries refetch. Nuking it here (state = undefined) would
    // blank the cache behind RTK's back, leaving those queries stale until they remount.
    state = { [baseApi.reducerPath]: state[baseApi.reducerPath] } as CombinedState;
  }

  return combinedReducers(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;
