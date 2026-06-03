import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listActivities: build.query<ListActivitiesApiResponse, ListActivitiesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/activities`,
        params: {
          projectId: queryArg.projectId,
          depth: queryArg.depth,
        },
      }),
    }),
    createActivity: build.mutation<CreateActivityApiResponse, CreateActivityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/activities`, method: 'POST', body: queryArg }),
    }),
    adminListActivities: build.query<AdminListActivitiesApiResponse, AdminListActivitiesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/activities/admin`,
        params: {
          projectId: queryArg.projectId,
          depth: queryArg.depth,
        },
      }),
    }),
    adminCreateActivity: build.mutation<AdminCreateActivityApiResponse, AdminCreateActivityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/activities/admin`, method: 'POST', body: queryArg }),
    }),
    adminGetActivity: build.query<AdminGetActivityApiResponse, AdminGetActivityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/activities/admin/${queryArg}` }),
    }),
    adminUpdateActivity: build.mutation<AdminUpdateActivityApiResponse, AdminUpdateActivityApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/activities/admin/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.adminUpdateActivityRequestPayload,
      }),
    }),
    adminPublishActivity: build.mutation<AdminPublishActivityApiResponse, AdminPublishActivityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/activities/admin/${queryArg}/publish`, method: 'POST' }),
    }),
    deleteActivity: build.mutation<DeleteActivityApiResponse, DeleteActivityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/activities/${queryArg}`, method: 'DELETE' }),
    }),
    getActivity: build.query<GetActivityApiResponse, GetActivityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/activities/${queryArg}` }),
    }),
    updateActivity: build.mutation<UpdateActivityApiResponse, UpdateActivityApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/activities/${queryArg.activityId}`,
        method: 'PUT',
        body: queryArg.updateActivityRequestPayload,
      }),
    }),
    uploadActivityMedia: build.mutation<UploadActivityMediaApiResponse, UploadActivityMediaApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/activities/${queryArg.activityId}/media`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    deleteActivityMedia: build.mutation<DeleteActivityMediaApiResponse, DeleteActivityMediaApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/activities/${queryArg.activityId}/media/${queryArg.fileId}`,
        method: 'DELETE',
      }),
    }),
    getActivityMedia: build.query<GetActivityMediaApiResponse, GetActivityMediaApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/activities/${queryArg.activityId}/media/${queryArg.fileId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
          raw: queryArg.raw,
        },
      }),
    }),
    updateActivityMedia: build.mutation<UpdateActivityMediaApiResponse, UpdateActivityMediaApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/activities/${queryArg.activityId}/media/${queryArg.fileId}`,
        method: 'PUT',
        body: queryArg.updateActivityMediaRequestPayload,
      }),
    }),
    getActivityMediaStream1: build.query<GetActivityMediaStream1ApiResponse, GetActivityMediaStream1ApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/activities/${queryArg.activityId}/media/${queryArg.fileId}/stream`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListActivitiesApiResponse = /** status 200 OK */ ListActivitiesResponsePayload;
export type ListActivitiesApiArg = {
  projectId: number;
  /** The media files to include for each activity. */
  depth?: 'None' | 'CoverPhotos' | 'All';
};
export type CreateActivityApiResponse = /** status 200 OK */ GetActivityResponsePayload;
export type CreateActivityApiArg = CreateActivityRequestPayload;
export type AdminListActivitiesApiResponse = /** status 200 OK */ AdminListActivitiesResponsePayload;
export type AdminListActivitiesApiArg = {
  projectId: number;
  /** If true, include a list of media files for each activity. */
  depth?: 'None' | 'CoverPhotos' | 'All';
};
export type AdminCreateActivityApiResponse = /** status 200 OK */ AdminGetActivityResponsePayload;
export type AdminCreateActivityApiArg = AdminCreateActivityRequestPayload;
export type AdminGetActivityApiResponse = /** status 200 OK */ AdminGetActivityResponsePayload;
export type AdminGetActivityApiArg = number;
export type AdminUpdateActivityApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type AdminUpdateActivityApiArg = {
  id: number;
  adminUpdateActivityRequestPayload: AdminUpdateActivityRequestPayload;
};
export type AdminPublishActivityApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type AdminPublishActivityApiArg = number;
export type DeleteActivityApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type DeleteActivityApiArg = number;
export type GetActivityApiResponse = /** status 200 OK */ GetActivityResponsePayload;
export type GetActivityApiArg = number;
export type UpdateActivityApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateActivityApiArg = {
  activityId: number;
  updateActivityRequestPayload: UpdateActivityRequestPayload;
};
export type UploadActivityMediaApiResponse = /** status 200 OK */ UploadActivityMediaResponsePayload;
export type UploadActivityMediaApiArg = {
  activityId: number;
  body: {
    file: Blob;
    listPosition?: number;
  };
};
export type DeleteActivityMediaApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type DeleteActivityMediaApiArg = {
  activityId: number;
  fileId: number;
};
export type GetActivityMediaApiResponse = /** status 200 OK */ Blob;
export type GetActivityMediaApiArg = {
  activityId: number;
  fileId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
  /** If true, return the originally uploaded media file verbatim. maxWidth and maxHeight are ignored when raw is true. */
  raw?: boolean;
};
export type UpdateActivityMediaApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateActivityMediaApiArg = {
  activityId: number;
  fileId: number;
  updateActivityMediaRequestPayload: UpdateActivityMediaRequestPayload;
};
export type GetActivityMediaStream1ApiResponse = /** status 200 OK */ GetMuxStreamResponsePayload;
export type GetActivityMediaStream1ApiArg = {
  activityId: number;
  fileId: number;
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
export type ActivityObservationMediaFilePayload = {
  monitoringPlotNumber: number;
  position?: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  type: 'Plot' | 'Quadrat' | 'Soil';
};
export type ActivityMediaFilePayload = {
  caption?: string;
  capturedDate?: string;
  fileId: number;
  fileName: string;
  geolocation?: Point;
  isCoverPhoto: boolean;
  isHiddenOnMap: boolean;
  listPosition: number;
  /** If this file is from an observation, additional observation-specific data about it. */
  observation?: ActivityObservationMediaFilePayload;
  type: 'Photo' | 'Video';
};
export type ActivityObservationPayload = {
  observationId: number;
};
export type ActivityPayload = {
  date: string;
  description?: string;
  id: number;
  isHighlight: boolean;
  media: ActivityMediaFilePayload[];
  observation?: ActivityObservationPayload;
  publishedTime?: string;
  status: 'Not Verified' | 'Verified' | 'Do Not Use';
  type:
    | 'Seed Collection'
    | 'Nursery and Propagule Operations'
    | 'Planting'
    | 'Monitoring'
    | 'Site Visit'
    | 'Social Impact'
    | 'Drone Flight'
    | 'Others';
};
export type SuccessOrError = 'ok' | 'error';
export type ListActivitiesResponsePayload = {
  activities: ActivityPayload[];
  status: SuccessOrError;
};
export type GetActivityResponsePayload = {
  activity: ActivityPayload;
  status: SuccessOrError;
};
export type CreateActivityRequestPayload = {
  date: string;
  description: string;
  projectId: number;
  type:
    | 'Seed Collection'
    | 'Nursery and Propagule Operations'
    | 'Planting'
    | 'Monitoring'
    | 'Site Visit'
    | 'Social Impact'
    | 'Drone Flight'
    | 'Others';
};
export type AdminActivityObservationMediaFilePayload = {
  monitoringPlotNumber: number;
  position?: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  type: 'Plot' | 'Quadrat' | 'Soil';
};
export type AdminActivityMediaFilePayload = {
  caption?: string;
  capturedDate?: string;
  createdBy: number;
  createdTime: string;
  fileId: number;
  fileName: string;
  geolocation?: Point;
  isCoverPhoto: boolean;
  isHiddenOnMap: boolean;
  listPosition: number;
  observation?: AdminActivityObservationMediaFilePayload;
  type: 'Photo' | 'Video';
};
export type AdminActivityObservationPayload = {
  observationId: number;
};
export type AdminActivityPayload = {
  createdBy: number;
  createdTime: string;
  date: string;
  description?: string;
  id: number;
  isHighlight: boolean;
  media: AdminActivityMediaFilePayload[];
  modifiedBy: number;
  modifiedTime: string;
  observation?: AdminActivityObservationPayload;
  publishedBy?: number;
  publishedTime?: string;
  status: 'Not Verified' | 'Verified' | 'Do Not Use';
  type:
    | 'Seed Collection'
    | 'Nursery and Propagule Operations'
    | 'Planting'
    | 'Monitoring'
    | 'Site Visit'
    | 'Social Impact'
    | 'Drone Flight'
    | 'Others';
  verifiedBy?: number;
  verifiedTime?: string;
};
export type AdminListActivitiesResponsePayload = {
  activities: AdminActivityPayload[];
  status: SuccessOrError;
};
export type AdminGetActivityResponsePayload = {
  activity: AdminActivityPayload;
  status: SuccessOrError;
};
export type AdminCreateActivityRequestPayload = {
  date: string;
  description: string;
  isHighlight: boolean;
  projectId: number;
  status: 'Not Verified' | 'Verified' | 'Do Not Use';
  type:
    | 'Seed Collection'
    | 'Nursery and Propagule Operations'
    | 'Planting'
    | 'Monitoring'
    | 'Site Visit'
    | 'Social Impact'
    | 'Drone Flight'
    | 'Others';
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type AdminUpdateActivityRequestPayload = {
  date: string;
  /** Required for user-created activities; optional for system-generated ones. */
  description?: string;
  isHighlight: boolean;
  status: 'Not Verified' | 'Verified' | 'Do Not Use';
  type:
    | 'Seed Collection'
    | 'Nursery and Propagule Operations'
    | 'Planting'
    | 'Monitoring'
    | 'Site Visit'
    | 'Social Impact'
    | 'Drone Flight'
    | 'Others';
};
export type UpdateActivityRequestPayload = {
  date: string;
  /** Required for user-created activities; optional for system-generated ones. */
  description?: string;
  status: 'Not Verified' | 'Verified' | 'Do Not Use';
  type:
    | 'Seed Collection'
    | 'Nursery and Propagule Operations'
    | 'Planting'
    | 'Monitoring'
    | 'Site Visit'
    | 'Social Impact'
    | 'Drone Flight'
    | 'Others';
};
export type UploadActivityMediaResponsePayload = {
  fileId: number;
  status: SuccessOrError;
};
export type UpdateActivityMediaRequestPayload = {
  caption?: string;
  isCoverPhoto: boolean;
  isHiddenOnMap: boolean;
  listPosition: number;
};
export type GetMuxStreamResponsePayload = {
  playbackId: string;
  playbackToken: string;
  status: SuccessOrError;
};
export const {
  useListActivitiesQuery,
  useLazyListActivitiesQuery,
  useCreateActivityMutation,
  useAdminListActivitiesQuery,
  useLazyAdminListActivitiesQuery,
  useAdminCreateActivityMutation,
  useAdminGetActivityQuery,
  useLazyAdminGetActivityQuery,
  useAdminUpdateActivityMutation,
  useAdminPublishActivityMutation,
  useDeleteActivityMutation,
  useGetActivityQuery,
  useLazyGetActivityQuery,
  useUpdateActivityMutation,
  useUploadActivityMediaMutation,
  useDeleteActivityMediaMutation,
  useGetActivityMediaQuery,
  useLazyGetActivityMediaQuery,
  useUpdateActivityMediaMutation,
  useGetActivityMediaStream1Query,
  useLazyGetActivityMediaStream1Query,
} = injectedRtkApi;
