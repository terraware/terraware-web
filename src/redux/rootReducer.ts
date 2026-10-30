import { Action, combineReducers } from '@reduxjs/toolkit';

import { baseApi } from 'src/queries/baseApi';
import { rtkReducers } from 'src/queries/reducers';

import messageReducers from './features/message/messageSlice';
import projectSpeciesReducers from './features/projectSpecies/projectSpeciesSlice';
import snackbarReducers from './features/snackbar/snackbarSlice';
import speciesAsyncThunkReducers from './features/species/speciesSlice';
import userAnalyticsReducers from './features/user/userAnalyticsSlice';

// assembly of app reducers
const reducers = {
  ...messageReducers,
  ...projectSpeciesReducers,
  ...snackbarReducers,
  ...speciesAsyncThunkReducers,
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
