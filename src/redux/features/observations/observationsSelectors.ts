import { RootState } from 'src/redux/rootReducer';
import { createSelector } from '@reduxjs/toolkit';

export const selectObservationsResults = (state: RootState) => state.observationsResults?.observations;
export const selectObservationsResultsError = (state: RootState) => state.observationsResults?.error;

export const selectCompletedObservationsResults = createSelector(selectObservationsResults, (observationsResults) =>
  observationsResults?.filter((observationResults) => !!observationResults.completedTime)
);

export const selectPlantingSiteObservationsResults = createSelector(
  [selectObservationsResults, (state, plantingSiteId) => plantingSiteId],
  (observationsResults, plantingSiteId) =>
    observationsResults?.filter((observationResults) => observationResults.plantingSiteId === plantingSiteId)
);

// add more selectors for drill down views, as needed
