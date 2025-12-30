import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listPlantingSites: build.query<ListPlantingSitesApiResponse, ListPlantingSitesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites`,
        params: {
          organizationId: queryArg.organizationId,
          projectId: queryArg.projectId,
          full: queryArg.full,
        },
      }),
    }),
    createPlantingSite: build.mutation<CreatePlantingSiteApiResponse, CreatePlantingSiteApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites`, method: 'POST', body: queryArg }),
    }),
    listPlantingSiteReportedPlants: build.query<
      ListPlantingSiteReportedPlantsApiResponse,
      ListPlantingSiteReportedPlantsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/reportedPlants`,
        params: {
          organizationId: queryArg.organizationId,
          projectId: queryArg.projectId,
        },
      }),
    }),
    validatePlantingSite: build.mutation<ValidatePlantingSiteApiResponse, ValidatePlantingSiteApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites/validate`, method: 'POST', body: queryArg }),
    }),
    deletePlantingSite: build.mutation<DeletePlantingSiteApiResponse, DeletePlantingSiteApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites/${queryArg}`, method: 'DELETE' }),
    }),
    getPlantingSite: build.query<GetPlantingSiteApiResponse, GetPlantingSiteApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites/${queryArg}` }),
    }),
    updatePlantingSite: build.mutation<UpdatePlantingSiteApiResponse, UpdatePlantingSiteApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updatePlantingSiteRequestPayload,
      }),
    }),
    listPlantingSiteHistories: build.query<ListPlantingSiteHistoriesApiResponse, ListPlantingSiteHistoriesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites/${queryArg}/history` }),
    }),
    getPlantingSiteHistory: build.query<GetPlantingSiteHistoryApiResponse, GetPlantingSiteHistoryApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites/${queryArg.id}/history/${queryArg.historyId}` }),
    }),
    getPlantingSiteReportedPlants: build.query<
      GetPlantingSiteReportedPlantsApiResponse,
      GetPlantingSiteReportedPlantsApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites/${queryArg}/reportedPlants` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListPlantingSitesApiResponse = /** status 200 OK */ ListPlantingSitesResponsePayload;
export type ListPlantingSitesApiArg = {
  organizationId?: number;
  projectId?: number;
  /** If true, include strata and substrata for each site. */
  full?: boolean;
};
export type CreatePlantingSiteApiResponse = /** status 200 OK */ CreatePlantingSiteResponsePayload;
export type CreatePlantingSiteApiArg = CreatePlantingSiteRequestPayload;
export type ListPlantingSiteReportedPlantsApiResponse =
  /** status 200 OK */ ListPlantingSiteReportedPlantsResponsePayload;
export type ListPlantingSiteReportedPlantsApiArg = {
  organizationId?: number;
  projectId?: number;
};
export type ValidatePlantingSiteApiResponse = /** status 200 OK */ ValidatePlantingSiteResponsePayload;
export type ValidatePlantingSiteApiArg = CreatePlantingSiteRequestPayload;
export type DeletePlantingSiteApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeletePlantingSiteApiArg = number;
export type GetPlantingSiteApiResponse = /** status 200 OK */ GetPlantingSiteResponsePayload;
export type GetPlantingSiteApiArg = number;
export type UpdatePlantingSiteApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdatePlantingSiteApiArg = {
  id: number;
  updatePlantingSiteRequestPayload: UpdatePlantingSiteRequestPayload;
};
export type ListPlantingSiteHistoriesApiResponse = /** status 200 OK */ ListPlantingSiteHistoriesResponsePayload;
export type ListPlantingSiteHistoriesApiArg = number;
export type GetPlantingSiteHistoryApiResponse = /** status 200 OK */ GetPlantingSiteHistoryResponsePayload;
export type GetPlantingSiteHistoryApiArg = {
  id: number;
  historyId: number;
};
export type GetPlantingSiteReportedPlantsApiResponse =
  /** status 200 OK */ GetPlantingSiteReportedPlantsResponsePayload;
export type GetPlantingSiteReportedPlantsApiArg = number;
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
export type Polygon = {
  type: 'Polygon';
} & GeometryBase & {
    coordinates: number[][][];
    type: 'Polygon';
  };
export type MonitoringPlotPayload = {
  boundary: Polygon;
  elevationMeters?: number;
  id: number;
  isAdHoc: boolean;
  isAvailable: boolean;
  plotNumber: number;
  sizeMeters: number;
};
export type MultiPolygon = {
  type: 'MultiPolygon';
} & GeometryBase & {
    coordinates: number[][][][];
    type: 'MultiPolygon';
  };
export type PlantingSeasonPayload = {
  endDate: string;
  id: number;
  startDate: string;
};
export type PlantingSubzonePayload = {
  areaHa: number;
  boundary: MultiPolygon;
  fullName: string;
  id: number;
  latestObservationCompletedTime?: string;
  latestObservationId?: number;
  monitoringPlots: MonitoringPlotPayload[];
  name: string;
  observedTime?: string;
  plantingCompleted: boolean;
  plantingCompletedTime?: string;
};
export type PlantingZonePayload = {
  areaHa: number;
  boundary: MultiPolygon;
  boundaryModifiedTime: string;
  id: number;
  latestObservationCompletedTime?: string;
  latestObservationId?: number;
  name: string;
  numPermanentPlots: number;
  numTemporaryPlots: number;
  plantingSubzones: PlantingSubzonePayload[];
  targetPlantingDensity: number;
};
export type SubstratumResponsePayload = {
  /** Area of substratum in hectares. */
  areaHa: number;
  boundary: MultiPolygon;
  fullName: string;
  id: number;
  latestObservationCompletedTime?: string;
  latestObservationId?: number;
  monitoringPlots: MonitoringPlotPayload[];
  name: string;
  /** When any monitoring plot in the substratum was most recently observed. */
  observedTime?: string;
  plantingCompleted: boolean;
  /** When planting of the substratum was marked as completed. */
  plantingCompletedTime?: string;
};
export type StratumResponsePayload = {
  /** Area of stratum in hectares. */
  areaHa: number;
  boundary: MultiPolygon;
  /** When the boundary of this stratum was last modified. Modifications of other attributes of the stratum do not cause this timestamp to change. */
  boundaryModifiedTime: string;
  id: number;
  latestObservationCompletedTime?: string;
  latestObservationId?: number;
  name: string;
  numPermanentPlots: number;
  numTemporaryPlots: number;
  substrata: SubstratumResponsePayload[];
  targetPlantingDensity: number;
};
export type PlantingSitePayload = {
  adHocPlots: MonitoringPlotPayload[];
  /** Area of planting site in hectares. Only present if the site has strata. */
  areaHa?: number;
  boundary?: MultiPolygon;
  countryCode?: string;
  description?: string;
  exclusion?: MultiPolygon;
  id: number;
  latestObservationCompletedTime?: string;
  latestObservationId?: number;
  name: string;
  organizationId: number;
  plantingSeasons: PlantingSeasonPayload[];
  /** Use strata instead */
  plantingZones?: PlantingZonePayload[];
  projectId?: number;
  strata?: StratumResponsePayload[];
  survivalRateIncludesTempPlots?: boolean;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type SuccessOrError = 'ok' | 'error';
export type ListPlantingSitesResponsePayload = {
  sites: PlantingSitePayload[];
  status: SuccessOrError;
};
export type CreatePlantingSiteResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type NewPlantingSeasonPayload = {
  endDate: string;
  startDate: string;
};
export type NewPlantingSubzonePayload = {
  boundary: MultiPolygon | Polygon;
  name: string;
};
export type NewPlantingZonePayload = {
  boundary: MultiPolygon | Polygon;
  name: string;
  plantingSubzones?: NewPlantingSubzonePayload[];
  targetPlantingDensity?: number;
};
export type NewSubstratumPayload = {
  boundary: MultiPolygon | Polygon;
  /** Name of this substratum. Two substrata in the same stratum may not have the same name, but using the same substratum name in different strata is valid. */
  name: string;
};
export type NewStratumPayload = {
  boundary: MultiPolygon | Polygon;
  /** Name of this stratum. Two strata in the same planting site may not have the same name. */
  name: string;
  substrata?: NewSubstratumPayload[];
  targetPlantingDensity?: number;
};
export type CreatePlantingSiteRequestPayload = {
  boundary?: MultiPolygon | Polygon;
  description?: string;
  exclusion?: MultiPolygon | Polygon;
  name: string;
  organizationId: number;
  plantingSeasons?: NewPlantingSeasonPayload[];
  /** Use strata instead */
  plantingZones?: NewPlantingZonePayload[];
  projectId?: number;
  /** List of strata to create. If present and not empty, "boundary" must also be specified. */
  strata?: NewStratumPayload[];
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type ReportedSpeciesPayload = {
  id: number;
  plantsSinceLastObservation: number;
  totalPlants: number;
};
export type PlantingSubzoneReportedPlantsPayload = {
  id: number;
  plantsSinceLastObservation: number;
  species: ReportedSpeciesPayload[];
  totalPlants: number;
  totalSpecies: number;
};
export type PlantingZoneReportedPlantsPayload = {
  id: number;
  plantingSubzones: PlantingSubzoneReportedPlantsPayload[];
  plantsSinceLastObservation: number;
  progressPercent: number;
  species: ReportedSpeciesPayload[];
  totalPlants: number;
  totalSpecies: number;
};
export type SubstratumReportedPlantsResponsePayload = {
  id: number;
  plantsSinceLastObservation: number;
  species: ReportedSpeciesPayload[];
  totalPlants: number;
  totalSpecies: number;
};
export type StratumReportedPlantsResponsePayload = {
  id: number;
  plantsSinceLastObservation: number;
  progressPercent: number;
  species: ReportedSpeciesPayload[];
  substrata: SubstratumReportedPlantsResponsePayload[];
  totalPlants: number;
  totalSpecies: number;
};
export type PlantingSiteReportedPlantsPayload = {
  id: number;
  /** Use strata instead */
  plantingZones: PlantingZoneReportedPlantsPayload[];
  plantsSinceLastObservation: number;
  progressPercent?: number;
  species: ReportedSpeciesPayload[];
  strata: StratumReportedPlantsResponsePayload[];
  totalPlants: number;
};
export type ListPlantingSiteReportedPlantsResponsePayload = {
  sites: PlantingSiteReportedPlantsPayload[];
  status: SuccessOrError;
};
export type PlantingSiteValidationProblemPayload = {
  /** If the problem is a conflict between two strata or two substrata, the list of the conflicting stratum or substratum names. */
  conflictsWith?: string[];
  /** Use substratum instead */
  plantingSubzone?: string;
  /** Use stratum instead */
  plantingZone?: string;
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
export type ValidatePlantingSiteResponsePayload = {
  /** True if the request was valid. */
  isValid: boolean;
  /** List of validation problems found, if any. Empty if the request is valid. */
  problems: PlantingSiteValidationProblemPayload[];
  status: SuccessOrError;
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
export type GetPlantingSiteResponsePayload = {
  site: PlantingSitePayload;
  status: SuccessOrError;
};
export type UpdatedPlantingSeasonPayload = {
  endDate: string;
  /** If present, the start and end dates of an existing planting season will be updated. Otherwise a new planting season will be created. */
  id?: number;
  startDate: string;
};
export type UpdatePlantingSiteRequestPayload = {
  /** Site boundary. Ignored if this is a detailed planting site. */
  boundary?: MultiPolygon;
  description?: string;
  name: string;
  plantingSeasons?: UpdatedPlantingSeasonPayload[];
  projectId?: number;
  survivalRateIncludesTempPlots?: boolean;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type MonitoringPlotHistoryPayload = {
  boundary: Polygon;
  id: number;
  monitoringPlotId: number;
  sizeMeters: number;
};
export type PlantingSubzoneHistoryPayload = {
  areaHa: number;
  boundary: MultiPolygon;
  fullName: string;
  id: number;
  monitoringPlots: MonitoringPlotHistoryPayload[];
  name: string;
  plantingSubzoneId?: number;
};
export type PlantingZoneHistoryPayload = {
  areaHa: number;
  boundary: MultiPolygon;
  id: number;
  name: string;
  plantingSubzones: PlantingSubzoneHistoryPayload[];
  plantingZoneId?: number;
};
export type SubstratumHistoryResponsePayload = {
  areaHa: number;
  boundary: MultiPolygon;
  fullName: string;
  id: number;
  monitoringPlots: MonitoringPlotHistoryPayload[];
  name: string;
  /** ID of substratum if it exists in the current version of the site. */
  substratumId?: number;
};
export type StratumHistoryResponsePayload = {
  areaHa: number;
  boundary: MultiPolygon;
  id: number;
  name: string;
  /** ID of stratum if it exists in the current version of the site. */
  stratumId?: number;
  substrata: SubstratumHistoryResponsePayload[];
};
export type PlantingSiteHistoryPayload = {
  areaHa?: number;
  boundary: MultiPolygon;
  createdTime: string;
  exclusion?: MultiPolygon;
  id: number;
  plantingSiteId: number;
  /** Use strata instead */
  plantingZones: PlantingZoneHistoryPayload[];
  strata: StratumHistoryResponsePayload[];
};
export type ListPlantingSiteHistoriesResponsePayload = {
  histories: PlantingSiteHistoryPayload[];
  status: SuccessOrError;
};
export type GetPlantingSiteHistoryResponsePayload = {
  site: PlantingSiteHistoryPayload;
  status: SuccessOrError;
};
export type GetPlantingSiteReportedPlantsResponsePayload = {
  site: PlantingSiteReportedPlantsPayload;
  status: SuccessOrError;
};
export const {
  useListPlantingSitesQuery,
  useLazyListPlantingSitesQuery,
  useCreatePlantingSiteMutation,
  useListPlantingSiteReportedPlantsQuery,
  useLazyListPlantingSiteReportedPlantsQuery,
  useValidatePlantingSiteMutation,
  useDeletePlantingSiteMutation,
  useGetPlantingSiteQuery,
  useLazyGetPlantingSiteQuery,
  useUpdatePlantingSiteMutation,
  useListPlantingSiteHistoriesQuery,
  useLazyListPlantingSiteHistoriesQuery,
  useGetPlantingSiteHistoryQuery,
  useLazyGetPlantingSiteHistoryQuery,
  useGetPlantingSiteReportedPlantsQuery,
  useLazyGetPlantingSiteReportedPlantsQuery,
} = injectedRtkApi;
