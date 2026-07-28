import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNurserySummary: build.query<GetNurserySummaryApiResponse, GetNurserySummaryApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/facilities/${queryArg}/summary` }),
    }),
    getSpeciesSummary: build.query<GetSpeciesSummaryApiResponse, GetSpeciesSummaryApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/species/${queryArg}/summary` }),
    }),
    getOrganizationNurserySummary: build.query<
      GetOrganizationNurserySummaryApiResponse,
      GetOrganizationNurserySummaryApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/nursery/summary`,
        params: {
          organizationId: queryArg,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetNurserySummaryApiResponse = /** status 200 OK */ GetNurserySummaryResponsePayload;
export type GetNurserySummaryApiArg = number;
export type GetSpeciesSummaryApiResponse = /** status 200 OK */ GetSpeciesSummaryResponsePayload;
export type GetSpeciesSummaryApiArg = number;
export type GetOrganizationNurserySummaryApiResponse =
  /** status 200 OK */ GetOrganizationNurserySummaryResponsePayload;
export type GetOrganizationNurserySummaryApiArg = number;
export type SuccessOrError = 'ok' | 'error';
export type NurserySummarySpeciesPayload = {
  id: number;
  scientificName: string;
};
export type NurserySummaryPayload = {
  activeGrowthQuantity: number;
  germinatingQuantity: number;
  germinationRate?: number;
  hardeningOffQuantity: number;
  /** Percentage of current and past inventory that was withdrawn due to death. */
  lossRate?: number;
  notReadyQuantity: number;
  readyQuantity: number;
  /** Species currently present in the nursery. */
  species: NurserySummarySpeciesPayload[];
  /** Total number of plants that have been withdrawn due to death. */
  totalDead: number;
  /** Total number of germinated plants currently in inventory. */
  totalQuantity: number;
  /** Total number of plants that have been withdrawn in the past. */
  totalWithdrawn: number;
};
export type GetNurserySummaryResponsePayload = {
  status: SuccessOrError;
  summary: NurserySummaryPayload;
};
export type SpeciesSummaryNurseryPayload = {
  facilityId: number;
  name: string;
};
export type SpeciesSummaryPayload = {
  activeGrowthQuantity: number;
  germinatingQuantity: number;
  germinationRate?: number;
  hardeningOffQuantity: number;
  /** Percentage of current and past inventory that was withdrawn due to death. */
  lossRate?: number;
  notReadyQuantity: number;
  nurseries: SpeciesSummaryNurseryPayload[];
  readyQuantity: number;
  speciesId: number;
  /** Total number of germinated plants that have been withdrawn due to death. */
  totalDead: number;
  /** Total number of germinated plants currently in inventory. */
  totalQuantity: number;
  /** Total number of germinated plants that have been withdrawn in the past. */
  totalWithdrawn: number;
};
export type GetSpeciesSummaryResponsePayload = {
  status: SuccessOrError;
  summary: SpeciesSummaryPayload;
};
export type OrganizationNurserySummaryPayload = {
  activeGrowthQuantity: number;
  germinatingQuantity: number;
  germinationRate?: number;
  hardeningOffQuantity: number;
  /** Percentage of current and past inventory that was withdrawn due to death. */
  lossRate?: number;
  notReadyQuantity: number;
  readyQuantity: number;
  /** Total number of plants that have been withdrawn due to death. */
  totalDead: number;
  /** Total number of germinated plants currently in inventory. */
  totalQuantity: number;
  /** Total number of plants that have been withdrawn in the past. */
  totalWithdrawn: number;
};
export type GetOrganizationNurserySummaryResponsePayload = {
  status: SuccessOrError;
  summary: OrganizationNurserySummaryPayload;
};
export const {
  useGetNurserySummaryQuery,
  useLazyGetNurserySummaryQuery,
  useGetSpeciesSummaryQuery,
  useLazyGetSpeciesSummaryQuery,
  useGetOrganizationNurserySummaryQuery,
  useLazyGetOrganizationNurserySummaryQuery,
} = injectedRtkApi;
