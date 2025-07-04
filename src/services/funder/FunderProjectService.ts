import { paths } from 'src/api/types/generated-schema';
import { FunderProjectDetails } from 'src/types/FunderProject';

import HttpService, { Response2, ServerData } from '../HttpService';

/**
 * Service for Funder Project related functionality
 */

// types
export type FunderProjectData = ServerData & {
  projects: FunderProjectDetails[];
  details: FunderProjectDetails | undefined;
};

// endpoints
const FUNDER_PROJECTS_SINGLE_ENDPOINT = '/api/v1/funder/projects/{projectId}';
const FUNDER_PROJECTS_MULTIPLE_ENDPOINT = '/api/v1/funder/projects/{projectIds}';

// responses
type PublishFunderProjectResponse =
  paths[typeof FUNDER_PROJECTS_SINGLE_ENDPOINT]['post']['responses'][200]['content']['application/json'];

const httpFunderProject = HttpService.root(FUNDER_PROJECTS_SINGLE_ENDPOINT);
const httpFunderProjects = HttpService.root(FUNDER_PROJECTS_MULTIPLE_ENDPOINT);

const get = async (projectIds: number[]): Promise<Response2<FunderProjectData>> => {
  return await httpFunderProjects.get2<FunderProjectData>({
    urlReplacements: {
      '{projectIds}': projectIds.join(','),
    },
  });
};

const publish = async (
  funderProjectDetails: FunderProjectDetails
): Promise<Response2<PublishFunderProjectResponse>> => {
  return await httpFunderProject.post2<PublishFunderProjectResponse>({
    urlReplacements: {
      '{projectId}': funderProjectDetails.projectId.toString(),
    },
    entity: { details: funderProjectDetails },
  });
};

const FunderProjectService = {
  get,
  publish,
};

export default FunderProjectService;
