import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listApplications: build.query<ListApplicationsApiResponse, ListApplicationsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/applications`,
        params: {
          organizationId: queryArg.organizationId,
          projectId: queryArg.projectId,
          listAll: queryArg.listAll,
        },
      }),
    }),
    createApplication: build.mutation<CreateApplicationApiResponse, CreateApplicationApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/applications`, method: 'POST', body: queryArg }),
    }),
    getApplication: build.query<GetApplicationApiResponse, GetApplicationApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/applications/${queryArg}` }),
    }),
    uploadApplicationBoundary: build.mutation<UploadApplicationBoundaryApiResponse, UploadApplicationBoundaryApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/applications/${queryArg.applicationId}/boundary`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    updateApplicationBoundary: build.mutation<UpdateApplicationBoundaryApiResponse, UpdateApplicationBoundaryApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/applications/${queryArg.applicationId}/boundary`,
        method: 'PUT',
        body: queryArg.updateApplicationBoundaryRequestPayload,
      }),
    }),
    getApplicationDeliverables: build.query<GetApplicationDeliverablesApiResponse, GetApplicationDeliverablesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/applications/${queryArg}/deliverables` }),
    }),
    getApplicationGeoJson: build.query<GetApplicationGeoJsonApiResponse, GetApplicationGeoJsonApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/applications/${queryArg}/export` }),
    }),
    getApplicationHistory: build.query<GetApplicationHistoryApiResponse, GetApplicationHistoryApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/applications/${queryArg}/history` }),
    }),
    getApplicationModules: build.query<GetApplicationModulesApiResponse, GetApplicationModulesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/applications/${queryArg}/modules` }),
    }),
    getApplicationModuleDeliverables: build.query<
      GetApplicationModuleDeliverablesApiResponse,
      GetApplicationModuleDeliverablesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/applications/${queryArg.applicationId}/modules/${queryArg.moduleId}/deliverables`,
      }),
    }),
    restartApplication: build.mutation<RestartApplicationApiResponse, RestartApplicationApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/applications/${queryArg}/restart`, method: 'POST' }),
    }),
    reviewApplication: build.mutation<ReviewApplicationApiResponse, ReviewApplicationApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/applications/${queryArg.applicationId}/review`,
        method: 'POST',
        body: queryArg.reviewApplicationRequestPayload,
      }),
    }),
    submitApplication: build.mutation<SubmitApplicationApiResponse, SubmitApplicationApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/applications/${queryArg}/submit`, method: 'POST' }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListApplicationsApiResponse = /** status 200 OK */ ListApplicationsResponsePayload;
export type ListApplicationsApiArg = {
  /** If present, only list applications for this organization. */
  organizationId?: number;
  /** If present, only list applications for this project. A project can only have one application, so this will either return an empty result or a result with a single element. */
  projectId?: number;
  /** If true, list all applications for all projects. Only allowed for internal users. */
  listAll?: boolean;
};
export type CreateApplicationApiResponse = /** status 200 OK */ CreateApplicationResponsePayload;
export type CreateApplicationApiArg = CreateApplicationRequestPayload;
export type GetApplicationApiResponse = /** status 200 OK */ GetApplicationResponsePayload;
export type GetApplicationApiArg = number;
export type UploadApplicationBoundaryApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UploadApplicationBoundaryApiArg = {
  applicationId: number;
  body: {
    file: Blob;
  };
};
export type UpdateApplicationBoundaryApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateApplicationBoundaryApiArg = {
  applicationId: number;
  updateApplicationBoundaryRequestPayload: UpdateApplicationBoundaryRequestPayload;
};
export type GetApplicationDeliverablesApiResponse = /** status 200 OK */ GetApplicationDeliverablesResponsePayload;
export type GetApplicationDeliverablesApiArg = number;
export type GetApplicationGeoJsonApiResponse = /** status 200 OK */ Blob;
export type GetApplicationGeoJsonApiArg = number;
export type GetApplicationHistoryApiResponse = /** status 200 OK */ GetApplicationHistoryResponsePayload;
export type GetApplicationHistoryApiArg = number;
export type GetApplicationModulesApiResponse = /** status 200 OK */ GetApplicationModulesResponsePayload;
export type GetApplicationModulesApiArg = number;
export type GetApplicationModuleDeliverablesApiResponse =
  /** status 200 OK */ GetApplicationDeliverablesResponsePayload;
export type GetApplicationModuleDeliverablesApiArg = {
  applicationId: number;
  moduleId: number;
};
export type RestartApplicationApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type RestartApplicationApiArg = number;
export type ReviewApplicationApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type ReviewApplicationApiArg = {
  applicationId: number;
  reviewApplicationRequestPayload: ReviewApplicationRequestPayload;
};
export type SubmitApplicationApiResponse = /** status 200 OK */ SubmitApplicationResponsePayload;
export type SubmitApplicationApiArg = number;
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
export type ApplicationPayload = {
  boundary?: MultiPolygon;
  countryCode?: string;
  createdTime: string;
  feedback?: string;
  id: number;
  /** Internal-only comment, if any. Only set if the current user is an internal user. */
  internalComment?: string;
  /** Internal-only reference name of application. Only set if the current user is an internal user. */
  internalName?: string;
  modifiedTime?: string;
  organizationId: number;
  organizationName: string;
  projectId: number;
  projectName: string;
  status:
    | 'Accepted'
    | 'Carbon Assessment'
    | 'Expert Review'
    | 'Failed Pre-screen'
    | 'Issue Active'
    | 'Issue Reassessment'
    | 'Not Eligible'
    | 'Not Submitted'
    | 'P0 Eligible'
    | 'Passed Pre-screen'
    | 'Sourcing Team Review'
    | 'GIS Assessment'
    | 'Submitted'
    | 'In Review'
    | 'Waitlist';
};
export type SuccessOrError = 'ok' | 'error';
export type ListApplicationsResponsePayload = {
  applications: ApplicationPayload[];
  status: SuccessOrError;
};
export type CreateApplicationResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type CreateApplicationRequestPayload = {
  projectId: number;
};
export type GetApplicationResponsePayload = {
  application: ApplicationPayload;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type Polygon = {
  type: 'Polygon';
} & GeometryBase & {
    coordinates: number[][][];
    type: 'Polygon';
  };
export type UpdateApplicationBoundaryRequestPayload = {
  boundary: MultiPolygon | Polygon;
};
export type SubmissionDocumentPayload = {
  createdTime: string;
  description?: string;
  documentStore: 'Dropbox' | 'Google' | 'External';
  id: number;
  name: string;
  originalName?: string;
};
export type ApplicationDeliverablePayload = {
  category:
    | 'Compliance'
    | 'Financial Viability'
    | 'GIS'
    | 'Carbon Eligibility'
    | 'Stakeholders and Community Impact'
    | 'Proposed Restoration Activities'
    | 'Verra Non-Permanence Risk Tool (NPRT)'
    | 'Supplemental Files';
  /** Optional description of the deliverable in HTML form. */
  descriptionHtml?: string;
  documents: SubmissionDocumentPayload[];
  id: number;
  internalComment?: string;
  modifiedTime?: string;
  moduleId: number;
  moduleName: string;
  name: string;
  organizationId: number;
  organizationName: string;
  position: number;
  projectDealName?: string;
  projectId: number;
  projectName: string;
  required: boolean;
  sensitive: boolean;
  status: 'Not Submitted' | 'In Review' | 'Needs Translation' | 'Approved' | 'Rejected' | 'Not Needed' | 'Completed';
  type: 'Document' | 'Species' | 'Questions';
};
export type GetApplicationDeliverablesResponsePayload = {
  deliverables: ApplicationDeliverablePayload[];
  status: SuccessOrError;
};
export type ApplicationHistoryPayload = {
  feedback?: string;
  /** Internal-only comment, if any. Only set if the current user is an internal user. */
  internalComment?: string;
  modifiedTime: string;
  status:
    | 'Accepted'
    | 'Carbon Assessment'
    | 'Expert Review'
    | 'Failed Pre-screen'
    | 'Issue Active'
    | 'Issue Reassessment'
    | 'Not Eligible'
    | 'Not Submitted'
    | 'P0 Eligible'
    | 'Passed Pre-screen'
    | 'Sourcing Team Review'
    | 'GIS Assessment'
    | 'Submitted'
    | 'In Review'
    | 'Waitlist';
};
export type GetApplicationHistoryResponsePayload = {
  /** History of metadata changes in reverse chronological order. */
  history: ApplicationHistoryPayload[];
  status: SuccessOrError;
};
export type ApplicationModulePayload = {
  applicationId?: number;
  moduleId: number;
  name: string;
  overview?: string;
  phase:
    | 'Phase 0 - Due Diligence'
    | 'Phase 1 - Feasibility Study'
    | 'Phase 2 - Plan and Scale'
    | 'Phase 3 - Implement and Monitor'
    | 'Pre-Screen'
    | 'Application';
  status?: 'Incomplete' | 'Complete';
};
export type GetApplicationModulesResponsePayload = {
  modules: ApplicationModulePayload[];
  status: SuccessOrError;
};
export type ReviewApplicationRequestPayload = {
  feedback?: string;
  internalComment?: string;
  status:
    | 'Not Submitted'
    | 'Failed Pre-screen'
    | 'Passed Pre-screen'
    | 'Submitted'
    | 'Sourcing Team Review'
    | 'GIS Assessment'
    | 'Expert Review'
    | 'Carbon Assessment'
    | 'P0 Eligible'
    | 'Accepted'
    | 'Issue Active'
    | 'Issue Reassessment'
    | 'Not Eligible';
};
export type SubmitApplicationResponsePayload = {
  application: ApplicationPayload;
  /** If the application failed any of the pre-screening checks, a list of the reasons why. Empty if the application passed pre-screening. */
  problems: string[];
  status: SuccessOrError;
};
export const {
  useListApplicationsQuery,
  useLazyListApplicationsQuery,
  useCreateApplicationMutation,
  useGetApplicationQuery,
  useLazyGetApplicationQuery,
  useUploadApplicationBoundaryMutation,
  useUpdateApplicationBoundaryMutation,
  useGetApplicationDeliverablesQuery,
  useLazyGetApplicationDeliverablesQuery,
  useGetApplicationGeoJsonQuery,
  useLazyGetApplicationGeoJsonQuery,
  useGetApplicationHistoryQuery,
  useLazyGetApplicationHistoryQuery,
  useGetApplicationModulesQuery,
  useLazyGetApplicationModulesQuery,
  useGetApplicationModuleDeliverablesQuery,
  useLazyGetApplicationModuleDeliverablesQuery,
  useRestartApplicationMutation,
  useReviewApplicationMutation,
  useSubmitApplicationMutation,
} = injectedRtkApi;
