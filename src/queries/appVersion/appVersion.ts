import { baseApi as api } from '../baseApi';

export type GetAppVersionApiResponse = string;
export type GetAppVersionApiArg = void;

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAppVersion: build.query<GetAppVersionApiResponse, GetAppVersionApiArg>({
      query: () => ({
        // Static build artifact served outside the API, so it is not part of the OpenAPI schema
        // and cannot be code-generated. `no-cache` forces revalidation on every poll.
        url: '/build-version.txt',
        responseHandler: 'text',
        cache: 'no-cache',
      }),
      // Never expire; polling subscribers drive refetches to detect a new build.
      keepUnusedDataFor: Infinity,
    }),
  }),
});

export { injectedRtkApi as api };

export const { useGetAppVersionQuery, useLazyGetAppVersionQuery } = injectedRtkApi;
