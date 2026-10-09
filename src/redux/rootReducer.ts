import { Action, combineReducers } from '@reduxjs/toolkit';

import { baseApi } from 'src/queries/baseApi';
import { rtkReducers } from 'src/queries/reducers';

import acceleratorReducers from './features/accelerator/acceleratorSlice';
import documentProducerReducers from './features/documentProducer';
import fundingEntitiesReducers from './features/funder/entities/fundingEntitiesSlice';
import funderProjectsReducers from './features/funder/projects/funderProjectsSlice';
import gisReducers from './features/gis/gisSlice';
import matrixViewReducers from './features/matrixView/matrixViewSlice';
import messageReducers from './features/message/messageSlice';
import projectSpeciesReducers from './features/projectSpecies/projectSpeciesSlice';
import snackbarReducers from './features/snackbar/snackbarSlice';
import speciesAsyncThunkReducers from './features/species/speciesSlice';
import subLocationsReducers from './features/subLocations/subLocationsSlice';
import trackingReducers from './features/tracking/trackingSlice';
import userAnalyticsReducers from './features/user/userAnalyticsSlice';

// assembly of app reducers
const reducers = {
  ...acceleratorReducers,
  ...documentProducerReducers,
  ...funderProjectsReducers,
  ...fundingEntitiesReducers,
  ...gisReducers,
  ...messageReducers,
  ...matrixViewReducers,
  ...projectSpeciesReducers,
  ...snackbarReducers,
  ...speciesAsyncThunkReducers,
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
