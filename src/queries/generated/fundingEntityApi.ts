import { emptyApi as api } from "../emptyApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    funderListActivities: build.query<
      FunderListActivitiesApiResponse,
      FunderListActivitiesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/activities`,
        params: {
          projectId: queryArg.projectId,
          includeMedia: queryArg.includeMedia,
        },
      }),
    }),
    getActivityMedia1: build.query<
      GetActivityMedia1ApiResponse,
      GetActivityMedia1ApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/activities/${queryArg.activityId}/media/${queryArg.fileId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
    getActivityMediaStream: build.query<
      GetActivityMediaStreamApiResponse,
      GetActivityMediaStreamApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/activities/${queryArg.activityId}/media/${queryArg.fileId}/stream`,
      }),
    }),
    listFundingEntities: build.query<
      ListFundingEntitiesApiResponse,
      ListFundingEntitiesApiArg
    >({
      query: () => ({ url: `/api/v1/funder/entities` }),
    }),
    createFundingEntity: build.mutation<
      CreateFundingEntityApiResponse,
      CreateFundingEntityApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities`,
        method: "POST",
        body: queryArg.createFundingEntityRequestPayload,
      }),
    }),
    getProjectFundingEntities: build.query<
      GetProjectFundingEntitiesApiResponse,
      GetProjectFundingEntitiesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/projects/${queryArg.projectId}`,
      }),
    }),
    getFundingEntity1: build.query<
      GetFundingEntity1ApiResponse,
      GetFundingEntity1ApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/users/${queryArg.userId}`,
      }),
    }),
    deleteFundingEntity: build.mutation<
      DeleteFundingEntityApiResponse,
      DeleteFundingEntityApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/${queryArg.fundingEntityId}`,
        method: "DELETE",
      }),
    }),
    getFundingEntity: build.query<
      GetFundingEntityApiResponse,
      GetFundingEntityApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/${queryArg.fundingEntityId}`,
      }),
    }),
    updateFundingEntity: build.mutation<
      UpdateFundingEntityApiResponse,
      UpdateFundingEntityApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/${queryArg.fundingEntityId}`,
        method: "PUT",
        body: queryArg.updateFundingEntityRequestPayload,
      }),
    }),
    removeFunder: build.mutation<RemoveFunderApiResponse, RemoveFunderApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/${queryArg.fundingEntityId}/users`,
        method: "DELETE",
        body: queryArg.deleteFundersRequestPayload,
      }),
    }),
    getFunders: build.query<GetFundersApiResponse, GetFundersApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/${queryArg.fundingEntityId}/users`,
      }),
    }),
    inviteFunder: build.mutation<InviteFunderApiResponse, InviteFunderApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/${queryArg.fundingEntityId}/users`,
        method: "POST",
        body: queryArg.inviteFundingEntityFunderRequestPayload,
      }),
    }),
    getAllProjects: build.query<
      GetAllProjectsApiResponse,
      GetAllProjectsApiArg
    >({
      query: () => ({ url: `/api/v1/funder/projects` }),
    }),
    getProjects: build.query<GetProjectsApiResponse, GetProjectsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/projects/${queryArg.projectIds}`,
      }),
    }),
    publishProjectProfile: build.mutation<
      PublishProjectProfileApiResponse,
      PublishProjectProfileApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/projects/${queryArg.projectId}`,
        method: "POST",
        body: queryArg.publishProjectProfileRequestPayload,
      }),
    }),
    listPublishedReports: build.query<
      ListPublishedReportsApiResponse,
      ListPublishedReportsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/reports/projects/${queryArg.projectId}`,
      }),
    }),
    getPublishedReportPhoto: build.query<
      GetPublishedReportPhotoApiResponse,
      GetPublishedReportPhotoApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/funder/reports/${queryArg.reportId}/photos/${queryArg.fileId}`,
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
export type FunderListActivitiesApiResponse =
  /** status 200 OK */ FunderListActivitiesResponsePayload;
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
export type GetActivityMediaStreamApiResponse =
  /** status 200 OK */ GetMuxStreamResponsePayload;
export type GetActivityMediaStreamApiArg = {
  activityId: number;
  fileId: number;
};
export type ListFundingEntitiesApiResponse =
  /** status 200 The requested operation succeeded. */ ListFundingEntitiesPayload;
export type ListFundingEntitiesApiArg = void;
export type CreateFundingEntityApiResponse =
  /** status 200 OK */ GetFundingEntityResponsePayload;
export type CreateFundingEntityApiArg = {
  createFundingEntityRequestPayload: CreateFundingEntityRequestPayload;
};
export type GetProjectFundingEntitiesApiResponse =
  /** status 200 OK */ ListFundingEntitiesPayload;
export type GetProjectFundingEntitiesApiArg = {
  projectId: number;
};
export type GetFundingEntity1ApiResponse =
  /** status 200 OK */ GetFundingEntityResponsePayload;
export type GetFundingEntity1ApiArg = {
  userId: number;
};
export type DeleteFundingEntityApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteFundingEntityApiArg = {
  fundingEntityId: number;
};
export type GetFundingEntityApiResponse =
  /** status 200 The requested operation succeeded. */ GetFundingEntityResponsePayload;
export type GetFundingEntityApiArg = {
  fundingEntityId: number;
};
export type UpdateFundingEntityApiResponse =
  /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateFundingEntityApiArg = {
  fundingEntityId: number;
  updateFundingEntityRequestPayload: UpdateFundingEntityRequestPayload;
};
export type RemoveFunderApiResponse =
  /** status 200 OK */ SimpleSuccessResponsePayload;
export type RemoveFunderApiArg = {
  fundingEntityId: number;
  deleteFundersRequestPayload: DeleteFundersRequestPayload;
};
export type GetFundersApiResponse =
  /** status 200 OK */ GetFundersResponsePayload;
export type GetFundersApiArg = {
  fundingEntityId: number;
};
export type InviteFunderApiResponse =
  /** status 200 OK */ InviteFundingEntityFunderResponsePayload;
export type InviteFunderApiArg = {
  fundingEntityId: number;
  inviteFundingEntityFunderRequestPayload: InviteFundingEntityFunderRequestPayload;
};
export type GetAllProjectsApiResponse =
  /** status 200 The requested operation succeeded. */ GetPublishedProjectResponsePayload;
export type GetAllProjectsApiArg = void;
export type GetProjectsApiResponse =
  /** status 200 The requested operation succeeded. */ GetFundingProjectResponsePayload;
export type GetProjectsApiArg = {
  projectIds: number[];
};
export type PublishProjectProfileApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type PublishProjectProfileApiArg = {
  projectId: number;
  publishProjectProfileRequestPayload: PublishProjectProfileRequestPayload;
};
export type ListPublishedReportsApiResponse =
  /** status 200 The requested operation succeeded. */ ListPublishedReportsResponsePayload;
export type ListPublishedReportsApiArg = {
  projectId: number;
};
export type GetPublishedReportPhotoApiResponse =
  /** status 200 The photo was successfully retrieved. */ Blob;
export type GetPublishedReportPhotoApiArg = {
  reportId: number;
  fileId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type CrsProperties = {
  /** Name of the coordinate reference system. This must be in the form EPSG:nnnn where nnnn is the numeric identifier of a coordinate system in the EPSG dataset. The default is Longitude/Latitude EPSG:4326, which is the coordinate system +for GeoJSON. */
  name: string;
};
export type Crs = {
  properties: CrsProperties;
  type: "name";
};
export type GeometryBase = {
  crs?: Crs;
  type:
    | "Point"
    | "LineString"
    | "Polygon"
    | "MultiPoint"
    | "MultiLineString"
    | "MultiPolygon"
    | "GeometryCollection";
};
export type Point = {
  type: "Point";
} & GeometryBase & {
    /** A single position consisting of X and Y values in the coordinate system specified by the crs field. */
    coordinates: number[];
    type: "Point";
  };
export type FunderActivityMediaFilePayload = {
  caption?: string;
  capturedDate: string;
  fileId: number;
  fileName: string;
  geolocation?: Point;
  isCoverPhoto: boolean;
  isHiddenOnMap: boolean;
  listPosition: number;
  type: "Photo" | "Video";
};
export type FunderActivityPayload = {
  date: string;
  description?: string;
  id: number;
  isHighlight: boolean;
  media: FunderActivityMediaFilePayload[];
  type:
    | "Seed Collection"
    | "Nursery and Propagule Operations"
    | "Planting"
    | "Monitoring"
    | "Site Visit"
    | "Social Impact"
    | "Drone Flight"
    | "Others";
};
export type SuccessOrError = "ok" | "error";
export type FunderListActivitiesResponsePayload = {
  activities: FunderActivityPayload[];
  status: SuccessOrError;
};
export type GetMuxStreamResponsePayload = {
  playbackId: string;
  playbackToken: string;
  status: SuccessOrError;
};
export type FundingProjectPayload = {
  dealName: string;
  projectId: number;
};
export type FundingEntityPayload = {
  id: number;
  name: string;
  projects: FundingProjectPayload[];
};
export type ListFundingEntitiesPayload = {
  fundingEntities: FundingEntityPayload[];
  status: SuccessOrError;
};
export type GetFundingEntityResponsePayload = {
  fundingEntity: FundingEntityPayload;
  status: SuccessOrError;
};
export type CreateFundingEntityRequestPayload = {
  name: string;
  projects?: number[];
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
export type UpdateFundingEntityRequestPayload = {
  name: string;
  projects?: number[];
};
export type DeleteFundersRequestPayload = {
  userIds: number[];
};
export type FunderPayload = {
  accountCreated: boolean;
  createdTime: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userId: number;
};
export type GetFundersResponsePayload = {
  funders: FunderPayload[];
  status: SuccessOrError;
};
export type InviteFundingEntityFunderResponsePayload = {
  email: string;
  status: SuccessOrError;
};
export type InviteFundingEntityFunderRequestPayload = {
  email: string;
};
export type PublishedProjectPayload = {
  dealName?: string;
  projectId: number;
};
export type GetPublishedProjectResponsePayload = {
  projects: PublishedProjectPayload[];
  status: SuccessOrError;
};
export type MetricProgressPayload = {
  metric:
    | "Seeds Collected"
    | "Seedlings"
    | "Trees Planted"
    | "Species Planted"
    | "Mortality Rate"
    | "Hectares Planted"
    | "Survival Rate";
  progress: number;
};
export type FunderProjectDetailsPayload = {
  accumulationRate?: number;
  annualCarbon?: number;
  carbonCertifications: "CCB Standard"[];
  confirmedReforestableLand?: number;
  countryAlpha3?: string;
  countryCode?: string;
  dealDescription?: string;
  dealName?: string;
  landUseModelHectares: {
    [key: string]: number;
  };
  landUseModelTypes: (
    | "Native Forest"
    | "Monoculture"
    | "Sustainable Timber"
    | "Other Timber"
    | "Mangroves"
    | "Agroforestry"
    | "Silvopasture"
    | "Other Land-Use Model"
  )[];
  methodologyNumber?: string;
  metricProgress: MetricProgressPayload[];
  minProjectArea?: number;
  numNativeSpecies?: number;
  perHectareBudget?: number;
  projectArea?: number;
  projectHighlightPhotoValueId?: number;
  projectId: number;
  projectZoneFigureValueId?: number;
  sdgList: (
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
  )[];
  standard?: string;
  totalExpansionPotential?: number;
  totalVCU?: number;
  verraLink?: string;
};
export type GetFundingProjectResponsePayload = {
  details?: FunderProjectDetailsPayload;
  projects: FunderProjectDetailsPayload[];
  status: SuccessOrError;
};
export type PublishProjectProfileRequestPayload = {
  details: FunderProjectDetailsPayload;
};
export type ReportChallengePayload = {
  challenge: string;
  mitigationPlan: string;
};
export type ReportPhotoPayload = {
  caption?: string;
  fileId: number;
};
export type PublishedReportMetricPayload = {
  component: "Project Objectives" | "Climate" | "Community" | "Biodiversity";
  description?: string;
  name: string;
  progressNotes?: string;
  projectsComments?: string;
  reference: string;
  status?: "Achieved" | "On-Track" | "Unlikely";
  target?: number;
  type: "Activity" | "Output" | "Outcome" | "Impact";
  unit?: string;
  value?: number;
};
export type PublishedReportPayload = {
  achievements: string[];
  additionalComments?: string;
  challenges: ReportChallengePayload[];
  endDate: string;
  financialSummaries?: string;
  frequency: "Quarterly" | "Annual";
  highlights?: string;
  photos: ReportPhotoPayload[];
  projectId: number;
  projectMetrics: PublishedReportMetricPayload[];
  projectName: string;
  publishedBy: number;
  publishedTime: string;
  quarter?: "Q1" | "Q2" | "Q3" | "Q4";
  reportId: number;
  standardMetrics: PublishedReportMetricPayload[];
  startDate: string;
  systemMetrics: PublishedReportMetricPayload[];
};
export type ListPublishedReportsResponsePayload = {
  reports: PublishedReportPayload[];
  status: SuccessOrError;
};
export const {
  useFunderListActivitiesQuery,
  useGetActivityMedia1Query,
  useGetActivityMediaStreamQuery,
  useListFundingEntitiesQuery,
  useCreateFundingEntityMutation,
  useGetProjectFundingEntitiesQuery,
  useGetFundingEntity1Query,
  useDeleteFundingEntityMutation,
  useGetFundingEntityQuery,
  useUpdateFundingEntityMutation,
  useRemoveFunderMutation,
  useGetFundersQuery,
  useInviteFunderMutation,
  useGetAllProjectsQuery,
  useGetProjectsQuery,
  usePublishProjectProfileMutation,
  useListPublishedReportsQuery,
  useGetPublishedReportPhotoQuery,
} = injectedRtkApi;
