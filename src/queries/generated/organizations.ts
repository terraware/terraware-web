import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listOrganizations: build.query<ListOrganizationsApiResponse, ListOrganizationsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/organizations`,
        params: {
          depth: queryArg,
        },
      }),
    }),
    createOrganization: build.mutation<CreateOrganizationApiResponse, CreateOrganizationApiArg>({
      query: (queryArg) => ({ url: `/api/v1/organizations`, method: 'POST', body: queryArg }),
    }),
    deleteOrganization: build.mutation<DeleteOrganizationApiResponse, DeleteOrganizationApiArg>({
      query: (queryArg) => ({ url: `/api/v1/organizations/${queryArg}`, method: 'DELETE' }),
    }),
    getOrganization: build.query<GetOrganizationApiResponse, GetOrganizationApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}`,
        params: {
          depth: queryArg.depth,
        },
      }),
    }),
    updateOrganization: build.mutation<UpdateOrganizationApiResponse, UpdateOrganizationApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}`,
        method: 'PUT',
        body: queryArg.updateOrganizationRequestPayload,
      }),
    }),
    listOrganizationRoles: build.query<ListOrganizationRolesApiResponse, ListOrganizationRolesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/organizations/${queryArg}/roles` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListOrganizationsApiResponse = /** status 200 OK */ ListOrganizationsResponsePayload;
export type ListOrganizationsApiArg = /** Return this level of information about the organization's contents. */
  | ('Organization' | 'Facility')
  | undefined;
export type CreateOrganizationApiResponse = /** status 200 OK */ GetOrganizationResponsePayload;
export type CreateOrganizationApiArg = CreateOrganizationRequestPayload;
export type DeleteOrganizationApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteOrganizationApiArg = number;
export type GetOrganizationApiResponse = /** status 200 OK */ GetOrganizationResponsePayload;
export type GetOrganizationApiArg = {
  /** ID of organization to get. User must be a member of the organization. */
  organizationId: number;
  /** Return this level of information about the organization's contents. */
  depth?: 'Organization' | 'Facility';
};
export type UpdateOrganizationApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateOrganizationApiArg = {
  organizationId: number;
  updateOrganizationRequestPayload: UpdateOrganizationRequestPayload;
};
export type ListOrganizationRolesApiResponse = /** status 200 OK */ ListOrganizationRolesResponsePayload;
export type ListOrganizationRolesApiArg = number;
export type CrsProperties = {
  /** Name of the coordinate reference system. This must be in the form EPSG:nnnn where nnnn is the numeric identifier of a coordinate system in the EPSG dataset. The default is Longitude/Latitude EPSG:4326, which is the coordinate system for GeoJSON. */
  name: string;
};
export type Crs = {
  properties: CrsProperties;
  type: 'name';
};
export type GeometryBase = {
  crs?: Crs;
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection';
};
export type Point = {
  type: 'Point';
} & GeometryBase & {
    /** A single position consisting of X, Y, and optional Z values in the coordinate system specified by the crs field. */
    coordinates: number[];
    type: 'Point';
  };
export type FacilityPayload = {
  buildCompletedDate?: string;
  buildStartedDate?: string;
  /** For nursery facilities, the number of plants this nursery is capable of holding. */
  capacity?: number;
  connectionState: 'Not Connected' | 'Connected' | 'Configured';
  createdTime: string;
  description?: string;
  /** Short numeric identifier for this facility. Facility numbers start at 1 for each facility type in an organization. */
  facilityNumber: number;
  id: number;
  location?: Point;
  name: string;
  operationStartedDate?: string;
  organizationId: number;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
  type: 'Seed Bank' | 'Desalination' | 'Reverse Osmosis' | 'Nursery';
};
export type TerraformationContactUserPayload = {
  email: string;
  firstName?: string;
  lastName?: string;
  userId: number;
};
export type OrganizationPayload = {
  /** TDWG Level 3 region code of organization's botanical country. */
  botanicalCountryCode?: string;
  /** Whether this organization can submit reports to Terraformation. */
  canSubmitReports: boolean;
  /** ISO 3166 alpha-2 code of organization's country. */
  countryCode?: string;
  /** ISO 3166-2 code of organization's country subdivision (state, province, region, etc.) This is the full ISO 3166-2 code including the country prefix. If this is set, countryCode will also be set. */
  countrySubdivisionCode?: string;
  createdTime: string;
  description?: string;
  /** This organization's facilities. Only included if depth is "Facility". */
  facilities?: FacilityPayload[];
  id: number;
  name: string;
  organizationType?: 'Government' | 'NGO' | 'Arboreta' | 'Academia' | 'ForProfit' | 'Other';
  organizationTypeDetails?: string;
  /** The current user's role in the organization. Absent if the current user is not a member of the organization but is able to read it thanks to a global role. */
  role?: 'Contributor' | 'Manager' | 'Admin' | 'Owner' | 'Terraformation Contact';
  tfContactUser?: TerraformationContactUserPayload;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
  /** The total number of users in the organization, including the current user. */
  totalUsers: number;
  website?: string;
};
export type SuccessOrError = 'ok' | 'error';
export type ListOrganizationsResponsePayload = {
  organizations: OrganizationPayload[];
  status: SuccessOrError;
};
export type GetOrganizationResponsePayload = {
  organization: OrganizationPayload;
  status: SuccessOrError;
};
export type CreateOrganizationRequestPayload = {
  /** TDWG Level 3 region code of organization's botanical country. */
  botanicalCountryCode?: string;
  /** ISO 3166 alpha-2 code of organization's country. */
  countryCode?: string;
  /** ISO 3166-2 code of organization's country subdivision (state, province, region, etc.) This is the full ISO 3166-2 code including the country prefix. If this is set, countryCode must also be set. */
  countrySubdivisionCode?: string;
  description?: string;
  managedLocationTypes?: ('SeedBank' | 'Nursery' | 'PlantingSite')[];
  name: string;
  organizationType?: 'Government' | 'NGO' | 'Arboreta' | 'Academia' | 'ForProfit' | 'Other';
  /** Non-empty additional description of organization when type is Other. */
  organizationTypeDetails?: string;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
  /** Website of organization, no restrictions on format. */
  website?: string;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type UpdateOrganizationRequestPayload = {
  /** TDWG Level 3 region code of organization's botanical country. */
  botanicalCountryCode?: string | null;
  /** ISO 3166 alpha-2 code of organization's country. */
  countryCode?: string;
  /** ISO 3166-2 code of organization's country subdivision (state, province, region, etc.) This is the full ISO 3166-2 code including the country prefix. If this is set, countryCode must also be set. */
  countrySubdivisionCode?: string;
  description?: string;
  name: string;
  organizationType?: 'Government' | 'NGO' | 'Arboreta' | 'Academia' | 'ForProfit' | 'Other';
  /** Non-empty additional description of organization when type is Other. */
  organizationTypeDetails?: string;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
  website?: string;
};
export type OrganizationRolePayload = {
  role: 'Contributor' | 'Manager' | 'Admin' | 'Owner' | 'Terraformation Contact';
  /** Total number of users in the organization with this role. */
  totalUsers: number;
};
export type ListOrganizationRolesResponsePayload = {
  roles: OrganizationRolePayload[];
  status: SuccessOrError;
};
export const {
  useListOrganizationsQuery,
  useLazyListOrganizationsQuery,
  useCreateOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetOrganizationQuery,
  useLazyGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useListOrganizationRolesQuery,
  useLazyListOrganizationRolesQuery,
} = injectedRtkApi;
