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
            status: 'Passed Pre-screen',
            createdTime: DateTime.now().toString(),
          },
          {
            id: 2,
            organizationId: organizationId,
            projectId: 2,
            status: 'Not Submitted',
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
          id: 0,
          name: 'Pre-screen',
          overview:
            'Draw your proposed project site map and complete the Pre-screen questions to determine if you qualify for our Accelerator Program.',
          category: 'Pre-screen',
          deliverables: [
            {
              id: 0,
              name: 'Pre-screen Questions',
              category: 'Compliance',
              type: 'Questions',
              status: 'Not Submitted',
            },
          ],
          status: 'Incomplete',
        },
        {
          id: 1,
          name: 'General',
          overview: 'General questions about your project',
          category: 'Application',
          deliverables: [
            {
              id: 0,
              name: 'General Not Submitted Deliverable',
              category: 'Compliance',
              type: 'Questions',
              status: 'Not Submitted',
            },
            {
              id: 1,
              name: 'General Approved Deliverable',
              category: 'Compliance',
              type: 'Questions',
              status: 'Approved',
            },
            {
              id: 2,
              name: 'General In-Review Deliverable',
              category: 'Compliance',
              type: 'Questions',
              status: 'In Review',
            },
            {
              id: 3,
              name: 'General Completed Deliverable',
              category: 'Compliance',
              type: 'Questions',
              status: 'Completed',
            },
            {
              id: 4,
              name: 'General Rejected Deliverable',
              category: 'Compliance',
              type: 'Questions',
              status: 'Rejected',
            },
          ],
          status: 'Incomplete',
        },
        {
          id: 2,
          name: 'Forest Reforestation',
          overview: "More detailed questions about your project's forest reforstation.",
          category: 'Application',
          deliverables: [],
          status: 'Incomplete',
        },
        {
          id: 3,
          name: 'Community Impact',
          overview: "More detailed questions about your project's impact on community.",
          category: 'Application',
          deliverables: [],
          status: 'Complete',
        },
        {
          id: 4,
          name: 'Financial',
          overview: "More detailed questions about your project's financial details.",
          category: 'Application',
          deliverables: [],
          status: 'Complete',
        },
        {
          id: 5,
          name: 'Legal',
          overview: "More detailed questions about your project's legal details.",
          category: 'Application',
          deliverables: [],
          status: 'Complete',
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
