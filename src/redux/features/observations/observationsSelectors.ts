import { RootState } from 'src/redux/rootReducer';

// scheduling selectors
export const selectScheduleObservation = (state: RootState, requestId: string) => state.scheduleObservation[requestId];

export const selectRescheduleObservation = (state: RootState, requestId: string) =>
  state.rescheduleObservation[requestId];

// replace observation plot selector
export const selectReplaceObservationPlot = (state: RootState, requestId: string) =>
  state.replaceObservationPlot[requestId];

// abandon observation selector
export const selectAbandonObservation = (state: RootState, requestId: string) => state.abandonObservation[requestId];

// Planting site observations selectors
export const selectPlantingSiteObservationSummaries = (requestId: string) => (state: RootState) =>
  state.plantingSiteObservationsSummaries[requestId];

export const selectPlantingSiteObservationsRequest = (requestId: string) => (state: RootState) =>
  state.plantingSiteObservations[requestId];

export const selectPlantingSiteObservationResultsRequest = (requestId: string) => (state: RootState) =>
  state.plantingSiteObservationResults[requestId];

export const selectPlantingSiteAdHocObservationsRequest = (requestId: string) => (state: RootState) =>
  state.plantingSiteAdHocObservations[requestId];

export const selectPlantingSiteAdHocObservationResultsRequest = (requestId: string) => (state: RootState) =>
  state.plantingSiteAdHocObservationResults[requestId];

// Organization observation selectors
export const selectOrganizationObservationsRequest = (requestId: string) => (state: RootState) =>
  state.organizationObservations[requestId];

export const selectOrganizationObservationResultsRequest = (requestId: string) => (state: RootState) =>
  state.organizationObservationResults[requestId];

export const selectOrganizationAdHocObservationsRequest = (requestId: string) => (state: RootState) =>
  state.organizationAdHocObservations[requestId];

export const selectOrganizationAdHocObservationResultsRequest = (requestId: string) => (state: RootState) =>
  state.organizationAdHocObservationResults[requestId];
