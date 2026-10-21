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
export type CreateDraftPlantingSiteApiResponse =
  /** status 200 The requested operation succeeded. */ CreateDraftPlantingSiteResponsePayload;
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
export type UpdateDraftPlantingSiteApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateDraftPlantingSiteApiArg = {
  id: number;
  updateDraftPlantingSiteRequestPayload: UpdateDraftPlantingSiteRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
export type CreateDraftPlantingSiteResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type PlantingSiteValidationProblemPayload = {
  /** If the problem is a conflict between two strata or two substrata, the list of the conflicting stratum or substratum names. */
  conflictsWith?: string[];
  problemType:
    | 'DuplicateSubstratumName'
    | 'DuplicateStratumName'
    | 'ExclusionWithoutBoundary'
    | 'SiteTooLarge'
    | 'SubstratumBoundaryOverlaps'
    | 'SubstratumInExclusionArea'
    | 'SubstratumNotInStratum'
    | 'StratumBoundaryOverlaps'
    | 'StratumHasNoSubstrata'
    | 'StratumNotInSite'
    | 'StratumTooSmall'
    | 'StrataWithoutSiteBoundary';
  /** If the problem relates to a particular stratum, its name. */
  stratum?: string;
  /** If the problem relates to a particular substratum, its name. If this is present, stratum will also be present and will be the name of the stratum that contains this substratum. */
  substratum?: string;
};
export type DraftPlantingSiteMapInvalidResponsePayload = {
  error: ErrorDetails;
  problems: PlantingSiteValidationProblemPayload[];
  status: SuccessOrError;
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
export type MultiPolygon = {
  type: 'MultiPolygon';
} & GeometryBase & {
    coordinates: number[][][][];
    type: 'MultiPolygon';
  };
export type Polygon = {
  type: 'Polygon';
} & GeometryBase & {
    coordinates: number[][][];
    type: 'Polygon';
  };
export type DraftSubstratumPayload = {
  boundary: MultiPolygon | Polygon;
  id?: number;
  name: string;
};
export type DraftStratumPayload = {
  boundary: MultiPolygon | Polygon;
  id?: number;
  initialPlantingDensity: number;
  name: string;
  substrata: DraftSubstratumPayload[];
};
export type CreateDraftPlantingSiteRequestPayload = {
  /** Boundary of the site. Polygons are stored as MultiPolygons. Not allowed if data is supplied. */
  boundary?: MultiPolygon | Polygon;
  /** Not allowed if data is supplied. */
  boundarySource?: string;
  /** In-progress state of the draft, including its map, in the legacy JSON format. Deprecated: use the typed fields instead. If this is supplied, the typed map fields must be omitted and the map is saved without validation. */
  data?: {
    [key: string]: any;
  };
  description?: string;
  /** Exclusion area. Not allowed if data is supplied. */
  exclusion?: MultiPolygon | Polygon;
  name: string;
  /** Ignored; the server computes this. */
  numStrata?: number;
  /** Ignored; the server computes this. */
  numSubstrata?: number;
  organizationId: number;
  /** If the draft is associated with a project, its ID. */
  projectId?: number;
  /** Not allowed if data is supplied. */
  siteEditStep?: string;
  /** Required if data is not supplied. */
  siteType?: 'Simple' | 'Detailed';
  /** Strata and substrata. Not allowed if data is supplied. Must be empty or omitted for Simple sites. */
  strata?: DraftStratumPayload[];
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type GeometryCollection = {
  type: 'GeometryCollection';
} & GeometryBase & {
    geometries: Geometry[];
    type: 'GeometryCollection';
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
export type Point = {
  type: 'Point';
} & GeometryBase & {
    /** A single position consisting of X, Y, and optional Z values in the coordinate system specified by the crs field. */
    coordinates: number[];
    type: 'Point';
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
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type DraftPlantingSitePayload = {
  boundary?: MultiPolygon | Polygon;
  boundarySource?: string;
  /** ID of the user who created this draft. */
  createdBy: number;
  createdTime: string;
  /** In-progress state of the draft, including its map, in the legacy JSON format. Deprecated: use the typed fields instead. */
  data: {
    [key: string]: any;
  };
  description?: string;
  exclusion?: MultiPolygon | Polygon;
  id: number;
  modifiedTime: string;
  name: string;
  /** Number of strata in the draft. */
  numStrata?: number;
  /** Number of substrata in the draft. */
  numSubstrata?: number;
  organizationId: number;
  /** If the draft is associated with a project, its ID. */
  projectId?: number;
  siteEditStep?: string;
  siteType: 'Simple' | 'Detailed';
  strata: DraftStratumPayload[];
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type GetDraftPlantingSiteResponsePayload = {
  site: DraftPlantingSitePayload;
  status: SuccessOrError;
};
export type UpdateDraftPlantingSiteRequestPayload = {
  /** Boundary of the site. Polygons are stored as MultiPolygons. Not allowed if data is supplied. If data is not supplied, the typed map fields replace the stored map entirely, so omitted fields are cleared. */
  boundary?: MultiPolygon | Polygon;
  /** Not allowed if data is supplied. */
  boundarySource?: string;
  /** In-progress state of the draft, including its map, in the legacy JSON format. Deprecated: use the typed fields instead. If this is supplied, the typed map fields must be omitted and the map is saved without validation. */
  data?: {
    [key: string]: any;
  };
  description?: string;
  /** Exclusion area. Not allowed if data is supplied. */
  exclusion?: MultiPolygon | Polygon;
  name: string;
  /** Ignored; the server computes this. */
  numStrata?: number;
  /** Ignored; the server computes this. */
  numSubstrata?: number;
  /** If the draft is associated with a project, its ID. */
  projectId?: number;
  /** Not allowed if data is supplied. */
  siteEditStep?: string;
  /** Not allowed if data is supplied. If omitted, the stored site type is kept. The site type of an existing draft cannot be changed. */
  siteType?: 'Simple' | 'Detailed';
  /** Strata and substrata. Not allowed if data is supplied. Existing strata and substrata are matched by ID; those that are omitted are deleted. */
  strata?: DraftStratumPayload[];
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
