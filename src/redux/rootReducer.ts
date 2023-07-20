import { Action, combineReducers } from '@reduxjs/toolkit';
import { appVersionReducer } from './features/appVersion/appVersionSlice';
import {
  observationsReducer,
  observationsResultsReducer,
  plantingSiteObservationsResultsReducer,
} from './features/observations/observationsSlice';
import {
  plantingsReducer,
  updatePlantingCompletedReducer,
  updatePlantingsCompletedReducer,
} from './features/plantings/plantingsSlice';
import { speciesReducer } from './features/species/speciesSlice';
import {
  trackingReducer,
  sitePopulationReducer,
  plantingSitesSearchResultsReducer,
} from './features/tracking/trackingSlice';

// assembly of app reducers
export const reducers = {
  appVersion: appVersionReducer,
  observationsResults: observationsResultsReducer,
  observations: observationsReducer,
  plantings: plantingsReducer,
  species: speciesReducer,
  tracking: trackingReducer,
  sitePopulation: sitePopulationReducer,
  plantingSiteObservationsResults: plantingSiteObservationsResultsReducer,
  updatePlantingCompleted: updatePlantingCompletedReducer,
  updatePlantingsCompleted: updatePlantingsCompletedReducer,
  plantingSitesSearchResults: plantingSitesSearchResultsReducer,
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
