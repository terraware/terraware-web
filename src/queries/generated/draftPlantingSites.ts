import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    createDraftPlantingSite: build.mutation<CreateDraftPlantingSiteApiResponse, CreateDraftPlantingSiteApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/draftSites`, method: 'POST', body: queryArg }),
    }),
    parseDraftPlantingSiteBoundary: build.mutation<
      ParseDraftPlantingSiteBoundaryApiResponse,
      ParseDraftPlantingSiteBoundaryApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/tracking/draftSites/boundaryFile`, method: 'POST', body: queryArg }),
    }),
    deleteDraftPlantingSite: build.mutation<DeleteDraftPlantingSiteApiResponse, DeleteDraftPlantingSiteApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/draftSites/${queryArg}`, method: 'DELETE' }),
    }),
    getDraftPlantingSite: build.query<GetDraftPlantingSiteApiResponse, GetDraftPlantingSiteApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/draftSites/${queryArg}` }),
    }),
    updateDraftPlantingSite: build.mutation<UpdateDraftPlantingSiteApiResponse, UpdateDraftPlantingSiteApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/draftSites/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updateDraftPlantingSiteRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type CreateDraftPlantingSiteApiResponse = /** status 200 OK */ CreateDraftPlantingSiteResponsePayload;
export type CreateDraftPlantingSiteApiArg = CreateDraftPlantingSiteRequestPayload;
export type ParseDraftPlantingSiteBoundaryApiResponse =
  /** status 200 The file was processed. Check status for a parsed boundary or content validation problems. */ ParseDraftPlantingSiteBoundaryResponsePayload;
export type ParseDraftPlantingSiteBoundaryApiArg = {
  file: Blob;
};
export type DeleteDraftPlantingSiteApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type DeleteDraftPlantingSiteApiArg = number;
export type GetDraftPlantingSiteApiResponse = /** status 200 OK */ GetDraftPlantingSiteResponsePayload;
export type GetDraftPlantingSiteApiArg = number;
export type UpdateDraftPlantingSiteApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateDraftPlantingSiteApiArg = {
  id: number;
  updateDraftPlantingSiteRequestPayload: UpdateDraftPlantingSiteRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
export type CreateDraftPlantingSiteResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type CreateDraftPlantingSiteRequestPayload = {
  /** In-progress state of the draft. This includes map data and other information needed by the client. It is treated as opaque data by the server. */
  data: {
    [key: string]: any;
  };
  description?: string;
  name: string;
  /** If the user has started defining strata, the number of strata defined so far. */
  numStrata?: number;
  /** If the user has started defining substrata, the number of substrata defined so far. */
  numSubstrata?: number;
  organizationId: number;
  /** If the draft is associated with a project, its ID. */
  projectId?: number;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
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
export type LineString = {
  type: 'LineString';
} & GeometryBase & {
    coordinates: number[][];
    type: 'LineString';
  };
export type MultiLineString = {
  type: 'MultiLineString';
} & GeometryBase & {
    coordinates: number[][][];
    type: 'MultiLineString';
  };
export type MultiPoint = {
  type: 'MultiPoint';
} & GeometryBase & {
    coordinates: number[][];
    type: 'MultiPoint';
  };
export type MultiPolygon = {
  type: 'MultiPolygon';
} & GeometryBase & {
    coordinates: number[][][][];
    type: 'MultiPolygon';
  };
export type Point = {
  type: 'Point';
} & GeometryBase & {
    /** A single position consisting of X, Y, and optional Z values in the coordinate system specified by the crs field. */
    coordinates: number[];
    type: 'Point';
  };
export type Polygon = {
  type: 'Polygon';
} & GeometryBase & {
    coordinates: number[][][];
    type: 'Polygon';
  };
export type GeometryCollection = {
  type: 'GeometryCollection';
} & GeometryBase & {
    geometries: (GeometryCollection | LineString | MultiLineString | MultiPoint | MultiPolygon | Point | Polygon)[];
    type: 'GeometryCollection';
  };
export type Geometry = GeometryCollection | LineString | MultiLineString | MultiPoint | MultiPolygon | Point | Polygon;
export type GeometryFileErrorCode =
  | 'UnsupportedFormat'
  | 'InvalidFile'
  | 'NoKmlInArchive'
  | 'NoShapefile'
  | 'MultipleShapefiles'
  | 'UnknownCoordinateSystem'
  | 'NoPolygons'
  | 'InvalidGeometry'
  | 'TooManyVertices';
export type BoundaryFileProblemPayload = {
  code: GeometryFileErrorCode;
};
export type ParseDraftPlantingSiteBoundaryResponsePayload = {
  /** Area of the returned polygons in hectares, excluding holes. */
  areaHa?: number;
  /** Original filename of the uploaded file, or empty if no filename was supplied. */
  filename: string;
  /** Detected format of the parsed contents. A ZIP containing KML is reported as KMZ; a ZIP containing a shapefile is reported as Shapefile. */
  format?: 'GeoJSON' | 'KML' | 'KMZ' | 'Shapefile';
  geometry?: Geometry;
  /** Number of separate polygons after overlapping polygons are combined. */
  numPolygons?: number;
  /** One content validation problem. Omitted on success; clients translate the code into a message in the user's language. */
  problems?: BoundaryFileProblemPayload[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type DraftPlantingSitePayload = {
  /** ID of the user who created this draft. Only that user is allowed to modify or delete the draft. */
  createdBy: number;
  createdTime: string;
  /** In-progress state of the draft. This includes map data and other information needed by the client. It is treated as opaque data by the server. */
  data: {
    [key: string]: any;
  };
  description?: string;
  id: number;
  modifiedTime: string;
  name: string;
  /** If the user has started defining strata, the number of strata defined so far. */
  numStrata?: number;
  /** If the user has started defining substrata, the number of substrata defined so far. */
  numSubstrata?: number;
  organizationId: number;
  /** If the draft is associated with a project, its ID. */
  projectId?: number;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type GetDraftPlantingSiteResponsePayload = {
  site: DraftPlantingSitePayload;
  status: SuccessOrError;
};
export type UpdateDraftPlantingSiteRequestPayload = {
  /** In-progress state of the draft. This includes map data and other information needed by the client. It is treated as opaque data by the server. */
  data: {
    [key: string]: any;
  };
  description?: string;
  name: string;
  /** If the user has started defining strata, the number of strata defined so far. */
  numStrata?: number;
  /** If the user has started defining substrata, the number of substrata defined so far. */
  numSubstrata?: number;
  /** If the draft is associated with a project, its ID. */
  projectId?: number;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export const {
  useCreateDraftPlantingSiteMutation,
  useParseDraftPlantingSiteBoundaryMutation,
  useDeleteDraftPlantingSiteMutation,
  useGetDraftPlantingSiteQuery,
  useLazyGetDraftPlantingSiteQuery,
  useUpdateDraftPlantingSiteMutation,
} = injectedRtkApi;
