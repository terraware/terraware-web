import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listStandardMetric: build.query<ListStandardMetricApiResponse, ListStandardMetricApiArg>({
      query: () => ({ url: `/api/v1/accelerator/reports/standardMetrics` }),
    }),
    createStandardMetric: build.mutation<CreateStandardMetricApiResponse, CreateStandardMetricApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/reports/standardMetrics`, method: 'PUT', body: queryArg }),
    }),
    updateStandardMetric: build.mutation<UpdateStandardMetricApiResponse, UpdateStandardMetricApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/reports/standardMetrics/${queryArg.metricId}`,
        method: 'POST',
        body: queryArg.updateStandardMetricRequestPayload,
      }),
    }),
    listSystemMetrics: build.query<ListSystemMetricsApiResponse, ListSystemMetricsApiArg>({
      query: () => ({ url: `/api/v1/accelerator/reports/systemMetrics` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListStandardMetricApiResponse =
  /** status 200 The requested operation succeeded. */ ListStandardMetricsResponsePayload;
export type ListStandardMetricApiArg = void;
export type CreateStandardMetricApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type CreateStandardMetricApiArg = CreateStandardMetricRequestPayload;
export type UpdateStandardMetricApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateStandardMetricApiArg = {
  metricId: number;
  updateStandardMetricRequestPayload: UpdateStandardMetricRequestPayload;
};
export type ListSystemMetricsApiResponse =
  /** status 200 The requested operation succeeded. */ ListSystemMetricsResponsePayload;
export type ListSystemMetricsApiArg = void;
export type ExistingStandardMetricPayload = {
  component: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  id: number;
  isPublishable: boolean;
  name: string;
  reference: string;
  type: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  unit?: string;
};
export type SuccessOrError = 'ok' | 'error';
export type ListStandardMetricsResponsePayload = {
  metrics: ExistingStandardMetricPayload[];
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type NewMetricPayload = {
  component: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  isPublishable: boolean;
  name: string;
  reference: string;
  type: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  unit?: string;
};
export type CreateStandardMetricRequestPayload = {
  metric: NewMetricPayload;
};
export type UpdateStandardMetricRequestPayload = {
  metric: ExistingStandardMetricPayload;
};
export type SystemMetricPayload = {
  component: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description: string;
  metric: 'Seeds Collected' | 'Seedlings' | 'Trees Planted' | 'Species Planted' | 'Hectares Planted' | 'Survival Rate';
  name: string;
  reference: string;
  type: 'Activity' | 'Output' | 'Outcome' | 'Impact';
};
export type ListSystemMetricsResponsePayload = {
  metrics: SystemMetricPayload[];
  status: SuccessOrError;
};
export const {
  useListStandardMetricQuery,
  useLazyListStandardMetricQuery,
  useCreateStandardMetricMutation,
  useUpdateStandardMetricMutation,
  useListSystemMetricsQuery,
  useLazyListSystemMetricsQuery,
} = injectedRtkApi;
