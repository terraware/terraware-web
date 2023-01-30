import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import CachedUserService from './CachedUserService';
import PreferencesService from './PreferencesService';
import { OrganizationRoleInfo, Organization } from 'src/types/Organization';
import { InitializedTimeZone } from 'src/types/TimeZones';
import { isAdmin } from 'src/utils/organization';

/**
 * Service for organization related functionality
 */

/**
 * Types exported from service
 */
export type OrganizationsData = {
  organizations: Organization[];
};

export type OrganizationsResponse = Response & OrganizationsData;

export type OrganizationRoles = {
  roles: OrganizationRoleInfo[];
};
export type OrganizationRolesResponse = Response & OrganizationRoles;

export type OrganizationData = {
  organization?: Organization;
};

export type OrganizationResponse = Response & OrganizationData;

export type UpdateOptions = {
  skipAcknowledgeTimeZone?: boolean;
};

// endpoint
const ORGANIZATIONS_ENDPOINT = '/api/v1/organizations';
const ORGANIZATION_ENDPOINT = '/api/v1/organizations/{organizationId}';
const ORGANIZATION_ROLES_ENDPOINT = '/api/v1/organizations/{organizationId}/roles';

type OrganizationsServerResponse =
  paths[typeof ORGANIZATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type CreateOrganizationResponsePayload =
  paths[typeof ORGANIZATIONS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type CreateOrganizationRequestPayload =
  paths[typeof ORGANIZATIONS_ENDPOINT]['post']['requestBody']['content']['application/json'];

type UpdateOrganizationRequestPayload =
  paths[typeof ORGANIZATION_ENDPOINT]['put']['requestBody']['content']['application/json'];

type OrganizationRolesServerResponse =
  paths[typeof ORGANIZATION_ROLES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpOrganizations = HttpService.root(ORGANIZATIONS_ENDPOINT);
const httpOrganization = HttpService.root(ORGANIZATION_ENDPOINT);
const httpOrganizationRoles = HttpService.root(ORGANIZATION_ROLES_ENDPOINT);

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
 * get organization roles
 */
const getOrganizationRoles = async (organizationId: number): Promise<OrganizationRolesResponse> => {
  const response: OrganizationRolesResponse = await httpOrganizationRoles.get<
    OrganizationRolesServerResponse,
    OrganizationRoles
  >(
    {
      urlReplacements: {
        '{organizationId}': organizationId.toString(),
      },
    },
    (data) => ({ roles: data?.roles ?? [] })
  );

  return response;
};

/**
 * create an organization
 */
const createOrganization = async (organization: Omit<Organization, 'id'>): Promise<OrganizationResponse> => {
  const { name, description, countryCode, countrySubdivisionCode, timeZone } = organization;
  const request: CreateOrganizationRequestPayload = {
    name,
    description,
    countryCode,
    countrySubdivisionCode,
    timeZone,
  };

  const response: OrganizationResponse = await httpOrganizations.post({ entity: request });

  if (response.requestSucceeded) {
    const data: CreateOrganizationResponsePayload = response.data;
    response.organization = data?.organization;
  }

  return response;
};

/**
 * update an organization
 */
const updateOrganization = async (organization: Organization, options: UpdateOptions = {}): Promise<Response> => {
  const { name, description, countryCode, countrySubdivisionCode, timeZone } = organization;
  const request: UpdateOrganizationRequestPayload = {
    name,
    description,
    countryCode,
    countrySubdivisionCode,
    timeZone,
  };

  const response: Response = await httpOrganization.put({
    entity: request,
    urlReplacements: {
      '{organizationId}': organization.id.toString(),
    },
  });

  // update preferences to indicate time zone was set by user
  if (response.requestSucceeded && timeZone && !options.skipAcknowledgeTimeZone) {
    await PreferencesService.updateUserOrgPreferences(organization.id, { timeZoneAcknowledgedOnMs: Date.now() });
  }

  return response;
};

/**
 * delete an organization
 */
const deleteOrganization = async (organizationId: number): Promise<Response> => {
  const response: Response = await httpOrganization.delete({
    urlReplacements: {
      '{organizationId}': organizationId.toString(),
    },
  });

  return response;
};

/**
 * initialize organization time zone
 */
const initializeTimeZone = async (organization: Organization, timeZone: string): Promise<InitializedTimeZone> => {
  const { timeZoneAcknowledgedOnMs } = CachedUserService.getUserOrgPreferences(organization.id);

  const initializedTimeZone: InitializedTimeZone = {
    timeZoneAcknowledgedOnMs,
  };

  if (!isAdmin(organization)) {
    return initializedTimeZone;
  }

  if (!organization.timeZone) {
    const response = await updateOrganization({ ...organization, timeZone }, { skipAcknowledgeTimeZone: true });
    if (response.requestSucceeded) {
      initializedTimeZone.updated = true;
      initializedTimeZone.timeZone = timeZone;
    }
  } else {
    initializedTimeZone.timeZone = organization.timeZone;
  }

  return initializedTimeZone;
};

/**
 * Exported functions
 */
const OrganizationService = {
  getOrganizations,
  getOrganizationRoles,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  initializeTimeZone,
};

export default OrganizationService;
