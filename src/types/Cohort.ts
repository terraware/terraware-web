import { components } from 'src/api/types/generated-schema';

export type Cohort = components['schemas']['CohortPayload'];

export type CreateCohortRequestPayload = components['schemas']['CreateCohortRequestPayload'];
export type UpdateCohortRequestPayload = components['schemas']['UpdateCohortRequestPayload'];

export type CohortPhaseType = components['schemas']['CohortPayload']['phase'];
export const CohortPhases: CohortPhaseType[] = [
  'Phase 0 - Due Diligence',
  'Phase 1 - Feasibility Study',
  'Phase 2 - Plan and Scale',
  'Phase 3 - Implement and Monitor',
];

/**
 * Get string value of phase number.
 */
export const getPhaseNumber = (phase: CohortPhaseType): string => {
  const match = phase.match(/^Phase (\d+) /);
  return match?.[1] ?? '';
};
