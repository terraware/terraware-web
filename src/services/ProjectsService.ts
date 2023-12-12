import { components, paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2 } from 'src/services/HttpService';
import { CreateProjectRequest, Project, UpdateProjectRequest } from 'src/types/Project';
import { OrNodePayload, SearchRequestPayload } from 'src/types/Search';
import SearchService from 'src/services/SearchService';

/**
 * Projects related services
 */

const PROJECTS_ENDPOINT = '/api/v1/projects';
const PROJECT_ENDPOINT = '/api/v1/projects/{id}';
const PROJECT_ASSIGN_ENDPOINT = '/api/v1/projects/{id}/assign';

type ListProjectsResponsePayload =
  paths[typeof PROJECTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetProjectResponsePayload = paths[typeof PROJECT_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type UpdateProjectResponsePayload =
  paths[typeof PROJECT_ENDPOINT]['put']['responses'][200]['content']['application/json'];
export type DeleteProjectResponsePayload =
  paths[typeof PROJECT_ENDPOINT]['delete']['responses'][200]['content']['application/json'];

/**
 * exported type
 */
export type ProjectsData = {
  projects?: Project[];
};

const httpProjects = HttpService.root(PROJECTS_ENDPOINT);

/**
 * List all projects
 */
const listProjects = async (organizationId: number, locale?: string | null): Promise<ProjectsData & Response> => {
  const response: ProjectsData & Response = await httpProjects.get<ListProjectsResponsePayload, ProjectsData>(
    {
      params: {
        organizationId: organizationId.toString(),
      },
    },
    (data) => ({
      projects: data?.projects.sort((a, b) => a.name.localeCompare(b.name, locale || undefined)),
    })
  );

  return response;
};

/**
 * Search projects
 */
const searchProjects = async (organizationId: number, query?: string): Promise<Project[] | null> => {
  const searchField: OrNodePayload | null = query
    ? {
        operation: 'or',
        children: [
          { operation: 'field', field: 'name', type: 'Fuzzy', values: [query] },
          { operation: 'field', field: 'description', type: 'Fuzzy', values: [query] },
        ],
      }
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
const createProject = (project: CreateProjectRequest): Promise<Response> =>
  httpProjects.post({
    entity: project,
  });

const getProject = (projectId: number): Promise<Response2<Project>> =>
  httpProjects.get<GetProjectResponsePayload, { data: Project | undefined }>(
    {
      url: PROJECT_ENDPOINT,
      urlReplacements: { '{id}': `${projectId}` },
    },
    (response) => ({ data: response?.project })
  );

type AssignProjectRequestPayload = components['schemas']['AssignProjectRequestPayload'];

const assignProjectToEntities = (projectId: number, entities: AssignProjectRequestPayload) =>
  httpProjects.post({
    url: PROJECT_ASSIGN_ENDPOINT,
    urlReplacements: { '{id}': `${projectId}` },
    entity: entities,
  });

const updateProject = (projectId: number, payload: UpdateProjectRequest) =>
  httpProjects.put2<UpdateProjectResponsePayload>({
    url: PROJECT_ENDPOINT,
    urlReplacements: { '{id}': `${projectId}` },
    entity: payload,
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
  listProjects,
  searchProjects,
  createProject,
  assignProjectToEntities,
  getProject,
  updateProject,
  deleteProject,
};

export default ProjectsService;
