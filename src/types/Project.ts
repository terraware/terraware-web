import { components } from 'src/api/types/generated-schema';

export type Project = components['schemas']['ProjectPayload'];
export type ProjectMeta = {
  createdByUserName?: string;
  modifiedByUserName?: string;
};

export type CreateProjectRequest = components['schemas']['CreateProjectRequestPayload'];
export type UpdateProjectRequest = components['schemas']['UpdateProjectRequestPayload'];
