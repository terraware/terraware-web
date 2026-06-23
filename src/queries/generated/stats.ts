import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAggregatedTrackingStats: build.query<GetAggregatedTrackingStatsApiResponse, GetAggregatedTrackingStatsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/stats`,
        params: {
          organizationId: queryArg.organizationId,
          projectId: queryArg.projectId,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetAggregatedTrackingStatsApiResponse = /** status 200 OK */ TrackingStatsResponsePayload;
export type GetAggregatedTrackingStatsApiArg = {
  /** Organization ID to summarize. Ignored if projectId is supplied. */
  organizationId?: number;
  projectId?: number;
};
export type SuccessOrError = 'ok' | 'error';
export type TrackingStatsResponsePayload = {
  status: SuccessOrError;
  /** Aggregate survival rate. Not present if there have been no observations of the specified planting sites. */
  survivalRate?: number;
};
export const { useGetAggregatedTrackingStatsQuery, useLazyGetAggregatedTrackingStatsQuery } = injectedRtkApi;
