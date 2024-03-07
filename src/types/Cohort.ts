import { components } from 'src/api/types/generated-schema';

export type Cohort = components['schemas']['CohortPayload'];

export type CreateCohortRequestPayload = components['schemas']['CreateCohortRequestPayload'];
export type UpdateCohortRequestPayload = components['schemas']['UpdateCohortRequestPayload'];

export type MockCohortModule = {
  cohortId: number;
  createdAt: string;
  description: string;
  duration: number;
  moduleId: number;
  name: string;
  order: number;
  status: 'draft' | 'published';
  updatedAt: string;
};
