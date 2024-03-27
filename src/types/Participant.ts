import { components } from 'src/api/types/generated-schema';

export type Participant = components['schemas']['ParticipantPayload'];

export type ParticipantProject = components['schemas']['ParticipantProjectPayload'];

export type ParticipantCreateRequest = components['schemas']['CreateParticipantRequestPayload'];

export type ParticipantUpdateRequest = components['schemas']['UpdateParticipantRequestPayload'];

export type ParticipantProjectSearchResult = {
  id: number;
  name: string;
};

export type ParticipantSearchResult = {
  id: number;
  name: string;
  cohort_id: number;
  cohort_name: string;
  projects: ParticipantProjectSearchResult[];
};
