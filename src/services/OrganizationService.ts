import { paths } from 'src/api/types/generated-schema';
import {
  ManagedLocationType,
  Organization,
  OrganizationFeature,
  OrganizationRoleInfo,
  OrganizationWithInternalTags,
  UpdateOrganizationInternalTagsRequestPayload,
} from 'src/types/Organization';
import { InitializedTimeZone } from 'src/types/TimeZones';
import { isAdmin } from 'src/utils/organization';

import CachedUserService from './CachedUserService';
import HttpService, { Response } from './HttpService';
import PreferencesService from './PreferencesService';

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

export type OrganizationFeaturesData = {
  applications: OrganizationFeature;
  deliverables: OrganizationFeature;
  modules: OrganizationFeature;
  reports: OrganizationFeature;
  seedFundReports: OrganizationFeature;
};

export type OrganizationFeaturesResponse = Response & OrganizationFeaturesData;

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

export type OrganizationInternalTags = {
  internalTags: number[];
};

export type OrganizationInternalTagsResponse = Response & OrganizationInternalTags;

export type OrganizationsInternalTags = {
  organizations: OrganizationWithInternalTags[];
};

export type OrganizationsInternalTagsResponse = Response & OrganizationsInternalTags;

// endpoint
const ORGANIZATIONS_ENDPOINT = '/api/v1/organizations';
const ORGANIZATION_ENDPOINT = '/api/v1/organizations/{organizationId}';
const ORGANIZATION_FEATURES_ENDPOINT = '/api/v1/organizations/{organizationId}/features';
const ORGANIZATION_ROLES_ENDPOINT = '/api/v1/organizations/{organizationId}/roles';
const ORGANIZATION_INTERNAL_TAGS_ENDPOINT = '/api/v1/internalTags/organizations/{organizationId}';
const ORGANIZATIONS_INTERNAL_TAGS_ENDPOINT = '/api/v1/internalTags/organizations';

type OrganizationsServerResponse =
  paths[typeof ORGANIZATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type CreateOrganizationResponsePayload =
  paths[typeof ORGANIZATIONS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type CreateOrganizationRequestPayload =
  paths[typeof ORGANIZATIONS_ENDPOINT]['post']['requestBody']['content']['application/json'];

type UpdateOrganizationRequestPayload =
  paths[typeof ORGANIZATION_ENDPOINT]['put']['requestBody']['content']['application/json'];

type OrganizationFeaturesResponsePayload =
  paths[typeof ORGANIZATION_FEATURES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type OrganizationRolesServerResponse =
  paths[typeof ORGANIZATION_ROLES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type OrganizationInternalTagsServerResponse =
  paths[typeof ORGANIZATION_INTERNAL_TAGS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type OrganizationsInternalTagsServerResponse =
  paths[typeof ORGANIZATIONS_INTERNAL_TAGS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type UpdateResponse =
  paths[typeof ORGANIZATION_INTERNAL_TAGS_ENDPOINT]['put']['responses'][200]['content']['application/json'];

const httpOrganizations = HttpService.root(ORGANIZATIONS_ENDPOINT);
const httpOrganization = HttpService.root(ORGANIZATION_ENDPOINT);
const httpOrganizationFeatures = HttpService.root(ORGANIZATION_FEATURES_ENDPOINT);
const httpOrganizationRoles = HttpService.root(ORGANIZATION_ROLES_ENDPOINT);
const httpOrganizationInternalTags = HttpService.root(ORGANIZATION_INTERNAL_TAGS_ENDPOINT);
const httpOrganizationsInternalTags = HttpService.root(ORGANIZATIONS_INTERNAL_TAGS_ENDPOINT);

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

const DEFAULT_ORGANIZATION_FEATURE_PAYLOAD: OrganizationFeature = {
  enabled: false,
  projectIds: [],
};

/**
 * get organization features
 */
const getOrganizationFeatures = async (organizationId: number): Promise<OrganizationFeaturesResponse> => {
  const response: OrganizationFeaturesResponse = await httpOrganizationFeatures.get<
    OrganizationFeaturesResponsePayload,
    OrganizationFeaturesData
  >(
    {
      urlReplacements: {
        '{organizationId}': organizationId.toString(),
      },
    },
    (data) => ({
      applications: data?.applications || DEFAULT_ORGANIZATION_FEATURE_PAYLOAD,
      deliverables: data?.deliverables || DEFAULT_ORGANIZATION_FEATURE_PAYLOAD,
      modules: data?.modules || DEFAULT_ORGANIZATION_FEATURE_PAYLOAD,
      reports: data?.reports || DEFAULT_ORGANIZATION_FEATURE_PAYLOAD,
      seedFundReports: data?.seedFundReports || DEFAULT_ORGANIZATION_FEATURE_PAYLOAD,
    })
  );

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
const createOrganization = async (
  organization: Omit<Organization, 'id'>,
  managedLocationTypes?: ManagedLocationType[]
): Promise<OrganizationResponse> => {
  const {
    name,
    description,
    countryCode,
    countrySubdivisionCode,
    organizationType,
    organizationTypeDetails,
    timeZone,
    website,
  } = organization;

  const request: CreateOrganizationRequestPayload = {
    name,
    description,
    countryCode,
    countrySubdivisionCode,
    managedLocationTypes,
    organizationType,
    organizationTypeDetails,
    timeZone,
    website,
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
  const {
    name,
    description,
    countryCode,
    countrySubdivisionCode,
    organizationType,
    organizationTypeDetails,
    timeZone,
    website,
  } = organization;

  const request: UpdateOrganizationRequestPayload = {
    name,
    description,
    countryCode,
    countrySubdivisionCode,
    organizationType,
    organizationTypeDetails,
    timeZone,
    website,
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
 * get organization internal tags
 */
const getOrganizationInternalTags = async (organizationId: number): Promise<OrganizationInternalTagsResponse> => {
  const response: OrganizationInternalTagsResponse = await httpOrganizationInternalTags.get<
    OrganizationInternalTagsServerResponse,
    OrganizationInternalTags
  >(
    {
      urlReplacements: {
        '{organizationId}': organizationId.toString(),
      },
    },
    (data) => ({ internalTags: data?.tagIds ?? [] })
  );

  return response;
};

/**
 * update organization internal tags
 */
const updateOrganizationInternalTags = async (
  organizationId: number,
  payload: UpdateOrganizationInternalTagsRequestPayload
): Promise<Response> => {
  return HttpService.root(ORGANIZATION_INTERNAL_TAGS_ENDPOINT).put2<UpdateResponse>({
    urlReplacements: {
      '{organizationId}': `${organizationId}`,
    },
    entity: payload,
  });
};

const getAllOrganizationsInternalTags = async (): Promise<OrganizationsInternalTagsResponse> => {
  const response: OrganizationsInternalTagsResponse = await httpOrganizationsInternalTags.get<
    OrganizationsInternalTagsServerResponse,
    OrganizationsInternalTags
  >({}, (data) => ({ organizations: data?.organizations ?? [] }));

  return response;
};

/**
 * Exported functions
 */
const OrganizationService = {
  createOrganization,
  deleteOrganization,
  getAllOrganizationsInternalTags,
  getOrganizationFeatures,
  getOrganizationInternalTags,
  getOrganizationRoles,
  getOrganizations,
  initializeTimeZone,
  updateOrganization,
  updateOrganizationInternalTags,
};

export default OrganizationService;
