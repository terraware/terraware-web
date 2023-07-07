import { RootState } from 'src/redux/rootReducer';

/**
 * Observations results selectors below
 */
export const selectPlantingSiteObservationsResults = (state: RootState, plantingSiteId: number) =>
  state.plantingSiteObservationsResults?.[plantingSiteId]?.observations;
export const selectPlantingSiteObservationsResultsError = (state: RootState, plantingSiteId: number) =>
  state.plantingSiteObservationsResults?.[plantingSiteId]?.error;

/**
 * TODO: Add selectors that provide aggregated information across observations results for a planting site
 * Example: total number of monitoring plots (de-duped across results)
 */
