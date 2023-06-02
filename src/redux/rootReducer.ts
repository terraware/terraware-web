import { Action, combineReducers } from '@reduxjs/toolkit';
import { appVersionReducer } from './features/appVersion/appVersionSlice';
import { observationsResultsReducer } from './features/observations/observationsSlice';

// assembly of app reducers
export const reducers = {
  appVersion: appVersionReducer,
  observationsResults: observationsResultsReducer,
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
