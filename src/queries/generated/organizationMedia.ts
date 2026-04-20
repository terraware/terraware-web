import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadOrganizationMediaFile: build.mutation<
      UploadOrganizationMediaFileApiResponse,
      UploadOrganizationMediaFileApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/media`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    deleteOrganizationMediaFile: build.mutation<
      DeleteOrganizationMediaFileApiResponse,
      DeleteOrganizationMediaFileApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/media/${queryArg.fileId}`,
        method: 'DELETE',
      }),
    }),
    downloadOrganizationMediaFile: build.query<
      DownloadOrganizationMediaFileApiResponse,
      DownloadOrganizationMediaFileApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/organizations/${queryArg.organizationId}/media/${queryArg.fileId}` }),
    }),
    updateOrganizationMediaFile: build.mutation<
      UpdateOrganizationMediaFileApiResponse,
      UpdateOrganizationMediaFileApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/media/${queryArg.fileId}`,
        method: 'PUT',
        body: queryArg.updateOrganizationMediaRequestPayload,
      }),
    }),
    getOrganizationMediaFileStream: build.query<
      GetOrganizationMediaFileStreamApiResponse,
      GetOrganizationMediaFileStreamApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/media/${queryArg.fileId}/stream`,
      }),
    }),
    getOrganizationMediaFileThumbnail: build.query<
      GetOrganizationMediaFileThumbnailApiResponse,
      GetOrganizationMediaFileThumbnailApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/media/${queryArg.fileId}/thumbnail`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type UploadOrganizationMediaFileApiResponse =
  /** status 200 The requested operation succeeded. */ UploadOrganizationMediaResponsePayload;
export type UploadOrganizationMediaFileApiArg = {
  organizationId: number;
  body: {
    file: Blob;
    payload: UploadOrganizationMediaRequestPayload;
  };
};
export type DeleteOrganizationMediaFileApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteOrganizationMediaFileApiArg = {
  organizationId: number;
  fileId: number;
};
export type DownloadOrganizationMediaFileApiResponse = /** status 200 The requested operation succeeded. */ object;
export type DownloadOrganizationMediaFileApiArg = {
  organizationId: number;
  fileId: number;
};
export type UpdateOrganizationMediaFileApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateOrganizationMediaFileApiArg = {
  organizationId: number;
  fileId: number;
  updateOrganizationMediaRequestPayload: UpdateOrganizationMediaRequestPayload;
};
export type GetOrganizationMediaFileStreamApiResponse =
  /** status 200 The requested operation succeeded. */ GetOrganizationMediaStreamResponsePayload;
export type GetOrganizationMediaFileStreamApiArg = {
  organizationId: number;
  fileId: number;
};
export type GetOrganizationMediaFileThumbnailApiResponse = /** status 200 The requested operation succeeded. */ object;
export type GetOrganizationMediaFileThumbnailApiArg = {
  organizationId: number;
  fileId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type SuccessOrError = 'ok' | 'error';
export type UploadOrganizationMediaResponsePayload = {
  fileId: number;
  status: SuccessOrError;
};
export type UploadOrganizationMediaRequestPayload = {
  caption?: string;
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
export type CrsProperties = {
  /** Name of the coordinate reference system. This must be in the form EPSG:nnnn where nnnn is the numeric identifier of a coordinate system in the EPSG dataset. The default is Longitude/Latitude EPSG:4326, which is the coordinate system +for GeoJSON. */
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
export type UpdateOrganizationMediaRequestPayload = {
  caption?: string;
  gpsCoordinates?: Point;
};
export type GetOrganizationMediaStreamResponsePayload = {
  fileId: number;
  playbackId: string;
  playbackToken: string;
  status: SuccessOrError;
};
export const {
  useUploadOrganizationMediaFileMutation,
  useDeleteOrganizationMediaFileMutation,
  useDownloadOrganizationMediaFileQuery,
  useLazyDownloadOrganizationMediaFileQuery,
  useUpdateOrganizationMediaFileMutation,
  useGetOrganizationMediaFileStreamQuery,
  useLazyGetOrganizationMediaFileStreamQuery,
  useGetOrganizationMediaFileThumbnailQuery,
  useLazyGetOrganizationMediaFileThumbnailQuery,
} = injectedRtkApi;
