import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

export type Cohort = components['schemas']['CohortPayload'];
export type CohortWithParticipantNum = Cohort & { numOfParticipants: number };

export type CreateCohortRequestPayload = components['schemas']['CreateCohortRequestPayload'];
export type UpdateCohortRequestPayload = components['schemas']['UpdateCohortRequestPayload'];

export type CohortPhaseType = components['schemas']['CohortPayload']['phase'];
export const CohortPhases: CohortPhaseType[] = [
  'Phase 0 - Due Diligence',
  'Phase 1 - Feasibility Study',
  'Phase 2 - Plan and Scale',
  'Phase 3 - Implement and Monitor',
];

export const getPhaseString = (phase: CohortPhaseType): string => {
  switch (phase) {
    case 'Phase 0 - Due Diligence':
      return strings.COHORT_PHASE_DUE_DILIGENCE;
    case 'Phase 1 - Feasibility Study':
      return strings.COHORT_PHASE_FEASIBILITY_STUDY;
    case 'Phase 2 - Plan and Scale':
      return strings.COHORT_PHASE_PLAN_AND_SCALE;
    case 'Phase 3 - Implement and Monitor':
      return strings.COHORT_PHASE_IMPLEMENT_AND_MONITOR;
    default:
      return '';
  }
};
