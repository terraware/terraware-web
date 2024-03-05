import { RootState } from 'src/redux/rootReducer';
import { Cohort } from 'src/types/Cohort';

export const selectCohorts = (state: RootState) => state.cohorts.cohorts;

export const selectCohort =
  (cohortId: number) =>
  (state: RootState): Cohort | undefined =>
    state.cohorts?.cohorts?.find((cohort) => cohort.id === cohortId);

export const selectCohortRequest = (state: RootState, requestId: string) => state.cohortsRequests[requestId];

export const selectCohortModules = (state: RootState, cohortId: number) => state.cohortModules[cohortId];
