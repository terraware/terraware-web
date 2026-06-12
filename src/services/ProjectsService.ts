import { components, paths } from 'src/api/types/generated-schema';
import HttpService, { Response2 } from 'src/services/HttpService';
import SearchService from 'src/services/SearchService';
import { CreateProjectRequest, Project } from 'src/types/Project';
import { OrNodePayload, SearchRequestPayload } from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

/**
 * Projects related services
 */

const PROJECTS_ENDPOINT = '/api/v1/projects';
const PROJECT_ENDPOINT = '/api/v1/projects/{id}';
const PROJECT_ASSIGN_ENDPOINT = '/api/v1/projects/{id}/assign';

type CreateProjectResponsePayload =
  paths[typeof PROJECTS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type DeleteProjectResponsePayload =
  paths[typeof PROJECT_ENDPOINT]['delete']['responses'][200]['content']['application/json'];

export type AssignProjectRequestPayload = components['schemas']['AssignProjectRequestPayload'];
export type AssignProjectResponsePayload = components['schemas']['SimpleSuccessResponsePayload'];

const httpProjects = HttpService.root(PROJECTS_ENDPOINT);

/**
 * Search projects
 */
const searchProjects = async (organizationId: number, query?: string): Promise<Project[] | null> => {
  const searchField: OrNodePayload | null = query
    ? (() => {
        const { type, values } = parseSearchTerm(query);
        return {
          operation: 'or',
          children: [
            {
              operation: 'field',
              field: 'name',
              type,
              values,
            },
            {
              operation: 'field',
              field: 'description',
              type,
              values,
            },
          ],
        };
      })()
    : null;

  const searchParams: SearchRequestPayload = {
    prefix: 'projects',
    fields: ['name', 'description', 'id', 'organization_id'],
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'organization_id',
          type: 'Exact',
          values: [organizationId],
        },
      ],
    },
    sortOrder: [
      {
        field: 'name',
      },
    ],
    count: 0,
  };

  if (searchField) {
    searchParams.search.children.push(searchField);
  }

  const response = await SearchService.search(searchParams);
  return response ? (response as Project[]) : null;
};

/**
 * Create a project
 */
const createProject = (project: CreateProjectRequest): Promise<Response2<CreateProjectResponsePayload>> =>
  httpProjects.post2({
    entity: project,
  });

const assignProjectToEntities = (projectId: number, entities: AssignProjectRequestPayload) =>
  httpProjects.post2<AssignProjectResponsePayload>({
    url: PROJECT_ASSIGN_ENDPOINT,
    urlReplacements: { '{id}': `${projectId}` },
    entity: entities,
  });

const deleteProject = (projectId: number) =>
  httpProjects.delete2<DeleteProjectResponsePayload>({
    url: PROJECT_ENDPOINT,
    urlReplacements: { '{id}': `${projectId}` },
  });

/**
 * Exported functions
 */
const ProjectsService = {
  searchProjects,
  createProject,
  assignProjectToEntities,
  deleteProject,
};

export default ProjectsService;
