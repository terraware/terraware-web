import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listObservations: build.query<ListObservationsApiResponse, ListObservationsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations`,
        params: {
          organizationId: queryArg.organizationId,
          plantingSiteId: queryArg.plantingSiteId,
        },
      }),
    }),
    scheduleObservation: build.mutation<ScheduleObservationApiResponse, ScheduleObservationApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/observations`, method: 'POST', body: queryArg }),
    }),
    listAdHocObservations: build.query<ListAdHocObservationsApiResponse, ListAdHocObservationsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/adHoc`,
        params: {
          organizationId: queryArg.organizationId,
          plantingSiteId: queryArg.plantingSiteId,
        },
      }),
    }),
    completeAdHocObservation: build.mutation<CompleteAdHocObservationApiResponse, CompleteAdHocObservationApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/observations/adHoc`, method: 'POST', body: queryArg }),
    }),
    listAdHocObservationResults: build.query<ListAdHocObservationResultsApiResponse, ListAdHocObservationResultsApiArg>(
      {
        query: (queryArg) => ({
          url: `/api/v1/tracking/observations/adHoc/results`,
          params: {
            organizationId: queryArg.organizationId,
            plantingSiteId: queryArg.plantingSiteId,
            includePlants: queryArg.includePlants,
            limit: queryArg.limit,
          },
        }),
      }
    ),
    listObservationResults: build.query<ListObservationResultsApiResponse, ListObservationResultsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/results`,
        params: {
          organizationId: queryArg.organizationId,
          plantingSiteId: queryArg.plantingSiteId,
          includePlants: queryArg.includePlants,
          limit: queryArg.limit,
        },
      }),
    }),
    listObservationSummaries: build.query<ListObservationSummariesApiResponse, ListObservationSummariesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/results/summaries`,
        params: {
          plantingSiteId: queryArg.plantingSiteId,
          limit: queryArg.limit,
        },
      }),
    }),
    getObservation: build.query<GetObservationApiResponse, GetObservationApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/observations/${queryArg}` }),
    }),
    rescheduleObservation: build.mutation<RescheduleObservationApiResponse, RescheduleObservationApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}`,
        method: 'PUT',
        body: queryArg.rescheduleObservationRequestPayload,
      }),
    }),
    abandonObservation: build.mutation<AbandonObservationApiResponse, AbandonObservationApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/observations/${queryArg}/abandon`, method: 'POST' }),
    }),
    getObservationBirdnetResults: build.query<
      GetObservationBirdnetResultsApiResponse,
      GetObservationBirdnetResultsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/birdnet`,
        params: {
          monitoringPlotId: queryArg.monitoringPlotId,
          fileId: queryArg.fileId,
        },
      }),
    }),
    mergeOtherSpecies: build.mutation<MergeOtherSpeciesApiResponse, MergeOtherSpeciesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/mergeOtherSpecies`,
        method: 'POST',
        body: queryArg.mergeOtherSpeciesRequestPayload,
      }),
    }),
    listAssignedPlots: build.query<ListAssignedPlotsApiResponse, ListAssignedPlotsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/observations/${queryArg}/plots` }),
    }),
    getOneAssignedPlot: build.query<GetOneAssignedPlotApiResponse, GetOneAssignedPlotApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}`,
      }),
    }),
    updateCompletedObservationPlot: build.mutation<
      UpdateCompletedObservationPlotApiResponse,
      UpdateCompletedObservationPlotApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}`,
        method: 'PATCH',
        body: queryArg.updateObservationRequestPayload,
      }),
    }),
    completePlotObservation: build.mutation<CompletePlotObservationApiResponse, CompletePlotObservationApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}`,
        method: 'POST',
        body: queryArg.completePlotObservationRequestPayload,
      }),
    }),
    updatePlotObservation: build.mutation<UpdatePlotObservationApiResponse, UpdatePlotObservationApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}`,
        method: 'PUT',
        body: queryArg.updatePlotObservationRequestPayload,
      }),
    }),
    claimMonitoringPlot: build.mutation<ClaimMonitoringPlotApiResponse, ClaimMonitoringPlotApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}/claim`,
        method: 'POST',
      }),
    }),
    getObservationMediaFile: build.query<GetObservationMediaFileApiResponse, GetObservationMediaFileApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}/media/${queryArg.fileId}`,
      }),
    }),
    getObservationMediaStream: build.query<GetObservationMediaStreamApiResponse, GetObservationMediaStreamApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}/media/${queryArg.fileId}/stream`,
      }),
    }),
    uploadOtherPlotMedia: build.mutation<UploadOtherPlotMediaApiResponse, UploadOtherPlotMediaApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}/otherMedia`,
        method: 'POST',
        body: queryArg.body,
        params: {
          caption: queryArg.caption,
          position: queryArg.position,
          type: queryArg['type'],
        },
      }),
    }),
    uploadPlotPhoto: build.mutation<UploadPlotPhotoApiResponse, UploadPlotPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}/photos`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    deletePlotPhoto: build.mutation<DeletePlotPhotoApiResponse, DeletePlotPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}/photos/${queryArg.fileId}`,
        method: 'DELETE',
      }),
    }),
    getPlotPhoto: build.query<GetPlotPhotoApiResponse, GetPlotPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}/photos/${queryArg.fileId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
    updatePlotPhoto: build.mutation<UpdatePlotPhotoApiResponse, UpdatePlotPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}/photos/${queryArg.fileId}`,
        method: 'PUT',
        body: queryArg.updatePlotPhotoRequestPayload,
      }),
    }),
    releaseMonitoringPlot: build.mutation<ReleaseMonitoringPlotApiResponse, ReleaseMonitoringPlotApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}/release`,
        method: 'POST',
      }),
    }),
    replaceObservationPlot: build.mutation<ReplaceObservationPlotApiResponse, ReplaceObservationPlotApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/plots/${queryArg.plotId}/replace`,
        method: 'POST',
        body: queryArg.replaceObservationPlotRequestPayload,
      }),
    }),
    getObservationResults: build.query<GetObservationResultsApiResponse, GetObservationResultsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/results`,
        params: {
          includePlants: queryArg.includePlants,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListObservationsApiResponse = /** status 200 OK */ ListObservationsResponsePayload;
export type ListObservationsApiArg = {
  /** Limit results to observations of planting sites in a specific organization. Ignored if plantingSiteId is specified. */
  organizationId?: number;
  /** Limit results to observations of a specific planting site. Required if organizationId is not specified. */
  plantingSiteId?: number;
};
export type ScheduleObservationApiResponse = /** status 200 OK */ ScheduleObservationResponsePayload;
export type ScheduleObservationApiArg = ScheduleObservationRequestPayload;
export type ListAdHocObservationsApiResponse = /** status 200 OK */ ListAdHocObservationsResponsePayload;
export type ListAdHocObservationsApiArg = {
  /** Limit results to observations of planting sites in a specific organization. Ignored if plantingSiteId is specified. */
  organizationId?: number;
  /** Limit results to observations of a specific planting site. Required if organizationId is not specified. */
  plantingSiteId?: number;
};
export type CompleteAdHocObservationApiResponse = /** status 200 OK */ CompleteAdHocObservationResponsePayload;
export type CompleteAdHocObservationApiArg = CompleteAdHocObservationRequestPayload;
export type ListAdHocObservationResultsApiResponse = /** status 200 OK */ ListAdHocObservationResultsResponsePayload;
export type ListAdHocObservationResultsApiArg = {
  organizationId?: number;
  plantingSiteId?: number;
  /** Whether to include plants in the results. Default to false */
  includePlants?: boolean;
  /** Maximum number of results to return. Results are always returned in order of completion time, newest first, so setting this to 1 will return the results of the most recently completed observation. */
  limit?: number;
};
export type ListObservationResultsApiResponse = /** status 200 OK */ ListObservationResultsResponsePayload;
export type ListObservationResultsApiArg = {
  organizationId?: number;
  plantingSiteId?: number;
  /** Whether to include plants in the results. Default to false */
  includePlants?: boolean;
  /** Maximum number of results to return. Results are always returned in order of completion time, newest first, so setting this to 1 will return the results of the most recently completed observation. */
  limit?: number;
};
export type ListObservationSummariesApiResponse = /** status 200 OK */ ListObservationSummariesResponsePayload;
export type ListObservationSummariesApiArg = {
  plantingSiteId: number;
  /** Maximum number of results to return. Results are always returned in order of observations completion time, newest first, so setting this to 1 will return the summaries including the most recently completed observation. */
  limit?: number;
};
export type GetObservationApiResponse = /** status 200 OK */ GetObservationResponsePayload;
export type GetObservationApiArg = number;
export type RescheduleObservationApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type RescheduleObservationApiArg = {
  observationId: number;
  rescheduleObservationRequestPayload: RescheduleObservationRequestPayload;
};
export type AbandonObservationApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type AbandonObservationApiArg = number;
export type GetObservationBirdnetResultsApiResponse =
  /** status 200 The requested operation succeeded. */ ListObservationBirdnetResultsResponsePayload;
export type GetObservationBirdnetResultsApiArg = {
  observationId: number;
  /** If present, only list results for this monitoring plot. */
  monitoringPlotId?: number;
  /** If present, only return information about the result for this video file. */
  fileId?: number;
};
export type MergeOtherSpeciesApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type MergeOtherSpeciesApiArg = {
  observationId: number;
  mergeOtherSpeciesRequestPayload: MergeOtherSpeciesRequestPayload;
};
export type ListAssignedPlotsApiResponse = /** status 200 OK */ Blob;
export type ListAssignedPlotsApiArg = number;
export type GetOneAssignedPlotApiResponse = /** status 200 OK */ GetOneAssignedPlotResponsePayload;
export type GetOneAssignedPlotApiArg = {
  observationId: number;
  plotId: number;
};
export type UpdateCompletedObservationPlotApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateCompletedObservationPlotApiArg = {
  observationId: number;
  plotId: number;
  updateObservationRequestPayload: UpdateObservationRequestPayload;
};
export type CompletePlotObservationApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type CompletePlotObservationApiArg = {
  observationId: number;
  plotId: number;
  completePlotObservationRequestPayload: CompletePlotObservationRequestPayload;
};
export type UpdatePlotObservationApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdatePlotObservationApiArg = {
  observationId: number;
  plotId: number;
  updatePlotObservationRequestPayload: UpdatePlotObservationRequestPayload;
};
export type ClaimMonitoringPlotApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type ClaimMonitoringPlotApiArg = {
  observationId: number;
  plotId: number;
};
export type GetObservationMediaFileApiResponse = /** status 200 The requested operation succeeded. */ Blob;
export type GetObservationMediaFileApiArg = {
  observationId: number;
  plotId: number;
  fileId: number;
};
export type GetObservationMediaStreamApiResponse =
  /** status 200 The requested operation succeeded. */ GetMuxStreamResponsePayload;
export type GetObservationMediaStreamApiArg = {
  observationId: number;
  plotId: number;
  fileId: number;
};
export type UploadOtherPlotMediaApiResponse = /** status 200 OK */ UploadPlotMediaResponsePayload;
export type UploadOtherPlotMediaApiArg = {
  observationId: number;
  plotId: number;
  caption?: string;
  position?: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  type?: 'Plot' | 'Quadrat' | 'Soil';
  body: {
    file: Blob;
    payload: UploadPlotMediaRequestPayload;
  };
};
export type UploadPlotPhotoApiResponse = /** status 200 OK */ UploadPlotMediaResponsePayload;
export type UploadPlotPhotoApiArg = {
  observationId: number;
  plotId: number;
  body: {
    file: Blob;
    payload: UploadPlotPhotoRequestPayload;
  };
};
export type DeletePlotPhotoApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeletePlotPhotoApiArg = {
  observationId: number;
  plotId: number;
  fileId: number;
};
export type GetPlotPhotoApiResponse = /** status 200 The photo was successfully retrieved. */ Blob;
export type GetPlotPhotoApiArg = {
  observationId: number;
  plotId: number;
  fileId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type UpdatePlotPhotoApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdatePlotPhotoApiArg = {
  observationId: number;
  plotId: number;
  fileId: number;
  updatePlotPhotoRequestPayload: UpdatePlotPhotoRequestPayload;
};
export type ReleaseMonitoringPlotApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type ReleaseMonitoringPlotApiArg = {
  observationId: number;
  plotId: number;
};
export type ReplaceObservationPlotApiResponse =
  /** status 200 The requested operation succeeded. */ ReplaceObservationPlotResponsePayload;
export type ReplaceObservationPlotApiArg = {
  observationId: number;
  plotId: number;
  replaceObservationPlotRequestPayload: ReplaceObservationPlotRequestPayload;
};
export type GetObservationResultsApiResponse = /** status 200 OK */ GetObservationResultsResponsePayload;
export type GetObservationResultsApiArg = {
  observationId: number;
  /** Whether to include plants in the results. Default to false */
  includePlants?: boolean;
};
export type ObservationPayload = {
  /** Date this observation is scheduled to end. */
  endDate: string;
  id: number;
  isAdHoc: boolean;
  /** Total number of monitoring plots that haven't been completed yet. Includes both claimed and unclaimed plots. */
  numIncompletePlots: number;
  /** Total number of monitoring plots in observation, regardless of status. */
  numPlots: number;
  /** Total number of monitoring plots that haven't been claimed yet. */
  numUnclaimedPlots: number;
  /** If this observation has already started, the version of the planting site that was used to place its monitoring plots. */
  plantingSiteHistoryId?: number;
  plantingSiteId: number;
  plantingSiteName: string;
  /** If specific substrata were requested for this observation, their IDs. */
  requestedSubstratumIds?: number[];
  /** Use requestedSubstratumIds instead. */
  requestedSubzoneIds?: number[];
  /** Date this observation started. */
  startDate: string;
  state: 'Upcoming' | 'InProgress' | 'Completed' | 'Overdue' | 'Abandoned';
  type: 'Monitoring' | 'Biomass Measurements';
};
export type SuccessOrError = 'ok' | 'error';
export type ListObservationsResponsePayload = {
  observations: ObservationPayload[];
  status: SuccessOrError;
  /** Total number of monitoring plots that haven't been completed yet across all current observations. */
  totalIncompletePlots: number;
  /** Total number of monitoring plots that haven't been claimed yet across all current observations. */
  totalUnclaimedPlots: number;
};
export type ScheduleObservationResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type ScheduleObservationRequestPayload = {
  /** The end date for this observation, should be limited to 2 months from the start date. */
  endDate: string;
  /** Which planting site this observation needs to be scheduled for. */
  plantingSiteId: number;
  /** The IDs of the substrata this observation should cover. */
  requestedSubstratumIds?: number[];
  /** Use requestedSubstratumIds instead */
  requestedSubzoneIds?: number[];
  /** The start date for this observation, can be up to a year from the date this schedule request occurs on. */
  startDate: string;
};
export type ListAdHocObservationsResponsePayload = {
  observations: ObservationPayload[];
  status: SuccessOrError;
};
export type CompleteAdHocObservationResponsePayload = {
  observationId: number;
  plotId: number;
  status: SuccessOrError;
};
export type NewBiomassQuadratSpeciesPayload = {
  abundancePercent: number;
  speciesId?: number;
  speciesName?: string;
};
export type NewBiomassQuadratPayload = {
  description?: string;
  position: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  species: NewBiomassQuadratSpeciesPayload[];
};
export type BiomassSpeciesPayload = {
  commonName?: string;
  isInvasive: boolean;
  isThreatened: boolean;
  scientificName?: string;
  speciesId?: number;
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
export type NewTreePayloadBase = {
  gpsCoordinates?: Point;
  growthForm: string;
  speciesId?: number;
  speciesName?: string;
};
export type NewShrubPayload = {
  growthForm: 'shrub';
} & NewTreePayloadBase & {
    description?: string;
    isDead: boolean;
    /** Measured in centimeters. */
    shrubDiameter: number;
  };
export type NewTrunkPayload = {
  description?: string;
  /** Measured in centimeters. */
  diameterAtBreastHeight: number;
  /** Measured in meters. */
  height?: number;
  isDead: boolean;
  /** Measured in meters. */
  pointOfMeasurement: number;
};
export type NewTreeWithTrunksPayload = {
  growthForm: 'tree';
} & NewTreePayloadBase & {
    trunks: NewTrunkPayload[];
  };
export type NewBiomassMeasurementPayload = {
  description?: string;
  forestType: 'Terrestrial' | 'Mangrove';
  herbaceousCoverPercent: number;
  /** Required for Mangrove forest. */
  ph?: number;
  quadrats: NewBiomassQuadratPayload[];
  /** Measured in ppt. Required for Mangrove forest. */
  salinity?: number;
  smallTreeCountHigh: number;
  smallTreeCountLow: number;
  soilAssessment: string;
  /** List of herbaceous and tree species. Includes all recorded quadrat and additional herbaceous species and recorded tree species. Species not assigned to a quadrat or recorded trees will be saved as an additional herbaceous species. */
  species: BiomassSpeciesPayload[];
  /** Low or high tide. Required for Mangrove forest. */
  tide?: 'Low' | 'High';
  /** Time when ide is observed. Required for Mangrove forest. */
  tideTime?: string;
  trees: (NewShrubPayload | NewTreeWithTrunksPayload)[];
  /** Measured in centimeters. Required for Mangrove forest. */
  waterDepth?: number;
};
export type RecordedPlantPayload = {
  certainty: 'Known' | 'Other' | 'Unknown';
  /** GPS coordinates where plant was observed. */
  gpsCoordinates: Point;
  id?: number;
  /** Required if certainty is Known. Ignored if certainty is Other or Unknown. */
  speciesId?: number;
  /** If certainty is Other, the optional user-supplied name of the species. Ignored if certainty is Known or Unknown. */
  speciesName?: string;
  status: 'Live' | 'Dead' | 'Existing';
};
export type CompleteAdHocObservationRequestPayload = {
  /** Biomass Measurements. Required for biomass measurement observations */
  biomassMeasurements?: NewBiomassMeasurementPayload;
  conditions: (
    | 'AnimalDamage'
    | 'FastGrowth'
    | 'FavorableWeather'
    | 'Fungus'
    | 'Pests'
    | 'SeedProduction'
    | 'UnfavorableWeather'
    | 'NaturalRegenerationWoody'
    | 'Logging'
    | 'Fire'
    | 'Mining'
    | 'Grazing'
    | 'Infrastructure'
    | 'ElectricalLines'
    | 'SoilErosion'
    | 'DifficultAccessibility'
    | 'Contamination'
    | 'SteepSlope'
    | 'WaterBodies'
  )[];
  notes?: string;
  /** Observation type for this observation. */
  observationType: 'Monitoring' | 'Biomass Measurements';
  /** Date and time the observation was performed in the field. */
  observedTime: string;
  /** Which planting site this observation needs to be scheduled for. */
  plantingSiteId: number;
  /** Recorded plants. Required for monitoring observations. */
  plants?: RecordedPlantPayload[];
  /** GPS coordinates for the South West corner of the ad-hoc plot. */
  swCorner: Point;
};
export type Polygon = {
  type: 'Polygon';
} & GeometryBase & {
    coordinates: number[][][];
    type: 'Polygon';
  };
export type ObservationMonitoringPlotCoordinatesPayload = {
  gpsCoordinates: Point;
  position: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
};
export type ObservationMonitoringPlotMediaPayload = {
  caption?: string;
  fileId: number;
  gpsCoordinates?: Point;
  /** If true, this file was uploaded as part of the original observation. If false, it was uploaded later. */
  isOriginal: boolean;
  mediaKind: 'Photo' | 'Video';
  position?: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  type: 'Plot' | 'Quadrat' | 'Soil';
};
export type ObservationSpeciesResultsPayload = {
  certainty: 'Known' | 'Other' | 'Unknown';
  /** Number of live plants observed in permanent plots in this observation, not including existing plants. 0 if ths is a plot-level result for a temporary monitoring plot. */
  permanentLive: number;
  /** If certainty is Known, the ID of the species. Null if certainty is Other or Unknown. */
  speciesId?: number;
  /** If certainty is Other, the user-supplied name of the species. Null if certainty is Known or Unknown. */
  speciesName?: string;
  /** Percentage of plants in permanent monitoring plots that have survived since the t0 point. If there are no permanent monitoring plots (or if this is a plot-level result for a temporary monitoring plot) this will be null. */
  survivalRate?: number;
  /** Number of dead plants observed in this observation. */
  totalDead: number;
  /** Number of existing plants observed in this observation. */
  totalExisting: number;
  /** Number of live plants observed in this observation, not including existing plants. */
  totalLive: number;
  /** Total number of live and existing plants of this species. */
  totalPlants: number;
};
export type ObservationMonitoringPlotResultsPayload = {
  boundary: Polygon;
  claimedByName?: string;
  claimedByUserId?: number;
  completedTime?: string;
  conditions: (
    | 'AnimalDamage'
    | 'FastGrowth'
    | 'FavorableWeather'
    | 'Fungus'
    | 'Pests'
    | 'SeedProduction'
    | 'UnfavorableWeather'
    | 'NaturalRegenerationWoody'
    | 'Logging'
    | 'Fire'
    | 'Mining'
    | 'Grazing'
    | 'Infrastructure'
    | 'ElectricalLines'
    | 'SoilErosion'
    | 'DifficultAccessibility'
    | 'Contamination'
    | 'SteepSlope'
    | 'WaterBodies'
  )[];
  /** Observed coordinates, if any, up to one per position. */
  coordinates: ObservationMonitoringPlotCoordinatesPayload[];
  elevationMeters?: number;
  isAdHoc: boolean;
  /** True if this was a permanent monitoring plot in this observation. Clients should not assume that the set of permanent monitoring plots is the same in all observations; the number of permanent monitoring plots can be adjusted over time based on observation results. */
  isPermanent: boolean;
  media: ObservationMonitoringPlotMediaPayload[];
  monitoringPlotId: number;
  /** Full name of this monitoring plot, including stratum and substratum prefixes. */
  monitoringPlotName: string;
  /** Organization-unique number of this monitoring plot. */
  monitoringPlotNumber: number;
  notes?: string;
  /** IDs of any newer monitoring plots that overlap with this one. */
  overlappedByPlotIds: number[];
  /** IDs of any older monitoring plots this one overlaps with. */
  overlapsWithPlotIds: number[];
  photos: ObservationMonitoringPlotMediaPayload[];
  /** Number of live plants per hectare. */
  plantingDensity: number;
  plants?: RecordedPlantPayload[];
  /** Length of each edge of the monitoring plot in meters. */
  sizeMeters: number;
  species: ObservationSpeciesResultsPayload[];
  status: 'Unclaimed' | 'Claimed' | 'Completed' | 'Not Observed';
  /** If this is a permanent monitoring plot in this observation, percentage of plants that have survived since t0 data. */
  survivalRate?: number;
  /** Total number of plants recorded. Includes all plants, regardless of live/dead status or species. */
  totalPlants: number;
  /** Total number of species observed, not counting dead plants. Includes plants with Known and Other certainties. In the case of Other, each distinct user-supplied species name is counted as a separate species for purposes of this total. */
  totalSpecies: number;
  /** Information about plants of unknown species, if any were observed. */
  unknownSpecies?: ObservationSpeciesResultsPayload;
};
export type ExistingBiomassQuadratSpeciesPayload = {
  abundancePercent: number;
  isInvasive: boolean;
  isThreatened: boolean;
  speciesId?: number;
  speciesName?: string;
};
export type ExistingBiomassQuadratPayload = {
  description?: string;
  position: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  species: ExistingBiomassQuadratSpeciesPayload[];
};
export type ExistingTreePayload = {
  description?: string;
  /** Measured in centimeters. */
  diameterAtBreastHeight?: number;
  gpsCoordinates?: Point;
  /** Measured in meters. */
  height?: number;
  id: number;
  isDead: boolean;
  isInvasive: boolean;
  isThreatened: boolean;
  /** Measured in meters. */
  pointOfMeasurement?: number;
  shrubDiameter?: number;
  speciesId?: number;
  speciesName?: string;
  treeGrowthForm: 'Tree' | 'Shrub' | 'Trunk';
  treeNumber: number;
  trunkNumber: number;
};
export type ExistingBiomassMeasurementPayload = {
  additionalSpecies: BiomassSpeciesPayload[];
  description?: string;
  forestType: 'Terrestrial' | 'Mangrove';
  herbaceousCoverPercent: number;
  ph?: number;
  quadrats: ExistingBiomassQuadratPayload[];
  /** Measured in ppt */
  salinity?: number;
  smallTreeCountHigh: number;
  smallTreeCountLow: number;
  soilAssessment: string;
  /** Low or high tide. */
  tide?: 'Low' | 'High';
  /** Time when ide is observed. */
  tideTime?: string;
  treeSpeciesCount: number;
  trees: ExistingTreePayload[];
  /** Measured in centimeters. */
  waterDepth?: number;
};
export type ObservationPlantingSubzoneResultsPayload = {
  areaHa: number;
  completedTime?: string;
  estimatedPlants?: number;
  monitoringPlots: ObservationMonitoringPlotResultsPayload[];
  name: string;
  plantingDensity: number;
  plantingDensityStdDev?: number;
  plantingSubzoneId?: number;
  species: ObservationSpeciesResultsPayload[];
  survivalRate?: number;
  survivalRateStdDev?: number;
  totalPlants: number;
  totalSpecies: number;
};
export type ObservationPlantingZoneResultsPayload = {
  areaHa: number;
  completedTime?: string;
  estimatedPlants?: number;
  name: string;
  plantingDensity: number;
  plantingDensityStdDev?: number;
  plantingSubzones: ObservationPlantingSubzoneResultsPayload[];
  plantingZoneId?: number;
  species: ObservationSpeciesResultsPayload[];
  survivalRate?: number;
  survivalRateStdDev?: number;
  totalPlants: number;
  totalSpecies: number;
};
export type ObservationSubstratumResultsPayload = {
  /** Area of this substratum in hectares. */
  areaHa: number;
  completedTime?: string;
  /** Estimated number of plants in substratum based on estimated planting density and substratum area. Only present if the substratum has completed planting. */
  estimatedPlants?: number;
  /** Percentage of plants of all species that were dead in this substratum's permanent monitoring plots. */
  monitoringPlots: ObservationMonitoringPlotResultsPayload[];
  name: string;
  /** Estimated planting density for the substratum based on the observed planting densities of monitoring plots. */
  plantingDensity: number;
  plantingDensityStdDev?: number;
  species: ObservationSpeciesResultsPayload[];
  /** ID of the substratum. Absent if the substratum was deleted after the observation. */
  substratumId?: number;
  survivalRate?: number;
  survivalRateStdDev?: number;
  /** Total number of plants recorded. Includes all plants, regardless of live/dead status or species. */
  totalPlants: number;
  /** Total number of species observed, not counting dead plants. Includes plants with Known and Other certainties. In the case of Other, each distinct user-supplied species name is counted as a separate species for purposes of this total. */
  totalSpecies: number;
};
export type ObservationStratumResultsPayload = {
  /** Area of this stratum in hectares. */
  areaHa: number;
  completedTime?: string;
  /** Estimated number of plants in stratum based on estimated planting density and stratum area. Only present if all the substrata in the stratum have been marked as having completed planting. */
  estimatedPlants?: number;
  name: string;
  /** Estimated planting density for the stratum based on the observed planting densities of monitoring plots. */
  plantingDensity: number;
  plantingDensityStdDev?: number;
  species: ObservationSpeciesResultsPayload[];
  /** ID of the stratum. Absent if the stratum was deleted after the observation. */
  stratumId?: number;
  /** Percentage of plants of all species in this stratum's permanent monitoring plots that have survived since the t0 point. */
  substrata: ObservationSubstratumResultsPayload[];
  survivalRate?: number;
  survivalRateStdDev?: number;
  /** Total number of plants recorded. Includes all plants, regardless of live/dead status or species. */
  totalPlants: number;
  /** Total number of species observed, not counting dead plants. Includes plants with Known and Other certainties. In the case of Other, each distinct user-supplied species name is counted as a separate species for purposes of this total. */
  totalSpecies: number;
};
export type ObservationResultsPayload = {
  adHocPlot?: ObservationMonitoringPlotResultsPayload;
  areaHa?: number;
  biomassMeasurements?: ExistingBiomassMeasurementPayload;
  completedTime?: string;
  /** Estimated total number of live plants at the site, based on the estimated planting density and site size. Only present if all the substrata in the site have been marked as having completed planting. */
  estimatedPlants?: number;
  /** Percentage of plants of all species that were dead in this site's permanent monitoring plots. */
  isAdHoc: boolean;
  observationId: number;
  /** Estimated planting density for the site, based on the observed planting densities of monitoring plots. */
  plantingDensity: number;
  plantingDensityStdDev?: number;
  plantingSiteHistoryId?: number;
  plantingSiteId: number;
  /** Use strata instead */
  plantingZones: ObservationPlantingZoneResultsPayload[];
  species: ObservationSpeciesResultsPayload[];
  startDate: string;
  state: 'Upcoming' | 'InProgress' | 'Completed' | 'Overdue' | 'Abandoned';
  strata: ObservationStratumResultsPayload[];
  survivalRate?: number;
  survivalRateStdDev?: number;
  totalPlants: number;
  totalSpecies: number;
  type: 'Monitoring' | 'Biomass Measurements';
};
export type ListAdHocObservationResultsResponsePayload = {
  observations: ObservationResultsPayload[];
  status: SuccessOrError;
};
export type ListObservationResultsResponsePayload = {
  observations: ObservationResultsPayload[];
  status: SuccessOrError;
};
export type PlantingZoneObservationSummaryPayload = {
  areaHa: number;
  earliestObservationTime: string;
  estimatedPlants?: number;
  latestObservationTime: string;
  plantingDensity: number;
  plantingDensityStdDev?: number;
  plantingSubzones: ObservationPlantingSubzoneResultsPayload[];
  plantingZoneId: number;
  species: ObservationSpeciesResultsPayload[];
  substrata: ObservationSubstratumResultsPayload[];
  survivalRate?: number;
  survivalRateStdDev?: number;
  totalPlants: number;
  totalSpecies: number;
};
export type StratumObservationSummaryPayload = {
  /** Area of this stratum in hectares. */
  areaHa: number;
  /** The earliest time of the observations used in this summary. */
  earliestObservationTime: string;
  /** Estimated number of plants in stratum based on estimated planting density and stratum area. Only present if all the substrata in the stratum have been marked as having completed planting. */
  estimatedPlants?: number;
  /** The latest time of the observations used in this summary. */
  latestObservationTime: string;
  /** Estimated planting density for the stratum based on the observed planting densities of monitoring plots. */
  plantingDensity: number;
  plantingDensityStdDev?: number;
  /** Combined list of observed species and their statuses from the latest observation of each substratum. */
  species: ObservationSpeciesResultsPayload[];
  stratumId: number;
  /** List of substratum observations used in this summary. */
  substrata: ObservationSubstratumResultsPayload[];
  /** Percentage of plants of all species in this stratum's permanent monitoring plots that have survived since the t0 point. */
  survivalRate?: number;
  survivalRateStdDev?: number;
  /** Total number of plants recorded from the latest observations of each substratum. Includes all plants, regardless of live/dead status or species. */
  totalPlants: number;
  /** Total number of species observed, not counting dead plants. Includes plants with Known and Other certainties. In the case of Other, each distinct user-supplied species name is counted as a separate species for purposes of this total. */
  totalSpecies: number;
};
export type PlantingSiteObservationSummaryPayload = {
  /** The earliest time of the observations used in this summary. */
  earliestObservationTime: string;
  /** Estimated total number of live plants at the site, based on the estimated planting density and site size. Only present if all the substrata in the site have been marked as having completed planting. */
  estimatedPlants?: number;
  /** The latest time of the observations used in this summary. */
  latestObservationTime: string;
  /** Estimated planting density for the site, based on the observed planting densities of monitoring plots. */
  plantingDensity: number;
  plantingDensityStdDev?: number;
  plantingSiteId: number;
  /** Use strata instead */
  plantingZones: PlantingZoneObservationSummaryPayload[];
  /** Combined list of observed species and their statuses from the latest observation of each substratum within each stratum. */
  species: ObservationSpeciesResultsPayload[];
  strata: StratumObservationSummaryPayload[];
  /** Percentage of plants of all species in this site's permanent monitoring plots that have survived since the t0 point. */
  survivalRate?: number;
  survivalRateStdDev?: number;
  /** Total number of plants recorded from the latest observations of each substratum within each stratum. Includes all plants, regardless of live/dead status or species. */
  totalPlants: number;
  /** Total number of species observed, not counting dead plants. Includes plants with Known and Other certainties. In the case of Other, each distinct user-supplied species name is counted as a separate species for purposes of this total. */
  totalSpecies: number;
};
export type ListObservationSummariesResponsePayload = {
  status: SuccessOrError;
  /** History of rollup summaries of planting site observations in order of observation time, latest first.  */
  summaries: PlantingSiteObservationSummaryPayload[];
};
export type GetObservationResponsePayload = {
  observation: ObservationPayload;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type RescheduleObservationRequestPayload = {
  /** The end date for this observation, should be limited to 2 months from the start date . */
  endDate: string;
  /** The start date for this observation, can be up to a year from the date this schedule request occurs on. */
  startDate: string;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type ObservationBirdnetResultPayload = {
  fileId: number;
  monitoringPlotId: number;
  resultsStorageUrl?: string;
  status: 'Preparing' | 'Ready' | 'Errored';
};
export type ListObservationBirdnetResultsResponsePayload = {
  results: ObservationBirdnetResultPayload[];
  status: SuccessOrError;
};
export type MergeOtherSpeciesRequestPayload = {
  /** Name of the species of certainty Other whose recorded plants should be updated to refer to the known species. */
  otherSpeciesName: string;
  /** ID of the existing species that the Other species' recorded plants should be merged into. */
  speciesId: number;
};
export type GeometryCollection = {
  type: 'GeometryCollection';
} & GeometryBase & {
    geometries: object[];
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
export type MultiPolygon = {
  type: 'MultiPolygon';
} & GeometryBase & {
    coordinates: number[][][][];
    type: 'MultiPolygon';
  };
export type Geometry = GeometryCollection | LineString | MultiLineString | MultiPoint | MultiPolygon | Point | Polygon;
export type AssignedPlotPayload = {
  boundary: Geometry;
  claimedByName?: string;
  claimedByUserId?: number;
  completedByName?: string;
  completedByUserId?: number;
  completedTime?: string;
  elevationMeters?: number;
  /** True if this is the first observation to include the monitoring plot. */
  isFirstObservation: boolean;
  isPermanent: boolean;
  observationId: number;
  /** Use substratumId instead */
  plantingSubzoneId?: number;
  /** Use substratumName instead */
  plantingSubzoneName: string;
  /** Use stratumName instead */
  plantingZoneName: string;
  plotId: number;
  plotName: string;
  plotNumber: number;
  /** Length of each edge of the monitoring plot in meters. */
  sizeMeters: number;
  stratumName: string;
  substratumId?: number;
  substratumName: string;
};
export type GetOneAssignedPlotResponsePayload = {
  plot: AssignedPlotPayload;
  status: SuccessOrError;
};
export type ObservationUpdateOperationPayloadBase = {
  type: string;
};
export type BiomassSpeciesUpdateOperationPayload = {
  type: 'BiomassSpecies';
} & ObservationUpdateOperationPayloadBase & {
    isInvasive?: boolean;
    isThreatened?: boolean;
    /** Name of species to update. Either this or speciesId must be present. */
    scientificName?: string;
    /** ID of species to update. Either this or scientificName must be present. */
    speciesId?: number;
  };
export type BiomassUpdateOperationPayload = {
  type: 'Biomass';
} & ObservationUpdateOperationPayloadBase & {
    description?: string;
    forestType?: 'Terrestrial' | 'Mangrove';
    herbaceousCoverPercent?: number;
    ph?: number;
    salinity?: number;
    smallTreeCountHigh?: number;
    smallTreeCountLow?: number;
    soilAssessment?: string;
    tide?: 'Low' | 'High';
    tideTime?: string;
    waterDepth?: number;
  };
export type MonitoringSpeciesUpdateOperationPayload = {
  type: 'MonitoringSpecies';
} & ObservationUpdateOperationPayloadBase & {
    certainty: 'Known' | 'Other' | 'Unknown';
    /** Required if certainty is Known. Ignored if certainty is Other or Unknown. */
    speciesId?: number;
    /** Required if certainty is Other. Ignored if certainty is Known or Unknown. */
    speciesName?: string;
    totalDead?: number;
    totalExisting?: number;
    totalLive?: number;
  };
export type ObservationPlotUpdateOperationPayload = {
  type: 'ObservationPlot';
} & ObservationUpdateOperationPayloadBase & {
    conditions?: (
      | 'AnimalDamage'
      | 'FastGrowth'
      | 'FavorableWeather'
      | 'Fungus'
      | 'Pests'
      | 'SeedProduction'
      | 'UnfavorableWeather'
      | 'NaturalRegenerationWoody'
      | 'Logging'
      | 'Fire'
      | 'Mining'
      | 'Grazing'
      | 'Infrastructure'
      | 'ElectricalLines'
      | 'SoilErosion'
      | 'DifficultAccessibility'
      | 'Contamination'
      | 'SteepSlope'
      | 'WaterBodies'
    )[];
    notes?: string;
  };
export type QuadratSpeciesUpdateOperationPayload = {
  type: 'QuadratSpecies';
} & ObservationUpdateOperationPayloadBase & {
    abundance?: number;
    position: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
    /** Name of species to update. Either this or speciesId must be present. */
    scientificName?: string;
    /** ID of species to update. Either this or scientificName must be present. */
    speciesId?: number;
  };
export type QuadratUpdateOperationPayload = {
  type: 'Quadrat';
} & ObservationUpdateOperationPayloadBase & {
    description?: string;
    position: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  };
export type RecordedTreeUpdateOperationPayload = {
  type: 'RecordedTree';
} & ObservationUpdateOperationPayloadBase & {
    description?: string;
    /** Only valid for Tree and Trunk growth forms. */
    diameterAtBreastHeight?: number;
    /** Only valid for Tree and Trunk growth forms. */
    height?: number;
    isDead?: boolean;
    /** Only valid for Tree and Trunk growth forms. */
    pointOfMeasurement?: number;
    /** ID of tree to update. */
    recordedTreeId: number;
    /** Only valid for Shrub growth form. */
    shrubDiameter?: number;
  };
export type UpdateObservationRequestPayload = {
  /** List of changes to make to different parts of the observation. Changes are all-or-nothing; if any of them fails, none of them is applied. */
  updates: (
    | BiomassSpeciesUpdateOperationPayload
    | BiomassUpdateOperationPayload
    | MonitoringSpeciesUpdateOperationPayload
    | ObservationPlotUpdateOperationPayload
    | QuadratSpeciesUpdateOperationPayload
    | QuadratUpdateOperationPayload
    | RecordedTreeUpdateOperationPayload
  )[];
};
export type CompletePlotObservationRequestPayload = {
  conditions: (
    | 'AnimalDamage'
    | 'FastGrowth'
    | 'FavorableWeather'
    | 'Fungus'
    | 'Pests'
    | 'SeedProduction'
    | 'UnfavorableWeather'
    | 'NaturalRegenerationWoody'
    | 'Logging'
    | 'Fire'
    | 'Mining'
    | 'Grazing'
    | 'Infrastructure'
    | 'ElectricalLines'
    | 'SoilErosion'
    | 'DifficultAccessibility'
    | 'Contamination'
    | 'SteepSlope'
    | 'WaterBodies'
  )[];
  notes?: string;
  /** Date and time the observation was performed in the field. */
  observedTime: string;
  plants: RecordedPlantPayload[];
};
export type UpdatePlotObservationRequestPayload = {
  /** Observed coordinates, if any, up to one per position. */
  coordinates: ObservationMonitoringPlotCoordinatesPayload[];
};
export type GetMuxStreamResponsePayload = {
  playbackId: string;
  playbackToken: string;
  status: SuccessOrError;
};
export type UploadPlotMediaResponsePayload = {
  fileId: number;
  status: SuccessOrError;
};
export type UploadPlotMediaRequestPayload = {
  caption?: string;
  position?: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  /** Type of subject the uploaded file depicts. */
  type?: 'Plot' | 'Quadrat' | 'Soil';
};
export type UploadPlotPhotoRequestPayload = {
  caption?: string;
  gpsCoordinates: Point;
  position?: 'SouthwestCorner' | 'SoutheastCorner' | 'NortheastCorner' | 'NorthwestCorner';
  /** Type of observation plot photo. */
  type?: 'Plot' | 'Quadrat' | 'Soil';
};
export type UpdatePlotPhotoRequestPayload = {
  caption?: string;
};
export type ReplaceObservationPlotResponsePayload = {
  /** IDs of monitoring plots that were added to the observation. Empty if no plots were added. */
  addedMonitoringPlotIds: number[];
  /** IDs of monitoring plots that were removed from the observation. Will usually include the requested plot ID, but may be empty if the replacement request couldn't be satisfied. */
  removedMonitoringPlotIds: number[];
  status: SuccessOrError;
};
export type ReplaceObservationPlotRequestPayload = {
  duration: 'Temporary' | 'LongTerm';
  justification: string;
};
export type GetObservationResultsResponsePayload = {
  observation: ObservationResultsPayload;
  status: SuccessOrError;
};
export const {
  useListObservationsQuery,
  useLazyListObservationsQuery,
  useScheduleObservationMutation,
  useListAdHocObservationsQuery,
  useLazyListAdHocObservationsQuery,
  useCompleteAdHocObservationMutation,
  useListAdHocObservationResultsQuery,
  useLazyListAdHocObservationResultsQuery,
  useListObservationResultsQuery,
  useLazyListObservationResultsQuery,
  useListObservationSummariesQuery,
  useLazyListObservationSummariesQuery,
  useGetObservationQuery,
  useLazyGetObservationQuery,
  useRescheduleObservationMutation,
  useAbandonObservationMutation,
  useGetObservationBirdnetResultsQuery,
  useLazyGetObservationBirdnetResultsQuery,
  useMergeOtherSpeciesMutation,
  useListAssignedPlotsQuery,
  useLazyListAssignedPlotsQuery,
  useGetOneAssignedPlotQuery,
  useLazyGetOneAssignedPlotQuery,
  useUpdateCompletedObservationPlotMutation,
  useCompletePlotObservationMutation,
  useUpdatePlotObservationMutation,
  useClaimMonitoringPlotMutation,
  useGetObservationMediaFileQuery,
  useLazyGetObservationMediaFileQuery,
  useGetObservationMediaStreamQuery,
  useLazyGetObservationMediaStreamQuery,
  useUploadOtherPlotMediaMutation,
  useUploadPlotPhotoMutation,
  useDeletePlotPhotoMutation,
  useGetPlotPhotoQuery,
  useLazyGetPlotPhotoQuery,
  useUpdatePlotPhotoMutation,
  useReleaseMonitoringPlotMutation,
  useReplaceObservationPlotMutation,
  useGetObservationResultsQuery,
  useLazyGetObservationResultsQuery,
} = injectedRtkApi;
