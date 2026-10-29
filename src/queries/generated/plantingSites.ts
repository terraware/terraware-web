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
          includeZones: queryArg.includeZones,
          simplified: queryArg.simplified,
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
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.id}`,
        params: {
          includeZones: queryArg.includeZones,
          simplified: queryArg.simplified,
        },
      }),
    }),
    updatePlantingSite: build.mutation<UpdatePlantingSiteApiResponse, UpdatePlantingSiteApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updatePlantingSiteRequestPayload,
      }),
    }),
    getSurvivalRateCalculationInProgress: build.query<
      GetSurvivalRateCalculationInProgressApiResponse,
      GetSurvivalRateCalculationInProgressApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites/${queryArg}/calculationInProgress` }),
    }),
    completeSurvivalRateCalculation: build.mutation<
      CompleteSurvivalRateCalculationApiResponse,
      CompleteSurvivalRateCalculationApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.id}/completeSurvivalRateCalculation`,
        method: 'POST',
        params: {
          maxWaitSeconds: queryArg.maxWaitSeconds,
        },
      }),
    }),
    listPlantingSiteHistoryEvents: build.query<
      ListPlantingSiteHistoryEventsApiResponse,
      ListPlantingSiteHistoryEventsApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites/${queryArg}/history` }),
    }),
    getPlantingSiteHistory: build.query<GetPlantingSiteHistoryApiResponse, GetPlantingSiteHistoryApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.id}/history/${queryArg.historyId}`,
        params: {
          simplified: queryArg.simplified,
        },
      }),
    }),
    updatePlantingSiteMap: build.mutation<UpdatePlantingSiteMapApiResponse, UpdatePlantingSiteMapApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.id}/map`,
        method: 'PUT',
        body: queryArg.updatePlantingSiteMapRequestPayload,
      }),
    }),
    summarizePlantingSiteMapEdit: build.mutation<
      SummarizePlantingSiteMapEditApiResponse,
      SummarizePlantingSiteMapEditApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.id}/map/summary`,
        method: 'POST',
        body: queryArg.updatePlantingSiteMapRequestPayload,
        params: {
          depth: queryArg.depth,
        },
      }),
    }),
    getPlantingSiteReportedPlants: build.query<
      GetPlantingSiteReportedPlantsApiResponse,
      GetPlantingSiteReportedPlantsApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites/${queryArg}/reportedPlants` }),
    }),
    listPlantingSiteSpeciesTargets: build.query<
      ListPlantingSiteSpeciesTargetsApiResponse,
      ListPlantingSiteSpeciesTargetsApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/tracking/sites/${queryArg}/speciesTargets` }),
    }),
    deletePlantingSiteSpeciesTarget: build.mutation<
      DeletePlantingSiteSpeciesTargetApiResponse,
      DeletePlantingSiteSpeciesTargetApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.plantingSiteId}/speciesTargets/${queryArg.speciesId}`,
        method: 'DELETE',
      }),
    }),
    updatePlantingSiteSpeciesTarget: build.mutation<
      UpdatePlantingSiteSpeciesTargetApiResponse,
      UpdatePlantingSiteSpeciesTargetApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.plantingSiteId}/speciesTargets/${queryArg.speciesId}`,
        method: 'PUT',
        body: queryArg.updatePlantingSiteSpeciesTargetRequestPayload,
      }),
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
  /** include the plantingZones variable in the response. Only used for backwards compatibility; should be false in all new calls of it. */
  includeZones?: boolean;
  simplified?: boolean;
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
export type GetPlantingSiteApiArg = {
  id: number;
  /** include the plantingZones variable in the response. Only used for backwards compatibility; should be false in all new calls of it. */
  includeZones?: boolean;
  simplified?: boolean;
};
export type UpdatePlantingSiteApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdatePlantingSiteApiArg = {
  id: number;
  updatePlantingSiteRequestPayload: UpdatePlantingSiteRequestPayload;
};
export type GetSurvivalRateCalculationInProgressApiResponse =
  /** status 200 OK */ GetSurvivalRateCalculationInProgressResponsePayload;
export type GetSurvivalRateCalculationInProgressApiArg = number;
export type CompleteSurvivalRateCalculationApiResponse =
  /** status 200 OK */ GetSurvivalRateCalculationInProgressResponsePayload;
export type CompleteSurvivalRateCalculationApiArg = {
  id: number;
  /** Maximum number of seconds to wait for the recalculation to finish. Defaults to 600. */
  maxWaitSeconds?: number;
};
export type ListPlantingSiteHistoryEventsApiResponse =
  /** status 200 OK */ ListPlantingSiteHistoryEventsResponsePayload;
export type ListPlantingSiteHistoryEventsApiArg = number;
export type GetPlantingSiteHistoryApiResponse = /** status 200 OK */ GetPlantingSiteHistoryResponsePayload;
export type GetPlantingSiteHistoryApiArg = {
  id: number;
  historyId: number;
  simplified?: boolean;
};
export type UpdatePlantingSiteMapApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdatePlantingSiteMapApiArg = {
  id: number;
  updatePlantingSiteMapRequestPayload: UpdatePlantingSiteMapRequestPayload;
};
export type SummarizePlantingSiteMapEditApiResponse =
  /** status 200 The requested operation succeeded. */ SummarizePlantingSiteMapEditResponsePayload;
export type SummarizePlantingSiteMapEditApiArg = {
  id: number;
  /** How much detail to include in the summary. */
  depth?: 'Site' | 'Stratum' | 'Substratum' | 'Plot';
  updatePlantingSiteMapRequestPayload: UpdatePlantingSiteMapRequestPayload;
};
export type GetPlantingSiteReportedPlantsApiResponse =
  /** status 200 OK */ GetPlantingSiteReportedPlantsResponsePayload;
export type GetPlantingSiteReportedPlantsApiArg = number;
export type ListPlantingSiteSpeciesTargetsApiResponse =
  /** status 200 The requested operation succeeded. */ ListPlantingSiteSpeciesTargetsResponsePayload;
export type ListPlantingSiteSpeciesTargetsApiArg = number;
export type DeletePlantingSiteSpeciesTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeletePlantingSiteSpeciesTargetApiArg = {
  plantingSiteId: number;
  speciesId: number;
};
export type UpdatePlantingSiteSpeciesTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdatePlantingSiteSpeciesTargetApiArg = {
  plantingSiteId: number;
  speciesId: number;
  updatePlantingSiteSpeciesTargetRequestPayload: UpdatePlantingSiteSpeciesTargetRequestPayload;
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
  latestObservationNumPlots?: number;
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
  initialPlantingDensity: number;
  latestObservationCompletedTime?: string;
  latestObservationId?: number;
  name: string;
  numPermanentPlots: number;
  numTemporaryPlots: number;
  substrata: SubstratumResponsePayload[];
  /** Number of plants per hectare that the stratum should have after planting is completed. */
  targetPlantDensity?: number;
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
export type NewSubstratumPayload = {
  boundary: MultiPolygon | Polygon;
  /** Name of this substratum. Two substrata in the same stratum may not have the same name, but using the same substratum name in different strata is valid. */
  name: string;
};
export type NewStratumPayload = {
  boundary: MultiPolygon | Polygon;
  initialPlantingDensity?: number;
  /** Name of this stratum. Two strata in the same planting site may not have the same name. */
  name: string;
  substrata?: NewSubstratumPayload[];
  /** Number of plants per hectare that the stratum should have after planting is completed. */
  targetPlantDensity?: number;
};
export type CreatePlantingSiteRequestPayload = {
  boundary?: MultiPolygon | Polygon;
  description?: string;
  exclusion?: MultiPolygon | Polygon;
  name: string;
  organizationId: number;
  projectId?: number;
  /** List of strata to create. If present and not empty, "boundary" must also be specified. */
  strata?: NewStratumPayload[];
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type ReportedSpeciesPayload = {
  id: number;
  totalPlants: number;
};
export type SubstratumReportedPlantsResponsePayload = {
  id: number;
  species: ReportedSpeciesPayload[];
  totalPlants: number;
  totalSpecies: number;
};
export type StratumReportedPlantsResponsePayload = {
  id: number;
  progressPercent: number;
  species: ReportedSpeciesPayload[];
  substrata: SubstratumReportedPlantsResponsePayload[];
  totalPlants: number;
  totalSpecies: number;
};
export type PlantingSiteReportedPlantsPayload = {
  id: number;
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
  problemType:
    | 'DuplicateSubstratumName'
    | 'DuplicateStratumName'
    | 'ExclusionInvalid'
    | 'ExclusionWithoutBoundary'
    | 'SiteBoundaryInvalid'
    | 'SiteTooLarge'
    | 'SubstratumBoundaryInvalid'
    | 'SubstratumBoundaryOverlaps'
    | 'SubstratumInExclusionArea'
    | 'SubstratumNotInStratum'
    | 'StratumBoundaryInvalid'
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
export type UpdatePlantingSiteRequestPayload = {
  /** Site boundary. Ignored if this is a detailed planting site. */
  boundary?: MultiPolygon;
  description?: string;
  name: string;
  projectId?: number;
  survivalRateIncludesTempPlots?: boolean;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type GetSurvivalRateCalculationInProgressResponsePayload = {
  calculationInProgress: boolean;
  status: SuccessOrError;
};
export type PlantingSiteHistoryEventPayload = {
  date: string;
  editedByName?: string;
  editedByUserId: number;
  historyId: number;
  type: 'Created' | 'Edited';
};
export type ListPlantingSiteHistoryEventsResponsePayload = {
  events: PlantingSiteHistoryEventPayload[];
  status: SuccessOrError;
};
export type MonitoringPlotHistoryPayload = {
  boundary: Polygon;
  id: number;
  monitoringPlotId: number;
  sizeMeters: number;
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
  strata: StratumHistoryResponsePayload[];
};
export type GetPlantingSiteHistoryResponsePayload = {
  site: PlantingSiteHistoryPayload;
  status: SuccessOrError;
};
export type PlantingSiteMapInvalidResponsePayload = {
  error: ErrorDetails;
  problems: PlantingSiteValidationProblemPayload[];
  status: SuccessOrError;
};
export type SubstratumMapEditPayload = {
  boundary: MultiPolygon | Polygon;
  /** ID of the existing substratum this represents. Omit to create a substratum. */
  id?: number;
  /** Name of this substratum. Two substrata in the same stratum may not have the same name, but using the same substratum name in different strata is valid. */
  name: string;
};
export type StratumMapEditPayload = {
  /** ID of the existing stratum this represents. Omit to create a stratum. */
  id?: number;
  /** Name of this stratum. Two strata in the same planting site may not have the same name. */
  name: string;
  /** Substrata of this stratum. The stratum's boundary is the union of its substrata's boundaries. Must not be empty. */
  substrata: SubstratumMapEditPayload[];
};
export type UpdatePlantingSiteMapRequestPayload = {
  /** Site boundary. Required if the site has no strata; ignored otherwise, since the boundary of a site with strata is the union of its strata's boundaries. */
  boundary?: MultiPolygon | Polygon;
  exclusion?: MultiPolygon | Polygon;
  /** Strata and substrata. Existing strata and substrata are matched by ID; those that are omitted are deleted. Must not be empty if the site already has strata. */
  strata: StratumMapEditPayload[];
  /** IDs of edited substrata whose planting completed flags should be cleared. Ignored when summarizing an edit. */
  substratumIdsToMarkIncomplete?: number[];
};
export type PlantingSiteEditSummaryItemPayloadBase = {
  type: string;
};
export type ObservationsAbandonedPayload = {
  type: 'ObservationsAbandoned';
} & PlantingSiteEditSummaryItemPayloadBase & {
    observationIds: number[];
  };
export type PermanentPlotCreatedPayload = {
  type: 'PermanentPlotCreated';
} & PlantingSiteEditSummaryItemPayloadBase & {
    /** True if the plot would be in an area that was already part of the stratum. */
    inExistingArea: boolean;
    permanentIndex?: number;
    stratumName: string;
    /** Normally null; new plots are created at the stratum level. */
    substratumName?: string;
  };
export type PlotAcceptedPayload = {
  type: 'PlotAccepted';
} & PlantingSiteEditSummaryItemPayloadBase & {
    monitoringPlotId: number;
    permanentIndex?: number;
    plotNumber: number;
    stratumName: string;
    substratumName: string;
  };
export type PlotAdoptedPayload = {
  type: 'PlotAdopted';
} & PlantingSiteEditSummaryItemPayloadBase & {
    monitoringPlotId: number;
    permanentIndex?: number;
    plotNumber: number;
    stratumName: string;
    substratumName: string;
  };
export type PlotEjectedPayload = {
  type: 'PlotEjected';
} & PlantingSiteEditSummaryItemPayloadBase & {
    monitoringPlotId: number;
    plotNumber: number;
    stratumName: string;
    substratumName: string;
  };
export type SiteAreaChangedPayload = {
  type: 'SiteAreaChanged';
} & PlantingSiteEditSummaryItemPayloadBase & {
    areaHaDifference: number;
  };
export type StratumCreatedPayload = {
  type: 'StratumCreated';
} & PlantingSiteEditSummaryItemPayloadBase & {
    numPermanentPlots: number;
    stableId: string;
    stratumName: string;
  };
export type StratumDeletedPayload = {
  type: 'StratumDeleted';
} & PlantingSiteEditSummaryItemPayloadBase & {
    stableId: string;
    stratumName: string;
  };
export type StratumUpdatedPayload = {
  type: 'StratumUpdated';
} & PlantingSiteEditSummaryItemPayloadBase & {
    areaHaDifference: number;
    numPermanentPlots: number;
    /** Percentage of the stratum's new boundary that overlaps with its existing boundary. */
    overlapPercent: number;
    stratumName: string;
  };
export type SubstratumCreatedPayload = {
  type: 'SubstratumCreated';
} & PlantingSiteEditSummaryItemPayloadBase & {
    stableId: string;
    stratumName: string;
    substratumName: string;
  };
export type SubstratumDeletedPayload = {
  type: 'SubstratumDeleted';
} & PlantingSiteEditSummaryItemPayloadBase & {
    stableId: string;
    stratumName: string;
    substratumName: string;
  };
export type SubstratumUpdatedPayload = {
  type: 'SubstratumUpdated';
} & PlantingSiteEditSummaryItemPayloadBase & {
    areaHaDifference: number;
    /** Percentage of the substratum's new boundary that overlaps with its existing boundary. */
    overlapPercent: number;
    stratumName: string;
    substratumName: string;
  };
export type SummarizePlantingSiteMapEditResponsePayload = {
  status: SuccessOrError;
  /** Changes the edit would make. Site-wide items come first, followed by each stratum's items. */
  summary: (
    | ObservationsAbandonedPayload
    | PermanentPlotCreatedPayload
    | PlotAcceptedPayload
    | PlotAdoptedPayload
    | PlotEjectedPayload
    | SiteAreaChangedPayload
    | StratumCreatedPayload
    | StratumDeletedPayload
    | StratumUpdatedPayload
    | SubstratumCreatedPayload
    | SubstratumDeletedPayload
    | SubstratumUpdatedPayload
  )[];
};
export type GetPlantingSiteReportedPlantsResponsePayload = {
  site: PlantingSiteReportedPlantsPayload;
  status: SuccessOrError;
};
export type PlantingSiteSpeciesTargetPayload = {
  speciesId: number;
  /** Strata of the planting site where the species is targeted for planting. */
  stratumIds: number[];
  /** Number of plants targeted for the planting site as a whole. */
  targetPlants?: number;
};
export type ListPlantingSiteSpeciesTargetsResponsePayload = {
  status: SuccessOrError;
  targets: PlantingSiteSpeciesTargetPayload[];
};
export type UpdatePlantingSiteSpeciesTargetRequestPayload = {
  /** Strata of the planting site where the species is targeted for planting. There is no target number of plants at the stratum level. */
  stratumIds: number[];
  /** Number of plants targeted for the planting site as a whole. */
  targetPlants?: number;
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
  useGetSurvivalRateCalculationInProgressQuery,
  useLazyGetSurvivalRateCalculationInProgressQuery,
  useCompleteSurvivalRateCalculationMutation,
  useListPlantingSiteHistoryEventsQuery,
  useLazyListPlantingSiteHistoryEventsQuery,
  useGetPlantingSiteHistoryQuery,
  useLazyGetPlantingSiteHistoryQuery,
  useUpdatePlantingSiteMapMutation,
  useSummarizePlantingSiteMapEditMutation,
  useGetPlantingSiteReportedPlantsQuery,
  useLazyGetPlantingSiteReportedPlantsQuery,
  useListPlantingSiteSpeciesTargetsQuery,
  useLazyListPlantingSiteSpeciesTargetsQuery,
  useDeletePlantingSiteSpeciesTargetMutation,
  useUpdatePlantingSiteSpeciesTargetMutation,
} = injectedRtkApi;
