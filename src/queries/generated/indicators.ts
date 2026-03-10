import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listProjectIndicators: build.query<ListProjectIndicatorsApiResponse, ListProjectIndicatorsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/indicators` }),
    }),
    createProjectIndicator: build.mutation<CreateProjectIndicatorApiResponse, CreateProjectIndicatorApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/indicators`,
        method: 'PUT',
        body: queryArg.createProjectIndicatorRequestPayload,
      }),
    }),
    updateProjectIndicator: build.mutation<UpdateProjectIndicatorApiResponse, UpdateProjectIndicatorApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/indicators/${queryArg.indicatorId}`,
        method: 'POST',
        body: queryArg.updateProjectIndicatorRequestPayload,
      }),
    }),
    listAutoCalculatedIndicators: build.query<
      ListAutoCalculatedIndicatorsApiResponse,
      ListAutoCalculatedIndicatorsApiArg
    >({
      query: () => ({ url: `/api/v1/accelerator/reports/autoCalculatedIndicators` }),
    }),
    listCommonIndicators: build.query<ListCommonIndicatorsApiResponse, ListCommonIndicatorsApiArg>({
      query: () => ({ url: `/api/v1/accelerator/reports/commonIndicators` }),
    }),
    createCommonIndicator: build.mutation<CreateCommonIndicatorApiResponse, CreateCommonIndicatorApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/reports/commonIndicators`, method: 'PUT', body: queryArg }),
    }),
    updateCommonIndicator: build.mutation<UpdateCommonIndicatorApiResponse, UpdateCommonIndicatorApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/reports/commonIndicators/${queryArg.indicatorId}`,
        method: 'POST',
        body: queryArg.updateCommonIndicatorRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListProjectIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ ListProjectIndicatorsResponsePayload;
export type ListProjectIndicatorsApiArg = number;
export type CreateProjectIndicatorApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type CreateProjectIndicatorApiArg = {
  projectId: number;
  createProjectIndicatorRequestPayload: CreateProjectIndicatorRequestPayload;
};
export type UpdateProjectIndicatorApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectIndicatorApiArg = {
  indicatorId: number;
  projectId: number;
  updateProjectIndicatorRequestPayload: UpdateProjectIndicatorRequestPayload;
};
export type ListAutoCalculatedIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ ListAutoCalculatedIndicatorsResponsePayload;
export type ListAutoCalculatedIndicatorsApiArg = void;
export type ListCommonIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ ListCommonIndicatorsResponsePayload;
export type ListCommonIndicatorsApiArg = void;
export type CreateCommonIndicatorApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type CreateCommonIndicatorApiArg = CreateCommonIndicatorRequestPayload;
export type UpdateCommonIndicatorApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateCommonIndicatorApiArg = {
  indicatorId: number;
  updateCommonIndicatorRequestPayload: UpdateCommonIndicatorRequestPayload;
};
export type ExistingProjectIndicatorPayload = {
  active: boolean;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId?: 'Cumulative' | 'Level';
  description?: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle' | 'Quarterly';
  id: number;
  isPublishable: boolean;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  notes?: string;
  primaryDataSource?: string;
  projectId: number;
  refId: string;
  tfOwner?: string;
  unit?: string;
};
export type SuccessOrError = 'ok' | 'error';
export type ListProjectIndicatorsResponsePayload = {
  indicators: ExistingProjectIndicatorPayload[];
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type NewIndicatorPayload = {
  active: boolean;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId?: 'Cumulative' | 'Level';
  description?: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle' | 'Quarterly';
  isPublishable: boolean;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  notes?: string;
  primaryDataSource?: string;
  refId: string;
  tfOwner?: string;
  unit?: string;
};
export type CreateProjectIndicatorRequestPayload = {
  indicator: NewIndicatorPayload;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type UpdateProjectIndicatorRequestPayload = {
  indicator: ExistingProjectIndicatorPayload;
};
export type AutoCalculatedIndicatorPayload = {
  active: boolean;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId?: 'Cumulative' | 'Level';
  description: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle' | 'Quarterly';
  indicator:
    | 'Seeds Collected'
    | 'Seedlings'
    | 'Trees Planted'
    | 'Species Planted'
    | 'Hectares Planted'
    | 'Survival Rate';
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  notes?: string;
  primaryDataSource?: string;
  refId: string;
  tfOwner?: string;
  unit?: string;
};
export type ListAutoCalculatedIndicatorsResponsePayload = {
  indicators: AutoCalculatedIndicatorPayload[];
  status: SuccessOrError;
};
export type ExistingCommonIndicatorPayload = {
  active: boolean;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId?: 'Cumulative' | 'Level';
  description?: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle' | 'Quarterly';
  id: number;
  isPublishable: boolean;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  notes?: string;
  primaryDataSource?: string;
  refId: string;
  tfOwner?: string;
  unit?: string;
};
export type ListCommonIndicatorsResponsePayload = {
  indicators: ExistingCommonIndicatorPayload[];
  status: SuccessOrError;
};
export type CreateCommonIndicatorRequestPayload = {
  indicator: NewIndicatorPayload;
};
export type UpdateCommonIndicatorRequestPayload = {
  indicator: ExistingCommonIndicatorPayload;
};
export const {
  useListProjectIndicatorsQuery,
  useLazyListProjectIndicatorsQuery,
  useCreateProjectIndicatorMutation,
  useUpdateProjectIndicatorMutation,
  useListAutoCalculatedIndicatorsQuery,
  useLazyListAutoCalculatedIndicatorsQuery,
  useListCommonIndicatorsQuery,
  useLazyListCommonIndicatorsQuery,
  useCreateCommonIndicatorMutation,
  useUpdateCommonIndicatorMutation,
} = injectedRtkApi;
