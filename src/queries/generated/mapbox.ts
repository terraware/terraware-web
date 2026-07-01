import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMapboxToken: build.query<GetMapboxTokenApiResponse, GetMapboxTokenApiArg>({
      query: () => ({ url: `/api/v1/tracking/mapbox/token` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetMapboxTokenApiResponse =
  /** status 200 The requested operation succeeded. */ GetMapboxTokenResponsePayload;
export type GetMapboxTokenApiArg = void;
export type SuccessOrError = 'ok' | 'error';
export type GetMapboxTokenResponsePayload = {
  status: SuccessOrError;
  token: string;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export const { useGetMapboxTokenQuery, useLazyGetMapboxTokenQuery } = injectedRtkApi;
