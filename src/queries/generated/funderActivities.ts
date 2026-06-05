import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    funderListActivities: build.query<FunderListActivitiesApiResponse, FunderListActivitiesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/activities`,
        params: {
          projectId: queryArg.projectId,
          includeMedia: queryArg.includeMedia,
        },
      }),
    }),
    getActivityMedia1: build.query<GetActivityMedia1ApiResponse, GetActivityMedia1ApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/activities/${queryArg.activityId}/media/${queryArg.fileId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
    getActivityMediaStream: build.query<GetActivityMediaStreamApiResponse, GetActivityMediaStreamApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/activities/${queryArg.activityId}/media/${queryArg.fileId}/stream`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type FunderListActivitiesApiResponse = /** status 200 OK */ FunderListActivitiesResponsePayload;
export type FunderListActivitiesApiArg = {
  projectId: number;
  includeMedia?: boolean;
};
export type GetActivityMedia1ApiResponse = /** status 200 OK */ Blob;
export type GetActivityMedia1ApiArg = {
  activityId: number;
  fileId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type GetActivityMediaStreamApiResponse = /** status 200 OK */ GetMuxStreamResponsePayload;
export type GetActivityMediaStreamApiArg = {
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
export type FunderObservationActivityMediaFilePayload = {
  monitoringPlotNumber: number;
  position?: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  type: 'Plot' | 'Quadrat' | 'Soil';
};
export type FunderActivityMediaFilePayload = {
  caption?: string;
  capturedDate?: string;
  fileId: number;
  fileName: string;
  geolocation?: Point;
  isCoverPhoto: boolean;
  isHiddenOnMap: boolean;
  listPosition: number;
  observation?: FunderObservationActivityMediaFilePayload;
  type: 'Photo' | 'Video';
};
export type FunderActivityObservationPayload = {
  completedTime: string;
  isAdHoc: boolean;
  livePlants?: number;
  /** If this was an ad-hoc observation, its plot number. Not set for assigned observations because they can include multiple plots. */
  monitoringPlotNumber?: number;
  observationType: 'Monitoring' | 'Biomass Measurements';
  plantDensity?: number;
  survivalRate?: number;
};
export type FunderActivityPayload = {
  date: string;
  description?: string;
  id: number;
  isHighlight: boolean;
  media: FunderActivityMediaFilePayload[];
  observation?: FunderActivityObservationPayload;
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
export type FunderListActivitiesResponsePayload = {
  activities: FunderActivityPayload[];
  status: SuccessOrError;
};
export type GetMuxStreamResponsePayload = {
  playbackId: string;
  playbackToken: string;
  status: SuccessOrError;
};
export const {
  useFunderListActivitiesQuery,
  useLazyFunderListActivitiesQuery,
  useGetActivityMedia1Query,
  useLazyGetActivityMedia1Query,
  useGetActivityMediaStreamQuery,
  useLazyGetActivityMediaStreamQuery,
} = injectedRtkApi;
