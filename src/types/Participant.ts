export type ParticipantProject = {
  id: number;
  name: string;
  organization_id: number;
  organization_name: string;
};

export type Participant = {
  id: number;
  cohort_id: number;
  cohort_name: string;
  name: string;
  projects: ParticipantProject[];
};

export type ParticipantCreateRequest = {
  cohort_id: number;
  name: string;
  project_ids: number[];
};
