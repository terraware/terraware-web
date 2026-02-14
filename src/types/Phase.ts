import strings from 'src/strings';

import { ProjectAcceleratorDetailsPayload } from '../queries/generated/acceleratorProjects';

export type PhaseType = ProjectAcceleratorDetailsPayload['phase'];

export const getPhaseString = (phase: PhaseType): string => {
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
