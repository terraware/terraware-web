import { components, paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2 } from 'src/services/HttpService';
import SearchService from 'src/services/SearchService';
import { CreateProjectRequest, Project, UpdateProjectRequest } from 'src/types/Project';
import { OrNodePayload, SearchRequestPayload } from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

/**
 * Projects related services
 */

const PROJECTS_ENDPOINT = '/api/v1/projects';
const PROJECT_ENDPOINT = '/api/v1/projects/{id}';
const PROJECT_ASSIGN_ENDPOINT = '/api/v1/projects/{id}/assign';
const PROJECT_INTERNAL_USERS_ENDPOINT = '/api/v1/projects/{id}/internalUsers';

type ListProjectsResponsePayload =
  paths[typeof PROJECTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type CreateProjectResponsePayload =
  paths[typeof PROJECTS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type GetProjectResponsePayload = paths[typeof PROJECT_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type UpdateProjectResponsePayload =
  paths[typeof PROJECT_ENDPOINT]['put']['responses'][200]['content']['application/json'];
export type DeleteProjectResponsePayload =
  paths[typeof PROJECT_ENDPOINT]['delete']['responses'][200]['content']['application/json'];

export type AssignProjectRequestPayload = components['schemas']['AssignProjectRequestPayload'];
export type AssignProjectResponsePayload = components['schemas']['SimpleSuccessResponsePayload'];

export type ListProjectInternalUsersResponsePayload =
  paths[typeof PROJECT_INTERNAL_USERS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type UpdateProjectInternalUsersResponsePayload =
  paths[typeof PROJECT_INTERNAL_USERS_ENDPOINT]['put']['responses'][200]['content']['application/json'];
export type UpdateProjectInternalUsersRequestPayload = components['schemas']['UpdateProjectInternalUserRequestPayload'];

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
const listProjects = async (organizationId?: number, locale?: string | null): Promise<ProjectsData & Response> => {
  const params: { organizationId?: string } = {};
  if (typeof organizationId === 'number') {
    params.organizationId = organizationId.toString();
  }

  const response: ProjectsData & Response = await httpProjects.get<ListProjectsResponsePayload, ProjectsData>(
    {
      params,
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

const getProject = (projectId: number): Promise<Response2<Project>> =>
  httpProjects.get<GetProjectResponsePayload, { data: Project | undefined }>(
    {
      url: PROJECT_ENDPOINT,
      urlReplacements: { '{id}': `${projectId}` },
    },
    (response) => ({ data: response?.project })
  );

const assignProjectToEntities = (projectId: number, entities: AssignProjectRequestPayload) =>
  httpProjects.post2<AssignProjectResponsePayload>({
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

const updateProjectInternalUsers = (projectId: number, payload: UpdateProjectInternalUsersRequestPayload) =>
  httpProjects.put2<UpdateProjectInternalUsersResponsePayload>({
    url: PROJECT_INTERNAL_USERS_ENDPOINT,
    urlReplacements: { '{id}': `${projectId}` },
    entity: payload,
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
  updateProjectInternalUsers,
};

export default ProjectsService;
