import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { Project } from 'src/types/Project';

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
 * Exported functions
 */
const ProjectsService = {
  listProjects,
};

export default ProjectsService;
