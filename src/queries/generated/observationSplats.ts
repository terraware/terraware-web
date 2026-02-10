import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listObservationSplats: build.query<ListObservationSplatsApiResponse, ListObservationSplatsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/splats`,
        params: {
          monitoringPlotId: queryArg.monitoringPlotId,
          fileId: queryArg.fileId,
        },
      }),
    }),
    generateObservationSplatFile: build.mutation<
      GenerateObservationSplatFileApiResponse,
      GenerateObservationSplatFileApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/splats`,
        method: 'POST',
        body: queryArg.generateSplatRequestPayload,
      }),
    }),
    getObservationSplatFile: build.query<GetObservationSplatFileApiResponse, GetObservationSplatFileApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/splats/${queryArg.fileId}`,
      }),
    }),
    listObservationSplatAnnotations: build.query<
      ListObservationSplatAnnotationsApiResponse,
      ListObservationSplatAnnotationsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/splats/${queryArg.fileId}/annotations`,
      }),
    }),
    setObservationSplatAnnotations: build.mutation<
      SetObservationSplatAnnotationsApiResponse,
      SetObservationSplatAnnotationsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/splats/${queryArg.fileId}/annotations`,
        method: 'POST',
        body: queryArg.setSplatAnnotationsRequestPayload,
      }),
    }),
    listSplatDetails: build.query<ListSplatDetailsApiResponse, ListSplatDetailsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/observations/${queryArg.observationId}/splats/${queryArg.fileId}/info`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListObservationSplatsApiResponse =
  /** status 200 The requested operation succeeded. */ ListObservationSplatsResponsePayload;
export type ListObservationSplatsApiArg = {
  observationId: number;
  /** If present, only list splats for this monitoring plot. */
  monitoringPlotId?: number;
  /** If present, only return information about the splat for this video file. */
  fileId?: number;
};
export type GenerateObservationSplatFileApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type GenerateObservationSplatFileApiArg = {
  observationId: number;
  generateSplatRequestPayload: GenerateSplatRequestPayload;
};
export type GetObservationSplatFileApiResponse = /** status 200 The requested operation succeeded. */
  | object
  | /** status 202 The video is still being processed and the model is not ready yet. */ object;
export type GetObservationSplatFileApiArg = {
  observationId: number;
  fileId: number;
};
export type ListObservationSplatAnnotationsApiResponse =
  /** status 200 The requested operation succeeded. */ ListObservationSplatAnnotationsResponsePayload;
export type ListObservationSplatAnnotationsApiArg = {
  observationId: number;
  fileId: number;
};
export type SetObservationSplatAnnotationsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type SetObservationSplatAnnotationsApiArg = {
  observationId: number;
  fileId: number;
  setSplatAnnotationsRequestPayload: SetSplatAnnotationsRequestPayload;
};
export type ListSplatDetailsApiResponse =
  /** status 200 The requested operation succeeded. */ GetObservationSplatInfoResponsePayload;
export type ListSplatDetailsApiArg = {
  observationId: number;
  fileId: number;
};
export type ObservationSplatPayload = {
  fileId: number;
  monitoringPlotId: number;
  status: 'Preparing' | 'Ready' | 'Errored';
};
export type SuccessOrError = 'ok' | 'error';
export type ListObservationSplatsResponsePayload = {
  splats: ObservationSplatPayload[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type GenerateSplatRequestPayload = {
  fileId: number;
};
export type CoordinatePayload = {
  x: number;
  y: number;
  z: number;
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
export type ListObservationSplatAnnotationsResponsePayload = {
  annotations: SplatAnnotationPayload[];
  status: SuccessOrError;
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
export type GetObservationSplatInfoResponsePayload = {
  annotations: SplatAnnotationPayload[];
  cameraPosition?: CoordinatePayload;
  originPosition?: CoordinatePayload;
  status: SuccessOrError;
};
export const {
  useListObservationSplatsQuery,
  useLazyListObservationSplatsQuery,
  useGenerateObservationSplatFileMutation,
  useGetObservationSplatFileQuery,
  useLazyGetObservationSplatFileQuery,
  useListObservationSplatAnnotationsQuery,
  useLazyListObservationSplatAnnotationsQuery,
  useSetObservationSplatAnnotationsMutation,
  useListSplatDetailsQuery,
  useLazyListSplatDetailsQuery,
} = injectedRtkApi;
