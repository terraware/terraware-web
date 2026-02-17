import { components } from 'src/api/types/generated-schema';

export type Cohort = components['schemas']['CohortPayload'];
export type CohortWithParticipantNum = Cohort & { numOfParticipants: number };

export type CreateCohortRequestPayload = components['schemas']['CreateCohortRequestPayload'];
export type UpdateCohortRequestPayload = components['schemas']['UpdateCohortRequestPayload'];
