import { DateTime } from 'luxon';

import { Application, ApplicationModuleWithDeliverables } from 'src/types/Application';

import HttpService, { Response2, ServerData } from './HttpService';

/**
 * Service for application related functionality
 */
const APPLICATIONS_ENDPOINT = '/api/v1/accelerator/applications';

const useMockData = true;

const httpApplications = HttpService.root(APPLICATIONS_ENDPOINT);

type ListApplicationData = ServerData & {
  applications: Application[];
};

type ListApplicationModulesData = ServerData & {
  modules: ApplicationModuleWithDeliverables[];
};

/**
 * List applications by organizationId
 */
const listApplications = async (organizationId: number): Promise<Response2<ListApplicationData>> => {
  if (useMockData) {
    return {
      requestSucceeded: true,
      statusCode: 200,
      data: {
        applications: [
          {
            id: 1,
            organizationId: organizationId,
            projectId: 1,
            status: 'Not Submitted',
            createdTime: DateTime.now().toString(),
          },
          {
            id: 2,
            organizationId: organizationId,
            projectId: 2,
            status: 'Submitted',
            createdTime: DateTime.now().toString(),
          },
        ],
      },
    };
  }

  const response = await httpApplications.get2<ListApplicationData>({
    urlReplacements: { '{id}': `${organizationId}` },
  });

  return response;
};

/**
 * List application modules
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const listApplicationModules = async (applicationId: number): Promise<Response2<ListApplicationModulesData>> => {
  // TODO use module endpoints or something like that once available.
  return Promise.resolve({
    requestSucceeded: true,
    statusCode: 200,
    data: {
      modules: [
        {
          id: 1,
          name: 'General',
          overview: 'General questions about your project',
          deliverables: [],
          status: 'Incomplete',
        },
        {
          id: 2,
          name: 'Forest Reforestation',
          overview: "More detailed questions about your project's forest reforstation.",
          deliverables: [],
          status: 'Incomplete',
        },
        {
          id: 3,
          name: 'Community Impact',
          overview: "More detailed questions about your project's impact on community.",
          deliverables: [],
          status: 'Incomplete',
        },
        {
          id: 4,
          name: 'Financial',
          overview: "More detailed questions about your project's financial details.",
          deliverables: [],
          status: 'Incomplete',
        },
        {
          id: 5,
          name: 'Legal',
          overview: "More detailed questions about your project's legal details.",
          deliverables: [],
          status: 'Incomplete',
        },
      ],
    },
  });
};

/**
 * Exported functions
 */
const ApplicationService = {
  listApplications,
  listApplicationModules,
};

export default ApplicationService;
