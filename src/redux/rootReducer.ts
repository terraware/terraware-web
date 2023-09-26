import { Action, combineReducers } from '@reduxjs/toolkit';
import { appVersionReducer } from './features/appVersion/appVersionSlice';
import {
  observationsReducer,
  observationsResultsReducer,
  plantingSiteObservationsResultsReducer,
  scheduleObservationReducer,
  rescheduleObservationReducer,
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
  siteReportedPlantsReducer,
} from './features/tracking/trackingSlice';
import { snackbarReducer } from './features/snackbar/snackbarSlice';
import { messageReducer } from './features/message/messageSlice';
import { userAnalyticsReducer } from './features/user/userAnalyticsSlice';

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
  siteReportedPlantsResults: siteReportedPlantsReducer,
  snackbar: snackbarReducer,
  message: messageReducer,
  userAnalytics: userAnalyticsReducer,
  scheduleObservation: scheduleObservationReducer,
  rescheduleObservation: rescheduleObservationReducer,
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
