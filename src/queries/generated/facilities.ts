import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listAllFacilities: build.query<ListAllFacilitiesApiResponse, ListAllFacilitiesApiArg>({
      query: () => ({ url: `/api/v1/facilities` }),
    }),
    createFacility: build.mutation<CreateFacilityApiResponse, CreateFacilityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/facilities`, method: 'POST', body: queryArg }),
    }),
    getFacility: build.query<GetFacilityApiResponse, GetFacilityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/facilities/${queryArg}` }),
    }),
    updateFacility: build.mutation<UpdateFacilityApiResponse, UpdateFacilityApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/facilities/${queryArg.facilityId}`,
        method: 'PUT',
        body: queryArg.updateFacilityRequestPayload,
      }),
    }),
    sendFacilityAlert: build.mutation<SendFacilityAlertApiResponse, SendFacilityAlertApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/facilities/${queryArg.facilityId}/alert/send`,
        method: 'POST',
        body: queryArg.sendFacilityAlertRequestPayload,
      }),
    }),
    postConfigured: build.mutation<PostConfiguredApiResponse, PostConfiguredApiArg>({
      query: (queryArg) => ({ url: `/api/v1/facilities/${queryArg}/configured`, method: 'POST' }),
    }),
    listFacilityDevices: build.query<ListFacilityDevicesApiResponse, ListFacilityDevicesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/facilities/${queryArg}/devices` }),
    }),
    listSubLocations: build.query<ListSubLocationsApiResponse, ListSubLocationsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/facilities/${queryArg}/subLocations` }),
    }),
    createSubLocation: build.mutation<CreateSubLocationApiResponse, CreateSubLocationApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/facilities/${queryArg.facilityId}/subLocations`,
        method: 'POST',
        body: queryArg.createSubLocationRequestPayload,
      }),
    }),
    deleteSubLocation: build.mutation<DeleteSubLocationApiResponse, DeleteSubLocationApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/facilities/${queryArg.facilityId}/subLocations/${queryArg.subLocationId}`,
        method: 'DELETE',
      }),
    }),
    getSubLocation: build.query<GetSubLocationApiResponse, GetSubLocationApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/facilities/${queryArg.facilityId}/subLocations/${queryArg.subLocationId}`,
      }),
    }),
    updateSubLocation: build.mutation<UpdateSubLocationApiResponse, UpdateSubLocationApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/facilities/${queryArg.facilityId}/subLocations/${queryArg.subLocationId}`,
        method: 'PUT',
        body: queryArg.updateSubLocationRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListAllFacilitiesApiResponse = /** status 200 OK */ ListFacilitiesResponse;
export type ListAllFacilitiesApiArg = void;
export type CreateFacilityApiResponse = /** status 200 OK */ CreateFacilityResponsePayload;
export type CreateFacilityApiArg = CreateFacilityRequestPayload;
export type GetFacilityApiResponse = /** status 200 OK */ GetFacilityResponse;
export type GetFacilityApiArg = number;
export type UpdateFacilityApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateFacilityApiArg = {
  facilityId: number;
  updateFacilityRequestPayload: UpdateFacilityRequestPayload;
};
export type SendFacilityAlertApiResponse = /** status 200 The requested operation succeeded. */
  | SimpleSuccessResponsePayload
  | /** status 202 The request was received, but the user is still configuring or placing sensors, so no notification has been generated. */ SimpleSuccessResponsePayload;
export type SendFacilityAlertApiArg = {
  facilityId: number;
  sendFacilityAlertRequestPayload: SendFacilityAlertRequestPayload;
};
export type PostConfiguredApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type PostConfiguredApiArg = number;
export type ListFacilityDevicesApiResponse =
  /** status 200 Successfully listed the facility's devices. */ ListDeviceConfigsResponse;
export type ListFacilityDevicesApiArg = number;
export type ListSubLocationsApiResponse = /** status 200 OK */ ListSubLocationsResponsePayload;
export type ListSubLocationsApiArg = number;
export type CreateSubLocationApiResponse =
  /** status 200 The requested operation succeeded. */ GetSubLocationResponsePayload;
