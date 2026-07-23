import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCurrentTime: build.query<GetCurrentTimeApiResponse, GetCurrentTimeApiArg>({
      query: () => ({ url: `/api/v1/seedbank/clock` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetCurrentTimeApiResponse = /** status 200 OK */ GetCurrentTimeResponsePayload;
export type GetCurrentTimeApiArg = void;
export type SuccessOrError = 'ok' | 'error';
export type GetCurrentTimeResponsePayload = {
  currentTime: string;
  status: SuccessOrError;
};
export const { useGetCurrentTimeQuery, useLazyGetCurrentTimeQuery } = injectedRtkApi;
