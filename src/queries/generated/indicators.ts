import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listCommonDefinitions: build.query<ListCommonDefinitionsApiResponse, ListCommonDefinitionsApiArg>({
      query: () => ({ url: `/api/v1/indicators/common` }),
    }),
    createCommonDefinition: build.mutation<CreateCommonDefinitionApiResponse, CreateCommonDefinitionApiArg>({
      query: (queryArg) => ({ url: `/api/v1/indicators/common`, method: 'POST', body: queryArg }),
    }),
    listProjectAutoCalculatedIndicators: build.query<
      ListProjectAutoCalculatedIndicatorsApiResponse,
      ListProjectAutoCalculatedIndicatorsApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/indicators/projects/${queryArg}/autoCalculated` }),
    }),
    updateProjectAutoCalculatedIndicator: build.mutation<
      UpdateProjectAutoCalculatedIndicatorApiResponse,
      UpdateProjectAutoCalculatedIndicatorApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/indicators/projects/${queryArg.projectId}/autoCalculated/${queryArg.indicatorId}`,
        method: 'PUT',
        body: queryArg.updateProjectAutoCalculatedIndicatorRequestPayload,
      }),
    }),
    listProjectCommonIndicators: build.query<ListProjectCommonIndicatorsApiResponse, ListProjectCommonIndicatorsApiArg>(
      {
        query: (queryArg) => ({ url: `/api/v1/indicators/projects/${queryArg}/common` }),
      }
    ),
    updateProjectCommonIndicator: build.mutation<
      UpdateProjectCommonIndicatorApiResponse,
      UpdateProjectCommonIndicatorApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/indicators/projects/${queryArg.projectId}/common/${queryArg.indicatorId}`,
        method: 'PUT',
        body: queryArg.updateCommonIndicatorRequestPayload,
      }),
    }),
    listProjectSpecificIndicators: build.query<
      ListProjectSpecificIndicatorsApiResponse,
      ListProjectSpecificIndicatorsApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/indicators/projects/${queryArg}/project` }),
    }),
    createProjectSpecificIndicator: build.mutation<
      CreateProjectSpecificIndicatorApiResponse,
      CreateProjectSpecificIndicatorApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/indicators/projects/${queryArg.projectId}/project`,
        method: 'POST',
        body: queryArg.createProjectIndicatorRequestPayload,
      }),
    }),
    updateProjectSpecificIndicator: build.mutation<
      UpdateProjectSpecificIndicatorApiResponse,
      UpdateProjectSpecificIndicatorApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/indicators/projects/${queryArg.projectId}/project/${queryArg.indicatorId}`,
        method: 'PUT',
        body: queryArg.updateProjectIndicatorRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListCommonDefinitionsApiResponse =
  /** status 200 The requested operation succeeded. */ ListCommonIndicatorDefinitionsResponsePayload;
export type ListCommonDefinitionsApiArg = void;
export type CreateCommonDefinitionApiResponse =
  /** status 200 The requested operation succeeded. */ CreateCommonIndicatorDefinitionResponsePayload;
