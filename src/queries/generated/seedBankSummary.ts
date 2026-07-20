import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSeedBankSummary: build.query<GetSeedBankSummaryApiResponse, GetSeedBankSummaryApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/seedbank/summary`,
        params: {
          organizationId: queryArg.organizationId,
          facilityId: queryArg.facilityId,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetSeedBankSummaryApiResponse = /** status 200 OK */ SummaryResponsePayload;
export type GetSeedBankSummaryApiArg = {
  /** If set, return summary on all seedbanks for that organization. */
  organizationId?: number;
  /** If set, return summary on that specific seedbank. */
  facilityId?: number;
};
export type SeedCountSummaryPayload = {
  /** Total number of seeds remaining in accessions whose quantities are measured in seeds. */
  subtotalBySeedCount: number;
  /** Estimated total number of seeds remaining in accessions whose quantities are measured by weight. This estimate is based on the subset weight and count. Accessions measured by weight that don't have subset weights and counts are not included in this estimate. */
  subtotalByWeightEstimate: number;
  /** Total number of seeds remaining. The sum of subtotalBySeedCount and subtotalByWeightEstimate. */
  total: number;
  /** Number of accessions that are measured by weight and don't have subset weight and count data. The system cannot estimate how many seeds they have. */
  unknownQuantityAccessions: number;
};
export type SuccessOrError = 'ok' | 'error';
export type SummaryResponsePayload = {
  /** Number of accessions in each state. */
  accessionsByState: {
    [key: string]: number;
  };
  activeAccessions: number;
  /** Summary of the number of seeds remaining across all active accessions. */
  seedsRemaining: SeedCountSummaryPayload;
  species: number;
  status: SuccessOrError;
};
export const { useGetSeedBankSummaryQuery, useLazyGetSeedBankSummaryQuery } = injectedRtkApi;
