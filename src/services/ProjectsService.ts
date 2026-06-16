import { components } from 'src/api/types/generated-schema';
import HttpService from 'src/services/HttpService';

/**
 * Projects related services
 */

const PROJECTS_ENDPOINT = '/api/v1/projects';
const PROJECT_ASSIGN_ENDPOINT = '/api/v1/projects/{id}/assign';

export type AssignProjectRequestPayload = components['schemas']['AssignProjectRequestPayload'];
export type AssignProjectResponsePayload = components['schemas']['SimpleSuccessResponsePayload'];

const httpProjects = HttpService.root(PROJECTS_ENDPOINT);

const assignProjectToEntities = (projectId: number, entities: AssignProjectRequestPayload) =>
  httpProjects.post2<AssignProjectResponsePayload>({
    url: PROJECT_ASSIGN_ENDPOINT,
    urlReplacements: { '{id}': `${projectId}` },
    entity: entities,
  });

/**
 * Exported functions
 */
const ProjectsService = {
  assignProjectToEntities,
};

export default ProjectsService;