export type CreateCommonDefinitionApiArg = CreateCommonIndicatorDefinitionRequestPayload;
export type ListProjectAutoCalculatedIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ ListProjectAutoCalculatedIndicatorsResponsePayload;
export type ListProjectAutoCalculatedIndicatorsApiArg = number;
export type UpdateProjectAutoCalculatedIndicatorApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectAutoCalculatedIndicatorApiArg = {
  projectId: number;
  indicatorId:
    'Seeds Collected' | 'Seedlings' | 'Trees Planted' | 'Species Planted' | 'Hectares Planted' | 'Survival Rate';
  updateProjectAutoCalculatedIndicatorRequestPayload: UpdateProjectAutoCalculatedIndicatorRequestPayload;
};
export type ListProjectCommonIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ ListCommonIndicatorsResponsePayload;
export type ListProjectCommonIndicatorsApiArg = number;
export type UpdateProjectCommonIndicatorApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectCommonIndicatorApiArg = {
  projectId: number;
  indicatorId: number;
  updateCommonIndicatorRequestPayload: UpdateCommonIndicatorRequestPayload;
};
export type ListProjectSpecificIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ ListProjectIndicatorsResponsePayload;
export type ListProjectSpecificIndicatorsApiArg = number;
export type CreateProjectSpecificIndicatorApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type CreateProjectSpecificIndicatorApiArg = {
  projectId: number;
  createProjectIndicatorRequestPayload: CreateProjectIndicatorRequestPayload;
};
export type UpdateProjectSpecificIndicatorApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectSpecificIndicatorApiArg = {
  projectId: number;
  indicatorId: number;
  updateProjectIndicatorRequestPayload: UpdateProjectIndicatorRequestPayload;
};
export type CommonIndicatorDefinitionPayload = {
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId: 'Lifetime Cumulative' | 'Not Cumulative' | 'Yearly Cumulative';
  description?: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle' | 'Quarterly';
  id: number;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  precision: number;
  tfOwner?: string;
  unit?: string;
};
export type SuccessOrError = 'ok' | 'error';
export type ListCommonIndicatorDefinitionsResponsePayload = {
  indicators: CommonIndicatorDefinitionPayload[];
  status: SuccessOrError;
};
export type CreateCommonIndicatorDefinitionResponsePayload = {
  indicatorId: number;
  status: SuccessOrError;
};
export type NewCommonIndicatorDefinitionPayload = {
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId: 'Lifetime Cumulative' | 'Not Cumulative' | 'Yearly Cumulative';
  description?: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle' | 'Quarterly';
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  precision: number;
  tfOwner?: string;
  unit?: string;
};
export type CreateCommonIndicatorDefinitionRequestPayload = {
  indicator: NewCommonIndicatorDefinitionPayload;
};
export type ProjectAutoCalculatedIndicatorPayload = {
  active: boolean;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId: 'Lifetime Cumulative' | 'Not Cumulative' | 'Yearly Cumulative';
  description: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle' | 'Quarterly';
  indicator:
    'Seeds Collected' | 'Seedlings' | 'Trees Planted' | 'Species Planted' | 'Hectares Planted' | 'Survival Rate';
  isPublishable: boolean;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  notes?: string;
  precision: number;
  primaryDataSource?: string;
  refId?: string;
  tfOwner?: string;
  unit?: string;
};
export type ListProjectAutoCalculatedIndicatorsResponsePayload = {
  indicators: ProjectAutoCalculatedIndicatorPayload[];
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type ProjectAutoCalculatedIndicatorSettingsPayload = {
  active: boolean;
  isPublishable: boolean;
  notes?: string;
  refId?: string;
};
export type UpdateProjectAutoCalculatedIndicatorRequestPayload = {
  indicator: ProjectAutoCalculatedIndicatorSettingsPayload;
};
export type ExistingCommonIndicatorPayload = {
  active: boolean;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId: 'Lifetime Cumulative' | 'Not Cumulative' | 'Yearly Cumulative';
  description?: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle' | 'Quarterly';
  id: number;
  isPublishable: boolean;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  notes?: string;
  precision: number;
  primaryDataSource?: string;
  refId?: string;
  tfOwner?: string;
  unit?: string;
};
export type ListCommonIndicatorsResponsePayload = {
  indicators: ExistingCommonIndicatorPayload[];
  status: SuccessOrError;
};
export type UpdateCommonIndicatorRequestPayload = {
  indicator: ExistingCommonIndicatorPayload;
};
export type ExistingProjectIndicatorPayload = {
  active: boolean;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId: 'Lifetime Cumulative' | 'Not Cumulative' | 'Yearly Cumulative';
  description?: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle' | 'Quarterly';
  id: number;
  isPublishable: boolean;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  notes?: string;
  precision: number;
  primaryDataSource?: string;
  projectId: number;
  refId?: string;
  tfOwner?: string;
  unit?: string;
};
export type ListProjectIndicatorsResponsePayload = {
  indicators: ExistingProjectIndicatorPayload[];
  status: SuccessOrError;
};
export type NewIndicatorPayload = {
  active: boolean;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId: 'Lifetime Cumulative' | 'Not Cumulative' | 'Yearly Cumulative';
  description?: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle' | 'Quarterly';
  isPublishable: boolean;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  notes?: string;
  precision: number;
  primaryDataSource?: string;
  refId?: string;
  tfOwner?: string;
  unit?: string;
};
export type CreateProjectIndicatorRequestPayload = {
  indicator: NewIndicatorPayload;
};
export type UpdateProjectIndicatorRequestPayload = {
  indicator: ExistingProjectIndicatorPayload;
};
export const {
  useListCommonDefinitionsQuery,
  useLazyListCommonDefinitionsQuery,
  useCreateCommonDefinitionMutation,
  useListProjectAutoCalculatedIndicatorsQuery,
  useLazyListProjectAutoCalculatedIndicatorsQuery,
  useUpdateProjectAutoCalculatedIndicatorMutation,
  useListProjectCommonIndicatorsQuery,
  useLazyListProjectCommonIndicatorsQuery,
  useUpdateProjectCommonIndicatorMutation,
  useListProjectSpecificIndicatorsQuery,
  useLazyListProjectSpecificIndicatorsQuery,
  useCreateProjectSpecificIndicatorMutation,
  useUpdateProjectSpecificIndicatorMutation,
} = injectedRtkApi;
