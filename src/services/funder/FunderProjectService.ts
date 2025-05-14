import { FunderProjectDetails } from 'src/types/FunderProject';

import HttpService, { Response2, ServerData } from '../HttpService';

/**
 * Service for Funder Project related functionality
 */

// types
export type FunderProjectData = ServerData & {
  details: FunderProjectDetails | undefined;
};

// endpoints
const FUNDER_PROJECTS_GET_ENDPOINT = '/api/v1/funder/projects/{projectId}';

const httpFunderProjects = HttpService.root(FUNDER_PROJECTS_GET_ENDPOINT);

const get = async (projectId: number): Promise<Response2<FunderProjectData>> => {
  return await httpFunderProjects.get2<FunderProjectData>({
    urlReplacements: {
      '{projectId}': projectId.toString(),
    },
  });
};

const FunderProjectService = {
  get,
};

export default FunderProjectService;
