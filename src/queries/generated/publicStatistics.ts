import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPublicStatistics: build.query<GetPublicStatisticsApiResponse, GetPublicStatisticsApiArg>({
      query: () => ({ url: `/api/v1/public/statistics` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetPublicStatisticsApiResponse =
  /** status 200 The requested operation succeeded. */ GetPublicStatisticsResponsePayload;
export type GetPublicStatisticsApiArg = void;
export type PublicStatisticsPayload = {
  totalAreaUnderRestorationHa: number;
  totalCountries: number;
  totalOrganizations: number;
  totalPlantings: number;
  totalSeedlingsInNurseries: number;
  totalSeedsInStorage: number;
};
export type SuccessOrError = 'ok' | 'error';
export type GetPublicStatisticsResponsePayload = {
  statistics: PublicStatisticsPayload;
  status: SuccessOrError;
};
export const { useGetPublicStatisticsQuery, useLazyGetPublicStatisticsQuery } = injectedRtkApi;
