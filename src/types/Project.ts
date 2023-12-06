import { components } from 'src/api/types/generated-schema';

export type Project = components['schemas']['ProjectPayload'];

export type CreateProjectRequest = components['schemas']['CreateProjectRequestPayload'];
export type UpdateProjectRequest = components['schemas']['UpdateProjectRequestPayload'];
