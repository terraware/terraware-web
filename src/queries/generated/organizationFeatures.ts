import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listOrganizationFeatures: build.query<ListOrganizationFeaturesApiResponse, ListOrganizationFeaturesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/organizations/${queryArg}/features` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListOrganizationFeaturesApiResponse = /** status 200 OK */ ListOrganizationFeaturesResponsePayload;
export type ListOrganizationFeaturesApiArg = number;
export type OrganizationFeaturePayload = {
  enabled: boolean;
  projectIds: number[];
};
export type SuccessOrError = 'ok' | 'error';
export type ListOrganizationFeaturesResponsePayload = {
  applications: OrganizationFeaturePayload;
  deliverables: OrganizationFeaturePayload;
  modules: OrganizationFeaturePayload;
  reports: OrganizationFeaturePayload;
  seedFundReports: OrganizationFeaturePayload;
  status: SuccessOrError;
};
export const { useListOrganizationFeaturesQuery, useLazyListOrganizationFeaturesQuery } = injectedRtkApi;