export type CreateSubLocationApiArg = {
  facilityId: number;
  createSubLocationRequestPayload: CreateSubLocationRequestPayload;
};
export type DeleteSubLocationApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteSubLocationApiArg = {
  facilityId: number;
  subLocationId: number;
};
export type GetSubLocationApiResponse = /** status 200 OK */ GetSubLocationResponsePayload;
export type GetSubLocationApiArg = {
  facilityId: number;
  subLocationId: number;
};
export type UpdateSubLocationApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateSubLocationApiArg = {
  facilityId: number;
  subLocationId: number;
  updateSubLocationRequestPayload: UpdateSubLocationRequestPayload;
};
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
export type SuccessOrError = 'ok' | 'error';
export type ListFacilitiesResponse = {
  facilities: FacilityPayload[];
  status: SuccessOrError;
};
export type CreateFacilityResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type CreateFacilityRequestPayload = {
  buildCompletedDate?: string;
  buildStartedDate?: string;
  /** For nursery facilities, the number of plants this nursery is capable of holding. */
  capacity?: number;
  description?: string;
  location?: Point;
  name: string;
  operationStartedDate?: string;
  /** Which organization this facility belongs to. */
  organizationId: number;
  subLocationNames?: string[];
  /** Time zone name in IANA tz database format */
  timeZone?: string;
  type: 'Seed Bank' | 'Desalination' | 'Reverse Osmosis' | 'Nursery';
};
export type GetFacilityResponse = {
  facility: FacilityPayload;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateFacilityRequestPayload = {
  buildCompletedDate?: string;
  buildStartedDate?: string;
  /** For nursery facilities, the number of plants this nursery is capable of holding. */
  capacity?: number;
  description?: string;
  location?: Point;
  name: string;
  operationStartedDate?: string;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type SendFacilityAlertRequestPayload = {
  /** Alert body in plain text. HTML alerts are not supported yet. */
  body: string;
  subject: string;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type DeviceConfig = {
  /** Protocol-specific address of device, e.g., an IP address or a Bluetooth device ID. */
  address?: string;
  /** Identifier of facility where this device is located. */
  facilityId: number;
  /** Unique identifier of this device. */
  id: number;
  /** Name of device manufacturer. */
  make: string;
  /** Model number or model name of the device. */
  model: string;
  /** Name of this device. */
  name: string;
  /** ID of parent device such as a hub or gateway, if any. */
  parentId?: number;
  /** Port number if relevant for the protocol. */
  port?: number;
  /** Device manager protocol name. */
  protocol?: string;
  settings?: object;
  /** High-level type of the device. Device manager may use this in conjunction with the make and model to determine which metrics to report. */
  type: string;
  /** Level of diagnostic information to log. */
  verbosity?: number;
};
export type ListDeviceConfigsResponse = {
  devices: DeviceConfig[];
  status: SuccessOrError;
};
export type SubLocationPayload = {
  /** If this sub-location is at a seed bank, the number of active accessions stored there. */
  activeAccessions?: number;
  /** If this sub-location is at a nursery, the number of batches stored there that have seedlings. */
  activeBatches?: number;
  facilityId: number;
  id: number;
  name: string;
};
export type ListSubLocationsResponsePayload = {
  status: SuccessOrError;
  subLocations: SubLocationPayload[];
};
export type GetSubLocationResponsePayload = {
  status: SuccessOrError;
  subLocation: SubLocationPayload;
};
export type CreateSubLocationRequestPayload = {
  name: string;
};
export type UpdateSubLocationRequestPayload = {
  name: string;
};
export const {
  useListAllFacilitiesQuery,
  useLazyListAllFacilitiesQuery,
  useCreateFacilityMutation,
  useGetFacilityQuery,
  useLazyGetFacilityQuery,
  useUpdateFacilityMutation,
  useSendFacilityAlertMutation,
  usePostConfiguredMutation,
  useListFacilityDevicesQuery,
  useLazyListFacilityDevicesQuery,
  useListSubLocationsQuery,
  useLazyListSubLocationsQuery,
  useCreateSubLocationMutation,
  useDeleteSubLocationMutation,
  useGetSubLocationQuery,
  useLazyGetSubLocationQuery,
  useUpdateSubLocationMutation,
} = injectedRtkApi;
