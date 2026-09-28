import { paths } from 'src/api/types/generated-schema';
import { Organization } from 'src/types/Organization';

import HttpService, { Response } from './HttpService';

/**
 * Service for organization related functionality
 */

/**
 * Types exported from service
 */
type OrganizationsData = {
  organizations: Organization[];
};

type OrganizationsResponse = Response & OrganizationsData;

// endpoint
const ORGANIZATIONS_ENDPOINT = '/api/v1/organizations';

type OrganizationsServerResponse =
  paths[typeof ORGANIZATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpOrganizations = HttpService.root(ORGANIZATIONS_ENDPOINT);

/**
 * get organizations
 */
const getOrganizations = async (): Promise<OrganizationsResponse> => {
  const response: OrganizationsResponse = await httpOrganizations.get<OrganizationsServerResponse, OrganizationsData>(
    {
      params: {
        depth: 'Facility',
      },
    },
    (data) => ({ organizations: data?.organizations ?? [] })
  );

  if (!response.requestSucceeded) {
    if (response.statusCode === 401) {
      response.error = 'NotAuthenticated';
    } else {
      response.error = 'GenericError';
    }
  }

  return response;
};

/**
 * Exported functions
 */
const OrganizationService = {
  getOrganizations,
};

export default OrganizationService;
