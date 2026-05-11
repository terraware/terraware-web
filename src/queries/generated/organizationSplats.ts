import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    generateOrganizationSplat: build.mutation<GenerateOrganizationSplatApiResponse, GenerateOrganizationSplatApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/splats`,
        method: 'POST',
        body: queryArg.generateSplatRequestPayload,
      }),
    }),
    deleteOrganizationSplat: build.mutation<DeleteOrganizationSplatApiResponse, DeleteOrganizationSplatApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/splats/${queryArg.fileId}`,
        method: 'DELETE',
      }),
    }),
    getOrganizationSplatFile: build.query<GetOrganizationSplatFileApiResponse, GetOrganizationSplatFileApiArg>({
      query: (queryArg) => ({ url: `/api/v1/organizations/${queryArg.organizationId}/splats/${queryArg.fileId}` }),
    }),
    setOrganizationSplatAnnotations: build.mutation<
      SetOrganizationSplatAnnotationsApiResponse,
      SetOrganizationSplatAnnotationsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/splats/${queryArg.fileId}/annotations`,
        method: 'POST',
        body: queryArg.setSplatAnnotationsRequestPayload,
      }),
    }),
    getOrganizationSplatInfo: build.query<GetOrganizationSplatInfoApiResponse, GetOrganizationSplatInfoApiArg>({
      query: (queryArg) => ({ url: `/api/v1/organizations/${queryArg.organizationId}/splats/${queryArg.fileId}/info` }),
    }),
    setOrganizationSplatNeedsAttention: build.mutation<
      SetOrganizationSplatNeedsAttentionApiResponse,
      SetOrganizationSplatNeedsAttentionApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/splats/${queryArg.fileId}/needsAttention`,
        method: 'PUT',
        body: queryArg.setSplatNeedsAttentionRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GenerateOrganizationSplatApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type GenerateOrganizationSplatApiArg = {
  organizationId: number;
  generateSplatRequestPayload: GenerateSplatRequestPayload;
};
export type DeleteOrganizationSplatApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteOrganizationSplatApiArg = {
  organizationId: number;
  fileId: number;
};
export type GetOrganizationSplatFileApiResponse = /** status 200 The requested operation succeeded. */
  | object
  | /** status 202 The video is still being processed and the model is not ready yet. */ object;
export type GetOrganizationSplatFileApiArg = {
  organizationId: number;
  fileId: number;
};
export type SetOrganizationSplatAnnotationsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type SetOrganizationSplatAnnotationsApiArg = {
  organizationId: number;
  fileId: number;
  setSplatAnnotationsRequestPayload: SetSplatAnnotationsRequestPayload;
};
export type GetOrganizationSplatInfoApiResponse =
  /** status 200 The requested operation succeeded. */ GetObservationSplatInfoResponsePayload;
export type GetOrganizationSplatInfoApiArg = {
  organizationId: number;
  fileId: number;
};
export type SetOrganizationSplatNeedsAttentionApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type SetOrganizationSplatNeedsAttentionApiArg = {
  organizationId: number;
  fileId: number;
  setSplatNeedsAttentionRequestPayload: SetSplatNeedsAttentionRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
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
export type GenerateSplatRequestPayload = {
  fileId: number;
};
export type CoordinatePayload = {
  m?: number;
  x: number;
  y: number;
  z: number;
};
export type SetSplatAnnotationRequestPayload = {
  bodyText?: string;
  cameraPosition?: CoordinatePayload;
  id?: number;
  label?: string;
  position: CoordinatePayload;
  title: string;
};
export type SetSplatAnnotationsRequestPayload = {
  annotations: SetSplatAnnotationRequestPayload[];
};
export type SplatAnnotationPayload = {
  bodyText?: string;
  cameraPosition?: CoordinatePayload;
  fileId: number;
  id: number;
  label?: string;
  position: CoordinatePayload;
  title: string;
};
export type GetObservationSplatInfoResponsePayload = {
  annotations: SplatAnnotationPayload[];
  averageCameraHeight?: number;
  cameraPosition?: CoordinatePayload;
  groundColor?: string;
  groundPlane?: CoordinatePayload[];
  originPosition?: CoordinatePayload;
  sceneBounds?: CoordinatePayload;
  skyColor?: string;
  status: SuccessOrError;
};
export type SetSplatNeedsAttentionRequestPayload = {
  needsAttention: boolean;
};
export const {
  useGenerateOrganizationSplatMutation,
  useDeleteOrganizationSplatMutation,
  useGetOrganizationSplatFileQuery,
  useLazyGetOrganizationSplatFileQuery,
  useSetOrganizationSplatAnnotationsMutation,
  useGetOrganizationSplatInfoQuery,
  useLazyGetOrganizationSplatInfoQuery,
  useSetOrganizationSplatNeedsAttentionMutation,
} = injectedRtkApi;
