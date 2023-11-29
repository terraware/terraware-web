import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { Project } from 'src/types/Project';
import { OrNodePayload, SearchRequestPayload, SearchResponseElement } from 'src/types/Search';
import SearchService from './SearchService';

/**
 * Projects related services
 */

const PROJECTS_ENDPOINT = '/api/v1/projects';

type ListProjectsResponsePayload =
  paths[typeof PROJECTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

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
const searchProjects = async (organizationId: number, query?: string): Promise<SearchResponseElement[] | null> => {
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

  return await SearchService.search(searchParams);
};

/**
 * Exported functions
 */
const ProjectsService = {
  listProjects,
  searchProjects,
};

export default ProjectsService;
